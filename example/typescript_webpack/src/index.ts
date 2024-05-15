import "./index.scss";
import {
  initialize,
  h,
  SExp,
  run_chia_program,
  Flag,
  CLVMType,
} from "clvm/browser";

window.addEventListener("load", async function onWindowLoad() {
  // The element which holds command result output
  const outputEl = document.getElementById("output") as HTMLElement;
  if (!outputEl) {
    throw new Error("output box was not found");
  }
  const prgEl = document.getElementById("prg") as HTMLInputElement;
  if (!prgEl) {
    throw new Error("program input was not found");
  }
  const envEl = document.getElementById("env") as HTMLInputElement;
  if (!envEl) {
    throw new Error("env input was not found");
  }
  
  // Set initial values
  /*
   This comes from a block of height 600043 in the testnet11.
   You can get the block data by:
     chia rpc full_node get_blocks '{"start": 600043, "end": 600044}'
   on testnet11.
   The transactions_generator in the block was serialized with backref enabled.
   */
  prgEl.value = "0xff01ff01ffffffa09dc16b766b557d0d8d94fe1ee636245b4417a46cd53bd4e70c26a62dc698d406ffff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04fffe84016b6b7fff80808080fffe820db78080fe81ffffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101fe6f80ff0180fe3e80ffff04ffff01b0a282b4b0117a8d04906835fa4fa0e13d3fbd1dd61899ebdf5157977611d1bae52f2ea97cbc3916466b1c9176d30a9030fe3f80ff85727e956731ffff80ffff01ffff33ffa05597ef68eaf171a6303995ecbb14fdbf2c24300b625bfbc886ea68270424661dff5880ffff33ffa07a7a9cb053b9e7086ddbb789a4a1abc646a06627d372eca59368bf90c15028bfff85727b9a765980ffff34ff8402faf08080ffff3cffa0d71f4c45af09583209498dbb9974bbda21b859fac0bf3348337ed33a2ba5c3838080ff808080808080";
  envEl.value = "0x80";
  
  /*
   * Initialize button's onclick handler
   */
  const buttons = document.querySelectorAll(".buttons button:not(:last-child)") as NodeListOf<HTMLButtonElement>;
  if (!buttons || buttons.length < 1) {
    throw new Error("Button was not found");
  }
  buttons.forEach(b => {
    b.onclick = onButtonClicked;
  });
  const clearButton = document.getElementById("clear-btn") as HTMLButtonElement;
  if (!clearButton) {
    throw new Error("Clear button was not found");
  }
  clearButton.onclick = function () {
    outputEl.textContent = "";
  }
  
  // Load blsjs.wasm and clvm_wasm_bg.wasm
  await initialize().catch(console.error);
  
  /**
   * onclick handler for buttons
   * @param {MouseEvent} e
   */
  async function onButtonClicked(e: MouseEvent) {
    const buttonEl = (e.currentTarget as HTMLButtonElement);
    outputEl.textContent = "";
    
    if (!prgEl.value || !envEl.value) {
      outputEl.textContent = "program or env is not specified";
      return;
    }
    
    try {
      const prg = h(prgEl.value || "").raw();
      const env = h(envEl.value || "").raw();
      
      const result = run_chia_program(prg, env, 1000000000n, Flag.allow_backrefs());
      const [cost, node] = result;
      const sexp = new SExp(node as CLVMType);
      const sexpStr = JSON.stringify(sexp, null, 2);
      outputEl.textContent = `Cost: ${cost}\r\nSExp: ${sexpStr}`;
    } catch (e: any) {
      console.error(e);
      if (e && typeof e === "object" && "name" in e && "message" in e) {
        const err = e as Error;
        outputEl.textContent = `${err.name}: ${err.message}`;
      } else {
        outputEl.textContent = typeof e === "string" ? e : JSON.stringify(e);
      }
    }
  }
});
