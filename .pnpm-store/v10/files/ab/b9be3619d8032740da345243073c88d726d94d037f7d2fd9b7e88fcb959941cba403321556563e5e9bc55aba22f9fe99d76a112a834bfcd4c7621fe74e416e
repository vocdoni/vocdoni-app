import type { Expression } from '@swc/core';
import type { ASTVisitorHooks } from '../../types';
export declare class ExpressionResolver {
    private hooks;
    private variableTable;
    private sharedEnumTable;
    constructor(hooks: ASTVisitorHooks);
    /**
     * Clear per-file captured variables. Enums / shared maps are kept.
     */
    resetFileSymbols(): void;
    /**
     * Capture a VariableDeclarator node to record simple statically analyzable
     * initializers (string literals, object expressions of string literals,
     * template literals and simple concatenations).
     *
     * This is called during AST traversal before deeper walking so later
     * identifier/member-expression usage can be resolved.
     *
     * @param node - VariableDeclarator-like node (has .id and .init)
     */
    captureVariableDeclarator(node: any): void;
    /**
     * Capture a TypeScript enum declaration so members can be resolved later.
     * Accepts SWC node shapes like `TsEnumDeclaration` / `TSEnumDeclaration`.
     *
     * Enums are stored in the shared table so they are available across files.
     */
    captureEnumDeclaration(node: any): void;
    /**
     * Resolves an expression to one or more possible context string values that can be
     * determined statically from the AST. This is a wrapper around the plugin hook
     * `extractContextFromExpression` and {@link resolvePossibleStringValuesFromExpression}.
     *
     * @param expression - The SWC AST expression node to resolve
     * @returns An array of possible context string values that the expression may produce.
     */
    resolvePossibleContextStringValues(expression: Expression): string[];
    /**
     * Resolves an expression to one or more possible key string values that can be
     * determined statically from the AST. This is a wrapper around the plugin hook
     * `extractKeysFromExpression` and {@link resolvePossibleStringValuesFromExpression}.
     *
     * @param expression - The SWC AST expression node to resolve
     * @returns An array of possible key string values that the expression may produce.
     */
    resolvePossibleKeyStringValues(expression: Expression): string[];
    /**
     * Resolves an expression to one or more possible string values that can be
     * determined statically from the AST.
     *
     * Supports:
     * - StringLiteral -> single value (filtered to exclude empty strings for context)
     * - NumericLiteral -> single value
     * - BooleanLiteral -> single value
     * - ConditionalExpression (ternary) -> union of consequent and alternate resolved values
     * - TemplateLiteral -> union of all possible string values
     * - The identifier `undefined` -> empty array
     *
     * For any other expression types (identifiers, function calls, member expressions,
     * etc.) the value cannot be determined statically and an empty array is returned.
     *
     * @param expression - The SWC AST expression node to resolve
     * @param returnEmptyStrings - Whether to include empty strings in the result
     * @returns An array of possible string values that the expression may produce.
     */
    private resolvePossibleStringValuesFromExpression;
    private resolvePossibleStringValuesFromType;
    /**
     * Resolves a template literal string to one or more possible strings that can be
     * determined statically from the AST.
     *
     * @param templateString - The SWC AST template literal string to resolve
     * @returns An array of possible string values that the template may produce.
     */
    private resolvePossibleStringValuesFromTemplateString;
    /**
     * Resolves a template literal type to one or more possible strings that can be
     * determined statically from the AST.
     *
     * @param templateLiteralType - The SWC AST template literal type to resolve
     * @returns An array of possible string values that the template may produce.
     */
    private resolvePossibleStringValuesFromTemplateLiteralType;
}
//# sourceMappingURL=expression-resolver.d.ts.map