'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react = require('react');
const factory = require('../factory.cjs');
const carousel_anatomy = require('./carousel.anatomy.cjs');
const useCarouselContext = require('./use-carousel-context.cjs');

const parts = carousel_anatomy.carouselAnatomy.build();
const CarouselAutoplayIndicator = react.forwardRef((props, ref) => {
  const { children, fallback, ...restProps } = props;
  const carousel = useCarouselContext.useCarouselContext();
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.span, { ref, ...parts.autoplayIndicator.attrs, ...restProps, children: carousel.isPlaying ? children : fallback });
});
CarouselAutoplayIndicator.displayName = "CarouselAutoplayIndicator";

exports.CarouselAutoplayIndicator = CarouselAutoplayIndicator;
