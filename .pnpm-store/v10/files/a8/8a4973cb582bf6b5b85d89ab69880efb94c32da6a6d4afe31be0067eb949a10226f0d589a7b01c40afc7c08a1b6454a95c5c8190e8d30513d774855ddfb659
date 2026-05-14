import { unescapeHtml } from "@svta/cml-utils";

//#region src/getElementsByName.ts
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
function getElementsByName(node, name, found = []) {
	if (!node) return found;
	if (node.nodeName === name) found.push(node);
	if (node.childNodes) for (const child of node.childNodes) getElementsByName(child, name, found);
	return found;
}

//#endregion
//#region src/parseXml.ts
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
function parseXml(input, options = {}) {
	let pos = options.pos || 0;
	const length = input.length;
	const keepComments = !!options.keepComments;
	const keepWhitespace = !!options.keepWhitespace;
	const openBracket = "<";
	const openBracketCC = "<".charCodeAt(0);
	const closeBracket = ">";
	const closeBracketCC = ">".charCodeAt(0);
	const minusCC = "-".charCodeAt(0);
	const slashCC = "/".charCodeAt(0);
	const questionCC = "?".charCodeAt(0);
	const exclamationCC = "!".charCodeAt(0);
	const singleQuoteCC = "'".charCodeAt(0);
	const doubleQuoteCC = "\"".charCodeAt(0);
	const openCornerBracketCC = "[".charCodeAt(0);
	const closeCornerBracketCC = "]".charCodeAt(0);
	const nameSpacer = "\r\n	>/= ";
	function createTextNode(value, nodeName = "#text") {
		return {
			nodeName,
			nodeValue: value,
			attributes: {},
			childNodes: []
		};
	}
	/**
	* parsing a list of entries
	*/
	function parseChildren(tagName = "") {
		const children = [];
		while (input[pos]) if (input.charCodeAt(pos) == openBracketCC) {
			if (input.charCodeAt(pos + 1) === slashCC) {
				const closeStart = pos + 2;
				pos = input.indexOf(closeBracket, pos);
				if (!input.startsWith(tagName, closeStart)) {
					const parsedText = input.substring(0, pos).split("\n");
					throw new Error("Unexpected close tag\nLine: " + (parsedText.length - 1) + "\nColumn: " + (parsedText[parsedText.length - 1].length + 1) + "\nChar: " + input[pos]);
				}
				if (pos + 1) pos += 1;
				return children;
			} else if (input.charCodeAt(pos + 1) === questionCC) {
				pos = input.indexOf(closeBracket, pos);
				pos++;
				continue;
			} else if (input.charCodeAt(pos + 1) === exclamationCC) {
				if (input.charCodeAt(pos + 2) == minusCC) {
					const startCommentPos = pos;
					while (pos !== -1 && !(input.charCodeAt(pos) === closeBracketCC && input.charCodeAt(pos - 1) == minusCC && input.charCodeAt(pos - 2) == minusCC && pos != -1)) pos = input.indexOf(closeBracket, pos + 1);
					if (pos === -1) pos = length;
					if (keepComments) children.push(createTextNode(input.substring(startCommentPos, pos + 1), "#comment"));
				} else if (input.charCodeAt(pos + 2) === openCornerBracketCC && input.charCodeAt(pos + 8) === openCornerBracketCC && input.startsWith("CDATA", pos + 3)) {
					const cdataEndIndex = input.indexOf("]]>", pos);
					if (cdataEndIndex == -1) {
						children.push(createTextNode(input.substr(pos + 9), "#cdata"));
						pos = length;
					} else {
						children.push(createTextNode(input.substring(pos + 9, cdataEndIndex), "#cdata"));
						pos = cdataEndIndex + 3;
					}
					continue;
				} else {
					const startDoctype = pos + 1;
					pos += 2;
					let encapsuled = false;
					while ((input.charCodeAt(pos) !== closeBracketCC || encapsuled === true) && input[pos]) {
						if (input.charCodeAt(pos) === openCornerBracketCC) encapsuled = true;
						else if (encapsuled === true && input.charCodeAt(pos) === closeCornerBracketCC) encapsuled = false;
						pos++;
					}
					children.push(createTextNode(input.substring(startDoctype, pos), "#doctype"));
				}
				pos++;
				continue;
			}
			const node = parseNode();
			children.push(node);
		} else {
			const text = parseText();
			if (keepWhitespace) {
				if (text.length > 0) children.push(createTextNode(text));
			} else {
				const trimmed = text.trim();
				if (trimmed.length > 0) children.push(createTextNode(trimmed));
			}
			pos++;
		}
		return children;
	}
	/**
	* returns the text outside of texts until the first '&lt;'
	*/
	function parseText() {
		const start = pos;
		pos = input.indexOf(openBracket, pos) - 1;
		if (pos === -2) pos = length;
		return unescapeHtml(input.slice(start, pos + 1));
	}
	/**
	* returns text until the first nonAlphabetic letter
	*/
	function parseName() {
		const start = pos;
		while (nameSpacer.indexOf(input[pos]) === -1 && input[pos]) pos++;
		return input.slice(start, pos);
	}
	/**
	* parses the attributes of a node
	*/
	function parseAttributes() {
		const attributes = {};
		while (input.charCodeAt(pos) !== closeBracketCC && input[pos]) {
			const c = input.charCodeAt(pos);
			if (c > 64 && c < 91 || c > 96 && c < 123) {
				const name = parseName();
				let value = "";
				let code = input.charCodeAt(pos);
				while (code !== singleQuoteCC && code !== doubleQuoteCC) {
					pos++;
					code = input.charCodeAt(pos);
				}
				if (code === singleQuoteCC || code === doubleQuoteCC) {
					value = parseString();
					if (pos === -1) throw new Error("Missing closing quote");
				} else pos--;
				attributes[name] = unescapeHtml(value);
			}
			pos++;
		}
		return attributes;
	}
	/**
	* parses a node
	*/
	function parseNode() {
		pos++;
		const nodeName = parseName();
		let localName = nodeName;
		let prefix = null;
		const nsIndex = nodeName.indexOf(":");
		if (nsIndex !== -1) {
			prefix = nodeName.slice(0, nsIndex);
			localName = nodeName.slice(nsIndex + 1);
		}
		const attributes = parseAttributes();
		let childNodes = [];
		const prev = input.charCodeAt(pos - 1);
		pos++;
		if (prev !== slashCC) childNodes = parseChildren(nodeName);
		return {
			nodeName,
			nodeValue: null,
			attributes,
			childNodes,
			prefix,
			localName
		};
	}
	/**
	* is parsing a string, that starts with a char and with the same usually ' or "
	*/
	function parseString() {
		const startChar = input[pos];
		const startpos = pos + 1;
		pos = input.indexOf(startChar, startpos);
		return input.slice(startpos, pos);
	}
	return {
		nodeName: "#document",
		nodeValue: null,
		childNodes: parseChildren(""),
		attributes: {}
	};
}

//#endregion
//#region src/serializeXml.ts
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
function serializeXml(xml) {
	const { nodeName, attributes, childNodes } = xml;
	if (nodeName === "#document") return `<?xml version="1.0" encoding="UTF-8"?>${serializeXml(childNodes[0])}`;
	if (nodeName === "#text") return xml.nodeValue || "";
	let result = `<${nodeName}`;
	if (attributes) for (const key in attributes) result += ` ${key}=${JSON.stringify(attributes[key])}`;
	let children = "";
	const childCount = childNodes?.length;
	if (childCount) for (let i = 0; i < childCount; i++) children += serializeXml(childNodes[i]);
	const close = !children ? " />" : `>${children}</${nodeName}>`;
	result += close;
	return result;
}

//#endregion
export { getElementsByName, parseXml, serializeXml };
//# sourceMappingURL=index.js.map