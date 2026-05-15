"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var factory = require('../../styled-system/factory.cjs');
var cx = require('../../utils/cx.cjs');

const Image = React.forwardRef(
  function Image2(props, ref) {
    const { align, fit = "cover", ...rest } = props;
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.chakra.img,
      {
        ref,
        objectFit: fit,
        objectPosition: align,
        className: cx.cx("chakra-image", props.className),
        ...rest
      }
    );
  }
);
Image.displayName = "Image";

exports.Image = Image;
