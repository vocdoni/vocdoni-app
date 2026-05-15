"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValueNode = void 0;
const compositeNode_1 = require("./compositeNode");
const error_1 = require("../error");
class JsonValueNode extends compositeNode_1.JsonCompositeNode {
    cast(type) {
        if (!(this instanceof type)) {
            throw new error_1.JsonError(`Expected value of type ${type.name}, but got ${this.constructor.name}.`);
        }
        return this;
    }
}
exports.JsonValueNode = JsonValueNode;
