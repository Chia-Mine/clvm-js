"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATOR_LOOKUP = exports.OperatorDict = exports.APPLY_ATOM = exports.QUOTE_ATOM = exports.default_unknown_op = exports.args_len = exports.OP_REWRITE = exports.KEYWORD_TO_ATOM = exports.KEYWORD_FROM_ATOM = void 0;
const casts_1 = require("./casts");
const SExp_1 = require("./SExp");
const __type_compatibility__1 = require("./__type_compatibility__");
const EvalError_1 = require("./EvalError");
const costs_1 = require("./costs");
const op_utils_1 = require("./op_utils");
const core_ops = require("./core_ops");
const more_ops = require("./more_ops");
/*
export const KEYWORDS = [
  // core opcodes 0x01-x08
  ". q a i c f r l x ",
  
  // opcodes on atoms as strings 0x09-0x0f
  "= >s sha256 substr strlen concat . ",
  
  // opcodes on atoms as ints 0x10-0x17
  "+ - * / divmod > ash lsh ",
  
  // opcodes on atoms as vectors of bools 0x18-0x1c
  "logand logior logxor lognot . ",
  
  // opcodes for bls 1381 0x1d-0x1f
  "point_add pubkey_for_exp . ",
  
  // bool opcodes 0x20-0x23
  "not any all . ",
  
  // misc 0x24
  "softfork ",
].join("").trim().split(/\s/);
export const KEYWORD_FROM_ATOM = Object
  .entries(KEYWORDS)
  .reduce<Record<str, str>>((acc, v) => {
    acc[int_to_bytes(+v[0]).toString()] = v[1];
    return acc;
  }, {});
export const KEYWORD_TO_ATOM = Object
  .entries(KEYWORD_FROM_ATOM)
  .reduce<Record<str, str>>((acc, v) => {
    acc[v[1]] = v[0];
    return acc;
  }, {});
 */
exports.KEYWORD_FROM_ATOM = {
    "00": ".",
    // core opcodes 0x01-x08
    "01": "q",
    "02": "a",
    "03": "i",
    "04": "c",
    "05": "f",
    "06": "r",
    "07": "l",
    "08": "x",
    // opcodes on atoms as strings 0x09-0x0f
    "09": "=",
    "0a": ">s",
    "0b": "sha256",
    "0c": "substr",
    "0d": "strlen",
    "0e": "concat",
    "0f": ".",
    // opcodes on atoms as ints 0x10-0x17
    "10": "+",
    "11": "-",
    "12": "*",
    "13": "/",
    "14": "divmod",
    "15": ">",
    "16": "ash",
    "17": "lsh",
    // opcodes on atoms as vectors of bools 0x18-0x1c
    "18": "logand",
    "19": "logior",
    "1a": "logxor",
    "1b": "lognot",
    "1c": ".",
    // opcodes for bls 1381 0x1d-0x1f
    "1d": "point_add",
    "1e": "pubkey_for_exp",
    "1f": ".",
    // bool opcodes 0x20-0x23
    "20": "not",
    "21": "any",
    "22": "all",
    "23": ".",
    // misc 0x24
    "24": "softfork",
};
exports.KEYWORD_TO_ATOM = {
    // ".": "00",
    // core opcodes 0x01-x08
    "q": "01",
    "a": "02",
    "i": "03",
    "c": "04",
    "f": "05",
    "r": "06",
    "l": "07",
    "x": "08",
    // opcodes on atoms as strings 0x09-0x0f
    "=": "09",
    ">s": "0a",
    "sha256": "0b",
    "substr": "0c",
    "strlen": "0d",
    "concat": "0e",
    // ".": "0f",
    // opcodes on atoms as ints 0x10-0x17
    "+": "10",
    "-": "11",
    "*": "12",
    "/": "13",
    "divmod": "14",
    ">": "15",
    "ash": "16",
    "lsh": "17",
    // opcodes on atoms as vectors of bools 0x18-0x1c
    "logand": "18",
    "logior": "19",
    "logxor": "1a",
    "lognot": "1b",
    // ".": "1c",
    // opcodes for bls 1381 0x1d-0x1f
    "point_add": "1d",
    "pubkey_for_exp": "1e",
    // ".": "1f",
    // bool opcodes 0x20-0x23
    "not": "20",
    "any": "21",
    "all": "22",
    ".": "23",
    // misc 0x24
    "softfork": "24",
};
exports.OP_REWRITE = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "div",
    "i": "if",
    "c": "cons",
    "f": "first",
    "r": "rest",
    "l": "listp",
    "x": "raise",
    "=": "eq",
    ">": "gr",
    ">s": "gr_bytes",
};
function* args_len(op_name, args) {
    for (const arg of args.as_iter()) {
        if (arg.pair) {
            throw new EvalError_1.EvalError(`${op_name} requires int args"`, arg);
        }
        yield arg.atom.length;
    }
}
exports.args_len = args_len;
/*
# unknown ops are reserved if they start with 0xffff
# otherwise, unknown ops are no-ops, but they have costs. The cost is computed
# like this:

# byte index (reverse):
# | 4 | 3 | 2 | 1 | 0          |
# +---+---+---+---+------------+
# | multiplier    |XX | XXXXXX |
# +---+---+---+---+---+--------+
#  ^               ^    ^
#  |               |    + 6 bits ignored when computing cost
# cost_multiplier  |
#                  + 2 bits
#                    cost_function

# 1 is always added to the multiplier before using it to multiply the cost, this
# is since cost may not be 0.

# cost_function is 2 bits and defines how cost is computed based on arguments:
# 0: constant, cost is 1 * (multiplier + 1)
# 1: computed like operator add, multiplied by (multiplier + 1)
# 2: computed like operator mul, multiplied by (multiplier + 1)
# 3: computed like operator concat, multiplied by (multiplier + 1)

# this means that unknown ops where cost_function is 1, 2, or 3, may still be
# fatal errors if the arguments passed are not atoms.
 */
