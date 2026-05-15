//#region src/XmlNode.d.ts
/**
* XML node
*
*
* @beta
*/
type XmlNode = {
  nodeName: string;
  nodeValue: string | null;
  attributes: Record<string, string>;
  childNodes: XmlNode[];
  prefix?: string | null;
  localName?: string;
};
//#endregion
//#region src/getElementsByName.d.ts
/**
* Recursively finds all elements by name within an XML structure.
*
* @param node - The current XML node to search within.
* @param name - The name of the target nodes to find.
* @param found - An array to collect matching nodes.
* @returns An array of all matching XmlNodes.
*
*
* @beta
*
*/
declare function getElementsByName(node: XmlNode, name: string, found?: XmlNode[]): XmlNode[];
//#endregion
//#region src/XmlParseOptions.d.ts
/**
* XML parsing options
*
*
* @beta
*/
type XmlParseOptions = {
  pos?: number;
  keepWhitespace?: boolean;
  keepComments?: boolean;
};
//#endregion
//#region src/parseXml.d.ts
/**
* Parse XML into a JS object with no validation and some failure tolerance
*
* @param input - The input XML string
* @param options - Optional parsing options
* @returns The parsed XML
*
* @beta
*
* @example
* {@includeCode ../test/decodeXml.test.ts#example}
*/
declare function parseXml(input: string, options?: XmlParseOptions): XmlNode;
//#endregion
//#region src/serializeXml.d.ts
/**
* Basic xml encoding utility. Encodes XML into a string.
*
* @param xml - The XML node to encode
* @returns The parsed XML
*
* @beta
*
* @example
* {@includeCode ../test/serializeXml.test.ts#example}
*/
declare function serializeXml(xml: XmlNode): string;
//#endregion
export { XmlNode, XmlParseOptions, getElementsByName, parseXml, serializeXml };
//# sourceMappingURL=index.d.ts.map