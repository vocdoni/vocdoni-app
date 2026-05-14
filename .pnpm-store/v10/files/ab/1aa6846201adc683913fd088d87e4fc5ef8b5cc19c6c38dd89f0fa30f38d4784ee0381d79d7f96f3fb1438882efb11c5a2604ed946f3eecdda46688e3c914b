"use strict";
function unionType(values, loosen = false) {
  const baseType = Array.from(values).map((value) => JSON.stringify(value)).join(" | ");
  if (loosen) {
    return `${baseType} | (string & {})`;
  }
  return baseType;
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
const isBooleanValue = (value) => value === "true" || value === "false" || typeof value === "boolean";
const uniq = (arr) => Array.from(new Set(arr));

export { capitalize, isBooleanValue, unionType, uniq };
