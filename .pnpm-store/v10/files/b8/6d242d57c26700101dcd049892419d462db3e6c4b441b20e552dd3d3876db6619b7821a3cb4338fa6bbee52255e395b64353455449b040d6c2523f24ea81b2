"use strict";
import createDebug from 'debug';
import { resolve } from 'node:path';
import { parse } from 'tsconfck';

const debug = createDebug("chakra:tsconfig");
async function resolveTsconfig(sourceFile, tsconfigPath) {
  if (tsconfigPath) {
    const resolved = resolve(tsconfigPath);
    debug("using explicit tsconfig:", resolved);
    return resolved;
  }
  try {
    const result = await parse(sourceFile);
    if (!result.tsconfigFile) {
      debug("no tsconfig found for", sourceFile);
      return void 0;
    }
    debug("found tsconfig:", result.tsconfigFile);
    if (result.referenced && result.referenced.length > 0) {
      debug("solution-style tsconfig detected, checking references...");
      for (const ref of result.referenced) {
        if (ref.tsconfig?.compilerOptions?.paths) {
          debug("found paths in referenced tsconfig:", ref.tsconfigFile);
          return ref.tsconfigFile;
        }
      }
      debug("no paths found in references, using first reference");
      return result.referenced[0].tsconfigFile;
    }
    return result.tsconfigFile;
  } catch (error) {
    debug("tsconfig resolution failed:", error);
    return void 0;
  }
}

export { resolveTsconfig };
