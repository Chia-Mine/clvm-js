# Changelog

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
[0.0.4]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/Chia-Mine/clvm-js/compare/v0.0.0...v0.0.1
[0.0.0]: https://github.com/Chia-Mine/clvm-js/releases/tag/v0.0.0
