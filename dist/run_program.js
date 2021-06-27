"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_program = exports.msb_mask = exports.to_pre_eval_op = void 0;
const __python_types__1 = require("./__python_types__");
const SExp_1 = require("./SExp");
const CLVMObject_1 = require("./CLVMObject");
const __type_compatibility__1 = require("./__type_compatibility__");
const costs_1 = require("./costs");
const EvalError_1 = require("./EvalError");
function to_pre_eval_op(pre_eval_f, to_sexp_f) {
    return function my_pre_eval_op(op_stack, value_stack) {
        const v = to_sexp_f(value_stack[value_stack.length - 1]);
        const context = pre_eval_f(v.first(), v.rest());
        if (typeof context === "function") {
            const invoke_context_op = (op_stack, value_stack) => {
                context(to_sexp_f(value_stack[value_stack.length - 1]));
                return 0;
            };
            op_stack.push(invoke_context_op);
        }
    };
}
exports.to_pre_eval_op = to_pre_eval_op;
function msb_mask(byte) {
    byte |= byte >> 1;
    byte |= byte >> 2;
    byte |= byte >> 4;
    return (byte + 1) >> 1;
}
exports.msb_mask = msb_mask;
function run_program(program, args, operator_lookup, max_cost = __python_types__1.None, pre_eval_f = __python_types__1.None) {
    program = SExp_1.SExp.to(program);
    const pre_eval_op = pre_eval_f ? to_pre_eval_op(pre_eval_f, SExp_1.SExp.to) : __python_types__1.None;
    function traverse_path(sexp, env) {
        let cost = costs_1.PATH_LOOKUP_BASE_COST;
        cost += costs_1.PATH_LOOKUP_COST_PER_LEG;
        if (sexp.nullp()) {
            return __type_compatibility__1.t(cost, SExp_1.SExp.null());
        }
        const b = sexp.atom;
        let end_byte_cursor = 0;
        while (end_byte_cursor < b.length && b.get_byte_at(end_byte_cursor) === 0) {
            end_byte_cursor += 1;
        }
        cost += end_byte_cursor * costs_1.PATH_LOOKUP_COST_PER_ZERO_BYTE;
        if (end_byte_cursor === b.length) {
            return __type_compatibility__1.t(cost, SExp_1.SExp.null());
        }
        // # create a bitmask for the most significant *set* bit
        // # in the last non-zero byte
        const end_bitmask = msb_mask(b.get_byte_at(end_byte_cursor));
        let byte_cursor = b.length - 1;
        let bitmask = 0x01;
        while (byte_cursor > end_byte_cursor || bitmask < end_bitmask) {
            if (!CLVMObject_1.isCons(env)) {
                throw new EvalError_1.EvalError("path into atom", env);
            }
            if (b.get_byte_at(byte_cursor) & bitmask) {
                env = env.rest();
            }
            else {
                env = env.first();
            }
            cost += costs_1.PATH_LOOKUP_COST_PER_LEG;
            bitmask <<= 1;
            if (bitmask === 0x0100) {
                byte_cursor -= 1;
                bitmask = 0x01;
            }
        }
        return __type_compatibility__1.t(cost, env);
    }
    function swap_op(op_stack, value_stack) {
        const v2 = value_stack.pop();
        const v1 = value_stack.pop();
        value_stack.push(v2);
        value_stack.push(v1);
        return 0;
    }
    function cons_op(op_stack, value_stack) {
        const v1 = value_stack.pop();
        const v2 = value_stack.pop();
        value_stack.push(v1.cons(v2));
        return 0;
    }
    function eval_op(op_stack, value_stack) {
        if (pre_eval_op) {
            pre_eval_op(op_stack, value_stack);
        }
        const pair = value_stack.pop();
        const sexp = pair.first();
        const args = pair.rest();
        // # put a bunch of ops on op_stack
        if (!CLVMObject_1.isCons(sexp)) {
            // # sexp is an atom
            const [cost, r] = traverse_path(sexp, args);
            value_stack.push(r);
            return cost;
        }
        const operator = sexp.first();
        if (CLVMObject_1.isCons(operator)) {
            const pair = operator.as_pair();
            const [new_operator, must_be_nil] = pair;
            if (new_operator.pair || !__type_compatibility__1.Bytes.NULL.equal_to(must_be_nil.atom)) {
                throw new EvalError_1.EvalError("in ((X)...) syntax X must be lone atom", sexp);
            }
            const new_operand_list = sexp.rest();
            value_stack.push(new_operator);
            value_stack.push(new_operand_list);
            op_stack.push(apply_op);
            return costs_1.APPLY_COST;
        }
        const op = operator.atom;
        let operand_list = sexp.rest();
        // op === operator_lookup.quote_atom
        if (op.equal_to(operator_lookup.quote_atom)) {
            value_stack.push(operand_list);
            return costs_1.QUOTE_COST;
        }
        op_stack.push(apply_op);
        value_stack.push(operator);
        while (!operand_list.nullp()) {
            const _ = operand_list.first();
            value_stack.push(_.cons(args));
            op_stack.push(cons_op);
            op_stack.push(eval_op);
            op_stack.push(swap_op);
            operand_list = operand_list.rest();
        }
        value_stack.push(SExp_1.SExp.null());
        return 1;
    }
    function apply_op(op_stack, value_stack) {
        const operand_list = value_stack.pop();
        const operator = value_stack.pop();
        if (!CLVMObject_1.isAtom(operator)) {
            throw new EvalError_1.EvalError("internal error", operator);
        }
        const op = operator.atom;
        // op === operator_lookup.apply_atom
        if (op.equal_to(operator_lookup.apply_atom)) {
            if (operand_list.list_len() !== 2) {
                throw new EvalError_1.EvalError("apply requires exactly 2 parameters", operand_list);
            }
            const new_program = operand_list.first();
            const new_args = operand_list.rest().first();
            value_stack.push(new_program.cons(new_args));
            op_stack.push(eval_op);
            return costs_1.APPLY_COST;
        }
        const [additional_cost, r] = operator_lookup(op, operand_list);
        value_stack.push(r);
        return additional_cost;
    }
    const op_stack = [eval_op];
    const value_stack = [program.cons(args)];
    let cost = 0;
    while (op_stack.length) {
        const f = op_stack.pop();
        cost += f(op_stack, value_stack);
        if (max_cost && cost > max_cost) {
            throw new EvalError_1.EvalError("cost exceeded", SExp_1.SExp.to(max_cost));
        }
    }
    return __type_compatibility__1.t(cost, value_stack[value_stack.length - 1]);
}
exports.run_program = run_program;
