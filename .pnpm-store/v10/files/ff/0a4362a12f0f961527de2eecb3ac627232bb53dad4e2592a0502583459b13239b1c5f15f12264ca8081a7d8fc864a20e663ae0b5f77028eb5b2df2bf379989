import { dirname, join } from "path";
import { promises, existsSync } from "fs";
const exists = async (path) => {
  try {
    await promises.access(path);
    return true;
  } catch {
    return false;
  }
};
const isRoot = (dir) => dir === dirname(dir);
const stop = Symbol("stop");
const isStop = (res) => res === stop;
const lookItUp = async (matcher, dir = process.cwd()) => {
  if (typeof matcher === "string") {
    const targetPath = join(dir, matcher);
    return await exists(targetPath) ? targetPath : isRoot(dir) ? null : await lookItUp(matcher, dirname(dir));
  }
  const matcherResult = await matcher(dir);
  return isStop(matcherResult) ? null : matcherResult != null ? matcherResult : isRoot(dir) ? null : await lookItUp(matcher, dirname(dir));
};
const lookItUpSync = (matcher, dir = process.cwd()) => {
  if (typeof matcher === "function" && matcher(dir) instanceof Promise) {
    throw new Error("Async matcher can not be used in 'lookItUpSync'");
  }
  if (typeof matcher === "string") {
    const targetPath = join(dir, matcher);
    return existsSync(targetPath) ? targetPath : isRoot(dir) ? null : lookItUpSync(matcher, dirname(dir));
  }
  const matcherResult = matcher(dir);
  return isStop(matcherResult) ? null : matcherResult != null ? matcherResult : isRoot(dir) ? null : lookItUpSync(matcher, dirname(dir));
};
export { exists, lookItUp, lookItUpSync, stop };
