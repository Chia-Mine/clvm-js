# clvm
Javascript implementation of CLVM (Chia Lisp VM)  

## Install
```shell
npm install clvm
# or
yarn add clvm
```

## Test
`clvm-js` passes all the test equivalent to Python's original `clvm`.  
You can compare test files for [Javascript](./tests) and [Python](https://github.com/Chia-Network/clvm/tree/main/tests)  
To run the test, execute the following command.
```shell
git clone https://github.com/Chia-Mine/clvm-js
cd clvm-js

npm install
npm run test
# or
yarn
yarn test
```
If you find something not compatible with Python's clvm, please report it to GitHub issues.

## Compatibility
This code is compatible with:
- [`480b32840c525e17b5ab2f29036c033febaae71e`](https://github.com/Chia-Network/clvm/tree/480b32840c525e17b5ab2f29036c033febaae71e) of [clvm](https://github.com/Chia-Network/clvm)
  - [Diff to the latest clvm](https://github.com/Chia-Network/clvm/compare/480b32840c525e17b5ab2f29036c033febaae71e...main)
- [`34f504bd0ef2cd3a219fea8ce6b15ff7684687fd`](https://github.com/Chia-Network/bls-signatures/tree/34f504bd0ef2cd3a219fea8ce6b15ff7684687fd) of [bls-signatures](https://github.com/Chia-Network/bls-signatures)
  - [Diff to the latest bls-signatures](https://github.com/Chia-Network/bls-signatures/compare/34f504bd0ef2cd3a219fea8ce6b15ff7684687fd...main)

## Example
```javascript
// in nodejs context
async function main(){
  var clvm = require("clvm");

  // 'clvm.initialize()' here is not required
  // if you're so sure it never calls 'pubkey_for_exp' or 'point_add' operation.
  // When one of those operations is called without prior 'clvm.initialize()'
  // it will raise an Error.
  // If it is unknown whether 'pubkey_for_exp' or 'point_add' will be called, 
  // then put 'await clvm.initialize()' for safety.
  // I know this 'await clvm.initialize()' makes code asynchronous
  // and really impacts on code architecture.
  // This is because 'clvm' relys on a wasm of 'bls-signatures',
  // which requires asynchronous loading.
  await clvm.initialize();
  
  const {SExp, OPERATOR_LOOKUP, KEYWORD_TO_ATOM, h, t, run_program} = clvm;
  const plus = h(KEYWORD_TO_ATOM["+"]);
  const q = h(KEYWORD_TO_ATOM["q"]);
  const program = SExp.to([plus, 1, t(q, 175)]);
  const env = SExp.to(25);
  const [cost, result] = run_program(program, env, OPERATOR_LOOKUP);
  let isEqual = result.equal_to(SExp.to(25 + 175));
  console.log(`isEqual: ${isEqual}`); // 'isEqual: true'
  isEqual = result.as_int() === (25 + 175);
  console.log(`isEqual: ${isEqual}`); // 'isEqual: true'
}

main().catch(e => console.error(e));
```

## Use in browser
If you'd like to run some javascript code which depends on `clvm` on browser,  
you need to put `blsjs.wasm` to the same directory as the code who loads `clvm`.

<pre>
├── ...
├── main.js      # js file which clvm is compiled into
└── blsjs.wasm   # copy it from npm_modules/clvm/browser/blsjs.wasm
</pre>

If you use [React](https://reactjs.org/), copy `blsjs.wasm` into `<react-project-root>/public/static/js/` folder. It automatically copies wasm file next to main js file.

**Note1**  
Don't forget to wait `clvm.initialize()` if you are not sure whether `pubkey_for_exp`/`point_add` will be called.  
**Note2**  
If you're really sure that `pubkey_for_exp`/`point_add` will never be called, then you can opt out `blsjs.wasm` and `await clvm.initialize()`.
If so, you can make your code fully synchronous.  
**Note3**  
Redistributing your project with bundled `blsjs.wasm` must be compliant with Apache2.0 License provided by [Chia-Network](https://github.com/Chia-Network/bls-signatures/blob/main/LICENSE)

### Browser compatibility
`clvm-js` uses `BigInt`. So if runtime environment does not support `BigInt`, `clvm-js` doesn't work as well.  
If you transpile code using babel or something which uses babel (like create-react-app),
you need to tell the transpiler to optimize code only for the target browsers.  
Just copy and paste below to your `package.json` and you can avoid a lot of runtime incompatibility issues.
```
"browserslist": [
  "edge >= 79",
  "firefox >= 68",
  "chrome >= 67",
  "safari > 14",
  "opera >= 54",
  "ios_saf >= 14.4",
  "android >= 67",
  "op_mob >= 48",
  "and_chr >= 67",
  "and_ff >= 68",
  "samsung >= 9.2",
  "node >= 10.4.0",
  "electron >= 4.0.0"
]
```

## Differences with Python's `clvm`
Although I try hard to make it look like Python's `clvm`, there are things users should be aware of.  
I put the code which absorbs language incompatibility into `src/__type_compaibility__.ts`, so if you're interested take a look at it.

### There are no build-in `Tuple` type in Javascript
When you want to create a tuple, you need to write like this:  
```javascript
const {t} = require("clvm"); 
const aTuple = t(1, 2);

// Tuple is Array-Like object
aTuple[0] === 1; // true
aTuple[1] === 2; // true

// Tuple content cannot be changed
aTuple[0] = 99;
aTuple[0] === 99; // false
aTuple[0] === 1; // true

// Tuple accepts only 2 elements.
const tuple2 = t(1, 2, 3);
tuple2; // (1, 2)

// You can check if a variable is a tuple
const {isTuple, isList} = require("clvm");
isTuple([1, 2]); // false
isTuple(t(1, 2)); // true
isList([1, 2]); // true
isList(t(1, 2)); // false
```
Just add `t` in front of tuple parenthesis `(1, 2)` and you get a tuple.  

### There are no build-in `bytes` type in JavaScript
This is the most notable difference with Python.  
I used to be a JavaScript developer for several years, and sometimes I heard Python is slow and JavaScript is fast.  
But working on the project, I truly surprised that Python can handle byte data really well in ways:  
- Python's `bytes` is **immutable** and can be used as a dict key.
- Python's `bytes` is fast and easy to write.  
  `b'aaa' + b'bbb' == b'aaabbb'`, `b'a' * 3 == b'aaa'`
- Python's `bytes` comparison is FAST.  
  If you are interested, compare the performance of `test_very_long_blobs` in `tests/serialize_test.[ts|py]`  
  See more details [here](https://github.com/Chia-Network/clvm/pull/100)

```javascript
const {b} = require("clvm");
// Turns string to UTF-8 byte array.
b("abc"); // will be { Uint8Array(3) [97,98,99] }
b("あ"); // will be { Uint8Array(3) [227,129,130] }

// If you want to do Byte comparison, use equal_to method.
b("abc").equal_to(b("abc")); // true
b("abc") === b("abc"); // false. Because it compares reference of Bytes instance.

// Initialize Bytes instance with hex string
const {h} = require("clvm");
h("0x616263"); // will be { Uint8Array(3) [97,98,99] }
h("616263"); // You can omit '0x' prefix
h("0x616263").equal_to(b("abc")); // true

// +: Bytes concat
b("a").concat(b("b")); // === b("ab")
// *: Bytes repeat
b("a").repeat(3); // === b("aaa")

// Bytes initialization
const {Bytes} = require("clvm");
uint8 = new Uint8Array([97, 98, 99]);
b1 = Bytes.from(uint8);
b1.equal_to(b("abc")); // true
// Initializing by Bytes.from copies value and cut reference apart.
uint8[0] = 0;
b1.at(0); // 97
// Initializing by new Bytes() just stores value and keep reference, for better performance
uint8 = new Uint8Array([97, 98, 99]);
b2 = new Bytes(uint8);
b2.equal_to(b("abc")); // true
uint8[0] = 0;
b2.at(0); // 0

// Check byte instance
const {isBytes} = require("clvm");
isBytes(b('aaa')); // true
isBytes(h('0xfe')); // true
isBytes(new Bytes()); // true
```

### Python's `str(x)` is `x.toString()` in Javascript
If you want to stringify `SExp` or `Bytes`, just call `x.toString()` method.
```javascript
const {b, SExp, str} = require("clvm");
b("あ").toString(); // "b'\\xe3\\x81\\x82'"
SExp.to([1, [2, 3]]).toString(); // 'ff01ffff02ff038080'
str(SExp.to([1, [2, 3]])); // You can use str() function as well as Python by the way.
```

### Calculation of division/modulo against negative number is different
|Python|JavaScript|
|------|----------|
|`-8 // 5 == -2`|`-8n / 5n === -1n`|
|`-8 % 5 == 2`|`-8n % 5n === -3n`|

## clvm license
`clvm-js` is based on [clvm](https://github.com/Chia-Network/clvm) with the
[Apache license 2.0](https://github.com/Chia-Network/clvm/blob/main/LICENSE)

## bls-signatures license
[bls-signatures](https://github.com/Chia-Network/bls-signatures) is used and redistributed under the
[Apache license 2.0](https://github.com/Chia-Network/bls-signatures/blob/main/LICENSE)

## jscrypto license
[jscrypto](https://github.com/Hinaser/jscrypto) is used under the
[MIT license](https://github.com/Hinaser/jscrypto/blob/master/LICENSE)
