import {SHA256} from "jscrypto/SHA256";
import {SExp} from "./SExp";
import {
  ARITH_BASE_COST,
  ARITH_COST_PER_ARG,
  ARITH_COST_PER_BYTE,
  ASHIFT_BASE_COST,
  ASHIFT_COST_PER_BYTE,
  BOOL_BASE_COST,
  BOOL_COST_PER_ARG,
  CONCAT_BASE_COST,
  CONCAT_COST_PER_ARG,
  CONCAT_COST_PER_BYTE,
  DIV_BASE_COST,
  DIV_COST_PER_BYTE,
  DIVMOD_BASE_COST,
  DIVMOD_COST_PER_BYTE,
  GR_BASE_COST,
  GR_COST_PER_BYTE,
  GRS_BASE_COST,
  GRS_COST_PER_BYTE,
  LOG_BASE_COST,
  LOG_COST_PER_ARG,
  LOG_COST_PER_BYTE,
  LOGNOT_BASE_COST,
  LOGNOT_COST_PER_BYTE,
  LSHIFT_BASE_COST,
  LSHIFT_COST_PER_BYTE,
  MALLOC_COST_PER_BYTE,
  MUL_BASE_COST,
  MUL_COST_PER_OP,
  MUL_LINEAR_COST_PER_BYTE,
  MUL_SQUARE_COST_PER_BYTE_DIVIDER,
  PUBKEY_BASE_COST,
  PUBKEY_COST_PER_BYTE,
  POINT_ADD_BASE_COST,
  POINT_ADD_COST_PER_ARG,
  SHA256_BASE_COST,
  SHA256_COST_PER_ARG,
  SHA256_COST_PER_BYTE,
  STRLEN_BASE_COST,
  STRLEN_COST_PER_BYTE
} from "./costs";
import {Bytes, list, Stream, t, division, modulo} from "./__type_compatibility__";
import {EvalError} from "./EvalError";
import {bigint_from_bytes, bigint_to_bytes, limbs_for_int} from "./casts";
import {isAtom} from "./CLVMObject";
import {G1Element_add, G1Element_from_bytes, getBLSModule} from "./__bls_signatures__";

export function malloc_cost(cost: number, atom: SExp){
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
  return malloc_cost(cost, SExp.to(Bytes.from(h.finalize().toUint8Array())));
}

export function* args_as_ints(op_name: string, args: SExp){
  for(const arg of args.as_iter()){
    if(arg.pair || !arg.atom){
      throw new EvalError(`${op_name} requires int args`, arg);
    }
    yield t(arg.as_bigint(), arg.atom.length);
  }
}

