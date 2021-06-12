import {int, str} from "./__python_types__";
import {int_from_bytes, int_to_bytes} from "./casts";
import {SExp} from "./SExp";
import {Bytes, Tuple2, t} from "./__type_compatibility__";
import {CLVMObject} from "./CLVMObject";
import {EvalError} from "./EvalError";
import {
  ARITH_BASE_COST,
  ARITH_COST_PER_ARG,
  ARITH_COST_PER_BYTE,
  CONCAT_BASE_COST,
  CONCAT_COST_PER_ARG,
  CONCAT_COST_PER_BYTE,
  MUL_BASE_COST,
  MUL_COST_PER_OP,
  MUL_LINEAR_COST_PER_BYTE,
  MUL_SQUARE_COST_PER_BYTE_DIVIDER,
} from "./costs";
import {operators_for_module} from "./op_utils";
import * as core_ops from "./core_ops";
import * as more_ops from "./more_ops";

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

/*
 {
   "2f": "xxx",
   "30": "yyy",
   ...
 }
 */
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

export const OP_REWRITE = {
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

export function* args_len(op_name: str, args: SExp){
  for(const arg of args.as_iter()){
    if(arg.pair){
      throw new EvalError(`${op_name} requires int args"`, arg);
    }
    yield (arg.atom as Bytes).length;
  }
}

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
export function default_unknown_op(op: Bytes, args: SExp): Tuple2<int, CLVMObject> {
  // # any opcode starting with ffff is reserved (i.e. fatal error)
  // # opcodes are not allowed to be empty
  if(op.length === 0 || op.slice(0, 2).equal_to(new Bytes([0xffff]))){
    throw new EvalError("reserved operator", SExp.to(op));
  }
  
  /*
    # all other unknown opcodes are no-ops
    # the cost of the no-ops is determined by the opcode number, except the
    # 6 least significant bits.
   */
  const cost_function = (op.get_byte_at(op.length-1) & 0b11000000) >> 6;
  // # the multiplier cannot be 0. it starts at 1
  
  if(op.length > 5){
    throw new EvalError("invalid operator", SExp.to(op));
  }
  
  const cost_multiplier = int_from_bytes(op.slice(0, op.length-1)) + 1;
  /*
    # 0 = constant
    # 1 = like op_add/op_sub
    # 2 = like op_multiply
    # 3 = like op_concat
   */
  let cost;
  if(cost_function === 0){
    cost = 1;
  }
  else if(cost_function === 1){
    cost = ARITH_BASE_COST;
    let arg_size = 0;
    for(const length of args_len("unknown op", args)){
      arg_size += length;
      cost += ARITH_COST_PER_ARG;
    }
    cost += arg_size * ARITH_COST_PER_BYTE;
  }
  else if(cost_function === 2){
    // # like op_multiply
    cost = MUL_BASE_COST;
    const operands = args_len("unknown op", args);
    const res = operands.next();
    if(!res.done){
      let vs = res.value;
      for(const rs of operands){
        cost += MUL_COST_PER_OP;
        cost += (rs + vs) * MUL_LINEAR_COST_PER_BYTE;
        cost += ((rs * vs) / MUL_SQUARE_COST_PER_BYTE_DIVIDER) >> 0;
        vs += rs;
      }
    }
  }
  else if(cost_function === 3){
    // # like concat
    cost = CONCAT_BASE_COST;
    let length = 0;
    for(const arg of args.as_iter()){
      if(arg.pair){
        throw new EvalError("unknown op on list", arg);
      }
      cost += CONCAT_COST_PER_ARG;
      length += (arg.atom as Bytes).length;
    }
    cost += length * CONCAT_COST_PER_BYTE;
  }
  else{
    throw new Error(`Invalid cost_function: ${cost_function}`);
  }
  
  cost *= cost_multiplier;
  if(cost >= 2**32){
    throw new EvalError("invalid operator", SExp.to(op));
  }
  
  return t(cost, SExp.null());
}

export const QUOTE_ATOM = KEYWORD_TO_ATOM["q"];
export const APPLY_ATOM = KEYWORD_TO_ATOM["a"];

type TOpAtomFunctionMap = Record<str, (args: SExp) => unknown>;

function merge(obj1: Record<string, unknown>, obj2: Record<string, unknown>){
  Object.keys(obj2).forEach(key => {
    obj1[key] = obj2[key];
  });
}

export function OperatorDict(
  op_atom_function_map: TOpAtomFunctionMap,
  quote?: str, // `Bytes.toString()` of the quote atom
  apply?: str, // `Bytes.toString()` of the apply atom
  unknown_op_handler?: typeof default_unknown_op,
){
  const dict = {
    ...op_atom_function_map,
    quote_atom: quote || op_atom_function_map.quate_atom || QUOTE_ATOM,
    apply_atom: apply || op_atom_function_map.apply_atom || APPLY_ATOM,
    unknown_op_handler: unknown_op_handler || default_unknown_op,
  };
  
  const OperatorDict = function(op: Bytes, args: SExp){
    const f = (dict as TOpAtomFunctionMap | Record<string, unknown>)[op.toString()];
    if(typeof f !== "function"){
      return dict.unknown_op_handler(op, args);
    }
    else{
      return f(args);
    }
  };
  
  merge(OperatorDict as any, dict);
  
  return OperatorDict;
}

const _OPERATOR_LOOKUP = OperatorDict(
  operators_for_module(KEYWORD_TO_ATOM, core_ops, OP_REWRITE),
  QUOTE_ATOM,
  APPLY_ATOM,
);

merge(_OPERATOR_LOOKUP as any, operators_for_module(KEYWORD_TO_ATOM, more_ops, OP_REWRITE));

export const OPERATOR_LOOKUP = _OPERATOR_LOOKUP;
