"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonLexer = void 0;
/* eslint-disable max-len -- Long regex patterns */
const token_1 = require("./token");
const identifier_1 = require("./identifier");
const error_1 = require("./error");
class JsonLexer {
    constructor(source) {
        this.current = null;
        this.remaining = source;
    }
    static tokenize(source) {
        return [...new JsonLexer(source)];
    }
    isEof() {
        return this.current?.type === token_1.JsonTokenType.EOF;
    }
    [Symbol.iterator]() {
        return {
            next: () => (this.isEof()
                ? {
                    done: true,
                    value: undefined,
                }
                : {
                    done: false,
                    value: this.next(),
                }),
        };
    }
    skipInsignificant() {
        return this.skip(token_1.JsonTokenType.WHITESPACE, token_1.JsonTokenType.NEWLINE, token_1.JsonTokenType.LINE_COMMENT, token_1.JsonTokenType.BLOCK_COMMENT);
    }
    skip(...types) {
        const tokens = [];
        while (!this.isEof() && this.matches(...types)) {
            tokens.push(this.peek());
            this.next();
        }
        return tokens;
    }
    expect(type, ...other) {
        const token = this.peek();
        const types = [type, ...other];
        if (!JsonLexer.isTokenType(token, types)) {
            const { line, column } = token.location.start;
            const expectedTypes = types.length === 1
                ? types[0]
                : `either ${types.slice(0, -1).join(', ')} or ${types[types.length - 1]}`;
            throw new error_1.JsonParseError(`Expected ${expectedTypes}, but got ${token.type} at ${line}:${column}.`, token.location);
        }
        return token;
    }
    consume(type, ...types) {
        const token = this.expect(type, ...types);
        if (!this.isEof()) {
            this.next();
        }
        return token;
    }
    matches(...types) {
        return JsonLexer.isTokenType(this.peek(), types);
    }
    peek() {
        if (this.current === null) {
            throw new Error('No token has been consumed yet.');
        }
        return this.current;
    }
    next() {
        if (this.isEof()) {
            throw new Error('The end of the input has been reached.');
        }
        if (this.remaining === '') {
            this.current = this.createToken(token_1.JsonTokenType.EOF, '');
        }
        else {
            this.current = this.match();
            this.remaining = this.remaining.slice(this.current.value.length);
        }
        return this.current;
    }
    match() {
        for (const { type, pattern } of JsonLexer.PATTERNS) {
            if (typeof pattern === 'string') {
                if (this.remaining.startsWith(pattern)) {
                    return this.createToken(type, pattern);
                }
                continue;
            }
            const match = this.remaining.match(pattern);
            if (match !== null) {
                return this.createToken(type, match[0]);
            }
        }
        const start = {
            index: this.current?.location.end.index ?? 0,
            line: this.current?.location.end.line ?? 1,
            column: this.current?.location.end.column ?? 1,
        };
        const end = {
            index: start.index + 1,
            line: start.line,
            column: start.column + 1,
        };
        const char = this.remaining[0];
        throw new error_1.JsonParseError(`Unexpected token '${char}' at ${start.line}:${start.column}.`, {
            start: start,
            end: end,
        });
    }
    createToken(type, value) {
        const start = {
            index: this.current?.location.end.index ?? 0,
            line: this.current?.location.end.line ?? 1,
            column: this.current?.location.end.column ?? 1,
        };
        const end = {
            index: start.index,
            line: start.line,
            column: start.column,
        };
        end.index += [...value].length;
        for (const char of value) {
            if (char === '\n') {
                end.line++;
                end.column = 1;
            }
            else {
                end.column++;
            }
        }
        return {
            type: type,
            value: value,
            location: {
                start: start,
                end: end,
            },
        };
    }
    static isTokenType(token, types) {
        return types.length === 0 || types.includes(token.type);
    }
}
exports.JsonLexer = JsonLexer;
// Sorted by precedence
JsonLexer.PATTERNS = [
    {
        type: token_1.JsonTokenType.BRACE_LEFT,
        pattern: '{',
    },
    {
        type: token_1.JsonTokenType.BRACE_RIGHT,
        pattern: '}',
    },
    {
        type: token_1.JsonTokenType.BRACKET_LEFT,
        pattern: '[',
    },
    {
        type: token_1.JsonTokenType.BRACKET_RIGHT,
        pattern: ']',
    },
    {
        type: token_1.JsonTokenType.COLON,
        pattern: ':',
    },
    {
        type: token_1.JsonTokenType.COMMA,
        pattern: ',',
    },
    {
        type: token_1.JsonTokenType.LINE_COMMENT,
        pattern: /^\/\/.*/,
    },
    {
        type: token_1.JsonTokenType.BLOCK_COMMENT,
        pattern: /^\/\*[\s\S]*?\*\//,
    },
    {
        type: token_1.JsonTokenType.STRING,
        pattern: /^"(?:[^"\r\n\u2028\u2029\\]|\\(?:.|\r\n|\r|\n|\u2028|\u2029))*"/u,
    },
    {
        type: token_1.JsonTokenType.STRING,
        pattern: /^'(?:[^'\r\n\u2028\u2029\\]|\\(?:.|\r\n|\r|\n|\u2028|\u2029))*'/u,
    },
    {
        type: token_1.JsonTokenType.NEWLINE,
        pattern: /^(\r?\n)/,
    },
    {
        type: token_1.JsonTokenType.WHITESPACE,
        pattern: /^[ \r\t\v\f\u00A0\u2028\u2029\uFEFF\u1680\u2000-\u200A\u202F\u205F\u3000]+/,
    },
    {
        type: token_1.JsonTokenType.NUMBER,
        pattern: /^[-+]?((?:NaN|Infinity)(?![$_\u200C\u200D\p{ID_Continue}])|0[xX][\da-fA-F]+|(?:(?:0|[1-9]\d*)(?:\.\d*)?|\.\d*)(?:[eE][+-]?\d+)?)/u,
    },
    {
        type: token_1.JsonTokenType.NULL,
        pattern: /^null(?![$_\u200C\u200D\p{ID_Continue}])/u,
    },
    {
        type: token_1.JsonTokenType.BOOLEAN,
        pattern: /^(true|false)(?![$_\u200C\u200D\p{ID_Continue}])/u,
    },
    {
        type: token_1.JsonTokenType.IDENTIFIER,
        pattern: new RegExp(`^${identifier_1.identifierRegex.source}`, identifier_1.identifierRegex.flags),
    },
];
