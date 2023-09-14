// import * as React from 'react'
// import * as Server from 'react-dom/server'

// let Greet = () => <h1>Hello, world!</h1>
// console.log(Server.renderToString(<Greet />))


// import * as React from 'react'
// import * as Server from 'react-dom/server'
// import wasmInit from './hello-wasm/pkg/hello_wasm_bg.wasm';


// let Greet = () => {
//   const [greeting, setGreeting] = React.useState(null);

//   React.useEffect(() => {
//     wasmInit().then(wasm => {
//       const greetingFromWasm = wasm.greet();
//       console.log('Greeting from WASM:', greetingFromWasm);
//       setGreeting(greetingFromWasm);
//     });
//   }, []);

//   return greeting ? <h1>{greeting}</h1> : null;
// }

// console.log('Rendered component:', Server.renderToString(<Greet />))

// const fs = require('fs').promises;
// const path = require('path');

// const importObject = {
//   imports: {
//     imported_func: arg => {
//       console.log(arg);
//     }
//   }
// };

// async function runWasm() {
//   // Read the .wasm file into a buffer
//   const buffer = await fs.readFile(path.resolve(__dirname, 'simple.wasm'));

//   // Convert the buffer into a WebAssembly binary
//   const binary = new Uint8Array(buffer);

//   // Instantiate the WebAssembly module
//   const result = await WebAssembly.instantiate(binary, importObject);

//   // Call the exported function
//   result.instance.exports.exported_func();
// }

// runWasm();
const importObject = {
  imports: {
    imported_func: arg => {
      console.log(arg);
    }
  }
};

function runWasm() {
  fetch('simple.wasm')
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const binary = new Uint8Array(buffer);
      return WebAssembly.instantiate(binary, importObject);
    })
    .then(result => {
      result.instance.exports.exported_func();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

runWasm();