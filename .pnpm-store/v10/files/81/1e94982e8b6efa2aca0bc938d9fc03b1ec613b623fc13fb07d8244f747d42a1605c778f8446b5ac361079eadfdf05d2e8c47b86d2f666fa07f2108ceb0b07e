"use strict";
import { mapEntries } from '../utils/entries.js';
import { omit } from '../utils/omit.js';
import { splitProps } from '../utils/split-props.js';
import { EMPTY_OBJECT, EMPTY_ARRAY, createEmptyObject } from './singleton.js';

const getSlotRecipes = (config = EMPTY_OBJECT) => {
  const init = (slot) => ({
    base: config.base?.[slot] ?? EMPTY_OBJECT,
    variants: createEmptyObject(),
    defaultVariants: config.defaultVariants ?? EMPTY_OBJECT,
    compoundVariants: config.compoundVariants ? getSlotCompoundVariant(config.compoundVariants, slot) : EMPTY_ARRAY
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
        slotRecipe.variants[variantsKey][variantKey] = variantSpec[slot] ?? EMPTY_OBJECT;
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
  return function sva(config = EMPTY_OBJECT) {
    const slots = Object.entries(getSlotRecipes(config)).map(
      ([slot, slotCva]) => [slot, cva(slotCva)]
    );
    function svaFn(props) {
      const result = slots.map(([slot, cvaFn]) => [slot, cvaFn(props)]);
      return Object.fromEntries(result);
    }
    const variants = config.variants ?? EMPTY_OBJECT;
    const variantKeys = Object.keys(variants);
    function splitVariantProps(props) {
      const restProps = omit(props, ["recipe"]);
      const [recipeProps, localProps] = splitProps(restProps, variantKeys);
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
    const variantMap = mapEntries(variants, (key, value) => [
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

export { createSlotRecipeFn, getSlotCompoundVariant };
