"use strict";
import * as p from '@clack/prompts';
import { Command } from 'commander';
import createDebug from 'debug';
import { writeFileSync } from 'fs';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { generateCondition } from '../utils/generate-conditions.js';
import { generatePropTypes } from '../utils/generate-prop-types.js';
import { generateRecipe } from '../utils/generate-recipe.js';
import { generateSystemTypes } from '../utils/generate-system-types.js';
import { generateTokens } from '../utils/generate-tokens.js';
import { clean, read, watch, ensureDir, write } from '../utils/io.js';
import { tasks } from '../utils/tasks.js';

const debug = createDebug("chakra:typegen");
const req = createRequire(import.meta.url);
const getDefaultBasePath = () => {
  const cwd = process.cwd();
  if (!process.env.LOCAL) {
    const root2 = req.resolve("@chakra-ui/react", { paths: [cwd] });
    return resolve(root2, "..", "..", "types", "styled-system", "generated");
  }
  const root = join(cwd, "packages", "react", "src");
  return join(root, "styled-system", "generated");
};
const TypegenCommand = new Command("typegen").argument("<source>", "path to the theme file").description("Generate theme and recipe typings").option("--strict", "Generate strict types for props variant and size").option("--watch [path]", "Watch directory for changes and rebuild").option("--clean", "Clean the output directory").option(
  "--outdir <dir>",
  "Output directory to write the generated types",
  getDefaultBasePath()
).option(
  "--tsconfig <path>",
  "Path to tsconfig file for resolving path aliases"
).action(async (source, flags) => {
  debug("source", source);
  debug("flags", flags);
  if (flags.clean) {
    debug("cleaning output directory", flags.outdir);
    await clean(flags.outdir);
  }
  let result = await read(source, { tsconfig: flags.tsconfig });
  if (process.env.DEBUG) {
    const configPath = resolve("chakra-config.json");
    debug("writing bundled source to", configPath);
    const config = result.mod._config;
    writeFileSync("chakra-config.json", JSON.stringify(config, null, 2));
  }
  const build = async () => {
    await codegen(result.mod, flags);
    if (flags.watch) {
      p.log.info("\n\u231B\uFE0F Watching for changes...");
    }
  };
  if (!flags.watch) {
    await build();
  } else {
    debug("watch dependencies", result.dependencies);
    watch(result.dependencies, async () => {
      result = await read(source, { tsconfig: flags.tsconfig });
      return build();
    });
  }
  p.outro("\u{1F389} Done!");
});
function codegen(sys, flags) {
  ensureDir(flags.outdir);
  debug("writing codegen to", flags.outdir);
  return tasks([
    {
      title: "Generating conditions types...",
      task: async () => {
        await write(flags.outdir, "conditions.gen", generateCondition(sys));
        return "\u2705 Generated conditions typings";
      }
    },
    {
      title: "Generating recipe types...",
      task: async () => {
        await write(
          flags.outdir,
          "recipes.gen",
          generateRecipe(sys, flags.strict)
        );
        return "\u2705 Generated recipe typings";
      }
    },
    {
      title: "Generating utility types...",
      task: async () => {
        await write(flags.outdir, "prop-types.gen", generatePropTypes(sys));
        return "\u2705 Generated utility typings";
      }
    },
    {
      title: "Generating token types...",
      task: async () => {
        await write(flags.outdir, "token.gen", generateTokens(sys));
        return "\u2705 Generated token typings";
      }
    },
    {
      title: "Generating system types...",
      task: async () => {
        await write(flags.outdir, "system.gen", generateSystemTypes(sys));
        return "\u2705 Generated system types";
      }
    }
  ]);
}

export { TypegenCommand };
