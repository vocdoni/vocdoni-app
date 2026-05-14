"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonIdentifierNode = void 0;
const valueNode_1 = require("./valueNode");
const manipulator_1 = require("../manipulator");
const tokenNode_1 = require("./tokenNode");
const token_1 = require("../token");
const factory_1 = require("./factory");
const identifier_1 = require("../identifier");
const error_1 = require("../error");
class JsonIdentifierNode extends valueNode_1.JsonValueNode {
    constructor(definition) {
        super(definition);
        this.token = definition.token;
    }
    static of(name) {
        if (!(0, identifier_1.isIdentifier)(name)) {
            throw new error_1.JsonError(`Invalid identifier '${name}'.`);
        }
        return new JsonIdentifierNode({
            token: new tokenNode_1.JsonTokenNode({
                type: token_1.JsonTokenType.IDENTIFIER,
                value: name,
            }),
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
    rebuild() {
        new manipulator_1.NodeManipulator(this.children).node(this.token).end();
    }
    clone() {
        const tokenClone = this.token.clone();
        return new JsonIdentifierNode({
            token: tokenClone,
            children: this.children.map(child => (child === this.token ? tokenClone : child)),
            location: this.location,
        });
    }
    isEquivalent(other) {
        return other instanceof JsonIdentifierNode
            && this.token.equals(other.token);
    }
    toJSON() {
        return this.token.value;
    }
}
exports.JsonIdentifierNode = JsonIdentifierNode;
