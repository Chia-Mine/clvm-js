import { CastableType, SExp } from "./SExp";
import { Bytes, Tuple2 } from "./__type_compatibility__";
export declare type TOpStack = Array<(op_stack: TOpStack, val_stack: TValStack) => unknown>;
export declare type TValStack = Array<Bytes | SExp | SExp[] | Tuple2<SExp, SExp>>;
export declare type TToSexpF = (arg: CastableType) => SExp;
export declare function as_javascript(sexp: SExp): SExp;
