import {defineConfig, UserConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(() => {
  const SERVER_PORT = 5173;
  
  return {
    plugins: [react()],
    build: {
      outDir: '.dist',
    },
    server: {
      port: SERVER_PORT,
      proxy: {
        '^.*(?<!/public/assets/)(blsjs|clvm_wasm_bg).wasm': {
          target: {
            host: 'localhost',
            port: SERVER_PORT,
          },
          rewrite: (path) => `/public/assets/${path.replace(/.*((blsjs|clvm_wasm_bg).wasm)$/, '$1')}`,
        },
      },
    },
  } as UserConfig;
});
