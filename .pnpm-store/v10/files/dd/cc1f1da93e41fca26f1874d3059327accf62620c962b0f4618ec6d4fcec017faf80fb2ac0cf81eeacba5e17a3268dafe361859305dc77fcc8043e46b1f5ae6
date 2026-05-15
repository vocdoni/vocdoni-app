"use strict";
'use strict';

var compact = require('../utils/compact.cjs');
var cx = require('../utils/cx.cjs');
var entries = require('../utils/entries.cjs');
var merge = require('../utils/merge.cjs');
var omit = require('../utils/omit.cjs');
var splitProps = require('../utils/split-props.cjs');
var uniq = require('../utils/uniq.cjs');
var css = require('./css.cjs');
var singleton = require('./singleton.cjs');

const defaults = (conf) => ({
  base: singleton.EMPTY_OBJECT,
  variants: singleton.EMPTY_OBJECT,
  defaultVariants: singleton.EMPTY_OBJECT,
  compoundVariants: [],
  ...conf
});
function createRecipeFn(options) {
  const { css: css$1, conditions, normalize, layers } = options;
  function cva(config = {}) {
    const defaultsConfig = defaults(config);
    const { base, defaultVariants, compoundVariants } = defaultsConfig;
    const variants = entries.mapEntries(defaultsConfig.variants, (key, obj) => [
      key,
      entries.mapEntries(obj, (optionKey, styles) => [optionKey, normalize(styles)])
    ]);
    const getVariantCss = css.createCssFn({
      conditions,
      normalize,
      transform(prop, value) {
        return variants[prop]?.[value];
      }
    });
    const resolve = (props = {}) => {
      const variantSelections = normalize({
        ...defaultVariants,
        ...compact.compact(props)
      });
      let variantCss = { ...normalize(base) };
      merge.mergeWith(variantCss, getVariantCss(variantSelections));
      const compoundVariantCss = getCompoundVariantCss(
        compoundVariants,
        variantSelections
      );
      return layers.wrap("recipes", css$1(variantCss, compoundVariantCss));
    };
    const variantKeys = Object.keys(variants);
    const splitVariantProps = (props) => {
      const restProps = omit.omit(props, ["recipe"]);
      const [recipeProps, localProps] = splitProps.splitProps(restProps, variantKeys);
      const hasColorPalette = variantKeys.includes("colorPalette");
      const hasOrientation = variantKeys.includes("orientation");
      if (!hasColorPalette) {
        recipeProps.colorPalette = props.colorPalette || defaultVariants.colorPalette;
      }
      if (hasOrientation) {
        localProps.orientation = props.orientation;
      }
      return [recipeProps, localProps];
    };
    const variantMap = entries.mapEntries(variants, (key, value) => [
      key,
      Object.keys(value)
    ]);
    const cvaFn = (props) => css$1(resolve(props));
    return Object.assign(cvaFn, {
      className: config.className,
      __cva__: true,
      variantMap,
      variantKeys,
      raw: resolve,
      config,
      splitVariantProps,
      merge(other) {
        return cva(mergeCva(options)(this, other));
      }
    });
  }
  function getCompoundVariantCss(cvs, vm) {
    let result = singleton.EMPTY_OBJECT;
    cvs.forEach((cv) => {
      const isMatching = Object.entries(cv).every(([key, value]) => {
        if (key === "css") return true;
        const values = Array.isArray(value) ? value : [value];
        return values.some((value2) => vm[key] === value2);
      });
      if (isMatching) {
        result = css$1(result, cv.css);
      }
    });
    return result;
  }
  return cva;
}
function mergeCva(opts) {
  const { css } = opts;
  return function mergeCva2(cvaA, cvaB) {
    const override = defaults(cvaB.config);
    const variantKeys = uniq.uniq(cvaA.variantKeys, Object.keys(cvaB.variants));
    const base = css(cvaA.base, override.base);
    const variants = Object.fromEntries(
      variantKeys.map((key) => [
        key,
        css(cvaA.config.variants[key], override.variants[key])
      ])
    );
    const defaultVariants = merge.mergeWith(
      cvaA.config.defaultVariants,
      override.defaultVariants
    );
    const compoundVariants = [
      ...cvaA.compoundVariants,
      ...override.compoundVariants
    ];
    const className = cx.cx(cvaA.className, cvaB.className);
    return {
      className,
      base,
      variants,
      defaultVariants,
      compoundVariants
    };
  };
}

exports.createRecipeFn = createRecipeFn;
