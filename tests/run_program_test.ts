import {msb_mask, run_program} from "../src/run_program";
import {SExp} from "../src/SExp";
import {Bytes, Stream} from "../src/__type_compatibility__";
import {OPERATOR_LOOKUP} from "../src/operators";
import {sexp_from_stream} from "../src/serialize";
import {initialize} from "../src";
import {EvalError} from "../src/EvalError";




test("test_msb_mask", () => {
  expect(msb_mask(0x0)).toBe(0x0);
  expect(msb_mask(0x01)).toBe(0x01);
  expect(msb_mask(0x02)).toBe(0x02);
  expect(msb_mask(0x04)).toBe(0x04);
  expect(msb_mask(0x08)).toBe(0x08);
  expect(msb_mask(0x10)).toBe(0x10);
  expect(msb_mask(0x20)).toBe(0x20);
  expect(msb_mask(0x40)).toBe(0x40);
  expect(msb_mask(0x80)).toBe(0x80);
  
  expect(msb_mask(0x44)).toBe(0x40);
  expect(msb_mask(0x2a)).toBe(0x20);
  expect(msb_mask(0xff)).toBe(0x80);
  expect(msb_mask(0x0f)).toBe(0x08);
});



function sexp_from_hex(hex: string) {
  return sexp_from_stream(new Stream(Bytes.from(hex, "hex")), SExp.to);
}

interface RunProgramTest {
    prgClvm?: string,
    prg: SExp,
    argsClvm?: string,
    args: SExp,
    result: string|null,
    resultClvm?: string|null,
    cost: number,
    err?: string,
}

// Test cases sourced from Chia-Network/clvm_rs#450d0f3:src/run_program.rs

