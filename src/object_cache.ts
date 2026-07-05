import {Bytes} from "./__type_compatibility__";
import {CLVMType} from "./CLVMObject";

/*
 `ObjectCache` provides a way to calculate and cache values for each node
 in a clvm object tree. It can be used to calculate the sha256 tree hash
 for an object and save the hash for all the child objects for building
 usage tables, for example.

 It also allows a function that's defined recursively on a clvm tree to
 have a non-recursive implementation (as it keeps a stack of uncached
 objects locally).
 */
export class ObjectCache<T> {
  /*
   The function `f` is expected to calculate its T value recursively based
   on the T values for the left and right child for a pair. For an atom, the
   function f must calculate the T value directly.

   If a pair is passed and one of the children does not have its T value cached
   in `ObjectCache` yet, return `undefined` and f will be called with each child
   in turn. Don't recurse in f; that's part of the point of this class.
   */
  private readonly f: (cache: ObjectCache<T>, obj: CLVMType) => T|undefined;
  private readonly lookup: Map<CLVMType, T> = new Map();

  public constructor(f: (cache: ObjectCache<T>, obj: CLVMType) => T|undefined) {
    this.f = f;
  }

  public get(obj: CLVMType): T {
    if(!this.lookup.has(obj)){
      const obj_list = [obj];
      while(obj_list.length){
        const node = obj_list.pop() as CLVMType;
        if(!this.lookup.has(node)){
          const v = this.f(this, node);
          if(v === undefined){
            if(!node.pair){
              throw new Error("f returned undefined for atom");
            }
            obj_list.push(node);
            obj_list.push(node.pair[0]);
            obj_list.push(node.pair[1]);
          }
          else{
            this.lookup.set(node, v);
          }
        }
      }
    }
    return this.lookup.get(obj) as T;
  }

  public contains(obj: CLVMType): boolean {
    return this.lookup.has(obj);
  }
}

/*
 This function can be fed to `ObjectCache` to calculate the sha256 tree
 hash for all objects in a tree.
 */
export function treehash(cache: ObjectCache<Bytes>, obj: CLVMType): Bytes|undefined {
  if(obj.pair){
    const [left, right] = obj.pair as [CLVMType, CLVMType];

    // ensure both `left` and `right` have cached values
    if(cache.contains(left) && cache.contains(right)){
      const left_hash = cache.get(left);
      const right_hash = cache.get(right);
      return Bytes.SHA256(
        Bytes.from([0x02]).concat(left_hash).concat(right_hash)
      );
    }
    return undefined;
  }
  return Bytes.SHA256(Bytes.from([0x01]).concat(obj.atom as Bytes));
}

/*
 This function can be fed to `ObjectCache` to calculate the serialized
 length for all objects in a tree.
 */
export function serialized_length(cache: ObjectCache<number>, obj: CLVMType): number|undefined {
  if(obj.pair){
    const [left, right] = obj.pair as [CLVMType, CLVMType];

    // ensure both `left` and `right` have cached values
    if(cache.contains(left) && cache.contains(right)){
      const left_length = cache.get(left);
      const right_length = cache.get(right);
      return 1 + left_length + right_length;
    }
    return undefined;
  }
  const lb = (obj.atom as Bytes).length;
  if(lb === 0 || (lb === 1 && (obj.atom as Bytes).at(0) < 128)){
    return 1;
  }
  if(lb < 0x40){
    return 1 + lb;
  }
  if(lb < 0x2000){
    return 2 + lb;
  }
  if(lb < 0x100000){
    return 3 + lb;
  }
  if(lb < 0x8000000){
    return 4 + lb;
  }
  if(lb < 0x400000000){
    return 5 + lb;
  }
  throw new Error(`atom of size ${lb} too long`);
}
