import {SExp} from "./SExp";

export function prettyPrint(enable: boolean){
  if(enable){
    const toString = SExp.prototype.toString;
    SExp.prototype.toString = SExp.prototype.__repl__;
    SExp.prototype.__repl__ = toString;
  }
  else{
    const __repl__ = SExp.prototype.toString;
    SExp.prototype.toString = SExp.prototype.__repl__;
    SExp.prototype.__repl__ = __repl__;
  }
}
