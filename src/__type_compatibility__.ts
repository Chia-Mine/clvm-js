import {Hex} from "jscrypto/Hex";
import {Utf8} from "jscrypto/Utf8";
import {Word32Array} from "jscrypto/Word32Array";
import {SHA256} from "jscrypto/SHA256";
import {None, str} from "./__python_types__";
import {G1Element} from "@chiamine/bls-signatures";

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
      this._b = new Uint8Array(value);
    }
    else if(isBytes(value)){
      this._b = value.data();
    }
    else if(!value || value === None){
      this._b = new Uint8Array();
    }
    else{
      throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }
  }
  
  public static from(value?: Uint8Array|Bytes|number[]|str|G1Element|None, type?: BytesFromType){
    if(value instanceof Uint8Array || isBytes(value) || value === None || value === undefined){
      return new Bytes(value);
    }
    else if(Array.isArray(value) && value.every(v => typeof v === "number")){
      if(value.some(v => (v < 0 || v > 255))){
        throw new Error("Bytes must be in range [0, 256)");
      }
      return new Bytes(Uint8Array.from(value));
    }
    else if(typeof value === "string"){
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
  
  public static SHA256(value: str|Bytes|Uint8Array){
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
  
  public get_byte_at(i: number){
    return this._b[i] | 0;
  }
  
  public concat(b: Bytes){
    const w1 = this.as_word();
    const w2 = b.as_word();
    const w = w1.concat(w2);
    return Bytes.from(w.toUint8Array());
  }
  
  public slice(start: number, length?: number){
    const len = typeof length === "number" ? length : (this.length - start);
    return new Bytes(this._b.slice(start, start+len));
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
    return new Bytes(this._b);
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
    if(this.length !== other.length){
      return this.length > other.length ? 1 : -1;
    }
    for(let i=0;i<this.length;i++){
      const self_i = this.get_byte_at(i);
      const other_i = other.get_byte_at(i);
      if(self_i === other_i){
        continue;
      }
      return self_i > other_i ? 1 : -1;
    }
    return 0;
  }
}

export function b(utf8Str: str, type:"utf8"|"hex" = "utf8"){
  return Bytes.from(utf8Str, type);
}

export function h(hexStr: str){
  return Bytes.from(hexStr, "hex");
}

export function list<T = unknown>(iterable: Iterable<T>){
  const arr: T[] = [];
  for(const item of iterable){
    arr.push(item);
  }
  return arr;
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
  return typeof v.length === "number"
    && typeof v.get_byte_at === "function"
    && typeof v.raw === "function"
    && typeof v.data === "function"
    && typeof v.hex === "function"
    && typeof v.decode === "function"
    && typeof v.equal_to === "function"
    && typeof v.compare === "function"
  ;
}

export class Stream {
  private _seek: number;
  private _bytes: Bytes;
  
  public constructor(b?: Bytes) {
    this._bytes = b ? new Bytes(b) : new Bytes();
    this._seek = 0;
  }
  
  public get seek(){
    return this._seek;
  }
  
  public set seek(value){
    if(value < 0){
      this._seek = this._bytes.length - 1;
    }
    else if(value > this._bytes.length - 1){
      this._seek = this._bytes.length;
    }
    else{
      this._seek = value;
    }
  }
  
  public get length(){
    return this._bytes.length;
  }
  
  public write(b: Bytes){
    const ui1 = this._bytes.data();
    const ui2 = b.data();
    const finalLength = Math.max(ui1.length, ui2.length + this._seek);
    const uint8Array = new Uint8Array(finalLength);
    const offset = this.seek;
    
    for(let i=0;i<offset;i++){
      uint8Array[i] = ui1[i];
    }
    for(let i=offset;i<finalLength;i++){
      uint8Array[i] = ui2[i-offset] | 0;
    }
    
    this._bytes = new Bytes(uint8Array);
    this.seek = offset + ui2.length;
    return b.length;
  }
  
  public read(size: number){
    if(this.seek > this._bytes.length-1){
      return new Bytes(); // Return empty byte
    }
    
    const bytes = this._bytes.slice(this.seek, size);
    this.seek += size;
    return bytes;
  }
  
  public getValue(){
    return this._bytes;
  }
}