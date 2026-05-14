# Installation
> `npm install --save @types/cli-table`

# Summary
This package contains type definitions for cli-table (https://github.com/Automattic/cli-table).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/cli-table.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/cli-table/index.d.ts)
````ts
type HorizontalTableRow = string[];
type VerticalTableRow = Record<string, string>;
type CrossTableRow = Record<string, string[]>;
type TableRow = HorizontalTableRow | VerticalTableRow | CrossTableRow;

interface TableOptions<T extends TableRow = TableRow> {
    rows?: T[];
    chars?: {
        [
            k in
                | "top"
                | "top-mid"
                | "top-left"
                | "top-right"
                | "bottom"
                | "bottom-mid"
                | "bottom-left"
                | "bottom-right"
                | "left"
                | "left-mid"
                | "mid"
                | "mid-mid"
                | "right"
                | "right-mid"
                | "middle"
        ]?: string;
    };
    truncate?: string;
    colors?: boolean;
    colWidths?: number[];
    colAligns?: Array<"left" | "middle" | "right">;
    style?: {
        "padding-left"?: number;
        "padding-right"?: number;
        head?: string[];
        border?: string[];
        compact?: boolean;
    };
    head?: string[];
}

declare class Table<T extends TableRow = TableRow> extends Array<T> {
    /**
     * Table constructor
     *
     * @param options
     * @api public
     */
    constructor(options?: T extends CrossTableRow ? never : TableOptions<T>);
    constructor(options: T extends CrossTableRow ? TableOptions<T> & { head: ["", ...string[]] } : never);

    /**
     * Width getter
     *
     * @return width
     * @api public
     */
    get width(): number;

    /**
     * Render to a string.
     *
     * @return table representation
     * @api public
     */
    render(): string;

    /**
     * Render to a string.
     *
     * @return table representation
     * @api public
     */
    toString(): string;

    static readonly version: string;
}

export = Table;

````

### Additional Details
 * Last updated: Mon, 06 Nov 2023 22:41:05 GMT
 * Dependencies: none

# Credits
These definitions were written by [AryloYeung](https://github.com/arylo), and [Antoni Spaanderman](https://github.com/antonilol).
