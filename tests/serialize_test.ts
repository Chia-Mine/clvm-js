import {to_sexp_f} from "../src/index";
import {
  sexp_from_stream,
  sexp_buffer_from_stream,
  atom_to_byte_iterator,
} from "../src/serialize";
import {Bytes, h, b, Stream} from "../src/__type_compatibility__";

const TEXT = b("the quick brown fox jumps over the lazy dogs");

class InfiniteStream extends Stream {
  private _buf: Bytes;
  public constructor(b: Bytes) {
    super(b);
    this._buf = b;
  }
  
  public read(n: number){
    let ret = b("");
    while(n > 0 && this._buf.length > 0){
      ret = ret.concat(this._buf.slice(0,1));
      this._buf = this._buf.slice(1);
      n -= 1;
    }
    ret = ret.concat(b(" ".repeat(n)));
    return ret;
  }
}

class LargeAtom extends Bytes {
  public get length(): number {
    return 0x400000001;
  }
}

function check_serde(s: any){
  const v = to_sexp_f(s);
  let b = v.as_bin();
  let v1 = sexp_from_stream(new Stream(b), to_sexp_f);
  if(!v.equal_to(v1)){
    console.log(`${v}: ${b.length} ${b} ${v1}`);
    debugger;
    b = v.as_bin();
    v1 = sexp_from_stream(new Stream(b), to_sexp_f);
  }
  expect(v.equal_to(v1)).toBeTruthy();
  // this copies the bytes that represent a single s-expression, just to
  // know where the message ends. It doesn't build a javascript representation
  // of it
  const buf = sexp_buffer_from_stream(new Stream(b));
  expect(buf.equal_to(b)).toBeTruthy();
}

test("test_zero", () => {
  const v = to_sexp_f(h("0x00"));
  expect(v.as_bin().equal_to(h("0x00"))).toBeTruthy();
});

test("test_empty", () => {
  const v = to_sexp_f(b(""));
  expect(v.as_bin().equal_to(h("0x80"))).toBeTruthy();
});

test("test_empty_string", () => {
  check_serde(b(""));
});

test("test_single_bytes", () =>{
  for(let _=0;_<256;_++){
    check_serde(Bytes.from([_]));
  }
});

test("test_short_list", () =>{
  check_serde([]);
  for(let _=0;_<2048;_+=8){
    for(let size=1;size<5;size++){
      check_serde([...new Array(size)].map(() => _));
    }
  }
});

test("test_long_blobs", () =>{
  let text = b("");
  for(let i=0;i<300;i++) { text = text.concat(TEXT); }
  
  for(let _=0;_<text.length;_++){
    const t1 = text.slice(0, _);
    check_serde(t1);
  }
});

test("test_blob_limit", () =>{
  expect(() => {
    for(const b of atom_to_byte_iterator(new LargeAtom())){
      console.log(`${b}`);
    }
  }).toThrow();
});

test("test_very_long_blobs", () => {
  
});

test("test_very_deep_tree", () => {
  
});

test("test_deserialize_empty", () => {
  
});

test("test_deserialize_truncated_size", () => {
  
});

test("test_deserialize_truncated_blob", () => {
  
});

test("test_deserialize_large_blob", () => {
  
});
