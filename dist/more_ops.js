"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.op_softfork = exports.op_all = exports.op_any = exports.op_not = exports.op_lognot = exports.op_logxor = exports.op_logior = exports.op_logand = exports.binop_reduction = exports.op_lsh = exports.op_ash = exports.op_concat = exports.op_substr = exports.op_strlen = exports.op_pubkey_for_exp = exports.op_gr_bytes = exports.op_gr = exports.op_div = exports.op_divmod = exports.op_multiply = exports.op_subtract = exports.op_add = exports.args_as_bool_list = exports.args_as_bools = exports.args_as_int_list = exports.args_as_int32 = exports.args_as_ints = exports.op_sha256 = exports.malloc_cost = void 0;
const SHA256_1 = require("jscrypto/SHA256");
const SExp_1 = require("./SExp");
const costs_1 = require("./costs");
const __type_compatibility__1 = require("./__type_compatibility__");
const EvalError_1 = require("./EvalError");
const casts_1 = require("./casts");
const CLVMObject_1 = require("./CLVMObject");
const __bls_signatures__1 = require("./__bls_signatures__");
function malloc_cost(cost, atom) {
    if (!atom.atom) {
        throw new EvalError_1.EvalError("atom is None", atom);
    }
    return __type_compatibility__1.t(cost + atom.atom.length * costs_1.MALLOC_COST_PER_BYTE, atom);
}
exports.malloc_cost = malloc_cost;
function op_sha256(args) {
    let cost = costs_1.SHA256_BASE_COST;
    let arg_len = 0;
    const h = new SHA256_1.SHA256();
    for (const _ of args.as_iter()) {
        const atom = _.atom;
        if (!atom) {
            throw new EvalError_1.EvalError("sha256 on list", _);
        }
        arg_len += atom.length;
        cost += costs_1.SHA256_COST_PER_ARG;
        h.update(atom.as_word());
    }
    cost += arg_len * costs_1.SHA256_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(__type_compatibility__1.Bytes.from(h.finalize())));
}
exports.op_sha256 = op_sha256;
function* args_as_ints(op_name, args) {
    for (const arg of args.as_iter()) {
        if (arg.pair || !arg.atom) {
            throw new EvalError_1.EvalError(`${op_name} requires int args`, arg);
        }
        yield __type_compatibility__1.t(arg.as_int(), arg.atom.length);
    }
}
exports.args_as_ints = args_as_ints;
function* args_as_int32(op_name, args) {
    for (const arg of args.as_iter()) {
        if (arg.pair || !arg.atom) {
            throw new EvalError_1.EvalError(`${op_name} requires int32 args`, arg);
        }
        else if (arg.atom.length > 4) {
            throw new EvalError_1.EvalError(`${op_name} requires int32 args (with no leading zeros`, arg);
        }
        yield arg.as_int();
    }
}
exports.args_as_int32 = args_as_int32;
function args_as_int_list(op_name, args, count) {
    const int_list = [];
    for (const _ of args_as_ints(op_name, args))
        int_list.push(_);
    if (int_list.length !== count) {
        const plural = count !== 1 ? "s" : "";
        throw new EvalError_1.EvalError(`${op_name} takes exactly ${count} argument${plural}`, args);
    }
    return int_list;
}
exports.args_as_int_list = args_as_int_list;
function* args_as_bools(op_name, args) {
    for (const arg of args.as_iter()) {
        const v = arg.atom;
        if (v === null || v === void 0 ? void 0 : v.equal_to(__type_compatibility__1.Bytes.NULL)) {
            yield SExp_1.SExp.FALSE;
        }
        else {
            yield SExp_1.SExp.TRUE;
        }
    }
}
exports.args_as_bools = args_as_bools;
function args_as_bool_list(op_name, args, count) {
    const bool_list = [];
    for (const _ of args_as_bools(op_name, args))
        bool_list.push(_);
    if (bool_list.length !== count) {
        const plural = count !== 1 ? "s" : "";
        throw new EvalError_1.EvalError(`${op_name} takes exactly ${count} argument${plural}`, args);
    }
    return bool_list;
}
exports.args_as_bool_list = args_as_bool_list;
function op_add(args) {
    let total = 0;
    let cost = costs_1.ARITH_BASE_COST;
    let arg_size = 0;
    for (const ints of args_as_ints("+", args)) {
        const [r, l] = ints;
        total += r;
        arg_size += l;
        cost += costs_1.ARITH_COST_PER_ARG;
    }
    cost += arg_size * costs_1.ARITH_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(total));
}
exports.op_add = op_add;
function op_subtract(args) {
    let cost = costs_1.ARITH_BASE_COST;
    if (args.nullp()) {
        return malloc_cost(cost, SExp_1.SExp.to(0));
    }
    let sign = 1;
    let total = 0;
    let arg_size = 0;
    for (const ints of args_as_ints("-", args)) {
        const [r, l] = ints;
        total += sign * r;
        sign = -1;
        arg_size += l;
        cost += costs_1.ARITH_COST_PER_BYTE;
    }
    cost += arg_size * costs_1.ARITH_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(total));
}
exports.op_subtract = op_subtract;
function op_multiply(args) {
    let cost = costs_1.MUL_BASE_COST;
    const operands = args_as_ints("*", args);
    const res = operands.next();
    if (res.done) {
        return malloc_cost(cost, SExp_1.SExp.to(1));
    }
    let [v, vs] = res.value;
    for (const o of operands) {
        const [r, rs] = o;
        cost += costs_1.MUL_COST_PER_OP;
        cost += (rs + vs) * costs_1.MUL_LINEAR_COST_PER_BYTE;
        cost += ((rs * vs) / costs_1.MUL_SQUARE_COST_PER_BYTE_DIVIDER) >> 0;
        v = v * r;
        vs = casts_1.limbs_for_int(v);
    }
    return malloc_cost(cost, SExp_1.SExp.to(v));
}
exports.op_multiply = op_multiply;
function op_divmod(args) {
    let cost = costs_1.DIVMOD_BASE_COST;
    const [t1, t2] = args_as_int_list("divmod", args, 2);
    const [i0, l0] = t1;
    const [i1, l1] = t2;
    if (i1 === 0) {
        throw new EvalError_1.EvalError("divmod with 0", SExp_1.SExp.to(i0));
    }
    cost += (l0 + l1) * costs_1.DIVMOD_COST_PER_BYTE;
    const q = (i0 / i1) >> 0;
    const r = i0 % i1;
    const q1 = SExp_1.SExp.to(q);
    const r1 = SExp_1.SExp.to(r);
    cost += (q1.atom.length + r1.atom.length) * costs_1.MALLOC_COST_PER_BYTE;
    return __type_compatibility__1.t(cost, SExp_1.SExp.to(__type_compatibility__1.t(q, r)));
}
exports.op_divmod = op_divmod;
function op_div(args) {
    let cost = costs_1.DIV_BASE_COST;
    const [t1, t2] = args_as_int_list("/", args, 2);
    const [i0, l0] = t1;
    const [i1, l1] = t2;
    if (i1 === 0) {
        throw new EvalError_1.EvalError("div with 0", SExp_1.SExp.to(i0));
    }
    cost += (l0 + l1) * costs_1.DIV_COST_PER_BYTE;
    const q = (i0 / i1) >> 0;
    return malloc_cost(cost, SExp_1.SExp.to(q));
}
exports.op_div = op_div;
function op_gr(args) {
    const [t1, t2] = args_as_int_list(">", args, 2);
    const [i0, l0] = t1;
    const [i1, l1] = t2;
    let cost = costs_1.GR_BASE_COST;
    cost += (l0 + l1) * costs_1.GR_COST_PER_BYTE;
    return __type_compatibility__1.t(cost, i0 > i1 ? SExp_1.SExp.TRUE : SExp_1.SExp.FALSE);
}
exports.op_gr = op_gr;
function op_gr_bytes(args) {
    const arg_list = [];
    for (const _ of args.as_iter())
        arg_list.push(_);
    if (arg_list.length !== 2) {
        throw new EvalError_1.EvalError(">s takes exactly 2 arguments", args);
    }
    const [a0, a1] = arg_list;
    if (a0.pair || a1.pair) {
        throw new EvalError_1.EvalError(">s on list", a0.pair ? a0 : a1);
    }
    const b0 = a0.atom;
    const b1 = a1.atom;
    let cost = costs_1.GRS_BASE_COST;
    cost += (b0.length + b1.length) * costs_1.GRS_COST_PER_BYTE;
    return __type_compatibility__1.t(cost, b0.compare(b1) > 0 /* b0 > b1 */ ? SExp_1.SExp.TRUE : SExp_1.SExp.FALSE);
}
exports.op_gr_bytes = op_gr_bytes;
function op_pubkey_for_exp(items) {
    let cost = costs_1.POINT_ADD_BASE_COST;
    const { G1Element } = __bls_signatures__1.getBLSModule();
    let p = new G1Element();
    for (const _ of items.as_iter()) {
        if (!CLVMObject_1.isAtom(_)) {
            throw new EvalError_1.EvalError("point_add on list", _);
        }
        try {
            const atom_g1 = __bls_signatures__1.G1Element_from_bytes(_.atom.data());
            p = __bls_signatures__1.G1Element_add(p, atom_g1);
            cost += costs_1.POINT_ADD_COST_PER_ARG;
        }
        catch (e) {
            throw new EvalError_1.EvalError(`point_add expects blob, got ${_.atom}: ${JSON.stringify(e)}`, items);
        }
    }
    return malloc_cost(cost, SExp_1.SExp.to(p));
}
exports.op_pubkey_for_exp = op_pubkey_for_exp;
function op_strlen(args) {
    if (args.list_len() !== 1) {
        throw new EvalError_1.EvalError("strlen takes exactly 1 argument", args);
    }
    const a0 = args.first();
    if (!CLVMObject_1.isAtom(a0)) {
        throw new EvalError_1.EvalError("strlen on list", a0);
    }
    const size = a0.atom.length;
    const cost = costs_1.STRLEN_BASE_COST + size * costs_1.STRLEN_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(size));
}
exports.op_strlen = op_strlen;
function op_substr(args) {
    const arg_count = args.list_len();
    if (![2, 3].includes(arg_count)) {
        throw new EvalError_1.EvalError("substr takes exactly 2 or 3 arguments", args);
    }
    const a0 = args.first();
    if (!CLVMObject_1.isAtom(a0)) {
        throw new EvalError_1.EvalError("substr on list", a0);
    }
    const s0 = a0.atom;
    let i1;
    let i2;
    if (arg_count === 2) {
        i1 = args_as_int32("substr", args.rest()).next().value;
        i2 = s0.length;
    }
    else {
        const ints = [];
        for (const i of args_as_int32("substr", args.rest())) {
            ints.push(i);
        }
        ([i1, i2] = ints);
    }
    if (i2 > s0.length || i2 < i1 || i2 < 0 || i1 < 0) {
        throw new EvalError_1.EvalError("invalid indices for substr", args);
    }
    const s = s0.slice(i1, i2);
    const cost = 1;
    return __type_compatibility__1.t(cost, SExp_1.SExp.to(s));
}
exports.op_substr = op_substr;
function op_concat(args) {
    let cost = costs_1.CONCAT_BASE_COST;
    const s = new __type_compatibility__1.Stream();
    for (const arg of args.as_iter()) {
        if (!CLVMObject_1.isAtom(arg)) {
            throw new EvalError_1.EvalError("concat on list", arg);
        }
        s.write(arg.atom);
        cost += costs_1.CONCAT_COST_PER_ARG;
    }
    const r = s.getValue();
    cost += r.length * costs_1.CONCAT_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(r));
}
exports.op_concat = op_concat;
function op_ash(args) {
    const [t1, t2] = args_as_int_list("ash", args, 2);
    const [i0, l0] = t1;
    const [i1, l1] = t2;
    if (l1 > 4) {
        throw new EvalError_1.EvalError("ash requires int32 args (with no leading zeros)", args.rest().first());
    }
    else if (Math.abs(i1) > 65535) {
        throw new EvalError_1.EvalError("shift too large", SExp_1.SExp.to(i1));
    }
    let r;
    if (i1 >= 0) {
        r = i0 << i1;
    }
    else {
        r = i0 >> -i1;
    }
    let cost = costs_1.ASHIFT_BASE_COST;
    cost += (l0 + casts_1.limbs_for_int(r)) * costs_1.ASHIFT_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(r));
}
exports.op_ash = op_ash;
function op_lsh(args) {
    const [t1, t2] = args_as_int_list("lsh", args, 2);
    const l0 = t1[1];
    const [i1, l1] = t2;
    if (l1 > 4) {
        throw new EvalError_1.EvalError("lsh requires int32 args (with no leading zeros)", args.rest().first());
    }
    else if (Math.abs(i1) > 65535) {
        throw new EvalError_1.EvalError("shift too large", SExp_1.SExp.to(i1));
    }
    // we actually want i0 to be an *unsigned* int
    const a0 = args.first().atom;
    const i0 = casts_1.int_from_bytes(a0);
    let r;
    if (i1 >= 0) {
        r = i0 << i1;
    }
    else {
        r = i0 >> -i1;
    }
    let cost = costs_1.LSHIFT_BASE_COST;
    cost += (l0 + casts_1.limbs_for_int(r)) * costs_1.LSHIFT_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(r));
}
exports.op_lsh = op_lsh;
// eslint-disable-next-line @typescript-eslint/ban-types
function binop_reduction(op_name, initial_value, args, op_f) {
    let total = initial_value;
    let arg_size = 0;
    let cost = costs_1.LOG_BASE_COST;
    for (const t of args_as_ints(op_name, args)) {
        const [r, l] = t;
        total = op_f(total, r);
        arg_size += l;
        cost += costs_1.LOG_COST_PER_ARG;
    }
    cost += arg_size * costs_1.LOG_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(total));
}
exports.binop_reduction = binop_reduction;
function op_logand(args) {
    const binop = (a, b) => {
        a &= b;
        return a;
    };
    return binop_reduction("logand", -1, args, binop);
}
exports.op_logand = op_logand;
function op_logior(args) {
    const binop = (a, b) => {
        a |= b;
        return a;
    };
    return binop_reduction("logior", 0, args, binop);
}
exports.op_logior = op_logior;
function op_logxor(args) {
    const binop = (a, b) => {
        a ^= b;
        return a;
    };
    return binop_reduction("logxor", 0, args, binop);
}
exports.op_logxor = op_logxor;
function op_lognot(args) {
    const t = args_as_int_list("lognot", args, 1);
    const [i0, l0] = t[0];
    const cost = costs_1.LOGNOT_BASE_COST + l0 * costs_1.LOGNOT_COST_PER_BYTE;
    return malloc_cost(cost, SExp_1.SExp.to(~i0));
}
exports.op_lognot = op_lognot;
function op_not(args) {
    const boolList = args_as_bool_list("not", args, 1);
    const i0 = boolList[0];
    if (!CLVMObject_1.isAtom(i0)) {
        throw new EvalError_1.EvalError("not on list", args);
    }
    let r;
    if (i0.atom.equal_to(__type_compatibility__1.Bytes.NULL)) {
        r = SExp_1.SExp.TRUE;
    }
    else {
        r = SExp_1.SExp.FALSE;
    }
    return __type_compatibility__1.t(costs_1.BOOL_BASE_COST, SExp_1.SExp.to(r));
}
exports.op_not = op_not;
function op_any(args) {
    const items = [];
    for (const _ of args_as_bools("any", args))
        items.push(_);
    const cost = costs_1.BOOL_BASE_COST + items.length * costs_1.BOOL_COST_PER_ARG;
    let r = SExp_1.SExp.FALSE;
    for (const v of items) {
        if (!CLVMObject_1.isAtom(v)) {
            throw new EvalError_1.EvalError("any on list", args);
        }
        if (!v.atom.equal_to(__type_compatibility__1.Bytes.NULL)) {
            r = SExp_1.SExp.TRUE;
            break;
        }
    }
    return __type_compatibility__1.t(cost, SExp_1.SExp.to(r));
}
exports.op_any = op_any;
function op_all(args) {
    const items = [];
    for (const _ of args_as_bools("all", args))
        items.push(_);
    const cost = costs_1.BOOL_BASE_COST + items.length * costs_1.BOOL_COST_PER_ARG;
    let r = SExp_1.SExp.TRUE;
    for (const v of items) {
        if (!CLVMObject_1.isAtom(v)) {
            throw new EvalError_1.EvalError("all on list", args);
        }
        if (v.atom.equal_to(__type_compatibility__1.Bytes.NULL)) {
            r = SExp_1.SExp.FALSE;
            break;
        }
    }
    return __type_compatibility__1.t(cost, SExp_1.SExp.to(r));
}
exports.op_all = op_all;
function op_softfork(args) {
    if (args.list_len() < 1) {
        throw new EvalError_1.EvalError("softfork takes at least 1 argument", args);
    }
    const a = args.first();
    if (!CLVMObject_1.isAtom(a)) {
        throw new EvalError_1.EvalError("softfork requires int args", a);
    }
    const cost = a.as_int();
    if (cost < 1) {
        throw new EvalError_1.EvalError("cost must be > 0", args);
    }
    return __type_compatibility__1.t(cost, SExp_1.SExp.FALSE);
}
exports.op_softfork = op_softfork;
