"use strict";
'use strict';

var mergeConfig = require('./merge-config.cjs');

const defineConditions = (v) => v;
const defineRecipe = (v) => v;
const defineSlotRecipe = (v) => v;
const defineKeyframes = (v) => v;
const defineGlobalStyles = (v) => v;
const defineStyle = (v) => v;
const defineTextStyles = (v) => v;
const defineAnimationStyles = (v) => v;
const defineLayerStyles = (v) => v;
function createProxy() {
  const identity = (v) => v;
  return new Proxy(identity, {
    get() {
      return identity;
    }
  });
}
const defineTokens = /* @__PURE__ */ createProxy();
const defineSemanticTokens = /* @__PURE__ */ createProxy();
const defineConfig = (v) => v;

exports.mergeConfigs = mergeConfig.mergeConfigs;
exports.defineAnimationStyles = defineAnimationStyles;
exports.defineConditions = defineConditions;
exports.defineConfig = defineConfig;
exports.defineGlobalStyles = defineGlobalStyles;
exports.defineKeyframes = defineKeyframes;
exports.defineLayerStyles = defineLayerStyles;
exports.defineRecipe = defineRecipe;
exports.defineSemanticTokens = defineSemanticTokens;
exports.defineSlotRecipe = defineSlotRecipe;
exports.defineStyle = defineStyle;
exports.defineTextStyles = defineTextStyles;
exports.defineTokens = defineTokens;
