import {int_from_bytes, bigint_from_bytes, int_to_bytes, pow, bigint_to_bytes, limbs_for_int} from "../src/casts";
import {None, h} from "../src";

describe("int_from_bytes", () => {
  test("signed: true", () => {
    expect(int_from_bytes(None, {signed: true})).toBe(0);
    expect(int_from_bytes(h("01"), {signed: true})).toBe(1);
    expect(int_from_bytes(h("7f"), {signed: true})).toBe(127);
    expect(int_from_bytes(h("80"), {signed: true})).toBe(-128);
    expect(int_from_bytes(h("ff"), {signed: true})).toBe(-1);
    expect(int_from_bytes(h("00ffff00"), {signed: true})).toBe(16776960);
    expect(int_from_bytes(h("ffffffff"), {signed: true})).toBe(-1);
    expect(() => int_from_bytes(h("ffffffffffffffff"), {signed: true})).toThrow();
  });
  test("signed: false", () => {
    expect(int_from_bytes(None, {signed: false})).toBe(0);
    expect(int_from_bytes(h("01"), {signed: false})).toBe(1);
    expect(int_from_bytes(h("7f"), {signed: false})).toBe(127);
    expect(int_from_bytes(h("80"), {signed: false})).toBe(128);
    expect(int_from_bytes(h("ff"), {signed: false})).toBe(255);
    expect(int_from_bytes(h("ffffffff"), {signed: false})).toBe(4294967295);
    expect(() => int_from_bytes(h("ffffffffffffffff"), {signed: false})).toThrow();
  });
  test("default option", () => {
    expect(int_from_bytes(None)).toBe(int_from_bytes(None, {signed: false}));
    expect(int_from_bytes(h("01"))).toBe(int_from_bytes(h("01"), {signed: false}));
    expect(int_from_bytes(h("7f"))).toBe(int_from_bytes(h("7f"), {signed: false}));
    expect(int_from_bytes(h("80"))).toBe(int_from_bytes(h("80"), {signed: false}));
    expect(int_from_bytes(h("ff"))).toBe(int_from_bytes(h("ff"), {signed: false}));
    expect(int_from_bytes(h("ffffffff"))).toBe(int_from_bytes(h("ffffffff"), {signed: false}));
    expect(() => int_from_bytes(h("ffffffffffffffff"))).toThrow();
  });
})

