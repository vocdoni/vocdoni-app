export { getFilePathResolved };
export { getFilePathUnresolved };
export { getFilePathAbsoluteUserRootDir };
export { getFilePathToShowToUserUnknown };
export { getFilePathToShowToUserModule };
export { cleanFilePathUnknown };
export { assertModuleId };
import path from 'node:path';
import { assertFilePathAbsoluteFilesystem } from '../../../utils/isFilePathAbsoluteFilesystem.js';
import { assertImportIsNpmPackage } from '../../../utils/parseNpmPackage.js';
import { toPosixPath } from '../../../utils/path.js';
import { assert } from '../../../utils/assert.js';
import { assertPosixPath } from '../../../utils/path.js';
import '../assertEnvVite.js';
function getFilePathResolved(args) {
    const { userRootDir } = args;
    let filePathAbsoluteFilesystem;
    let filePathAbsoluteUserRootDir;
    if ('filePathAbsoluteFilesystem' in args) {
        filePathAbsoluteFilesystem = args.filePathAbsoluteFilesystem;
        filePathAbsoluteUserRootDir = getFilePathAbsoluteUserRootDir({ filePathAbsoluteFilesystem, userRootDir });
    }
    else {
        filePathAbsoluteUserRootDir = args.filePathAbsoluteUserRootDir;
        filePathAbsoluteFilesystem = getFilePathAbsoluteUserFilesystem({ filePathAbsoluteUserRootDir, userRootDir });
    }
    assert(filePathAbsoluteFilesystem);
    assertFilePathAbsoluteFilesystem(filePathAbsoluteFilesystem);
    const filePathToShowToUserResolved = filePathAbsoluteUserRootDir || filePathAbsoluteFilesystem;
    assert(filePathToShowToUserResolved);
    assertPosixPath(filePathAbsoluteFilesystem);
    const fileName = path.posix.basename(filePathAbsoluteFilesystem);
    const filePathResolved = {
        ...getComputedProps(args),
        filePathAbsoluteFilesystem,
        filePathToShowToUserResolved,
        fileName,
    };
    return filePathResolved;
}
function getComputedProps(args) {
    if ('filePathAbsoluteUserRootDir' in args) {
        const importPathAbsolute = args.importPathAbsolute ?? null;
        const { filePathAbsoluteUserRootDir } = args;
        if (importPathAbsolute)
            assertImportIsNpmPackage(importPathAbsolute);
        return {
            importPathAbsolute,
            filePathAbsoluteUserRootDir,
            filePathAbsoluteVite: filePathAbsoluteUserRootDir,
            filePathToShowToUser: filePathAbsoluteUserRootDir,
        };
    }
    else {
        return getComputedPropsImportPathAbsolute(args);
    }
}
function getComputedPropsImportPathAbsolute(args) {
    const { importPathAbsolute } = args;
    assertImportIsNpmPackage(importPathAbsolute);
    return {
        filePathAbsoluteUserRootDir: null,
        importPathAbsolute,
        filePathAbsoluteVite: importPathAbsolute,
        filePathToShowToUser: importPathAbsolute,
    };
}
function getFilePathUnresolved(args) {
    return {
        ...getComputedPropsImportPathAbsolute(args),
        filePathAbsoluteFilesystem: null,
    };
}
function getFilePathAbsoluteUserFilesystem({ filePathAbsoluteUserRootDir, userRootDir, }) {
    assertPosixPath(filePathAbsoluteUserRootDir);
    assertPosixPath(userRootDir);
    assertFilePathAbsoluteFilesystem(userRootDir);
    const filePathAbsoluteFilesystem = path.posix.join(userRootDir, filePathAbsoluteUserRootDir);
    assertFilePathAbsoluteFilesystem(userRootDir);
    return filePathAbsoluteFilesystem;
}
function getFilePathAbsoluteUserRootDir({ filePathAbsoluteFilesystem, userRootDir, }) {
    const { filePathAbsoluteUserRootDir } = getFilePathRelative({
        filePathAbsoluteFilesystem,
        userRootDir,
    });
    return filePathAbsoluteUserRootDir;
}
function getFilePathRelative({ filePathAbsoluteFilesystem, userRootDir, }) {
    assertPosixPath(filePathAbsoluteFilesystem);
    assertPosixPath(userRootDir);
    assertFilePathAbsoluteFilesystem(filePathAbsoluteFilesystem);
    assertFilePathAbsoluteFilesystem(userRootDir);
    const filePathRelativeUserRootDir = path.posix.relative(userRootDir, filePathAbsoluteFilesystem);
    if (!filePathAbsoluteFilesystem.startsWith(userRootDir)) {
        assert(filePathRelativeUserRootDir.startsWith('../'));
        return {
            filePathAbsoluteUserRootDir: null,
            filePathRelativeUserRootDir,
        };
    }
    else {
        assert(!filePathRelativeUserRootDir.startsWith('/') &&
            /* Not true if filePathRelative starts with a hidden directory  (i.e. a directory with a name that starts with `.`)
            !filePathRelative.startsWith('.') &&
            */
            !filePathRelativeUserRootDir.startsWith('./') &&
            !filePathRelativeUserRootDir.startsWith('../'));
        const filePathAbsoluteUserRootDir = `/${filePathRelativeUserRootDir}`;
        assert(filePathAbsoluteUserRootDir === getFilePathAbsoluteUserRootDir2(filePathAbsoluteFilesystem, userRootDir));
        return { filePathAbsoluteUserRootDir, filePathRelativeUserRootDir };
    }
}
function getFilePathToShowToUserModule(moduleId, config) {
    const { filePathAbsoluteUserRootDir, filePathAbsoluteFilesystem } = getFilePathModule(moduleId, config);
    return filePathAbsoluteUserRootDir || filePathAbsoluteFilesystem;
}
function getFilePathModule(moduleId, config) {
    const userRootDir = config.root;
    assertModuleId(moduleId);
    assertPosixPath(userRootDir);
    assertFilePathAbsoluteFilesystem(userRootDir);
    const filePathAbsoluteFilesystem = cleanModuleId(moduleId);
    assertFilePathAbsoluteFilesystem(filePathAbsoluteFilesystem);
    const { filePathAbsoluteUserRootDir, filePathRelativeUserRootDir } = getFilePathRelative({
        filePathAbsoluteFilesystem,
        userRootDir,
    });
    return { filePathAbsoluteFilesystem, filePathAbsoluteUserRootDir, filePathRelativeUserRootDir };
}
function assertModuleId(moduleId) {
    assertPosixPath(moduleId);
    assertFilePathAbsoluteFilesystem(moduleId); // Can moduleId be something else than the filesystem absolute path?
}
function getFilePathToShowToUserUnknown(
// We don't have any guarantee about filePath, e.g. about whether is filePathAbsoluteFilesystem or filePathAbsoluteUserRootDir
filePathUnknown, userRootDir) {
    assertPosixPath(userRootDir);
    assertFilePathAbsoluteFilesystem(userRootDir);
    filePathUnknown = cleanFilePathUnknown(filePathUnknown);
    if (!filePathUnknown.startsWith(userRootDir)) {
        return filePathUnknown;
    }
    else {
        return getFilePathAbsoluteUserRootDir2(filePathUnknown, userRootDir);
    }
}
function getFilePathAbsoluteUserRootDir2(filePathAbsoluteFilesystem, userRootDir) {
    assert(filePathAbsoluteFilesystem.startsWith(userRootDir));
    let filePathAbsoluteUserRootDir = filePathAbsoluteFilesystem.slice(userRootDir.length);
    if (!filePathAbsoluteUserRootDir.startsWith('/'))
        filePathAbsoluteUserRootDir = '/' + filePathAbsoluteUserRootDir;
    return filePathAbsoluteUserRootDir;
}
function cleanFilePathUnknown(filePathUnknown) {
    filePathUnknown = toPosixPath(filePathUnknown);
    filePathUnknown = cleanModuleId(filePathUnknown);
    return filePathUnknown;
}
function cleanModuleId(moduleId) {
    // remove query
    const parts = moduleId.split('?');
    if (parts.length > 1)
        parts.pop();
    assert(parts.length >= 1);
    return parts.join('?');
}
