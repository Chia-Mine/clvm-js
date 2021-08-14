import {None} from "./__python_types__";
import {Bytes} from "./__type_compatibility__";

export type TConvertOption = {
  signed: boolean;
};

export function int_from_bytes(b: Bytes|None, option?: Partial<TConvertOption>): number {
  if(!b || b.length === 0){
    return 0;
  }
  else if(b.length*8 > 52){
    throw new Error("Cannot convert Bytes to Integer larger than 52bit. Use bigint_from_bytes instead.");
  }
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  let unsigned32 = 0;
  for(let i=b.length-1;i>=0;i--){
    const byte = b.at(i);
    unsigned32 += byte * (256**((b.length-1)-i));
  }
  // If the first bit is 1, it is recognized as a negative number.
  if(signed && (b.at(0) & 0x80)){
    return unsigned32 - (256**b.length);
  }
  return unsigned32;
}

export function bigint_from_bytes(b: Bytes|None, option?: Partial<TConvertOption>): bigint {
  if(!b || b.length === 0){
    return BigInt(0);
  }
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  let unsigned32 = BigInt(0);
  const ui8array = b.raw();
  const dv = new DataView(ui8array.buffer);
  const bytes4Remain = dv.byteLength % 4;
  const bytes4Length = (dv.byteLength - bytes4Remain) / 4;
  
  if(bytes4Length > 0){
    const byte32 = dv.getUint32((bytes4Length-1)*4 + bytes4Remain);
    unsigned32 += BigInt(byte32);
  }
  // let order = BigInt(4294967296) << (BigInt(32)*BigInt(0));
  for(let i=bytes4Length-2;i>=0;i--){
    const byte32 = dv.getUint32(i*4 + bytes4Remain);
    // unsigned32 += BigInt(byte32) * (BigInt(4294967296)**(BigInt(bytes4Length-1-i)));
    unsigned32 += BigInt(byte32) * (BigInt(4294967296) << (BigInt(32) * BigInt(bytes4Length-2-i)));
  }
  
  if(bytes4Remain > 0){
    const byte = ui8array[bytes4Remain-1];
    if(bytes4Length === 0){
      unsigned32 += BigInt(byte);
      for(let i=bytes4Remain-2;i>=0;i--){
        const byte = ui8array[i];
        unsigned32 += BigInt(byte) * (BigInt(256) << (BigInt(8) * BigInt(bytes4Remain-2-i)));
      }
    }
    else{
      unsigned32 += BigInt(byte) * (BigInt(256) << (BigInt(8) * BigInt(b.length-1-bytes4Remain)));
      for(let i=bytes4Remain-2;i>=0;i--){
        const byte = ui8array[i];
        // unsigned32 += BigInt(byte) * (BigInt(256)**(BigInt(b.length-1-i)));
        unsigned32 += BigInt(byte) * (BigInt(256) << (BigInt(8) * BigInt(b.length-2-i)));
      }
    }
  }
  
  // If the first bit is 1, it is recognized as a negative number.
  if(signed && (ui8array[0] & 0x80)){
    return unsigned32 - (BigInt(1) << BigInt(b.length*8));
  }
  return unsigned32;
}

export function int_to_bytes(v: number, option?: Partial<TConvertOption>): Bytes {
  if(v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER){
    throw new Error(`The int value is beyond ${v > 0 ? "MAX_SAFE_INTEGER" : "MIN_SAFE_INTEGER"}: ${v}`);
  }
  if(v === 0){
    return Bytes.NULL;
  }
  
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  if(!signed && v < 0){
    throw new Error("OverflowError: can't convert negative int to unsigned");
  }
  let byte_count = 1;
  if(v > 0){
    while(2**(8*byte_count - (signed ? 1 : 0)) - 1 < v){
      byte_count++;
    }
  }
  else if(v < 0){
    while(2**(8*byte_count - 1) < -v){
      byte_count++;
    }
  }
  
  const needExtraByte = signed && v > 0 && ((v >> ((byte_count-1)*8)) & 0x80) > 0;
  const u8 = new Uint8Array(byte_count+(needExtraByte ? 1 : 0));
  for(let i=0;i<byte_count;i++){
    const j = needExtraByte ? i+1 : i;
    u8[j] = (v >> (byte_count-i-1)*8) & 0xff;
  }
  
  return new Bytes(u8);
}

export function bigint_to_bytes(v: bigint, option?: Partial<TConvertOption>): Bytes {
  if(v === BigInt(0)){
    return Bytes.NULL;
  }
  
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  if(!signed && v < BigInt(0)){
    throw new Error("OverflowError: can't convert negative int to unsigned");
  }
  let byte_count = 1;
  if(v > 0){
    while(BigInt(2)**(BigInt(8)*BigInt(byte_count) - (signed ? BigInt(1) : BigInt(0))) - BigInt(1) < v){
      byte_count++;
    }
  }
  else if(v < 0){
    while(BigInt(2)**(BigInt(8)*BigInt(byte_count) - BigInt(1)) < -v){
      byte_count++;
    }
  }
  
  const needExtraByte = signed && v > 0 && ((v >> (BigInt(byte_count-1)*BigInt(8))) & BigInt(0x80)) > BigInt(0);
  const u8 = new Uint8Array(byte_count+(needExtraByte ? 1 : 0));
  for(let i=0;i<byte_count;i++){
    const j = needExtraByte ? i+1 : i;
    u8[j] = Number((v >> (BigInt(byte_count-i-1))*BigInt(8)) & BigInt(0xff));
  }
  
  return new Bytes(u8);
}

/**
 * Return the number of bytes required to represent this integer.
 * @param {number} v
 */
export function limbs_for_int(v: number|bigint): number {
  return ((v >= 0 ? v : -v).toString(2).length + 7) >> 3;
}
