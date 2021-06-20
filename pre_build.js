const path = require("path");
const fs = require("fs");

function copyFileToPublish(fileName){
  const srcPath = path.join(__dirname, fileName);
  const distPath = path.join(distDir, fileName);
  if(fs.existsSync(srcPath)){
    fs.copyFileSync(srcPath, distPath);
  }
}

const devMode = process.argv.length !== 3 || process.argv[2] !== "--prod";

// clean and create output dir
const distDirName = devMode ? "build" : "dist";
const distDir = path.join(__dirname, distDirName);
if(fs.existsSync(distDir)){
  fs.rmdirSync(distDir, {recursive: true});
}
fs.mkdirSync(distDir);

// Copy wasm file
const browserDir = path.join(distDir, "browser");
if(fs.existsSync(browserDir)){
  fs.rmdirSync(browserDir, {recursive: true});
}
fs.mkdirSync(browserDir);
const blsWasmSrcPath = path.join(__dirname, "node_modules", "@chiamine", "bls-signatures", "blsjs.wasm");
const blsWasmDestPath = path.join(browserDir, "blsjs.wasm");
if(!fs.existsSync(blsWasmSrcPath)){
  console.error("blsjs.wasm not found at:");
  console.error(blsWasmSrcPath);
  console.error("Probably you haven't execute npm install yet");
  return;
}
fs.copyFileSync(blsWasmSrcPath, blsWasmDestPath);


if(devMode){
  const packageJson = require("./package.json");
  packageJson.main = "./index.js";
  packageJson.typings = "./index.d.ts";
  
  fs.writeFileSync(path.join(distDir, "package.json"), JSON.stringify(packageJson, null, 2));
}
