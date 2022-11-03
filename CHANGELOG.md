# Changelog

## [2.0.1]
This version is compatible with [`480b32840c525e17b5ab2f29036c033febaae71e`](https://github.com/Chia-Network/clvm/tree/480b32840c525e17b5ab2f29036c033febaae71e) of [clvm](https://github.com/Chia-Network/clvm)

### Changed
- Changed error message format if argument of `x` is a single atom.  
  For example, when you run `(x (q . 2000))`, output will be  
  (Prev) `FAIL: clvm raise (2000)` => (Now)  `FAIL: clvm raise 2000`

## [2.0.0]
This version is compatible with [`fc73cd9dc2fc30a1fd461d0f05af9f9679e042c8`](https://github.com/Chia-Network/clvm/tree/fc73cd9dc2fc30a1fd461d0f05af9f9679e042c8) of [clvm](https://github.com/Chia-Network/clvm)

### Breaking Change
The behaviour of `op_div` has changed. See detailed explanation [here](https://www.chia.net/2022/03/04/divided-we-fork.en.html) 

### Changed
- Made `op_div` bug-compatible with `clvm_rs`
- Replaced npm package `@chiamine/bls-signatures` with `bls-signatures`

## [1.0.9]
This version is compatible with [`389efa3fbe65c77600da63c78d29c0866d292754`](https://github.com/Chia-Network/clvm/tree/389efa3fbe65c77600da63c78d29c0866d292754) of [clvm](https://github.com/Chia-Network/clvm)

### Fixed
- Fixed an issue of `as_javascript` with tuples inside tuples and ending with 0

## [1.0.8]
This version is compatible with [`2722c78ddb92f067c5025196f397e4d2955f9053`](https://github.com/Chia-Network/clvm/tree/2722c78ddb92f067c5025196f397e4d2955f9053) of [clvm](https://github.com/Chia-Network/clvm)

### Fixed
- Fixed typo in error message
- Fixed an issue where `op_substr` did not work as expected.
- Fixed an issue where cost calculation for `op_subtract` was not correct.
- Fixed `limbs_for_int` return wrong value when argument is `0`.
- Fixed an issue where `Bytes` comparison returns wrong result in some cases.
- Fixed an issue where `op_softfork` crashed with argument atom larger than or equal to 53bit.
- Fixed G1Element error message.

## [1.0.7]
This version is compatible with [`2722c78ddb92f067c5025196f397e4d2955f9053`](https://github.com/Chia-Network/clvm/tree/2722c78ddb92f067c5025196f397e4d2955f9053) of [clvm](https://github.com/Chia-Network/clvm)

### Added
- Added type declaration file `browser/index.d.ts` on build.
### Changed
- Changed SExp/CLVMObject properties `atom` and `pair` to readonly to prevent potential bug.
- Changed `src/__bls_signatures__.ts` location to `src/__bls_signatures__/index.ts` to prepare for future wasm-loading tweaks.
- Upgraded `@chiamine/bls-signatures` to 0.2.1-beta.2.
- Use `CLVMType` instead of `CLVMObject` as a valid type representation of `CLVMObject`.  
  (CLVMObject should not be used as a type because there might be number of type incompatibility due to new private field)
- <strike>Replace `**` operator on `BigInt` by user-defined function because babel or some transpiler always converts `**` to `Math.pow` which cannot be used with `BigInt`</strike>  
  - Although I tried this, it turns out to be 100x slower than `**` operator, so I gave up. It is required to disable such a transform by end-developer. See detail [here](./README.md#browser-compatibility)

## [1.0.6]
This version is compatible with [`2722c78ddb92f067c5025196f397e4d2955f9053`](https://github.com/Chia-Network/clvm/tree/2722c78ddb92f067c5025196f397e4d2955f9053) of [clvm](https://github.com/Chia-Network/clvm)

### Changed
- Improved `bigint_from_bytes` around 3-10 times faster.
- Improved `int_from_bytes` performance.
- Improved `bigint_to_bytes` around 2 times faster.
- Improved `int_to_bytes` performance.
### Fixed
- Fixed an issue where utility function `division`/`modulo` returned wrong values in some cases.
### Added
- Added `divmod` utility function.

## [1.0.5]
This version is compatible with [`ab4560900cf475ff515054bec0ca9a4491aca366`](https://github.com/Chia-Network/clvm/tree/ab4560900cf475ff515054bec0ca9a4491aca366) of [clvm](https://github.com/Chia-Network/clvm)

### Fixed
- Fixed an issue where `op_lsh` did not work as expected.

## [1.0.4]
This version is compatible with [`ab4560900cf475ff515054bec0ca9a4491aca366`](https://github.com/Chia-Network/clvm/tree/ab4560900cf475ff515054bec0ca9a4491aca366) of [clvm](https://github.com/Chia-Network/clvm)

### Fixed
- Fixed an issue where `int_from_bytes` and `bigint_from_bytes` returned always signed int/bigint.
- Fixed an issue where `int_to_bytes` and `bigint_to_bytes` blindly recognized the argument as a signed int/bigint.

## [1.0.3]
This version is compatible with [`ab4560900cf475ff515054bec0ca9a4491aca366`](https://github.com/Chia-Network/clvm/tree/ab4560900cf475ff515054bec0ca9a4491aca366) of [clvm](https://github.com/Chia-Network/clvm)

### Fixed
- Fixed an issue where `op_logand`, `op_logior`, `op_logxor` did not work
- Fixed an issue where result of div/mod against negative `bigint` was not compatible with original `clvm`

## [1.0.2]
This version is compatible with [`1a5cb17895d8707f784a85180bc97d3c6ebe71a0`](https://github.com/Chia-Network/clvm/tree/1a5cb17895d8707f784a85180bc97d3c6ebe71a0) of [clvm](https://github.com/Chia-Network/clvm)

### Fixed
- Fixed an issue where `op_pubkey_for_exp` was missing.
- Fixed an issue where arithmetic op of atoms larger than 32 bit integer did not work.
### Added
- Added `bigint_to_bytes` function in `src/casts.ts`
- Added tests for Bytes-BigInt conversion.

## [1.0.1]
This version is compatible with [`1a5cb17895d8707f784a85180bc97d3c6ebe71a0`](https://github.com/Chia-Network/clvm/tree/1a5cb17895d8707f784a85180bc97d3c6ebe71a0) of [clvm](https://github.com/Chia-Network/clvm)

### Changed
- Improved `Stream::read` performance by removing extra memory copy.

## [1.0.0]
This version is compatible with [`1a5cb17895d8707f784a85180bc97d3c6ebe71a0`](https://github.com/Chia-Network/clvm/tree/1a5cb17895d8707f784a85180bc97d3c6ebe71a0) of [clvm](https://github.com/Chia-Network/clvm)

### Removed
- Removed `.dist` folder from git.  
  - This folder made it harder to check diffs between versions.
### Added
- Added GitHub Action
- Added `str()`, `repr()` utility functions.
- Added `Bytes::subarray` to get bytes data without additional memory allocation/copy.
### Changed
- Updated README.md
- Changed method name `Bytes::get_byte_at` to `Bytes::at` (Breaking change).
### Deprecated
- Deprecated python specific type definition such as `str`, `int`. Use `string`, `number` instead.

## [0.0.19]

**There are 2 breaking changes.**  
- Changed `OperatorDict` arguments format.  
Past: `OperatorDict(atom_op_function_map, quote_atom, apply_atom, unknown_op_handler)`  
New: `OperatorDict(atom_op_function_map, option)`  
where `option` is `{quote_atom: Bytes, apply_atom: Bytes, unknown_op_handler: typeof default_unknown_op}`

- When you initialize `Bytes` using constructor like `new Byte(data)`, `data` is not copied but just stored and keeps reference of `data`, for performance enhancement.  
In javascript, byte copy by `TypedArray` constructor is not sufficiently fast.  
So I left user an option how to initialize `Bytes` instance. Data copy, or Store reference.  
If you want to copy data and cut reference apart, then please get `Bytes` instance by `Bytes.from` factory function.  

**Resolved a deep tree performance issue**  
Before this version, `yarn test serialize_test --testNamePattern=test_very_deep_tree` was really slow. It took around 80 seconds to complete test.  
At this version, I've managed to improve test complete time to `79s` -> `2s` by pre-allocating buffer memory on `Stream` instance.

### Changed
- Changed `OperatorDict` arguments format.
- When you initialize `Bytes` using constructor like `new Byte(data)`, `data` is not copied but just stored and keeps reference of `data`, for performance enhancement.
- Greatly improved overall performance by pre-allocating buffer memory on `Stream` instance.
- Improved performance of `Bytes::equal_to`.
- Changed parameter type of `SExp::equal_to` from `CastableType` to `any`
- Replaced use of `instanceof` operator for non-native types.
- Updated bls-signatures version to 0.2.1-beta.1
- Improved `Bytes::concat` performance.
- Reorganized dist folder
### Fixed
- Fixed an issue where `SExp.to(<boolean>)` did not work the same as python's clvm.
- Fixed an issue where Bytes-SExp comparison like `b('aaa').equal_to(SExp.null())` did not work.
- Fixed an issue where `OperatorDict` did not throw Error when either `quote` or `apply` is not specified.
### Added
- Added `list()` function working similar to Python's `list()`.
- Added `Bytes::repeat` function.

## [0.0.18]
### Changed
- Fixed an issue where `int_to_bytes` did not work as expected if the argument is a negative number.
- Changed `Bytes::toString()` to return python's `bytes.__repr__` style string.

## [0.0.17]
### Changed
- Updated `jscrypto` version to 1.0.2

## [0.0.16]
### Added
- Added license information to README.md
### Fixed
- Fixed a bug in `sexp_from_stream`
- Fixed incorrect use of `int_to_bytes`

## [0.0.15]
### Fixed
- Fixed a bug in `pre_build.js`

## [0.0.14]
### Changed
- Changed new line style for files in `dist/` from windows-style(CR) to linux-style(LF).
### Removed
- Removed `WordArray32` from possible argument of `Bytes.from`.
### Added
- Added `Bytes.SHA256()`.

## [0.0.13]
### Changed
- `Bytes.from()` now accepts an array of number.
### Fixed
- Fixed an issue where `int_to_bytes` returns value incompatible with clvm in python.
- Fixed a minor issue

## [0.0.12]
### Fixed
- Don't remove leading '00' or 'ff' when serializing SExp to hex string.
- Fixed an issue where `SExp.to(0)` is converted to `SExp(0x00)` where `SExp(0x80)` is expected.
- Fixed an issue where it raises an Error when executing `Bytes::equal_to(None)`.
- Fixed a minor issue

## [0.0.11]
### Changed
- Made `EvalError::_sexp` public.

## [0.0.10]
### Added
- Added `h(<str>)` helper function which equals to `Bytes.from(<str>, "hex")`
### Fixed
- Removed type-guard from `SExp::listp()`
- Removed `SExpAsAtom` type and `SExpAsPair` type as they seem not working.


## [0.0.9]
### Added
- Added `Bytes::hex()` which is an alias of `Bytes::toString()`
- Added `Bytes::decode()`
- Added `Bytes::startswith()` and `Bytes::endswith()`
- Added `SExpAsAtom` type and `SExpAsPair` type.
- Added hex string support to `b(<str>)`. In `b("0xaa", "hex")`, `0xaa` is now parsed as hex string.
### Fixed
- Fixed value of `SExp.TRUE` and `SExp.FALSE`

## [0.0.8]
### Added
- Added `b(<str>)` helper function which equals to `Bytes.from(<str>, "utf8")`
- Added `isTuple`, `isList` functions.

## [0.0.7]
### Changed
- Made return type of `as_javascript()` explicit
- Updated `CastableType`

## [0.0.6]
### Fixed
- Fixed an issue where `SExp::as_javascript()` does not return expected value.
- Fixed an issue where `SExp.to(<tuple>)` raises unexpected Error.
- Fixed incorrect function name `__repl__` to `__repr__`
### Changed
- Removed '0x' prefix from results of `SExp::__repr__()`

## [0.0.5]
### Fixed
- Fixed an issue where `SExp.to(<str>)` falls in infinite loop.

## [0.0.4]
### Changed
- Changed source of `bls-signatures` to `@chiamine/bls-signatures`
  - When installing from previous `Chia-Mine/bls-signatures#npm`, the npm module version is too old or unstable.  
    Sometimes it installed the latest commit and another time installed old cache.  
    I decided to install the module not from GitHub branch but official npm registry for stability.
- Updated README

### Fixed
- Fixed various eslint errors

## [0.0.3]
### Added
- Added `to_sexp_f` export to index.ts/index.js

## [0.0.2]
### Changed
- Change tuple type `Tuple2` -> `Tuple`. 

## [0.0.1] - 2021-06-16
### Fixed
- Fixed various bugs

## [0.0.0] - 2021-06-15
Initial (beta) release.

<!--[Unreleased]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.1...v0.0.2-->
[2.0.1]: https://github.com/Chia-Mine/clvm-js/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.9...v2.0.0
[1.0.9]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Chia-Mine/clvm-js/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.19...v1.0.0
[0.0.19]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.18...v0.0.19
[0.0.18]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.17...v0.0.18
[0.0.17]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.16...v0.0.17
[0.0.16]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.15...v0.0.16
[0.0.15]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.0...v0.0.1
[0.0.0]: https://github.com/Chia-Mine/clvm-js/releases/tag/v0.0.0
