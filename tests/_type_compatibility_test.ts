import {Bytes, b, h} from "../src/__type_compatibility__";

describe("Bytes", () => {
  test("0x00 > b('')", () => {
    expect(h("0x00").compare(b(""))).toBe(1);
  });
  test("b('') < 0x00", () => {
    expect(b("").compare(h("0x00"))).toBe(-1);
  });
  test("0x00 < 0x0000", () => {
    expect(h("0x00").compare(h("0x0000"))).toBe(-1);
  });
  test("0x1000 > 0x10", () => {
    expect(h("0x1000").compare(h("0x10"))).toBe(1);
  });
  test("0x0010 < 0x10", () => {
    expect(h("0x0010").compare(h("0x10"))).toBe(-1);
  });
  test("0x1000 < 0x20", () => {
    expect(h("0x1000").compare(h("0x20"))).toBe(-1);
  });
  test("0x2000 > 0x20", () => {
    expect(h("0x2000").compare(h("0x20"))).toBe(1);
  });
  test("0x2000 < 0x21", () => {
    expect(h("0x2000").compare(h("0x21"))).toBe(-1);
  });
  test("0x0011 > 0x0010", () => {
    expect(h("0x0011").compare(h("0x0010"))).toBe(1);
  });
  test("0x4433221144332211 == 0x4433221144332211", () => {
    expect(h("0x4433221144332211").compare(h("0x4433221144332211"))).toBe(0);
  });
  test("0x4433221144332211 > 0x4433221144002211", () => {
    expect(h("0x4433221144332211").compare(h("0x4433221144002211"))).toBe(1);
  });
  test("0x4433221144332211 < 0x4433221144332212", () => {
    expect(h("0x4433221144332211").compare(h("0x4433221144332212"))).toBe(-1);
  });
  test("0x4433221144332212 > 0x4433221144332211", () => {
    expect(h("0x4433221144332212").compare(h("0x4433221144002211"))).toBe(1);
  });
  test("0xfedcba9876543210fedcba9876543210fedcba9876543210 == 0xfedcba9876543210fedcba9876543210fedcba9876543210", () => {
    expect(h("0xfedcba9876543210fedcba9876543210fedcba9876543210").compare(h("0xfedcba9876543210fedcba9876543210fedcba9876543210"))).toBe(0);
  });
  test("0xfedcba9876543210fedcbaAA76543210fedcba9876543210 > 0xfedcba9876543210fedcba9876543210fedcba9876543210", () => {
    expect(h("0xfedcba9876543210fedcbaAA76543210fedcba9876543210").compare(h("0xfedcba9876543210fedcba9876543210fedcba9876543210"))).toBe(1);
  });
  test("0xfedcba9876543210fedcba9876543210fedcba9876543210 < 0xffdcba987654", () => {
    expect(h("0xfedcba9876543210fedcba9876543210fedcba9876543210").compare(h("0xffdcba987654"))).toBe(-1);
  });
  test("b('') == b('')", () => {
    expect(b("").compare(b(""))).toBe(0);
  });
  test("0x414243 == b('ABC')", () => {
    expect(h("0x414243").compare(b("ABC"))).toBe(0);
  });
})
