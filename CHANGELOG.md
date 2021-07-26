# Changelog

## [0.0.19]

**There is a breaking change.**  
Past: `OperatorDict(atom_op_function_map, quote_atom, apply_atom, unknown_op_handler)`  
New: `OperatorDict(atom_op_function_map, option)`  
where `option` is `{quote_atom: Bytes, apply_atom: Bytes, unknown_op_handler: typeof default_unknown_op}`

### Changed
- Reorganized dist folder
- Updated bls-signatures version to 0.2.1-beta.1
- Changed parameter type of `SExp::equal_to` from `CastableType` to `any`
- Replaced use of `instanceof` operator for non-native types.
- Changed `OperatorDict` arguments format.
- Improved `Bytes::concat` performance.
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
