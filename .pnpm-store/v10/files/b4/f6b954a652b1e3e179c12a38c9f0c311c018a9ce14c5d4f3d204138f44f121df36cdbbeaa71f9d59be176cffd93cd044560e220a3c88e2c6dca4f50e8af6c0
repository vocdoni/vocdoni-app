"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonParseError = exports.JsonError = void 0;
class JsonError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.JsonError = JsonError;
class JsonParseError extends JsonError {
    constructor(message, location) {
        super(message);
        this.location = location;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.JsonParseError = JsonParseError;
