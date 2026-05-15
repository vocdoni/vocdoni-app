"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import { CodeBlockAdapterContextProvider } from './code-block-adapter-context.js';
import { useCodeHighlight } from './use-code-highlight.js';

function CodeBlockAdapterProvider(props) {
  const { children, value } = props;
  const context = useCodeHighlight(value);
  return /* @__PURE__ */ jsx(CodeBlockAdapterContextProvider, { value: context, children });
}

export { CodeBlockAdapterProvider };
