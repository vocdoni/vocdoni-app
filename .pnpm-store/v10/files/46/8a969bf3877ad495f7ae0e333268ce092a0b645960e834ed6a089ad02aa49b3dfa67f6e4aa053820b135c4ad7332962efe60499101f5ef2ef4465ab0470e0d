"use strict";
"use client";
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Carousel, useCarouselContext } from '@ark-ui/react/carousel';
import { forwardRef } from 'react';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';
import { Box } from '../box/index.js';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons.js';

const {
  withProvider,
  withContext,
  useStyles: useCarouselStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "carousel" });
const CarouselRootProvider = withProvider(Carousel.RootProvider, "root", {
  forwardAsChild: true
});
const CarouselRoot = withProvider(
  Carousel.Root,
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
const CarouselItemGroup = withContext(Carousel.ItemGroup, "itemGroup", { forwardAsChild: true });
const CarouselItem = withContext(
  Carousel.Item,
  "item",
  { forwardAsChild: true }
);
const CarouselControl = withContext(Carousel.Control, "control", { forwardAsChild: true });
const CarouselPrevTrigger = withContext(Carousel.PrevTrigger, "prevTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsx(ChevronLeftIcon, {}) }
});
const CarouselNextTrigger = withContext(Carousel.NextTrigger, "nextTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsx(ChevronRightIcon, {}) }
});
const CarouselIndicators = forwardRef(function CarouselIndicators2(props, ref) {
  const api = useCarouselContext();
  return /* @__PURE__ */ jsx(CarouselIndicatorGroup, { ref, children: api.pageSnapPoints.map((_, index) => /* @__PURE__ */ jsx(CarouselIndicator, { index, ...props }, index)) });
});
const CarouselAutoplayIndicator = ({
  play,
  paused
}) => {
  const api = useCarouselContext();
  return /* @__PURE__ */ jsx(Fragment, { children: api.isPlaying ? paused : play });
};
const CarouselProgressText = forwardRef(function CarouselProgressText2(props, ref) {
  const api = useCarouselContext();
  return /* @__PURE__ */ jsxs(Box, { ref, ...props, children: [
    api.page + 1,
    " / ",
    api.pageSnapPoints.length
  ] });
});
const CarouselAutoplayTrigger = withContext(Carousel.AutoplayTrigger, "autoplayTrigger", { forwardAsChild: true });
const CarouselIndicatorGroup = withContext(Carousel.IndicatorGroup, "indicatorGroup", { forwardAsChild: true });
const CarouselIndicator = withContext(Carousel.Indicator, "indicator", { forwardAsChild: true });
const CarouselContext = Carousel.Context;

export { CarouselAutoplayIndicator, CarouselAutoplayTrigger, CarouselContext, CarouselControl, CarouselIndicator, CarouselIndicatorGroup, CarouselIndicators, CarouselItem, CarouselItemGroup, CarouselNextTrigger, CarouselPrevTrigger, CarouselProgressText, CarouselPropsProvider, CarouselRoot, CarouselRootProvider, useCarouselStyles };
