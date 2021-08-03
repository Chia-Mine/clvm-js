import {int_from_bytes, bigint_from_bytes, int_to_bytes, bigint_to_bytes, limbs_for_int} from "../src/casts";
import {None, h} from "../src";

test("int_from_bytes", () => {
  expect(int_from_bytes(None)).toBe(0);
  expect(int_from_bytes(h("01"))).toBe(1);
  expect(int_from_bytes(h("7f"))).toBe(127);
  expect(int_from_bytes(h("80"))).toBe(-128);
  expect(int_from_bytes(h("ff"))).toBe(-1);
  expect(int_from_bytes(h("ffffffff"))).toBe(-1);
  expect(() => int_from_bytes(h("ffffffffffffffff"))).toThrow();
});

test("bigint_from_bytes", () => {
  expect(bigint_from_bytes(None)).toBe(BigInt(0));
  expect(bigint_from_bytes(h("01"))).toBe(BigInt(1));
  expect(bigint_from_bytes(h("7f"))).toBe(BigInt(127));
  expect(bigint_from_bytes(h("80"))).toBe(BigInt(-128));
  expect(bigint_from_bytes(h("ff"))).toBe(BigInt(-1));
  expect(bigint_from_bytes(h("ffffffff"))).toBe(BigInt(-1));
  expect(bigint_from_bytes(h("ffffffffffffffff"))).toBe(BigInt(-1));
  expect(bigint_from_bytes(h("7fffffffffffffff"))).toBe(BigInt(2)**BigInt(63) - BigInt(1));
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
