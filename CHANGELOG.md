# Changelog

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
