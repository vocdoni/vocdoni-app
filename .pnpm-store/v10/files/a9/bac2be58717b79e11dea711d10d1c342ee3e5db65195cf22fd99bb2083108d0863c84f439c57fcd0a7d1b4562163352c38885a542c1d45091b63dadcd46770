"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonArrayNode = void 0;
const structureNode_1 = require("./structureNode");
const factory_1 = require("./factory");
const error_1 = require("../error");
class JsonArrayNode extends structureNode_1.JsonStructureNode {
    constructor(definition) {
        super(definition);
        this.elementNodes = [...definition.elements];
    }
    static of(...elements) {
        return new JsonArrayNode({ elements: elements.map(factory_1.JsonValueFactory.create) });
    }
    update(other) {
        if (!(other instanceof JsonArrayNode) && !Array.isArray(other)) {
            return factory_1.JsonValueFactory.create(other);
        }
        const otherElements = other instanceof JsonArrayNode ? other.elements : other;
        const elements = this.elementNodes.splice(0);
        for (let index = 0; index < otherElements.length; index++) {
            this.push(index < elements.length
                ? elements[index].update(otherElements[index])
                : otherElements[index]);
        }
        if (otherElements.length < elements.length) {
            this.splice(otherElements.length, elements.length - otherElements.length);
        }
        return this;
    }
    getList() {
        return [...this.elementNodes];
    }
    getDelimiter() {
        return structureNode_1.StructureDelimiter.ARRAY;
    }
    getMaxDepth() {
        return 1;
    }
    get elements() {
        return [...this.elementNodes];
    }
    get(index, type) {
        const element = this.elementNodes[index];
        if (type !== undefined && !(element instanceof type)) {
            throw new error_1.JsonError(`Expected ${type.name} at index ${index}, but got ${element.constructor.name}.`);
        }
        return element;
    }
    set(index, element) {
        if (index < 0 || index >= this.elementNodes.length) {
            throw new Error(`Index ${index} is out of bounds.`);
        }
        this.elementNodes[index] = factory_1.JsonValueFactory.create(element);
    }
    clear() {
        this.elementNodes.length = 0;
    }
    delete(index) {
        if (index < 0 || index >= this.elementNodes.length) {
            throw new Error(`Index ${index} is out of bounds.`);
        }
        this.splice(index, 1);
    }
    unshift(...elements) {
        this.elementNodes.unshift(...elements.map(factory_1.JsonValueFactory.create));
    }
    push(...elements) {
        this.elementNodes.push(...elements.map(factory_1.JsonValueFactory.create));
    }
    shift() {
        return this.elementNodes.shift();
    }
    pop() {
        return this.elementNodes.pop();
    }
    splice(start, deleteCount, ...elements) {
        return this.elementNodes.splice(start, deleteCount, ...elements.map(factory_1.JsonValueFactory.create));
    }
    clone() {
        const clones = new Map();
        for (const element of this.elementNodes) {
            clones.set(element, element.clone());
        }
        return new JsonArrayNode({
            elements: [...clones.values()],
            children: this.children.map(child => clones.get(child) ?? child.clone()),
            location: this.location,
        });
    }
    isEquivalent(other) {
        if (!(other instanceof JsonArrayNode)) {
            return false;
        }
        if (this.elements.length !== other.elements.length) {
            return false;
        }
        return this.elements.every((element, index) => other.elements[index].isEquivalent(element));
    }
    toJSON() {
        return this.elements.map(element => element.toJSON());
    }
}
exports.JsonArrayNode = JsonArrayNode;
factory_1.JsonValueFactory.register('array', elements => new JsonArrayNode({
    elements: elements.map(factory_1.JsonValueFactory.create),
}));
