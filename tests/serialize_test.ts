import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import {to_sexp_f} from "../src/index";
import {
  MAX_SAFE_BYTES,
  _atom_from_stream,
  sexp_from_stream,
  sexp_buffer_from_stream,
  atom_to_byte_iterator,
  sexp_to_stream,
} from "../src/serialize";
import {Bytes, h, b, t, Stream} from "../src/__type_compatibility__";
import {None} from "../src/__python_types__";

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
      ret = ret.concat(this._buf.subarray(0,1));
      this._buf = this._buf.subarray(1);
      n -= 1;
    }
    ret = ret.concat(b(" ").repeat(n));
    return ret;
  }
}

class LargeAtom extends Bytes {
  public get length(): number {
    return 0x400000001;
  }
}

// Return `true` iff blob has a backref in it.
function has_backrefs(blob: Bytes): boolean {
  const f = new Stream(blob);
  let obj_count = 1;
  while(obj_count > 0){
    const b = f.read(1).at(0);
    if(b === 0xfe){
      return true;
    }
    if(b === 0xff){
      obj_count += 1;
    }
    else{
      _atom_from_stream(f, b);
      obj_count -= 1;
    }
  }
  return false;
}

function check_serde(s: any): Bytes {
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
  const f = new Stream();
  sexp_to_stream(v1, f);
  const length = f.getValue().length;
  expect(f.getValue().equal_to(b)).toBeTruthy();
  // this copies the bytes that represent a single s-expression, just to
  // know where the message ends. It doesn't build a javascript representation
  // of it
  const buf = sexp_buffer_from_stream(new Stream(b));
  expect(buf.equal_to(b)).toBeTruthy();

  // now turn on backrefs and make sure everything still works

  const b2 = v.as_bin({allow_backrefs: true});
  expect(b2.length).toBeLessThanOrEqual(b.length);
  if(has_backrefs(b2) || b2.length < b.length){
    // if we have any backrefs, ensure they actually save space
    expect(b2.length).toBeLessThan(b.length);
    expect(() => {
      sexp_from_stream(new Stream(b2), to_sexp_f);
    }).toThrow();
    const v2 = sexp_from_stream(new Stream(b2), to_sexp_f, {allow_backrefs: true});
    expect(v2.equal_to(s)).toBeTruthy();
    const b3 = v2.as_bin();
    expect(b.equal_to(b3)).toBeTruthy();
  }
  expect(() => {
    sexp_to_stream(v1, new Stream(), {max_size: length - 1});
  }).toThrow("SExp exceeds maximum size");
  sexp_to_stream(v1, new Stream(), {max_size: length});
  return b2;
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
}, 60000);

test("test_cons_box", () => {
  check_serde(t(None, None));
  check_serde(t(None, [1, 2, 30, 40, 600, t(None, 18)]));
  check_serde(t(100, t(TEXT, t(30, t(50, t(90, t(TEXT, TEXT.concat(TEXT))))))));
});

test("test_long_blobs", () =>{
  const text = TEXT.repeat(300);

  for(let _=0;_<text.length;_++){
    const t1 = text.subarray(0, _);
    check_serde(t1);
  }
}, 600000);

test("test_blob_limit", () =>{
  expect(() => {
    for(const b of atom_to_byte_iterator(new LargeAtom())){
      console.log(`${b}`);
    }
  }).toThrow();
});

test("test_very_long_blobs", () => {
  for(const size of [0x40, 0x2000, 0x100000, 0x8000000]){
    const count = (size / TEXT.length) | 0;
    let text = TEXT.repeat(count);
    expect(text.length).toBeLessThan(size);
    if(text.length >= MAX_SAFE_BYTES){
      expect(() => check_serde(text)).toThrow("SExp exceeds maximum size");
    }
    else{
      check_serde(text);
    }
    text = TEXT.repeat(count+1);
    expect(text.length).toBeGreaterThan(size);
    if(text.length >= MAX_SAFE_BYTES){
      expect(() => check_serde(text)).toThrow("SExp exceeds maximum size");
    }
    else{
      check_serde(text);
    }
  }
}, 60000);

test("test_very_deep_tree", () => {
  const blob = b("a");
  for(const depth of [10, 100, 1000, 10000, 100000]){
    let s = to_sexp_f(blob);
    for(let _=0;_<depth;_++){
      s = to_sexp_f(t(s, blob));
    }
    check_serde(s);
  }
}, 600000);

test("test_deserialize_empty", () => {
  const bytes_in = b("");
  expect(() => {
    sexp_from_stream(new Stream(bytes_in), to_sexp_f);
  }).toThrow();

  expect(() => {
    sexp_buffer_from_stream(new Stream(bytes_in));
  }).toThrow();
});

