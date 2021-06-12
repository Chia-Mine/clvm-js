import {None, Optional} from "./__python_types__";
import {Bytes, Tuple2} from "./__type_compatibility__";

/*
  This class implements the CLVM Object protocol in the simplest possible way,
  by just having an "atom" and a "pair" field
 */
export class CLVMObject {
  atom: Optional<Bytes> = None;
  // this is always a 2-tuple of an object implementing the CLVM object protocol.
  pair: Optional<Tuple2<any, any>> = None;
  
  public constructor(v: any) {
    if(v instanceof CLVMObject){
      return v;
    }
    
    if(v instanceof Tuple2){
      this.pair = v;
      this.atom = None;
    }
    else{
      this.atom = v;
      this.pair = None;
    }
  }
}