const TEST_CASES: RunProgramTest[] = [
  {
    // (mod (X N) (defun power (X N) (if (= N 0) 1 (* X (power X (- N 1))))) (power X N))
    prgClvm: "(a (q 2 2 (c 2 (c 5 (c 11 ())))) (c (q 2 (i (= 11 ()) (q 1 . 1) (q 18 5 (a 2 (c 2 (c 5 (c (- 11 (q . 1)) ())))))) 1) 1))",
    prg: sexp_from_hex("ff02ffff01ff02ff02ffff04ff02ffff04ff05ffff04ff0bff8080808080ffff04ffff01ff02ffff03ffff09ff0bff8080ffff01ff0101ffff01ff12ff05ffff02ff02ffff04ff02ffff04ff05ffff04ffff11ff0bffff010180ff80808080808080ff0180ff018080"),
    argsClvm: "(5033 1000)",
    args: sexp_from_hex("ff8213a9ff8203e880"),
    result: "c602024d4f505f1f813ca5e0ae8805bad8707347e65c5f7595da4852be5074288431d1df11a0c326d249f1f52ee051579403d1d0c23a7a1e9af18b7d7dc4c63c73542863c434ae9dfa80141a30cf4acee0d6c896aa2e64ea748404427a3bdaa1b97e4e09b8f5e4f8e9c568a4fc219532dbbad5ec54476d19b7408f8e7e7df16b830c20a1e83d90cc0620b0677b7606307f725539ef223561cdb276baf8e92156ee6492d97159c8f64768349ea7e219fd07fa818a59d81d0563b140396402f0ff758840da19808440e0a57c94c48ef84b4ab7ca8c5f010b69b8f443b12b50bd91bdcf2a96208ddac283fa294d6a99f369d57ab41d03eab5bb4809223c141ad94378516e6766a5054e22e997e260978af68a86893890d612f081b40d54fd1e940af35c0d7900c9a917e2458a61ef8a83f7211f519b2c5f015dfa7c2949ef8bedd02d3bad64ca9b2963dc2bb79f24092331133a7a299872079b9d0422b8fc0eeba4e12c7667ac7282cc6ff98a7c670614c9fce5a061b8d5cd4dd3c6d62d245688b62f9713dc2604bdd5bbc85c070c51f784a9ebac0e0eaa2e29e82d93e570887aa7e1a9d25baf0b2c55a4615f35ec0dbe9baa921569700f95e10cd2d4f6ba152a2ac288c37b60980df33dadfa920fd43dbbf55a0b333b88a3237d954e33d80ed6582019faf51db5f1b52e392559323f8bdd945e7fc6cb8f97f2b8417cfc184d7bfbfa5314d4114f95b725847523f1848d13c28ad96662298ee4e2d87af23e7cb4e58d7a20a5c57ae6833b4a37dcafccca0245a0d6ef28f83200d74db390281e03dd3a8b782970895764c3fcef31c5ed6d0b6e4e796a62ad5654691eea0d9db351cc4fee63248405b24c98bd5e68e4a5e0ab11e90e3c7de270c594d3a35639d931853b7010c8c896f6b28b2af719e53da65da89d44b926b6f06123c9217a43be35d751516bd02c18c4f868a2eae78ae3c6deab1115086c8ce58414db4561865d17ab95c7b3d4e1bfc6d0a4d3fbf5f20a0a7d77a9270e4da354c588da55b0063aec76654019ffb310e1503d99a7bc81ccdf5f8b15c8638156038624cf35988d8420bfdb59184c4b86bf5448df65c44aedc2e98eead7f1ba4be8f402baf12d41076b8f0991cfc778e04ba2c05d1440c70488ffaeefde537064035037f729b683e8ff1b3d0b4aa26a2b30bcaa9379f7fcc7072ff9a2c3e801c5979b0ab3e7acf89373de642d596f26514b9fa213ca217181a8429ad69d14445a822b16818c2509480576dc0ff7bac48c557e6d1883039f4daf873fa4f9a4d849130e2e4336049cfaf9e69a7664f0202b901cf07c7065c4dc93c46f98c5ea5c9c9d911b733093490da3bf1c95f43cd18b7be3798535a55ac6da3442946a268b74bde1349ca9807c41d90c7ec218a17efd2c21d5fcd720501f8a488f1dfba0a423dfdb2a877707b77930e80d734ceabcdb24513fad8f2e2470604d041df083bf184edd0e9720dd2b608b1ee1df951d7ce8ec671317b4f5a3946aa75280658b4ef77b3f504ce73e7ecac84eec3c2b45fb62f6fbd5ab78c744abd3bf5d0ab37d7b19124d2470d53db09ddc1f9dd9654b0e6a3a44c95d0a5a5e061bd24813508d3d1c901544dc3e6b84ca38dd2fde5ea60a57cbc12428848c4e3f6fd4941ebd23d709a717a090dd01830436659f7c20fd2d70c916427e9f3f12ac479128c2783f02a9824aa4e31de133c2704e049a50160f656e28aa0a2615b32bd48bb5d5d13d363a487324c1e9b8703be938bc545654465c9282ad5420978263b3e3ba1bb45e1a382554ac68e5a154b896c9c4c2c3853fbbfc877c4fb7dc164cc420f835c413839481b1d2913a68d206e711fb19b284a7bb2bd2033531647cf135833a0f3026b0c1dc0c184120d30ef4865985fdacdfb848ab963d2ae26a784b7b6a64fdb8feacf94febed72dcd0a41dc12be26ed79af88f1d9cba36ed1f95f2da8e6194800469091d2dfc7b04cfe93ab7a7a888b2695bca45a76a1458d08c3b6176ab89e7edc56c7e01142adfff944641b89cd5703a911145ac4ec42164d90b6fcd78b39602398edcd1f935485894fb8a1f416e031624806f02fbd07f398dbfdd48b86dfacf2045f85ecfe5bb1f01fae758dcdb4ae3b1e2aac6f0878f700d1f430b8ca47c9d8254059bd5c006042c4605f33ca98b41",
    cost: 15073165,
  },
  {
    prgClvm: "(= (point_add (pubkey_for_exp (q . -2)) (pubkey_for_exp (q . 5))) (pubkey_for_exp (q . 3)))",
    prg: sexp_from_hex("ff09ffff1dffff1effff0181fe80ffff1effff01058080ffff1effff01038080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "1",
    result: "01",
    cost: 6768556,
  },
  {
    prgClvm: "(= (point_add (pubkey_for_exp (q . 2)) (pubkey_for_exp (q . 3))) (pubkey_for_exp (q . 5)))",
    prg: sexp_from_hex("ff09ffff1dffff1effff010280ffff1effff01038080ffff1effff01058080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "1",
    result: "01",
    cost: 6768556,
  },
  {
    prgClvm: "(point_add (pubkey_for_exp (q . 1)) (pubkey_for_exp (q . 2)))",
    prg: sexp_from_hex("ff1dffff1effff010180ffff1effff01028080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: "b089ece308f9d1f0131765212deca99697b112d61f9be9a5f1f3780a51335b3ff981747a0b2ca2179b96d2c0c9024e5224",
    cost: 5442073,
  },
  {
    prgClvm: "(f (f (q . ((100 200 300) 400 500))))",
    prg: sexp_from_hex("ff05ffff05ffff01ffff64ff8200c8ff82012c80ff820190ff8201f4808080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: "64",
    cost: 82,
  },
  {
    prgClvm: "(= (f 1) (+ (f (r 1)) (f (r (r 1)))))",
    prg: sexp_from_hex("ff09ffff05ff0180ffff10ffff05ffff06ff018080ffff05ffff06ffff06ff018080808080"),
    argsClvm: "(7 3 3)",
    args: sexp_from_hex("ff07ff03ff0380"),
    resultClvm: "()",
    result: "80",
    cost: 1194,
  },
  {
    prgClvm: "(= (f 1) (+ (f (r 1)) (f (r (r 1)))))",
    prg: sexp_from_hex("ff09ffff05ff0180ffff10ffff05ffff06ff018080ffff05ffff06ffff06ff018080808080"),
    argsClvm: "(7 3 4)",
    args: sexp_from_hex("ff07ff03ff0480"),
    resultClvm: "1",
    result: "01",
    cost: 1194,
  },
  {
    prgClvm: "(i (f (r (r 1))) (f 1) (f (r 1)))",
    prg: sexp_from_hex("ff03ffff05ffff06ffff06ff01808080ffff05ff0180ffff05ffff06ff01808080"),
    argsClvm: "(200 300 400)",
    args: sexp_from_hex("ff8200c8ff82012cff82019080"),
    result: "8200c8",
    cost: 352,
  },
  {
    prgClvm: "(i (f (r (r 1))) (f 1) (f (r 1)))",
    prg: sexp_from_hex("ff03ffff05ffff06ffff06ff01808080ffff05ff0180ffff05ffff06ff01808080"),
    argsClvm: "(200 300 1)",
    args: sexp_from_hex("ff8200c8ff82012cff0180"),
    result: "8200c8",
    cost: 352,
  },
  {
    prgClvm: "(r (r (q . ((100 200 300) 400 500))))",
    prg: sexp_from_hex("ff06ffff06ffff01ffff64ff8200c8ff82012c80ff820190ff8201f4808080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "(500)",
    result: "ff8201f480",
    cost: 82,
  },
  {
    prgClvm: "(* (q . 10000000000000000000000000000000000) (q . 10000000000000000000000000000000) (q . 100000000000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000) (q . 1000000000000000000000000000000))",
    prg: sexp_from_hex("ff12ffff018f01ed09bead87c0378d8e6400000000ffff018d7e37be2022c0914b2680000000ffff01904b3b4ca85a86c47a098a224000000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea40000000ffff018d0c9f2c9cd04674edea4000000080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: "c0c104261a5c969abab851babdb4f178e63bf2ed3879fc13a4c75622d73c909440a4763849b52e49cd2522500f555f6a3131775f93ddcf24eda7a1dbdf828a033626da873caaaa880a9121f4c44a157973f60443dc53bc99ac12d5bd5fa20a88320ae2ccb8e1b5e792cbf0d001bb0fbd7765d3936e412e2fc8f1267833237237fcb638dda0a7aa674680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    cost: 24255,
  },

  // ## APPLY
  {
    prgClvm: "(a (q 0x0fffffffff) (q ()))",
    prg: sexp_from_hex("ff02ffff01ff850fffffffff80ffff01ff808080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: null,
    cost: 0,
    err: "invalid operator",
  },
  {
    prgClvm: "(a (q . 0) (q . 1) (q . 2))",
    prg: sexp_from_hex("ff02ffff0180ffff0101ffff010280"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: null,
    cost: 0,
    err: "apply requires exactly 2 parameters",
  },
  {
    prgClvm: "(a (q 0x00ffffffffffffffffffff00) (q ()))",
    prg: sexp_from_hex("ff02ffff01ff8c00ffffffffffffffffffff0080ffff01ff808080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: null,
    cost: 0,
    err: "invalid operator",
  },
  {
    prgClvm: "(a (q . 1))",
    prg: sexp_from_hex("ff02ffff010180"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: null,
    cost: 0,
    err: "apply requires exactly 2 parameters",
  },
  {
    prgClvm: "(a (q . 1) (q . (100 200)))",
    prg: sexp_from_hex("ff02ffff0101ffff01ff64ff8200c88080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "(100 200)",
    result: "ff64ff8200c880",
    cost: 175,
  },
  {
    prgClvm: "(a (q . (+ 2 5)) (q . (20 30)))",
    prg: sexp_from_hex("ff02ffff01ff10ff02ff0580ffff01ff14ff1e8080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "50",
    result: "32",
    cost: 987,
  },
  {
    prgClvm: "((c (q . (+ (q . 50) 1)) (q . 500)))",
    prg: sexp_from_hex("ffff04ffff01ff10ffff0132ff0180ffff018201f48080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: null,
    cost: 0,
    err: "in ((X)...) syntax X must be lone atom",
  },
  {
    prgClvm: "((#c) (q . 3) (q . 4))",
    prg: sexp_from_hex("ffff0480ffff0103ffff010480"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "((1 . 3) 1 . 4)",
    result: "ffff0103ff0104",
    cost: 140,
  },
  {
    prgClvm: "(a (q . 2) (q . (3 4 5)))",
    prg: sexp_from_hex("ff02ffff0102ffff01ff03ff04ff058080"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    resultClvm: "3",
    result: "03",
    cost: 179,
  },

  // ## PATH LOOKUPS

  // 0
  {
    prgClvm: "0",
    prg: sexp_from_hex("80"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "()",
    result: "80",
    cost: 44,
  },
  // 1
  {
    prgClvm: "1",
    prg: sexp_from_hex("01"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "(((8 . 12) 10 . 14) (9 . 13) 11 . 15)",
    result: "ffffff080cff0a0effff090dff0b0f",
    cost: 44,
  },
  // 2
  {
    prgClvm: "2",
    prg: sexp_from_hex("02"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "((8 . 12) 10 . 14)",
    result: "ffff080cff0a0e",
    cost: 48,
  },
  // 3
  {
    prgClvm: "3",
    prg: sexp_from_hex("03"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "((9 . 13) 11 . 15)",
    result: "ffff090dff0b0f",
    cost: 48,
  },
  // 4
  {
    prgClvm: "4",
    prg: sexp_from_hex("04"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "(8 . 12)",
    result: "ff080c",
    cost: 52,
  },
  // 5
  {
    prgClvm: "5",
    prg: sexp_from_hex("05"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "(9 . 13)",
    result: "ff090d",
    cost: 52,
  },
  // 6
  {
    prgClvm: "6",
    prg: sexp_from_hex("06"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "(10 . 14)",
    result: "ff0a0e",
    cost: 52,
  },
  // 7
  {
    prgClvm: "7",
    prg: sexp_from_hex("07"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "(11 . 15)",
    result: "ff0b0f",
    cost: 52,
  },
  {
    prgClvm: "8",
    prg: sexp_from_hex("08"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "8",
    result: "08",
    cost: 56,
  },
  {
    prgClvm: "9",
    prg: sexp_from_hex("09"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "9",
    result: "09",
    cost: 56,
  },
  {
    prgClvm: "10",
    prg: sexp_from_hex("0a"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "10",
    result: "0a",
    cost: 56,
  },
  {
    prgClvm: "11",
    prg: sexp_from_hex("0b"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "11",
    result: "0b",
    cost: 56,
  },
  {
    prgClvm: "12",
    prg: sexp_from_hex("0c"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "12",
    result: "0c",
    cost: 56,
  },
  {
    prgClvm: "13",
    prg: sexp_from_hex("0d"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "13",
    result: "0d",
    cost: 56,
  },
  {
    prgClvm: "14",
    prg: sexp_from_hex("0e"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "14",
    result: "0e",
    cost: 56,
  },
  {
    prgClvm: "15",
    prg: sexp_from_hex("0f"),
    argsClvm: "(((8 . 12) . (10 . 14)) . ((9 . 13) . (11 . 15)))",
    args: sexp_from_hex("ffffff080cff0a0effff090dff0b0f"),
    resultClvm: "15",
    result: "0f",
    cost: 56,
  },
  {
    prgClvm: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
    prg: sexp_from_hex("c07c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"),
    argsClvm: "(((0x1337 . (0x1337 . (42 . 0x1337))) . 0x1337) . 0x1337)",
    args: sexp_from_hex("ffffff821337ff821337ff2a821337821337821337"),
    resultClvm: "(((0x1337 . (0x1337 . (42 . 0x1337))) . 0x1337) . 0x1337)",
    result: "ffffff821337ff821337ff2a821337821337821337",
    cost: 536,
  },
  {
    prgClvm: "0x0000C8C141AB3121E776",
    prg: sexp_from_hex("8a0000c8c141ab3121e776"),
    argsClvm: "((0x1337 . (0x1337 . ((0x1337 . (0x1337 . (0x1337 . ((0x1337 . (0x1337 . (0x1337 . (((0x1337 . (0x1337 . (0x1337 . (0x1337 . (((((0x1337 . (((0x1337 . ((((0x1337 . (0x1337 . (((0x1337 . (0x1337 . ((0x1337 . ((0x1337 . ((0x1337 . (0x1337 . ((((((0x1337 . ((0x1337 . ((((((0x1337 . (0x1337 . ((((0x1337 . (((0x1337 . 42) . 0x1337) . 0x1337)) . 0x1337) . 0x1337) . 0x1337))) . 0x1337) . 0x1337) . 0x1337) . 0x1337) . 0x1337)) . 0x1337)) . 0x1337) . 0x1337) . 0x1337) . 0x1337) . 0x1337))) . 0x1337)) . 0x1337)) . 0x1337))) . 0x1337) . 0x1337))) . 0x1337) . 0x1337) . 0x1337)) . 0x1337) . 0x1337)) . 0x1337) . 0x1337) . 0x1337) . 0x1337))))) . 0x1337) . 0x1337)))) . 0x1337)))) . 0x1337))) . 0x1337)",
    args: sexp_from_hex("ffff821337ff821337ffff821337ff821337ff821337ffff821337ff821337ff821337ffffff821337ff821337ff821337ff821337ffffffffff821337ffffff821337ffffffff821337ff821337ffffff821337ff821337ffff821337ffff821337ffff821337ff821337ffffffffffff821337ffff821337ffffffffffff821337ff821337ffffffff821337ffffff8213372a821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337"),
    resultClvm: "42",
    result: "2a",
    cost: 304,
  },
  {
    prgClvm: "7708975405620101644641102810267383005",
    prg: sexp_from_hex("9005ccb1d511a10f878d9d42bc972df4dd"),
    argsClvm: "(0x1337 . ((0x1337 . (0x1337 . (0x1337 . ((0x1337 . (0x1337 . (((0x1337 . ((0x1337 . (0x1337 . (0x1337 . (0x1337 . (0x1337 . ((0x1337 . (0x1337 . ((0x1337 . (((0x1337 . (0x1337 . (0x1337 . ((0x1337 . (((0x1337 . (((0x1337 . (0x1337 . (0x1337 . (0x1337 . ((0x1337 . ((0x1337 . (((((0x1337 . ((0x1337 . ((0x1337 . (0x1337 . (0x1337 . (((0x1337 . (0x1337 . ((0x1337 . (0x1337 . ((((0x1337 . (0x1337 . (0x1337 . (0x1337 . (((((0x1337 . (0x1337 . (0x1337 . (0x1337 . (0x1337 . (((((0x1337 . (((((0x1337 . ((0x1337 . (0x1337 . ((((0x1337 . ((((0x1337 . ((0x1337 . ((0x1337 . ((0x1337 . (0x1337 . (0x1337 . ((((0x1337 . (0x1337 . ((0x1337 . (((0x1337 . (0x1337 . (((0x1337 . (0x1337 . (0x1337 . (42 . 0x1337)))) . 0x1337) . 0x1337))) . 0x1337) . 0x1337)) . 0x1337))) . 0x1337) . 0x1337) . 0x1337)))) . 0x1337)) . 0x1337)) . 0x1337)) . 0x1337) . 0x1337) . 0x1337)) . 0x1337) . 0x1337) . 0x1337))) . 0x1337)) . 0x1337) . 0x1337) . 0x1337) . 0x1337)) . 0x1337) . 0x1337) . 0x1337) . 0x1337)))))) . 0x1337) . 0x1337) . 0x1337) . 0x1337))))) . 0x1337) . 0x1337) . 0x1337))) . 0x1337))) . 0x1337) . 0x1337)))) . 0x1337)) . 0x1337)) . 0x1337) . 0x1337) . 0x1337) . 0x1337)) . 0x1337)) . 0x1337))))) . 0x1337) . 0x1337)) . 0x1337) . 0x1337)) . 0x1337)))) . 0x1337) . 0x1337)) . 0x1337))) . 0x1337)))))) . 0x1337)) . 0x1337) . 0x1337))) . 0x1337)))) . 0x1337))",
    args: sexp_from_hex("ff821337ffff821337ff821337ff821337ffff821337ff821337ffffff821337ffff821337ff821337ff821337ff821337ff821337ffff821337ff821337ffff821337ffffff821337ff821337ff821337ffff821337ffffff821337ffffff821337ff821337ff821337ff821337ffff821337ffff821337ffffffffff821337ffff821337ffff821337ff821337ff821337ffffff821337ff821337ffff821337ff821337ffffffff821337ff821337ff821337ff821337ffffffffff821337ff821337ff821337ff821337ff821337ffffffffff821337ffffffffff821337ffff821337ff821337ffffffff821337ffffffff821337ffff821337ffff821337ffff821337ff821337ff821337ffffffff821337ff821337ffff821337ffffff821337ff821337ffffff821337ff821337ff821337ff2a821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337821337"),
    resultClvm: "42",
    result: "2a",
    cost: 532,
  },
  {
    prgClvm: "1",
    prg: sexp_from_hex("01"),
    argsClvm: "1",
    args: sexp_from_hex("01"),
    resultClvm: "1",
    result: "01",
    cost: 44,
  },
  {
    prgClvm: "(> 3 3)",
    prg: sexp_from_hex("ff15ff03ff0380"),
    argsClvm: "()",
    args: sexp_from_hex("80"),
    result: null,
    cost: 0,
    err: "path into atom",
  },
];

beforeAll(async () => {
  await initialize();
});

for (const testCase of TEST_CASES) {

  const testTitle = '`'
    + ((testCase.prgClvm?.length ?? 0) > 30 ? testCase.prgClvm?.slice(0,30) + '…' : testCase.prgClvm)
    + '` with args `'
    + ((testCase.argsClvm?.length ?? 0) > 20 ? testCase.argsClvm?.slice(0,20) + '…' : testCase.argsClvm)
    + '`'
    + (testCase.err ? ` should fail with "${testCase.err}"` : "");

  test(`run_program ${testTitle}`, () => {

    const run = () => run_program(
      /* program: */ testCase.prg,
      /* args: */ testCase.args,
      /* operator_lookup: */ OPERATOR_LOOKUP,
      /* max_cost: */ testCase.cost,
    );

    if (testCase.err) {
      try {
        run();
        expect(false).toBe("Should have failed");
      } catch(err) {
        expect(err).toBeInstanceOf(EvalError);
        expect((err as EvalError).message).toBe(testCase.err);
      }
    } else {
      const [cost, result] = run();
      expect(cost).toBe(testCase.cost);
      const serialized = result.toString();
      expect(serialized).toBe(testCase.result);
    }
  })
}
