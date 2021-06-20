# clvm

Javascript implementation of CLVM (Chia Lisp VM)  
Still Work in progress.(Untested)  

**v0.x.x is test purpose only!**  
Please report bugs to https://github.com/Chia-Mine/clvm-js/issues

## Install
```shell
npm install clvm
# or
yarn add clvm
```

Breeding edge version of `clvm` is available by
```shell
yarn add Chia-Mine/clvm-js#v0.0.5
# or
npm install Chia-Mine/clvm-js#v0.0.5
```

## Example
```javascript
// in nodejs context
async function main(){
  var clvm = require("clvm");

  // 'clvm.initialization()' here is not required
  // if you're so sure it never calls 'pubkey_for_exp' or 'point_add' operation.
  // When 'pubkey_for_exp' or 'point_add' operation is called without prior 'clvm.initialize()'
  // it will raise an Error.
  // If it is unknown whether 'pubkey_for_exp' or 'point_add' will be called, then await 'clvm.initialize()' for safety.
  // I know this 'await clvm.initialize()' makes code asynchronous and really impacts on code architecture.
  // This is because 'clvm' relys on a wasm of 'bls-signatures', which requires asynchronous loading.
  await clvm.initialize();
  
  const {SExp, OPERATOR_LOOKUP, KEYWORD_TO_ATOM} = clvm;
  const v1 = OPERATOR_LOOKUP(KEYWORD_TO_ATOM["+"], SExp.to([3,4,5]))[1];
  const v2 = SExp.to(12);
  const ok = v1.equal_to(v2);
  console.log(`ok: ${ok}`); // Will show 'true'
}

main().catch(e => console.error(e));
```

## Use in browser
If you'd like to run some javascript code which depends on `clvm` on browser,  
you need to put `blsjs.wasm` to the same directory as the code who loads `clvm`.

<pre>
├── ...
├── main.js      # js file which clvm is compiled into
└── blsjs.wasm   # copy it from npm_modules/clvm/dist/browser/blsjs.wasm
</pre>

**Note1**: Don't forget to wait `clvm.initialize()` if you are not sure whether `pubkey_for_exp`/`point_add` will be called.  
**Note2**: If you're really sure that `pubkey_for_exp`/`point_add` will never be called, then you can opt out `blsjs.wasm` and `await clvm.initialize()`.
If so, you can make your code fully synchronous.