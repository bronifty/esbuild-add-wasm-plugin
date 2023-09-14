var importObject = {
  imports: {
    imported_func: (arg) => {
      console.log(arg);
    }
  }
};
async function runWasm() {
  const response = await fetch("simple.wasm");
  const buffer = await response.arrayBuffer();
  const binary = new Uint8Array(buffer);
  const result = await WebAssembly.instantiate(binary, importObject);
  result.instance.exports.exported_func();
}
runWasm();
