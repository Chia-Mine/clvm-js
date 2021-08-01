import {SExp, looks_like_clvm_object, convert_atom_to_bytes, isSExp} from "../src/SExp";
import {CLVMObject, CLVMType} from "../src/CLVMObject";
import {isBytes, isTuple, Tuple, b, Bytes, t} from "../src/__type_compatibility__";
import {None} from "../src/__python_types__";

function validate_sexp(sexp: SExp){
  const validate_stack = [sexp];
  while(validate_stack.length){
    const v = validate_stack.pop() as SExp;
    expect(isSExp(v)).toBeTruthy();
    if(v.pair){
      expect(isTuple(v.pair)).toBeTruthy();
      const [v1, v2] = v.pair;
      expect(looks_like_clvm_object(v1)).toBeTruthy();
      expect(looks_like_clvm_object(v2)).toBeTruthy();
      const [s1, s2] = v.as_pair() as Tuple<SExp, SExp>;
      validate_stack.push(s1);
      validate_stack.push(s2);
    }
    else{
      expect(isBytes(v.atom)).toBeTruthy();
    }
  }
}

function print_leaves(tree: SExp): string {
  const a = tree.atom;
  if(a !== None){
    if(a.length === 0){
      return "() ";
    }
    return `${a.at(0)} `;
  }
  
  let ret = "";
  for(const i of tree.as_pair() as Tuple<SExp, SExp>){
    ret = ret + print_leaves(i);
  }
  return ret;
}

function print_tree(tree: SExp): string {
  const a = tree.atom;
  if(a !== None){
    if(a.length === 0){
      return "() ";
    }
    return `${a.at(0)} `;
  }
  
  let ret = "(";
  for(const i of tree.as_pair() as Tuple<SExp, SExp>){
    ret = ret + print_tree(i);
  }
  ret += ")";
  return ret;
}

test("test_cast_1", () => {
  // this was a problem in `clvm_tools` and is included
  // to prevent regressions
  const sexp = SExp.to(b("foo"));
  const t1 = SExp.to([1, sexp]);
  validate_sexp(t1);
});

test("test_wrap_sexp", () => {
  // it's a bit of a layer violation that CLVMObject unwraps SExp, but we
  // rely on that in a fair number of places for now. We should probably
  // work towards phasing that out
  const o = new CLVMObject(SExp.to(1));
  expect(o.atom?.equal_to(Bytes.from([1]))).toBeTruthy();
});

test("test_arbitrary_underlying_tree", () => {
  // SExp provides a view on top of a tree of arbitrary types, as long as
  // those types implement the CLVMObject protocol. This is an example of
  // a tree that's generated
  class GeneratedTree implements CLVMType {
    depth = 4;
    val = 0;
    
    public constructor(depth: number, val: number) {
      expect(depth).toBeGreaterThanOrEqual(0);
      this.depth = depth;
      this.val = val;
    }
    
    public get atom(){
      if(this.depth > 0){
        return None;
      }
      return Bytes.from([this.val]);
    }
    
    public get pair(){
      if(this.depth === 0){
        return None;
      }
      const new_depth = this.depth - 1;
      return  t(new GeneratedTree(new_depth, this.val), new GeneratedTree(new_depth, this.val + 2**new_depth));
    }
  }
  
  let tree = SExp.to(new GeneratedTree(5, 0));
  expect(print_leaves(tree)).toBe("0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 " +
    "16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 ");
  
  tree = SExp.to(new GeneratedTree(3, 0));
  expect(print_leaves(tree)).toBe("0 1 2 3 4 5 6 7 ");
  
  tree = SExp.to(new GeneratedTree(3, 10));
  expect(print_leaves(tree)).toBe("10 11 12 13 14 15 16 17 ");
});

test("test_looks_like_clvm_object", () => {
  // this function can't look at the values, that would cause a cascade of
  // eager evaluation/conversion
  class dummy {}
  
  let obj = new dummy() as any;
  obj.pair = None;
  obj.atom = None;
  // console.log(obj);
  expect(looks_like_clvm_object(obj)).toBeTruthy();
  
  obj = new dummy();
  obj.pair = None;
  expect(looks_like_clvm_object(obj)).toBeFalsy();
  
  obj = new dummy();
  obj.atom = None;
  expect(looks_like_clvm_object(obj)).toBeFalsy();
});

test("test_list_conversions", () => {
  const a = SExp.to([1, 2, 3]);
  expect(print_tree(a)).toBe("(1 (2 (3 () )))");
});

test("test_string_conversions", () => {
  const a = SExp.to("foobar");
  expect(a.atom?.equal_to(b("foobar"))).toBeTruthy();
});

test("test_int_conversions", () => {
  const a = SExp.to(1337);
  expect(a.atom?.equal_to(Bytes.from([0x5, 0x39]))).toBeTruthy();
});

test("test_none_conversions", () => {
  const a = SExp.to(None);
  expect(a.atom?.equal_to(b(""))).toBeTruthy();
});

test("test_empty_list_conversions", () => {
  const a = SExp.to([]);
  expect(a.atom?.equal_to(b(""))).toBeTruthy();
});

test("test_eager_conversion", () => {
  expect(() => {
    SExp.to(t("foobar", t(1, {})));
  }).toThrow();
});

test("test_convert_atom", () => {
  expect(convert_atom_to_bytes(0x133742).equal_to(Bytes.from([0x13, 0x37, 0x42]))).toBeTruthy();
  expect(convert_atom_to_bytes(0x833742).equal_to(Bytes.from([0x00, 0x83, 0x37, 0x42]))).toBeTruthy();
  expect(convert_atom_to_bytes(0).equal_to(b(""))).toBeTruthy();
  
  expect(convert_atom_to_bytes("foobar").equal_to(b("foobar"))).toBeTruthy();
  expect(convert_atom_to_bytes("").equal_to(b(""))).toBeTruthy();
  
  expect(convert_atom_to_bytes(b("foobar")).equal_to(b("foobar"))).toBeTruthy();
  expect(convert_atom_to_bytes(None).equal_to(b(""))).toBeTruthy();
  expect(convert_atom_to_bytes([]).equal_to(b(""))).toBeTruthy();
  
  expect(() => {
    convert_atom_to_bytes([1, 2, 3]);
  }).toThrow();
  
  expect(() => {
    convert_atom_to_bytes(t(1, 2));
  }).toThrow();
  
  expect(() => {
    convert_atom_to_bytes({});
  }).toThrow();
});
