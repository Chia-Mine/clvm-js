import {None, Optional} from "./__python_types__";
import {Bytes, isTuple, Tuple} from "./__type_compatibility__";
import {EvalError} from "./EvalError";

export type CLVMType = {
  atom: Optional<Bytes>;
  pair: Optional<Tuple<any, any>>;
};
export type Atom = {
  atom: Bytes;
  pair: None;
};
export type Cons = {
  atom: None;
  pair: Tuple<any, any>;
};

/*
  This class implements the CLVM Object protocol in the simplest possible way,
  by just having an "atom" and a "pair" field
 */
export class CLVMObject implements CLVMType {
  private readonly _atom: Optional<Bytes> = None;
  private readonly _pair: Optional<Tuple<any, any>> = None;
  
  get atom(){
    return this._atom;
  }
  get pair(){
    return this._pair;
  }
  
  public constructor(v: any) {
    if(isCLVMObject(v)){
      this._atom = v.atom;
      this._pair = v.pair;
    }
    else if(isTuple(v)){
      this._pair = v;
      this._atom = None;
    }
    else{
      this._atom = v;
      this._pair = None;
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

export function isCLVMObject(v: any): v is CLVMType {
  return v && typeof v.atom !== "undefined" && typeof v.pair !== "undefined";
}