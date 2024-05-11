import {Hex} from "jscrypto/Hex";
import {Utf8} from "jscrypto/Utf8";
import {Word32Array} from "jscrypto/Word32Array";
import {SHA256} from "jscrypto/SHA256";
import {None} from "./__python_types__";
import {G1Element} from "bls-signatures";

export function to_hexstr(r: Uint8Array) {
  return (new Word32Array(r)).toString();
}

/**
 * Get python's bytes.__repr__ style string.
 * @see https://github.com/python/cpython/blob/main/Objects/bytesobject.c#L1337
 * @param {Uint8Array} r - byteArray to stringify
 */
export function PyBytes_Repr(r: Uint8Array) {
  let squotes = 0;
  let dquotes = 0;
  for(let i=0;i<r.length;i++){
    const b = r[i];
    const c = String.fromCodePoint(b);
    switch(c){
      case "'": squotes++; break;
      case "\"": dquotes++; break;
    }
  }
  let quote = "'";
  if(squotes && !dquotes){
    quote = "\"";
  }
  
  let s = "b" + quote;
  
  for(let i=0;i<r.length;i++){
    const b = r[i];
    const c = String.fromCodePoint(b);
    if(c === quote || c === "\\"){
      s += "\\" + c;
    }
    else if(c === "\t"){
      s += "\\t";
    }
    else if(c === "\n"){
      s += "\\n";
    }
    else if(c === "\r"){
      s += "\\r";
    }
    else if(c < " " || b >= 0x7f){
      s += "\\x";
      s += b.toString(16).padStart(2, "0");
    }
    else{
      s += c;
    }
  }
  
  s += quote;
  
  return s;
}

export type BytesFromType = "hex"|"utf8"|"G1Element";

/**
 * Unlike python, there is no immutable byte type in javascript.
 */
export class Bytes {
  private readonly _b: Uint8Array;
  public static readonly NULL = new Bytes();
  
  public constructor(value?: Uint8Array|Bytes|None) {
    if(value instanceof Uint8Array){
      this._b = value;
    }
    else if(isBytes(value)){
      this._b = value.raw();
    }
    else if(!value || value === None){
      this._b = new Uint8Array();
    }
    else{
      throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }
  }
  
  public static from(value?: Uint8Array|Bytes|number[]|string|G1Element|None, type?: BytesFromType){
    if(value === None || value === null){
      return new Bytes(value);
    }
    else if(value instanceof Uint8Array){
      return new Bytes(value.slice());
    }
    else if(isBytes(value)){
      return new Bytes(value.data());
    }
    else if(Array.isArray(value) && value.every(v => typeof v === "number")){
      if(value.some(v => (v < 0 || v > 255))){
        throw new Error("Bytes must be in range [0, 256)");
      }
      return new Bytes(Uint8Array.from(value));
    }
    else if(typeof value === "string"){
      if(!value){
        return new Bytes();
      }
      if(type === "hex"){
        value = value.replace(/^0x/, "");
        return new Bytes(Hex.parse(value).toUint8Array());
      }
      else /* if(type === "utf8") */ {
        return new Bytes(Utf8.parse(value).toUint8Array());
      }
    }
    else if(type === "G1Element"){
      if(typeof (value as G1Element).serialize !== "function"){
        throw new Error("Invalid G1Element");
      }
      const uint8array = (value as G1Element).serialize();
      return new Bytes(uint8array);
    }
    
    throw new Error(`Invalid value: ${JSON.stringify(value)}`);
  }
  
  public static SHA256(value: string|Bytes|Uint8Array){
    let w;
    if(typeof value === "string"){
      w = SHA256.hash(value);
    }
    else if(value instanceof Uint8Array){
      w = new Word32Array(value);
      w = SHA256.hash(w);
    }
    else if(isBytes(value)){
      w = value.as_word();
      w = SHA256.hash(w);
    }
    else{
      throw new Error("Invalid argument");
    }
    
    return new Bytes(w.toUint8Array());
  }
  
  public get length(){
    return this._b.length;
  }
  
  public at(i: number){
    return this._b[i] | 0;
  }
  
  public concat(b: Bytes){
    const thisBin = this._b;
    const thatBin = b.raw();
    const concatBin = new Uint8Array(thisBin.length + thatBin.length);
    concatBin.set(thisBin, 0);
    concatBin.set(thatBin, thisBin.length);
    return new Bytes(concatBin);
  }
  
  public repeat(n: number){
    const ret = new Uint8Array(this.length*n);
    for(let i=0;i<n;i++){
      ret.set(this._b, i*this.length);
    }
    return new Bytes(ret);
  }
  
