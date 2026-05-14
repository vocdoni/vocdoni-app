"use strict";
import { pretty } from './pretty.js';

function generateCondition(sys) {
  const keys = sys.conditions.keys().concat("base");
  const result = `
      export interface Conditions {
        ${keys.map((key) => {
    if (key === "base") {
      return `/** The base (=no conditions) styles to apply  */
${key}: string`;
    }
    const value = sys.conditions.resolve(key);
    return `/** \`${value}\` */
'${key}': string`;
  }).join("\n")}
      }
      `;
  return pretty(result);
}

export { generateCondition };
