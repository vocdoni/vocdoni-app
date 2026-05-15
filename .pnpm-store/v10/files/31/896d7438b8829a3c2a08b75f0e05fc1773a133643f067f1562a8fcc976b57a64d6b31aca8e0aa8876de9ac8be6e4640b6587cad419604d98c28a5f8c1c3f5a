"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
const exists = async (path2) => {
  try {
    await fs.promises.access(path2);
    return true;
  } catch {
    return false;
  }
};
const isRoot = (dir) => dir === path.dirname(dir);
const stop = Symbol("stop");
const isStop = (res) => res === stop;
const lookItUp = async (matcher, dir = process.cwd()) => {
  if (typeof matcher === "string") {
    const targetPath = path.join(dir, matcher);
    return await exists(targetPath) ? targetPath : isRoot(dir) ? null : await lookItUp(matcher, path.dirname(dir));
  }
  const matcherResult = await matcher(dir);
  return isStop(matcherResult) ? null : matcherResult != null ? matcherResult : isRoot(dir) ? null : await lookItUp(matcher, path.dirname(dir));
};
const lookItUpSync = (matcher, dir = process.cwd()) => {
  if (typeof matcher === "function" && matcher(dir) instanceof Promise) {
    throw new Error("Async matcher can not be used in 'lookItUpSync'");
  }
  if (typeof matcher === "string") {
    const targetPath = path.join(dir, matcher);
    return fs.existsSync(targetPath) ? targetPath : isRoot(dir) ? null : lookItUpSync(matcher, path.dirname(dir));
  }
  const matcherResult = matcher(dir);
  return isStop(matcherResult) ? null : matcherResult != null ? matcherResult : isRoot(dir) ? null : lookItUpSync(matcher, path.dirname(dir));
};
exports.exists = exists;
exports.lookItUp = lookItUp;
exports.lookItUpSync = lookItUpSync;
exports.stop = stop;
