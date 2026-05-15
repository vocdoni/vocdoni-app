"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
require('@ark-ui/react');
var clipboard = require('@ark-ui/react/clipboard');
var factory = require('@ark-ui/react/factory');
var React = require('react');
var useControllableState = require('../../hooks/use-controllable-state.cjs');
var mergeProps = require('../../merge-props.cjs');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');
var attr = require('../../utils/attr.cjs');
var cx = require('../../utils/cx.cjs');
var icons = require('../icons.cjs');
var codeBlockAdapterContext = require('./code-block-adapter-context.cjs');
var codeBlockContext = require('./code-block-context.cjs');

const {
  withProvider,
  withContext,
  useStyles: useCodeBlockStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({
  key: "codeBlock"
});
const RootBase = React.forwardRef(
  function RootBase2(props, ref) {
    const {
      children,
      code: codeProp,
      language,
      meta: metaProp,
      maxLines,
      defaultColorScheme = "dark",
      copyTimeout = 1e3,
      onCopy,
      ...rest
    } = props;
    const meta = React.useMemo(
      () => ({
        ...metaProp,
        colorScheme: metaProp?.colorScheme ?? defaultColorScheme
      }),
      [metaProp, defaultColorScheme]
    );
    const code = codeProp.trim();
    const codeLines = code.split("\n").length;
    const clipboard$1 = clipboard.useClipboard({
      value: code,
      timeout: copyTimeout,
      onStatusChange(details) {
        if (details.copied) onCopy?.();
      }
    });
    const [collapsed, setCollapsed] = useControllableState.useControllableState({
      defaultValue: maxLines != null ? codeLines > maxLines : false
    });
    const uid = React.useId();
    const collapsible = React.useMemo(
      () => ({
        contentId: `${uid}-content`,
        collapsed,
        setCollapsed,
        toggleCollapsed: () => setCollapsed((prev) => !prev)
      }),
      [collapsed, setCollapsed, uid]
    );
    const context = React.useMemo(
      () => ({
        code,
        language,
        clipboard: clipboard$1,
        collapsible,
        meta
      }),
      [code, language, clipboard$1, collapsible, meta]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(codeBlockContext.CodeBlockContextProvider, { value: context, children: /* @__PURE__ */ jsxRuntime.jsx(
      factory.ark.div,
      {
        ref,
        "data-has-focused": attr.dataAttr(Boolean(meta?.focusedLineNumbers?.length)),
        "data-has-diff": attr.dataAttr(
          Boolean(meta?.addedLineNumbers?.length) || Boolean(meta?.removedLineNumbers?.length)
        ),
        "data-has-line-numbers": attr.dataAttr(Boolean(meta?.showLineNumbers)),
        ...rest,
        className: cx.cx("chakra-theme", meta.colorScheme, rest.className),
        style: {
          ...rest.style,
          ["--code-block-line-length"]: `${String(codeLines).length}ch`
        },
        children
      }
    ) });
  }
);
const CodeBlockRoot = withProvider(
  RootBase,
  "root",
  { forwardAsChild: true, forwardProps: ["maxLines"] }
);
const CodeBlockPropsProvider = PropsProvider;
const ContentBase = React.forwardRef(
  function ContentBase2(props, ref) {
    const { children, ...restProps } = props;
    const { collapsible } = codeBlockContext.useCodeBlockContext();
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.ark.div,
      {
        ref,
        id: collapsible.contentId,
        "data-expanded": attr.dataAttr(!collapsible.collapsed),
        "aria-expanded": !collapsible.collapsed,
        ...restProps,
        children
      }
    );
  }
);
const CodeBlockContent = withContext(ContentBase, "content", { forwardAsChild: true });
const CodeBlockTitle = withContext(
  "div",
  "title"
);
const CodeBlockHeader = withContext("header", "header");
const CodeBlockCode = withContext(
  "pre",
  "code",
  {
    defaultProps: {
      tabIndex: 0
    }
  }
);
const CodeText = React.forwardRef(
  function CodeText2(props, ref) {
    const { code, language, meta } = codeBlockContext.useCodeBlockContext();
    const { highlight } = codeBlockAdapterContext.useCodeBlockAdapterContext();
    const highlighted = highlight?.({ code, language, meta });
    const codeContentProps = highlighted?.highlighted ? { dangerouslySetInnerHTML: { __html: highlighted.code } } : { children: code };
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.ark.code,
      {
        "data-plaintext": attr.dataAttr(!highlighted?.highlighted),
        "data-has-focused": attr.dataAttr(Boolean(meta?.focusedLineNumbers?.length)),
        "data-has-diff": attr.dataAttr(
          Boolean(meta?.addedLineNumbers?.length) || Boolean(meta?.removedLineNumbers?.length)
        ),
        "data-has-line-numbers": attr.dataAttr(Boolean(meta?.showLineNumbers)),
        "data-word-wrap": attr.dataAttr(Boolean(meta?.wordWrap)),
        ref,
        ...props,
        ...codeContentProps
      }
    );
  }
);
const CodeBlockCodeText = withContext(CodeText, "codeText", { forwardAsChild: true });
const BaseCopyTrigger = React.forwardRef(
  function BaseCopyTrigger2(props, ref) {
    const { children, ...restProps } = props;
    const { clipboard } = codeBlockContext.useCodeBlockContext();
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.ark.button,
      {
        ref,
        ...mergeProps.mergeProps(clipboard.getTriggerProps(), restProps),
        children
      }
    );
  }
);
const CodeBlockCopyTrigger = withContext(BaseCopyTrigger, "copyTrigger", { forwardAsChild: true });
const BaseCopyIndicator = React.forwardRef(
  function BaseCopyIndicator2(props, ref) {
    const { children, copied, ...restProps } = props;
    const { clipboard } = codeBlockContext.useCodeBlockContext();
    return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.span, { ref, ...restProps, children: clipboard.copied ? copied : children });
  }
);
const CodeBlockCopyIndicator = withContext(BaseCopyIndicator, "copyIndicator", {
  forwardAsChild: true,
  defaultProps: {
    copied: /* @__PURE__ */ jsxRuntime.jsx(icons.CheckIcon, { boxSize: "1em" }),
    children: /* @__PURE__ */ jsxRuntime.jsx(icons.CopyIcon, { boxSize: "1em" })
  }
});
const BaseCollapseTrigger = React.forwardRef(function BaseCollapseTrigger2(props, ref) {
  const { children, ...restProps } = props;
  const { collapsible } = codeBlockContext.useCodeBlockContext();
  return /* @__PURE__ */ jsxRuntime.jsx(
    factory.ark.button,
    {
      type: "button",
      "aria-controls": collapsible.contentId,
      "aria-expanded": !collapsible.collapsed,
      "aria-label": collapsible.collapsed ? "Expand code block" : "Collapse code block",
      ref,
      ...restProps,
      onClick: (e) => {
        restProps.onClick?.(e);
        collapsible.toggleCollapsed();
      },
      children
    }
  );
});
const CodeBlockCollapseTrigger = withContext(BaseCollapseTrigger, "collapseTrigger", { forwardAsChild: true });
const BaseCollapseIndicator = React.forwardRef(function BaseCollapseIndicator2(props, ref) {
  const { children, collapsed, ...restProps } = props;
  const { collapsible } = codeBlockContext.useCodeBlockContext();
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.span, { ref, ...restProps, children: collapsible.collapsed ? collapsed : children });
});
const CodeBlockCollapseIndicator = withContext(BaseCollapseIndicator, "collapseIndicator", {
  forwardAsChild: true,
  defaultProps: {
    collapsed: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronDownIcon, { boxSize: "1em" }),
    children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronUpIcon, { boxSize: "1em" })
  }
});
const CodeBlockCollapseText = React.forwardRef(function CodeBlockCollapseText2(props, ref) {
  return /* @__PURE__ */ jsxRuntime.jsx(CodeBlockCollapseIndicator, { ref, ...props, collapsed: "Expand code", children: props.children || "Collapse code" });
});
const CodeBlockFooter = withContext("footer", "footer");
const CodeBlockControl = withContext("div", "control");
const BaseOverlay = React.forwardRef(
  function BaseOverlay2(props, ref) {
    const { collapsible } = codeBlockContext.useCodeBlockContext();
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.ark.div,
      {
        ref,
        ...props,
        "data-expanded": attr.dataAttr(!collapsible.collapsed)
      }
    );
  }
);
const CodeBlockOverlay = withContext(BaseOverlay, "overlay", { forwardAsChild: true });
const CodeBlockContext = (props) => {
  return props.children(codeBlockContext.useCodeBlockContext());
};

exports.CodeBlockCode = CodeBlockCode;
exports.CodeBlockCodeText = CodeBlockCodeText;
exports.CodeBlockCollapseIndicator = CodeBlockCollapseIndicator;
exports.CodeBlockCollapseText = CodeBlockCollapseText;
exports.CodeBlockCollapseTrigger = CodeBlockCollapseTrigger;
exports.CodeBlockContent = CodeBlockContent;
exports.CodeBlockContext = CodeBlockContext;
exports.CodeBlockControl = CodeBlockControl;
exports.CodeBlockCopyIndicator = CodeBlockCopyIndicator;
exports.CodeBlockCopyTrigger = CodeBlockCopyTrigger;
exports.CodeBlockFooter = CodeBlockFooter;
exports.CodeBlockHeader = CodeBlockHeader;
exports.CodeBlockOverlay = CodeBlockOverlay;
exports.CodeBlockPropsProvider = CodeBlockPropsProvider;
exports.CodeBlockRoot = CodeBlockRoot;
exports.CodeBlockTitle = CodeBlockTitle;
exports.useCodeBlockStyles = useCodeBlockStyles;
