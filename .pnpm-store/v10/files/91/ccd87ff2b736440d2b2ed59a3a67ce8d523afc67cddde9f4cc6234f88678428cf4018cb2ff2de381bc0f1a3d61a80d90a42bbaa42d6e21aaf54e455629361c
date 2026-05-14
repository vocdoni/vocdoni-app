export type BlockFormatting = {
    indentationSize?: number;
    trailingIndentation?: boolean;
    leadingIndentation?: boolean;
    entryIndentation?: boolean;
    trailingComma?: boolean;
    commaSpacing?: boolean;
    colonSpacing?: boolean;
};
export type Formatting = {
    indentationLevel?: number;
    indentationCharacter?: 'space' | 'tab';
    lineEnding?: 'lf' | 'crlf';
    string?: {
        quote?: 'single' | 'double';
    };
    property?: {
        quote?: 'single' | 'double';
        unquoted?: boolean;
    };
    array?: BlockFormatting;
    object?: BlockFormatting;
};
