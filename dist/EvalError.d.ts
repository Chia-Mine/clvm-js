import type { str } from "./__python_types__";
import type { CLVMObject } from "./CLVMObject";
export declare class EvalError extends Error {
    _sexp?: CLVMObject;
    name: string;
    constructor(message: str, sexp: CLVMObject);
}
