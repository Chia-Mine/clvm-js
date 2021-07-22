import {OPERATOR_LOOKUP, KEYWORD_TO_ATOM, default_unknown_op, OperatorDict} from "../src/operators";
import {EvalError} from "../src/EvalError";
import {Bytes, SExp, t, b, h} from "../src";
import {CONCAT_BASE_COST} from "../src/costs";

let handler_called = false;

function unknown_handler(name: Bytes, args: SExp){
  handler_called = true;
  expect(name.equal_to(h("0xffff").concat(b("1337")))).toBeTruthy();
  expect(args.equal_to(SExp.to(1337))).toBeTruthy();
  return t(42, SExp.to(b("foobar")));
}

test("test_unknown_op", () => {
  expect(() => {
    OPERATOR_LOOKUP(h("0xffff").concat(b("1337")), SExp.to(1337))
  }).toThrowError(EvalError);
  const od = OperatorDict(OPERATOR_LOOKUP, {unknown_op_handler: (name, args) => unknown_handler(name, args)});
  const [cost, ret] = od(h("0xffff").concat(b("1337")), SExp.to(1337));
  expect(handler_called).toBeTruthy();
  expect(cost).toBe(42);
  expect(ret.equal_to(SExp.to(b("foobar"))));
});

test("test_plus", () => {
  console.log(OPERATOR_LOOKUP);
  expect(OPERATOR_LOOKUP(KEYWORD_TO_ATOM["+"], SExp.to([3,4,5]))[1].equal_to(SExp.to(12))).toBeTruthy();
});

test("test_unknown_op_reserved", () => {
  // any op that starts with ffff is reserved, and results in a hard
  // failure
  expect(() => {
    default_unknown_op(h("0xffff"), SExp.null());
  }).toThrowError(EvalError);
  
  for(const suffix of [h("ff"), b("0"), h("00"), h("ccccfeedface")]){
    expect(() => {
      default_unknown_op(h("ffff").concat(suffix), SExp.null());
    }).toThrowError(EvalError);
  }
  
  expect(() => {
    // an empty atom is not a valid opcode
    expect(default_unknown_op(b(""), SExp.null())).toEqual(t(1, SExp.null()));
  }).toThrowError(EvalError);
  
  // a single ff is not sufficient to be treated as a reserved opcode
  expect(default_unknown_op(h("ff"), SExp.null())).toEqual(t(CONCAT_BASE_COST, SExp.null()));
  
  // leading zeroes count, and this does not count as a ffff-prefix
  // the cost is 0xffff00 = 16776960
  expect(default_unknown_op(h("00ffff0000"), SExp.null())).toEqual(t(16776961, SExp.null()));
});

test("test_unknown_ops_last_bits", () => {
  // The last byte is ignored for no-op unknown ops
  for(const suffix of [h("3f"), h("0f"), h("00"), h("2c")]){
    // the cost is unchanged by the last byte
    expect(default_unknown_op(h("3c").concat(suffix), SExp.null())).toEqual(t(61, SExp.null()));
  }
});
