"use strict";
import { log } from '@clack/prompts';
import chokidar from 'chokidar';
import createDebug from 'debug';
import { build } from 'esbuild';
import { existsSync, mkdirSync, rm, realpathSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve, extname, join } from 'node:path';
import vm from 'node:vm';
import { resolveTsconfig } from './resolve-tsconfig.js';

const debug = createDebug("chakra:io");
const require$1 = createRequire(import.meta.url);
async function bundleFile(file, cwd, tsconfigPath) {
  const tsconfig = await resolveTsconfig(file, tsconfigPath);
  debug("resolved tsconfig for esbuild:", tsconfig);
  const result = await build({
    platform: "node",
    format: "cjs",
    mainFields: ["module", "main"],
    absWorkingDir: cwd,
    entryPoints: [file],
    outfile: "out.js",
    write: false,
    bundle: true,
    sourcemap: false,
    metafile: true,
    ...tsconfig ? { tsconfig } : {}
  });
  const { text } = result.outputFiles[0];
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
  };
}
function loadBundledCode(file, code) {
  try {
    return loadViaRequire(file, code);
  } catch {
    return loadViaVm(code);
  }
}
function loadViaRequire(file, code) {
  const ext = extname(file);
  const realFileName = realpathSync.native(file);
  const defaultLoader = require$1.extensions[ext];
  require$1.extensions[ext] = (mod, filename) => {
    if (filename === realFileName) {
      mod._compile(code, filename);
    } else {
      defaultLoader?.(mod, filename);
    }
  };
  delete require$1.cache[require$1.resolve(file)];
  const raw = require$1(file);
  const result = raw.default ?? raw;
  require$1.extensions[ext] = defaultLoader;
  return result;
}
function loadViaVm(code) {
  const mod = { exports: {} };
  const ctx = vm.createContext({
    module: mod,
    exports: mod.exports,
    require: require$1
  });
  vm.runInContext(code, ctx);
  const raw = mod.exports;
  return raw.default ?? raw;
}
const isValidSystem = (mod) => {
  return Object.hasOwnProperty.call(mod, "$$chakra");
};
const read = async (file, options = {}) => {
  const { cwd = process.cwd(), tsconfig } = options;
  const filePath = resolve(file);
  const bundle = await bundleFile(filePath, cwd, tsconfig);
  const mod = loadBundledCode(filePath, bundle.code);
  const resolvedMod = mod.default || mod.preset || mod.system || mod;
  if (!isValidSystem(resolvedMod)) {
    throw new Error(
      `No default export found in ${file}. Did you forget to provide an export default?`
    );
  }
  return { mod: resolvedMod, dependencies: bundle.dependencies };
};
const outPath = (path, file) => {
  const ext = process.env.LOCAL ? "ts" : "d.ts";
  return join(path, `${file}.${ext}`);
};
function ensureDir(dirPath) {
  if (existsSync(dirPath)) return;
  ensureDir(dirname(dirPath));
  mkdirSync(dirPath);
}
const write = async (path, file, content) => {
  try {
    await writeFile(outPath(path, file), await content);
  } catch (error) {
    throw new Error(
      `Failed to write file ${outPath(path, file)}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
function watch(paths, cb) {
  const watcher = chokidar.watch(paths, { ignoreInitial: true });
  watcher.on("ready", cb).on("change", async (filePath) => {
    log.info(`\u{1F4E6} File changed: ${filePath}`);
    return cb();
  });
  process.once("SIGINT", () => watcher.close());
  process.once("SIGTERM", () => watcher.close());
}
async function clean(basePath) {
  log.info("\u{1F9F9} Cleaning output directory");
  rm(basePath, { recursive: true }, (err) => {
    if (err) {
      log.error(err.message);
    }
  });
}

export { clean, ensureDir, read, watch, write };
