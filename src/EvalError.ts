import type {CLVMObject} from "./CLVMObject";

export class EvalError extends Error {
  public _sexp?: CLVMObject;
  name = "EvalError";
  
  public constructor(message: string, sexp: CLVMObject) {
    super(message);
    this._sexp = sexp;
  }
}
