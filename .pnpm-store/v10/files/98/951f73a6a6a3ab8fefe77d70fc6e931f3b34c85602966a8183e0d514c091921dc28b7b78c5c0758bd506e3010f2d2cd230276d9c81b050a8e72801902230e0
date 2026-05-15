import { SourceLocation } from './location';
export declare enum JsonTokenType {
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    NULL = "NULL",
    COLON = "COLON",
    COMMA = "COMMA",
    LINE_COMMENT = "LINE_COMMENT",
    BLOCK_COMMENT = "BLOCK_COMMENT",
    BRACE_LEFT = "BRACE_LEFT",
    BRACE_RIGHT = "BRACE_RIGHT",
    BRACKET_LEFT = "BRACKET_LEFT",
    BRACKET_RIGHT = "BRACKET_RIGHT",
    WHITESPACE = "WHITESPACE",
    NEWLINE = "NEWLINE",
    EOF = "EOF"
}
export type JsonPrimitiveTokenType = JsonTokenType.STRING | JsonTokenType.NUMBER | JsonTokenType.BOOLEAN | JsonTokenType.NULL;
export type JsonPrimitiveValue<T extends JsonPrimitiveTokenType> = {
    [JsonTokenType.STRING]: string;
    [JsonTokenType.NUMBER]: number;
    [JsonTokenType.BOOLEAN]: boolean;
    [JsonTokenType.NULL]: null;
}[T];
export type JsonToken<T extends JsonTokenType = JsonTokenType> = {
    readonly type: T;
    readonly value: string;
    readonly location: SourceLocation;
};
export declare namespace JsonToken {
    function isType<T extends JsonTokenType>(token: JsonToken, type: T): token is JsonToken<T>;
}
