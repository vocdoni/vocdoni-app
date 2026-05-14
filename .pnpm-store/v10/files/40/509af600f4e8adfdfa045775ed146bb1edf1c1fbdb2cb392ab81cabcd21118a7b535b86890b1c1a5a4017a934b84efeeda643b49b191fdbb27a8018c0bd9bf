"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonPropertyNode = void 0;
const tokenNode_1 = require("./tokenNode");
const token_1 = require("../token");
const compositeNode_1 = require("./compositeNode");
const manipulator_1 = require("../manipulator");
const factory_1 = require("./factory");
const identifierNode_1 = require("./identifierNode");
const identifier_1 = require("../identifier");
const primitiveNode_1 = require("./primitiveNode");
class JsonPropertyNode extends compositeNode_1.JsonCompositeNode {
    constructor(definition) {
        super(definition);
        this.key = definition.key;
        this.value = definition.value;
    }
    reset() {
        this.key.reset();
        this.value.reset();
        this.children.length = 0;
    }
    set(value) {
        this.value = factory_1.JsonValueFactory.create(value);
    }
    rebuild(formatting) {
        this.value.rebuild(formatting);
        const quote = formatting?.property?.quote;
        const spaced = formatting?.object?.colonSpacing ?? false;
        const manipulator = new manipulator_1.NodeManipulator(this.children);
        let { key } = this;
        if (manipulator.matches(this.key)) {
            key.rebuild();
        }
        else {
            key = this.formatKey(formatting);
            key.rebuild({
                ...formatting,
                string: {
                    quote: quote === 'single' || quote === 'double'
                        ? quote
                        : formatting?.string?.quote,
                },
            });
        }
        manipulator.node(key);
        manipulator.token(new tokenNode_1.JsonTokenNode({
            type: token_1.JsonTokenType.COLON,
            value: ':',
        }));
        if (spaced) {
            manipulator.token(new tokenNode_1.JsonTokenNode({
                type: token_1.JsonTokenType.WHITESPACE,
                value: ' ',
            }), !manipulator.done());
        }
        manipulator.node(this.value)
            .end();
    }
    formatKey(formatting) {
        if (this.key instanceof primitiveNode_1.JsonPrimitiveNode
            && formatting?.property?.unquoted === true
            && (0, identifier_1.isIdentifier)(this.key.value)) {
            return identifierNode_1.JsonIdentifierNode.of(this.key.value);
        }
        return this.key;
    }
    clone() {
        const keyClone = this.key.clone();
        const valueClone = this.value.clone();
        return new JsonPropertyNode({
            key: keyClone,
            value: valueClone,
            children: this.children.map(child => {
                if (child === this.key) {
                    return keyClone;
                }
                if (child === this.value) {
                    return valueClone;
                }
                return child.clone();
            }),
            location: this.location,
        });
    }
    isEquivalent(other) {
        if (!(other instanceof JsonPropertyNode)) {
            return false;
        }
        return this.key.isEquivalent(other.key)
            && this.value.isEquivalent(other.value);
    }
}
exports.JsonPropertyNode = JsonPropertyNode;
