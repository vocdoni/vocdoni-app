type JsonNodeType = "object" | "array" | "boolean" | "number" | "string" | "null" | "set" | "map" | "weakset" | "weakmap" | "regex" | "date" | "undefined" | "symbol" | "bigint" | "arraybuffer" | "sharedarraybuffer" | "buffer" | "dataview" | "blob" | "file" | "url" | "urlsearchparams" | "formdata" | "promise" | "headers" | "int8array" | "uint8array" | "uint8clampedarray" | "int16array" | "uint16array" | "int32array" | "uint32array" | "float32array" | "float64array" | "bigint64array" | "biguint64array" | "iterable" | "error" | "function" | "circular" | "element" | "document" | "window" | "react-element";
type JsonNodeKeyPath = (string | number)[];
type JsonNodeSyntaxKind = "constructor" | "brace" | "preview" | "preview-text" | "function-type" | "function-body" | "colon" | "circular" | "operator" | "error-stack";
interface JsonNodeElement {
    type: "element";
    tagName: "span" | "div" | "a";
    properties: {
        root?: boolean;
        nodeType?: JsonNodeType;
        kind?: JsonNodeSyntaxKind;
        [key: string]: any;
    };
    children: Array<JsonNodeElement | JsonNodeText>;
}
interface JsonNodeText {
    type: "text";
    value: string | number | boolean | null | undefined;
}
type JsonNodeHastElement = JsonNodeElement | JsonNodeText;
interface JsonNode<T = any> {
    value: T;
    type: JsonNodeType;
    keyPath: JsonNodeKeyPath;
    constructorName?: string | undefined;
    isNonEnumerable?: boolean;
    propertyDescriptor?: PropertyDescriptor | undefined;
    children?: JsonNode[];
}
interface JsonNodePreviewOptions {
    maxPreviewItems: number;
    collapseStringsAfterLength: number;
    groupArraysAfterLength: number;
    showNonenumerable: boolean;
}
interface JsonDataTypeOptions<T = any> {
    type: JsonNodeType | ((value: T) => JsonNodeType);
    check: (value: any) => boolean;
    node: JsonNodeCreatorFn<T>;
    description: string | ((node: JsonNode<T>, opts: JsonNodePreviewOptions) => string);
    previewText?: (node: JsonNode<T>, opts: JsonNodePreviewOptions) => string;
    previewElement: (node: JsonNode<T>, opts: JsonNodePreviewOptions) => JsonNodeElement;
}
interface JsonNodeCreatorParams<T = any> {
    value: T;
    keyPath: JsonNodeKeyPath;
    options: JsonNodePreviewOptions | undefined;
    createNode: (keyPath: JsonNodeKeyPath, value: unknown) => JsonNode;
}
type JsonNodeCreatorFn<T = any> = (opts: JsonNodeCreatorParams<T>) => JsonNode;

declare const getAccessibleDescription: (node: JsonNode, opts?: JsonNodePreviewOptions) => string;

