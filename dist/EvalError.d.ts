import type { str } from "./__python_types__";
import type { CLVMObject } from "./CLVMObject";
export declare class EvalError extends Error {
    private _sexp?;
    name: string;
    constructor(message: str, sexp: CLVMObject);
}
