'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { carouselAnatomy } from './carousel.anatomy.js';
import { useCarouselContext } from './use-carousel-context.js';

const parts = carouselAnatomy.build();
const CarouselAutoplayIndicator = forwardRef((props, ref) => {
  const { children, fallback, ...restProps } = props;
  const carousel = useCarouselContext();
  return /* @__PURE__ */ jsx(ark.span, { ref, ...parts.autoplayIndicator.attrs, ...restProps, children: carousel.isPlaying ? children : fallback });
});
CarouselAutoplayIndicator.displayName = "CarouselAutoplayIndicator";

export { CarouselAutoplayIndicator };
