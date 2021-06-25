import type {str} from "./__python_types__";
import type {CLVMObject} from "./CLVMObject";

export class EvalError extends Error {
  public _sexp?: CLVMObject;
  name = "EvalError";
  
  public constructor(message: str, sexp: CLVMObject) {
    super(message);
    this._sexp = sexp;
  }
}
