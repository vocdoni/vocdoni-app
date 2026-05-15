"use strict";
export { mergeConfigs } from './merge-config.js';

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

export { defineAnimationStyles, defineConditions, defineConfig, defineGlobalStyles, defineKeyframes, defineLayerStyles, defineRecipe, defineSemanticTokens, defineSlotRecipe, defineStyle, defineTextStyles, defineTokens };