  public slice(start: number, length?: number){
    const len = typeof length === "number" ? length : (this.length - start);
    const ui8_clone = this._b.slice(start, start+len);
    return new Bytes(ui8_clone);
  }
  
  public subarray(start: number, length?: number){
    const len = typeof length === "number" ? length : (this.length - start);
    const ui8_raw = this._b.subarray(start, start+len);
    return new Bytes(ui8_raw);
  }
  
  public as_word(){
    return new Word32Array(this._b);
  }
  
  public data(){
    return new Uint8Array(this._b);
  }
  
  public raw(){
    return this._b;
  }
  
  public clone(){
    return new Bytes(this._b.slice());
  }
  
  public toString(){
    return PyBytes_Repr(this._b);
  }
  
  public hex(){
    return to_hexstr(this._b);
  }
  
  public decode(){
    return Utf8.stringify(this.as_word());
  }
  
  public startswith(b: Bytes){
    return this.hex().startsWith(b.hex());
  }
  
  public endswith(b: Bytes){
    return this.hex().endsWith(b.hex());
  }
  
  public equal_to(b: Bytes|None|any){
    if(b === None){
      return false;
    }
    else if(typeof b.length === "number" && isBytes(b)){
      return this.compare(b) === 0;
    }
    else if(typeof b.equal_to === "function"){
      return b.equal_to(this) as boolean;
    }
    return false;
  }
  
  /**
   * Returns:
   *   +1 if argument is smaller
   *   0 if this and argument is the same
   *   -1 if argument is larger
   * @param other
   */
  public compare(other: Bytes): -1|0|1 {
    if(this.length === 0 && other.length === 0){
      return 0;
    }
    else if(this.length * other.length === 0){ // Either length of this or other is zero.
      return this.length > 0 ? 1 : -1;
    }
    const self_raw_byte = this._b;
    const self_byteLength = self_raw_byte.byteLength;
    const dv_self = new DataView(self_raw_byte.buffer, self_raw_byte.byteOffset, self_byteLength);
    const other_raw_byte = other.raw();
    const other_byteLength = other_raw_byte.byteLength;
    const dv_other = new DataView(other_raw_byte.buffer, other_raw_byte.byteOffset, other_byteLength);
  
    // const minByteLength = Math.min(self_byteLength, other_byteLength); 
    const minByteLength = Math.min(self_byteLength, other_byteLength) - 4;
    const ui32MaxCount = (Math.max(self_byteLength, other_byteLength) / 4) | 0;
    let offset = 0;
    for(offset=0;offset<ui32MaxCount;offset++){
      const k = offset*4;
      // if(k + 4 > minByteLength){ // k > minByteLength - 4 ==(optimize)==> minByteLength = minByteLength - 4
      if(k > minByteLength){
        break;
      }
      const ui32_self = dv_self.getUint32(k);
      const ui32_other = dv_other.getUint32(k);
      if(ui32_self !== ui32_other){
        return ui32_self > ui32_other ? 1 : -1;
      }
    }
  
    offset = offset*4;
    const ui8MaxCount = Math.max(self_byteLength, other_byteLength);
    for(let i=offset;i<ui8MaxCount;i++){
      const k = i + 1;
      if(k > self_byteLength){
        return -1;
      }
      else if(k > other_byteLength){
        return 1;
      }
      const ui8_self = dv_self.getUint8(i);
      const ui8_other = dv_other.getUint8(i);
      if(ui8_self !== ui8_other){
        return ui8_self > ui8_other ? 1 : -1;
      }
    }
  
    return 0;
  }
  
  public toJSON(){
    return this.hex();
  }
}

export function b(utf8Str: string, type:"utf8"|"hex" = "utf8"){
  return Bytes.from(utf8Str, type);
}

export function h(hexStr: string){
  return Bytes.from(hexStr, "hex");
}

export function list<T = unknown>(iterable: Iterable<T>){
  const arr: T[] = [];
  for(const item of iterable){
    arr.push(item);
  }
  return arr;
}

export function str(x: any){
  if(typeof x.toString === "function"){
    return x.toString();
  }
  return `${x}`;
}

export function repr(x: any){
  if(typeof x.__repr__ === "function"){
    return x.__repr__();
  }
  return str(x);
}

export class Tuple<T1, T2> extends Array<any> {
  public constructor(...items: [T1, T2]) {
    super(...items);
    Object.freeze(this);
    return this;
  }
  
  public toString(){
    return `(${this[0]}, ${this[1]})`;
  }
}

export function t<T1, T2>(v1: T1, v2: T2){
  return new Tuple(v1, v2);
}

