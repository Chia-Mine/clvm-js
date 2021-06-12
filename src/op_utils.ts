import {str} from "./__python_types__";
import {SExp} from "./SExp";

export function operators_for_dict(
  keyword_to_atom: Record<str, str>,
  op_dict: Record<str, unknown>,
  op_name_lookup: Record<str, str>,
){
  const d: Record<str, (args: SExp) => unknown> = {};
  for(const op of Object(keyword_to_atom).keys()){
    const op_name = `op_${op_name_lookup[op] || op}`;
    const op_f = op_dict[op_name] as (args: SExp) => unknown;
    if(typeof op_f === "function"){
      d[keyword_to_atom[op]] = op_f;
    }
  }
  return d;
}

export function operators_for_module(
  keyword_to_atom: Record<str, str>,
  mod: Record<str, unknown>,
  op_name_lookup: Record<str, str> = {},
){
  return operators_for_dict(keyword_to_atom, mod, op_name_lookup);
}