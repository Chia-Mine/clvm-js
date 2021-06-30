import { CastableType, SExp } from "./SExp";
import { Bytes, Tuple } from "./__type_compatibility__";
export declare type TOpStack = Array<(op_stack: TOpStack, val_stack: TValStack) => unknown>;
export declare type TValStack = Array<Bytes | SExp | SExp[] | Tuple<SExp, SExp>>;
export declare type TToSexpF = (arg: CastableType) => SExp;
export declare type TToJavascript = Bytes | Bytes[] | Tuple<TToJavascript, TToJavascript> | TToJavascript[];
export declare function as_javascript(sexp: SExp): TToJavascript;
