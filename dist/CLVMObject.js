"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCons = exports.isAtom = exports.CLVMObject = void 0;
const __python_types__1 = require("./__python_types__");
const __type_compatibility__1 = require("./__type_compatibility__");
const EvalError_1 = require("./EvalError");
/*
  This class implements the CLVM Object protocol in the simplest possible way,
  by just having an "atom" and a "pair" field
 */
class CLVMObject {
    constructor(v) {
        this.atom = __python_types__1.None;
        // this is always a 2-tuple of an object implementing the CLVM object protocol.
        this.pair = __python_types__1.None;
        if (v instanceof CLVMObject) {
            this.atom = v.atom;
            this.pair = v.pair;
        }
        else if (v instanceof __type_compatibility__1.Tuple2) {
            this.pair = v;
            this.atom = __python_types__1.None;
        }
        else {
            this.atom = v;
            this.pair = __python_types__1.None;
        }
    }
}
exports.CLVMObject = CLVMObject;
function isAtom(obj) {
    if ((obj.atom && obj.pair) || (!obj.atom && !obj.pair)) {
        throw new EvalError_1.EvalError("Invalid clvm", obj);
    }
    return Boolean(obj.atom && !obj.pair);
}
exports.isAtom = isAtom;
function isCons(obj) {
    if ((obj.atom && obj.pair) || (!obj.atom && !obj.pair)) {
        throw new EvalError_1.EvalError("Invalid clvm", obj);
    }
    return Boolean((!obj.atom && obj.pair));
}
exports.isCons = isCons;
