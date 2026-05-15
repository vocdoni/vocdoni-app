"use strict";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var index = require('../span/index.cjs');
var spinner = require('../spinner/spinner.cjs');
var absoluteCenter = require('../absolute-center/absolute-center.cjs');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

const Loader = React__namespace.forwardRef(
  function Loader2(props, ref) {
    const {
      spinner: spinner$1 = /* @__PURE__ */ jsxRuntime.jsx(spinner.Spinner, { size: "inherit", borderWidth: "0.125em", color: "inherit" }),
      spinnerPlacement = "start",
      children,
      text,
      visible = true,
      ...rest
    } = props;
    if (!visible) return children;
    if (text) {
      return /* @__PURE__ */ jsxRuntime.jsxs(index.Span, { ref, display: "contents", ...rest, children: [
        spinnerPlacement === "start" && spinner$1,
        text,
        spinnerPlacement === "end" && spinner$1
      ] });
    }
    if (spinner$1) {
      return /* @__PURE__ */ jsxRuntime.jsxs(index.Span, { ref, display: "contents", ...rest, children: [
        /* @__PURE__ */ jsxRuntime.jsx(absoluteCenter.AbsoluteCenter, { display: "inline-flex", children: spinner$1 }),
        /* @__PURE__ */ jsxRuntime.jsx(index.Span, { visibility: "hidden", display: "contents", children })
      ] });
    }
    return /* @__PURE__ */ jsxRuntime.jsx(index.Span, { ref, display: "contents", ...rest, children });
  }
);
Loader.displayName = "Loader";

exports.Loader = Loader;