function default_unknown_op(op, args) {
    // # any opcode starting with ffff is reserved (i.e. fatal error)
    // # opcodes are not allowed to be empty
    if (op.length === 0 || op.slice(0, 2).equal_to(__type_compatibility__1.Bytes.from("0xffff", "hex"))) {
        throw new EvalError_1.EvalError("reserved operator", SExp_1.SExp.to(op));
    }
    /*
      # all other unknown opcodes are no-ops
      # the cost of the no-ops is determined by the opcode number, except the
      # 6 least significant bits.
     */
    const cost_function = (op.get_byte_at(op.length - 1) & 0b11000000) >> 6;
    // # the multiplier cannot be 0. it starts at 1
    if (op.length > 5) {
        throw new EvalError_1.EvalError("invalid operator", SExp_1.SExp.to(op));
    }
    const cost_multiplier = casts_1.int_from_bytes(op.slice(0, op.length - 1)) + 1;
    /*
      # 0 = constant
      # 1 = like op_add/op_sub
      # 2 = like op_multiply
      # 3 = like op_concat
     */
    let cost;
    if (cost_function === 0) {
        cost = 1;
    }
    else if (cost_function === 1) {
        cost = costs_1.ARITH_BASE_COST;
        let arg_size = 0;
        for (const length of args_len("unknown op", args)) {
            arg_size += length;
            cost += costs_1.ARITH_COST_PER_ARG;
        }
        cost += arg_size * costs_1.ARITH_COST_PER_BYTE;
    }
    else if (cost_function === 2) {
        // # like op_multiply
        cost = costs_1.MUL_BASE_COST;
        const operands = args_len("unknown op", args);
        const res = operands.next();
        if (!res.done) {
            let vs = res.value;
            for (const rs of operands) {
                cost += costs_1.MUL_COST_PER_OP;
                cost += (rs + vs) * costs_1.MUL_LINEAR_COST_PER_BYTE;
                cost += ((rs * vs) / costs_1.MUL_SQUARE_COST_PER_BYTE_DIVIDER) >> 0;
                vs += rs;
            }
        }
    }
    else if (cost_function === 3) {
        // # like concat
        cost = costs_1.CONCAT_BASE_COST;
        let length = 0;
        for (const arg of args.as_iter()) {
            if (arg.pair) {
                throw new EvalError_1.EvalError("unknown op on list", arg);
            }
            cost += costs_1.CONCAT_COST_PER_ARG;
            length += arg.atom.length;
        }
        cost += length * costs_1.CONCAT_COST_PER_BYTE;
    }
    else {
        throw new Error(`Invalid cost_function: ${cost_function}`);
    }
    cost *= cost_multiplier;
    if (cost >= 2 ** 32) {
        throw new EvalError_1.EvalError("invalid operator", SExp_1.SExp.to(op));
    }
    return __type_compatibility__1.t(cost, SExp_1.SExp.null());
}
exports.default_unknown_op = default_unknown_op;
exports.QUOTE_ATOM = __type_compatibility__1.Bytes.from(exports.KEYWORD_TO_ATOM["q"], "hex");
exports.APPLY_ATOM = __type_compatibility__1.Bytes.from(exports.KEYWORD_TO_ATOM["a"], "hex");
function merge(obj1, obj2) {
    Object.keys(obj2).forEach(key => {
        obj1[key] = obj2[key];
    });
}
function OperatorDict(atom_op_function_map, quote_atom, apply_atom, unknown_op_handler) {
    const dict = Object.assign(Object.assign({}, atom_op_function_map), { quote_atom: quote_atom || atom_op_function_map.quote_atom || exports.QUOTE_ATOM, apply_atom: apply_atom || atom_op_function_map.apply_atom || exports.APPLY_ATOM, unknown_op_handler: unknown_op_handler || default_unknown_op });
    const OperatorDict = function (op, args) {
        if (typeof op === "string") {
            op = __type_compatibility__1.Bytes.from(op, "hex");
        }
        else if (typeof op === "number") {
            op = casts_1.int_to_bytes(op);
        }
        else if (!(op instanceof __type_compatibility__1.Bytes)) {
            throw new Error(`Invalid op: ${JSON.stringify(op)}`);
        }
        merge(dict, OperatorDict);
        const f = dict[op.toString()];
        if (typeof f !== "function") {
            return dict.unknown_op_handler(op, args);
        }
        else {
            return f(args);
        }
    };
    merge(OperatorDict, dict);
    return OperatorDict;
}
exports.OperatorDict = OperatorDict;
const _OPERATOR_LOOKUP = OperatorDict(op_utils_1.operators_for_module(exports.KEYWORD_TO_ATOM, core_ops, exports.OP_REWRITE), exports.QUOTE_ATOM, exports.APPLY_ATOM);
merge(_OPERATOR_LOOKUP, op_utils_1.operators_for_module(exports.KEYWORD_TO_ATOM, more_ops, exports.OP_REWRITE));
exports.OPERATOR_LOOKUP = _OPERATOR_LOOKUP;
