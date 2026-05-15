'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const asyncList = require('@zag-js/async-list');
const react = require('@zag-js/react');

function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
  if (e) {
    for (const k in e) {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}

const asyncList__namespace = /*#__PURE__*/_interopNamespaceDefault(asyncList);

function useAsyncList(props) {
  const service = react.useMachine(asyncList__namespace.machine, props);
  return asyncList__namespace.connect(service);
}

exports.useAsyncList = useAsyncList;
