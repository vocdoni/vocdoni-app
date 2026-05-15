'use strict';

var logger = require('./utils/logger.js');
var i18nextResourcesForTs = require('i18next-resources-for-ts');
var glob = require('glob');
var wrapOra = require('./utils/wrap-ora.js');
var node_util = require('node:util');
var promises = require('node:fs/promises');
var node_path = require('node:path');
var core = require('@swc/core');
var fileUtils = require('./utils/file-utils.js');
var vm = require('node:vm');

async function loadFile(file) {
    const ext = node_path.extname(file);
    if (['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'].includes(ext)) {
        const content = await promises.readFile(file, 'utf-8');
        const { code } = await core.transform(content, {
            filename: file,
            jsc: {
                parser: {
                    syntax: 'typescript',
                },
                target: 'es2018'
            },
            module: {
                type: 'commonjs'
            }
        });
        const exports = {};
        const module = { exports };
        const context = vm.createContext({
            exports,
            module,
            require: (id) => require(id),
            console,
            process
        });
        const script = new vm.Script(code, { filename: file });
        script.runInContext(context);
        // @ts-ignore
        const exported = context.module.exports?.default || context.module.exports;
        return exported;
    }
    const content = await promises.readFile(file, 'utf-8');
    return JSON.parse(content);
}
/**
 * Generates TypeScript type definitions for i18next translations.
 *
 * This function:
 * 1. Reads translation files based on the input glob patterns
 * 2. Generates TypeScript interfaces using i18next-resources-for-ts
 * 3. Creates separate resources.d.ts and main i18next.d.ts files
 * 4. Handles namespace detection from filenames
 * 5. Supports type-safe selector API when enabled
 *
 * @param config - The i18next toolkit configuration object
 *
 * @example
 * ```typescript
 * // Configuration
 * const config = {
 *   types: {
 *     input: ['locales/en/*.json'],
 *     output: 'src/types/i18next.d.ts',
 *     enableSelector: true
 *   }
 * }
 *
 * await runTypesGenerator(config)
 * ```
 */
async function runTypesGenerator(config, options = {}) {
    const internalLogger = options.logger ?? new logger.ConsoleLogger();
    const spinner = wrapOra.createSpinnerLike('Generating TypeScript types for translations...\n', { quiet: !!options.quiet, logger: options.logger });
    try {
        config.extract.primaryLanguage ||= config.locales[0] || 'en';
        let defaultTypesInputPath = config.extract.output || `locales/${config.extract.primaryLanguage}/*.json`;
        defaultTypesInputPath = fileUtils.getOutputPath(defaultTypesInputPath, config.extract.primaryLanguage || 'en', '*');
        if (!config.types)
            config.types = { input: defaultTypesInputPath, output: 'src/@types/i18next.d.ts' };
        if (config.types.input === undefined)
            config.types.input = defaultTypesInputPath;
        if (!config.types.output)
            config.types.output = 'src/@types/i18next.d.ts';
        if (!config.types.resourcesFile)
            config.types.resourcesFile = node_path.join(node_path.dirname(config.types?.output), 'resources.d.ts');
        if (!config.types?.input || config.types?.input.length < 0) {
            console.log('No input defined!');
            return;
        }
        const resourceFiles = await glob.glob(config.types?.input || [], {
            cwd: process.cwd(),
        });
        const resources = [];
        for (const file of resourceFiles) {
            const namespace = node_path.basename(file, node_path.extname(file));
            const parsedContent = await loadFile(file);
            // If mergeNamespaces is used, a single file can contain multiple namespaces
            // (e.g. { "translation": { ... }, "common": { ... } } in a per-language file).
            // In that case, expose each top-level key as a namespace entry so the type
            // generator will produce top-level namespace interfaces (not a language wrapper).
            if (config.extract?.mergeNamespaces && parsedContent && typeof parsedContent === 'object') {
                const keys = Object.keys(parsedContent);
                const objectKeys = keys.filter(k => parsedContent[k] && typeof parsedContent[k] === 'object');
                // If we have at least one object and we are in mergeNamespaces mode, assume it's a merged file
                if (objectKeys.length > 0) {
                    for (const nsName of objectKeys) {
                        resources.push({ name: nsName, resources: parsedContent[nsName] });
                    }
                    const nonObjectKeys = keys.filter(k => !parsedContent[k] || typeof parsedContent[k] !== 'object');
                    if (nonObjectKeys.length > 0) {
                        console.warn(node_util.styleText('yellow', `Warning: The file ${file} contains top-level keys that are not objects (${nonObjectKeys.join(', ')}). When 'mergeNamespaces' is enabled, top-level keys are treated as namespaces. These keys will be ignored.`));
                    }
                    continue;
                }
            }
            resources.push({ name: namespace, resources: parsedContent });
        }
        const logMessages = [];
        const enableSelector = config.types?.enableSelector || false;
        const indentation = config.types?.indentation ?? config.extract.indentation ?? 2;
        const interfaceDefinition = `// This file is automatically generated by i18next-cli. Do not edit manually.
${i18nextResourcesForTs.mergeResourcesAsInterface(resources, { optimize: !!enableSelector, indentation })}`;
        const outputPath = node_path.resolve(process.cwd(), config.types?.output || '');
        const resourcesOutputPath = node_path.resolve(process.cwd(), config.types.resourcesFile);
        await promises.mkdir(node_path.dirname(resourcesOutputPath), { recursive: true });
        await promises.writeFile(resourcesOutputPath, interfaceDefinition);
        logMessages.push(`  ${node_util.styleText('green', '✓')} Resources interface written to ${config.types.resourcesFile}`);
        let outputPathExists;
        try {
            await promises.access(outputPath);
            outputPathExists = true;
        }
        catch (e) {
            outputPathExists = false;
        }
        if (!outputPathExists) {
            // The main output file will now import from the resources file
            const importPath = node_path.relative(node_path.dirname(outputPath), resourcesOutputPath)
                .replace(/\\/g, '/').replace(/\.d\.ts$/, ''); // Make it a valid module path
            const defaultNS = config.extract.defaultNS === false ? 'false' : `'${config.extract.defaultNS || 'translation'}'`;
            const fallbackNS = config.extract.fallbackNS === false ? 'false' : `'${config.extract.fallbackNS}'`;
            const fileContent = `// This file is automatically generated by i18next-cli, because it was not existing. You can edit it based on your needs: https://www.i18next.com/overview/typescript#custom-type-options
import Resources from './${importPath}';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: ${typeof enableSelector === 'string' ? `"${enableSelector}"` : enableSelector};
    defaultNS: ${defaultNS};${config.extract.fallbackNS ? `\n    fallbackNS: ${fallbackNS};` : ''}
    resources: Resources;
  }
}`;
            await promises.mkdir(node_path.dirname(outputPath), { recursive: true });
            await promises.writeFile(outputPath, fileContent);
            logMessages.push(`  ${node_util.styleText('green', '✓')} TypeScript definitions written to ${config.types.output || ''}`);
        }
        spinner.succeed(node_util.styleText('bold', 'TypeScript definitions generated successfully.'));
        logMessages.forEach(msg => typeof internalLogger.info === 'function' ? internalLogger.info(msg) : console.log(msg));
    }
    catch (error) {
        spinner.fail(node_util.styleText('red', 'Failed to generate TypeScript definitions.'));
        if (typeof internalLogger.error === 'function')
            internalLogger.error(error);
        else
            console.error(error);
    }
}

exports.runTypesGenerator = runTypesGenerator;