describe("bigint_from_bytes", () => {
  test("signed: true", () => {
    expect(bigint_from_bytes(None, {signed: true}) === BigInt(0)).toBeTruthy();
    expect(bigint_from_bytes(h("01"), {signed: true}) === BigInt(1)).toBeTruthy();
    expect(bigint_from_bytes(h("7f"), {signed: true}) === BigInt(127)).toBeTruthy();
    expect(bigint_from_bytes(h("80"), {signed: true}) === BigInt(-128)).toBeTruthy();
    expect(bigint_from_bytes(h("ff"), {signed: true}) === BigInt(-1)).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffff"), {signed: true}) === BigInt(-1)).toBeTruthy();
    expect(bigint_from_bytes(h("fedcba987654"), {signed: true}) === BigInt("-1250999896492")).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffffffffffff"), {signed: true}) === BigInt(-1)).toBeTruthy();
    expect(bigint_from_bytes(h("7fffffffffffffff"), {signed: true}) === BigInt(2)**BigInt(63) - BigInt(1)).toBeTruthy();
  });
  test("signed: false", () => {
    expect(bigint_from_bytes(None, {signed: false}) === BigInt(0)).toBeTruthy();
    expect(bigint_from_bytes(h("01"), {signed: false}) === BigInt(1)).toBeTruthy();
    expect(bigint_from_bytes(h("7f"), {signed: false}) === BigInt(127)).toBeTruthy();
    expect(bigint_from_bytes(h("80"), {signed: false}) === BigInt(128)).toBeTruthy();
    expect(bigint_from_bytes(h("ff"), {signed: false}) === BigInt(255)).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffff"), {signed: false}) === BigInt(4294967295)).toBeTruthy();
    expect(bigint_from_bytes(h("fedcba987654"), {signed: false}) === BigInt("0xfedcba987654")).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffffffffffff"), {signed: false}) === BigInt("0xffffffffffffffff")).toBeTruthy();
    expect(bigint_from_bytes(h("7fffffffffffffff"), {signed: false}) === BigInt(2)**BigInt(63) - BigInt(1)).toBeTruthy();
  });
  test("default option", () => {
    expect(bigint_from_bytes(None) === bigint_from_bytes(None, {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("01")) === bigint_from_bytes(h("01"), {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("7f")) === bigint_from_bytes(h("7f"), {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("80")) === bigint_from_bytes(h("80"), {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("ff")) === bigint_from_bytes(h("ff"), {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffff")) === bigint_from_bytes(h("ffffffff"), {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("fedcba987654")) === bigint_from_bytes(h("fedcba987654"), {signed: false})).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffffffffffff"), {signed: false}) === BigInt("18446744073709551615")).toBeTruthy();
    expect(bigint_from_bytes(h("7fffffffffffffff")) === bigint_from_bytes(h("7fffffffffffffff"), {signed: false})).toBeTruthy();
  });
});

describe("int_to_bytes", () => {
  test("signed: true", () => {
    expect(int_to_bytes(0, {signed: true}).equal_to(h(""))).toBeTruthy();
    expect(int_to_bytes(1, {signed: true}).equal_to(h("01"))).toBeTruthy();
    expect(int_to_bytes(-1, {signed: true}).equal_to(h("ff"))).toBeTruthy();
    expect(int_to_bytes(127, {signed: true}).equal_to(h("7f"))).toBeTruthy();
    expect(int_to_bytes(-128, {signed: true}).equal_to(h("80"))).toBeTruthy();
    expect(int_to_bytes(255, {signed: true}).equal_to(h("00ff"))).toBeTruthy();
    expect(int_to_bytes(-256, {signed: true}).equal_to(h("ff00"))).toBeTruthy();
    expect(int_to_bytes(65535, {signed: true}).equal_to(h("00ffff"))).toBeTruthy();
    expect(int_to_bytes(65536, {signed: true}).equal_to(h("010000"))).toBeTruthy();
    expect(int_to_bytes(-65535, {signed: true}).equal_to(h("ff0001"))).toBeTruthy();
    expect(int_to_bytes(-65534, {signed: true}).equal_to(h("ff0002"))).toBeTruthy();
    expect(int_to_bytes(-65536, {signed: true}).equal_to(h("ff0000"))).toBeTruthy();
    expect(int_to_bytes(-559038737, {signed: true}).equal_to(h("deadbeef"))).toBeTruthy();
  });
  test("signed: false", () => {
    expect(int_to_bytes(0, {signed: false}).equal_to(h(""))).toBeTruthy();
    expect(int_to_bytes(1, {signed: false}).equal_to(h("01"))).toBeTruthy();
    expect(() => int_to_bytes(-1, {signed: false})).toThrow();
    expect(int_to_bytes(127, {signed: false}).equal_to(h("7f"))).toBeTruthy();
    expect(() => int_to_bytes(-128, {signed: false})).toThrow();
    expect(int_to_bytes(255, {signed: false}).equal_to(h("ff"))).toBeTruthy();
    expect(() => int_to_bytes(-256, {signed: false})).toThrow();
    expect(int_to_bytes(65535, {signed: false}).equal_to(h("ffff"))).toBeTruthy();
    expect(int_to_bytes(65536, {signed: false}).equal_to(h("010000"))).toBeTruthy();
    expect(() => int_to_bytes(-65535, {signed: false})).toThrow();
    expect(int_to_bytes(3735928559, {signed: false}).equal_to(h("deadbeef"))).toBeTruthy();
  });
  test("default option", () => {
    expect(int_to_bytes(0).equal_to(int_to_bytes(0, {signed: false}))).toBeTruthy();
    expect(int_to_bytes(1).equal_to(int_to_bytes(1, {signed: false}))).toBeTruthy();
    expect(() => int_to_bytes(-1)).toThrow();
    expect(int_to_bytes(127).equal_to(int_to_bytes(127, {signed: false}))).toBeTruthy();
    expect(() => int_to_bytes(-128)).toThrow();
    expect(int_to_bytes(255).equal_to(int_to_bytes(255, {signed: false}))).toBeTruthy();
    expect(() => int_to_bytes(-256)).toThrow();
    expect(int_to_bytes(65535).equal_to(int_to_bytes(65535, {signed: false}))).toBeTruthy();
    expect(int_to_bytes(65536).equal_to(int_to_bytes(65536, {signed: false}))).toBeTruthy();
    expect(() => int_to_bytes(-65535)).toThrow();
    expect(int_to_bytes(3735928559).equal_to(int_to_bytes(3735928559, {signed: false}))).toBeTruthy();
  });
});

test("pow", () => {
  expect(pow(BigInt(2), BigInt(10))).toBe(BigInt(1024));
  expect(pow(BigInt(1024), BigInt(1))).toBe(BigInt(1024));
  expect(pow(BigInt(256), BigInt(0))).toBe(BigInt(1));
  expect(pow(BigInt(0), BigInt(0))).toBe(BigInt(1));
  expect(pow(BigInt(0), BigInt(1))).toBe(BigInt(0));
  expect(pow(BigInt(-2), BigInt(3))).toBe(BigInt(-8));
  expect(pow(BigInt(-2), BigInt(2))).toBe(BigInt(4));
});

describe("bigint_to_bytes", () => {
  test("signed: true", () => {
    expect(bigint_to_bytes(BigInt(0), {signed: true}).equal_to(h(""))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(1), {signed: true}).equal_to(h("01"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-1), {signed: true}).equal_to(h("ff"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(127), {signed: true}).equal_to(h("7f"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-128), {signed: true}).equal_to(h("80"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(255), {signed: true}).equal_to(h("00ff"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-256), {signed: true}).equal_to(h("ff00"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(65535), {signed: true}).equal_to(h("00ffff"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(65536), {signed: true}).equal_to(h("010000"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-65535), {signed: true}).equal_to(h("ff0001"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-65534), {signed: true}).equal_to(h("ff0002"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-65536), {signed: true}).equal_to(h("ff0000"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(-559038737), {signed: true}).equal_to(h("deadbeef"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt("-2401053088876216593"), {signed: true}).equal_to(h("deadbeefdeadbeef"))).toBeTruthy();
    expect(bigint_to_bytes(
        BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001"), {signed: true}).equal_to(
        h("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")
      )
    ).toBeTruthy();
  });
  test("signed: false", () => {
    expect(bigint_to_bytes(BigInt(0), {signed: false}).equal_to(h(""))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(1), {signed: false}).equal_to(h("01"))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-1), {signed: false})).toThrow();
    expect(bigint_to_bytes(BigInt(127), {signed: false}).equal_to(h("7f"))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-128), {signed: false})).toThrow();
    expect(bigint_to_bytes(BigInt(255), {signed: false}).equal_to(h("ff"))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-256), {signed: false})).toThrow();
    expect(bigint_to_bytes(BigInt(65535), {signed: false}).equal_to(h("ffff"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(65536), {signed: false}).equal_to(h("010000"))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-65535), {signed: false})).toThrow();
    expect(bigint_to_bytes(BigInt(3735928559), {signed: false}).equal_to(h("deadbeef"))).toBeTruthy();
    expect(bigint_to_bytes(BigInt("16045690984833335023"), {signed: false}).equal_to(h("deadbeefdeadbeef"))).toBeTruthy();
    expect(bigint_to_bytes(
        BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001"), {signed: false}).equal_to(
        h("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")
      )
    ).toBeTruthy();
  });
  test("default option", () => {
    expect(bigint_to_bytes(BigInt(0)).equal_to(bigint_to_bytes(BigInt(0), {signed: false}))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(1)).equal_to(bigint_to_bytes(BigInt(1), {signed: false}))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-1))).toThrow();
    expect(bigint_to_bytes(BigInt(127)).equal_to(bigint_to_bytes(BigInt(127), {signed: false}))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-128))).toThrow();
    expect(bigint_to_bytes(BigInt(255)).equal_to(bigint_to_bytes(BigInt(255), {signed: false}))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-256))).toThrow();
    expect(bigint_to_bytes(BigInt(65535)).equal_to(bigint_to_bytes(BigInt(65535), {signed: false}))).toBeTruthy();
    expect(bigint_to_bytes(BigInt(65536)).equal_to(bigint_to_bytes(BigInt(65536), {signed: false}))).toBeTruthy();
    expect(() => bigint_to_bytes(BigInt(-65535))).toThrow();
    expect(bigint_to_bytes(BigInt(3735928559)).equal_to(bigint_to_bytes(BigInt(3735928559), {signed: false}))).toBeTruthy();
    expect(
        bigint_to_bytes(BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")).equal_to(
        bigint_to_bytes(BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001"), {signed: false})
      )
    ).toBeTruthy();
  });
});

