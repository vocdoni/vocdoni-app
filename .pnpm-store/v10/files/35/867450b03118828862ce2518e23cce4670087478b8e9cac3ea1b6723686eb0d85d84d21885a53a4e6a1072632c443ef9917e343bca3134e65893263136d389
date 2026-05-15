"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManipulator = exports.NodeMatcher = void 0;
const token_1 = require("./token");
const node_1 = require("./node");
/**
 * @internal
 */
var NodeMatcher;
(function (NodeMatcher) {
    NodeMatcher.ANY = () => true;
    NodeMatcher.NONE = () => false;
    NodeMatcher.SIGNIFICANT = node => !NodeMatcher.INSIGNIFICANT(node);
    NodeMatcher.INSIGNIFICANT = node => NodeMatcher.SPACE(node) || NodeMatcher.COMMENT(node);
    NodeMatcher.SPACE = node => NodeMatcher.WHITESPACE(node) || NodeMatcher.NEWLINE(node);
    NodeMatcher.WHITESPACE = node => (node instanceof node_1.JsonTokenNode
        && node.type === token_1.JsonTokenType.WHITESPACE);
    NodeMatcher.NEWLINE = node => (node instanceof node_1.JsonTokenNode
        && node.type === token_1.JsonTokenType.NEWLINE);
    NodeMatcher.COMMENT = node => NodeMatcher.LINE_COMMENT(node) || NodeMatcher.BLOCK_COMMENT(node);
    NodeMatcher.LINE_COMMENT = node => (node instanceof node_1.JsonTokenNode
        && node.type === token_1.JsonTokenType.LINE_COMMENT);
    NodeMatcher.BLOCK_COMMENT = node => (node instanceof node_1.JsonTokenNode
        && node.type === token_1.JsonTokenType.BLOCK_COMMENT);
    NodeMatcher.PUNCTUATION = node => (node instanceof node_1.JsonTokenNode
        && [
            token_1.JsonTokenType.COLON,
            token_1.JsonTokenType.COMMA,
            token_1.JsonTokenType.BRACE_LEFT,
            token_1.JsonTokenType.BRACE_RIGHT,
            token_1.JsonTokenType.BRACKET_LEFT,
            token_1.JsonTokenType.BRACKET_RIGHT,
        ].includes(node.type));
})(NodeMatcher || (exports.NodeMatcher = NodeMatcher = {}));
class NodeManipulator {
    constructor(list) {
        /**
         * The current position of the iterator, zero-based.
         */
        this.index = 0;
        /**
         * Whether the list is currently in fixing mode.
         *
         * This flag is set to true after mismatches and set to false after matches.
         */
        this.fixing = false;
        this.list = list;
    }
    done() {
        return this.index >= this.list.length;
    }
    next() {
        if (this.done()) {
            throw new Error('The iterator is at the end of the list.');
        }
        this.index++;
    }
    get position() {
        return this.index;
    }
    seek(position) {
        if (position < 0 || position >= this.list.length) {
            throw new Error('The position is out of bounds.');
        }
        this.index = position;
    }
    previous() {
        if (this.index === 0) {
            throw new Error('The iterator is at the beginning of the list.');
        }
        this.index--;
    }
    get current() {
        if (this.done()) {
            throw new Error('The iterator is at the end of the list.');
        }
        return this.list[this.index];
    }
    get nodeList() {
        return this.list;
    }
    matchesPreviousToken(type) {
        if (this.index === 0) {
            return false;
        }
        const previous = this.list[this.index - 1];
        return previous instanceof node_1.JsonTokenNode && previous.type === type;
    }
    matches(node) {
        return this.findMatch([node]) >= 0;
    }
    matchesToken(type) {
        return this.matchesNext(current => current instanceof node_1.JsonTokenNode && current.type === type, NodeMatcher.NONE);
    }
    matchesNext(matcher, skipped) {
        return this.findNext(matcher, skipped) >= 0;
    }
    findNext(matcher, skipper = NodeMatcher.INSIGNIFICANT) {
        let matchIndex = -1;
        const previousPosition = this.index;
        while (!this.done()) {
            const { current } = this;
            if (matcher(current)) {
                matchIndex = this.index;
                break;
            }
            if (skipper(current)) {
                this.next();
                continue;
            }
            break;
        }
        this.index = previousPosition;
        return matchIndex;
    }
    token(token, $optional = false) {
        return this.nodes([token], $optional);
    }
    node(node, $optional = false) {
        return this.nodes([node], $optional);
    }
    nodes(nodes, optional = false) {
        const index = this.findMatch(nodes);
        if (index >= 0) {
            if (nodes.length === 1) {
                // If there's a single node, replace the matching node
                // with the given node
                this.seek(index);
                this.remove();
                this.insert(nodes[0]);
            }
            else {
                // Advance to the next node after the match
                this.seek(index + 1);
            }
            this.fixing = false;
        }
        else if (!optional) {
            this.fixing = true;
            this.accommodate(nodes[0]);
        }
        return this;
    }
    insert(node) {
        this.list.splice(this.index, 0, node);
        this.next();
        return this;
    }
    remove() {
        this.list.splice(this.index, 1);
        return this;
    }
    dropUntil(matcher) {
        let fixing = false;
        const startIndex = this.index;
        while (!this.done()) {
            const node = this.current;
            if (matcher(node)) {
                if (fixing) {
                    this.fixSpacing(startIndex);
                }
                return true;
            }
            if (!(node instanceof node_1.JsonTokenNode) || NodeMatcher.SIGNIFICANT(node)) {
                this.remove();
                fixing = true;
                continue;
            }
            if (!fixing || node.type === token_1.JsonTokenType.WHITESPACE) {
                this.next();
                continue;
            }
            this.fixSpacing(startIndex);
            fixing = false;
        }
        if (fixing) {
            this.fixSpacing(startIndex);
        }
        return false;
    }
    end() {
        this.dropUntil(NodeMatcher.NONE);
        if (!this.fixing) {
            // Preserve the trailing spaces the previous node matched
            return this;
        }
        while (this.index > 0) {
            this.previous();
            const node = this.current;
            if (NodeMatcher.INSIGNIFICANT(node)) {
                // Stop if the previous node is a space
                this.remove();
                continue;
            }
            this.next();
            break;
        }
        return this;
    }
    findMatch(nodes) {
        return this.findNext(current => nodes.some(node => current?.isEquivalent(node)), NodeMatcher.INSIGNIFICANT);
    }
    fixSpacing(startIndex) {
        const currentToken = this.done() ? null : this.current;
        let removalCount = 0;
        while (this.index > startIndex) {
            this.previous();
            const node = this.current;
            // Stop if the previous node is not a whitespace
            if (!NodeMatcher.WHITESPACE(node)) {
                this.next();
                break;
            }
            removalCount++;
        }
        const previousToken = this.list[this.index - 1] ?? null;
        if (currentToken !== null) {
            if ((previousToken === null && NodeMatcher.SPACE(currentToken))
                || (removalCount > 0
                    && (((NodeMatcher.BLOCK_COMMENT)(previousToken) && NodeMatcher.PUNCTUATION(currentToken))
                        || ((NodeMatcher.BLOCK_COMMENT)(currentToken) && NodeMatcher.PUNCTUATION(previousToken))))) {
                removalCount++;
            }
            else if (NodeMatcher.NEWLINE(previousToken) && NodeMatcher.NEWLINE(currentToken)) {
                removalCount++;
                this.previous();
            }
            else if (!NodeMatcher.NEWLINE(currentToken)) {
                removalCount--;
                this.next();
            }
        }
        while (removalCount-- > 0) {
            this.remove();
        }
    }
    accommodate(node) {
        if (NodeMatcher.INSIGNIFICANT(node)) {
            this.insert(node);
            return;
        }
        if (!this.done()) {
            const index = this.findNext(current => NodeManipulator.isReplacement(current, node));
            if (index >= 0) {
                this.seek(index);
                this.remove();
                this.fixing = false;
            }
        }
        this.insert(node);
    }
    static isReplacement(previousNode, currentNode) {
        if (currentNode instanceof node_1.JsonTokenNode || previousNode instanceof node_1.JsonTokenNode) {
            return previousNode.isEquivalent(currentNode);
        }
        if (currentNode instanceof node_1.JsonValueNode && previousNode instanceof node_1.JsonValueNode) {
            return true;
        }
        return previousNode.constructor === currentNode.constructor;
    }
}
exports.NodeManipulator = NodeManipulator;