declare const NullType: JsonDataTypeOptions<null>;
declare const UndefinedType: JsonDataTypeOptions<undefined>;
declare const SymbolType: JsonDataTypeOptions<symbol>;
declare const BigIntType: JsonDataTypeOptions<BigInt>;
declare const SetType: JsonDataTypeOptions<Set<unknown>>;
declare const WeakSetType: JsonDataTypeOptions<WeakSet<WeakKey>>;
declare const WeakMapType: JsonDataTypeOptions<WeakMap<WeakKey, WeakKey>>;
declare const RegexType: JsonDataTypeOptions<RegExp>;
declare const DataViewType: JsonDataTypeOptions<DataView<ArrayBufferLike>>;
declare const UrlType: JsonDataTypeOptions<URL>;
declare const URLSearchParamsType: JsonDataTypeOptions<URLSearchParams>;
declare const BlobType: JsonDataTypeOptions<Blob>;
declare const FileType: JsonDataTypeOptions<File>;
declare const FunctionType: JsonDataTypeOptions<Function>;
declare const ArrayBufferType: JsonDataTypeOptions<ArrayBuffer>;
declare const SharedArrayBufferType: JsonDataTypeOptions<SharedArrayBuffer>;
declare const BufferType: JsonDataTypeOptions<Buffer<ArrayBufferLike>>;
declare const DateType: JsonDataTypeOptions<Date>;
declare const MapType: JsonDataTypeOptions<Map<unknown, unknown>>;
declare const ErrorType: JsonDataTypeOptions<Error>;
declare const HeadersType: JsonDataTypeOptions<Headers>;
declare const FormDataType: JsonDataTypeOptions<FormData>;
declare const ArrayType: JsonDataTypeOptions<unknown[]>;
declare const TypedArrayType: JsonDataTypeOptions<any>;
declare const IterableType: JsonDataTypeOptions<any>;
declare const ClassType: JsonDataTypeOptions<any>;
declare const ObjectType: JsonDataTypeOptions<object>;
declare const ElementType: JsonDataTypeOptions<SVGElement | HTMLElement>;
declare const DocumentType: JsonDataTypeOptions<Document>;
declare const WindowType: JsonDataTypeOptions<Window>;
declare const ReactElementType: JsonDataTypeOptions<any>;
declare const StringType: JsonDataTypeOptions<string>;
declare const PrimitiveType: JsonDataTypeOptions<any>;
declare const dataTypes: JsonDataTypeOptions<any>[];
declare const jsonNodeToElement: (node: JsonNode, opts?: Partial<JsonNodePreviewOptions>) => JsonNodeHastElement;
declare const getNodeTypeDescription: (node: JsonNode, opts?: Partial<JsonNodePreviewOptions>) => string;

interface JsonToTreeOptions {
    visited?: WeakSet<WeakKey> | undefined;
    keyPath?: (string | number)[] | undefined;
    options?: JsonNodePreviewOptions | undefined;
    depth?: number | undefined;
}
declare const jsonToTree: (data: unknown, props?: JsonToTreeOptions) => JsonNode;

declare const ROOT_KEY = "$";
declare const PATH_SEP = ".";
declare function isRootKeyPath(keyPath: Array<string | number>): boolean;
declare function keyPathToId(keyPath: Array<string | number>): string;
declare function keyPathToKey(keyPath: Array<string | number>, opts?: {
    excludeRoot?: boolean;
}): string;
declare function nodeToValue(node: JsonNode): string;
declare function jsonPathToValue(path: string): string;
declare function nodeToString(node: JsonNode): string;
declare function getRootNode(data: unknown, opts?: Partial<JsonNodePreviewOptions>): JsonNode;
declare const DEFAULT_PREVIEW_OPTIONS: JsonNodePreviewOptions;
declare const getPreviewOptions: (opts?: Partial<JsonNodePreviewOptions> | undefined) => JsonNodePreviewOptions;

export { ArrayBufferType, ArrayType, BigIntType, BlobType, BufferType, ClassType, DEFAULT_PREVIEW_OPTIONS, DataViewType, DateType, DocumentType, ElementType, ErrorType, FileType, FormDataType, FunctionType, HeadersType, IterableType, type JsonDataTypeOptions, type JsonNode, type JsonNodeCreatorFn, type JsonNodeCreatorParams, type JsonNodeElement, type JsonNodeHastElement, type JsonNodeKeyPath, type JsonNodePreviewOptions, type JsonNodeSyntaxKind, type JsonNodeText, type JsonNodeType, type JsonToTreeOptions, MapType, NullType, ObjectType, PATH_SEP, PrimitiveType, ROOT_KEY, ReactElementType, RegexType, SetType, SharedArrayBufferType, StringType, SymbolType, TypedArrayType, URLSearchParamsType, UndefinedType, UrlType, WeakMapType, WeakSetType, WindowType, dataTypes, getAccessibleDescription, getNodeTypeDescription, getPreviewOptions, getRootNode, isRootKeyPath, jsonNodeToElement, jsonPathToValue, jsonToTree, keyPathToId, keyPathToKey, nodeToString, nodeToValue };
