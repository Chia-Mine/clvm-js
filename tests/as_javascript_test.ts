import {SExp, t, h, b, Bytes, getBLSModule, initialize, None, Tuple, list} from "../src";
import {CLVMObject} from "../src/CLVMObject";
import {EvalError} from "../src/EvalError";
import type {ModuleInstance} from "@chiamine/bls-signatures";

let BLS: ModuleInstance;

class dummy_class {
  i: number;
  
  constructor() {
    this.i = 0;
  }
}

function gen_tree(depth: number): SExp {
  if(depth === 0){
    return SExp.to(1337);
  }
  const subtree = gen_tree(depth - 1);
  return SExp.to(t(subtree, subtree));
}

const fh = h;
const H01 = fh("01");
const H02 = fh("02");



function check_as_javascript(p: any){
  const v = SExp.to(p);
  const p1 = v.as_javascript();
  expect(p).toEqual(p1);
}

beforeAll(async () => {
  await initialize();
  BLS = getBLSModule();
});

test("test_null", () => {
  check_as_javascript(b(""));
});

test("test_single_bytes", () => {
  for(let _=0;_<256;_++){
    check_as_javascript(Bytes.from([_]));
  }
});

test("test_short_lists", () => {
  check_as_javascript(b(""));
  for(let _=0;_<256;_++){
    check_as_javascript(Bytes.from([_]));
  }
});

test("test_int", () => {
  const v = SExp.to(42);
  expect(v.atom?.equal_to(Bytes.from([42]))).toBeTruthy();
});

test("test_none", () => {
  const v = SExp.to(None);
  expect(v.atom?.equal_to(b(""))).toBeTruthy();
});

test("test_empty_list", () => {
  const v = SExp.to([]);
  expect(v.atom?.equal_to(b(""))).toBeTruthy();
});

test("test_list_of_one", () => {
  const v = SExp.to([1]);
  expect((v.pair as any)[0] instanceof CLVMObject).toBeTruthy();
  expect((v.pair as any)[1] instanceof CLVMObject).toBeTruthy();
  expect((v.as_pair() as any)[0] instanceof SExp).toBeTruthy();
  expect((v.as_pair() as any)[1] instanceof SExp).toBeTruthy();
  expect((v.pair as any)[0].atom.equal_to(h("01"))).toBeTruthy();
  expect((v.pair as any)[1].atom.equal_to(b(""))).toBeTruthy();
});

test("test_g1element", () => {
  const b = fh(
    "b3b8ac537f4fd6bde9b26221d49b54b17a506be147347dae5"
    + "d081c0a6572b611d8484e338f3432971a9823976c6a232b"
  );
  const v = SExp.to(BLS.G1Element.from_bytes(b.raw()));
  expect(v.atom?.equal_to(b)).toBeTruthy();
});

test("test_complex", () => {
  check_as_javascript(t(b(""), b("foo")));
  check_as_javascript(t(b(""), b("1")));
  check_as_javascript([b("2"), t(b(""), b("1"))]);
  check_as_javascript([b(""), b("2"), t(b(""), b("1"))]);
  check_as_javascript(
    [b(""), b("1"), b("2"), [b("30"), b("40"), b("90")], b("600"), t(b(""), b("18"))]
  );
});

test("test_listp", () => {
  expect(SExp.to(42).listp()).toBeFalsy();
  expect(SExp.to(b("")).listp()).toBeFalsy();
  expect(SExp.to(b("1337")).listp()).toBeFalsy();
  
  expect(SExp.to(t(1337, 42)).listp()).toBeTruthy();
  expect(SExp.to([1337, 42]).listp()).toBeTruthy();
});

test("test_nullp", () => {
  expect(SExp.to(b("")).nullp()).toBeTruthy();
  expect(SExp.to(b("1337")).nullp()).toBeFalsy();
  expect(SExp.to(t(b(""), b(""))).nullp()).toBeFalsy();
});

test("test_constants", () => {
  expect(SExp.__NULL__.nullp()).toBeTruthy();
  expect(SExp.null().nullp()).toBeTruthy();
  expect(SExp.TRUE.equal_to(true as any)).toBeTruthy();
  expect(SExp.FALSE.equal_to(false as any)).toBeTruthy();
});

test("test_list_len", () => {
  let v = SExp.to(42);
  for(let i=0;i<100;i++){
    expect(v.list_len()).toBe(i);
    v = SExp.to(t(42, v));
  }
  expect(v.list_len()).toBe(100);
});

test("test_list_len_atom", () => {
  const v = SExp.to(42);
  expect(v.list_len()).toBe(0);
});

test("test_as_int", () => {
  expect(SExp.to(fh("80")).as_int()).toBe(-128);
  expect(SExp.to(fh("ff")).as_int()).toBe(-1);
  expect(SExp.to(fh("0080")).as_int()).toBe(128);
  expect(SExp.to(fh("00ff")).as_int()).toBe(255);
});

test("test_cons", () => {
  // list
  expect(
    SExp.to(H01).cons(SExp.to(H02).cons(SExp.null())).as_javascript(),
  ).toEqual([H01, H02]);
  // cons-box of two values
  expect(SExp.to(H01).cons(SExp.to(H02).as_javascript()).equal_to(t(H01, H02))).toBeTruthy();
});

test("test_string", () => {
  expect(SExp.to("foobar").atom?.equal_to(b("foobar"))).toBeTruthy();
});