test("test_deserialize_truncated_size", () => {
  // fe means the total number of bytes in the length-prefix is 7
  // one for each bit set. 5 bytes is too few
  const bytes_in = h("0xfe").concat(b("    "));
  expect(() => {
    sexp_from_stream(new Stream(bytes_in), to_sexp_f);
  }).toThrow();

  expect(() => {
    sexp_buffer_from_stream(new Stream(bytes_in));
  }).toThrow();
});

test("test_deserialize_truncated_blob", () => {
  // this is a complete length prefix. The blob is supposed to be 63 bytes
  // the blob itself is truncated though, it's less than 63 bytes
  const bytes_in = h("0xbf").concat(b("   "));
  expect(() => {
    sexp_from_stream(new Stream(bytes_in), to_sexp_f);
  }).toThrow();

  expect(() => {
    sexp_buffer_from_stream(new Stream(bytes_in));
  }).toThrow();
});

test("test_deserialize_large_blob", () => {
  // this length prefix is 7 bytes long, the last 6 bytes specifies the
  // length of the blob, which is 0xffffffffffff, or (2^48 - 1)
  // we don't support blobs this large, and we should fail immediately when
  // exceeding the max blob size, rather than trying to read this many
  // bytes from the stream
  const bytes_in = h("0xfe").concat(h("0xff").repeat(6));
  expect(() => {
    sexp_from_stream(new InfiniteStream(bytes_in), to_sexp_f);
  }).toThrow();

  expect(() => {
    sexp_buffer_from_stream(new InfiniteStream(bytes_in));
  }).toThrow();
});

test("test_deserialize_generator", () => {
  const blob = new Bytes(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, "generator.bin.gz"))));
  const s = sexp_from_stream(new Stream(blob), to_sexp_f);
  const b = check_serde(s);
  expect(b.length).toBe(19124);
}, 600000);

test("test_deserialize_bomb", () => {
  const make_bomb = (depth: number) => {
    let bomb = to_sexp_f(TEXT);
    for(let _=0;_<depth;_++){
      bomb = to_sexp_f(t(bomb, bomb));
    }
    return bomb;
  };

  const bomb_10 = make_bomb(10);
  const b10_1 = bomb_10.as_bin({allow_backrefs: false});
  const b10_2 = bomb_10.as_bin({allow_backrefs: true});
  expect(b10_1.length).toBe(47103);
  expect(b10_2.length).toBe(75);

  const bomb_20 = make_bomb(20);
  expect(() => bomb_20.as_bin({allow_backrefs: false})).toThrow("SExp exceeds maximum size");
  const b20_2 = bomb_20.as_bin({allow_backrefs: true});
  expect(b20_2.length).toBe(105);

  const bomb_30 = make_bomb(30);
  expect(() => bomb_30.as_bin({allow_backrefs: false})).toThrow("SExp exceeds maximum size");
  const b30_2 = bomb_30.as_bin({allow_backrefs: true});
  expect(b30_2.length).toBe(135);
});

test("test_specific_tree", () => {
  const sexp1 = to_sexp_f(t(t("AAA", "BBB"), t("CCC", "AAA")));
  const serialized_sexp1_v1 = sexp1.as_bin({allow_backrefs: false});
  const serialized_sexp1_v2 = sexp1.as_bin({allow_backrefs: true});
  expect(serialized_sexp1_v1.length).toBe(19);
  expect(serialized_sexp1_v2.length).toBe(17);
  const deserialized_sexp1_v1 = sexp_from_stream(
    new Stream(serialized_sexp1_v1), to_sexp_f, {allow_backrefs: false}
  );
  const deserialized_sexp1_v2 = sexp_from_stream(
    new Stream(serialized_sexp1_v2), to_sexp_f, {allow_backrefs: true}
  );
  expect(deserialized_sexp1_v1.equal_to(deserialized_sexp1_v2)).toBeTruthy();
});

// This tests that the max_size parameter in as_bin allows currently
// impossible objects to be converted to binary by passing max_size
// down to sexp_to_stream.
test("test_as_bin_creating_large_blob", () => {
  const size = 0x8000000;
  const count = (size / TEXT.length) | 0;
  const s = TEXT.repeat(count);
  const v = to_sexp_f(s);

  // Test that converting this results in an error without max_size
  expect(() => v.as_bin()).toThrow("SExp exceeds maximum size");

  // Test that we can convert it back with max_size set.
  const b = v.as_bin({max_size: 0x40000000});
  const converted_back = sexp_from_stream(new Stream(b), to_sexp_f);
  expect(converted_back.equal_to(s)).toBeTruthy();
}, 60000);
