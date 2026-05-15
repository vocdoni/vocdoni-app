import { JsonValueNode } from './node';
export declare class JsonParser {
    private readonly lexer;
    constructor(source: string);
    static parse<T extends JsonValueNode>(source: string, type: {
        new (...args: any[]): T;
    }): T;
    static parse(source: string): JsonValueNode;
    parseValue<T extends JsonValueNode>(type: {
        new (...args: any[]): T;
    }): T;
    parseValue(): JsonValueNode;
    private parseRoot;
    private parseNext;
    private parseNumber;
    private parseNumberValue;
    private parseString;
    private parseNull;
    private parseBoolean;
    private parseArray;
    private parseObject;
    private parseObjectProperty;
    private parseIdentifier;
    private static createChildren;
}