export function* args_as_int32(op_name: string, args: SExp){
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

export function args_as_int_list(op_name: string, args: SExp, count: number){
  const int_list = list(args_as_ints(op_name, args));
  
  if(int_list.length !== count){
    const plural = count !== 1 ? "s" : "";
    throw new EvalError(`${op_name} takes exactly ${count} argument${plural}`, args);
  }
  return int_list;
}

export function* args_as_bools(op_name: string, args: SExp){
  for(const arg of args.as_iter()){
    const v = arg.atom;
    if(v?.equal_to(Bytes.NULL)){
      yield SExp.FALSE;
    }
    else{
      yield SExp.TRUE;
    }
  }
}

export function args_as_bool_list(op_name: string, args: SExp, count: number){
  const bool_list = list(args_as_bools(op_name, args));
  
  if(bool_list.length !== count){
    const plural = count !== 1 ? "s" : "";
    throw new EvalError(`${op_name} takes exactly ${count} argument${plural}`, args);
  }
  return bool_list;
}

export function op_add(args: SExp){
  let total = BigInt(0);
  let cost = ARITH_BASE_COST;
  let arg_size = 0;
  
  for(const ints of args_as_ints("+", args)){
    const [r, l] = ints as [bigint, number];
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
  
  let sign = BigInt(1);
  let total = BigInt(0);
  let arg_size = 0;
  for(const ints of args_as_ints("-", args)){
    const [r, l] = ints as [bigint, number];
    total += sign * r;
    sign = BigInt(-1);
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
  let [v, vs] = res.value as [bigint, number];
  
  for(const o of operands){
    const [r, rs] = o as [bigint, number];
    cost += MUL_COST_PER_OP;
    cost += (rs + vs) * MUL_LINEAR_COST_PER_BYTE;
    cost += ((rs * vs) / MUL_SQUARE_COST_PER_BYTE_DIVIDER) | 0;
    v = v * r;
    vs = limbs_for_int(v);
  }
  return malloc_cost(cost, SExp.to(v));
}

export function op_divmod(args: SExp){
  let cost = DIVMOD_BASE_COST;
  const [t1, t2] = args_as_int_list("divmod", args, 2);
  const [i0, l0] = t1 as [bigint, number];
  const [i1, l1] = t2 as [bigint, number];
  if(i1 === BigInt(0)){
    throw new EvalError("divmod with 0", SExp.to(i0));
  }
  cost += (l0+l1)*DIVMOD_COST_PER_BYTE;
  const q = division(i0, i1); // i0 / i1
  const r = modulo(i0, i1); // i0 % i1
  const q1 = SExp.to(q);
  const r1 = SExp.to(r);
  cost += ((q1.atom as Bytes).length + (r1.atom as Bytes).length) * MALLOC_COST_PER_BYTE;
  return t(cost, SExp.to(t(q, r)));
}

export function op_div(args: SExp){
  let cost = DIV_BASE_COST;
  const [t1, t2] = args_as_int_list("/", args, 2);
  const [i0, l0] = t1 as [bigint, number];
  const [i1, l1] = t2 as [bigint, number];
  if(i1 === BigInt(0)){
    throw new EvalError("div with 0", SExp.to(i0));
  }
  cost += (l0+l1)*DIV_COST_PER_BYTE;
  const q = division(i0, i1); // i0 / i1
  return malloc_cost(cost, SExp.to(q));
}

export function op_gr(args: SExp){
  const [t1, t2] = args_as_int_list(">", args, 2);
  const [i0, l0] = t1 as [bigint, number];
  const [i1, l1] = t2 as [bigint, number];
  let cost = GR_BASE_COST;
  cost += (l0+l1)*GR_COST_PER_BYTE;
  return t(cost, i0 > i1 ? SExp.TRUE : SExp.FALSE);
}

export function op_gr_bytes(args: SExp){
  const arg_list = list(args.as_iter());
  if(arg_list.length !== 2){
    throw new EvalError(">s takes exactly 2 arguments", args);
  }
  const [a0, a1] = arg_list;
  if(a0.pair || a1.pair){
    throw new EvalError(">s on list", a0.pair ? a0 : a1);
  }
  const b0 = a0.atom as Bytes;
  const b1 = a1.atom as Bytes;
  let cost = GRS_BASE_COST;
  cost += (b0.length + b1.length) * GRS_COST_PER_BYTE;
  return t(cost, b0.compare(b1) > 0/* b0 > b1 */ ? SExp.TRUE : SExp.FALSE);
}

export function op_pubkey_for_exp(args: SExp){
  const t0 = args_as_int_list("pubkey_for_exp", args, 1)[0] as [bigint, number];
  let i0 = t0[0];
  const l0 = t0[1];
  i0 = modulo(i0, BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")); // i0 % BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")
  const {PrivateKey} = getBLSModule();
  const bytes = new Uint8Array(32);
  const u0 =bigint_to_bytes(i0, {signed: false}).raw();
  if(u0.length > 0){
    bytes.set(u0, 32 - u0.length);
  }
  const exponent = PrivateKey.from_bytes(bytes, false);
  try{
    const r = SExp.to(Bytes.from(exponent.get_g1(), "G1Element"));
    let cost = PUBKEY_BASE_COST;
    cost += l0 * PUBKEY_COST_PER_BYTE;
    return malloc_cost(cost, r);
  }
  catch(e){
    throw new EvalError(`problem in op_pubkey_for_exp: ${e}`, args);
  }
}

export function op_point_add(items: SExp){
  let cost = POINT_ADD_BASE_COST;
  const {G1Element} = getBLSModule();
  let p = new G1Element();
  
  for(const _ of items.as_iter()){
    if(!isAtom(_)){
      throw new EvalError("point_add on list", _);
    }
    try{
      const atom_g1 = G1Element_from_bytes(_.atom.raw());
      p = G1Element_add(p, atom_g1);
      cost += POINT_ADD_COST_PER_ARG;
    }
    catch(e){
      throw new EvalError(`point_add expects blob, got ${_.atom}: ${JSON.stringify(e)}`, items);
    }
  }
  return malloc_cost(cost, SExp.to(p));
}

export function op_strlen(args: SExp){
  if(args.list_len() !== 1){
    throw new EvalError("strlen takes exactly 1 argument", args);
  }
  const a0 = args.first();
  if(!isAtom(a0)){
    throw new EvalError("strlen on list", a0);
  }
  const size = a0.atom.length;
  const cost = STRLEN_BASE_COST + size*STRLEN_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(size));
}

export function op_substr(args: SExp){
  const arg_count = args.list_len();
  if(![2,3].includes(arg_count)){
    throw new EvalError("substr takes exactly 2 or 3 arguments", args);
  }
  const a0 = args.first();
  if(!isAtom(a0)){
    throw new EvalError("substr on list", a0);
  }
  
  const s0 = a0.atom;
  let i1;
  let i2;
  if(arg_count === 2){
    i1 = args_as_int32("substr", args.rest()).next().value as number;
    i2 = s0.length;
  }
  else{
    const ints: number[] = [];
    for(const i of args_as_int32("substr", args.rest())){
      ints.push(i);
    }
    ([i1, i2] = ints);
  }
  
  if(i2 > s0.length || i2 < i1 || i2 < 0 || i1 < 0){
    throw new EvalError("invalid indices for substr", args);
  }
  
  const s = s0.subarray(i1, i2);
  const cost = 1;
  return t(cost, SExp.to(s));
}

export function op_concat(args: SExp){
  let cost = CONCAT_BASE_COST;
  const s = new Stream();
  for(const arg of args.as_iter()){
    if(!isAtom(arg)){
      throw new EvalError("concat on list", arg);
    }
    s.write(arg.atom);
    cost += CONCAT_COST_PER_ARG;
  }
  const r = s.getValue();
  cost += r.length * CONCAT_COST_PER_BYTE;
  return malloc_cost(cost,  SExp.to(r));
}

export function op_ash(args: SExp){
  const [t1, t2] = args_as_int_list("ash", args, 2);
  const [i0, l0] = t1 as [bigint, number];
  const [i1, l1] = t2 as [bigint, number];
  if(l1 > 4){
    throw new EvalError("ash requires int32 args (with no leading zeros)", args.rest().first());
  }
  else if((i1 >= BigInt(0) ? i1 : -i1) > BigInt(65535)){
    throw new EvalError("shift too large", SExp.to(i1));
  }
  let r;
  if(i1 >= 0){
    r = i0 << i1;
  }
  else{
    r = i0 >> -i1;
  }
  let cost = ASHIFT_BASE_COST;
  cost += (l0 + limbs_for_int(r)) * ASHIFT_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(r));
}

export function op_lsh(args: SExp){
  const [t1, t2] = args_as_int_list("lsh", args, 2);
  const l0 = t1[1] as number;
  const [i1, l1] = t2 as [bigint, number];
  if(l1 > 4){
    throw new EvalError("lsh requires int32 args (with no leading zeros)", args.rest().first());
  }
  else if((i1 >= BigInt(0) ? i1 : -i1) > BigInt(65535)){
    throw new EvalError("shift too large", SExp.to(i1));
  }
  // we actually want i0 to be an *unsigned* int
  const a0 = args.first().atom;
  const i0 = bigint_from_bytes(a0, {signed: false});
  let r;
  if(i1 >= 0){
    r = i0 << i1;
  }
  else{
    r = i0 >> -i1;
  }
  let cost = LSHIFT_BASE_COST;
  cost += (l0 + limbs_for_int(r)) * LSHIFT_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(r));
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function binop_reduction(op_name: string, initial_value: bigint, args: SExp, op_f: (a: bigint, b: bigint) => bigint){
  let total = initial_value;
  let arg_size = 0;
  let cost = LOG_BASE_COST;
  for(const t of args_as_ints(op_name, args)){
    const [r, l] = t as [bigint, number];
    total = op_f(total, r);
    arg_size += l;
    cost += LOG_COST_PER_ARG;
  }
  cost += arg_size * LOG_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(total));
}

