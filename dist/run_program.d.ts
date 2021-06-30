import { int, None, uint8 } from "./__python_types__";
import { SExp } from "./SExp";
import { TToSexpF } from "./as_javascript";
import { CLVMObject } from "./CLVMObject";
import { Tuple } from "./__type_compatibility__";
import { TOperatorDict } from "./operators";
export declare type OpCallable = (opStack: OpStackType, valStack: ValStackType) => int;
export declare type ValStackType = SExp[];
export declare type OpStackType = OpCallable[];
export declare type TPreEvalF = (v1: SExp, v2: SExp) => unknown;
export declare function to_pre_eval_op(pre_eval_f: TPreEvalF, to_sexp_f: TToSexpF): (op_stack: OpStackType, value_stack: ValStackType) => void;
export declare function msb_mask(byte: uint8): number;
export declare function run_program(program: SExp, args: CLVMObject, operator_lookup: TOperatorDict, max_cost?: number | None, pre_eval_f?: TPreEvalF | None): Tuple<int, CLVMObject>;
