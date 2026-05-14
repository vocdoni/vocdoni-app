export { transformPointerImports };
export { parsePointerImportData };
export { assertPointerImportPath };
// Playground: https://github.com/brillout/acorn-playground
// Notes about `with { type: 'pointer' }`
// - It works well with TypeScript: it doesn't complain upon `with { type: 'unknown-to-typescript' }` and go-to-definition & types are preserved: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-3.html#import-attributes
// - Babel already supports it: https://babeljs.io/docs/babel-parser#plugins => search for `importAttributes`
// - Acorn support for import attributes: https://github.com/acornjs/acorn/issues/983
//   - Acorn plugin: https://github.com/acornjs/acorn/issues/983
//   - Isn't stage 4 yet: https://github.com/tc39/proposal-import-attributes
// - Using a import path suffix such as `import { Layout } from './Layout?real` breaks TypeScript, and TypeScript isn't working on supporting query params: https://github.com/microsoft/TypeScript/issues/10988#issuecomment-867135453
// - Node.js >=21 supports import attributes: https://nodejs.org/api/esm.html#import-attributes
// - Esbuid supports
//   - Blocker: https://github.com/evanw/esbuild/issues/3646
//     - Ugly hack to make it work: https://github.com/brillout/esbuild-playground/tree/experiment/import-attribute
//   - Discussion with esbuild maintainer: https://github.com/evanw/esbuild/issues/3384
// - Using a magic comment `// @vike-real-import` is probably a bad idea:
//   - Esbuild removes comments: https://github.com/evanw/esbuild/issues/1439#issuecomment-877656182
//   - Using source maps to track these magic comments is brittle (source maps can easily break)
import { parseSync } from '@babel/core';
import { assert, assertUsage, assertWarning } from '../../../../utils/assert.js';
import { isFilePathAbsolute } from '../../../../utils/isFilePathAbsoluteFilesystem.js';
import { isImportPath } from '../../../../utils/isImportPath.js';
import { styleFileRE } from '../../../../utils/styleFileRE.js';
import pc from '@brillout/picocolors';
import { parseImportString, isImportString, serializeImportString } from '../importString.js';
import '../../assertEnvVite.js';
function transformPointerImports(code, filePathToShowToUser2, pointerImports, 
// For ./transformPointerImports.spec.ts
skipWarnings) {
    const spliceOperations = [];
    // Collect all const declarations to prepend at the top, so that they are
    // available before any code runs (import declarations are hoisted but const
    // is not, so we must place them at the top to avoid TDZ errors).
    const constDeclarations = [];
    // Performance trick
    if (!code.includes('import'))
        return null;
    const imports = getImports(code);
    if (imports.length === 0)
        return null;
    imports.forEach((node) => {
        if (node.type !== 'ImportDeclaration')
            return;
        const importPath = node.source.value;
        assert(typeof importPath === 'string');
        if (pointerImports !== 'all') {
            assert(importPath in pointerImports);
            const isPointerImport = pointerImports[importPath];
            assert(isPointerImport === true || isPointerImport === false);
            if (!isPointerImport)
                return;
        }
        const { start, end } = node;
        const importStatementCode = code.slice(start, end);
        /* Pointer import without importing any value => doesn't make sense and doesn't have any effect.
        ```js
        // Useless
        import './some.css'
        // Useless
        import './Layout.jsx'
        ``` */
        if (node.specifiers.length === 0) {
            const isWarning = !styleFileRE.test(importPath);
            let quote = indent(importStatementCode);
            if (isWarning) {
                quote = pc.cyan(quote);
            }
            else {
                quote = pc.bold(pc.red(quote));
            }
            const errMsg = [
                `The following import in ${filePathToShowToUser2} has no effect:`,
                quote,
                'See https://vike.dev/config#pointer-imports',
            ].join('\n');
            if (!skipWarnings) {
                if (!isWarning) {
                    assertUsage(false, errMsg);
                }
                assertWarning(false, errMsg, { onlyOnce: true });
            }
        }
        let constDeclaration = '';
        node.specifiers.forEach((specifier) => {
            assert(specifier.type === 'ImportSpecifier' ||
                specifier.type === 'ImportDefaultSpecifier' ||
                specifier.type === 'ImportNamespaceSpecifier');
            const importLocalName = specifier.local.name;
            const exportName = (() => {
                if (specifier.type === 'ImportDefaultSpecifier')
                    return 'default';
                if (specifier.type === 'ImportNamespaceSpecifier')
                    return '*';
                {
                    const imported = specifier.imported;
                    if (imported)
                        return imported.name;
                }
                return importLocalName;
            })();
            const importString = serializePointerImportData({ importPath, exportName, importStringWasGenerated: true });
            constDeclaration += `const ${importLocalName} = '${importString}';`;
        });
        if (constDeclaration)
            constDeclarations.push(constDeclaration);
        // Replace the import with blank lines to preserve source map line numbers.
        spliceOperations.push({
            start,
            end,
            replacement: '\n'.repeat(importStatementCode.split('\n').length - 1),
        });
    });
    if (constDeclarations.length === 0 && spliceOperations.length === 0)
        return null;
    const codeWithImportsRemoved = spliceMany(code, spliceOperations);
    if (constDeclarations.length === 0)
        return codeWithImportsRemoved;
    return constDeclarations.join('') + '\n' + codeWithImportsRemoved;
}
function getImports(code) {
    const result = parseSync(code, {
        sourceType: 'module',
    });
    assert(result);
    const { body } = result.program;
    const imports = [];
    body.forEach((node) => {
        if (node.type === 'ImportDeclaration')
            imports.push(node);
    });
    return imports;
}
const zeroWidthSpace = '\u200b';
function serializePointerImportData({ importPath, exportName, importStringWasGenerated, }) {
    const tag = importStringWasGenerated ? zeroWidthSpace : '';
    return `${tag}${serializeImportString({ importPath, exportName })}`;
}
function isPointerImportData(str) {
    return isImportString(str) || (str.startsWith(zeroWidthSpace) && isImportString(str.slice(1)));
}
function parsePointerImportData(importString) {
    if (!isPointerImportData(importString)) {
        return null;
    }
    let importStringWasGenerated = false;
    if (importString.startsWith(zeroWidthSpace)) {
        importStringWasGenerated = true;
        assert(zeroWidthSpace.length === 1);
        importString = importString.slice(1);
    }
    const parsed = parseImportString(importString, { legacy: !importStringWasGenerated });
    assert(parsed);
    const { importPath, exportName } = parsed;
    if (importPath.startsWith('.') && !(importPath.startsWith('./') || importPath.startsWith('../'))) {
        assert(!importStringWasGenerated);
        assertUsage(false, `Invalid relative import path ${pc.code(importPath)} defined by ${pc.code(JSON.stringify(importString))} because it should start with ${pc.code('./')} or ${pc.code('../')}, or use an npm package import instead.`);
    }
    assertPointerImportPath(importPath);
    return { importPath, exportName, importStringWasGenerated, importString };
}
// `importPath` is one of the following:
// - A relative import path
// - An npm package import
// - A filesystem absolute path, see transpileWithEsbuild()
function assertPointerImportPath(importPath) {
    return isImportPath(importPath) || isFilePathAbsolute(importPath);
}
function spliceMany(str, operations) {
    let strMod = '';
    let endPrev;
    operations.forEach(({ start, end, replacement }) => {
        if (endPrev !== undefined) {
            assert(endPrev < start);
        }
        else {
            endPrev = 0;
        }
        const replaced = str.slice(start, end);
        strMod +=
            str.slice(endPrev, start) +
                replacement +
                // Preserve number of lines for source map
                Array(replaced.split('\n').length - replacement.split('\n').length)
                    .fill('\n')
                    .join('');
        endPrev = end;
    });
    strMod += str.slice(endPrev, str.length);
    return strMod;
}
function indent(str) {
    return str
        .split('\n')
        .map((s) => `  ${s}`)
        .join('\n');
}
