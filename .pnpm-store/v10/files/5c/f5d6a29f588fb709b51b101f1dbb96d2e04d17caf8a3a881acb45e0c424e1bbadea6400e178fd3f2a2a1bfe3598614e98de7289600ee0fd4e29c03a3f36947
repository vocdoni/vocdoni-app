"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonStructureNode = exports.StructureDelimiter = void 0;
const valueNode_1 = require("./valueNode");
const token_1 = require("../token");
const tokenNode_1 = require("./tokenNode");
const manipulator_1 = require("../manipulator");
const compositeNode_1 = require("./compositeNode");
const propertyNode_1 = require("./propertyNode");
var COMMENT = manipulator_1.NodeMatcher.COMMENT;
var WHITESPACE = manipulator_1.NodeMatcher.WHITESPACE;
var NEWLINE = manipulator_1.NodeMatcher.NEWLINE;
var SPACE = manipulator_1.NodeMatcher.SPACE;
var INSIGNIFICANT = manipulator_1.NodeMatcher.INSIGNIFICANT;
var StructureDelimiter;
(function (StructureDelimiter) {
    StructureDelimiter["OBJECT"] = "object";
    StructureDelimiter["ARRAY"] = "array";
})(StructureDelimiter || (exports.StructureDelimiter = StructureDelimiter = {}));
(function (StructureDelimiter) {
    const definitions = {
        [StructureDelimiter.OBJECT]: {
            start: {
                type: token_1.JsonTokenType.BRACE_LEFT,
                value: '{',
            },
            end: {
                type: token_1.JsonTokenType.BRACE_RIGHT,
                value: '}',
            },
        },
        [StructureDelimiter.ARRAY]: {
            start: {
                type: token_1.JsonTokenType.BRACKET_LEFT,
                value: '[',
            },
            end: {
                type: token_1.JsonTokenType.BRACKET_RIGHT,
                value: ']',
            },
        },
    };
    function isStartToken(token) {
        return Object.values(definitions).some(({ start }) => start.type === token.type);
    }
    StructureDelimiter.isStartToken = isStartToken;
    function isEndToken(token) {
        return Object.values(definitions).some(({ end }) => end.type === token.type);
    }
    StructureDelimiter.isEndToken = isEndToken;
    function getStartToken(delimiter) {
        return new tokenNode_1.JsonTokenNode(definitions[delimiter].start);
    }
    StructureDelimiter.getStartToken = getStartToken;
    function getEndToken(delimiter) {
        return new tokenNode_1.JsonTokenNode(definitions[delimiter].end);
    }
    StructureDelimiter.getEndToken = getEndToken;
})(StructureDelimiter || (exports.StructureDelimiter = StructureDelimiter = {}));
class JsonStructureNode extends valueNode_1.JsonValueNode {
    reset() {
        for (const item of this.getList()) {
            item.reset();
        }
        this.children.length = 0;
    }
    rebuild(formatting = {}) {
        const parentFormatting = this.detectFormatting(formatting);
        let childFormatting = parentFormatting;
        const children = [...this.children];
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            if (child instanceof JsonStructureNode) {
                // Extract the formatting from the last child
                childFormatting = {
                    ...child.detectFormatting(childFormatting),
                    indentationLevel: childFormatting.indentationLevel,
                };
                continue;
            }
            if (child instanceof compositeNode_1.JsonCompositeNode && this.children.includes(child)) {
                // If the direct child is a composite node, traverse it
                children.splice(index + 1, 0, ...child.children);
            }
        }
        for (const item of this.getList()) {
            item.rebuild(childFormatting);
        }
        this.rebuildChildren(parentFormatting);
    }
    rebuildChildren(formatting) {
        const manipulator = new manipulator_1.NodeManipulator(this.children);
        const delimiter = this.getDelimiter();
        const startToken = StructureDelimiter.getStartToken(delimiter);
        const endToken = StructureDelimiter.getEndToken(delimiter);
        manipulator.token(startToken);
        const list = this.getList();
        const count = list.length;
        const { indentationLevel = 0 } = formatting;
        const { indentationSize = 0, commaSpacing = false, entryIndentation = false, leadingIndentation: blockLeadingIndentation = false, trailingIndentation: blockTrailingIndentation = false, trailingComma = false, } = formatting[delimiter] ?? {};
        let previousMatched = false;
        for (let index = 0; index < count; index++) {
            const item = list[index];
            const leadingIndentation = (index !== 0 && entryIndentation) || (index === 0 && blockLeadingIndentation);
            if (JsonStructureNode.matchesInsertion(manipulator, list, index)) {
                if (leadingIndentation) {
                    this.indent(manipulator, formatting);
                }
                manipulator.insert(item);
                previousMatched = false;
            }
            else if (JsonStructureNode.matchesRemoval(manipulator, list, index)) {
                manipulator.dropUntil(item.isEquivalent.bind(item));
                manipulator.node(item);
                previousMatched = true;
            }
            else {
                const currentMatched = manipulator.matches(item);
                if (!currentMatched) {
                    JsonStructureNode.skipComments(manipulator);
                }
                if (leadingIndentation) {
                    if (indentationSize > 0 && manipulator.matchesNext(node => endToken.isEquivalent(node))) {
                        // If the following token is the end token, always indent.
                        // This ensures it won't consume the indentation of the end delimiter.
                        manipulator.node(this.getNewlineToken(formatting));
                        if (manipulator.matchesToken(token_1.JsonTokenType.WHITESPACE)
                            && manipulator.matchesNext(manipulator_1.NodeMatcher.NEWLINE, manipulator_1.NodeMatcher.WHITESPACE)) {
                            manipulator.remove();
                        }
                        manipulator.token(this.getIndentationToken(formatting));
                    }
                    else {
                        this.indent(manipulator, formatting, previousMatched && currentMatched);
                    }
                }
                previousMatched = currentMatched;
                if (manipulator.matchesPreviousToken(token_1.JsonTokenType.LINE_COMMENT)) {
                    manipulator.insert(this.getNewlineToken(formatting));
                }
                else if (manipulator.position > 1
                    && !currentMatched
                    && manipulator.matchesPreviousToken(token_1.JsonTokenType.BLOCK_COMMENT)
                    && !manipulator.matchesToken(token_1.JsonTokenType.WHITESPACE)) {
                    manipulator.previous();
                    const trailingSpace = manipulator.matchesPreviousToken(token_1.JsonTokenType.WHITESPACE);
                    manipulator.next();
                    if (trailingSpace) {
                        manipulator.token(new tokenNode_1.JsonTokenNode({
                            type: token_1.JsonTokenType.WHITESPACE,
                            value: ' ',
                        }));
                    }
                }
                manipulator.node(item);
            }
            if (index < count - 1 || trailingComma) {
                manipulator.node(new tokenNode_1.JsonTokenNode({
                    type: token_1.JsonTokenType.COMMA,
                    value: ',',
                }));
            }
            if (index === count - 1) {
                if (blockTrailingIndentation) {
                    this.indent(manipulator, {
                        ...formatting,
                        indentationLevel: indentationLevel - 1,
                    });
                }
            }
            else if (((indentationSize === 0 || !entryIndentation) && commaSpacing)
                && (!manipulator.matchesNext(manipulator_1.NodeMatcher.SPACE)
                    || manipulator.matchesNext(node => endToken.isEquivalent(node), manipulator_1.NodeMatcher.SPACE))) {
                manipulator.token(new tokenNode_1.JsonTokenNode({
                    type: token_1.JsonTokenType.WHITESPACE,
                    value: ' ',
                }), manipulator.matchesNext(node => list[index + 1].isEquivalent(node), manipulator_1.NodeMatcher.SPACE));
            }
        }
        if (count === 0) {
            const index = manipulator.findNext(node => node.isEquivalent(endToken), manipulator_1.NodeMatcher.ANY);
            if (index >= 0) {
                manipulator.dropUntil(node => node.isEquivalent(endToken));
            }
        }
        manipulator.token(endToken);
        manipulator.end();
    }
    detectFormatting(parent = {}) {
        let blockStart = false;
        let lineStart = true;
        let inlineComma = false;
        let inlineColon = false;
        let levelComma = false;
        let lineIndentationSize = 0;
        let levelIndentationSize = 0;
        let leadingIndentation;
        let trailingIndentation;
        let trailingComma = false;
        let newLine = false;
        let immediatelyClosed = true;
        let empty = true;
        const formatting = {};
        const blockFormatting = {};
        const tokens = [...JsonStructureNode.iterate(this, this.getMaxDepth())];
        for (let index = 0; index < tokens.length; index++) {
            const { token, depth, parents } = tokens[index];
            switch (token.type) {
                case token_1.JsonTokenType.IDENTIFIER:
                    formatting.property = {
                        ...formatting.property,
                        unquoted: true,
                    };
                    break;
                case token_1.JsonTokenType.STRING: {
                    const grandParent = parents[parents.length - 2];
                    const quote = token.value.startsWith("'") ? 'single' : 'double';
                    if (grandParent instanceof propertyNode_1.JsonPropertyNode
                        && grandParent.key.equals(parents[parents.length - 1])) {
                        formatting.property = {
                            ...formatting.property,
                            quote: quote,
                        };
                    }
                    else {
                        formatting.string = {
                            ...formatting.string,
                            quote: quote,
                        };
                    }
                    break;
                }
            }
            if (depth === 0 && StructureDelimiter.isStartToken(token)) {
                blockStart = true;
            }
            else {
                const blockEnd = StructureDelimiter.isEndToken(token);
                if (depth === 0) {
                    if (blockEnd) {
                        trailingIndentation = lineStart;
                        trailingComma = levelComma;
                    }
                    if (blockStart) {
                        leadingIndentation = NEWLINE(token);
                        if (!WHITESPACE(token)) {
                            blockStart = false;
                        }
                    }
                }
                if (!blockEnd) {
                    // Use the last indentation size as the base
                    levelIndentationSize = lineIndentationSize;
                    immediatelyClosed = false;
                    if (!SPACE(token)) {
                        empty = false;
                    }
                }
            }
            if (WHITESPACE(token)) {
                if (token.value.includes('\t')) {
                    formatting.indentationCharacter = 'tab';
                }
                if (depth === 0 && lineStart) {
                    // ignore characters that are not spaces, like \r
                    lineIndentationSize = token.value.includes('\t')
                        ? token.value.replace(/[^\t]/g, '').length
                        : token.value.replace(/[^ ]/g, '').length;
                }
            }
            if (NEWLINE(token)) {
                formatting.lineEnding = token.value.includes('\r\n') ? 'crlf' : 'lf';
            }
            if (inlineComma && index > 0 && tokens[index - 1].depth === 0) {
                if (!NEWLINE(token)) {
                    blockFormatting.commaSpacing = WHITESPACE(token);
                }
                let entryIndentation = NEWLINE(token);
                for (let nextIndex = index; !entryIndentation && nextIndex < tokens.length; nextIndex++) {
                    const { token: nextToken, depth: nextDepth } = tokens[nextIndex];
                    if (nextDepth === 0) {
                        if (WHITESPACE(nextToken) || COMMENT(nextToken)) {
                            continue;
                        }
                        if (NEWLINE(nextToken)) {
                            entryIndentation = true;
                        }
                    }
                    break;
                }
                blockFormatting.entryIndentation = entryIndentation;
                inlineComma = false;
            }
            if (inlineColon) {
                blockFormatting.colonSpacing = WHITESPACE(token);
                inlineColon = false;
            }
            inlineColon = token.type === token_1.JsonTokenType.COLON || (inlineColon && WHITESPACE(token));
            inlineComma = token.type === token_1.JsonTokenType.COMMA || (inlineComma && WHITESPACE(token));
            levelComma = (depth === 0 && token.type === token_1.JsonTokenType.COMMA) || (levelComma && INSIGNIFICANT(token));
            lineStart = NEWLINE(token) || (lineStart && WHITESPACE(token));
            newLine = newLine || NEWLINE(token);
        }
        if (!immediatelyClosed) {
            if (!empty) {
                blockFormatting.indentationSize = 0;
                blockFormatting.trailingComma = trailingComma;
            }
            blockFormatting.leadingIndentation = leadingIndentation ?? false;
            blockFormatting.trailingIndentation = trailingIndentation ?? false;
        }
        const currentDepth = Math.max(parent.indentationLevel ?? 0, 0) + 1;
        if (levelIndentationSize > 0 && !empty) {
            const remainder = levelIndentationSize % currentDepth;
            blockFormatting.indentationSize = (levelIndentationSize - remainder) / currentDepth + remainder;
        }
        if (newLine) {
            if (blockFormatting.commaSpacing === undefined) {
                // If no spacing detected but indentation is present, default to spaced
                blockFormatting.commaSpacing = true;
            }
            if (blockFormatting.colonSpacing === undefined) {
                // If no spacing detected but indentation is present, default to spaced
                blockFormatting.colonSpacing = true;
            }
            if (blockFormatting.entryIndentation === undefined) {
                // If no indentation detected but indentation is present, default to indented
                blockFormatting.entryIndentation = true;
            }
        }
        formatting[this.getDelimiter()] = blockFormatting;
        formatting.indentationLevel = currentDepth;
        return {
            ...parent,
            ...formatting,
            object: {
                ...parent.array,
                ...formatting.array,
                ...parent.object,
                ...formatting.object,
            },
            array: {
                ...parent.object,
                ...formatting.object,
                ...parent.array,
                ...formatting.array,
            },
        };
    }
    indent(manipulator, formatting, optional = false) {
        const delimiter = this.getDelimiter();
        const { indentationSize = 0, leadingIndentation = false, trailingIndentation = false, } = formatting[delimiter] ?? {};
        if (indentationSize <= 0 && !leadingIndentation && !trailingIndentation) {
            return;
        }
        const newLine = this.getNewlineToken(formatting);
        manipulator.token(newLine, optional);
        if (manipulator.matchesToken(token_1.JsonTokenType.WHITESPACE)) {
            manipulator.next();
        }
        else {
            manipulator.token(this.getIndentationToken(formatting), optional);
        }
    }
    getIndentationToken(formatting) {
        const delimiter = this.getDelimiter();
        const { indentationLevel = 0 } = formatting;
        const { indentationSize = 0 } = formatting[delimiter] ?? {};
        const char = formatting.indentationCharacter === 'tab' ? '\t' : ' ';
        return new tokenNode_1.JsonTokenNode({
            type: token_1.JsonTokenType.WHITESPACE,
            value: char.repeat(indentationLevel * indentationSize),
        });
    }
    getNewlineToken(formatting) {
        return new tokenNode_1.JsonTokenNode({
            type: token_1.JsonTokenType.NEWLINE,
            value: formatting.lineEnding === 'crlf' ? '\r\n' : '\n',
        });
    }
    static *iterate(parent, maxDepth, parents = []) {
        for (const child of parent.children) {
            if (child instanceof tokenNode_1.JsonTokenNode) {
                yield {
                    depth: parents.length,
                    token: child,
                    parents: [...parents, parent],
                };
            }
            if (maxDepth > 0 && child instanceof compositeNode_1.JsonCompositeNode) {
                yield* JsonStructureNode.iterate(child, maxDepth - 1, [...parents, parent]);
            }
        }
    }
    static skipComments(manipulator) {
        while (manipulator.matchesNext(manipulator_1.NodeMatcher.COMMENT, manipulator_1.NodeMatcher.SPACE)) {
            manipulator.next();
        }
    }
    static matchesInsertion(manipulator, items, index) {
        const count = items.length;
        const currentNode = items[index];
        if (manipulator.matchesNext(currentNode.isEquivalent.bind(currentNode), manipulator_1.NodeMatcher.ANY)) {
            // if it's later in the list, it has been moved, not prepended
            return false;
        }
        for (let i = index + 1; i < count; i++) {
            if (manipulator.matches(items[i])) {
                // if any of the following nodes match, it has been prepended
                return true;
            }
        }
        return false;
    }
    static matchesRemoval(manipulator, items, index) {
        if (manipulator.matches(items[index])) {
            // if the current node matches, no previous nodes have been removed
            return false;
        }
        const nextItems = items.slice(index + 1);
        return manipulator.matchesNext(items[index].isEquivalent.bind(items[index]), 
        // if any of the following nodes match one of
        // the remaining items before the current one,
        // items have been swapped, not dropped
        item => nextItems.every(nextItem => !nextItem.isEquivalent(item)));
    }
}
exports.JsonStructureNode = JsonStructureNode;
