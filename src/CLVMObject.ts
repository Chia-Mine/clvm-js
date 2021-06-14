import {None, Optional} from "./__python_types__";
import {Bytes, Tuple2} from "./__type_compatibility__";
import {EvalError} from "./EvalError";

export type CLVMType = {
  atom: Optional<Bytes>;
  pair: Optional<Tuple2<any, any>>;
};
export type Atom = {
  atom: Bytes;
  pair: None;
};
export type Cons = {
  atom: None;
  pair: Tuple2<any, any>;
};

/*
  This class implements the CLVM Object protocol in the simplest possible way,
  by just having an "atom" and a "pair" field
 */
export class CLVMObject implements CLVMType {
  atom: Optional<Bytes> = None;
  // this is always a 2-tuple of an object implementing the CLVM object protocol.
  pair: Optional<Tuple2<any, any>> = None;
  
  public constructor(v: any) {
    if(v instanceof CLVMObject){
      this.atom = v.atom;
      this.pair = v.pair;
    }
    else if(v instanceof Tuple2){
      this.pair = v;
      this.atom = None;
    }
    else{
      this.atom = v;
      this.pair = None;
    }
  }
}

export function isAtom(obj: CLVMType): obj is Atom {
  if((obj.atom && obj.pair) || (!obj.atom && !obj.pair)){
    throw new EvalError("Invalid clvm", obj);
  }
  
  return Boolean(obj.atom && !obj.pair);
}

export function isCons(obj: CLVMType): obj is Cons {
  if((obj.atom && obj.pair) || (!obj.atom && !obj.pair)){
    throw new EvalError("Invalid clvm", obj);
  }
  
  return Boolean((!obj.atom && obj.pair));
}
