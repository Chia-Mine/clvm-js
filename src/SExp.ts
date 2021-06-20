import {G1Element} from "@chiamine/bls-signatures";
import {int, None, str} from "./__python_types__";
import {CLVMObject} from "./CLVMObject";
import {Bytes, isIterable, Tuple, t, Stream} from "./__type_compatibility__";
import {int_from_bytes, int_to_bytes} from "./casts";
import {sexp_to_stream} from "./serialize";
import {as_javascript} from "./as_javascript";
import {EvalError} from "./EvalError";

export type CastableType = SExp | CLVMObject | Bytes | str | int | None | G1Element | unknown[] | Tuple<any, any>;

export function looks_like_clvm_object(o: any): o is CLVMObject {
  if(!o || typeof o !== "object"){
    return false;
  }
  
  return Boolean("atom" in o && "pair" in o);
}

// this function recognizes some common types and turns them into plain bytes
export function convert_atom_to_bytes(v: any): Bytes {
  if(v instanceof Bytes){
    return v;
  }
  else if(typeof v === "string"){
    return Bytes.from(v, "utf8");
  }
  else if(typeof v === "number"){
    return int_to_bytes(v);
  }
  else if(v === None || !v){
    return Bytes.NULL;
  }
  else if(isIterable(v)){
    if(v.length > 0){
      throw new Error(`can't cast ${JSON.stringify(v)} to bytes`);
    }
    return Bytes.NULL
  }
  else if(typeof v.serialize === "function"){
    return Bytes.from(v, "G1Element");
  }
  
  throw new Error(`can't cast ${JSON.stringify(v)} to bytes`);
}

const op_convert = 0;
const op_set_left = 1;
const op_set_right = 2;
const op_prepend_list = 3;
type operations = typeof op_convert | typeof op_set_left | typeof op_set_right | typeof op_prepend_list;
type op_target = number | None;
type op_and_target = Tuple<operations, op_target>;

function is_valid_stack_target(s: any): s is CLVMObject {
  if(!s){
    throw new Error(`stack[target] is empty: ${JSON.stringify(s)}`);
  }
  else if(!looks_like_clvm_object(s)){
    throw new Error(`Unexpected stack[target] value: ${JSON.stringify(s)}`);
  }
  return true;
}

function is_valid_stack_target_pair(s: any): s is Tuple<unknown, unknown> {
  if(!(s.pair instanceof Tuple)){
    throw new Error(`Unexpected value of stack[target].pair: ${JSON.stringify(s.pair)}`);
  }
  return true;
}

export function to_sexp_type(value: CastableType): CLVMObject {
  let v: CastableType|undefined = value;
  const stack = [v];
  
  const ops: op_and_target[] = [t(0, None)];
  
  while(ops.length){
    const item = (ops.pop() as op_and_target);
    const op = item[0];
    let targetIndex = item[1];
    
    // convert value
    if(op === op_convert){
      if(looks_like_clvm_object(stack[stack.length-1])){
        continue;
      }
      
      v = stack.pop();
      if(v instanceof Tuple){
        const [left, right] = v;
        stack.push(new CLVMObject(t(left, right)));
        targetIndex = stack.length - 1;
        
        if(!looks_like_clvm_object(right)){
          stack.push(right);
          ops.push(t(2, targetIndex)); // set right
          ops.push(t(0, None)); // convert
        }
        
        if(!looks_like_clvm_object(left)){
          stack.push(left);
          ops.push(t(1, targetIndex));
          ops.push(t(0, None));
        }
      }
      else if(isIterable(v)){
        if(v.length < 1){
          stack.push(new CLVMObject(Bytes.NULL));
          continue;
        }
        
        stack.push(new CLVMObject(Bytes.NULL));
        targetIndex = stack.length - 1;
        
        for(const _ of v){
          stack.push(_ as CLVMObject);
          ops.push(t(3, targetIndex)); // prepend list
          // we only need to convert if it's not already the right type
          if(!looks_like_clvm_object(_)){
            ops.push(t(0, None)); // convert
          }
        }
      }
      else{
        stack.push(new CLVMObject(convert_atom_to_bytes(v)));
      }
      continue;
    }
  
    if(targetIndex === null){
      throw new Error("Invalid target. target is null");
    }
    
    if (op === op_set_left){ // set left
      const stack_target = stack[targetIndex];
      if(is_valid_stack_target(stack_target) && is_valid_stack_target_pair(stack_target.pair)){
        (stack[targetIndex] as CLVMObject).pair = t(new CLVMObject(stack.pop()), stack_target.pair[1]);
      }
    }
    else if(op === op_set_right){ // set right
      const stack_target = stack[targetIndex];
      if(is_valid_stack_target(stack_target) && is_valid_stack_target_pair(stack_target.pair)){
        (stack[targetIndex] as CLVMObject).pair = t(stack_target.pair[0], new CLVMObject(stack.pop()));
      }
    }
    else if(op === op_prepend_list){ // prepend list
      const stack_target = stack[targetIndex];
      if(is_valid_stack_target(stack_target)){
        stack[targetIndex] = new CLVMObject(t(stack.pop(), stack_target));
      }
    }
  }
  
  // there's exactly one item left at this point
  if(stack.length !== 1){
    throw new Error("internal error");
  }
  
  // stack[0] implements the clvm object protocol and can be wrapped by an SExp
  return stack[0] as CLVMObject;
}

