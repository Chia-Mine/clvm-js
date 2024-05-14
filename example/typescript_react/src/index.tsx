import React from 'react'
import ReactDOM from 'react-dom/client'
import {PureApp} from './App.tsx';

function main() {
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

main();
