"use strict";
import { execSync } from 'child_process';
import { detect } from 'package-manager-detector';

const commandMap = {
  npm: {
    run: (script, args) => `npm run ${script} -- ${args}`,
    add: (args, isDev) => `npm install ${isDev ? "-D" : ""}${args.join(" ")}`,
    install: "npm install"
  },
  yarn: {
    run: (script, args) => `yarn ${script} ${args}`,
    add: (args, isDev) => `yarn add ${isDev ? "-D" : ""}${args.join(" ")}`,
    install: "yarn"
  },
  pnpm: {
    run: (script, args) => `pnpm run ${script} -- ${args}`,
    add: (args, isDev) => `pnpm add ${isDev ? "-D" : ""}${args.join(" ")}`,
    install: "pnpm install"
  },
  bun: {
    run: (script, args) => `bun run ${script} -- ${args}`,
    add: (args, isDev) => `bun install ${isDev ? "-D" : ""}${args.join(" ")}`,
    install: "bun install"
  }
};
async function installCommand(args, cwd) {
  const res = await detect({ cwd });
  const agent = res?.agent?.split("@")[0] || "npm";
  try {
    const command = Reflect.get(commandMap, agent);
    const str = command.add(args);
    execSync(str, { cwd, stdio: "inherit", encoding: "utf-8" });
  } catch (error) {
    console.error(error);
  }
}

export { installCommand };
