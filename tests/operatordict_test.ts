import {OperatorDict} from "../src/operators";

test("test_operatordict_constructor", () => {
  /*
  Constructing should fail if quote or apply are not specified,
  either by object property or by keyword argument.
  Note that they cannot be specified in the operator dictionary itself.
   */
  const d = {1: "hello", 2: "goodbye"};
  expect(() => OperatorDict(d as any)).toThrow();
  expect(() => OperatorDict(d as any, {apply_atom: 1 as any})).toThrow();
  expect(() => OperatorDict(d as any, {quote_atom: 1 as any})).toThrow();
  const o = OperatorDict(d as any, {apply_atom: 1 as any, quote_atom: 2 as any});
  console.log(o);
  
  // Why does the constructed Operator dict contain entries for "apply":1 and "quote":2 ?
  // assert d == o
  expect(o.apply_atom).toBe(1);
  expect(o.quote_atom).toBe(2);
  
  // Test construction from an already existing OperatorDict
  const o2 = OperatorDict(o as any);
  expect(o2.apply_atom).toBe(1);
  expect(o2.quote_atom).toBe(2);
});
