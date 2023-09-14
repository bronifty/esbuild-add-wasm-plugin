"use strict";

var importObject = {
  imports: {
    imported_func: (arg) => {
      console.log(arg);
    }
  }
};
function runWasm() {
  fetch("simple.wasm").then((response) => response.arrayBuffer()).then((buffer) => {
    const binary = new Uint8Array(buffer);
    return WebAssembly.instantiate(binary, importObject);
  }).then((result) => {
    result.instance.exports.exported_func();
  }).catch((error) => {
    console.error("Error:", error);
  });
}
runWasm();
