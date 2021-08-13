import {int_from_bytes, bigint_from_bytes, int_to_bytes, bigint_to_bytes, limbs_for_int} from "../src/casts";
import {None, h} from "../src";

describe("int_from_bytes", () => {
  test("signed: true", () => {
    expect(int_from_bytes(None, {signed: true})).toBe(0);
    expect(int_from_bytes(h("01"), {signed: true})).toBe(1);
    expect(int_from_bytes(h("7f"), {signed: true})).toBe(127);
    expect(int_from_bytes(h("80"), {signed: true})).toBe(-128);
    expect(int_from_bytes(h("ff"), {signed: true})).toBe(-1);
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
})

describe("bigint_from_bytes", () => {
  test("signed: true", () => {
    expect(bigint_from_bytes(None, {signed: true}) === BigInt(0)).toBeTruthy();
    expect(bigint_from_bytes(h("01"), {signed: true}) === BigInt(1)).toBeTruthy();
    expect(bigint_from_bytes(h("7f"), {signed: true}) === BigInt(127)).toBeTruthy();
    expect(bigint_from_bytes(h("80"), {signed: true}) === BigInt(-128)).toBeTruthy();
    expect(bigint_from_bytes(h("ff"), {signed: true}) === BigInt(-1)).toBeTruthy();
    expect(bigint_from_bytes(h("ffffffff"), {signed: true}) === BigInt(-1)).toBeTruthy();
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
    expect(bigint_from_bytes(h("ffffffffffffffff"), {signed: false}) === BigInt("18446744073709551615")).toBeTruthy();
    expect(bigint_from_bytes(h("7fffffffffffffff"), {signed: false}) === BigInt(2)**BigInt(63) - BigInt(1)).toBeTruthy();
  });
});

test("int_to_bytes", () => {
  expect(int_to_bytes(0).equal_to(h(""))).toBeTruthy();
  expect(int_to_bytes(1).equal_to(h("01"))).toBeTruthy();
  expect(int_to_bytes(-1).equal_to(h("ff"))).toBeTruthy();
  expect(int_to_bytes(127).equal_to(h("7f"))).toBeTruthy();
  expect(int_to_bytes(-128).equal_to(h("80"))).toBeTruthy();
  expect(int_to_bytes(255).equal_to(h("00ff"))).toBeTruthy();
  expect(int_to_bytes(-256).equal_to(h("ff00"))).toBeTruthy();
  expect(int_to_bytes(65535).equal_to(h("00ffff"))).toBeTruthy();
  expect(int_to_bytes(65536).equal_to(h("010000"))).toBeTruthy();
  expect(int_to_bytes(-65535).equal_to(h("ff0001"))).toBeTruthy();
  expect(int_to_bytes(-65534).equal_to(h("ff0002"))).toBeTruthy();
  expect(int_to_bytes(-65536).equal_to(h("ff0000"))).toBeTruthy();
});

test("bigint_to_bytes", () => {
  expect(bigint_to_bytes(BigInt(0)).equal_to(h(""))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(1)).equal_to(h("01"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(-1)).equal_to(h("ff"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(127)).equal_to(h("7f"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(-128)).equal_to(h("80"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(255)).equal_to(h("00ff"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(-256)).equal_to(h("ff00"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(65535)).equal_to(h("00ffff"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(65536)).equal_to(h("010000"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(-65535)).equal_to(h("ff0001"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(-65534)).equal_to(h("ff0002"))).toBeTruthy();
  expect(bigint_to_bytes(BigInt(-65536)).equal_to(h("ff0000"))).toBeTruthy();
  expect(bigint_to_bytes(
      BigInt("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")).equal_to(
        h("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001")
      )
  ).toBeTruthy();
});

test("limbs_for_int", () => {
  expect(limbs_for_int(0)).toBe(1);
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
