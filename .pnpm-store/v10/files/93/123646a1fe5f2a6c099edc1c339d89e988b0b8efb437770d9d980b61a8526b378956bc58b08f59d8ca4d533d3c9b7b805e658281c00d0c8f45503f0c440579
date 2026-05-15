"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonPrimitiveNode = void 0;
const valueNode_1 = require("./valueNode");
const manipulator_1 = require("../manipulator");
const tokenNode_1 = require("./tokenNode");
const token_1 = require("../token");
const factory_1 = require("./factory");
class JsonPrimitiveNode extends valueNode_1.JsonValueNode {
    constructor(definition) {
        super(definition);
        this.token = definition.token;
        this.value = definition.value;
    }
    static of(value) {
        return factory_1.JsonValueFactory.create(value);
    }
    static ofHex(value) {
        return new JsonPrimitiveNode({
            token: new tokenNode_1.JsonTokenNode({
                type: token_1.JsonTokenType.NUMBER,
                value: `"0x${value.toString(16)}"`,
            }),
            value: value,
        });
    }
    update(other) {
        const node = factory_1.JsonValueFactory.create(other);
        if (!this.isEquivalent(node)) {
            return node;
        }
        return this;
    }
    reset() {
        this.children.length = 0;
    }
    rebuild(formatting) {
        const manipulator = new manipulator_1.NodeManipulator(this.children);
        // eslint-disable-next-line prefer-destructuring -- Type widening
        let token = this.token;
        if (token.isType(token_1.JsonTokenType.STRING) && manipulator.done()) {
            const quotes = formatting?.string?.quote;
            if (quotes === 'single') {
                let value = JSON.stringify(this.value)
                    .slice(1, -1)
                    // Unescape double quotes
                    .replace(/((?:^|[^\\])(?:\\\\)*)\\"/g, (_, preceding) => `${preceding}"`)
                    // Escape single quotes
                    .replace(/'/g, "\\'");
                value = `'${value}'`;
                token = new tokenNode_1.JsonTokenNode({
                    type: token_1.JsonTokenType.STRING,
                    value: value,
                });
            }
        }
        manipulator.node(token);
        manipulator.end();
    }
    clone() {
        const tokenClone = this.token.clone();
        return new JsonPrimitiveNode({
            token: tokenClone,
            value: this.value,
            children: this.children.map(child => (child === this.token ? tokenClone : child.clone())),
            location: this.location,
        });
    }
    isEquivalent(other) {
        return other instanceof JsonPrimitiveNode
            && this.token.equals(other.token)
            && this.value === other.value;
    }
    toJSON() {
        return this.value;
    }
}
exports.JsonPrimitiveNode = JsonPrimitiveNode;
const tokenTypes = {
    string: token_1.JsonTokenType.STRING,
    number: token_1.JsonTokenType.NUMBER,
    boolean: token_1.JsonTokenType.BOOLEAN,
    null: token_1.JsonTokenType.NULL,
};
factory_1.JsonValueFactory.register('primitive', value => new JsonPrimitiveNode({
    value: value,
    token: new tokenNode_1.JsonTokenNode({
        type: tokenTypes[value === null ? 'null' : typeof value],
        value: JSON.stringify(value),
    }),
}));
