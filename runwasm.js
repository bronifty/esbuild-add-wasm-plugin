const fs = require('fs').promises;
const path = require('path');

const importObject = {
  imports: {
    imported_func: arg => {
      console.log(arg);
    }
  }
};

async function runWasm() {
  // Read the .wasm file into a buffer
  const buffer = await fs.readFile(path.resolve(__dirname, 'simple.wasm'));

  // Convert the buffer into a WebAssembly binary
  const binary = new Uint8Array(buffer);

  // Instantiate the WebAssembly module
  const result = await WebAssembly.instantiate(binary, importObject);

  // Call the exported function
  result.instance.exports.exported_func();
}

runWasm();