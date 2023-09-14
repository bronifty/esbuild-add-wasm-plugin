import * as crypto from "crypto";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { buildSync } from "esbuild-wasm";
import { normalPath } from "./misc";
import * as esbuild from 'esbuild'; // Add this line

export interface Bundle {
  entrypointPath: string;
  directory: string;
  hash: string;
}

// Define the wasmPlugin here
let wasmPlugin = {
  name: 'wasm',
  setup(build) {
    build.onResolve({ filter: /\.wasm$/ }, args => {
      if (args.namespace === 'wasm-stub') {
        return {
          path: args.path,
          namespace: 'wasm-binary',
        }
      }

      if (args.resolveDir === '') {
        return;
      }
      return {
        path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
        namespace: 'wasm-stub',
      }
    });

    build.onLoad({ filter: /.*/, namespace: 'wasm-stub' }, async (args) => ({
      contents: `import wasm from ${JSON.stringify(args.path)}
        export default (imports) =>
          WebAssembly.instantiate(wasm, imports).then(
            result => result.instance.exports)`,
    }));

    build.onLoad({ filter: /.*/, namespace: 'wasm-binary' }, async (args) => ({
      contents: await fs.promises.readFile(args.path),
      loader: 'binary',
    }));
  },
};

/**
 * Bundles a javascript entrypoint into a single file.
 * @param entrypoint The javascript entrypoint
 * @param outputDir Defaults to `${entrypoint}.bundle`
 * @returns Bundle information
 */
export function createBundle(entrypoint: string, outputDir?: string): Bundle {
  const outdir = resolve(outputDir ?? entrypoint + ".bundle");
  mkdirSync(outdir, { recursive: true });
  const outfile = join(outdir, "index.js");

  let esbuildResult = esbuild.buildSync({ // Change this line
    bundle: true,
    entryPoints: [normalPath(resolve(entrypoint))],
    outfile: normalPath(outfile),
    nodePaths: process.env.WING_NODE_MODULES
      ? [normalPath(process.env.WING_NODE_MODULES as string)]
      : undefined,
    minify: false,
    platform: "node",
    target: "node18",
    plugins: [wasmPlugin], // Add the wasmPlugin here
  });

  if (esbuildResult.errors.length > 0) {
    const errors = esbuildResult.errors.map((e) => e.text).join("\n");
    throw new Error(`Failed to bundle function: ${errors}`);
  }

  const outlines = readFileSync(outfile, "utf-8").split("\n");
  const isNotLineComment = (line: string) => !line.startsWith("//");
  const final = outlines.filter(isNotLineComment).join("\n");
  writeFileSync(outfile, final);

  const codeHash = crypto.createHash("md5").update(final).digest("hex");

  return {
    entrypointPath: outfile,
    directory: outdir,
    hash: codeHash,
  };
}