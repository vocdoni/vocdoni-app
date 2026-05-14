"use strict";
import * as p from '@clack/prompts';
import { boxen } from '@visulima/boxen';
import { Command } from 'commander';
import createDebug from 'debug';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'node:path/posix';
import { z } from 'zod';
import { getProjectContext } from '../utils/context.js';
import { convertTsxToJsx } from '../utils/convert-tsx-to-jsx.js';
import { fetchProBlocks, fetchProBlock } from '../utils/fetch.js';
import { ensureDir } from '../utils/io.js';
import { addCommandFlagsSchema } from '../utils/schema.js';
import { tasks } from '../utils/tasks.js';

const debug = createDebug("chakra:blocks");
function handleCancel(value) {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }
}
function ensureApiKey() {
  const apiKey = process.env.CHAKRA_UI_PRO_API_KEY;
  if (!apiKey) {
    p.log.error("CHAKRA_UI_PRO_API_KEY environment variable is required");
    p.outro("Set your API key and try again");
    process.exit(1);
  }
  return apiKey;
}
const BlocksCommand = new Command("blocks").description("Add Chakra UI Pro blocks to your project").addCommand(
  new Command("add").description("Add a new block from Chakra UI Pro").argument("[blockId]", "block ID to add").option("-v, --variant <variant>", "Specific variant to add").option("-d, --dry-run", "Dry run").option("--outdir <dir>", "Output directory to write the blocks").option("-f, --force", "Overwrite existing files").option("--tsx", "Convert to TSX").action(async (blockId, flags) => {
    const parsedFlags = addCommandFlagsSchema.extend({
      variant: z.string().optional()
    }).parse(flags);
    const { dryRun, force, tsx, variant } = parsedFlags;
    const ctx = await getProjectContext({
      cwd: parsedFlags.outdir || process.cwd(),
      tsx
    });
    debug("context", ctx);
    const jsx = !ctx.isTypeScript;
    const baseOutdir = parsedFlags.outdir || "src/components/blocks";
    const apiKey = ensureApiKey();
    const blocksResponse = await fetchProBlocks();
    const allBlocks = blocksResponse.data;
    let blocksToDownload = [];
    if (!blockId) {
      const blockOptions = allBlocks.flatMap(
        (block) => block.variants.map((v) => ({
          value: `${block.id}/${v.id}`,
          label: `${block.group}/${block.name} - ${v.name}`
        }))
      );
      const selectedBlock = await p.select({
        message: "Select a block:",
        options: blockOptions
      });
      handleCancel(selectedBlock);
      blocksToDownload = [selectedBlock];
    } else {
      const targetBlock = allBlocks.find(
        (block) => block.id === blockId
      );
      if (!targetBlock) {
        p.log.error(`Block "${blockId}" not found`);
        const availableBlocks = allBlocks.map((block) => block.id).join(", ");
        p.log.info(`Available blocks: ${availableBlocks}`);
        process.exit(1);
      }
      if (variant) {
        const targetVariant = targetBlock.variants.find(
          (v) => v.id === variant
        );
        if (!targetVariant) {
          p.log.error(
            `Variant "${variant}" not found for block "${blockId}"`
          );
          const availableVariants = targetBlock.variants.map((v) => v.id).join(", ");
          p.log.info(`Available variants: ${availableVariants}`);
          process.exit(1);
        }
        blocksToDownload = [`${blockId}/${variant}`];
      } else {
        blocksToDownload = targetBlock.variants.map(
          (v) => `${blockId}/${v.id}`
        );
      }
    }
    debug("blocksToDownload", blocksToDownload);
    p.log.info(`Adding ${blocksToDownload.length} block(s)...`);
    let skippedFiles = [];
    await tasks([
      {
        title: "Downloading selected blocks",
        task: async () => {
          await Promise.all(
            blocksToDownload.map(async (blockId2) => {
              const [category, id] = blockId2.split("/");
              if (!category || !id) {
                p.log.warn(
                  `Invalid block ID format: ${blockId2}. Expected format: category/id`
                );
                return;
              }
              try {
                const blockData = await fetchProBlock(category, id, apiKey);
                const files = blockData.files;
                if (!files || files.length === 0) {
                  p.log.error(`No files found for block ${blockId2}`);
                  return;
                }
                const blockOutdir = join(baseOutdir, category, id);
                ensureDir(blockOutdir);
                for (const fileData of files) {
                  let filename = fileData.filename || `${id}.tsx`;
                  let content = fileData.content;
                  if (!content) {
                    p.log.warn(
                      `No content found for file ${filename} in block ${blockId2}`
                    );
                    continue;
                  }
                  if (jsx) {
                    filename = filename.replace(".tsx", ".jsx");
                    content = await convertTsxToJsx(content);
                  }
                  if (existsSync(join(blockOutdir, filename)) && !force) {
                    skippedFiles.push(filename);
                    continue;
                  }
                  if (dryRun) {
                    printBlockSync(content, filename);
                  } else {
                    const outPath = join(blockOutdir, filename);
                    await writeFile(outPath, content, "utf-8");
                  }
                }
              } catch (error) {
                if (error instanceof Error) {
                  p.log.error(
                    `Failed to fetch block ${blockId2}: ${error.message}`
                  );
                }
              }
            })
          );
        }
      }
    ]);
    if (skippedFiles.length) {
      p.log.warn(
        `Skipping ${skippedFiles.length} file(s) that already exist. Use the --force flag to overwrite.`
      );
    }
    if (blocksToDownload.length === 1) {
      const [category, id] = blocksToDownload[0].split("/");
      const blockOutdir = join(baseOutdir, category, id);
      p.outro(`\u{1F389} Added block to ${blockOutdir}`);
    } else {
      p.outro(`\u{1F389} Added ${blocksToDownload.length} blocks to ${baseOutdir}`);
    }
  })
).addCommand(
  new Command("list").description("List available Chakra UI Pro blocks").option("-c, --category <category>", "Filter by category").action(async (flags) => {
    const { default: Table } = await import('cli-table');
    const table = new Table({
      head: ["Category", "Name"],
      colWidths: [20, 50],
      style: { compact: true }
    });
    try {
      const blocksResponse = await fetchProBlocks();
      const blocks = blocksResponse.data.filter(
        (block) => block.group.toLowerCase() !== "documentation"
      );
      const filteredBlocks = flags.category ? blocks.filter(
        (block) => block.group.toLowerCase() === flags.category?.toLowerCase() || block.id === flags.category
      ) : blocks;
      if (filteredBlocks.length === 0) {
        if (flags.category) {
          p.log.warn(`No blocks found for category: ${flags.category}`);
          const categories = [
            ...new Set(blocks.map((block) => block.group))
          ].join(", ");
          p.log.info(`Available categories: ${categories}`);
        } else {
          p.log.warn("No blocks found");
        }
        return;
      }
      filteredBlocks.sort((a, b) => a.group.localeCompare(b.group)).forEach((block) => {
        const blockCount = block.variants.length;
        const nameWithCount = `${block.name} (${blockCount} block${blockCount === 1 ? "" : "s"})`;
        table.push([block.group, nameWithCount]);
      });
      const totalVariants = filteredBlocks.reduce(
        (sum, block) => sum + block.variants.length,
        0
      );
      p.log.info(
        `Found ${totalVariants} block(s) across ${filteredBlocks.length} component(s)`
      );
      p.log.info(table.toString());
    } catch (error) {
      p.log.error("Failed to fetch blocks list");
      if (error instanceof Error) {
        debug("error", error.message);
      }
    }
    p.outro("\u{1F389} Done!");
  })
);
function printBlockSync(content, filename) {
  const boxText = boxen(content, {
    headerText: `${filename}
`,
    borderStyle: "none"
  });
  p.log.info(boxText);
}

export { BlocksCommand };
