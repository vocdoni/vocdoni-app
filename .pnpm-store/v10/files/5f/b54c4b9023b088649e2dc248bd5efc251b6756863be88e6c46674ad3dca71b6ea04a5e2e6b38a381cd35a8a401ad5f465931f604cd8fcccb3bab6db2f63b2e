import { JsonToken, JsonTokenType } from './token';
export declare class JsonLexer implements Iterable<JsonToken> {
    private static PATTERNS;
    private remaining;
    private current;
    constructor(source: string);
    static tokenize(source: string): JsonToken[];
    isEof(): boolean;
    [Symbol.iterator](): Iterator<JsonToken>;
    skipInsignificant(): JsonToken[];
    skip(...types: JsonTokenType[]): JsonToken[];
    expect<T extends JsonTokenType>(type: T, ...other: T[]): JsonToken<T>;
    consume<T extends JsonTokenType>(type: T, ...types: T[]): JsonToken<T>;
    matches(...types: JsonTokenType[]): boolean;
    peek(): JsonToken;
    next(): JsonToken;
    private match;
    private createToken;
    private static isTokenType;
}
