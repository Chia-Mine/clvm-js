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
- [`960f8d139940fa0814d3fac44da9a2975642f5d3`](https://github.com/Chia-Network/clvm/tree/960f8d139940fa0814d3fac44da9a2975642f5d3) of [clvm](https://github.com/Chia-Network/clvm)
  - [Diff to the latest clvm](https://github.com/Chia-Network/clvm/compare/960f8d139940fa0814d3fac44da9a2975642f5d3...main)
- [`34f504bd0ef2cd3a219fea8ce6b15ff7684687fd`](https://github.com/Chia-Network/bls-signatures/tree/34f504bd0ef2cd3a219fea8ce6b15ff7684687fd) of [bls-signatures](https://github.com/Chia-Network/bls-signatures)
  - [Diff to the latest bls-signatures](https://github.com/Chia-Network/bls-signatures/compare/34f504bd0ef2cd3a219fea8ce6b15ff7684687fd...main)

## Example
```javascript
// in nodejs context
async function main(){
  const clvm = require("clvm");

  // `await clvm.initializeClvmWasm()` is now always necessary.
  // This loads clvm_wasm_bg.wasm.
  // If you have a strong reason to use features of bls-signatures,
  // you need to do `await clvm.initialize()` instead.
  // `clvm.initialize()` loads both blsjs.wasm and clvm_wasm_bg.wasm.
  await clvm.initializeClvmWasm();
  
  const {SExp, KEYWORD_TO_ATOM, h, t, run_chia_program, Flag} = clvm;
  const plus = h(KEYWORD_TO_ATOM["+"]); // byte representation of '+' operator
  const q = h(KEYWORD_TO_ATOM["q"]); // byte representation of 'q' operator
  const program = SExp.to([plus, 1, t(q, 175)]).as_bin().raw(); // (+ . (1 . (q . 175)))
  const env = SExp.to(25).as_bin().raw();
  const max_cost = BigInt(10000000);
  const [cost, lazyNode] = run_chia_program(program, env, max_cost, Flag.allow_backrefs());
  const result = new SExp(lazyNode);
  let isEqual = result.equal_to(SExp.to(25 + 175));
  console.log(`isEqual: ${isEqual}`); // 'isEqual: true'
  isEqual = result.as_int() === (25 + 175);
  console.log(`isEqual: ${isEqual}`); // 'isEqual: true'
}

main().catch(e => console.error(e));
```

## More example with clvm_wasm
See this [test case for clvm_wasm](https://github.com/Chia-Mine/clvm-js/blob/v3.0.0/tests/original/clvm_wasm_test.ts)

## Use in browser
- [Sample code - Use clvm-js with TypeScript, Webpack](https://github.com/Chia-Mine/clvm-js/blob/v3.0.0/example/typescript_webpack)
- [Sample code - Use clvm-js with TypeScript, React, Vite](https://github.com/Chia-Mine/clvm-js/blob/v3.0.0/example/typescript_react)

If you'd like to run some javascript code which depends on `clvm` on browser,  
you need to put `clvm_wasm_bg.wasm` and optionally `blsjs.wasm` to the same directory as the code who loads `clvm`.  
Because most of BLS operations are now performed inside `clvm_wasm_bg.wasm`, in most cases you don't need `blsjs.wasm`.  

<pre>
├── ...
├── main.js      # js file which clvm is compiled into
├── clvm_wasm_bg.wasm   # copy it from npm_modules/clvm/browser/clvm_wasm_bg.wasm
└── (Optional) blsjs.wasm   # copy it from npm_modules/clvm/browser/blsjs.wasm
</pre>

If you use [React](https://reactjs.org/) with [CRA(create-react-app)](https://github.com/facebook/create-react-app), copy `blsjs.wasm` and `clvm_wasm_bg.wasm` into `<react-project-root>/public/static/js/` folder. It automatically copies wasm file next to main js file.

If you use [React](https://reactjs.org/) with [vite](https://vitejs.dev/),
copy `blsjs.wasm` and `clvm_wasm_bg.wasm` into `<react-project-root>/public/assets/` folder.  

**IMPORTANT NOTE**  
When your code is loaded as a module, such as with `<script type='module'/>` (common in React with Vite),
there is a path restriction for loading the WebAssembly (WASM) module.  
See [Known Issues](https://github.com/Chia-Mine/clvm-js/blob/v3.0.0/CHANGELOG.md#known-issues). Also see [code comment here](https://github.com/Chia-Mine/clvm-js/blob/v3.0.0/example/typescript_react/src/index.tsx)  

**Note1**  
Don't forget to wait `clvm.initializeClvmWasm()`.  
`clvm.initializeClvmWasm()` only loads `clvm_wasm_bg.wasm`.  
If you have a strong reason to use features of `bls-signatures` inside `clvm-js`, you need to wait
`clvm.initialize()` instead, since `clvm.initialize()` loads both `blsjs.wasm` and `clvm_wasm_bg.wasm`.  
**Note2**  
Redistributing your project with bundled `blsjs.wasm` and/or `clvm_wasm_bg.wasm` must be compliant with Apache2.0 License provided by [Chia-Network](https://github.com/Chia-Network/bls-signatures/blob/main/LICENSE)  
**Note3**
You may need `blsjs.wasm` if you want to run `run_program`, which has been deprecated as of clvm@3.0.0.

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

## clvm_wasm license
[clvm_wasm](https://github.com/Chia-Network/clvm_rs/tree/main/wasm) is used and redistributed under the
[Apache license 2.0](https://github.com/Chia-Network/clvm_rs/blob/main/wasm/LICENSE)

## bls-signatures license
[bls-signatures](https://github.com/Chia-Network/bls-signatures) is used and redistributed under the
[Apache license 2.0](https://github.com/Chia-Network/bls-signatures/blob/main/LICENSE)

## jscrypto license
[jscrypto](https://github.com/Hinaser/jscrypto) is used under the
[MIT license](https://github.com/Hinaser/jscrypto/blob/master/LICENSE)
