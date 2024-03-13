import {SExp} from "./SExp";

export function operators_for_dict(
  keyword_to_atom: Record<string, string>,
  op_dict: Record<string, unknown>,
  op_name_lookup?: Record<string, string>,
){
  if (!op_name_lookup){
    op_name_lookup = {};
  }
  const d: Record<string, (args: SExp) => unknown> = {};
  for(const op of Object.keys(keyword_to_atom)){
    const op_name = `op_${op_name_lookup[op] || op}`;
    const op_f = op_dict[op_name] as (args: SExp) => unknown;
    if(typeof op_f === "function"){
      d[keyword_to_atom[op]] = op_f;
    }
  }
  return d;
}

export function operators_for_module(
  keyword_to_atom: Record<string, string>,
  mod: Record<string, unknown>,
  op_name_lookup?: Record<string, string>,
){
  if (!op_name_lookup){
    op_name_lookup = {};
  }
  return operators_for_dict(keyword_to_atom, mod, op_name_lookup);
}