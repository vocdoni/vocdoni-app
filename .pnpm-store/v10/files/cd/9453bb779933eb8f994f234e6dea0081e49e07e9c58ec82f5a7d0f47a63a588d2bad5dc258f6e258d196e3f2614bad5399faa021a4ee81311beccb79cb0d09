"use strict";
import * as React from 'react';

const majorVersion = parseInt(React.version.split(".")[0], 10);
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

export { assignRef, mergeRefs };
