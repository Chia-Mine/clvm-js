import {SHA256, Word32Array} from "jscrypto";
import {SExp} from "./SExp";
import {
  ARITH_BASE_COST, ARITH_COST_PER_ARG, ARITH_COST_PER_BYTE,
  MALLOC_COST_PER_BYTE, MUL_BASE_COST, MUL_COST_PER_OP, MUL_LINEAR_COST_PER_BYTE, MUL_SQUARE_COST_PER_BYTE_DIVIDER,
  SHA256_BASE_COST,
  SHA256_COST_PER_ARG,
  SHA256_COST_PER_BYTE
} from "./costs";
import {Bytes, t, Tuple2} from "./__type_compatibility__";
import {EvalError} from "./EvalError";
import {int, str} from "./__python_types__";
import {limbs_for_int} from "./casts";

export function malloc_cost(cost: int, atom: SExp){
  if(!atom.atom){
    throw new EvalError("atom is None", atom);
  }
  
  return t(cost + atom.atom.length * MALLOC_COST_PER_BYTE, atom);
}

export function op_sha256(args: SExp){
  let cost = SHA256_BASE_COST;
  let arg_len = 0;
  const h = new SHA256();
  for(const _ of args.as_iter()){
    const atom = _.atom;
    if(!atom){
      throw new EvalError("sha256 on list", _);
    }
    arg_len += atom.length;
    cost += SHA256_COST_PER_ARG;
    h.update(atom.as_word());
  }
  cost += arg_len * SHA256_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(new Bytes(h.finalize())));
}

export function* args_as_ints(op_name: str, args: SExp){
  for(const arg of args.as_iter()){
    if(arg.pair || !arg.atom){
      throw new EvalError(`${op_name} requires int args`, arg);
    }
    yield t(arg.as_int(), arg.atom.length);
  }
}

export function* args_as_int32(op_name: str, args: SExp){
  for(const arg of args.as_iter()){
    if(arg.pair || !arg.atom){
      throw new EvalError(`${op_name} requires int32 args`, arg);
    }
    else if(arg.atom.length > 4){
      throw new EvalError(`${op_name} requires int32 args (with no leading zeros`, arg);
    }
    yield arg.as_int();
  }
}

export function args_as_int_list(op_name: str, args: SExp, count: int){
  const int_list: Array<Tuple2<number, number>> = [];
  for(const _ of args_as_ints(op_name, args)) int_list.push(_);
  
  if(int_list.length !== count){
    const plural = count !== 1 ? "s" : "";
    throw new EvalError(`${op_name} takes exactly ${count} argument${plural}`, args);
  }
  return int_list;
}

export function* args_as_bools(op_name: str, args: SExp){
  for(const arg of args.as_iter()){
    const v = arg.atom;
    if(v?.equal_to(SExp.null())){
      yield SExp.FALSE;
    }
    else{
      yield SExp.TRUE;
    }
  }
}

export function args_as_bool_list(op_name: str, args: SExp, count: int){
  const bool_list: Array<SExp> = [];
  for(const _ of args_as_bools(op_name, args)) bool_list.push(_);
  
  if(bool_list.length !== count){
    const plural = count !== 1 ? "s" : "";
    throw new EvalError(`${op_name} takes exactly ${count} argument${plural}`, args);
  }
  return bool_list;
}

export function op_add(args: SExp){
  let total = 0;
  let cost = ARITH_BASE_COST;
  let arg_size = 0;
  
  for(const ints of args_as_ints("+", args)){
    const [r, l] = ints.as_array();
    total += r;
    arg_size += l;
    cost += ARITH_COST_PER_ARG;
  }
  cost += arg_size * ARITH_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(total));
}

export function op_subtract(args: SExp){
  let cost = ARITH_BASE_COST;
  if(args.nullp()){
    return malloc_cost(cost, SExp.to(0));
  }
  
  let sign = 1;
  let total = 0;
  let arg_size = 0;
  for(const ints of args_as_ints("-", args)){
    const [r, l] = ints.as_array();
    total += sign * r;
    sign = -1;
    arg_size += l;
    cost += ARITH_COST_PER_BYTE;
  }
  cost += arg_size * ARITH_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(total));
}

export function op_multiply(args: SExp){
  let cost = MUL_BASE_COST;
  const operands = args_as_ints("*", args);
  
  const res = operands.next();
  if(res.done){
    return malloc_cost(cost, SExp.to(1));
  }
  let [v, vs] = res.value.as_array();
  
  for(const o of operands){
    const [r, rs] = o.as_array();
    cost += MUL_COST_PER_OP;
    cost += (rs + vs) * MUL_LINEAR_COST_PER_BYTE;
    cost += ((rs * vs) / MUL_SQUARE_COST_PER_BYTE_DIVIDER) >> 0;
    v = v * r;
    vs = limbs_for_int(v);
  }
  return malloc_cost(cost, SExp.to(v));
}
