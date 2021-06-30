import { SExp } from "./SExp";
export declare function op_if(args: SExp): import("./__type_compatibility__").Tuple<number, SExp>;
export declare function op_cons(args: SExp): import("./__type_compatibility__").Tuple<number, SExp>;
export declare function op_first(args: SExp): import("./__type_compatibility__").Tuple<number, SExp>;
export declare function op_rest(args: SExp): import("./__type_compatibility__").Tuple<number, SExp>;
export declare function op_listp(args: SExp): import("./__type_compatibility__").Tuple<number, SExp>;
export declare function op_raise(args: SExp): void;
export declare function op_eq(args: SExp): import("./__type_compatibility__").Tuple<number, SExp>;
