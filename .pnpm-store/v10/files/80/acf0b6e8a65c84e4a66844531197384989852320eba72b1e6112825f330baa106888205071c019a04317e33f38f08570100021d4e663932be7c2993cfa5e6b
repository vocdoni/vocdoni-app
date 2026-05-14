export { getConfigDefinedAt };
export { getConfigDefinedAtOptional };
export { getDefinedAtString };
export { getDefinedByString };
import { assert } from '../../utils/assert.js';
import { checkType } from '../../utils/checkType.js';
import { isArray } from '../../utils/isArray.js';
import pc from '@brillout/picocolors';
import { getExportPath } from './getExportPath.js';
function getConfigDefinedAt(sentenceBegin, configName, definedAtData) {
    return `${begin(sentenceBegin, configName)} at ${getDefinedAtString(definedAtData, configName)}`;
}
function getConfigDefinedAtOptional(sentenceBegin, configName, definedAtData) {
    if (!definedAtData) {
        return `${begin(sentenceBegin, configName)} internally`;
    }
    else {
        return `${begin(sentenceBegin, configName)} at ${getDefinedAtString(definedAtData, configName)}`;
    }
}
function begin(sentenceBegin, configName) {
    return `${sentenceBegin} ${pc.cyan(configName)} defined`;
}
function getDefinedAtString(definedAtData, configName) {
    let files;
    if (isArray(definedAtData)) {
        files = definedAtData;
    }
    else {
        files = [definedAtData];
    }
    assert(files.length >= 1);
    const definedAtString = files
        .map((definedAt) => {
        if (definedAt.definedBy)
            return getDefinedByString(definedAt, configName);
        const { filePathToShowToUser, fileExportPathToShowToUser } = definedAt;
        const exportPath = getExportPath(fileExportPathToShowToUser, configName);
        if (exportPath) {
            return `${filePathToShowToUser} > ${pc.cyan(exportPath)}`;
        }
        else {
            return filePathToShowToUser;
        }
    })
        .join(' / ');
    return definedAtString;
}
function getDefinedByString(definedAt, configName) {
    if (definedAt.definedBy === 'api') {
        return `API call ${pc.cyan(`${definedAt.operation}({ vikeConfig: { ${configName} } })`)}`;
    }
    const { definedBy } = definedAt;
    if (definedBy === 'cli') {
        return `CLI option ${pc.cyan(`--${configName}`)}`;
    }
    if (definedBy === 'env') {
        return `environment variable ${pc.cyan(`VIKE_CONFIG="{${configName}}"`)}`;
    }
    checkType(definedBy);
    assert(false);
}
