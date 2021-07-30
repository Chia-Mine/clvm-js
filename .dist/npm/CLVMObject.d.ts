import { None, Optional } from "./__python_types__";
import { Bytes, Tuple } from "./__type_compatibility__";
export declare type CLVMType = {
    atom: Optional<Bytes>;
    pair: Optional<Tuple<any, any>>;
};
export declare type Atom = {
    atom: Bytes;
    pair: None;
};
export declare type Cons = {
    atom: None;
    pair: Tuple<any, any>;
};
export declare class CLVMObject implements CLVMType {
    atom: Optional<Bytes>;
    pair: Optional<Tuple<any, any>>;
    constructor(v: any);
}
export declare function isAtom(obj: CLVMType): obj is Atom;
export declare function isCons(obj: CLVMType): obj is Cons;
export declare function isCLVMObject(v: any): v is CLVMObject;
