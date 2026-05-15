export { crawlOutDir };
import { assert, assertUsage, assertPosixPath, requireResolve, isWebpackResolve } from './utils.js';
import { import_ } from '@brillout/import';
import { usageHintRollupEntryNames } from '../shared/usageHints.js';
// Use Node.js to search for the file dist/server/entry.js which we use only as fallback if:
// - the server entry isn't injected (the setting `inject` is `false`), and
// - the auto importer doesn't work.
async function crawlOutDir({ outDir, tolerateDoesNotExist, outFileSearch, }) {
    let path;
    let fs;
    try {
        path = await import_('path');
        fs = await import_('fs');
    }
    catch {
        return false;
    }
    const cwd = process.cwd();
    const isPathAbsolute = (p) => {
        if (process.platform === 'win32') {
            return path.win32.isAbsolute(p);
        }
        else {
            return p.startsWith('/');
        }
    };
    if (outDir) {
        // Only pre-rendering has access to config.build.outDir
        assertPosixPath(outDir);
        assert(isPathAbsolute(outDir), outDir);
    }
    else {
        if (!cwd)
            return false;
        // The SSR server doesn't have access to config.build.outDir so the only option left is to shoot in the dark by trying with 'dist/'
        outDir = path.posix.join(cwd, 'dist');
    }
    const outDirServer = path.posix.join(outDir, 'server');
    const outDirServerExists = fs.existsSync(outDirServer);
    if (!outDirServerExists)
        return false;
    const outFileNameList = [];
    outFileSearch.forEach((outFileNameBase) => {
        outFileNameList.push(...[
            //
            `${outFileNameBase}.mjs`,
            `${outFileNameBase}.js`,
            `${outFileNameBase}.cjs`,
        ]);
    });
    let outFileFound;
    const getOutFilePath = (outFileName) => path.posix.join(outDirServer, outFileName);
    for (const outFileName of outFileNameList) {
        const outFilePath = getOutFilePath(outFileName);
        assert(isPathAbsolute(outFilePath));
        let outFilePathResolved;
        try {
            outFilePathResolved = await requireResolve(outFilePath, 
            // Since `outFilePath` is absolute, we can pass a wrong `currentFilePath` argument value.
            // - We avoid using `__filename` because it isn't defined when this file is included in an ESM bundle.
            // - We cannot use `import.meta.filename` (nor `import.meta.url`) because there doesn't seem to be a way to safely/conditionally access `import.meta`.
            cwd);
        }
        catch {
            continue;
        }
        assert(outFilePathResolved);
        outFileFound = {
            outFilePath: outFilePathResolved,
            outFileName,
        };
    }
    if (!outFileFound) {
        if (tolerateDoesNotExist) {
            return false;
        }
        else {
            assert(outDirServerExists);
            assertUsage(false, `The server production entry is missing. ${usageHintRollupEntryNames}. One of the following is expected to exist: \n${outFileNameList.map((outFileName) => `  ${getOutFilePath(outFileName)}`).join('\n')}`);
        }
    }
    assert(outFileSearch.some((outFileNameBase) => outFileFound.outFileName.startsWith(outFileNameBase)));
    // webpack couldn't have properly resolved `outFilePathFound` since there isn't any static import statement importing `outFilePathFound`
    if (isWebpackResolve(outFileFound.outFilePath, cwd)) {
        return false;
    }
    return outFileFound.outFilePath;
}
