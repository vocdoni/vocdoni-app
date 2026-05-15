<p align="center">
    <a href="https://croct.com">
        <img src="https://cdn.croct.io/brand/logo/repo-icon-green.svg" alt="Croct" height="80"/>
    </a>
    <br />
    <strong>JSON5 Parser</strong>
    <br />
    A lossless JSON5 tokenizer and parser for Node.js that maintains indentation, spacing, and comments.
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@croct/json5-parser"><img alt="Version" src="https://img.shields.io/npm/v/@croct/json5-parser"/></a>
    <a href="https://github.com/croct-tech/json5-parser-js/actions/workflows/branch-validations.yaml"><img alt="Build" src="https://github.com/croct-tech/json5-parser-js/actions/workflows/branch-validations.yaml/badge.svg" /></a>
    <a href="https://codeclimate.com/repos/67c21d34cbf7e400df9b5dbc/test_coverage"><img src="https://api.codeclimate.com/v1/badges/e527bdbf3e2b58919c97/test_coverage" /></a>
    <a href="https://codeclimate.com/repos/67c21d34cbf7e400df9b5dbc/maintainability"><img src="https://api.codeclimate.com/v1/badges/e527bdbf3e2b58919c97/maintainability" /></a>
    <br />
    <br />
    <a href="https://github.com/croct-tech/json5-parser-js/releases">📦 Releases</a>
    ·
    <a href="https://github.com/croct-tech/json5-parser-js/issues/new?labels=bug&template=bug-report.md">🐞 Report Bug</a>
    ·
    <a href="https://github.com/croct-tech/json5-parser-js/issues/new?labels=enhancement&template=feature-request.md">✨ Request Feature</a>
</p>

## Overview

