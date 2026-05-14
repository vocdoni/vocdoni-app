import { readFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { walk as _walk } from '@nodelib/fs.walk';
import fg, {} from 'fast-glob';
import picomatch from 'picomatch';
import { GLOBAL_IGNORE_PATTERNS } from '../constants.js';
import { compact, partition } from './array.js';
import { debugLogObject } from './debug.js';
import { isDirectory, isFile } from './fs.js';
import { timerify } from './Performance.js';
import { parseAndConvertGitignorePatterns } from './parse-and-convert-gitignores.js';
import { dirname, join, relative, toPosix } from './path.js';
const walk = promisify(_walk);
const _picomatch = timerify(picomatch);
const cachedGitIgnores = new Map();
const cachedGlobIgnores = new Map();
const isGitRoot = (dir) => isDirectory(dir, '.git') || isFile(dir, '.git');
const getGitDir = (cwd) => {
    const dotGit = join(cwd, '.git');
    if (isDirectory(dotGit))
        return dotGit;
    if (isFile(dotGit)) {
        const content = readFileSync(dotGit, 'utf8').trim();
        const match = content.match(/^gitdir:\s*(.+)$/);
        if (match)
            return join(cwd, match[1]);
    }
    return undefined;
};
const findAncestorGitignoreFiles = (cwd) => {
    const gitignorePaths = [];
    if (isGitRoot(cwd))
        return gitignorePaths;
    let dir = dirname(cwd);
    let prev;
    while (dir) {
        const filePath = join(dir, '.gitignore');
        if (isFile(filePath))
            gitignorePaths.push(filePath);
        if (isGitRoot(dir))
            break;
        dir = dirname((prev = dir));
        if (prev === dir || dir === '.')
            break;
    }
    return gitignorePaths;
};
export const findAndParseGitignores = async (cwd) => {
    const init = ['.git', ...GLOBAL_IGNORE_PATTERNS];
    const ignores = new Set(init);
    const unignores = [];
    const gitignoreFiles = [];
    const pmOptions = { ignore: unignores };
    const matchers = new Set(init.map(pattern => _picomatch(pattern, pmOptions)));
    const matcher = (str) => {
        for (const isMatch of matchers) {
            const state = isMatch(str);
            if (state)
                return state;
        }
        return false;
    };
    const addFile = (filePath, baseDir) => {
        gitignoreFiles.push(relative(cwd, filePath));
        const dir = baseDir ?? dirname(toPosix(filePath));
        const base = relative(cwd, dir);
        const ancestor = base.startsWith('..') ? `${relative(dir, cwd)}/` : undefined;
        const ignoresForDir = new Set(base === '' ? init : []);
        const unignoresForDir = new Set();
        const patterns = readFileSync(filePath, 'utf8');
        for (const rule of parseAndConvertGitignorePatterns(patterns, ancestor)) {
            const [pattern, extraPattern] = rule.patterns;
            if (rule.negated) {
                if (base === '' || base.startsWith('..')) {
                    if (!unignores.includes(extraPattern)) {
                        unignores.push(...rule.patterns);
                        unignoresForDir.add(pattern);
                        unignoresForDir.add(extraPattern);
                    }
                }
                else {
                    if (!unignores.includes(extraPattern.startsWith('**/') ? extraPattern : `**/${extraPattern}`)) {
                        const unignore = join(base, pattern);
                        const extraUnignore = join(base, extraPattern);
                        unignores.push(unignore, extraUnignore);
                        unignoresForDir.add(unignore);
                        unignoresForDir.add(extraUnignore);
                    }
                }
            }
            else {
                if (base === '' || base.startsWith('..')) {
                    ignores.add(pattern);
                    ignores.add(extraPattern);
                    ignoresForDir.add(pattern);
                    ignoresForDir.add(extraPattern);
                }
                else if (!unignores.includes(extraPattern.startsWith('**/') ? extraPattern : `**/${extraPattern}`)) {
                    const ignore = join(base, pattern);
                    const extraIgnore = join(base, extraPattern);
                    ignores.add(ignore);
                    ignores.add(extraIgnore);
                    ignoresForDir.add(ignore);
                    ignoresForDir.add(extraIgnore);
                }
            }
        }
        const cacheDir = ancestor ? cwd : dir;
        const cacheForDir = cachedGitIgnores.get(cacheDir);
        if (cacheForDir) {
            for (const pattern of ignoresForDir)
                cacheForDir.ignores.add(pattern);
            for (const pattern of unignoresForDir)
                cacheForDir.unignores.add(pattern);
        }
        else {
            cachedGitIgnores.set(cacheDir, { ignores: ignoresForDir, unignores: unignoresForDir });
        }
        for (const pattern of ignoresForDir)
            matchers.add(_picomatch(pattern, pmOptions));
    };
    for (const filePath of findAncestorGitignoreFiles(cwd))
        addFile(filePath);
    const gitDir = getGitDir(cwd);
    if (gitDir) {
        const excludePath = join(gitDir, 'info/exclude');
        if (isFile(excludePath))
            addFile(excludePath, cwd);
    }
    const entryFilter = (entry) => {
        if (entry.dirent.isFile() && entry.name === '.gitignore') {
            addFile(entry.path);
            return true;
        }
        return false;
    };
    const deepFilter = (entry) => !matcher(relative(cwd, entry.path));
    await walk(cwd, {
        entryFilter: timerify(entryFilter),
        deepFilter: timerify(deepFilter),
    });
    debugLogObject('*', 'Parsed gitignore files', { gitignoreFiles });
    return { gitignoreFiles, ignores, unignores };
};
const _parseFindGitignores = timerify(findAndParseGitignores);
export async function glob(_patterns, options) {
    if (Array.isArray(_patterns) && _patterns.length === 0)
        return [];
    const hasCache = cachedGlobIgnores.has(options.dir);
    const willCache = !hasCache && options.gitignore && options.label;
    const cachedIgnores = options.gitignore ? cachedGlobIgnores.get(options.dir) : undefined;
    const _ignore = [];
    const [negatedPatterns, patterns] = partition(_patterns, pattern => pattern.startsWith('!'));
    if (options.gitignore) {
        if (willCache) {
            let dir = options.dir;
            let prev;
            while (dir) {
                const cacheForDir = cachedGitIgnores.get(dir);
                if (cacheForDir) {
                    _ignore.push(...cacheForDir.ignores);
                }
                dir = dirname((prev = dir));
                if (prev === dir || dir === '.')
                    break;
            }
        }
    }
    else {
        _ignore.push(...GLOBAL_IGNORE_PATTERNS);
    }
    if (willCache)
        cachedGlobIgnores.set(options.dir, compact(_ignore));
    const ignorePatterns = (cachedIgnores || _ignore).concat(negatedPatterns.map(pattern => pattern.slice(1)));
    const { dir, label, ...fgOptions } = { ...options, ignore: ignorePatterns };
    const paths = await fg.glob(patterns, fgOptions);
    debugLogObject(relative(options.cwd, dir), label ? `Finding ${label}` : 'Finding paths', () => ({
        patterns,
        ...fgOptions,
        ignore: hasCache && ignorePatterns.length === (cachedIgnores || _ignore).length
            ? `// using cache from previous glob cwd: ${fgOptions.cwd}`
            : ignorePatterns,
        paths,
    }));
    return paths;
}
export async function getGitIgnoredHandler(options) {
    cachedGitIgnores.clear();
    if (options.gitignore === false)
        return () => false;
    const { ignores, unignores } = await _parseFindGitignores(options.cwd);
    const matcher = _picomatch(Array.from(ignores), { ignore: unignores });
    const isGitIgnored = (filePath) => matcher(relative(options.cwd, filePath));
    return timerify(isGitIgnored);
}
