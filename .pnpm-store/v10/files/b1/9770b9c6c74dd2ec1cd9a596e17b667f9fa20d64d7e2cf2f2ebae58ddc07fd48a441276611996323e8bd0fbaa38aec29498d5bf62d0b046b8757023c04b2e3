"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonObjectNode = void 0;
const valueNode_1 = require("./valueNode");
const structureNode_1 = require("./structureNode");
const propertyNode_1 = require("./propertyNode");
const primitiveNode_1 = require("./primitiveNode");
const factory_1 = require("./factory");
const error_1 = require("../error");
const manipulator_1 = require("../manipulator");
const tokenNode_1 = require("./tokenNode");
const token_1 = require("../token");
var INSIGNIFICANT = manipulator_1.NodeMatcher.INSIGNIFICANT;
var NEWLINE = manipulator_1.NodeMatcher.NEWLINE;
var SIGNIFICANT = manipulator_1.NodeMatcher.SIGNIFICANT;
var SPACE = manipulator_1.NodeMatcher.SPACE;
class JsonObjectNode extends structureNode_1.JsonStructureNode {
    constructor(definition) {
        super(definition);
        this.propertyNodes = [...definition.properties];
    }
    static of(properties) {
        return new JsonObjectNode({
            properties: Object.entries(properties).map(([key, value]) => new propertyNode_1.JsonPropertyNode({
                key: primitiveNode_1.JsonPrimitiveNode.of(key),
                value: factory_1.JsonValueFactory.create(value),
            })),
        });
    }
    merge(source) {
        if (source.propertyNodes.length === 0) {
            return;
        }
        if (this.propertyNodes.length === 0) {
            this.propertyNodes.push(...source.propertyNodes.map(property => property.clone()));
            this.children.splice(0, this.children.length, ...source.children.map(child => child.clone()));
            return;
        }
        if (this.children.length === 0) {
            this.rebuild({ ...source.detectFormatting(), indentationLevel: 0 });
        }
        for (const property of source.propertyNodes) {
            const key = property.key.toJSON();
            const sourceRange = source.findPropertyRange(key);
            if (sourceRange === null) {
                this.set(property.key, property.value.clone());
                continue;
            }
            let sourceChildren = source.children.slice(sourceRange[0], sourceRange[1] + 1);
            const newProperty = property.clone();
            sourceChildren = sourceChildren.map(node => (node === property ? newProperty : node.clone()));
            const range = this.findPropertyRange(key);
            if (range === null) {
                this.propertyNodes.push(newProperty);
                this.insert(sourceChildren);
                continue;
            }
            const currentIndex = this.propertyNodes.findIndex(candidate => candidate.key.toJSON() === key);
            this.propertyNodes.splice(currentIndex, 1, newProperty);
            this.children.splice(range[0], range[1] - range[0] + 1, ...sourceChildren);
        }
    }
    insert(nodes) {
        let insertionIndex = this.children.length;
        for (let index = this.children.length - 1; index >= 0; index--) {
            const child = this.children[index];
            if (child instanceof tokenNode_1.JsonTokenNode) {
                if (child.isType(token_1.JsonTokenType.BRACE_RIGHT)) {
                    insertionIndex = index;
                    continue;
                }
                if (child.isType(token_1.JsonTokenType.COMMA)) {
                    insertionIndex = index + 1;
                    break;
                }
            }
            if (SIGNIFICANT(child)) {
                break;
            }
            if (NEWLINE(child)) {
                while (index > 0 && SPACE(this.children[index - 1])) {
                    index--;
                }
                insertionIndex = index;
                break;
            }
            insertionIndex = index;
        }
        let needsComma = false;
        for (let index = insertionIndex - 1; index >= 0; index--) {
            const child = this.children[index];
            if (child instanceof tokenNode_1.JsonTokenNode) {
                if (child.isType(token_1.JsonTokenType.COMMA)) {
                    needsComma = false;
                    break;
                }
            }
            if (SIGNIFICANT(child)) {
                needsComma = true;
                break;
            }
        }
        if (needsComma) {
            this.children.splice(insertionIndex, 0, new tokenNode_1.JsonTokenNode({
                type: token_1.JsonTokenType.COMMA,
                value: ',',
            }));
            insertionIndex++;
        }
        this.children.splice(insertionIndex, 0, ...nodes);
    }
    findPropertyRange(name) {
        let startIndex = this.children.findIndex(node => node instanceof propertyNode_1.JsonPropertyNode && node.key.toJSON() === name);
        if (startIndex === -1) {
            return null;
        }
        let endIndex = startIndex;
        for (let lookBehind = startIndex - 1; lookBehind >= 0; lookBehind--) {
            const child = this.children[lookBehind];
            if (!INSIGNIFICANT(child)) {
                break;
            }
            if (NEWLINE(child)) {
                startIndex = lookBehind;
            }
        }
        for (let lookAhead = endIndex + 1; lookAhead < this.children.length; lookAhead++) {
            const child = this.children[lookAhead];
            if (!(child instanceof tokenNode_1.JsonTokenNode) || (SIGNIFICANT(child) && !child.isType(token_1.JsonTokenType.COMMA))) {
                break;
            }
            if (NEWLINE(child)) {
                endIndex = lookAhead - 1;
                break;
            }
            endIndex = lookAhead;
        }
        return [startIndex, endIndex];
    }
    update(other) {
        if (!(other instanceof valueNode_1.JsonValueNode)) {
            if (typeof other !== 'object' || other === null || Array.isArray(other)) {
                return factory_1.JsonValueFactory.create(other);
            }
            for (const [key, value] of Object.entries(other)) {
                if (value === undefined) {
                    this.delete(key);
                    continue;
                }
                const property = this.propertyNodes.find(current => current.key.toJSON() === key);
                if (property !== undefined) {
                    property.value = property.value.update(value);
                    continue;
                }
                this.set(key, value);
            }
            for (const property of this.propertyNodes) {
                const key = property.key.toJSON();
                if (other[key] === undefined) {
                    this.delete(property.key.toJSON());
                }
            }
            return this;
        }
        if (!(other instanceof JsonObjectNode)) {
            return other;
        }
        for (const property of other.propertyNodes) {
            const index = this.propertyNodes.findIndex(current => current.key.toJSON() === property.key.toJSON());
            if (index >= 0) {
                const cloneProperty = this.propertyNodes[index].clone();
                cloneProperty.value = cloneProperty.value.update(property.value);
            }
            else {
                this.propertyNodes.push(property);
            }
        }
        for (const property of this.propertyNodes) {
            const key = property.key.toJSON();
            if (!other.has(key)) {
                this.delete(key);
            }
        }
        return this;
    }
    getList() {
        return [...this.propertyNodes];
    }
    getDelimiter() {
        return structureNode_1.StructureDelimiter.OBJECT;
    }
    getMaxDepth() {
        return 2;
    }
    has(name) {
        return this.propertyNodes.some(current => current.key.toJSON() === name);
    }
    get properties() {
        return [...this.propertyNodes];
    }
    set(name, value) {
        const normalizedName = typeof name === 'string' ? name : name.toJSON();
        const index = this.propertyNodes.findIndex(current => current.key.toJSON() === normalizedName);
        if (index >= 0) {
            this.propertyNodes[index].set(value);
            return;
        }
        this.propertyNodes.push(new propertyNode_1.JsonPropertyNode({
            key: typeof name === 'string' ? primitiveNode_1.JsonPrimitiveNode.of(name) : name,
            value: factory_1.JsonValueFactory.create(value),
        }));
    }
    delete(name) {
        for (let index = 0; index < this.propertyNodes.length; index++) {
            const property = this.propertyNodes[index];
            if (property.key.toJSON() === name) {
                this.propertyNodes.splice(index, 1);
                break;
            }
        }
    }
    get(name, type) {
        const property = this.propertyNodes.find(current => current.key.toJSON() === name);
        if (property === undefined) {
            throw new Error(`Property "${name}" does not exist.`);
        }
        const { value } = property;
        if (type !== undefined && !(value instanceof type)) {
            throw new error_1.JsonError(`Expected a value of type ${type.name}, but got ${value.constructor.name}`);
        }
        return value;
    }
    clone() {
        const clones = new Map();
        for (const property of this.propertyNodes) {
            clones.set(property, property.clone());
        }
        return new JsonObjectNode({
            properties: [...clones.values()],
            children: this.children.map(child => clones.get(child) ?? child.clone()),
            location: this.location,
        });
    }
    isEquivalent(other) {
        if (!(other instanceof JsonObjectNode)) {
            return false;
        }
        if (this.properties.length !== other.properties.length) {
            return false;
        }
        const entries = Object.fromEntries(other.properties.map(property => [property.key.toJSON(), property]));
        return this.properties.every(property => entries[property.key.toJSON()]?.isEquivalent(property) === true);
    }
    toJSON() {
        return Object.fromEntries(this.properties.map(property => [
            property.key.toJSON(),
            property.value.toJSON(),
        ]));
    }
}
exports.JsonObjectNode = JsonObjectNode;
factory_1.JsonValueFactory.register('object', object => new JsonObjectNode({
    properties: Object.entries(object).flatMap(([propertyName, propertyValue]) => (propertyValue === undefined
        ? []
        : [
            new propertyNode_1.JsonPropertyNode({
                key: primitiveNode_1.JsonPrimitiveNode.of(propertyName),
                value: factory_1.JsonValueFactory.create(propertyValue),
            }),
        ])),
}));
