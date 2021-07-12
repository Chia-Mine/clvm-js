"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvalError = void 0;
class EvalError extends Error {
    constructor(message, sexp) {
        super(message);
        this.name = "EvalError";
        this._sexp = sexp;
    }
}
exports.EvalError = EvalError;
