"use strict";
import { pretty } from './pretty.js';
import { unionType, capitalize } from './shared.js';

async function generateTokens(sys) {
  const { allTokens, tokenMap, colorPaletteMap, categoryMap } = sys.tokens;
  const isTokenEmpty = allTokens.length === 0;
  const set = /* @__PURE__ */ new Set();
  set.add(
    `export type Token = ${isTokenEmpty ? "string" : unionType(Array.from(tokenMap.keys()))}`
  );
  const result = /* @__PURE__ */ new Set(["export type Tokens = {"]);
  if (isTokenEmpty) {
    result.add("[token: string]: string");
  } else {
    const colorPaletteKeys = Array.from(colorPaletteMap.keys());
    if (colorPaletteKeys.length) {
      set.add(`export type ColorPalette = ${unionType(colorPaletteKeys)}`);
    }
    for (const [key, value] of categoryMap.entries()) {
      const typeName = capitalize(key);
      set.add(`export type ${typeName}Token = ${unionType(value.keys())}`);
      result.add(`		${key}: ${typeName}Token`);
    }
  }
  result.add("} & { [token: string]: never }");
  set.add(Array.from(result).join("\n"));
  return pretty(Array.from(set).join("\n\n"));
}

export { generateTokens };
