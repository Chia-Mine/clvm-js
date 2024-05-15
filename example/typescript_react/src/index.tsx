import React from 'react'
import ReactDOM from 'react-dom/client'
import {initializeClvmWasm} from 'clvm/browser';
import {PureApp} from './App.tsx';

async function main() {
  /**
   * Note:
   * `clvm_wasm_bg.wasm` is assumed to be put in the folder where the main js file resides.
   * For example, if the url of the main (compiled) code is https://example.com/test-app/main.js,
   * the func `initializeClvmWasm()` usually tries to load wasm files from
   *   - https://example.com/test-app/clvm_wasm_bg.wasm
   *
   * But how the function knows the script dir?
   * The answer: The script dir url is stored in `document.currentScript` if not running on module context.
   * Since `document.currentScript` is `null` with module context, you need to get script dir by yourself.
   * If you don't specify the path to wasm, `initializeClvmWasm()` tries to load from the url
   *   - https://example.com/clvm_wasm_bg.wasm
   *
   * As you may notice, this example uses typescript, react with vite and the code is loaded as an ESModule,
   * where the code is run by <script type="module" src="..."></script>.
   * With ESModule, you need to specify the path of wasm files like below.
   */
  const scriptDir = import.meta.url.replace(/\/[^/]+$/, '');
  const pathToWasm = `${scriptDir}/clvm_wasm_bg.wasm`;
  await initializeClvmWasm({pathToWasm});
  
  /**
   * Note for blsjs.wasm.
   * As of 14th May, bls-signatures has no options to specify the wasm path on initialization.
   * So `initializeBLS()` always tries to load from the url:
   *   - https://example.com/blsjs.wasm
   * If you can put blsjs.wasm into the root path like above, you can activate the line below.
   * However, with clvm >= 3.0.0, most of bls operations are run inside clvm_wasm_bg.wasm.
   * So I believe you don't need to load `blsjs.wasm` in most cases.
   */
  // await initializeBLS();
  
  const nodeToRender = document.getElementById('root');
  if (!nodeToRender) {
    throw new Error('#root Element was not found');
  }
  
  ReactDOM.createRoot(nodeToRender).render(
    <React.StrictMode>
      <PureApp/>
    </React.StrictMode>
  );
}

main().catch((error: unknown) => {
  console.error(error);
});
