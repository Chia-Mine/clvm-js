/*
export type int = number;
export type int8 = number;
export type uint8 = number;
export type int16 = number;
export type uint16 = number;
export type int32 = number;
export type uint32 = number;
export type int64 = BigInt;
export type uint64 = BigInt;
export type uint128 = BigInt;
export type int512 = BigInt;
export type float = number;
export type str = string;
export type bool = boolean;
export type True = true;
export type False = false;
*/
export const None = undefined;
// eslint-disable-next-line no-redeclare
export type None = undefined;

export type Optional<T> = T | None;
