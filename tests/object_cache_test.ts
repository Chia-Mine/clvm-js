import {to_sexp_f} from "../src/index";
import {ObjectCache, treehash, serialized_length} from "../src/object_cache";
import {b, h, t} from "../src/__type_compatibility__";
import type {CastableType} from "../src/SExp";

function check(obj: CastableType, expected_hash: string, expected_length: number){
  const sexp = to_sexp_f(obj);
  const th = new ObjectCache(treehash);
  expect(th.get(sexp).hex()).toBe(expected_hash);
  const sl = new ObjectCache(serialized_length);
  expect(sl.get(sexp)).toBe(expected_length);
}

test("test_various", () => {
  // 0x00
  check(
    h("0x00"),
    "47dc540c94ceb704a23875c11273e16bb0b8a87aed84de911f2133568115f254",
    1,
  );

  // 0
  check(
    b(""),
    "4bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459a",
    1,
  );

  // foo
  check(
    b("foo"),
    "0080b50a51ecd0ccfaaa4d49dba866fe58724f18445d30202bafb03e21eef6cb",
    4,
  );

  // (foo . bar)
  check(
    t(b("foo"), b("bar")),
    "c518e45ae6a7b4146017b7a1d81639051b132f1f5572ce3088a3898a9ed1280b",
    9,
  );

  // (this is a longer test of a deeper tree)
  // Note: `a` is assembled into the operator atom 0x02 by `clvm_tools.binutils.assemble`
  check(
    [b("this"), b("is"), h("0x02"), b("longer"), b("test"), b("of"), h("0x02"), b("deeper"), b("tree")],
    "0a072d7d860d77d8e290ced0fdb29a271198ca3db54d701c45d831e3aae6422c",
    47,
  );
});
