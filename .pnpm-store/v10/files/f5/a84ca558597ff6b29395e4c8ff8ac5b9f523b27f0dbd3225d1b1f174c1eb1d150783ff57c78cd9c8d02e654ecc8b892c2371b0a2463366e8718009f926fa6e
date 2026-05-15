"use strict";
"use client";
'use strict';

var createContext = require('../../create-context.cjs');
var adapters = require('./adapters.cjs');

const [CodeBlockAdapterContextProvider, useCodeBlockAdapterContext] = createContext.createContext({
  strict: false,
  defaultValue: {
    highlight: adapters.plainTextAdapter.getHighlighter(null),
    loadContext: () => Promise.resolve(null),
    getHighlighter: adapters.plainTextAdapter.getHighlighter
  }
});

exports.CodeBlockAdapterContextProvider = CodeBlockAdapterContextProvider;
exports.useCodeBlockAdapterContext = useCodeBlockAdapterContext;