test("test_deep_recursion", () => {
  let d = b("2") as any;
  for(let i=0;i<1000;i++){
    d = [d];
  }
  let v = SExp.to(d);
  for(let i=0;i<1000;i++){
    expect((((v.as_pair() as any)[1]).atom as SExp).equal_to(SExp.null())).toBeTruthy();
    v = (v.as_pair() as any)[0];
    d = d[0];
  }
  
  expect(v.atom?.equal_to(b("2")));
  expect(d.equal_to(b("2")));
});

test("test_long_linked_list", () => {
  let d = b("") as any;
  for(let i=0;i<1000;i++){
    d = t(b("2"), d);
  }
  let v = SExp.to(d);
  for(let i=0;i<1000;i++){
    expect((v.as_pair() as any)[0].atom.equal_to(d[0])).toBeTruthy();
    v = (v.as_pair() as any)[1];
    d = d[1];
  }
  
  expect(v.atom?.equal_to(SExp.null())).toBeTruthy();
  expect(d.equal_to(b(""))).toBeTruthy();
});

test("test_long_list", () => {
  const d = [...new Array(1000)].map(() => 1337);
  let v = SExp.to(d);
  for(let i=0;i<(1000-1);i++){
    expect((v.as_pair() as Tuple<SExp, SExp>)[0].as_int()).toBe(d[i]);
    v = (v.as_pair() as Tuple<SExp, unknown>)[1];
  }
  
  // expect(v.atom?.equal_to(SExp.null())).toBeTruthy(); // v.atom is `None`. In javascript, None is just a null and not implement `equal_to` function
  expect(SExp.null().equal_to(v.atom)).toBeTruthy();
});

test("test_invalid_type", () => {
  expect(() => {
    const s = SExp.to(dummy_class as any);
    // conversions are deferred, this is where it will fail:
    const b = list(s.as_iter());
    console.log(b);
  }).toThrowError(Error);
});

test("test_invalid_tuple", () => {
  expect(() => {
    const s = SExp.to(t(dummy_class, dummy_class));
    // conversions are deferred, this is where it will fail:
    const b = list(s.as_iter());
  }).toThrowError(Error);
  
  expect(() => {
    const s = SExp.to(t(dummy_class, dummy_class));
  }).toThrowError(Error);
});

test("test_clvm_object_tuple", () => {
  const o1 = new CLVMObject(b("foo"));
  const o2 = new CLVMObject(b("bar"));
  expect(SExp.to(t(o1, o2)).equal_to(t(o1, o2))).toBeTruthy();
});

test("test_first", () => {
  let val = SExp.to(1);
  expect(() => val.first()).toThrowError(EvalError);
  val = SExp.to(t(42, val));
  expect(val.first().equal_to(SExp.to(42)));
});

test("test_rest", () => {
  let val = SExp.to(1);
  expect(() => val.rest()).toThrowError(EvalError);
  val = SExp.to(t(42, val));
  expect(val.rest().equal_to(SExp.to(1)));
});

test("test_as_iter", () => {
  function assertArrayEqual(subject: any[], expected: any[]){
    expect(subject.length).toBe(expected.length);
    expect(subject.every((v, i) => v.equal_to(expected[i]))).toBeTruthy();
  }
  
  let val = list(SExp.to(t(1, t(2, t(3, t(4, b("")))))).as_iter());
  assertArrayEqual(val, [1,2,3,4]);
  
  val = list(SExp.to(b("")).as_iter());
  assertArrayEqual(val, []);
  
  val = list(SExp.to(t(1, b(""))).as_iter());
  assertArrayEqual(val, [1]);
  
  // these fail because the lists are not null-terminated
  expect(() => list(SExp.to(1).as_iter())).toThrowError(EvalError);
  expect(() => {
    list(SExp.to(t(1, t(2, t(3, t(4, 5))))).as_iter());
  }).toThrowError(EvalError);
});

test("test_eq", () => {
  const val = SExp.to(1);
  
  expect(val.equal_to(1)).toBeTruthy();
  expect(val.equal_to(2)).toBeFalsy();
  
  // mismatching types
  expect(val.equal_to([1])).toBeFalsy();
  expect(val.equal_to([1, 2])).toBeFalsy();
  expect(val.equal_to(t(1, 2))).toBeFalsy();
  expect(val.equal_to(t(dummy_class, dummy_class))).toBeFalsy();
});

test("test_eq_tree", () => {
  const val1 = gen_tree(2);
  const val2 = gen_tree(2);
  const val3 = gen_tree(3);
  
  expect(val1.equal_to(val2)).toBeTruthy();
  expect(val2.equal_to(val1)).toBeTruthy();
  expect(val1.equal_to(val3)).toBeFalsy();
  expect(val3.equal_to(val1)).toBeFalsy();
});

test("test_str", () => {
  expect(SExp.to(1).toString()).toBe("01");
  expect(SExp.to(1337).toString()).toBe("820539");
  expect(SExp.to(-1).toString()).toBe("81ff");
  expect(SExp.to(gen_tree(1)).toString()).toBe("ff820539820539");
  expect(SExp.to(gen_tree(2)).toString()).toBe("ffff820539820539ff820539820539");
});

test("test_repr", () => {
  expect(SExp.to(1).__repr__()).toBe("SExp(01)");
  expect(SExp.to(1337).__repr__()).toBe("SExp(820539)");
  expect(SExp.to(-1).__repr__()).toBe("SExp(81ff)");
  expect(SExp.to(gen_tree(1)).__repr__()).toBe("SExp(ff820539820539)");
  expect(SExp.to(gen_tree(2)).__repr__()).toBe("SExp(ffff820539820539ff820539820539)");
});
