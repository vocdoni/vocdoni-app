"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNode = void 0;
const location_1 = require("../location");
class JsonNode {
    constructor(definition) {
        this.location = definition.location ?? location_1.SourceLocation.unknown();
    }
    equals(other) {
        return this.equalsLocation(other) && this.isEquivalent(other);
    }
    equalsLocation(other) {
        return this.location.start.index === other.location.start.index
            && this.location.start.line === other.location.start.line
            && this.location.start.column === other.location.start.column
            && this.location.end.index === other.location.end.index
            && this.location.end.line === other.location.end.line
            && this.location.end.column === other.location.end.column;
    }
}
exports.JsonNode = JsonNode;
