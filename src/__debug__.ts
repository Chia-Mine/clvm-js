import {SExp} from "./SExp";

export function prettyPrint(enable: boolean){
  if(enable){
    const toString = SExp.prototype.toString;
    SExp.prototype.toString = SExp.prototype.__repr__;
    SExp.prototype.__repr__ = toString;
  }
  else{
    const __repr__ = SExp.prototype.toString;
    SExp.prototype.toString = SExp.prototype.__repr__;
    SExp.prototype.__repr__ = __repr__;
  }
}
