"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var carousel = require('@ark-ui/react/carousel');
var React = require('react');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');
var index = require('../box/index.cjs');
var icons = require('../icons.cjs');

const {
  withProvider,
  withContext,
  useStyles: useCarouselStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "carousel" });
const CarouselRootProvider = withProvider(carousel.Carousel.RootProvider, "root", {
  forwardAsChild: true
});
const CarouselRoot = withProvider(
  carousel.Carousel.Root,
  "root",
  {
    forwardAsChild: true,
    forwardProps: ["page", "loop"],
    defaultProps: {
      spacing: "1rem"
    }
  }
);
const CarouselPropsProvider = PropsProvider;
const CarouselItemGroup = withContext(carousel.Carousel.ItemGroup, "itemGroup", { forwardAsChild: true });
const CarouselItem = withContext(
  carousel.Carousel.Item,
  "item",
  { forwardAsChild: true }
);
const CarouselControl = withContext(carousel.Carousel.Control, "control", { forwardAsChild: true });
const CarouselPrevTrigger = withContext(carousel.Carousel.PrevTrigger, "prevTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronLeftIcon, {}) }
});
const CarouselNextTrigger = withContext(carousel.Carousel.NextTrigger, "nextTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronRightIcon, {}) }
});
const CarouselIndicators = React.forwardRef(function CarouselIndicators2(props, ref) {
  const api = carousel.useCarouselContext();
  return /* @__PURE__ */ jsxRuntime.jsx(CarouselIndicatorGroup, { ref, children: api.pageSnapPoints.map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(CarouselIndicator, { index, ...props }, index)) });
});
const CarouselAutoplayIndicator = ({
  play,
  paused
}) => {
  const api = carousel.useCarouselContext();
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: api.isPlaying ? paused : play });
};
const CarouselProgressText = React.forwardRef(function CarouselProgressText2(props, ref) {
  const api = carousel.useCarouselContext();
  return /* @__PURE__ */ jsxRuntime.jsxs(index.Box, { ref, ...props, children: [
    api.page + 1,
    " / ",
    api.pageSnapPoints.length
  ] });
});
const CarouselAutoplayTrigger = withContext(carousel.Carousel.AutoplayTrigger, "autoplayTrigger", { forwardAsChild: true });
const CarouselIndicatorGroup = withContext(carousel.Carousel.IndicatorGroup, "indicatorGroup", { forwardAsChild: true });
const CarouselIndicator = withContext(carousel.Carousel.Indicator, "indicator", { forwardAsChild: true });
const CarouselContext = carousel.Carousel.Context;

exports.CarouselAutoplayIndicator = CarouselAutoplayIndicator;
exports.CarouselAutoplayTrigger = CarouselAutoplayTrigger;
exports.CarouselContext = CarouselContext;
exports.CarouselControl = CarouselControl;
exports.CarouselIndicator = CarouselIndicator;
exports.CarouselIndicatorGroup = CarouselIndicatorGroup;
exports.CarouselIndicators = CarouselIndicators;
exports.CarouselItem = CarouselItem;
exports.CarouselItemGroup = CarouselItemGroup;
exports.CarouselNextTrigger = CarouselNextTrigger;
exports.CarouselPrevTrigger = CarouselPrevTrigger;
exports.CarouselProgressText = CarouselProgressText;
exports.CarouselPropsProvider = CarouselPropsProvider;
exports.CarouselRoot = CarouselRoot;
exports.CarouselRootProvider = CarouselRootProvider;
exports.useCarouselStyles = useCarouselStyles;
