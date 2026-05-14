"use strict";
import { pretty } from './pretty.js';

async function generatePropTypes(sys) {
  const { utility } = sys;
  const result = [
    `
  import type { CssProperties } from "../css.types"
  import type { Tokens } from "./token.gen"
  `
  ];
  result.push(`
  type WithColorOpacityModifier<T> = T extends string ? \`\${T}/\${string}\` : T
  type ImportantMark = "!" | "!important"
  type WhitespaceImportant = \` \${ImportantMark}\`
  type Important = ImportantMark | WhitespaceImportant
  
  type WithImportant<T> = T extends string ? \`\${T}\${Important}\` & { __important?: true } : T;
  
  export type WithEscapeHatch<T> = T | \`[\${string}]\` | WithColorOpacityModifier<T> | WithImportant<T>
  // eslint-disable-next-line
  export type OnlyKnown<Value> = Value extends boolean ? Value : Value extends \`\${infer _}\` ? Value : never
  `);
  result.push(`
  export interface UtilityValues {
  `);
  const types = utility.getTypes();
  for (const [prop, values] of types.entries()) {
    result.push(`	${prop}: ${values.join(" | ")};`);
  }
  result.push("}", "\n");
  return pretty(result.join("\n"));
}

export { generatePropTypes };
