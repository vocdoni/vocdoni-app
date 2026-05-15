"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import '@ark-ui/react';
import { useClipboard } from '@ark-ui/react/clipboard';
import { ark } from '@ark-ui/react/factory';
import { forwardRef, useMemo, useId } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state.js';
import { mergeProps } from '../../merge-props.js';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';
import { dataAttr } from '../../utils/attr.js';
import { cx } from '../../utils/cx.js';
import { CopyIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon } from '../icons.js';
import { useCodeBlockAdapterContext } from './code-block-adapter-context.js';
import { CodeBlockContextProvider, useCodeBlockContext } from './code-block-context.js';

const {
  withProvider,
  withContext,
  useStyles: useCodeBlockStyles,
  PropsProvider
} = createSlotRecipeContext({
  key: "codeBlock"
});
const RootBase = forwardRef(
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
    const meta = useMemo(
      () => ({
        ...metaProp,
        colorScheme: metaProp?.colorScheme ?? defaultColorScheme
      }),
      [metaProp, defaultColorScheme]
    );
    const code = codeProp.trim();
    const codeLines = code.split("\n").length;
    const clipboard = useClipboard({
      value: code,
      timeout: copyTimeout,
      onStatusChange(details) {
        if (details.copied) onCopy?.();
      }
    });
    const [collapsed, setCollapsed] = useControllableState({
      defaultValue: maxLines != null ? codeLines > maxLines : false
    });
    const uid = useId();
    const collapsible = useMemo(
      () => ({
        contentId: `${uid}-content`,
        collapsed,
        setCollapsed,
        toggleCollapsed: () => setCollapsed((prev) => !prev)
      }),
      [collapsed, setCollapsed, uid]
    );
    const context = useMemo(
      () => ({
        code,
        language,
        clipboard,
        collapsible,
        meta
      }),
      [code, language, clipboard, collapsible, meta]
    );
    return /* @__PURE__ */ jsx(CodeBlockContextProvider, { value: context, children: /* @__PURE__ */ jsx(
      ark.div,
      {
        ref,
        "data-has-focused": dataAttr(Boolean(meta?.focusedLineNumbers?.length)),
        "data-has-diff": dataAttr(
          Boolean(meta?.addedLineNumbers?.length) || Boolean(meta?.removedLineNumbers?.length)
        ),
        "data-has-line-numbers": dataAttr(Boolean(meta?.showLineNumbers)),
        ...rest,
        className: cx("chakra-theme", meta.colorScheme, rest.className),
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
const ContentBase = forwardRef(
  function ContentBase2(props, ref) {
    const { children, ...restProps } = props;
    const { collapsible } = useCodeBlockContext();
    return /* @__PURE__ */ jsx(
      ark.div,
      {
        ref,
        id: collapsible.contentId,
        "data-expanded": dataAttr(!collapsible.collapsed),
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
const CodeText = forwardRef(
  function CodeText2(props, ref) {
    const { code, language, meta } = useCodeBlockContext();
    const { highlight } = useCodeBlockAdapterContext();
    const highlighted = highlight?.({ code, language, meta });
    const codeContentProps = highlighted?.highlighted ? { dangerouslySetInnerHTML: { __html: highlighted.code } } : { children: code };
    return /* @__PURE__ */ jsx(
      ark.code,
      {
        "data-plaintext": dataAttr(!highlighted?.highlighted),
        "data-has-focused": dataAttr(Boolean(meta?.focusedLineNumbers?.length)),
        "data-has-diff": dataAttr(
          Boolean(meta?.addedLineNumbers?.length) || Boolean(meta?.removedLineNumbers?.length)
        ),
        "data-has-line-numbers": dataAttr(Boolean(meta?.showLineNumbers)),
        "data-word-wrap": dataAttr(Boolean(meta?.wordWrap)),
        ref,
        ...props,
        ...codeContentProps
      }
    );
  }
);
const CodeBlockCodeText = withContext(CodeText, "codeText", { forwardAsChild: true });
const BaseCopyTrigger = forwardRef(
  function BaseCopyTrigger2(props, ref) {
    const { children, ...restProps } = props;
    const { clipboard } = useCodeBlockContext();
    return /* @__PURE__ */ jsx(
      ark.button,
      {
        ref,
        ...mergeProps(clipboard.getTriggerProps(), restProps),
        children
      }
    );
  }
);
const CodeBlockCopyTrigger = withContext(BaseCopyTrigger, "copyTrigger", { forwardAsChild: true });
const BaseCopyIndicator = forwardRef(
  function BaseCopyIndicator2(props, ref) {
    const { children, copied, ...restProps } = props;
    const { clipboard } = useCodeBlockContext();
    return /* @__PURE__ */ jsx(ark.span, { ref, ...restProps, children: clipboard.copied ? copied : children });
  }
);
const CodeBlockCopyIndicator = withContext(BaseCopyIndicator, "copyIndicator", {
  forwardAsChild: true,
  defaultProps: {
    copied: /* @__PURE__ */ jsx(CheckIcon, { boxSize: "1em" }),
    children: /* @__PURE__ */ jsx(CopyIcon, { boxSize: "1em" })
  }
});
const BaseCollapseTrigger = forwardRef(function BaseCollapseTrigger2(props, ref) {
  const { children, ...restProps } = props;
  const { collapsible } = useCodeBlockContext();
  return /* @__PURE__ */ jsx(
    ark.button,
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
const BaseCollapseIndicator = forwardRef(function BaseCollapseIndicator2(props, ref) {
  const { children, collapsed, ...restProps } = props;
  const { collapsible } = useCodeBlockContext();
  return /* @__PURE__ */ jsx(ark.span, { ref, ...restProps, children: collapsible.collapsed ? collapsed : children });
});
const CodeBlockCollapseIndicator = withContext(BaseCollapseIndicator, "collapseIndicator", {
  forwardAsChild: true,
  defaultProps: {
    collapsed: /* @__PURE__ */ jsx(ChevronDownIcon, { boxSize: "1em" }),
    children: /* @__PURE__ */ jsx(ChevronUpIcon, { boxSize: "1em" })
  }
});
const CodeBlockCollapseText = forwardRef(function CodeBlockCollapseText2(props, ref) {
  return /* @__PURE__ */ jsx(CodeBlockCollapseIndicator, { ref, ...props, collapsed: "Expand code", children: props.children || "Collapse code" });
});
const CodeBlockFooter = withContext("footer", "footer");
const CodeBlockControl = withContext("div", "control");
const BaseOverlay = forwardRef(
  function BaseOverlay2(props, ref) {
    const { collapsible } = useCodeBlockContext();
    return /* @__PURE__ */ jsx(
      ark.div,
      {
        ref,
        ...props,
        "data-expanded": dataAttr(!collapsible.collapsed)
      }
    );
  }
);
const CodeBlockOverlay = withContext(BaseOverlay, "overlay", { forwardAsChild: true });
const CodeBlockContext = (props) => {
  return props.children(useCodeBlockContext());
};

export { CodeBlockCode, CodeBlockCodeText, CodeBlockCollapseIndicator, CodeBlockCollapseText, CodeBlockCollapseTrigger, CodeBlockContent, CodeBlockContext, CodeBlockControl, CodeBlockCopyIndicator, CodeBlockCopyTrigger, CodeBlockFooter, CodeBlockHeader, CodeBlockOverlay, CodeBlockPropsProvider, CodeBlockRoot, CodeBlockTitle, useCodeBlockStyles };
