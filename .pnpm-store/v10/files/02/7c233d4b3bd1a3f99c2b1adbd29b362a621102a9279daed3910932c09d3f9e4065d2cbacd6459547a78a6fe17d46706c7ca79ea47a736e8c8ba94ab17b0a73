"use strict";
"use client";
import { createContext } from '../../create-context.js';
import { plainTextAdapter } from './adapters.js';

const [CodeBlockAdapterContextProvider, useCodeBlockAdapterContext] = createContext({
  strict: false,
  defaultValue: {
    highlight: plainTextAdapter.getHighlighter(null),
    loadContext: () => Promise.resolve(null),
    getHighlighter: plainTextAdapter.getHighlighter
  }
});

export { CodeBlockAdapterContextProvider, useCodeBlockAdapterContext };
