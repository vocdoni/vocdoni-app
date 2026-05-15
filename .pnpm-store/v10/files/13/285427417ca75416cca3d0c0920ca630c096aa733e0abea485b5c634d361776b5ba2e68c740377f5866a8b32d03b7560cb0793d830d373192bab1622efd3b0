"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var index = require('../square/index.cjs');

const Circle = React.forwardRef(
  function Circle2(props, ref) {
    const { size, ...rest } = props;
    return /* @__PURE__ */ jsxRuntime.jsx(index.Square, { size, ref, borderRadius: "9999px", ...rest });
  }
);
Circle.displayName = "Circle";

exports.Circle = Circle;
