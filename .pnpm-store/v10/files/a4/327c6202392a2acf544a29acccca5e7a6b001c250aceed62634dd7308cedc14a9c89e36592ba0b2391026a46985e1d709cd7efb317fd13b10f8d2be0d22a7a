"use strict";
import { isCssProperty } from '@pandacss/is-valid-prop';
import { compact } from '../utils/compact.js';
import { mapEntries } from '../utils/entries.js';
import { flatten } from '../utils/flatten.js';
import { isObject } from '../utils/is.js';
import { memo } from '../utils/memo.js';
import { mergeWith } from '../utils/merge.js';
import { splitProps } from '../utils/split-props.js';
import { createBreakpoints } from './breakpoints.js';
import { createConditions } from './conditions.js';
import { mergeConfigs } from './merge-config.js';
import { createCssFn } from './css.js';
import { createRecipeFn } from './cva.js';
import { createLayers } from './layers.js';
import { createNormalizeFn } from './normalize.js';
import { createPreflight } from './preflight.js';
import { createSerializeFn } from './serialize.js';
import { EMPTY_OBJECT, createEmptyObject } from './singleton.js';
import { createSlotRecipeFn } from './sva.js';
import { createTokenDictionary } from './token-dictionary.js';
import { createUtility } from './utility.js';

function createSystem(...configs) {
  const config = mergeConfigs(...configs);
  const {
    theme = {},
    utilities = {},
    globalCss = {},
    cssVarsRoot = ":where(:root, :host)",
    cssVarsPrefix = "chakra",
    preflight
  } = config;
  const layers = createLayers(config);
  const tokens = createTokenDictionary({
    breakpoints: theme.breakpoints,
    tokens: theme.tokens,
    semanticTokens: theme.semanticTokens,
    prefix: cssVarsPrefix
  });
  const breakpoints = createBreakpoints(theme.breakpoints ?? EMPTY_OBJECT);
  const conditions = createConditions({
    conditions: config.conditions ?? EMPTY_OBJECT,
    breakpoints
  });
  const utility = createUtility({
    config: utilities,
    tokens
  });
  function assignComposition() {
    const { textStyles, layerStyles, animationStyles } = theme;
    const compositions = compact({
      textStyle: textStyles,
      layerStyle: layerStyles,
      animationStyle: animationStyles
    });
    for (const [key, values] of Object.entries(compositions)) {
      const flatValues = flatten(values ?? EMPTY_OBJECT, stop);
      utility.register(key, {
        values: Object.keys(flatValues),
        transform(value) {
          return css(flatValues[value]);
        }
      });
    }
  }
  assignComposition();
  utility.addPropertyType(
    "animationName",
    Object.keys(theme.keyframes ?? EMPTY_OBJECT)
  );
  const properties = /* @__PURE__ */ new Set(["css", ...utility.keys(), ...conditions.keys()]);
  const isValidProperty = memo(
    (prop) => properties.has(prop) || isCssProperty(prop)
  );
  const normalizeValue = (value) => {
    if (Array.isArray(value)) {
      const result = createEmptyObject();
      for (let index = 0; index < value.length; index++) {
        const current = value[index];
        if (current != null) {
          const key = conditions.breakpoints[index];
          result[key] = current;
        }
      }
      return result;
    }
    return value;
  };
  const normalizeFn = createNormalizeFn({
    utility,
    normalize: normalizeValue
  });
  const serialize = createSerializeFn({
    conditions,
    isValidProperty
  });
  const css = createCssFn({
    transform: utility.transform,
    conditions,
    normalize: normalizeFn
  });
  const cva = createRecipeFn({
    css,
    conditions,
    normalize: normalizeFn,
    layers
  });
  const sva = createSlotRecipeFn({ cva });
  function getTokenCss() {
    const result = {};
    for (const [key, values] of tokens.cssVarMap.entries()) {
      const varsObj = Object.fromEntries(values);
      if (Object.keys(varsObj).length === 0) continue;
      const selector = key === "base" ? cssVarsRoot : conditions.resolve(key);
      const isAtRule = selector.startsWith("@");
      const cssObject = css(
        serialize({
          [selector]: isAtRule ? { [cssVarsRoot]: varsObj } : varsObj
        })
      );
      mergeWith(result, cssObject);
    }
    return layers.wrap("tokens", result);
  }
  function getGlobalCss() {
    const keyframes = mapEntries(
      theme.keyframes ?? EMPTY_OBJECT,
      (key, value) => [`@keyframes ${key}`, value]
    );
    const result = Object.assign({}, keyframes, css(serialize(globalCss)));
    return layers.wrap("base", result);
  }
  function splitCssProps(props) {
    return splitProps(props, isValidProperty);
  }
  function getPreflightCss() {
    const result = createPreflight({ preflight });
    return layers.wrap("reset", result);
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
    return Object.hasOwnProperty.call(theme.recipes ?? EMPTY_OBJECT, key);
  }
  function isSlotRecipe(key) {
    return Object.hasOwnProperty.call(theme.slotRecipes ?? EMPTY_OBJECT, key);
  }
  function hasRecipe(key) {
    return isRecipe(key) || isSlotRecipe(key);
  }
  const _global = [getPreflightCss(), getGlobalCss(), getTokenCss()];
  const query = {
    layerStyles: compositionQuery(theme.layerStyles ?? EMPTY_OBJECT),
    textStyles: compositionQuery(theme.textStyles ?? EMPTY_OBJECT),
    animationStyles: compositionQuery(theme.animationStyles ?? EMPTY_OBJECT),
    tokens: semanticTokenQuery(
      tokens,
      Object.keys(theme.tokens ?? EMPTY_OBJECT),
      (value, key) => !value.extensions.conditions && !key.includes("colorPalette")
    ),
    semanticTokens: semanticTokenQuery(
      tokens,
      Object.keys(theme.semanticTokens ?? EMPTY_OBJECT),
      (value) => !!value.extensions.conditions
    ),
    keyframes: basicQuery(theme.keyframes ?? EMPTY_OBJECT),
    breakpoints: basicQuery(theme.breakpoints ?? EMPTY_OBJECT)
  };
  return {
    $$chakra: true,
    _config: config,
    _global,
    breakpoints,
    tokens,
    conditions,
    utility,
    token: tokenFn,
    properties,
    layers,
    isValidProperty,
    splitCssProps,
    normalizeValue,
    getTokenCss,
    getGlobalCss,
    getPreflightCss,
    css,
    cva,
    sva,
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
  return isObject(mod) && !!Reflect.get(mod, "$$chakra");
};
const stop = (v) => isObject(v) && "value" in v;
const compositionQuery = (dict) => ({
  list() {
    return Object.keys(flatten(dict, stop));
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

export { createSystem, isValidSystem };
