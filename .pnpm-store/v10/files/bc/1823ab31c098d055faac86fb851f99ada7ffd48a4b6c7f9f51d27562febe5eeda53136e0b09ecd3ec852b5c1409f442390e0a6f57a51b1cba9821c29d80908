"use strict";
import { allCssProperties } from '@pandacss/is-valid-prop';
import { pretty } from './pretty.js';

async function generateSystemTypes(sys) {
  const props = new Set(
    allCssProperties.concat(sys.utility.keys()).filter(Boolean)
  );
  const propTypes = sys.utility.getTypes();
  const shouldImportTypeWithEscapeHatch = sys._config.strictTokens;
  const result = `
  import type { ConditionalValue, CssProperties } from "../css.types"
  ${shouldImportTypeWithEscapeHatch ? `import type { UtilityValues, WithEscapeHatch } from "./prop-types.gen"` : `import type { UtilityValues } from "./prop-types.gen"`}
  import type { Token } from "./token.gen"
  type AnyString = (string & {})
  type AnyNumber = (number & {})
  type CssVars = \`var(--\${string})\`
  type CssVarValue = ConditionalValue<Token | CssVars | AnyString | AnyNumber>
  type CssVarKey = \`--\${string}\`
  export type CssVarProperties = {
      [key in CssVarKey]?: CssVarValue | undefined
  }
  
  export interface SystemProperties {
    ${Array.from(props).map((key) => {
    const prop = sys.utility.shorthands.get(key) ?? key;
    const union = [];
    const cssFallback = allCssProperties.includes(prop) ? `CssProperties["${prop}"]` : "";
    if (propTypes.has(prop)) {
      const utilityValue = `UtilityValues["${prop}"]`;
      if (strictPropertyList.has(key)) {
        union.push([utilityValue, "CssVars"].join(" | "));
      } else {
        union.push(
          [
            utilityValue,
            "CssVars",
            sys._config.strictTokens ? "" : cssFallback
          ].filter(Boolean).join(" | ")
        );
      }
    } else {
      union.push(
        [strictPropertyList.has(key) ? "CssVars" : "", cssFallback].filter(Boolean).join(" | ")
      );
    }
    const filtered = union.filter(Boolean);
    if (!filtered.length) {
      filtered.push("string | number");
    }
    filtered.push("undefined");
    const value = filtered.filter(Boolean).join(" | ");
    return `${key}?: ${restrict(prop, value, sys)} | undefined`;
  }).join("\n")}
  }
      `;
  return pretty(result);
}
const strictPropertyList = /* @__PURE__ */ new Set([]);
const restrict = (_key, value, sys) => {
  const { _config: config } = sys;
  if (config.strictTokens) return `ConditionalValue<WithEscapeHatch<${value}>>`;
  return `ConditionalValue<${value} | AnyString>`;
};

export { generateSystemTypes };
