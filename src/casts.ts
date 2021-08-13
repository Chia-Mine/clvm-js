import {None} from "./__python_types__";
import {Bytes} from "./__type_compatibility__";

export function int_from_bytes(b: Bytes|None, option?: {signed?: boolean}): number {
  if(!b || b.length === 0){
    return 0;
  }
  else if(b.length*8 > 52){
    throw new Error("Cannot convert Bytes to Integer larger than 52bit. Use bigint_from_bytes instead.");
  }
  const signed = (option && typeof option.signed === "boolean") ? option.signed : true;
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

export function bigint_from_bytes(b: Bytes|None, option?: {signed?: boolean}): bigint {
  if(!b || b.length === 0){
    return BigInt(0);
  }
  const signed = (option && typeof option.signed === "boolean") ? option.signed : true;
  let unsigned32 = BigInt(0);
  for(let i=b.length-1;i>=0;i--){
    const byte = b.at(i);
    unsigned32 += BigInt(byte) * (BigInt(256)**(BigInt((b.length-1)-i)));
  }
  // If the first bit is 1, it is recognized as a negative number.
  if(signed && (b.at(0) & 0x80)){
    return unsigned32 - (BigInt(1) << BigInt(b.length*8));
  }
  return unsigned32;
}

export function int_to_bytes(v: number): Bytes {
  if(v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER){
    throw new Error(`The int value is beyond ${v > 0 ? "MAX_SAFE_INTEGER" : "MIN_SAFE_INTEGER"}: ${v}`);
  }
  if(v === 0){
    return Bytes.NULL;
  }
  
  let byte_count = 1;
  if(v > 0){
    while(2**(8*byte_count - 1) - 1 < v){
      byte_count++;
    }
  }
  else if(v < 0){
    while(2**(8*byte_count - 1) < -v){
      byte_count++;
    }
  }
  
  const needExtraByte = v > 0 && ((v >> ((byte_count-1)*8)) & 0x80) > 0;
  const u8 = new Uint8Array(byte_count+(needExtraByte ? 1 : 0));
  for(let i=0;i<byte_count;i++){
    const j = needExtraByte ? i+1 : i;
    u8[j] = (v >> (byte_count-i-1)*8) & 0xff;
  }
  
  return new Bytes(u8);
}

export function bigint_to_bytes(v: bigint): Bytes {
  if(v === BigInt(0)){
    return Bytes.NULL;
  }
  let byte_count = 1;
  if(v > 0){
    while(BigInt(2)**(BigInt(8)*BigInt(byte_count) - BigInt(1)) - BigInt(1) < v){
      byte_count++;
    }
  }
  else if(v < 0){
    while(BigInt(2)**(BigInt(8)*BigInt(byte_count) - BigInt(1)) < -v){
      byte_count++;
    }
  }
  
  const needExtraByte = v > 0 && ((v >> (BigInt(byte_count-1)*BigInt(8))) & BigInt(0x80)) > BigInt(0);
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
