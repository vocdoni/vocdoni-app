"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValueFactory = void 0;
const valueNode_1 = require("./valueNode");
var JsonValueFactory;
(function (JsonValueFactory) {
    const factories = {};
    function register(type, factory) {
        factories[type] = factory;
    }
    JsonValueFactory.register = register;
    function create(value) {
        if (value instanceof valueNode_1.JsonValueNode) {
            return value;
        }
        if (Array.isArray(value)) {
            return factories.array(value);
        }
        if (typeof value === 'object' && value !== null) {
            return factories.object(value);
        }
        return factories.primitive(value);
    }
    JsonValueFactory.create = create;
})(JsonValueFactory || (exports.JsonValueFactory = JsonValueFactory = {}));
