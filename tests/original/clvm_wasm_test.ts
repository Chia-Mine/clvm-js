import {
  initialize,
  h,
  SExp,
  run_chia_program,
  Flag,
  LazyNode,
  CLVMType,
  Bytes,
  Tuple,
} from "../../src/index";

beforeAll(() => {
  return initialize();
});

test("run transactions generator", async () => {
  /*
   This comes from a block of height 600043 in the testnet11.
   You can get the block data by:
     chia rpc full_node get_blocks '{"start": 600043, "end": 600044}'
   on testnet11.
   The transactions_generator in the block was serialized with backref enabled.
   */
  const transactions_generator = h(
    "0xff01ffffffa09dc16b766b557d0d8d94fe1ee636245b4417a46cd53bd4e70c26a62dc698d406ffff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04fffe84016b6b7fff80808080fffe820db78080fe81ffffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101fe6f80ff0180fe3e80ffff04ffff01b0a282b4b0117a8d04906835fa4fa0e13d3fbd1dd61899ebdf5157977611d1bae52f2ea97cbc3916466b1c9176d30a9030fe3f80ff85727e956731ffff80ffff01ffff33ffa05597ef68eaf171a6303995ecbb14fdbf2c24300b625bfbc886ea68270424661dff5880ffff33ffa07a7a9cb053b9e7086ddbb789a4a1abc646a06627d372eca59368bf90c15028bfff85727b9a765980ffff34ff8402faf08080ffff3cffa0d71f4c45af09583209498dbb9974bbda21b859fac0bf3348337ed33a2ba5c3838080ff8080808080"
  ).raw();
  
  // Deserializing WITHOUT allowing backref throws an Error
  expect(() => LazyNode.from_bytes(transactions_generator)).toThrow();
  
  // Deserializing WITH allowing backref doesn't throw an Error
  const node = LazyNode.from_bytes_with_backref(transactions_generator);
  // `new SExp(...)` accepts any objects which has `atom` and `pair` attributes.
  const sexp = new SExp(node as CLVMType);
  const sexp_as_js = sexp.as_javascript();
  expect(sexp_as_js).toBeInstanceOf(Array);
  // `transactions_generator` should be in the form (q . (generators...))
  expect(((sexp_as_js as Tuple<Bytes, any>)[0]).equal_to(h("0x01"))); // q: 0x01
  
  const program = transactions_generator;
  const env = SExp.to([]).as_bin().raw();
  const max_cost = BigInt(20);
  
  // If you don't set a flag to allow backref, it throws an Error.
  expect(() => run_chia_program(program, env, max_cost, 0)).toThrow();
  
  const flag = Flag.allow_backrefs();
  // If you set a flag to allow backref, it doesn't throw an Error.
  const cost_and_result = run_chia_program(program, env, max_cost, flag);
  
  expect(cost_and_result).toBeInstanceOf(Array);
  expect(cost_and_result[0]).toBeGreaterThan(BigInt(0));
  expect(cost_and_result[1]).toHaveProperty("atom");
  expect(cost_and_result[1]).toHaveProperty("pair");
});
