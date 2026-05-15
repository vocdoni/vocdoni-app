'use strict';

var node_util = require('node:util');
var glob = require('glob');
var promises = require('node:fs/promises');
var node_path = require('node:path');
var wrapOra = require('./utils/wrap-ora.js');
var logger = require('./utils/logger.js');
var defaultValue = require('./utils/default-value.js');
var fileUtils = require('./utils/file-utils.js');
var funnelMsgTracker = require('./utils/funnel-msg-tracker.js');
var nestedObject = require('./utils/nested-object.js');

/**
 * Synchronizes translation files across different locales by ensuring all secondary
 * language files contain the same keys as the primary language file.
 *
 * This function:
 * 1. Reads the primary language translation file
 * 2. Extracts all translation keys from the primary file
 * 3. For each secondary language:
 *    - Preserves existing translations
 *    - Adds missing keys with empty values or configured default
 *    - Removes keys that no longer exist in primary
 * 4. Only writes files that have changes
 *
 * @param config - The i18next toolkit configuration object
 *
 * @example
 * ```typescript
 * // Configuration
 * const config = {
 *   locales: ['en', 'de', 'fr'],
 *   extract: {
 *     output: 'locales/{{language}}/{{namespace}}.json',
 *     defaultNS: 'translation'
 *     defaultValue: '[MISSING]'
 *   }
 * }
 *
 * await runSyncer(config)
 * ```
 */
async function runSyncer(config, options = {}) {
    const internalLogger = options.logger ?? new logger.ConsoleLogger();
    const spinner = wrapOra.createSpinnerLike('Running i18next locale synchronizer...\n', { quiet: !!options.quiet, logger: options.logger });
    try {
        const primaryLanguage = config.extract.primaryLanguage || config.locales[0] || 'en';
        const secondaryLanguages = config.locales.filter((l) => l !== primaryLanguage);
        const { output, keySeparator = '.', outputFormat = 'json', indentation = 2, defaultValue: defaultValue$1 = '', } = config.extract;
        const logMessages = [];
        let wasAnythingSynced = false;
        // 1. Find all namespace files for the primary language
        const primaryNsPatternRaw = fileUtils.getOutputPath(output, primaryLanguage, '*');
        // Ensure glob receives POSIX-style separators so pattern matching works cross-platform (Windows -> backslashes)
        const primaryNsPattern = primaryNsPatternRaw.replace(/\\/g, '/');
        const primaryNsFiles = await glob.glob(primaryNsPattern);
        if (primaryNsFiles.length === 0) {
            const noFilesMsg = `No translation files found for primary language "${primaryLanguage}". Nothing to sync.`;
            spinner.warn(noFilesMsg);
            // Always emit the message to the provided logger (if any) so tests / CI can observe it
            if (typeof internalLogger.warn === 'function')
                internalLogger.warn(noFilesMsg);
            else
                console.warn(noFilesMsg);
            return;
        }
        // Filter out ignored namespaces
        const ignoreNamespaces = new Set(config.extract.ignoreNamespaces ?? []);
        // 2. Loop through each primary namespace file
        for (const primaryPath of primaryNsFiles) {
            const ns = node_path.basename(primaryPath).split('.')[0];
            // Skip ignored namespaces
            if (ignoreNamespaces.has(ns))
                continue;
            const primaryTranslations = await fileUtils.loadTranslationFile(primaryPath);
            if (!primaryTranslations) {
                logMessages.push(`  ${node_util.styleText('yellow', '-')} Could not read primary file: ${primaryPath}`);
                continue;
            }
            const primaryKeys = nestedObject.getNestedKeys(primaryTranslations, keySeparator ?? '.');
            // 3. For each secondary language, sync the current namespace
            for (const lang of secondaryLanguages) {
                const secondaryPath = fileUtils.getOutputPath(output, lang, ns);
                const fullSecondaryPath = node_path.resolve(process.cwd(), secondaryPath);
                const existingSecondaryTranslations = await fileUtils.loadTranslationFile(fullSecondaryPath) || {};
                const newSecondaryTranslations = {};
                for (const key of primaryKeys) {
                    const primaryValue = nestedObject.getNestedValue(primaryTranslations, key, keySeparator ?? '.');
                    const existingValue = nestedObject.getNestedValue(existingSecondaryTranslations, key, keySeparator ?? '.');
                    // Use the resolved default value if no existing value
                    const valueToSet = existingValue ?? defaultValue.resolveDefaultValue(defaultValue$1, key, ns, lang, primaryValue);
                    nestedObject.setNestedValue(newSecondaryTranslations, key, valueToSet, keySeparator ?? '.');
                }
                // Use JSON.stringify for a reliable object comparison, regardless of format
                const oldContent = JSON.stringify(existingSecondaryTranslations);
                const newContent = JSON.stringify(newSecondaryTranslations);
                if (newContent !== oldContent) {
                    wasAnythingSynced = true;
                    const perFileFormat = config.extract.outputFormat ?? fileUtils.inferFormatFromPath(fullSecondaryPath, outputFormat);
                    const raw = perFileFormat === 'json5' ? (await fileUtils.loadRawJson5Content(fullSecondaryPath)) ?? undefined : undefined;
                    const serializedContent = fileUtils.serializeTranslationFile(newSecondaryTranslations, perFileFormat, indentation, raw);
                    await promises.mkdir(node_path.dirname(fullSecondaryPath), { recursive: true });
                    await promises.writeFile(fullSecondaryPath, serializedContent);
                    logMessages.push(`  ${node_util.styleText('green', '✓')} Synchronized: ${secondaryPath}`);
                }
                else {
                    logMessages.push(`  ${node_util.styleText('gray', '-')} Already in sync: ${secondaryPath}`);
                }
            }
        }
        spinner.succeed(node_util.styleText('bold', 'Synchronization complete!'));
        logMessages.forEach(msg => internalLogger.info ? internalLogger.info(msg) : console.log(msg));
        if (wasAnythingSynced) {
            await printLocizeFunnel();
        }
        else {
            if (typeof internalLogger.info === 'function')
                internalLogger.info(node_util.styleText(['green', 'bold'], '\n✅ All locales are already in sync.'));
            else
                console.log(node_util.styleText(['green', 'bold'], '\n✅ All locales are already in sync.'));
        }
    }
    catch (error) {
        spinner.fail(node_util.styleText('red', 'Synchronization failed.'));
        if (typeof internalLogger.error === 'function')
            internalLogger.error(error);
        else
            console.error(error);
    }
}
async function printLocizeFunnel() {
    if (!(await funnelMsgTracker.shouldShowFunnel('syncer')))
        return;
    console.log(node_util.styleText(['green', 'bold'], '\n✅ Sync complete.'));
    console.log(node_util.styleText('yellow', '🚀 Ready to collaborate with translators? Move your files to the cloud.'));
    console.log(`   Get started with the official TMS for i18next: ${node_util.styleText('cyan', 'npx i18next-cli locize-migrate')}`);
    return funnelMsgTracker.recordFunnelShown('syncer');
}

exports.runSyncer = runSyncer;
