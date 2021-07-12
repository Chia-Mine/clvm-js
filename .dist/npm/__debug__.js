"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = void 0;
const SExp_1 = require("./SExp");
function prettyPrint(enable) {
    if (enable) {
        const toString = SExp_1.SExp.prototype.toString;
        SExp_1.SExp.prototype.toString = SExp_1.SExp.prototype.__repr__;
        SExp_1.SExp.prototype.__repr__ = toString;
    }
    else {
        const __repr__ = SExp_1.SExp.prototype.toString;
        SExp_1.SExp.prototype.toString = SExp_1.SExp.prototype.__repr__;
        SExp_1.SExp.prototype.__repr__ = __repr__;
    }
}
exports.prettyPrint = prettyPrint;
