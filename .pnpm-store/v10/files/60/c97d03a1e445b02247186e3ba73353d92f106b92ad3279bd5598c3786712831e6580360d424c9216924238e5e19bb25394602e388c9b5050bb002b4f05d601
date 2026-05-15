export { serializeConfigValues };
export { getConfigValuesBase };
export { isJsonValue };
import { assertIsNotProductionRuntime } from '../../../utils/assertSetup.js';
import { assert, assertUsage } from '../../../utils/assert.js';
import { assertIsNotBrowser } from '../../../utils/assertIsNotBrowser.js';
import { assertPosixPath } from '../../../utils/path.js';
import { deepEqual } from '../../../utils/deepEqual.js';
import { getPropAccessNotation } from '../../../utils/getPropAccessNotation.js';
import { isImportPathRelative } from '../../../utils/isImportPath.js';
import { parsePointerImportData } from '../../../node/vite/shared/resolveVikeConfigInternal/pointerImports.js';
import { getConfigValueFilePathToShowToUser } from '../helpers.js';
import { stringify } from '@brillout/json-serializer/stringify';
import pc from '@brillout/picocolors';
import { getConfigValueSourcesRelevant, isRuntimeEnvMatch, } from '../../../node/vite/plugins/pluginVirtualFiles/getConfigValueSourcesRelevant.js';
const stringifyOptions = { forbidReactElements: true };
const REPLACE_ME_BEFORE = '__VIKE__REPLACE_ME_BEFORE__';
const REPLACE_ME_AFTER = '__VIKE__REPLACE_ME_AFTER__';
// This file is never loaded on the client-side but we save it under the vike/shared/ directory in order to collocate it with parsePageConfigsSerialized()
// - vike/shared/page-configs/serialize/parsePageConfigsSerialized.ts
// - parsePageConfigsSerialized() is loaded on both the client- and server-side.
assertIsNotBrowser();
assertIsNotProductionRuntime();
function serializeConfigValues(pageConfig, importStatements, filesEnv, runtimeEnv, tabspace, isEager) {
    const lines = [];
    tabspace += '  ';
    getConfigValuesBase(pageConfig, runtimeEnv, isEager).forEach((entry) => {
        if (entry.configValueBase.type === 'computed') {
            assert('value' in entry); // Help TS
            const { configValueBase, value, configName, configEnv } = entry;
            const valueData = getValueSerializedWithJson(value, configName, configValueBase.definedAtData, importStatements, filesEnv, configEnv);
            serializeConfigValue(configValueBase, valueData, configName, lines, tabspace);
        }
        if (entry.configValueBase.type === 'standard') {
            assert('sourceRelevant' in entry); // Help TS
            const { configValueBase, sourceRelevant, configName } = entry;
            const valueData = getValueSerializedFromSource(sourceRelevant, configName, importStatements, filesEnv);
            serializeConfigValue(configValueBase, valueData, configName, lines, tabspace);
        }
        if (entry.configValueBase.type === 'cumulative') {
            assert('sourcesRelevant' in entry); // Help TS
            const { configValueBase, sourcesRelevant, configName } = entry;
            const valueDataList = [];
            sourcesRelevant.forEach((source) => {
                const valueData = getValueSerializedFromSource(source, configName, importStatements, filesEnv);
                valueDataList.push(valueData);
            });
            serializeConfigValue(configValueBase, valueDataList, configName, lines, tabspace);
        }
    });
    return lines;
}
function getValueSerializedFromSource(configValueSource, configName, importStatements, filesEnv) {
    let valueData;
    if (configValueSource.valueIsLoaded && !configValueSource.valueLoadedViaImport) {
        valueData = getValueSerializedWithJson(configValueSource.value, configName, configValueSource.definedAt, importStatements, filesEnv, configValueSource.configEnv);
    }
    else {
        valueData = getValueSerializedWithImport(configValueSource, importStatements, filesEnv, configName);
    }
    return valueData;
}
function serializeConfigValue(configValueBase, valueData, configName, lines, tabspace) {
    lineAdd(`[${JSON.stringify(configName)}]: {`);
    {
        tab();
        lineAdd(`type: "${configValueBase.type}",`);
        lineAdd(`definedAtData: ${JSON.stringify(configValueBase.definedAtData)},`);
        lineAdd(`valueSerialized:`);
        if (!Array.isArray(valueData)) {
            serializeValueData(valueData);
        }
        else {
            lineAppend(' [');
            valueData.forEach(serializeValueData);
            lineAppend(` ],`);
        }
        untab();
    }
    lineAdd('},');
    return;
    function serializeValueData(valueData) {
        lineAppend(` {`);
        tab();
        lineAdd(`type: "${valueData.type}",`);
        const valueProp = valueData.type !== 'plus-file' ? 'value' : 'exportValues';
        lineAdd(`${valueProp}: ${valueData.valueAsJsCode},`);
        untab();
        lineAdd(`},`);
    }
    function lineAppend(str) {
        const i = lines.length - 1;
        lines[i] = lines[i] += str;
    }
    function lineAdd(str) {
        lines.push(`${tabspace}${str}`);
    }
    function tab() {
        tabspace += '  ';
    }
    function untab() {
        tabspace = tabspace.slice(2);
    }
}
function getValueSerializedWithImport(configValueSource, importStatements, filesEnv, configName) {
    assert(!configValueSource.valueIsFilePath);
    const { valueIsDefinedByPlusValueFile, definedAt, configEnv } = configValueSource;
    assert(!definedAt.definedBy);
    const { filePathAbsoluteVite, fileExportName } = definedAt;
    if (valueIsDefinedByPlusValueFile)
        assert(fileExportName === undefined);
    const { importName } = addImportStatement(importStatements, filePathAbsoluteVite, fileExportName || '*', filesEnv, configEnv, configName);
    return {
        type: valueIsDefinedByPlusValueFile ? 'plus-file' : 'pointer-import',
        valueAsJsCode: importName,
    };
}
function getValueSerializedWithJson(value, configName, definedAtData, importStatements, filesEnv, configEnv) {
    const valueAsJsCode = valueToJson(value, configName, definedAtData, importStatements, filesEnv, configEnv);
    return {
        type: 'js-serialized',
        valueAsJsCode,
    };
}
function valueToJson(value, configName, definedAtData, importStatements, filesEnv, configEnv) {
    const valueName = `config${getPropAccessNotation(configName)}`;
    let configValueSerialized;
    try {
        configValueSerialized = stringify(value, {
            valueName,
            ...stringifyOptions,
            // Replace import strings with import variables.
            // - We don't need this anymore and could remove it.
            //   - We temporarily needed it for nested document configs (`config.document.{title,description,favicon}`), but we finally decided to go for flat document configs instead (`config.{title,description,favicon}`).
            //   - https://github.com/vikejs/vike-react/pull/113
            replacer(_, value) {
                if (typeof value === 'string') {
                    const importData = parsePointerImportData(value);
                    if (importData) {
                        const { importName } = addImportStatement(importStatements, importData.importPath, importData.exportName, filesEnv, configEnv, configName);
                        const replacement = [REPLACE_ME_BEFORE, importName, REPLACE_ME_AFTER].join('');
                        return { replacement };
                    }
                }
            },
        });
    }
    catch (err) {
        logJsonSerializeError(err, configName, definedAtData);
        assert(false);
    }
    configValueSerialized = configValueSerialized.replaceAll(`"${REPLACE_ME_BEFORE}`, '');
    configValueSerialized = configValueSerialized.replaceAll(`${REPLACE_ME_AFTER}"`, '');
    assert(!configValueSerialized.includes(REPLACE_ME_BEFORE));
    assert(!configValueSerialized.includes(REPLACE_ME_AFTER));
    return configValueSerialized;
}
function isJsonValue(value) {
    try {
        stringify(value, stringifyOptions);
    }
    catch (err) {
        return false;
    }
    return true;
}
function logJsonSerializeError(_err, configName, definedAtData) {
    /*
    // import { isJsonSerializerError } from '@brillout/json-serializer/stringify'
    let serializationErrMsg = ''
    if (isJsonSerializerError(_err)) {
      serializationErrMsg = _err.messageCore
    } else {
      // When a property getter throws an error
      console.error('Serialization error:')
      console.error(_err)
      serializationErrMsg = 'see serialization error printed above'
    }
    //*/
    const configValueFilePathToShowToUser = getConfigValueFilePathToShowToUser(definedAtData);
    assert(configValueFilePathToShowToUser);
    assertUsage(false, `${pc.cyan(configName)} defined by ${configValueFilePathToShowToUser} must be defined using a separate file ${pc.bold(`+${configName}.js`)}, see https://vike.dev/error/runtime-in-config`);
}
function getConfigValuesBase(pageConfig, runtimeEnv, isEager) {
    const fromComputed = Object.entries(pageConfig.configValuesComputed ?? {}).map(([configName, valueInfo]) => {
        const { configEnv, value } = valueInfo;
        if (!isRuntimeEnvMatch(configEnv, runtimeEnv))
            return 'SKIP';
        // AFAICT this should never happen: I ain't aware of a use case for overriding computed values. If there is a use case, then configValueSources has higher precedence.
        if (pageConfig.configValueSources[configName])
            return 'SKIP';
        const configValueBase = {
            type: 'computed',
            definedAtData: null,
        };
        return { configValueBase, value, configName, configEnv };
    });
    const fromSources = Object.entries(pageConfig.configValueSources).map(([configName]) => {
        const configDef = pageConfig.configDefinitions[configName];
        assert(configDef);
        if (isEager !== null && isEager !== !!configDef.eager)
            return 'SKIP';
        if (!configDef.cumulative) {
            const sourcesRelevant = getConfigValueSourcesRelevant(configName, runtimeEnv, pageConfig);
            const source = sourcesRelevant[0];
            if (!source)
                return 'SKIP';
            assert(sourcesRelevant.length === 1);
            const definedAtFile = getDefinedAtFileSource(source);
            const configValueBase = {
                type: 'standard',
                definedAtData: definedAtFile,
            };
            return { configValueBase, sourceRelevant: source, configName };
        }
        else {
            const sourcesRelevant = getConfigValueSourcesRelevant(configName, runtimeEnv, pageConfig);
            if (sourcesRelevant.length === 0)
                return 'SKIP';
            const definedAtData = [];
            sourcesRelevant.forEach((source) => {
                const definedAtFile = getDefinedAtFileSource(source);
                definedAtData.push(definedAtFile);
            });
            const configValueBase = {
                type: 'cumulative',
                definedAtData,
            };
            return { configValueBase, sourcesRelevant, configName };
        }
    });
    return [...fromComputed, ...fromSources].filter((r) => r !== 'SKIP');
}
function getDefinedAtFileSource(source) {
    const { definedAt } = source;
    if (definedAt.definedBy)
        return definedAt;
    const definedAtFile = {
        filePathToShowToUser: definedAt.filePathToShowToUser,
        fileExportPathToShowToUser: definedAt.fileExportPathToShowToUser,
    };
    return definedAtFile;
}
/*
 * Naming:
 *   `import { someExport as someImport } from './some-file'`
 * <=>
 *   `{`
 *      `importPath: './some-file',`
 *      `exportName: 'someExport',`
 *      `importName: 'someImport',`
 *    `}`
 */
