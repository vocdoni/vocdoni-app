"use strict";
'use strict';

var entries = require('../utils/entries.cjs');
var omit = require('../utils/omit.cjs');
var splitProps = require('../utils/split-props.cjs');
var singleton = require('./singleton.cjs');

const getSlotRecipes = (config = singleton.EMPTY_OBJECT) => {
  const init = (slot) => ({
    base: config.base?.[slot] ?? singleton.EMPTY_OBJECT,
    variants: singleton.createEmptyObject(),
    defaultVariants: config.defaultVariants ?? singleton.EMPTY_OBJECT,
    compoundVariants: config.compoundVariants ? getSlotCompoundVariant(config.compoundVariants, slot) : singleton.EMPTY_ARRAY
  });
  const slots = config.slots ?? [];
  const entries = slots.map((slot) => [slot, init(slot)]);
  for (const [variantsKey, variantsSpec] of Object.entries(
    config.variants ?? {}
  )) {
    for (const [variantKey, variantSpec] of Object.entries(
      variantsSpec
    )) {
      entries.forEach(([slot, slotRecipe]) => {
        var _a;
        (_a = slotRecipe.variants)[variantsKey] ?? (_a[variantsKey] = {});
        slotRecipe.variants[variantsKey][variantKey] = variantSpec[slot] ?? singleton.EMPTY_OBJECT;
      });
    }
  }
  return Object.fromEntries(entries);
};
const getSlotCompoundVariant = (compoundVariants, slotName) => compoundVariants.filter((compoundVariant) => compoundVariant.css[slotName]).map((compoundVariant) => ({
  ...compoundVariant,
  css: compoundVariant.css[slotName]
}));
function createSlotRecipeFn(options) {
  const { cva } = options;
  return function sva(config = singleton.EMPTY_OBJECT) {
    const slots = Object.entries(getSlotRecipes(config)).map(
      ([slot, slotCva]) => [slot, cva(slotCva)]
    );
    function svaFn(props) {
      const result = slots.map(([slot, cvaFn]) => [slot, cvaFn(props)]);
      return Object.fromEntries(result);
    }
    const variants = config.variants ?? singleton.EMPTY_OBJECT;
    const variantKeys = Object.keys(variants);
    function splitVariantProps(props) {
      const restProps = omit.omit(props, ["recipe"]);
      const [recipeProps, localProps] = splitProps.splitProps(restProps, variantKeys);
      const hasColorPalette = variantKeys.includes("colorPalette");
      const hasOrientation = variantKeys.includes("orientation");
      if (!hasColorPalette) {
        recipeProps.colorPalette = props.colorPalette || config.defaultVariants?.colorPalette;
      }
      if (hasOrientation) {
        localProps.orientation = props.orientation;
      }
      return [recipeProps, localProps];
    }
    const variantMap = entries.mapEntries(variants, (key, value) => [
      key,
      Object.keys(value)
    ]);
    let classNameMap = {};
    if (config.className) {
      classNameMap = Object.fromEntries(
        config.slots.map((slot) => [
          slot,
          `${config.className}__${slot}`
        ])
      );
    }
    return Object.assign(svaFn, {
      variantMap,
      variantKeys,
      splitVariantProps,
      classNameMap
    });
  };
}

exports.createSlotRecipeFn = createSlotRecipeFn;
exports.getSlotCompoundVariant = getSlotCompoundVariant;
