'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef, useMemo } from 'react';
import { ark } from '../factory.js';
import { carouselAnatomy } from './carousel.anatomy.js';
import { useCarouselContext } from './use-carousel-context.js';

const parts = carouselAnatomy.build();
const CarouselProgressText = forwardRef((props, ref) => {
  const carousel = useCarouselContext();
  const progressText = useMemo(() => {
    const currentPage = carousel.page + 1;
    const totalPages = carousel.pageSnapPoints.length;
    return `${currentPage} / ${totalPages}`;
  }, [carousel.page, carousel.pageSnapPoints.length]);
  return /* @__PURE__ */ jsx(ark.span, { ref, ...parts.progressText.attrs, ...props, children: props.children || progressText });
});
CarouselProgressText.displayName = "CarouselProgressText";

export { CarouselProgressText };
