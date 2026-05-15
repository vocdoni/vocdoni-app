"use strict";
'use strict';

var React = require('react');

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

const majorVersion = parseInt(React__namespace.version.split(".")[0], 10);
const shouldReturnCleanup = majorVersion >= 19;
function assignRef(ref, value) {
  if (ref == null) return;
  if (typeof ref === "function") {
    return ref(value);
  }
  try {
    ref.current = value;
  } catch (error) {
    throw new Error(`Cannot assign value '${value}' to ref '${ref}'`);
  }
}
function mergeRefs(...refs) {
  const availableRefs = refs.filter((ref) => ref != null);
  if (shouldReturnCleanup) {
    const cleanupMap = /* @__PURE__ */ new Map();
    return (node) => {
      availableRefs.forEach((ref) => {
        const cleanup = assignRef(ref, node);
        if (cleanup) {
          cleanupMap.set(ref, cleanup);
        }
      });
      return () => {
        availableRefs.forEach((ref) => {
          const cleanup = cleanupMap.get(ref);
          if (cleanup && typeof cleanup === "function") {
            cleanup();
          } else {
            assignRef(ref, null);
          }
        });
        cleanupMap.clear();
      };
    };
  } else {
    return (node) => {
      availableRefs.forEach((ref) => {
        assignRef(ref, node);
      });
    };
  }
}

exports.assignRef = assignRef;
exports.mergeRefs = mergeRefs;
