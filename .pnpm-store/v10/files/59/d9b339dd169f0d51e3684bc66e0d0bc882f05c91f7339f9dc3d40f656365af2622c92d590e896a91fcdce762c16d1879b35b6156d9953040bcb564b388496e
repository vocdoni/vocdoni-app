import Astro from './astro.js';
import AstroMDX from './astro-mdx.js';
import MDX from './mdx.js';
import Prisma from './prisma.js';
import SCSS from './scss.js';
import Svelte from './svelte.js';
import CSS from './tailwind.js';
import Vue from './vue.js';
const isAsync = (fn) => (fn ? fn.constructor.name === 'AsyncFunction' : false);
const normalizeExt = (ext) => ext.replace(/^\.*/, '.');
export const partitionCompilers = (rawLocalConfig) => {
    const syncCompilers = {};
    const asyncCompilers = {};
    for (const extension in rawLocalConfig.compilers) {
        const ext = normalizeExt(extension);
        const compilerFn = rawLocalConfig.compilers[extension];
        if (typeof compilerFn === 'function') {
            if (!rawLocalConfig.asyncCompilers?.[ext] && isAsync(compilerFn)) {
                asyncCompilers[ext] = compilerFn;
            }
            else {
                syncCompilers[ext] = compilerFn;
            }
        }
        else if (compilerFn === true) {
            syncCompilers[ext] = true;
        }
    }
    for (const extension in rawLocalConfig.asyncCompilers) {
        const ext = normalizeExt(extension);
        asyncCompilers[ext] = rawLocalConfig.asyncCompilers[extension];
    }
    return { ...rawLocalConfig, syncCompilers, asyncCompilers };
};
const compilers = new Map([
    ['.astro', Astro],
    ['.css', CSS],
    ['.mdx', MDX],
    ['.prisma', Prisma],
    ['.sass', SCSS],
    ['.scss', SCSS],
    ['.svelte', Svelte],
    ['.vue', Vue],
]);
export const getIncludedCompilers = (syncCompilers, asyncCompilers, dependencies) => {
    const hasDependency = (packageName) => dependencies.has(packageName);
    for (const [extension, { condition, compiler }] of compilers) {
        if (extension === '.mdx' && AstroMDX.condition(hasDependency)) {
            syncCompilers.set(extension, AstroMDX.compiler);
        }
        else if ((!syncCompilers.has(extension) && condition(hasDependency)) || syncCompilers.get(extension) === true) {
            syncCompilers.set(extension, compiler);
        }
    }
    return [syncCompilers, asyncCompilers];
};
export const getCompilerExtensions = (compilers) => [
    ...compilers[0].keys(),
    ...compilers[1].keys(),
];