export function isTuple(v: unknown): v is Tuple<unknown, unknown> {
  return v instanceof Array && Object.isFrozen(v) && v.length === 2;
}

/**
 * Check whether an argument is a list and not a tuple
 */
export function isList(v: unknown): v is unknown[] {
  return Array.isArray(v) && !isTuple(v);
}

export function isIterable(v: any): v is unknown[] {
  if(Array.isArray(v)){ // Including Tuple.
    return true;
  }
  else if(typeof v === "string"){
    return false;
  }
  else if(typeof v[Symbol.iterator] === "function"){
    return true;
  }
  return false;
}

export function isBytes(v: any): v is Bytes {
  return v && typeof v.length === "number"
    && typeof v.at === "function"
    && typeof v.raw === "function"
    && typeof v.data === "function"
    && typeof v.hex === "function"
    && typeof v.decode === "function"
    && typeof v.equal_to === "function"
    && typeof v.compare === "function"
  ;
}

export class Stream {
  public static readonly INITIAL_BUFFER_SIZE = 64*1024;
  private _seek: number;
  private _length: number;
  private _buffer: Uint8Array;
  private _bufAllocMultiplier = 4;
  
  public constructor(b?: Bytes) {
    this._seek = 0;
    
    if(b){
      if(b.length > Stream.INITIAL_BUFFER_SIZE){
        this._buffer = new Uint8Array(b.length*2);
      }
      else{
        this._buffer = new Uint8Array(Stream.INITIAL_BUFFER_SIZE);
      }
      
      this._buffer.set(b.raw());
      this._length = b.length;
    }
    else{
      this._buffer = new Uint8Array(Stream.INITIAL_BUFFER_SIZE);
      this._length = 0;
    }
  }
  
  public get seek(){
    return this._seek;
  }
  
  public set seek(value){
    if(value < 0){
      this._seek = this.length - 1;
    }
    else if(value > this.length - 1){
      this._seek = this.length;
    }
    else{
      this._seek = value;
    }
  }
  
  public get length(){
    return this._length;
  }
  
  protected reAllocate(size?: number){
    let s = typeof size === "number" ? size : this._buffer.length * this._bufAllocMultiplier;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_array_length
     */
    if(s > 4294967295){ // 4294967295 = 2**32 - 1
      s = 4294967295;
    }
    const buf = new Uint8Array(s);
    buf.set(this._buffer);
    this._buffer = buf;
  }
  
  public write(b: Bytes){
    const newLength = Math.max(this.length, b.length + this._seek);
    if(newLength > this._buffer.length){
      this.reAllocate(newLength * this._bufAllocMultiplier);
    }
    
    const offset = this.seek;
    this._buffer.set(b.raw(), offset);
    
    this._length = newLength;
    this.seek += b.length; // Don't move this line prior to `this._length = newLength`!
    return b.length;
  }
  
  public read(size: number): Bytes {
    if(this.seek > this.length-1){
      return new Bytes(); // Return empty byte
    }
    
    if(this.seek + size <= this.length){
      const u8 = this._buffer.subarray(this.seek, this.seek + size);
      this.seek += size;
      return new Bytes(u8);
    }
    
    const u8 = this._buffer.subarray(this.seek, this.length);
    this.seek += size;
    return new Bytes(u8);
  }
  
  public getValue(): Bytes {
    return new Bytes(this.asUint8Array());
  }
  
  public asUint8Array(): Uint8Array {
    return this._buffer.subarray(0, this.length);
  }
}

/**
 * Python's style division.
 * In javascript, `-8 / 5 === -1` while `-8 / 5 == -2` in Python
 */
export function division(a: bigint, b: bigint): bigint {
  if(a === BigInt(0)){
    return a;
  }
  else if(b === BigInt(0)){
    throw new Error("Division by zero!");
  }
  else if(a > BigInt(0) && b > BigInt(0) && a < b){
    return BigInt(0);
  }
  else if(a < BigInt(0) && b < BigInt(0) && a > b){
    return BigInt(0);
  }
  
  const div = a / b;
  if(a === div*b){
    return div;
  }
  else if(div > BigInt(0)){
    return div;
  }
  return div - BigInt(1);
}

/**
 * Python's style modulo.
 * In javascript, `-8 % 5 === -3` while `-8 % 5 == 2` in Python
 */
export function modulo(a: bigint, b: bigint): bigint {
  const div = division(a, b);
  return a - b*div;
}

export function divmod(a: bigint, b: bigint): Tuple<bigint, bigint> {
  const div = division(a, b);
  return t(div, a - b*div);
}
