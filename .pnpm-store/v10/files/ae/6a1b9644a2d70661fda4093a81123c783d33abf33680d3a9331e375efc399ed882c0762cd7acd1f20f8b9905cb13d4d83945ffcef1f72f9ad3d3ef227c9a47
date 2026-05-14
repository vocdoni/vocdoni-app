"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonToken = exports.JsonTokenType = void 0;
var JsonTokenType;
(function (JsonTokenType) {
    JsonTokenType["IDENTIFIER"] = "IDENTIFIER";
    JsonTokenType["STRING"] = "STRING";
    JsonTokenType["NUMBER"] = "NUMBER";
    JsonTokenType["BOOLEAN"] = "BOOLEAN";
    JsonTokenType["NULL"] = "NULL";
    JsonTokenType["COLON"] = "COLON";
    JsonTokenType["COMMA"] = "COMMA";
    JsonTokenType["LINE_COMMENT"] = "LINE_COMMENT";
    JsonTokenType["BLOCK_COMMENT"] = "BLOCK_COMMENT";
    JsonTokenType["BRACE_LEFT"] = "BRACE_LEFT";
    JsonTokenType["BRACE_RIGHT"] = "BRACE_RIGHT";
    JsonTokenType["BRACKET_LEFT"] = "BRACKET_LEFT";
    JsonTokenType["BRACKET_RIGHT"] = "BRACKET_RIGHT";
    JsonTokenType["WHITESPACE"] = "WHITESPACE";
    JsonTokenType["NEWLINE"] = "NEWLINE";
    JsonTokenType["EOF"] = "EOF";
})(JsonTokenType || (exports.JsonTokenType = JsonTokenType = {}));
var JsonToken;
(function (JsonToken) {
    function isType(token, type) {
        return token.type === type;
    }
    JsonToken.isType = isType;
})(JsonToken || (exports.JsonToken = JsonToken = {}));
