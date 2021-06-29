import { SExp } from "./SExp";
import { Bytes, Stream } from "./__type_compatibility__";
import { None } from "./__python_types__";
import { TToSexpF } from "./as_javascript";
export declare function sexp_to_byte_iterator(sexp: SExp): Generator<Bytes, void, unknown>;
export declare function atom_to_byte_iterator(atom: Bytes | None): Generator<Bytes, void, unknown>;
export declare function sexp_to_stream(sexp: SExp, f: Stream): void;
export declare function sexp_from_stream(f: Stream, to_sexp_f: TToSexpF): SExp;
export declare function sexp_buffer_from_stream(f: Stream): Bytes;
