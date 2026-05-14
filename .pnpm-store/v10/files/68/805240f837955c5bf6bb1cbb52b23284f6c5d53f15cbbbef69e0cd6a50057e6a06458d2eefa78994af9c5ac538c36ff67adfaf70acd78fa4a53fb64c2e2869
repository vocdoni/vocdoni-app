'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react = require('react');
const factory = require('../factory.cjs');
const carousel_anatomy = require('./carousel.anatomy.cjs');
const useCarouselContext = require('./use-carousel-context.cjs');

const parts = carousel_anatomy.carouselAnatomy.build();
const CarouselProgressText = react.forwardRef((props, ref) => {
  const carousel = useCarouselContext.useCarouselContext();
  const progressText = react.useMemo(() => {
    const currentPage = carousel.page + 1;
    const totalPages = carousel.pageSnapPoints.length;
    return `${currentPage} / ${totalPages}`;
  }, [carousel.page, carousel.pageSnapPoints.length]);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.span, { ref, ...parts.progressText.attrs, ...props, children: props.children || progressText });
});
CarouselProgressText.displayName = "CarouselProgressText";

exports.CarouselProgressText = CarouselProgressText;
