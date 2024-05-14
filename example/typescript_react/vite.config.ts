import {defineConfig, UserConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(() => {
  const SERVER_PORT = 5173;
  
  return {
    plugins: [react()],
    build: {
      outDir: '.dist',
    },
    resolve: {
      /*
        `resolve.preserveSymlinks: true` is only required when `clvm` is specified
        as a link dependency.
          "dependencies": {
            "clvm": "link:../../.dist/npm", // <--- This one
            "react": "^18.3.1",
            "react-dom": "^18.3.1"
          },
        Usually you don't need this option to be set without
        a link dependency like:
          "dependencies": {
            "clvm": "3.0.0",
            "react": "^18.3.1",
           "react-dom": "^18.3.1"
          },
       */
      // preserveSymlinks: true,
    },
    server: {
      port: SERVER_PORT,
      proxy: {
        '^/(blsjs|clvm_wasm_bg).wasm': {
          target: {
            host: 'localhost',
            port: SERVER_PORT,
          },
          rewrite: (path) => `/public/assets/${path.replace(/^\//, '')}`,
        },
      },
    },
  } as UserConfig;
});