This library provides an API for working with JSON and [JSON5](https://json5.org/) documents while preserving their original structure and formatting. 
Unlike traditional JSON parsers that use an Abstract Syntax Tree (AST) and discard formatting, this library leverages a Concrete Syntax Tree (CST) to retain every detail—comments, indentation, and whitespace.

Ideal for editing configuration files (e.g., `package.json`, `tsconfig.json`) or any user-generated JSON5 content, this library ensures that formatting remains intact throughout modifications.

### Key features

- **Preserve formatting** – Read, modify, and write JSON5 files without losing comments, indentation, or spacing.
- **Style learning** – Automatically applies the document's existing formatting style to new entries.
- **Reformatting** – Customize output formatting with flexible options.
- **Type safety** – Fully typed API for working with JSON5 documents.

## Installation

Install via [NPM](https://www.npmjs.com):

```sh
npm install @croct/json5-parser
```

## Usage

The library provides a simple API for parsing, manipulating, and serializing JSON5 documents.

### Lexing

Usually, you don't need to interact with the lexer directly. However, you can use it to tokenize a JSON5 document:

```ts
import {JsonLexer} from '@croct/json5-parser';

const tokens = JsonLexer.tokenize(
    `{
        // Comment
        "name": "John Doe",
        "age": 42,
    }`
);
```

### Parsing

To parse a JSON5 document:

```ts
import {JsonParser} from '@croct/json5-parser';

const node = JsonParser.parse(
    `{
        // Comment
        "name": "John Doe",
        "age": 42,
    }`
);
```

Optionally, specify the expected root node type to narrow down the result:

```ts
import {JsonParser, JsonObjectNode} from '@croct/json5-parser';

const node = JsonParser.parse(
    `{
        // Comment
        "name": "John Doe",
        "age": 42,
    }`,
    JsonObjectNode
);
```

### Manipulation

Modify values while preserving formatting:

```ts
// Get the value of a property
const name = node.get('name').toJSON();

// Update a property
node.set('age', 43);

console.log(node.toString());
```

New entries adopt the document's existing style:

```ts
node.set('country', 'USA');

console.log(node.toString());
```

Output:

```json5
{
    // Comment
    "name": "John Doe",
    "age": 43,
    "country": "USA",
}
```

Formatting is applied at a block level, handling different styles within the same document:

```json5
{
  "name": "My Project",
  "version": "1.0.0",
  "keywords": ["json5", "parser"],
}
```

Adding an array entry keeps the existing format:

```ts
node.set('stack', ['react', 'typescript']);
```

Output:

```json5
{
  "name": "My Project",
  "version": "1.0.0",
  "keywords": ["json5", "parser"],
  "stack": ["react", "typescript"],
}
```

To reset formatting and apply a new style:

```ts
node.reset();

console.log(node.toString({/* formatting options */}));
```

Output:

```json5
{
  "name": "My Project",
  "version": "1.0.0",
  "keywords": [
    "json5",
    "parser"
  ],
  "stack": [
    "react",
    "typescript"
  ]
}
```

Refer to the [Formatting](#formatting) section for details on available options.

To update the document while preserving formatting, use the `update` method:

```ts

node.update({
    ...node.toJSON(),
    "version": "2.0.0",
});
```

The `update` method reconciles the new content with the existing document, preserving comments, indentation, and spacing.

For single updates, prefer the `set` method for better performance:

```ts
node.set('version', '2.0.0');
```

To merge two documents while preserving comments and formatting from both, use the `merge` method:

```ts

const destinationCode = `{
  // Destination pre-foo comment
  "foo": "value",
  // Destination post-foo comment
  "baz": [1, 2, 3]
}
`;

const sourceCode = `{
  /* Source pre-bar comment */
  "bar": 123, /* Inline comment */
  /* Source post-bar comment */
  "baz": true /* Another inline comment */
}
`;

const source = JsonParser.parse(sourceCode, JsonObjectNode);
const destination = JsonParser.parse(destinationCode, JsonObjectNode);

destination.merge(source)

console.log(destination.toString());
```

Output:

```json5
{
  // Destination pre-foo comment
  "foo": "value",
  /* Source pre-bar comment */
  "bar": 123, /* Inline comment */
  /* Source post-bar comment */
  "baz": true /* Another inline comment */
}
```

### Formatting

When you call `toString(options)` you can control how the output is formatted.
If an option is omitted, the formatter learns from the current document and keeps its style. If no style can be inferred, 
the formatter falls back to a compact style with no extra spaces or indentation.

#### Options

| Option                       | Type/Values          | Description                                            |
|------------------------------|----------------------|--------------------------------------------------------|
| `indentationLevel`           | `number`             | Base indentation level for the document.               |
| `indentationCharacter`       | `'space'\|'tab'`     | Character used for indentation.                        |
| `lineEnding`                 | `'lf'\|'crlf'`       | Newline sequence to use in the document.               |
| `string.quote`               | `'single'\|'double'` | Quotation style for string values.                     |
| `property.quote`             | `'single'\|'double'` | Quotation style for property keys.                     |
| `property.unquoted`          | `boolean`            | Allow unquoted property keys when valid.               |
| `array.indentationSize`      | `number`             | Indentation size for array entries.                    |
| `array.trailingIndentation`  | `boolean`            | Indent closing bracket on a new line.                  |
| `array.leadingIndentation`   | `boolean`            | Indent opening bracket on a new line.                  |
| `array.entryIndentation`     | `boolean`            | Indent each array entry.                               |
| `array.trailingComma`        | `boolean`            | Append a trailing comma after the last entry.          |
| `array.commaSpacing`         | `boolean`            | Add space after commas in arrays.                      |
| `array.colonSpacing`         | `boolean`            | Add space after colons in arrays (for objects inline). |
| `object.indentationSize`     | `number`             | Indentation size for object properties.                |
| `object.trailingIndentation` | `boolean`            | Indent closing brace on a new line.                    |
| `object.leadingIndentation`  | `boolean`            | Indent opening brace on a new line.                    |
| `object.entryIndentation`    | `boolean`            | Indent each object property.                           |
| `object.trailingComma`       | `boolean`            | Append a trailing comma after the last property.       |
| `object.commaSpacing`        | `boolean`            | Add space after commas in objects.                     |
| `object.colonSpacing`        | `boolean`            | Add space after colons in objects.                     |

#### Quick recipes

Here are some common formatting styles you can achieve by combining different options.

##### 1) Compact, single-line arrays; pretty multi-line objects

```ts
node.toString({
    array: {
        leadingIndentation: false,   // keep arrays inline
        trailingIndentation: false,
        trailingComma: false,
        commaSpacing: true,
    },
    object: {
        entryIndentation: true,      // multi-line objects
        leadingIndentation: true,    
        trailingIndentation: true,
        indentationSize: 2,
        trailingComma: true,
        commaSpacing: true,
        colonSpacing: true,
    },
});
```

Output style:

```json5
{
  "name": "My Project",
  "keywords": ["json5", "parser"], // array kept inline
  "deps": {
    "typescript": "^5.6.0",       // multi-line object
    "vite": "^5.4.0",
  }
}
```

##### 2) Tabs everywhere, single quotes, properties quoted only when necessary

```ts
node.toString({
  indentationCharacter: 'tab',
  string: {
      quote: 'single'
  },
  property: {
      quote: 'single', 
      unquoted: true
  },
  object: {
    leadingIndentation: true,
    entryIndentation: true,
    trailingIndentation: true,
    trailingComma: false,
    commaSpacing: true,
    colonSpacing: true,
  },
});
```

Output style:

```json5
{
	foo: 'bar',
	items: [
		'a',
		'b'
	]
}
```

##### 3) Strict compact style (no spaces after commas/colons)

```ts
node.toString();
```

Output style:

```json5
{"a":1,"b":[1,2,3]}
```

## Contributing

Contributions are welcome!

- Report issues on the [issue tracker](https://github.com/croct-tech/json5-parser-js/issues).
- For major changes, [open an issue](https://github.com/croct-tech/json5-parser-js/issues) first to discuss.
- Ensure test coverage is updated accordingly.

## Testing

Install dependencies:

```sh
npm install
```

Run tests:

```sh
npm run test
```

Lint code to check for style issues:

```sh
npm run lint
```
