"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.op_eq = exports.op_raise = exports.op_listp = exports.op_rest = exports.op_first = exports.op_cons = exports.op_if = void 0;
const SExp_1 = require("./SExp");
const __type_compatibility__1 = require("./__type_compatibility__");
const costs_1 = require("./costs");
const EvalError_1 = require("./EvalError");
function op_if(args) {
    if (args.list_len() !== 3) {
        throw new EvalError_1.EvalError("i takes exactly 3 arguments", args);
    }
    const r = args.rest();
    if (args.first().nullp()) {
        return __type_compatibility__1.t(costs_1.IF_COST, r.rest().first());
    }
    return __type_compatibility__1.t(costs_1.IF_COST, r.first());
}
exports.op_if = op_if;
function op_cons(args) {
    if (args.list_len() !== 2) {
        throw new EvalError_1.EvalError("c takes exactly 2 arguments", args);
    }
    return __type_compatibility__1.t(costs_1.CONS_COST, args.first().cons(args.rest().first()));
}
exports.op_cons = op_cons;
function op_first(args) {
    if (args.list_len() !== 1) {
        throw new EvalError_1.EvalError("f takes exactly 1 argument", args);
    }
    return __type_compatibility__1.t(costs_1.FIRST_COST, args.first().first());
}
exports.op_first = op_first;
function op_rest(args) {
    if (args.list_len() !== 1) {
        throw new EvalError_1.EvalError("r takes exactly 1 argument", args);
    }
    return __type_compatibility__1.t(costs_1.REST_COST, args.first().rest());
}
exports.op_rest = op_rest;
function op_listp(args) {
    if (args.list_len() !== 1) {
        throw new EvalError_1.EvalError("l takes exactly 1 argument", args);
    }
    return __type_compatibility__1.t(costs_1.LISTP_COST, args.first().listp() ? SExp_1.SExp.TRUE : SExp_1.SExp.FALSE);
}
exports.op_listp = op_listp;
function op_raise(args) {
    throw new EvalError_1.EvalError("clvm raise", args);
}
exports.op_raise = op_raise;
function op_eq(args) {
    if (args.list_len() !== 2) {
        throw new EvalError_1.EvalError("= takes exactly 2 arguments", args);
    }
    const a0 = args.first();
    const a1 = args.rest().first();
    if (a0.pair || a1.pair) {
        throw new EvalError_1.EvalError("= on list", a0.pair ? a0 : a1);
    }
    const b0 = a0.atom;
    const b1 = a1.atom;
    let cost = costs_1.EQ_BASE_COST;
    cost += (b0.length + b1.length) * costs_1.EQ_COST_PER_BYTE;
    return __type_compatibility__1.t(cost, b0.equal_to(b1) ? SExp_1.SExp.TRUE : SExp_1.SExp.FALSE);
}
exports.op_eq = op_eq;
