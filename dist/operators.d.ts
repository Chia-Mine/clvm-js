import { int, str } from "./__python_types__";
import { SExp } from "./SExp";
import { Bytes, Tuple2 } from "./__type_compatibility__";
import { CLVMObject } from "./CLVMObject";
export declare const KEYWORDS: string[];
export declare const KEYWORD_FROM_ATOM: Record<string, string>;
export declare const KEYWORD_TO_ATOM: Record<string, string>;
export declare const OP_REWRITE: {
    "+": string;
    "-": string;
    "*": string;
    "/": string;
    i: string;
    c: string;
    f: string;
    r: string;
    l: string;
    x: string;
    "=": string;
    ">": string;
    ">s": string;
};
export declare function args_len(op_name: str, args: SExp): Generator<number, void, unknown>;
export declare function default_unknown_op(op: Bytes, args: SExp): Tuple2<int, CLVMObject>;
export declare const QUOTE_ATOM: string;
export declare const APPLY_ATOM: string;
declare type TOpAtomFunctionMap = Record<str, (args: SExp) => unknown>;
export declare type TBaseOpDict = {
    quote_atom: str;
    apply_atom: str;
    unknown_op_handler: typeof default_unknown_op;
} & ((op: Bytes, args: SExp) => Tuple2<int, CLVMObject>);
export declare function OperatorDict(op_atom_function_map: TOpAtomFunctionMap, quote?: str, // `Bytes.toString()` of the quote atom
apply?: str, // `Bytes.toString()` of the apply atom
unknown_op_handler?: typeof default_unknown_op): (op: Bytes, args: SExp) => any;
export declare const OPERATOR_LOOKUP: (op: Bytes, args: SExp) => any;
export {};
