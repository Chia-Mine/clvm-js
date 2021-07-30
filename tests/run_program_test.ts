import {msb_mask} from "../src/run_program";

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
