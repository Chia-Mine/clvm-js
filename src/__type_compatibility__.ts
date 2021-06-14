import {Hex, Utf8, Word32Array} from "jscrypto";
import {int, None, str} from "./__python_types__";
import {G1Element} from "bls-signatures";

export function to_hexstr(i: Uint8Array) {
  const hex = (new Word32Array(i)).toString(Hex);
  if(hex === "00" || hex === "ff"){
    return hex;
  }
  return hex.replace(/^([0]{2})+|^([f]{2})+/, "");
}

/**
 * Unlike python, there is no immutable byte type in javascript.
 */
export class Bytes {
  private readonly _b: Uint8Array;
  public static readonly NULL = new Bytes();
  
  public static from(value: Word32Array|Uint8Array|Bytes|str|int[]|G1Element|None, type?: "hex"){
    if(type === "hex" && typeof value === "string"){
      return new Bytes([parseInt(value, 16)]);
    }
    return new Bytes(value);
  }
  
  public constructor(value?: Word32Array|Uint8Array|Bytes|str|int[]|G1Element|None) {
    if(value instanceof Word32Array){
      this._b = value.toUint8Array();
    }
    else if(value instanceof Uint8Array){
      this._b = new Uint8Array(value);
    }
    else if(value instanceof Bytes){
      this._b = value.data();
    }
    else if(typeof value === "string"){
      this._b = Utf8.parse(value).toUint8Array();
    }
    else if(Array.isArray(value)){
      const w = Hex.parse(value.map(v => v.toString(16).padStart(2, "0")).join(""));
      this._b = w.toUint8Array();
    }
    else if(!value || value === None){
      this._b = new Uint8Array();
    }
    else if(typeof value.serialize === "function"){
      this._b = value.serialize();
    }
    else{
      throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }
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
    return new Bytes(w);
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
    return to_hexstr(this._b);
  }
  
  public equal_to(b: Bytes){
    return this.toString() === b.toString();
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


export class Tuple2<T1, T2> {
  private readonly _value: [T1, T2];
  
  public constructor(v1: T1, v2: T2) {
    this._value = [v1, v2];
  }
  
  public get0() {
    return this._value[0];
  }
  
  public get1() {
    return this._value[1];
  }
  
  public as_array() {
    return [this.get0(), this.get1()];
  }
  
  public toString(){
    return `(${this._value[0]}, ${this._value[1]})`;
  }
}

export function t<T1, T2>(v1: T1, v2: T2){
  return new Tuple2(v1, v2);
}

export function isIterable(v: any): v is Array<unknown> {
  if(Array.isArray(v)){
    return true;
  }
  else if(typeof v[Symbol.iterator] === "function"){
    return true;
  }
  return false;
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
