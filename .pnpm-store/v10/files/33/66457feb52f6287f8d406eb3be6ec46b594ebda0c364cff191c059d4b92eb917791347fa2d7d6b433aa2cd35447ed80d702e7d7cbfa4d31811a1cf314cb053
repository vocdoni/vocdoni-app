'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const utils = require('@zag-js/utils');
const react = require('react');

function getErrorMessage(hook, provider) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`;
}
function createContext(options = {}) {
  const {
    name,
    strict = true,
    hookName = "useContext",
    providerName = "Provider",
    errorMessage,
    defaultValue
  } = options;
  const Context = react.createContext(defaultValue);
  Context.displayName = name;
  function useContext() {
    const context = react.useContext(Context);
    if (!context && strict) {
      const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
      error.name = "ContextError";
      if (utils.hasProp(Error, "captureStackTrace") && utils.isFunction(Error.captureStackTrace)) {
        Error.captureStackTrace(error, useContext);
      }
      throw error;
    }
    return context;
  }
  return [Context.Provider, useContext, Context];
}

exports.createContext = createContext;
