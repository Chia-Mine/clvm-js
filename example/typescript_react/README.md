# Typescript + React

## Setup
```shell
yarn
yarn build
# or
npm install
npm run build
```

## Start web page
```shell
yarn start
# or
npm run start
```

## Memo - How to set up react+typescript project from scratch
```shell
npx create-react-app some-project --template typescript
cd some-project
yarn add clvm_tools
```
Then copy wasm files from npm package.
```shell
mkdir -p ./public/static/js
cp ./node_modules/clvm_tools/browser/*.wasm ./public/static/js/
```
**Note**: Redistributing your project with bundled `blsjs.wasm` and/or `clvm_rs_bg.wasm` must be compliant with Apache2.0 License provided by [Chia-Network](https://github.com/Chia-Network/)

Additionally, copy and paste below to package.json.  
This prevents `babel` in `react-scripts` from applying [the problematic transform](https://github.com/facebook/create-react-app/issues/10785).
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