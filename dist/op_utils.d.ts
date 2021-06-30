import { str } from "./__python_types__";
import { SExp } from "./SExp";
export declare function operators_for_dict(keyword_to_atom: Record<str, str>, op_dict: Record<str, unknown>, op_name_lookup: Record<str, str>): Record<string, (args: SExp) => unknown>;
export declare function operators_for_module(keyword_to_atom: Record<str, str>, mod: Record<str, unknown>, op_name_lookup?: Record<str, str>): Record<string, (args: SExp) => unknown>;
