import { createRequire, _resolveFilename } from 'module';
import { dirname } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { resolve as tsNodeResolve } from 'ts-node/esm';

export { load, getFormat, transformSource } from 'ts-node/esm';

const require = createRequire(process.cwd() + '/');

let otherPaths = [];
let nxBaseDir = '';
// load the tsconfig, grab the library paths,
// and get the base nx workspace directory
if (process.env.NX_BASE_TSCONFIG) {
  const tsconfig = require(process.env.NX_BASE_TSCONFIG);

  otherPaths = tsconfig.compilerOptions.paths;

  const baseConfigURL = pathToFileURL(process.env.NX_BASE_TSCONFIG).href;
  nxBaseDir = dirname(baseConfigURL) + '/';
}

export async function resolve(specifier, context, nextResolve) {
  let refinedSpecifier = specifier;

  // use NX's lib paths to resolve local packages
  if (otherPaths[specifier]) {
    refinedSpecifier = new URL(otherPaths[specifier], nxBaseDir).href;
  }

  return await tsNodeResolve(refinedSpecifier, context, nextResolve);
}