export function op_logand(args: SExp){
  const binop = (a: bigint, b: bigint) => {
    a &= b;
    return a;
  }
  
  return binop_reduction("logand", BigInt(-1), args, binop);
}

export function op_logior(args: SExp){
  const binop = (a: bigint, b: bigint) => {
    a |= b;
    return a;
  }
  
  return binop_reduction("logior", BigInt(0), args, binop);
}

export function op_logxor(args: SExp){
  const binop = (a: bigint, b: bigint) => {
    a ^= b;
    return a;
  }
  
  return binop_reduction("logxor", BigInt(0), args, binop);
}

export function op_lognot(args: SExp){
  const t = args_as_int_list("lognot", args, 1);
  const [i0, l0] = t[0] as [bigint, number];
  const cost = LOGNOT_BASE_COST + l0 * LOGNOT_COST_PER_BYTE;
  return malloc_cost(cost, SExp.to(~i0));
}

export function op_not(args: SExp){
  const boolList = args_as_bool_list("not", args, 1);
  const i0 = boolList[0];
  if(!isAtom(i0)){
    throw new EvalError("not on list", args);
  }
  let r;
  if(i0.atom.equal_to(Bytes.NULL)){
    r = SExp.TRUE;
  }
  else{
    r = SExp.FALSE;
  }
  return t(BOOL_BASE_COST, SExp.to(r));
}

