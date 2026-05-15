'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const scrollArea = require('@zag-js/scroll-area');
const react$1 = require('@zag-js/react');
const react = require('react');
const useEnvironmentContext = require('../../providers/environment/use-environment-context.cjs');
const useLocaleContext = require('../../providers/locale/use-locale-context.cjs');

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

const scrollArea__namespace = /*#__PURE__*/_interopNamespaceDefault(scrollArea);

const useScrollArea = (props) => {
  const id = react.useId();
  const { getRootNode } = useEnvironmentContext.useEnvironmentContext();
  const { dir } = useLocaleContext.useLocaleContext();
  const context = {
    id,
    dir,
    getRootNode,
    ...props
  };
  const service = react$1.useMachine(scrollArea__namespace.machine, context);
  return scrollArea__namespace.connect(service, react$1.normalizeProps);
};

exports.useScrollArea = useScrollArea;
