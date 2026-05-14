"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { chakra } from '../../styled-system/factory.js';
import { cx } from '../../utils/cx.js';

const Image = forwardRef(
  function Image2(props, ref) {
    const { align, fit = "cover", ...rest } = props;
    return /* @__PURE__ */ jsx(
      chakra.img,
      {
        ref,
        objectFit: fit,
        objectPosition: align,
        className: cx("chakra-image", props.className),
        ...rest
      }
    );
  }
);
Image.displayName = "Image";

export { Image };