export function op_any(args: SExp){
  const items = list(args_as_bools("any", args));
  const cost = BOOL_BASE_COST + items.length * BOOL_COST_PER_ARG;
  let r = SExp.FALSE;
  for(const v of items){
    if(!isAtom(v)){
      throw new EvalError("any on list", args);
    }
    if(!v.atom.equal_to(Bytes.NULL)){
      r = SExp.TRUE;
      break;
    }
  }
  return t(cost, SExp.to(r));
}

export function op_all(args: SExp){
  const items = list(args_as_bools("all", args));
  const cost = BOOL_BASE_COST + items.length * BOOL_COST_PER_ARG;
  let r = SExp.TRUE;
  for(const v of items){
    if(!isAtom(v)){
      throw new EvalError("all on list", args);
    }
    if(v.atom.equal_to(Bytes.NULL)){
      r = SExp.FALSE;
      break;
    }
  }
  return t(cost, SExp.to(r));
}

export function op_softfork(args: SExp){
  if(args.list_len() < 1){
    throw new EvalError("softfork takes at least 1 argument", args);
  }
  const a = args.first();
  if(!isAtom(a)){
    throw new EvalError("softfork requires int args", a);
  }
  const cost = a.as_int();
  if(cost < 1){
    throw new EvalError("cost must be > 0", args);
  }
  return t(cost, SExp.FALSE);
}