/*
 SExp provides higher level API on top of any object implementing the CLVM
 object protocol.
 The tree of values is not a tree of SExp objects, it's a tree of CLVMObject
 like objects. SExp simply wraps them to privide a uniform view of any
 underlying conforming tree structure.
 
 The CLVM object protocol (concept) exposes two attributes:
 1. "atom" which is either None or bytes
 2. "pair" which is either None or a tuple of exactly two elements. Both
 elements implementing the CLVM object protocol.
 Exactly one of "atom" and "pair" must be None.
 */
export class SExp extends CLVMObject {
  static readonly TRUE: SExp = new SExp(new CLVMObject(Bytes.NULL));
  static readonly FALSE: SExp = new SExp(new CLVMObject(Bytes.from("0x01", "hex")));
  static readonly __NULL__: SExp = new SExp(new CLVMObject(Bytes.NULL));
  
  static to(v: CastableType): SExp {
    if(v instanceof SExp){
      return v;
    }
    
    if(looks_like_clvm_object(v)){
      return new SExp(v);
    }
    
    // this will lazily convert elements
    return new SExp(to_sexp_type(v));
  }
  
  static null(){
    return SExp.__NULL__;
  }
  
  public constructor(v: CLVMObject) {
    super(v);
    
    this.atom = v.atom;
    this.pair = v.pair;
  }
  
  public as_pair(): Tuple<SExp, SExp>|None {
    const pair = this.pair;
    if(pair === None){
      return pair;
    }
    return t(new SExp(pair[0]), new SExp(pair[1]));
  }
  
  public listp(){
    return this.pair !== None;
  }
  
  public nullp(){
    return this.atom !== None && this.atom.raw().length === 0;
  }
  
  public as_int(){
    return int_from_bytes(this.atom);
  }
  
  public as_bin(){
    const f = new Stream();
    sexp_to_stream(this, f);
    return f.getValue();
  }
  
  public cons(right: any){
    return SExp.to(t(this, right));
  }
  
  public first(){
    const pair = this.pair;
    if(pair){
      return new SExp(pair[0]);
    }
    throw new EvalError("first of non-cons", this);
  }
  
  public rest(){
    const pair = this.pair;
    if(pair){
      return new SExp(pair[1]);
    }
    throw new EvalError("rest of non-cons", this);
  }
  
  public *as_iter(){
    let v: SExp = this;
    while(!v.nullp()){
      yield v.first();
      v = v.rest();
    }
  }
  
  public equal_to(other: CastableType){
    try{
      other = SExp.to(other);
      const to_compare_stack = [t(this, other)] as Array<Tuple<SExp, SExp>>;
      while(to_compare_stack.length){
        const [s1, s2] = (to_compare_stack.pop() as Tuple<SExp, SExp>);
        const p1 = s1.as_pair();
        if(p1){
          const p2 = s2.as_pair();
          if(p2){
            to_compare_stack.push(t(p1[0], p2[0]));
            to_compare_stack.push(t(p1[1], p2[1]));
          }
          else{
            return false;
          }
        }
        else if(s2.as_pair() || !(s1.atom && s2.atom && s1.atom.equal_to(s2.atom))){
          return false;
        }
      }
      return true;
    }
    catch(e){
      return false;
    }
  }
  
  public list_len(){
    let v: SExp = this;
    let size = 0;
    while(v.listp()){
      size += 1;
      v = v.rest();
    }
    return size;
  }
  
  public as_javascript(){
    return as_javascript(this);
  }
  
  public toString(){
    return this.as_bin().toString();
  }
  
  public __repl__(){
    return `SExp(0x${this.as_bin().toString()})`;
  }
}
