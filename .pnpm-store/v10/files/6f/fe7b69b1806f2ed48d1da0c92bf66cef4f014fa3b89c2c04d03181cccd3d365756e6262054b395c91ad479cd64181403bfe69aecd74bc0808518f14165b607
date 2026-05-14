"use strict";
"use client";
'use strict';

var React = require('react');

function useCodeHighlight(props) {
  const { loadContext, loadContextSync, getHighlighter, unloadContext } = props;
  const [context, setContext] = React.useState(() => loadContextSync?.() ?? null);
  const contextRef = React.useRef(context);
  const highlight = React.useMemo(
    () => getHighlighter(context),
    [getHighlighter, context]
  );
  React.useEffect(() => {
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

exports.useCodeHighlight = useCodeHighlight;
