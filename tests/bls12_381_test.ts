import {initializeBLS} from "../src/__bls_signatures__";
import {Bytes} from "../src/__type_compatibility__";

let BLS: ReturnType<typeof initializeBLS> extends Promise<infer T> ? T : never;
beforeAll(async () => {
  BLS = await initializeBLS();
});

test("test_stream", () => {
  const {G1Element, PrivateKey} = BLS;
  
  for(let _=1;_<64;_++){
    const _ToBytes = Uint8Array.from([...new Array(32)].map((v,k) => k < 31 ? 0 : _));
    const p = PrivateKey.from_bytes(_ToBytes, false).get_g1();
    const blob = Bytes.from(p, "G1Element");
    const p1 = G1Element.from_bytes(blob.raw());
    expect(blob.length).toBe(48);
    expect(p.equal_to(p1));
  }
});
