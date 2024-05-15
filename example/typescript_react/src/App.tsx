import React from 'react';
import {
  h,
  SExp,
  CLVMType,
  run_chia_program,
  Flag,
} from 'clvm/browser';
import './App.css';

function App() {
  const [output, setOutput] = React.useState('');
  
  /*
   This comes from a block of height 600043 in the testnet11.
   You can get the block data by:
     chia rpc full_node get_blocks '{"start": 600043, "end": 600044}'
   on testnet11.
   The transactions_generator in the block was serialized with backref enabled.
   */
  // eslint-disable-next-line max-len
  const [prg, setPrg] = React.useState('0xff01ff01ffffffa09dc16b766b557d0d8d94fe1ee636245b4417a46cd53bd4e70c26a62dc698d406ffff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04fffe84016b6b7fff80808080fffe820db78080fe81ffffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101fe6f80ff0180fe3e80ffff04ffff01b0a282b4b0117a8d04906835fa4fa0e13d3fbd1dd61899ebdf5157977611d1bae52f2ea97cbc3916466b1c9176d30a9030fe3f80ff85727e956731ffff80ffff01ffff33ffa05597ef68eaf171a6303995ecbb14fdbf2c24300b625bfbc886ea68270424661dff5880ffff33ffa07a7a9cb053b9e7086ddbb789a4a1abc646a06627d372eca59368bf90c15028bfff85727b9a765980ffff34ff8402faf08080ffff3cffa0d71f4c45af09583209498dbb9974bbda21b859fac0bf3348337ed33a2ba5c3838080ff808080808080');
  const [env, setEnv] = React.useState('0x80');
  
  const onInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget as HTMLInputElement;
    const setValue = inputEl.id === 'prg' ? setPrg : setEnv;
    setValue(inputEl.value);
  }, []);
  
  const onButtonClicked = React.useCallback((_: React.MouseEvent) => {
    setOutput('');
    
    if (!prg || !env) {
      setOutput('program or env is not specified');
      return;
    }
    
    try {
      const prgU8 = h(prg || '').raw();
      const envU8 = h(env || '').raw();
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      window.aaa = Flag;
      
      const result = run_chia_program(prgU8, envU8, 1000000000n, Flag.allow_backrefs());
      const [cost, node] = result;
      const sexp = new SExp(node as CLVMType);
      const sexpStr = JSON.stringify(sexp, null, 2);
      setOutput(`Cost: ${cost.toString()}\r\nSExp: ${sexpStr}`);
    } catch (e: any) {
      console.error(e);
      if (e && typeof e === 'object' && 'name' in e && 'message' in e) {
        const err = e as Error;
        setOutput(`${err.name}: ${err.message}`);
      } else {
        setOutput(typeof e === 'string' ? e : JSON.stringify(e));
      }
    }
  }, [env, prg]);
  
  const onClearButtonClicked = React.useCallback(() => {
    setOutput('');
  }, []);
  
  return (
    <div className='app-root'>
      <h1>Chia-Mine/clvm-js</h1>
      <div className='input'>
        <label htmlFor='prg'>program</label>
        <input id='prg' value={prg} onChange={onInputChange} />
      </div>
      <div className='input'>
        <label htmlFor='env'>env</label>
        <input id='env' value={env} onChange={onInputChange} />
      </div>
      <div className='buttons'>
        <button id='run-btn' onClick={onButtonClicked}>
          run
        </button>
        <button id='clear-btn' onClick={onClearButtonClicked}>
          clear
        </button>
      </div>
      <div className='output-container'>
        <label>Output</label>
        <pre id='output'>{output}</pre>
      </div>
    </div>
  );
}

export const PureApp = React.memo(App);
