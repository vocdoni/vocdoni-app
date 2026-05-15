"use strict";
"use client";
import { useState, useRef, useMemo, useEffect } from 'react';

function useCodeHighlight(props) {
  const { loadContext, loadContextSync, getHighlighter, unloadContext } = props;
  const [context, setContext] = useState(() => loadContextSync?.() ?? null);
  const contextRef = useRef(context);
  const highlight = useMemo(
    () => getHighlighter(context),
    [getHighlighter, context]
  );
  useEffect(() => {
    loadContext?.().then((c) => {
      contextRef.current = c;
      setContext(c);
    });
    return () => {
      unloadContext?.(contextRef.current);
    };
  }, [loadContext, unloadContext]);
  return {
    highlight,
    loadContext,
    getHighlighter
  };
}

export { useCodeHighlight };
