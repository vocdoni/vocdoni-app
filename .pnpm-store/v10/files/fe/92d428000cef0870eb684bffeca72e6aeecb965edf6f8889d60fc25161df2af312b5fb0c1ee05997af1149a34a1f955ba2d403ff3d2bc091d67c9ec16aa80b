"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonParser = void 0;
const lexer_1 = require("./lexer");
const token_1 = require("./token");
const node_1 = require("./node");
const identifier_1 = require("./identifier");
const error_1 = require("./error");
class JsonParser {
    constructor(source) {
        this.lexer = new lexer_1.JsonLexer(source);
    }
    static parse(source, type) {
        const parser = new JsonParser(source);
        if (type !== undefined) {
            return parser.parseValue(type);
        }
        return parser.parseValue();
    }
    parseValue(type) {
        const node = this.parseRoot();
        if (type !== undefined && !(node instanceof type)) {
            throw new error_1.JsonError(`Expected ${type.name}, but got ${node.constructor.name}.`);
        }
        return node;
    }
    parseRoot() {
        this.lexer.next();
        const leadingTokens = this.lexer.skipInsignificant();
        const node = this.parseNext();
        const trailingTokens = this.lexer.skipInsignificant();
        node.children.unshift(...JsonParser.createChildren(leadingTokens));
        node.children.push(...JsonParser.createChildren(trailingTokens));
        if (!this.lexer.isEof()) {
            const token = this.lexer.peek();
            const position = token.location.start;
            throw new error_1.JsonParseError(`Unexpected token '${token.value}' at ${position.line}:${position.column}.`, token.location);
        }
        return node;
    }
    parseNext() {
        const token = this.lexer.peek();
        switch (token.type) {
            case token_1.JsonTokenType.BRACE_LEFT:
                return this.parseObject();
            case token_1.JsonTokenType.BRACKET_LEFT:
                return this.parseArray();
            case token_1.JsonTokenType.NUMBER:
                return this.parseNumber();
            case token_1.JsonTokenType.STRING:
                return this.parseString();
            case token_1.JsonTokenType.BOOLEAN:
                return this.parseBoolean();
            case token_1.JsonTokenType.NULL:
                return this.parseNull();
            default: {
                const position = token.location.start;
                throw new error_1.JsonParseError(`Unexpected token '${token.value}' at ${position.line}:${position.column}.`, token.location);
            }
        }
    }
    parseNumber() {
        const token = this.lexer.consume(token_1.JsonTokenType.NUMBER);
        const tokenNode = new node_1.JsonTokenNode(token);
        return new node_1.JsonPrimitiveNode({
            token: tokenNode,
            value: this.parseNumberValue(token),
            children: [tokenNode],
            location: token.location,
        });
    }
    parseNumberValue(token) {
        let { value } = token;
        let sign = 1;
        if (value.startsWith('+')) {
            value = value.slice(1);
        }
        else if (value.startsWith('-')) {
            sign = -1;
            value = value.slice(1);
        }
        if (value === 'Infinity') {
            return sign * Infinity;
        }
        if (value === 'NaN') {
            return NaN;
        }
        if (value.startsWith('.')) {
            value = `0${value}`;
        }
        else {
            value = value.replace(/\.(?!\d)/, '');
        }
        if (value.startsWith('0x') || value.startsWith('0X')) {
            return sign * Number.parseInt(value, 16);
        }
        return sign * JSON.parse(value);
    }
    parseString() {
        const token = this.lexer.consume(token_1.JsonTokenType.STRING);
        let { value } = token;
        if (value.startsWith("'")) {
            value = value.slice(1, -1)
                // Unescape single quotes and escape double quotes
                .replace(/((?:^|[^\\])(?:\\\\)*)\\(["'])/g, (_, preceding, quote) => `${preceding}${quote === '"' ? '\\"' : "'"}`);
            value = `"${value}"`;
        }
        value = value.replace(/\\(?:\r\n|\r|\n|\u2028|\u2029)/gu, '');
        const tokenNode = new node_1.JsonTokenNode(token);
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new error_1.JsonParseError(`Invalid string at ${token.location.start.line}:${token.location.start.column}: ${error.message}`, token.location);
            }
            throw error;
        }
        return new node_1.JsonPrimitiveNode({
            token: tokenNode,
            value: parsedValue,
            children: [tokenNode],
            location: token.location,
        });
    }
    parseNull() {
        const token = this.lexer.consume(token_1.JsonTokenType.NULL);
        const tokenNode = new node_1.JsonTokenNode(token);
        return new node_1.JsonPrimitiveNode({
            token: tokenNode,
            value: null,
            children: [tokenNode],
            location: token.location,
        });
    }
    parseBoolean() {
        const token = this.lexer.consume(token_1.JsonTokenType.BOOLEAN);
        const tokenNode = new node_1.JsonTokenNode(token);
        return new node_1.JsonPrimitiveNode({
            token: tokenNode,
            value: token.value === 'true',
            children: [tokenNode],
            location: token.location,
        });
    }
    parseArray() {
        const children = [
            this.lexer.consume(token_1.JsonTokenType.BRACKET_LEFT),
            ...this.lexer.skipInsignificant(),
        ];
        const elements = [];
        while (!this.lexer.matches(token_1.JsonTokenType.BRACKET_RIGHT)) {
            const element = this.parseNext();
            elements.push(element);
            children.push(element, ...this.lexer.skipInsignificant());
            if (!this.lexer.matches(token_1.JsonTokenType.BRACKET_RIGHT)) {
                children.push(this.lexer.consume(token_1.JsonTokenType.COMMA), ...this.lexer.skipInsignificant());
            }
        }
        children.push(this.lexer.consume(token_1.JsonTokenType.BRACKET_RIGHT));
        return new node_1.JsonArrayNode({
            elements: elements,
            children: JsonParser.createChildren(children),
            location: {
                start: children[0].location.start,
                end: children[children.length - 1].location.end,
            },
        });
    }
    parseObject() {
        const children = [
            this.lexer.consume(token_1.JsonTokenType.BRACE_LEFT),
            ...this.lexer.skipInsignificant(),
        ];
        const properties = [];
        while (!this.lexer.matches(token_1.JsonTokenType.BRACE_RIGHT)) {
            const property = this.parseObjectProperty();
            properties.push(property);
            children.push(property, ...this.lexer.skipInsignificant());
            if (!this.lexer.matches(token_1.JsonTokenType.BRACE_RIGHT)) {
                children.push(this.lexer.consume(token_1.JsonTokenType.COMMA), ...this.lexer.skipInsignificant());
            }
        }
        children.push(this.lexer.consume(token_1.JsonTokenType.BRACE_RIGHT));
        return new node_1.JsonObjectNode({
            properties: properties,
            children: JsonParser.createChildren(children),
            location: {
                start: children[0].location.start,
                end: children[children.length - 1].location.end,
            },
        });
    }
    parseObjectProperty() {
        const children = [];
        this.lexer.expect(token_1.JsonTokenType.STRING, token_1.JsonTokenType.IDENTIFIER);
        const key = this.lexer.matches(token_1.JsonTokenType.STRING)
            ? this.parseString()
            : this.parseIdentifier();
        children.push(key, ...this.lexer.skipInsignificant(), this.lexer.consume(token_1.JsonTokenType.COLON), ...this.lexer.skipInsignificant());
        const value = this.parseNext();
        children.push(value);
        return new node_1.JsonPropertyNode({
            key: key,
            value: value,
            children: JsonParser.createChildren(children),
            location: {
                start: children[0].location.start,
                end: children[children.length - 1].location.end,
            },
        });
    }
    parseIdentifier() {
        const token = this.lexer.consume(token_1.JsonTokenType.IDENTIFIER);
        if ((0, identifier_1.isReserved)(token.value)) {
            const location = token.location.start;
            throw new error_1.JsonParseError(`Reserved identifier '${token.value}' at ${location.line}:${location.column}.`, token.location);
        }
        const tokenNode = new node_1.JsonTokenNode(token);
        return new node_1.JsonIdentifierNode({
            token: tokenNode,
            children: [tokenNode],
            location: token.location,
        });
    }
    static createChildren(children) {
        return children.map(child => {
            if (child instanceof node_1.JsonNode) {
                return child;
            }
            return new node_1.JsonTokenNode(child);
        });
    }
}
exports.JsonParser = JsonParser;
