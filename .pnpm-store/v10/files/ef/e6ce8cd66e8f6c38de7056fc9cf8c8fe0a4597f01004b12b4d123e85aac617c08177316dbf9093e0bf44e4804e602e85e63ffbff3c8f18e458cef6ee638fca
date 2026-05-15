'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var domQuery = require('@zag-js/dom-query');
var utils = require('@zag-js/utils');
var core = require('@zag-js/core');
var dismissable = require('@zag-js/dismissable');
var types = require('@zag-js/types');

// src/navigation-menu.anatomy.ts
var anatomy = anatomy$1.createAnatomy("navigation-menu").parts(
  "root",
  "viewportPositioner",
  "viewport",
  "trigger",
  "content",
  "list",
  "item",
  "link",
  "indicator",
  "itemIndicator",
  "arrow"
);
var parts = anatomy.build();
var getRootId = (ctx) => ctx.ids?.root ?? `nav-menu:${ctx.id}`;
var getTriggerId = (ctx, value) => ctx.ids?.trigger?.(value) ?? `nav-menu:${ctx.id}:trigger:${value}`;
var getTriggerProxyId = (ctx, value) => ctx.ids?.triggerProxy?.(value) ?? `nav-menu:${ctx.id}:trigger-proxy:${value}`;
var getContentId = (ctx, value) => ctx.ids?.content?.(value) ?? `nav-menu:${ctx.id}:content:${value}`;
var getViewportId = (ctx) => ctx.ids?.viewport ?? `nav-menu:${ctx.id}:viewport`;
var getListId = (ctx) => ctx.ids?.list ?? `nav-menu:${ctx.id}:list`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `nav-menu:${ctx.id}:item:${value}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getViewportEl = (ctx) => ctx.getById(getViewportId(ctx));
var getTriggerEl = (ctx, value) => {
  if (!value) return null;
  return ctx.getById(getTriggerId(ctx, value));
};
var getTriggerProxyEl = (ctx, value) => {
  if (!value) return null;
  return ctx.getById(getTriggerProxyId(ctx, value));
};
var getListEl = (ctx) => ctx.getById(getListId(ctx));
var getContentEl = (ctx, value) => {
  if (!value) return null;
  return ctx.getById(getContentId(ctx, value));
};
var getContentEls = (ctx) => domQuery.queryAll(ctx.getDoc(), `[data-scope=navigation-menu][data-part=content][data-uid='${ctx.id}']`);
var getTabbableEls = (ctx, value) => {
  return domQuery.getTabbables(getContentEl(ctx, value));
};
var getTriggerEls = (ctx) => domQuery.queryAll(getListEl(ctx), `[data-part=trigger][data-uid='${ctx.id}']`);
var getLinkEls = (ctx, value) => {
  const contentEl = getContentEl(ctx, value);
  return domQuery.queryAll(contentEl, `[data-part=link][data-ownedby="${getContentId(ctx, value)}"]`);
};
var getElements = (ctx) => {
  const topLevelTriggerSelector = `[data-part=trigger][data-uid='${ctx.id}']:not([data-disabled])`;
  const topLevelLinkSelector = `[data-part=item] > [data-part=link]`;
  return domQuery.queryAll(getListEl(ctx), `${topLevelTriggerSelector}, ${topLevelLinkSelector}`);
};
function trackResizeObserver(element, onResize) {
  if (!element.length) return;
  let frame = 0;
  const win = domQuery.getWindow(element[0]);
  const obs = new win.ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(onResize);
  });
  element.forEach((el) => {
    if (el) obs.observe(el);
  });
  return () => {
    cancelAnimationFrame(frame);
    element.forEach((el) => {
      if (el) obs.unobserve(el);
    });
  };
}
function setMotionAttr(scope, value, previousValue) {
  const triggers = getTriggerEls(scope);
  const dir = triggers[0].dir;
  let values = triggers.map((trigger) => trigger.getAttribute("data-value"));
  if (dir === "rtl") values.reverse();
  const index = values.indexOf(value);
  const prevIndex = values.indexOf(previousValue);
  const contentEls = getContentEls(scope);
  contentEls.forEach((contentEl) => {
    const itemValue = contentEl.dataset.value;
    const selected = value === itemValue;
    const prevSelected = prevIndex === values.indexOf(itemValue);
    if (!selected && !prevSelected) {
      delete contentEl.dataset.motion;
      return;
    }
    const attribute = (() => {
      if (index !== prevIndex) {
        if (selected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start";
        if (prevSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end";
      }
      return null;
    })();
    if (attribute) {
      contentEl.dataset.motion = attribute;
    } else {
      delete contentEl.dataset.motion;
    }
  });
}
function focusFirst(scope, candidates) {
  const previouslyFocusedElement = scope.getActiveElement();
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement) return true;
    candidate.focus();
    return scope.getActiveElement() !== previouslyFocusedElement;
  });
}
function removeFromTabOrder(candidates) {
  candidates.forEach((candidate) => {
    candidate.dataset.tabindex = candidate.getAttribute("tabindex") || "";
    candidate.setAttribute("tabindex", "-1");
  });
  return () => {
    candidates.forEach((candidate) => {
      const prevTabIndex = candidate.dataset.tabindex;
      candidate.setAttribute("tabindex", prevTabIndex);
    });
  };
}

// src/navigation-menu.connect.ts
function connect(service, normalize) {
  const { context, send, prop, scope } = service;
  const triggerRect = context.get("triggerRect");
  const viewportSize = context.get("viewportSize");
  const viewportPosition = context.get("viewportPosition");
  const value = context.get("value");
  const previousValue = context.get("previousValue");
  const open = Boolean(value);
  const isViewportRendered = context.get("isViewportRendered");
  const preventTransition = value && !previousValue;
  function getItemState(props2) {
    const selected = value === props2.value;
    const wasSelected = !value && previousValue === props2.value;
    return {
      itemId: getItemId(scope, props2.value),
      triggerId: getTriggerId(scope, props2.value),
      triggerProxyId: getTriggerProxyId(scope, props2.value),
      contentId: getContentId(scope, props2.value),
      selected,
      wasSelected,
      open: selected || wasSelected,
      disabled: !!props2.disabled
    };
  }
  return {
    open,
    value,
    orientation: prop("orientation"),
    isViewportRendered,
    getViewportNode() {
      return getViewportEl(scope);
    },
    setValue(value2) {
      send({ type: "VALUE.SET", value: value2 });
    },
    reposition() {
      send({ type: "VIEWPORT.POSITION" });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: getRootId(scope),
        "aria-label": "Main Navigation",
        "data-orientation": prop("orientation"),
        dir: prop("dir"),
        style: {
          "--trigger-width": utils.toPx(triggerRect?.width),
          "--trigger-height": utils.toPx(triggerRect?.height),
          "--trigger-x": utils.toPx(triggerRect?.x),
          "--trigger-y": utils.toPx(triggerRect?.y),
          "--viewport-width": utils.toPx(viewportSize?.width),
          "--viewport-height": utils.toPx(viewportSize?.height),
          "--viewport-x": utils.toPx(viewportPosition?.x),
          "--viewport-y": utils.toPx(viewportPosition?.y)
        }
      });
    },
    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        id: getListId(scope),
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        style: { position: "relative" }
      });
    },
    getItemProps(props2) {
      const itemState = getItemState(props2);
      return normalize.element({
        ...parts.item.attrs,
        id: itemState.itemId,
        dir: prop("dir"),
        "data-value": props2.value,
        "data-state": itemState.open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        onKeyDown(event) {
          switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
            case "ArrowLeft":
            case "ArrowRight":
            case "Home":
            case "End": {
              send({ type: "ITEM.NAVIGATE", value: props2.value, key: event.key });
              event.preventDefault();
              event.stopPropagation();
              break;
            }
          }
        }
      });
    },
    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        style: {
          position: "absolute",
          transition: preventTransition ? "none" : void 0
        }
      });
    },
    getArrowProps() {
      return normalize.element({
        ...parts.arrow.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        "data-orientation": prop("orientation")
      });
    },
    getTriggerProps(props2) {
      const itemState = getItemState(props2);
      return normalize.button({
        ...parts.trigger.attrs,
        id: itemState.triggerId,
        "data-uid": prop("id"),
        "data-trigger-proxy-id": getTriggerProxyId(scope, props2.value),
        dir: prop("dir"),
        disabled: itemState.disabled,
        "data-value": props2.value,
        "data-state": itemState.selected ? "open" : "closed",
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "aria-controls": itemState.contentId,
        "aria-expanded": itemState.selected,
        onPointerEnter(event) {
          if (prop("disableHoverTrigger")) return;
          if (event.pointerType !== "mouse") return;
          if (itemState.disabled) return;
          send({ type: "TRIGGER.POINTERENTER", value: props2.value });
        },
        onPointerLeave(event) {
          if (prop("disableHoverTrigger")) return;
          if (event.pointerType !== "mouse") return;
          if (itemState.disabled) return;
          send({ type: "TRIGGER.POINTERLEAVE", value: props2.value });
        },
        onClick() {
          if (prop("disableClickTrigger")) return;
          send({ type: "TRIGGER.CLICK", value: props2.value });
        },
        onKeyDown(event) {
          const verticalEntryKey = prop("dir") === "rtl" ? "ArrowLeft" : "ArrowRight";
          const entryKey = {
            horizontal: "ArrowDown",
            vertical: verticalEntryKey
          }[prop("orientation")];
          if (open && event.key === entryKey) {
            send({ type: "CONTENT.FOCUS", side: "start" });
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          const elements = getElements(scope);
          const currentElement = event.currentTarget;
          const nextElement = domQuery.navigate(elements, currentElement, {
            key: event.key,
            orientation: prop("orientation"),
            dir: prop("dir"),
            loop: false
          });
          if (nextElement) {
            nextElement.focus();
            event.preventDefault();
            event.stopPropagation();
          }
        }
      });
    },
    getTriggerProxyProps(props2) {
      const itemState = getItemState(props2);
      return normalize.element({
        "aria-hidden": true,
        tabIndex: 0,
        "data-trigger-proxy": "",
        id: itemState.triggerProxyId,
        "data-trigger-id": itemState.triggerId,
        hidden: !itemState.selected,
        style: domQuery.visuallyHiddenStyle,
        onFocus(event) {
          const contentEl = getContentEl(scope, props2.value);
          if (!contentEl) return;
          const prevFocusedEl = event.relatedTarget;
          const wasTriggerFocused = prevFocusedEl === getTriggerEl(scope, props2.value);
          const wasFocusFromContent = domQuery.contains(contentEl, prevFocusedEl);
          if (wasTriggerFocused || !wasFocusFromContent) {
            send({ type: "CONTENT.FOCUS", side: wasTriggerFocused ? "start" : "end" });
          }
        }
      });
    },
    getViewportProxyProps(props2) {
      const itemState = getItemState(props2);
      if (!itemState.selected || !isViewportRendered) {
        return { hidden: true };
      }
      return normalize.element({
        "aria-owns": getContentId(scope, props2.value)
      });
    },
    getLinkProps(props2) {
      const { closeOnClick = true } = props2;
      return normalize.element({
        ...parts.link.attrs,
        dir: prop("dir"),
        "data-value": props2.value,
        "data-current": domQuery.dataAttr(props2.current),
        "aria-current": props2.current ? "page" : void 0,
        "data-ownedby": getContentId(scope, props2.value),
        onClick(event) {
          const target = event.currentTarget;
          const win = domQuery.getWindow(target);
          const onSelect = props2.onSelect;
          target.addEventListener("link.select", onSelect, { once: true });
          const linkSelectEvent = new win.CustomEvent("link.select", {
            bubbles: true,
            cancelable: true,
            detail: { originalEvent: event }
          });
          target.dispatchEvent(linkSelectEvent);
          if (closeOnClick && !linkSelectEvent.defaultPrevented && !event.metaKey) {
            send({ type: "CLOSE" });
          }
        },
        onKeyDown(event) {
          const currentElement = event.currentTarget;
          const contentEl = currentElement.closest('[data-scope="navigation-menu"][data-part="content"]');
          const elements = contentEl ? getLinkEls(scope, props2.value) : getElements(scope);
          const nextElement = domQuery.navigate(elements, currentElement, {
            key: event.key,
            orientation: prop("orientation"),
            dir: prop("dir"),
            loop: false
          });
          if (nextElement) {
            nextElement.focus();
            event.preventDefault();
            event.stopPropagation();
          }
        }
      });
    },
    getContentProps(props2) {
      const itemState = getItemState(props2);
      const currentValue = context.get("value") || context.get("previousValue");
      const selected = isViewportRendered ? currentValue === props2.value : itemState.selected;
      return normalize.element({
        ...parts.content.attrs,
        id: itemState.contentId,
        dir: prop("dir"),
        hidden: !selected,
        "aria-labelledby": itemState.triggerId,
        "data-uid": prop("id"),
        "data-state": selected ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-value": props2.value,
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return;
          send({ type: "CONTENT.POINTERENTER", value: props2.value });
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return;
          send({ type: "CONTENT.POINTERLEAVE", value: props2.value });
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (event.currentTarget.closest("[data-scope=navigation-menu][data-part=root]") !== getRootEl(scope))
            return;
          const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
          const isTabKey = event.key === "Tab" && !isMetaKey;
          const candidates = domQuery.getTabbables(event.currentTarget);
          if (isTabKey) {
            const focusedElement = scope.getActiveElement();
            const index = candidates.findIndex((candidate) => candidate === focusedElement);
            const isMovingBackwards = event.shiftKey;
            const nextCandidates = isMovingBackwards ? candidates.slice(0, index).reverse() : candidates.slice(index + 1, candidates.length);
            if (focusFirst(scope, nextCandidates)) {
              event.preventDefault();
            } else {
              getTriggerProxyEl(scope, props2.value)?.focus();
              return;
            }
          }
          if (!domQuery.isSelfTarget(event)) return;
          const el = domQuery.navigate(candidates, scope.getActiveElement(), {
            key: event.key,
            dir: prop("dir"),
            loop: false
          });
          if (el) {
            el.focus();
            event.preventDefault();
            event.stopPropagation();
          }
        }
      });
    },
    getViewportPositionerProps(props2 = {}) {
      const { align = "center" } = props2;
      return normalize.element({
        ...parts.viewportPositioner.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-align": align
      });
    },
    getViewportProps(props2 = {}) {
      const { align = "center" } = props2;
      const open2 = Boolean(value);
      return normalize.element({
        ...parts.viewport.attrs,
        id: getViewportId(scope),
        dir: prop("dir"),
        hidden: !open2,
        "data-state": open2 ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-align": align,
        style: {
          transition: preventTransition ? "none" : void 0,
          pointerEvents: !open2 ? "none" : void 0,
          "--viewport-width": utils.toPx(viewportSize?.width),
          "--viewport-height": utils.toPx(viewportSize?.height),
          "--viewport-x": utils.toPx(viewportPosition?.x),
          "--viewport-y": utils.toPx(viewportPosition?.y)
        },
        onPointerEnter() {
          send({ type: "CONTENT.POINTERENTER" });
        },
        onPointerLeave(event) {
          if (prop("disablePointerLeaveClose")) return;
          if (event.pointerType !== "mouse") return;
          send({ type: "CONTENT.POINTERLEAVE" });
        }
      });
    },
    getItemState,
    getItemIndicatorProps(props2) {
      const itemState = getItemState(props2);
      return normalize.element({
        ...parts.itemIndicator.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        hidden: !itemState.selected,
        "data-state": itemState.selected ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-value": props2.value
      });
    }
  };
}

// src/navigation-menu.utils.ts
function setCloseTimeout(refs, context, prop) {
  clearCloseTimeout(refs);
  const closeTimeoutId = window.setTimeout(() => {
    context.set("value", "");
  }, prop("closeDelay"));
  refs.set("closeTimeoutId", closeTimeoutId);
}
function clearCloseTimeout(refs) {
  const closeTimeoutId = refs.get("closeTimeoutId");
  if (closeTimeoutId) {
    clearTimeout(closeTimeoutId);
    refs.set("closeTimeoutId", null);
  }
}
function setOpenTimeout(refs, value, timeoutId) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  refs.set("openTimeoutIds", {
    ...openTimeoutIds,
    [value]: timeoutId
  });
}
function clearOpenTimeout(refs, value) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  const timeoutId = openTimeoutIds[value];
  if (timeoutId) {
    clearTimeout(timeoutId);
    const { [value]: _, ...rest } = openTimeoutIds;
    refs.set("openTimeoutIds", rest);
  }
}
function clearAllOpenTimeouts(refs) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  Object.values(openTimeoutIds).forEach((timeoutId) => {
    if (timeoutId) clearTimeout(timeoutId);
  });
  refs.set("openTimeoutIds", {});
}

// src/navigation-menu.machine.ts
var { createMachine } = core.setup();
var machine = createMachine({
  props({ props: props2 }) {
    utils.ensureProps(props2, ["id"]);
    return {
      dir: "ltr",
      openDelay: 200,
      closeDelay: 300,
      orientation: "horizontal",
      defaultValue: "",
      ...props2
    };
  },
  context({ prop, bindable }) {
    return {
      // value tracking
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        sync: true,
        onChange(value) {
          prop("onValueChange")?.({ value });
        }
      })),
      previousValue: bindable(() => ({
        defaultValue: "",
        sync: true
      })),
      // viewport
      viewportSize: bindable(() => ({
        defaultValue: null,
        sync: true
      })),
      isViewportRendered: bindable(() => ({
        defaultValue: false
      })),
      viewportPosition: bindable(() => ({
        defaultValue: null
      })),
      // nodes
      contentNode: bindable(() => ({
        defaultValue: null
      })),
      triggerRect: bindable(() => ({
        defaultValue: null,
        sync: true
      })),
      triggerNode: bindable(() => ({
        defaultValue: null
      }))
    };
  },
  computed: {
    open: ({ context }) => context.get("value") != null
  },
  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["restoreTabOrder", "setTriggerNode", "syncContentNode", "syncMotionAttribute"]);
    });
  },
  refs() {
    return {
      restoreContentTabOrder: void 0,
      contentResizeObserverCleanup: void 0,
      contentDismissableCleanup: void 0,
      contentExitCompleteCleanup: void 0,
      triggerResizeObserverCleanup: void 0,
      closeTimeoutId: null,
      openTimeoutIds: {}
    };
  },
  entry: ["checkViewportNode"],
  exit: ["cleanupObservers"],
  effects: ["trackDocumentResize"],
  initialState() {
    return "idle";
  },
  on: {
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "VIEWPORT.POSITION": {
      actions: ["setViewportPosition"]
    },
    "TRIGGER.POINTERENTER": {
      actions: ["clearCloseTimeout", "setValueWithDelay"]
    },
    "TRIGGER.POINTERLEAVE": [
      {
        actions: ["setCloseTimeout", "resetValueWithDelay"]
      }
    ],
    "TRIGGER.CLICK": [
      {
        guard: "isItemOpen",
        actions: ["deselectValue"]
      },
      {
        actions: ["selectValue"]
      }
    ],
    "CONTENT.FOCUS": {
      actions: ["restoreTabOrder", "focusFirstTabbableEl"]
    },
    "CONTENT.BLUR": {
      actions: ["removeFromTabOrder"]
    },
    "CONTENT.POINTERENTER": {
      actions: ["clearCloseTimeout"]
    },
    "CONTENT.POINTERLEAVE": {
      actions: ["setCloseTimeout"]
    },
    "ITEM.NAVIGATE": {
      actions: ["focusNextLink"]
    },
    "ITEM.CLOSE": {
      actions: ["focusTrigger", "deselectValue"]
    },
    CLOSE: {
      actions: ["clearAllOpenTimeouts", "deselectValue", "focusTriggerIfNeeded", "removeFromTabOrder"]
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    guards: {
      isItemOpen: ({ context, event }) => context.get("value") === event.value
    },
    effects: {
      trackDocumentResize({ scope, send }) {
        const doc = scope.getDoc();
        return trackResizeObserver([doc.body, getRootEl(scope)], () => {
          send({ type: "VIEWPORT.POSITION" });
        });
      }
    },
    actions: {
      setValue({ context, event }) {
        context.set("value", event.value);
      },
      clearCloseTimeout({ refs }) {
        clearCloseTimeout(refs);
      },
      clearAllOpenTimeouts({ refs }) {
        clearAllOpenTimeouts(refs);
      },
      setCloseTimeout({ refs, context, prop }) {
        setCloseTimeout(refs, context, prop);
      },
      resetValueWithDelay({ event, refs }) {
        clearOpenTimeout(refs, event.value);
      },
      setValueWithDelay({ event, prop, context, refs }) {
        const shouldSkipDelay = context.get("value") !== "";
        const openTimeoutId = window.setTimeout(
          () => {
            setTimeout(() => {
              context.set("previousValue", context.get("value"));
              context.set("value", event.value);
            });
          },
          shouldSkipDelay ? 0 : prop("openDelay")
        );
        setOpenTimeout(refs, event.value, openTimeoutId);
      },
      selectValue: ({ context, event }) => {
        context.set("previousValue", context.get("value"));
        context.set("value", event.value);
      },
      deselectValue: ({ context }) => {
        context.set("value", "");
        context.set("previousValue", "");
      },
      syncContentNode({ context, scope, refs, send }) {
        refs.get("contentResizeObserverCleanup")?.();
        refs.get("contentDismissableCleanup")?.();
        refs.get("contentExitCompleteCleanup")?.();
        const previousValue = context.get("previousValue");
        if (previousValue) {
          const previousContentEl = getContentEl(scope, previousValue);
          const viewportEl = getViewportEl(scope);
          if (previousContentEl) {
            const onExitComplete = () => context.set("previousValue", "");
            refs.set(
              "contentExitCompleteCleanup",
              utils.callAll(
                domQuery.addDomEvent(previousContentEl, "exitcomplete", onExitComplete),
                domQuery.addDomEvent(viewportEl, "exitcomplete", onExitComplete)
              )
            );
          }
        }
        const contentEl = getContentEl(scope, context.get("value"));
        if (!contentEl) return;
        context.set("contentNode", contentEl);
        if (context.get("isViewportRendered")) {
          const contentResizeObserver = trackResizeObserver([contentEl], () => {
            const contentEl2 = getContentEl(scope, context.get("value"));
            if (!contentEl2) return;
            context.set("viewportSize", { width: contentEl2.offsetWidth, height: contentEl2.offsetHeight });
            send({ type: "VIEWPORT.POSITION" });
          });
          refs.set("contentResizeObserverCleanup", contentResizeObserver);
        }
        const getContentEl2 = () => {
          return getViewportEl(scope) || getContentEl(scope, context.get("value"));
        };
        const contentDismissable = dismissable.trackDismissableElement(getContentEl2, {
          defer: true,
          onFocusOutside(event) {
            const target = event.detail.target;
            if (target.matches("[data-scope=navigation-menu][data-part=trigger]") || target.matches("[data-trigger-proxy]")) {
              event.preventDefault();
            }
            if (!event.defaultPrevented) {
              send({ type: "CONTENT.BLUR" });
              if (domQuery.contains(getRootEl(scope), target)) {
                event.preventDefault();
              }
            }
          },
          onPointerDownOutside(event) {
            const target = event.detail.target;
            if (!event.defaultPrevented) {
              const isTrigger = getTriggerEls(scope).some((node) => node.contains(target));
              const isRootViewport = domQuery.contains(getViewportEl(scope), target);
              if (isTrigger || isRootViewport) {
                event.preventDefault();
              }
            }
          },
          onDismiss() {
            send({ type: "CLOSE", value: context.get("value") });
          }
        });
        refs.set("contentDismissableCleanup", contentDismissable);
      },
      setTriggerNode({ context, scope, refs }) {
        refs.get("triggerResizeObserverCleanup")?.();
        const node = getTriggerEl(scope, context.get("value"));
        if (!node) return;
        context.set("triggerNode", node);
        const exec = () => {
          const rect = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight };
          context.set("triggerRect", rect);
        };
        const listEl = getListEl(scope);
        const triggerResizeObserver = trackResizeObserver([node, listEl], exec);
        refs.set("triggerResizeObserverCleanup", triggerResizeObserver);
      },
      syncMotionAttribute({ context, scope }) {
        if (!context.get("isViewportRendered")) return;
        setMotionAttr(scope, context.get("value"), context.get("previousValue"));
      },
      focusFirstTabbableEl({ event, scope, context }) {
        domQuery.raf(() => {
          const value = event.value || context.get("value");
          const candidates = getTabbableEls(scope, value);
          const elements = event.side === "start" ? candidates : candidates.reverse();
          if (elements.length) focusFirst(scope, elements);
        });
      },
      focusNextLink({ event, scope }) {
        const activeEl = scope.getActiveElement();
        const linkEls = getLinkEls(scope, event.value);
        if (activeEl == null || !linkEls.includes(activeEl)) return;
        const el = domQuery.navigate(linkEls, activeEl, { key: event.key, loop: false });
        el?.focus();
      },
      focusTrigger({ scope, event, context }) {
        const value = event.value ?? context.get("value");
        getTriggerEl(scope, value)?.focus();
      },
      focusTriggerIfNeeded({ event, scope }) {
        const value = event.value;
        const contentEl = getContentEl(scope, value);
        if (!domQuery.contains(contentEl, scope.getActiveElement())) return;
        getTriggerEl(scope, value)?.focus();
      },
      removeFromTabOrder({ event, scope, refs, context }) {
        const value = event.value ?? context.get("value");
        const candidates = getTabbableEls(scope, value);
        if (candidates.length) refs.set("restoreContentTabOrder", removeFromTabOrder(candidates));
      },
      restoreTabOrder({ refs }) {
        refs.get("restoreContentTabOrder")?.();
      },
      cleanupObservers({ refs }) {
        refs.get("contentResizeObserverCleanup")?.();
        refs.get("contentDismissableCleanup")?.();
        refs.get("triggerResizeObserverCleanup")?.();
        refs.get("restoreContentTabOrder")?.();
        refs.get("contentExitCompleteCleanup")?.();
      },
      checkViewportNode({ context, scope }) {
        context.set("isViewportRendered", !!getViewportEl(scope));
      },
      setViewportPosition({ context, scope }) {
        const triggerNode = context.get("triggerNode");
        const contentNode = context.get("contentNode");
        const rootEl = getRootEl(scope);
        const doc = scope.getDoc();
        const viewportEl = getViewportEl(scope);
        const align = viewportEl?.dataset.align || "center";
        if (contentNode && triggerNode && rootEl) {
          const bodyWidth = doc.documentElement.offsetWidth;
          const bodyHeight = doc.documentElement.offsetHeight;
          const rootRect = rootEl.getBoundingClientRect();
          const triggerRect = triggerNode.getBoundingClientRect();
          const { offsetWidth, offsetHeight } = contentNode;
          const startPositionLeft = triggerRect.left - rootRect.left;
          const startPositionTop = triggerRect.top - rootRect.top;
          let x = null;
          let y = null;
          switch (align) {
            case "start":
              x = startPositionLeft;
              y = startPositionTop;
              break;
            case "end":
              x = startPositionLeft - offsetWidth + triggerRect.width;
              y = startPositionTop - offsetHeight + triggerRect.height;
              break;
            default:
              x = startPositionLeft - offsetWidth / 2 + triggerRect.width / 2;
              y = startPositionTop - offsetHeight / 2 + triggerRect.height / 2;
          }
          const screenOffset = 10;
          if (x + rootRect.left < screenOffset) {
            x = screenOffset - rootRect.left;
          }
          const rightOffset = x + rootRect.left + offsetWidth;
          if (rightOffset > bodyWidth - screenOffset) {
            x -= rightOffset - bodyWidth + screenOffset;
            if (x < screenOffset - rootRect.left) {
              x = screenOffset - rootRect.left;
            }
          }
          if (y + rootRect.top < screenOffset) {
            y = screenOffset - rootRect.top;
          }
          const bottomOffset = y + rootRect.top + offsetHeight;
          if (bottomOffset > bodyHeight - screenOffset) {
            y -= bottomOffset - bodyHeight + screenOffset;
            if (y < screenOffset - rootRect.top) {
              y = screenOffset - rootRect.top;
            }
          }
          x = Math.round(x);
          y = Math.round(y);
          context.set("viewportPosition", { x, y });
        }
      }
    }
  }
});
var props = types.createProps()([
  "id",
  "dir",
  "getRootNode",
  "value",
  "defaultValue",
  "onValueChange",
  "openDelay",
  "closeDelay",
  "orientation",
  "ids",
  "disableClickTrigger",
  "disableHoverTrigger",
  "disablePointerLeaveClose"
]);
var splitProps = utils.createSplitProps(props);

exports.anatomy = anatomy;
exports.connect = connect;
exports.machine = machine;
exports.props = props;
exports.splitProps = splitProps;