function addImportStatement(importStatements, importPath, exportName, filesEnv, configEnv, configName) {
    const importCounter = importStatements.length + 1;
    const importName = `import${importCounter}`;
    const importLiteral = (() => {
        if (exportName === '*') {
            return `* as ${importName}`;
        }
        if (exportName === 'default') {
            return importName;
        }
        return `{ ${exportName} as ${importName} }`;
    })();
    const importStatement = `import ${importLiteral} from '${importPath}';`;
    importStatements.push(importStatement);
    assertFileEnv(importPath, configEnv, configName, filesEnv);
    return { importName };
}
function assertFileEnv(importPath, configEnv, configName, filesEnv) {
    assert(!isImportPathRelative(importPath));
    const key = importPath;
    assert(key);
    assertPosixPath(key);
    if (!filesEnv.has(key)) {
        filesEnv.set(key, []);
    }
    const fileEnvs = filesEnv.get(key);
    const fileEnvNew = { configEnv, configName };
    fileEnvs.push(fileEnvNew);
    const fileEnvDiff = fileEnvs.filter((c) => !deepEqual(c.configEnv, configEnv))[0];
    if (fileEnvDiff) {
        assertUsage(false, [
            `${importPath} defines the value of configs living in different environments:`,
            ...[fileEnvDiff, fileEnvNew].map((c) => `  - config ${pc.code(c.configName)} which value lives in environment ${pc.code(JSON.stringify(c.configEnv))}`),
            'Defining config values in the same file is allowed only if they live in the same environment, see https://vike.dev/config#pointer-imports',
        ].join('\n'));
    }
}
