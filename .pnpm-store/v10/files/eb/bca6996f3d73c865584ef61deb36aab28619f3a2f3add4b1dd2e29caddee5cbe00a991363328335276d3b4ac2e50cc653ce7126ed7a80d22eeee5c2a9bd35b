export { getOutDirs };
export { resolveOutDir };
export { getOutDirsAllFromRootNormalized };
import pc from '@brillout/picocolors';
import { createDebug } from '../../../utils/debug.js';
import { pathJoin, toPosixPath } from '../../../utils/path.js';
import { assert, assertUsage } from '../../../utils/assert.js';
import { assertPosixPath } from '../../../utils/path.js';
import { isViteServerSide_viteEnvOptional } from './isViteServerSide.js';
import '../assertEnvVite.js';
const debug = createDebug('vike:outDir');
function getOutDirs(configGlobal, viteEnv) {
    debug('getOutDirs()', new Error().stack);
    const outDir = getOutDirFromResolvedConfig(configGlobal, viteEnv);
    assertOutDirResolved(outDir, configGlobal, viteEnv);
    const outDirs = getOutDirsAll(outDir, configGlobal.root);
    assertNormalization(outDirs.outDirRoot);
    assertNormalization(outDirs.outDirClient);
    assertNormalization(outDirs.outDirServer);
    return outDirs;
}
/** Appends `client/` or `server/` to `config.build.outDir` */
function resolveOutDir(config, isServerSide) {
    debug('resolveOutDir()');
    const outDir = getOutDirFromViteUserConfig(config) || 'dist';
    debug('outDir', outDir);
    const { outDirClient, outDirServer } = getOutDirsAll(outDir);
    if (isServerSide) {
        debug('outDirServer', 'outDirServer');
        return outDirServer;
    }
    else {
        debug('outDirClient', 'outDirClient');
        return outDirClient;
    }
}
function determineOutDirs(outDirRoot) {
    assertPosixPath(outDirRoot);
    assert(isOutDirRoot(outDirRoot));
    const outDirClient = pathJoin(outDirRoot, 'client');
    const outDirServer = pathJoin(outDirRoot, 'server');
    assertIsNotOutDirRoot(outDirClient);
    assertIsNotOutDirRoot(outDirServer);
    return { outDirClient, outDirServer };
}
function getOutDirsAll(outDir, root) {
    let outDirRoot;
    {
        if (isOutDirRoot(outDir)) {
            outDirRoot = outDir;
        }
        else {
            assert(outDir.endsWith('/server') || outDir.endsWith('/client'));
            assert('/client'.length === '/server'.length);
            outDirRoot = outDir.slice(0, -1 * '/client'.length);
        }
    }
    debug('outDirRoot', outDirRoot);
    let outDirs;
    if (root) {
        outDirs = getOutDirsAllFromRootNormalized(outDirRoot, root);
    }
    else {
        outDirs = getOutDirsAllFromRoot(outDirRoot);
    }
    debug('outDirs', outDirs);
    return outDirs;
}
function getOutDirsAllFromRoot(outDirRoot) {
    let { outDirClient, outDirServer } = determineOutDirs(outDirRoot);
    return { outDirRoot, outDirClient, outDirServer };
}
function getOutDirsAllFromRootNormalized(outDirRoot, root) {
    if (root && !outDirIsAbsolutePath(outDirRoot)) {
        assertPosixPath(outDirRoot);
        assertPosixPath(root);
        outDirRoot = pathJoin(root, outDirRoot);
    }
    let { outDirClient, outDirServer } = determineOutDirs(outDirRoot);
    if (!outDirRoot.endsWith('/'))
        outDirRoot = outDirRoot + '/';
    if (!outDirClient.endsWith('/'))
        outDirClient = outDirClient + '/';
    if (!outDirServer.endsWith('/'))
        outDirServer = outDirServer + '/';
    assertNormalization(outDirRoot);
    assertNormalization(outDirClient);
    assertNormalization(outDirServer);
    return { outDirRoot, outDirClient, outDirServer };
}
function assertNormalization(outDirAny) {
    assertPosixPath(outDirAny);
    assert(outDirIsAbsolutePath(outDirAny), outDirAny);
    assert(outDirAny.endsWith('/'), outDirAny);
    assert(!outDirAny.endsWith('//'), outDirAny);
}
function isOutDirRoot(outDirRot) {
    const p = outDirRot.split('/').filter(Boolean);
    const lastDir = p[p.length - 1];
    return lastDir !== 'client' && lastDir !== 'server';
}
function assertIsNotOutDirRoot(outDir) {
    assert(outDir.endsWith('/client') || outDir.endsWith('/server'));
}
/** Assert that `outDir` ends with the correct directory `/server` or `/client` */
function assertOutDirResolved(outDir, configGlobal, viteEnv) {
    assertPosixPath(outDir);
    if (isOutDirRoot(outDir))
        return;
    assert(outDir.endsWith('/client') || outDir.endsWith('/server')); // we normalized outDir
    assert('/client'.length === '/server'.length);
    const outDirCorrected = outDir.slice(0, -1 * '/client'.length);
    const wrongUsage = `You've set Vite's config.build.outDir to ${pc.cyan(outDir)} but you should set it to ${pc.cyan(outDirCorrected)} instead.`;
    const isServerSide = isViteServerSide_viteEnvOptional(configGlobal, viteEnv);
    if (isServerSide) {
        assertUsage(outDir.endsWith('/server'), wrongUsage);
    }
    else {
        assertUsage(outDir.endsWith('/client'), wrongUsage);
    }
}
function getOutDirFromViteUserConfig(config) {
    let outDir = config.build?.outDir;
    if (outDir === undefined)
        return undefined;
    outDir = normalizeOutDir(outDir);
    return outDir;
}
function getOutDirFromResolvedConfig(config, viteEnv) {
    let outDir = viteEnv?.config.build?.outDir ?? config.build.outDir;
    assert(outDir);
    outDir = normalizeOutDir(outDir);
    return outDir;
}
function normalizeOutDir(outDir) {
    outDir = toPosixPath(outDir);
    outDir = outDir.replace(/\/+$/, ''); // remove trailing slashes
    return outDir;
}
function outDirIsAbsolutePath(outDir) {
    // There doesn't seem to be a better alternative to determine whether `outDir` is an absolute path
    //  - Very unlikely that `outDir`'s first dir matches the filesystem's first dir
    //    - Although more likely to happen with Docker
    return getFirstDir(outDir) === getFirstDir(process.cwd());
}
function getFirstDir(p) {
    const firstDir = p.split(/\/|\\/).filter(Boolean)[0];
    return firstDir;
}
