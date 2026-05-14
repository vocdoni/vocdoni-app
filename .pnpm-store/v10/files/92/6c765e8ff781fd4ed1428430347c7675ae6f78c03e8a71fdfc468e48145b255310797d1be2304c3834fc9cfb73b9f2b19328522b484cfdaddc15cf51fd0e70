"use strict";
const plainTextAdapter = {
  getHighlighter: () => ({ code }) => ({ code, highlighted: false })
};
function createShikiAdapter(opts) {
  const { load, loadSync, highlightOptions, theme } = opts;
  return {
    loadContextSync: loadSync,
    loadContext: load,
    unloadContext(ctx) {
      ctx?.dispose?.();
    },
    getHighlighter: (ctx) => {
      return ({ code, language, meta }) => {
        if (!ctx) {
          return { code, highlighted: false };
        }
        const colorScheme = meta?.colorScheme || "dark";
        const resolvedTheme = typeof theme === "string" ? theme : theme[colorScheme];
        if (!resolvedTheme) {
          throw new Error(`Theme not found for color scheme: ${colorScheme}`);
        }
        return {
          highlighted: true,
          code: removeWrapperTags(
            ctx.codeToHtml(code, {
              theme: resolvedTheme,
              ...highlightOptions,
              lang: language,
              transformers: [
                {
                  line(hast, line) {
                    hast.properties || (hast.properties = {});
                    Object.assign(hast.properties, {
                      "data-line": line,
                      "data-highlight": meta?.highlightLines?.includes(line) ? "" : void 0,
                      "data-word-wrap": meta?.wordWrap ? "" : void 0,
                      "data-diff": meta?.addedLineNumbers?.includes(line) ? "added" : meta?.removedLineNumbers?.includes(line) ? "removed" : void 0,
                      "data-focused": meta?.focusedLineNumbers?.includes(line) ? "" : void 0
                    });
                  }
                },
                ...highlightOptions?.transformers ?? []
              ]
            })
          )
        };
      };
    }
  };
}
const removeWrapperTags = (html) => {
  return html.replace(/<pre[^>]*>/, "").replace(/<\/pre>$/, "").replace(/<code[^>]*>/, "").replace(/<\/code>$/, "");
};
function createHighlightJsAdapter(opts) {
  const { load, loadSync, highlightOptions } = opts;
  return {
    loadContextSync: loadSync,
    loadContext: load,
    unloadContext(ctx) {
      const langs = ctx?.listLanguages?.();
      langs?.forEach((lang) => {
        ctx?.unregisterLanguage?.(lang);
      });
    },
    getHighlighter: (ctx) => {
      return ({ code, language = "plaintext", meta }) => {
        if (!ctx) {
          return { code, highlighted: false };
        }
        const hasDiff = (meta?.addedLineNumbers?.length ?? 0) > 0 || (meta?.removedLineNumbers?.length ?? 0) > 0;
        const result = ctx.highlight(code.trim(), {
          language,
          ...highlightOptions
        });
        const lines = result.value.split("\n");
        return {
          highlighted: true,
          code: lines.map((line, index) => {
            const lineNumber = index + 1;
            const attrs = [
              `data-line="${lineNumber}"`,
              meta?.highlightLines?.includes(lineNumber) && "data-highlight",
              meta?.wordWrap && "data-word-wrap",
              hasDiff && meta?.addedLineNumbers?.includes(lineNumber) && `data-diff="added"`,
              hasDiff && meta?.removedLineNumbers?.includes(lineNumber) && `data-diff="removed"`,
              meta?.focusedLineNumbers?.includes(lineNumber) && "data-focused"
            ];
            return `<span ${attrs.filter(Boolean).join(" ")}>${line || " "}</span>`;
          }).join("\n")
        };
      };
    }
  };
}

export { createHighlightJsAdapter, createShikiAdapter, plainTextAdapter };
