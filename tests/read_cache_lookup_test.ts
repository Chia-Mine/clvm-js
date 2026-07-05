import {to_sexp_f} from "../src/index";
import {ReadCacheLookup} from "../src/read_cache_lookup";
import {ObjectCache, treehash} from "../src/object_cache";
import {Bytes, b, t} from "../src/__type_compatibility__";
import {None, Optional} from "../src/__python_types__";

function expect_path(path: Optional<Bytes>, expected: number[]|None){
  if(expected === None){
    expect(path).toBe(None);
  }
  else{
    expect(path).not.toBe(None);
    expect((path as Bytes).equal_to(Bytes.from(expected))).toBeTruthy();
  }
}

test("test_various", () => {
  let rcl = new ReadCacheLookup();
  const treehasher = new ObjectCache(treehash);

  // rcl = ()
  const nil = to_sexp_f(b(""));
  const nil_hash = treehasher.get(nil);
  expect(rcl.root_hash.equal_to(nil_hash)).toBeTruthy();

  const foo = to_sexp_f(b("foo"));
  const foo_hash = treehasher.get(foo);
  rcl.push(foo_hash);

  // rcl = (foo . 0)

  let current_stack = to_sexp_f([foo]);
  let current_stack_hash = treehasher.get(current_stack);

  expect(rcl.root_hash.equal_to(current_stack_hash)).toBeTruthy();
  expect_path(rcl.find_path(foo_hash, 20), [2]);
  expect_path(rcl.find_path(nil_hash, 20), [3]);
  expect_path(rcl.find_path(current_stack_hash, 20), [1]);

  const bar = to_sexp_f(b("bar"));
  const bar_hash = treehasher.get(bar);
  rcl.push(bar_hash);

  // rcl = (bar foo)

  current_stack = to_sexp_f([bar, foo]);
  current_stack_hash = treehasher.get(current_stack);
  const foo_list_hash = treehasher.get(to_sexp_f([b("foo")]));
  expect(rcl.root_hash.equal_to(current_stack_hash)).toBeTruthy();
  expect_path(rcl.find_path(bar_hash, 20), [2]);
  expect_path(rcl.find_path(foo_list_hash, 20), [3]);
  expect_path(rcl.find_path(foo_hash, 20), [5]);
  expect_path(rcl.find_path(nil_hash, 20), [7]);
  expect_path(rcl.find_path(current_stack_hash, 20), [1]);
  expect(rcl.count.get(foo_list_hash.hex())).toBe(1);

  rcl.pop2_and_cons();
  // rcl = ((foo . bar) . 0)

  current_stack = to_sexp_f([t(foo, bar)]);
  current_stack_hash = treehasher.get(current_stack);
  expect(rcl.root_hash.equal_to(current_stack_hash)).toBeTruthy();

  // we no longer have `(foo . 0)` in the read stack
  // check that its count is zero
  expect(rcl.count.get(foo_list_hash.hex())).toBe(0);

  expect_path(rcl.find_path(bar_hash, 20), [6]);
  expect_path(rcl.find_path(foo_list_hash, 20), None);
  expect_path(rcl.find_path(foo_hash, 20), [4]);
  expect_path(rcl.find_path(nil_hash, 20), [3]);
  expect_path(rcl.find_path(current_stack_hash, 20), [1]);

  rcl.push(foo_hash);
  rcl.push(foo_hash);
  rcl.pop2_and_cons();

  // rcl = ((foo . foo) (foo . bar))

  current_stack = to_sexp_f([t(foo, foo), t(foo, bar)]);
  current_stack_hash = treehasher.get(current_stack);
  expect(rcl.root_hash.equal_to(current_stack_hash)).toBeTruthy();
  expect_path(rcl.find_path(bar_hash, 20), [13]);
  expect_path(rcl.find_path(foo_list_hash, 20), None);
  expect_path(rcl.find_path(foo_hash, 20), [4]);
  expect_path(rcl.find_path(nil_hash, 20), [7]);

  // find BOTH minimal paths to `foo`
  expect(rcl.find_paths(foo_hash, 20)).toEqual(new Set(["04", "06"]));

  rcl = new ReadCacheLookup();
  rcl.push(foo_hash);
  rcl.push(foo_hash);
  rcl.pop2_and_cons();
  rcl.push(foo_hash);
  rcl.push(foo_hash);
  rcl.pop2_and_cons();
  rcl.pop2_and_cons();
  // rcl = ((foo . foo) . (foo . foo))
  // find ALL minimal paths to `foo`
  expect(rcl.find_paths(foo_hash, 20)).toEqual(
    new Set(["08", "0a", "0c", "0e"])
  );
});
