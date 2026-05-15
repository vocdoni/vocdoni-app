"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var index = require('../box/index.cjs');

const Square = React.forwardRef(
  function Square2(props, ref) {
    const { size, ...rest } = props;
    return /* @__PURE__ */ jsxRuntime.jsx(
      index.Box,
      {
        ...rest,
        ref,
        boxSize: size,
        css: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          flexGrow: 0,
          ...props.css
        }
      }
    );
  }
);
Square.displayName = "Square";

exports.Square = Square;
