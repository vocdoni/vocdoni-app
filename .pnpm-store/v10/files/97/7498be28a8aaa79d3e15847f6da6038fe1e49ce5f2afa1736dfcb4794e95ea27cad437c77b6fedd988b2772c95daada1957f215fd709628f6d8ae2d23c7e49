"use strict";
'use strict';

var isValidProp = require('@pandacss/is-valid-prop');
var compact = require('../utils/compact.cjs');
var entries = require('../utils/entries.cjs');
var flatten = require('../utils/flatten.cjs');
var is = require('../utils/is.cjs');
var memo = require('../utils/memo.cjs');
var merge = require('../utils/merge.cjs');
var splitProps = require('../utils/split-props.cjs');
var breakpoints = require('./breakpoints.cjs');
var conditions = require('./conditions.cjs');
var mergeConfig = require('./merge-config.cjs');
var css = require('./css.cjs');
var cva = require('./cva.cjs');
var layers = require('./layers.cjs');
var normalize = require('./normalize.cjs');
var preflight = require('./preflight.cjs');
var serialize = require('./serialize.cjs');
var singleton = require('./singleton.cjs');
var sva = require('./sva.cjs');
var tokenDictionary = require('./token-dictionary.cjs');
var utility = require('./utility.cjs');

function createSystem(...configs) {
  const config = mergeConfig.mergeConfigs(...configs);
  const {
    theme = {},
    utilities = {},
    globalCss = {},
    cssVarsRoot = ":where(:root, :host)",
    cssVarsPrefix = "chakra",
    preflight: preflight$1
  } = config;
  const layers$1 = layers.createLayers(config);
  const tokens = tokenDictionary.createTokenDictionary({
    breakpoints: theme.breakpoints,
    tokens: theme.tokens,
    semanticTokens: theme.semanticTokens,
    prefix: cssVarsPrefix
  });
  const breakpoints$1 = breakpoints.createBreakpoints(theme.breakpoints ?? singleton.EMPTY_OBJECT);
  const conditions$1 = conditions.createConditions({
    conditions: config.conditions ?? singleton.EMPTY_OBJECT,
    breakpoints: breakpoints$1
  });
  const utility$1 = utility.createUtility({
    config: utilities,
    tokens
  });
  function assignComposition() {
    const { textStyles, layerStyles, animationStyles } = theme;
    const compositions = compact.compact({
      textStyle: textStyles,
      layerStyle: layerStyles,
      animationStyle: animationStyles
    });
    for (const [key, values] of Object.entries(compositions)) {
      const flatValues = flatten.flatten(values ?? singleton.EMPTY_OBJECT, stop);
      utility$1.register(key, {
        values: Object.keys(flatValues),
        transform(value) {
          return css$1(flatValues[value]);
        }
      });
    }
  }
  assignComposition();
  utility$1.addPropertyType(
    "animationName",
    Object.keys(theme.keyframes ?? singleton.EMPTY_OBJECT)
  );
  const properties = /* @__PURE__ */ new Set(["css", ...utility$1.keys(), ...conditions$1.keys()]);
  const isValidProperty = memo.memo(
    (prop) => properties.has(prop) || isValidProp.isCssProperty(prop)
  );
  const normalizeValue = (value) => {
    if (Array.isArray(value)) {
      const result = singleton.createEmptyObject();
      for (let index = 0; index < value.length; index++) {
        const current = value[index];
        if (current != null) {
          const key = conditions$1.breakpoints[index];
          result[key] = current;
        }
      }
      return result;
    }
    return value;
  };
  const normalizeFn = normalize.createNormalizeFn({
    utility: utility$1,
    normalize: normalizeValue
  });
  const serialize$1 = serialize.createSerializeFn({
    conditions: conditions$1,
    isValidProperty
  });
  const css$1 = css.createCssFn({
    transform: utility$1.transform,
    conditions: conditions$1,
    normalize: normalizeFn
  });
  const cva$1 = cva.createRecipeFn({
    css: css$1,
    conditions: conditions$1,
    normalize: normalizeFn,
    layers: layers$1
  });
  const sva$1 = sva.createSlotRecipeFn({ cva: cva$1 });
  function getTokenCss() {
    const result = {};
    for (const [key, values] of tokens.cssVarMap.entries()) {
      const varsObj = Object.fromEntries(values);
      if (Object.keys(varsObj).length === 0) continue;
      const selector = key === "base" ? cssVarsRoot : conditions$1.resolve(key);
      const isAtRule = selector.startsWith("@");
      const cssObject = css$1(
        serialize$1({
          [selector]: isAtRule ? { [cssVarsRoot]: varsObj } : varsObj
        })
      );
      merge.mergeWith(result, cssObject);
    }
    return layers$1.wrap("tokens", result);
  }
  function getGlobalCss() {
    const keyframes = entries.mapEntries(
      theme.keyframes ?? singleton.EMPTY_OBJECT,
      (key, value) => [`@keyframes ${key}`, value]
    );
    const result = Object.assign({}, keyframes, css$1(serialize$1(globalCss)));
    return layers$1.wrap("base", result);
  }
  function splitCssProps(props) {
    return splitProps.splitProps(props, isValidProperty);
  }
  function getPreflightCss() {
    const result = preflight.createPreflight({ preflight: preflight$1 });
    return layers$1.wrap("reset", result);
  }
  const tokenMap = getTokenMap(tokens);
  const tokenFn = (path, fallback) => {
    return tokenMap.get(path)?.value || fallback;
  };
  tokenFn.var = (path, fallback) => {
    return tokenMap.get(path)?.variable || fallback;
  };
  function getRecipe(key, fallback) {
    return theme.recipes?.[key] ?? fallback;
  }
  function getSlotRecipe(key, fallback) {
    return theme.slotRecipes?.[key] ?? fallback;
  }
  function isRecipe(key) {
    return Object.hasOwnProperty.call(theme.recipes ?? singleton.EMPTY_OBJECT, key);
  }
  function isSlotRecipe(key) {
    return Object.hasOwnProperty.call(theme.slotRecipes ?? singleton.EMPTY_OBJECT, key);
  }
  function hasRecipe(key) {
    return isRecipe(key) || isSlotRecipe(key);
  }
  const _global = [getPreflightCss(), getGlobalCss(), getTokenCss()];
  const query = {
    layerStyles: compositionQuery(theme.layerStyles ?? singleton.EMPTY_OBJECT),
    textStyles: compositionQuery(theme.textStyles ?? singleton.EMPTY_OBJECT),
    animationStyles: compositionQuery(theme.animationStyles ?? singleton.EMPTY_OBJECT),
    tokens: semanticTokenQuery(
      tokens,
      Object.keys(theme.tokens ?? singleton.EMPTY_OBJECT),
      (value, key) => !value.extensions.conditions && !key.includes("colorPalette")
    ),
    semanticTokens: semanticTokenQuery(
      tokens,
      Object.keys(theme.semanticTokens ?? singleton.EMPTY_OBJECT),
      (value) => !!value.extensions.conditions
    ),
    keyframes: basicQuery(theme.keyframes ?? singleton.EMPTY_OBJECT),
    breakpoints: basicQuery(theme.breakpoints ?? singleton.EMPTY_OBJECT)
  };
  return {
    $$chakra: true,
    _config: config,
    _global,
    breakpoints: breakpoints$1,
    tokens,
    conditions: conditions$1,
    utility: utility$1,
    token: tokenFn,
    properties,
    layers: layers$1,
    isValidProperty,
    splitCssProps,
    normalizeValue,
    getTokenCss,
    getGlobalCss,
    getPreflightCss,
    css: css$1,
    cva: cva$1,
    sva: sva$1,
    getRecipe,
    getSlotRecipe,
    hasRecipe,
    isRecipe,
    isSlotRecipe,
    query
  };
}
function getTokenMap(tokens) {
  const map = /* @__PURE__ */ new Map();
  tokens.allTokens.forEach((token) => {
    const { cssVar, virtual, conditions } = token.extensions;
    const value = !!conditions || virtual ? cssVar.ref : token.value;
    map.set(token.name, { value, variable: cssVar.ref });
  });
  return map;
}
const isValidSystem = (mod) => {
  return is.isObject(mod) && !!Reflect.get(mod, "$$chakra");
};
const stop = (v) => is.isObject(v) && "value" in v;
const compositionQuery = (dict) => ({
  list() {
    return Object.keys(flatten.flatten(dict, stop));
  },
  search(query) {
    return this.list().filter((style) => style.includes(query));
  }
});
const semanticTokenQuery = (tokens, categoryKeys, predicate) => ({
  categoryKeys,
  list(category) {
    const map = tokens.categoryMap.get(category);
    const entries = map ? [...map.entries()] : [];
    const result = [];
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (predicate(value, key)) {
        result.push(key);
      }
    }
    return result;
  },
  search(category, query) {
    return this.list(category).filter((style) => style.includes(query));
  }
});
const basicQuery = (dict) => ({
  list() {
    return Object.keys(dict);
  },
  search(query) {
    return this.list().filter((style) => style.includes(query));
  }
});

exports.createSystem = createSystem;
exports.isValidSystem = isValidSystem;
