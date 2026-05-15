"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifierRegex = exports.reservedIdentifiers = void 0;
exports.isReserved = isReserved;
exports.isIdentifier = isIdentifier;
// https://262.ecma-international.org/14.0/#sec-keywords-and-reserved-words
// 14 is ES2023
exports.reservedIdentifiers = [
    // Keywords
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'null',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    // Future reserved keywords
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
];
exports.identifierRegex = /[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*/u;
const exactRegex = new RegExp(`^${exports.identifierRegex.source}$`, exports.identifierRegex.flags);
function isReserved(value) {
    return exports.reservedIdentifiers.includes(value);
}
function isIdentifier(value) {
    return exactRegex.test(value) && !isReserved(value);
}