test("limbs_for_int", () => {
  expect(limbs_for_int(0)).toBe(0);
  expect(limbs_for_int(1)).toBe(1);
  expect(limbs_for_int(-255)).toBe(1);
  expect(limbs_for_int(255)).toBe(1);
  expect(limbs_for_int(256)).toBe(2);
  expect(limbs_for_int(256)).toBe(2);
  expect(limbs_for_int(-65535)).toBe(2);
  expect(limbs_for_int(65535)).toBe(2);
  expect(limbs_for_int(65536)).toBe(3);
  expect(limbs_for_int(-65536)).toBe(3);
});

test("minimal signed encoding at power-of-two boundaries", () => {
  // Expected values generated with Python clvm's `int_to_bytes`.
  // Before the fix, values like -32768 and -(2**31) were encoded with a
  // redundant leading 0xff byte (e.g. ff8000 instead of 8000).
  const cases: Array<[string, string]> = [
    ["1", "01"],
    ["-1", "ff"],
    ["127", "7f"],
    ["-127", "81"],
    ["128", "0080"],
    ["-128", "80"],
    ["129", "0081"],
    ["-129", "ff7f"],
    ["255", "00ff"],
    ["-255", "ff01"],
    ["256", "0100"],
    ["-256", "ff00"],
    ["32767", "7fff"],
    ["-32767", "8001"],
    ["32768", "008000"],
    ["-32768", "8000"],
    ["32769", "008001"],
    ["-32769", "ff7fff"],
    ["8388607", "7fffff"],
    ["-8388608", "800000"],
    ["8388608", "00800000"],
    ["-8388609", "ff7fffff"],
    ["2147483647", "7fffffff"],
    ["-2147483648", "80000000"],
    ["2147483648", "0080000000"],
    ["-2147483649", "ff7fffffff"],
    ["140737488355327", "7fffffffffff"],
    ["-140737488355328", "800000000000"],
    ["140737488355328", "00800000000000"],
    ["9223372036854775807", "7fffffffffffffff"],
    ["-9223372036854775808", "8000000000000000"],
    ["9223372036854775808", "008000000000000000"],
    ["-9223372036854775809", "ff7fffffffffffffff"],
  ];
  for(const [decimal, hex] of cases){
    const b = BigInt(decimal);
    expect(bigint_to_bytes(b, {signed: true}).hex()).toBe(hex);
    // round trip
    expect(bigint_from_bytes(h(`0x${hex}`), {signed: true})).toBe(b);
    const n = Number(decimal);
    if(Number.isSafeInteger(n)){
      expect(int_to_bytes(n, {signed: true}).hex()).toBe(hex);
      if(hex.length * 4 <= 52){
        expect(int_from_bytes(h(`0x${hex}`), {signed: true})).toBe(n);
      }
    }
  }
});
