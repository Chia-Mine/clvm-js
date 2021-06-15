import {int, None, uint8} from "./__python_types__";
import {SExp} from "./SExp";
import {TToSexpF} from "./as_javascript";
import {CLVMObject, isAtom, isCons} from "./CLVMObject";
import {Bytes, Tuple2, t} from "./__type_compatibility__";
import {
  APPLY_COST,
  PATH_LOOKUP_BASE_COST,
  PATH_LOOKUP_COST_PER_LEG,
  PATH_LOOKUP_COST_PER_ZERO_BYTE,
  QUOTE_COST
} from "./costs";
import {EvalError} from "./EvalError";
import {TOperatorDict} from "./operators";

export type OpCallable = (opStack: OpStackType, valStack: ValStackType) => int;
export type ValStackType = SExp[];
export type OpStackType = OpCallable[];
export type TPreEvalF = (v1: SExp, v2: SExp) => unknown;

export function to_pre_eval_op(pre_eval_f: TPreEvalF, to_sexp_f: TToSexpF){
  return function my_pre_eval_op(op_stack: OpStackType, value_stack: ValStackType){
    const v = to_sexp_f(value_stack[value_stack.length-1]);
    const context = pre_eval_f(v.first(), v.rest());
    if(typeof context === "function"){
      const invoke_context_op = (op_stack: OpStackType, value_stack: ValStackType) => {
        context(to_sexp_f(value_stack[value_stack.length-1]));
        return 0;
      };
      
      op_stack.push(invoke_context_op);
    }
  };
}

export function msb_mask(byte: uint8){
  byte |= byte >> 1;
  byte |= byte >> 2;
  byte |= byte >> 4;
  return (byte + 1) >> 1;
}

export function run_program(
  program: SExp,
  args: CLVMObject,
  operator_lookup: TOperatorDict,
  max_cost: number|None = None,
  pre_eval_f: TPreEvalF|None = None,
): Tuple2<int, CLVMObject>{
  program = SExp.to(program);
  const pre_eval_op = pre_eval_f ? to_pre_eval_op(pre_eval_f, SExp.to) : None;
  
  function traverse_path(sexp: SExp, env: SExp): Tuple2<int, SExp> {
    let cost = PATH_LOOKUP_BASE_COST;
    cost += PATH_LOOKUP_COST_PER_LEG;
    if(sexp.nullp()){
      return t(cost, SExp.null());
    }
    
    const b = sexp.atom as Bytes;
    
    let end_byte_cursor = 0;
    while(end_byte_cursor < b.length && b.get_byte_at(end_byte_cursor) === 0){
      end_byte_cursor += 1;
    }
    
    cost += end_byte_cursor * PATH_LOOKUP_COST_PER_ZERO_BYTE;
    if(end_byte_cursor === b.length){
      return t(cost, SExp.null());
    }
  
    // # create a bitmask for the most significant *set* bit
    // # in the last non-zero byte
    const end_bitmask = msb_mask(b.get_byte_at(end_byte_cursor));
    
    let byte_cursor = b.length - 1;
    let bitmask = 0x01;
    while(byte_cursor > end_byte_cursor || bitmask < end_bitmask){
      if(!isCons(env)){
        throw new EvalError("path into atom", env);
      }
      if(b.get_byte_at(byte_cursor) & bitmask){
        env = env.rest();
      }
      else{
        env = env.first();
      }
      cost += PATH_LOOKUP_COST_PER_LEG;
      bitmask <<= 1;
      if(bitmask === 0x0100){
        byte_cursor -= 1;
        bitmask = 0x01;
      }
    }
    return t(cost, env);
  }
  
  function swap_op(op_stack: OpStackType, value_stack: ValStackType): int {
    const v2 = value_stack.pop() as SExp;
    const v1 = value_stack.pop() as SExp;
    value_stack.push(v2);
    value_stack.push(v1);
    return 0;
  }
  
  function cons_op (op_stack: OpStackType, value_stack: ValStackType): int {
    const v1 = value_stack.pop() as SExp;
    const v2 = value_stack.pop() as SExp;
    value_stack.push(v1.cons(v2));
    return 0;
  }
  
  function eval_op(op_stack: OpStackType, value_stack: ValStackType): int {
    if(pre_eval_op){
      pre_eval_op(op_stack, value_stack);
    }
    
    const pair = value_stack.pop() as SExp;
    const sexp = pair.first();
    const args = pair.rest();
    
    // # put a bunch of ops on op_stack
    if(!isCons(sexp)){
      // # sexp is an atom
      const [cost, r] = traverse_path(sexp, args).as_array() as [int, SExp];
      value_stack.push(r);
      return cost;
    }
    
    const operator = sexp.first();
    if(isCons(operator)){
      const pair = operator.as_pair() as Tuple2<SExp, SExp>;
      const [new_operator, must_be_nil] = pair.as_array();
      if(new_operator.pair || must_be_nil.atom !== Bytes.NULL){
        throw new EvalError("in ((X)...) syntax X must be lone atom", sexp);
      }
      const new_operand_list = sexp.rest();
      value_stack.push(new_operator);
      value_stack.push(new_operand_list);
      op_stack.push(apply_op);
      return APPLY_COST;
    }
    
    const op = operator.atom as Bytes;
    let operand_list = sexp.rest();
    // op === operator_lookup.quote_atom
    if(op.equal_to(operator_lookup.quote_atom)){
      value_stack.push(operand_list);
      return QUOTE_COST;
    }
    
    op_stack.push(apply_op);
    value_stack.push(operator);
    while(!operand_list.nullp()){
      const _ = operand_list.first();
      value_stack.push(_.cons(args));
      op_stack.push(cons_op);
      op_stack.push(eval_op);
      op_stack.push(swap_op);
      operand_list = operand_list.rest();
    }
    value_stack.push(SExp.null());
    return 1;
  }
  
  function apply_op(op_stack: OpStackType, value_stack: ValStackType): int {
    const operand_list = value_stack.pop() as SExp;
    const operator = value_stack.pop() as SExp;
    if(!isAtom(operator)){
      throw new EvalError("internal error", operator);
    }
    
    const op = operator.atom;
    // op === operator_lookup.apply_atom
    if(op.equal_to(operator_lookup.apply_atom)){
      if(operand_list.list_len() !== 2){
        throw new EvalError("apply requires exactly 2 parameters", operand_list);
      }
      const new_program = operand_list.first();
      const new_args = operand_list.rest().first();
      value_stack.push(new_program.cons(new_args));
      op_stack.push(eval_op);
      return APPLY_COST;
    }
    
    const [additional_cost, r] = operator_lookup(op, operand_list).as_array() as [int, CLVMObject];
    value_stack.push(r as SExp);
    return additional_cost;
  }
  
  const op_stack = [eval_op];
  const value_stack = [program.cons(args)];
  let cost = 0;
  
  while(op_stack.length){
    const f = op_stack.pop() as (typeof eval_op);
    cost += f(op_stack, value_stack);
    if(max_cost && cost > max_cost){
      throw new EvalError("cost exceeded", SExp.to(max_cost));
    }
  }
  return t(cost, value_stack[value_stack.length-1]);
}
