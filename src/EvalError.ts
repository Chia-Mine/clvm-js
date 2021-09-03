import type {CLVMType} from "./CLVMObject";

export class EvalError extends Error {
  public _sexp?: CLVMType;
  name = "EvalError";
  
  public constructor(message: string, sexp: CLVMType) {
    super(message);
    this._sexp = sexp;
  }
}
