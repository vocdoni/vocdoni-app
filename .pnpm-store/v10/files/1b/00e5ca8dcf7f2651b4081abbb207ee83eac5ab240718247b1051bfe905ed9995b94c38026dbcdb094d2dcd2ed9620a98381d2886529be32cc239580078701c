"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var highlight = require('@ark-ui/react/highlight');
var React = require('react');
var index = require('../mark/index.cjs');
var _for = require('../for/for.cjs');

function Highlight(props) {
  const { children, query, ignoreCase, matchAll, styles } = props;
  if (typeof children !== "string") {
    throw new Error("The children prop of Highlight must be a string");
  }
  const chunks = highlight.useHighlight({
    query,
    text: children,
    matchAll,
    ignoreCase
  });
  return /* @__PURE__ */ jsxRuntime.jsx(_for.For, { each: chunks, children: (chunk, index$1) => {
    return chunk.match ? /* @__PURE__ */ jsxRuntime.jsx(index.Mark, { css: styles, children: chunk.text }, index$1) : /* @__PURE__ */ jsxRuntime.jsx(React.Fragment, { children: chunk.text }, index$1);
  } });
}

exports.Highlight = Highlight;
