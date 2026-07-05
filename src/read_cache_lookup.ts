import {None, Optional} from "./__python_types__";
import {Bytes, h, t, Tuple} from "./__type_compatibility__";

const LEFT = 0;
const RIGHT = 1;

/*
 When deserializing a clvm object, a stack of deserialized child objects
 is created, which can be used with back-references. A `ReadCacheLookup` keeps
 track of the state of this stack and all child objects under each root
 node in the stack so that we can quickly determine if a relevant
 back-reference is available.

 In other words, if we've already serialized an object with tree hash T,
 and we encounter another object with that tree hash, we don't re-serialize
 it, but rather include a back-reference to it. This data structure lets
 us quickly determine which back-reference has the shortest path.

 Note that there is a counter. This is because the stack contains some
 child objects that are transient, and no longer appear in the stack
 at later times in the parsing. We don't want to waste time looking for
 these objects that no longer exist, so we reference-count them.

 All hashes correspond to sha256 tree hashes. Since JavaScript `Map`/`Set`
 compare object keys by identity, hashes used as keys (and paths stored in
 sets) are represented by their hex string.
 */
export class ReadCacheLookup {
  public root_hash: Bytes;
  public read_stack: Array<Tuple<Bytes, Bytes>> = [];
  public count: Map<string, number> = new Map();
  public parent_paths_for_child: Map<string, Array<Tuple<string, number>>> = new Map();

  /*
   Create a new `ReadCacheLookup` object with just the null terminator
   (ie. an empty list of objects).
   */
  public constructor() {
    this.root_hash = Bytes.SHA256(Bytes.from([0x01]));
  }

  /*
   This function is used to note that an object with the given hash has just
   been pushed to the read stack, and update the lookups as appropriate.
   */
  public push(obj_hash: Bytes): void {
    // we add two new entries: the new root of the tree, and this object (by id)
    // new_root: (obj_hash, old_root)
    const new_root_hash = Bytes.SHA256(
      Bytes.from([0x02]).concat(obj_hash).concat(this.root_hash)
    );

    this.read_stack.push(t(obj_hash, this.root_hash));

    this.increment_count(obj_hash.hex());
    this.increment_count(new_root_hash.hex());

    const new_parent_to_old_root = t(new_root_hash.hex(), LEFT);
    this.add_parent_path(obj_hash.hex(), new_parent_to_old_root);

    const new_parent_to_id = t(new_root_hash.hex(), RIGHT);
    this.add_parent_path(this.root_hash.hex(), new_parent_to_id);

    this.root_hash = new_root_hash;
  }

  /*
   This function is used to note that the top object has just been popped
   from the read stack. Return the 2-tuple of the child hashes.
   */
  public pop(): Tuple<Bytes, Bytes> {
    const item = this.read_stack.pop();
    if(!item){
      throw new Error("read stack is empty");
    }
    this.increment_count(item[0].hex(), -1);
    this.increment_count(this.root_hash.hex(), -1);
    this.root_hash = item[1];
    return item;
  }

  /*
   This function is used to note that a "pop-and-cons" operation has just
   happened. We remove two objects, cons them together, and push the cons,
   updating the internal look-ups as necessary.
   */
  public pop2_and_cons(): void {
    // we remove two items: the right side of each left/right pair
    const right = this.pop();
    const left = this.pop();

    this.increment_count(left[0].hex());
    this.increment_count(right[0].hex());

    const new_root_hash = Bytes.SHA256(
      Bytes.from([0x02]).concat(left[0]).concat(right[0])
    );

    this.add_parent_path(left[0].hex(), t(new_root_hash.hex(), LEFT));
    this.add_parent_path(right[0].hex(), t(new_root_hash.hex(), RIGHT));

    this.push(new_root_hash);
  }

  /*
   This function looks for a path from the root to a child node with a given hash
   by using the read cache. The returned set contains the hex representation of
   each path.
   */
  public find_paths(obj_hash: Bytes, serialized_length: number): Set<string> {
    const valid_paths = new Set<string>();
    if(serialized_length < 3){
      return valid_paths;
    }

    let seen_ids = new Set<string>();

    const max_bytes_for_path_encoding = serialized_length - 2;
    // 1 byte for 0xfe, 1 min byte for savings

    const max_path_length = max_bytes_for_path_encoding * 8 - 1;
    seen_ids.add(obj_hash.hex());

    let partial_paths: Array<Tuple<string, number[]>> = [t(obj_hash.hex(), [] as number[])];

    const root_hash_hex = this.root_hash.hex();
    while(partial_paths.length){
      const new_seen_ids = new Set(seen_ids);
      const new_partial_paths: Array<Tuple<string, number[]>> = [];
      for(const [node, path] of partial_paths){
        if(node === root_hash_hex){
          valid_paths.add(reversed_path_to_bytes(path).hex());
          continue;
        }

        const parent_paths = this.parent_paths_for_child.get(node);

        if(parent_paths){
          for(const [parent, direction] of parent_paths){
            if((this.count.get(parent) || 0) > 0 && !seen_ids.has(parent)){
              const new_path = path.concat([direction]);
              if(new_path.length > max_path_length){
                return new Set();
              }
              new_partial_paths.push(t(parent, new_path));
            }
            new_seen_ids.add(parent);
          }
        }
      }
      partial_paths = new_partial_paths;
      if(valid_paths.size){
        return valid_paths;
      }
      seen_ids = new Set(new_seen_ids);
    }
    return valid_paths;
  }

  public find_path(obj_hash: Bytes, serialized_length: number): Optional<Bytes> {
    const r = this.find_paths(obj_hash, serialized_length);
    if(r.size === 0){
      return None;
    }
    let min: string|undefined;
    for(const path of r){
      // Comparing hex strings of the same casing is equivalent to comparing
      // the underlying bytes lexicographically.
      if(min === undefined || path < min){
        min = path;
      }
    }
    return h(min as string);
  }

  private increment_count(key: string, delta = 1): void {
    this.count.set(key, (this.count.get(key) || 0) + delta);
  }

  private add_parent_path(key: string, parent_path: Tuple<string, number>): void {
    const paths = this.parent_paths_for_child.get(key);
    if(paths){
      paths.push(parent_path);
    }
    else{
      this.parent_paths_for_child.set(key, [parent_path]);
    }
  }
}

/*
 Convert a list of 0/1 (for left/right) values to a path expected by clvm.

 Reverse the list; convert to a binary number; prepend a 1; break into bytes.

 [] => bytes([0b1])
 [0] => bytes([0b10])
 [1] => bytes([0b11])
 [0, 0] => bytes([0b100])
 [0, 1] => bytes([0b101])
 [1, 0] => bytes([0b110])
 [1, 1] => bytes([0b111])
 [0, 0, 1] => bytes([0b1001])
 [1, 1, 1, 1, 0, 0, 0, 0, 1] => bytes([0b11, 0b11100001])
 */
export function reversed_path_to_bytes(path: number[]): Bytes {
  const byte_count = (path.length + 1 + 7) >> 3;
  const v = new Uint8Array(byte_count);
  let index = byte_count - 1;
  let mask = 1;
  for(let i=path.length-1;i>=0;i--){
    if(path[i]){
      v[index] |= mask;
    }
    if(mask === 0x80){
      index -= 1;
      mask = 1;
    }
    else{
      mask <<= 1;
    }
  }
  v[index] |= mask;
  return new Bytes(v);
}
