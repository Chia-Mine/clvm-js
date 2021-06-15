"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = void 0;
const SExp_1 = require("./SExp");
function prettyPrint(enable) {
    if (enable) {
        const toString = SExp_1.SExp.prototype.toString;
        SExp_1.SExp.prototype.toString = SExp_1.SExp.prototype.__repl__;
        SExp_1.SExp.prototype.__repl__ = toString;
    }
    else {
        const __repl__ = SExp_1.SExp.prototype.toString;
        SExp_1.SExp.prototype.toString = SExp_1.SExp.prototype.__repl__;
        SExp_1.SExp.prototype.__repl__ = __repl__;
    }
}
exports.prettyPrint = prettyPrint;
