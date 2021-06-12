import {SExp} from "./SExp";
import {Bytes, t} from "./__type_compatibility__";
import {CONS_COST, EQ_BASE_COST, EQ_COST_PER_BYTE, FIRST_COST, IF_COST, LISTP_COST, REST_COST} from "./costs";
import {EvalError} from "./EvalError";

export function op_if(args: SExp){
  if(args.list_len() !== 3){
    throw new EvalError("i takes exactly 3 arguments", args);
  }
  const r = args.rest();
  if(args.first().nullp()){
    return t(IF_COST, r.rest().first());
  }
  return t(IF_COST, r.first());
}

export function op_cons(args: SExp){
  if(args.list_len() !== 2){
    throw new EvalError("c takes exactly 2 arguments", args);
  }
  return t(CONS_COST, args.first().cons(args.rest().first()));
}

export function op_first(args: SExp){
  if(args.list_len() !== 1){
    throw new EvalError("f takes exactly 1 argument", args);
  }
  return t(FIRST_COST, args.first().first());
}

export function op_rest(args: SExp){
  if(args.list_len() !== 1){
    throw new EvalError("r takes exactly 1 argument", args);
  }
  return t(REST_COST, args.first().rest());
}

export function op_listp(args: SExp){
  if(args.list_len() !== 1){
    throw new EvalError("l takes exactly 1 argument", args);
  }
  return t(LISTP_COST, args.first().listp() ? SExp.TRUE : SExp.FALSE);
}

export function op_raise(args: SExp){
  throw new EvalError("clvm raise", args);
}

export function op_eq(args: SExp){
  if(args.list_len() !== 2){
    throw new EvalError("= takes exactly 2 arguments", args);
  }
  const a0 = args.first();
  const a1 = args.rest().first();
  if(a0.pair || a1.pair){
    throw new EvalError("= on list", a0.pair ? a0 : a1);
  }
  
  const b0 = a0.atom as Bytes;
  const b1 = a1.atom as Bytes;
  let cost = EQ_BASE_COST;
  cost += (b0.length + b1.length) * EQ_COST_PER_BYTE;
  return t(cost, b0.equal_to(b1) ? SExp.TRUE : SExp.FALSE);
}
