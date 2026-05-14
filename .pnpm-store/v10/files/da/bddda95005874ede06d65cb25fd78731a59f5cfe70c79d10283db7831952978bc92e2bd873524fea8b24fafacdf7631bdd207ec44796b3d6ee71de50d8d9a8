"use strict";
import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { Span } from '../span/index.js';
import { Spinner } from '../spinner/spinner.js';
import { AbsoluteCenter } from '../absolute-center/absolute-center.js';

const Loader = React.forwardRef(
  function Loader2(props, ref) {
    const {
      spinner = /* @__PURE__ */ jsx(Spinner, { size: "inherit", borderWidth: "0.125em", color: "inherit" }),
      spinnerPlacement = "start",
      children,
      text,
      visible = true,
      ...rest
    } = props;
    if (!visible) return children;
    if (text) {
      return /* @__PURE__ */ jsxs(Span, { ref, display: "contents", ...rest, children: [
        spinnerPlacement === "start" && spinner,
        text,
        spinnerPlacement === "end" && spinner
      ] });
    }
    if (spinner) {
      return /* @__PURE__ */ jsxs(Span, { ref, display: "contents", ...rest, children: [
        /* @__PURE__ */ jsx(AbsoluteCenter, { display: "inline-flex", children: spinner }),
        /* @__PURE__ */ jsx(Span, { visibility: "hidden", display: "contents", children })
      ] });
    }
    return /* @__PURE__ */ jsx(Span, { ref, display: "contents", ...rest, children });
  }
);
Loader.displayName = "Loader";

export { Loader };
