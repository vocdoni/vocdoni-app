import { createAnatomy } from '@zag-js/anatomy';
import { raf, resizeObserverBorderBox, addDomEvent, getEventTarget, getEventPoint, isLeftClick } from '@zag-js/dom-query';
import { createSplitProps, toPx } from '@zag-js/utils';
import { ariaHidden } from '@zag-js/aria-hidden';
import { createMachine } from '@zag-js/core';
import { trackDismissableElement } from '@zag-js/dismissable';
import { trapFocus } from '@zag-js/focus-trap';
import { preventBodyScroll } from '@zag-js/remove-scroll';
import { createProps } from '@zag-js/types';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var anatomy = createAnatomy("bottom-sheet").parts(
  "content",
  "title",
  "trigger",
  "backdrop",
  "grabber",
  "grabberIndicator",
  "closeTrigger"
);
var parts = anatomy.build();
var getContentId = (ctx) => ctx.ids?.content ?? `bottom-sheet:${ctx.id}:content`;
var getTitleId = (ctx) => ctx.ids?.title ?? `bottom-sheet:${ctx.id}:title`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `bottom-sheet:${ctx.id}:trigger`;
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `bottom-sheet:${ctx.id}:backdrop`;
var getGrabberId = (ctx) => ctx.ids?.grabber ?? `bottom-sheet:${ctx.id}:grabber`;
var getGrabberIndicatorId = (ctx) => ctx.ids?.grabberIndicator ?? `bottom-sheet:${ctx.id}:grabber-indicator`;
var getCloseTriggerId = (ctx) => ctx.ids?.closeTrigger ?? `bottom-sheet:${ctx.id}:close-trigger`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getCloseTriggerEl = (ctx) => ctx.getById(getCloseTriggerId(ctx));

// src/bottom-sheet.connect.ts
function connect(service, normalize) {
  const { state, send, context, scope, prop } = service;
  const open = state.hasTag("open");
  const dragOffset = context.get("dragOffset");
  const dragging = dragOffset !== null;
  const activeSnapPoint = context.get("activeSnapPoint");
  const resolvedActiveSnapPoint = context.get("resolvedActiveSnapPoint");
  const translate = dragOffset ?? resolvedActiveSnapPoint?.offset;
  function onPointerDown(event) {
    if (!isLeftClick(event)) return;
    const target = getEventTarget(event);
    if (target?.hasAttribute("data-no-drag") || target?.closest("[data-no-drag]")) return;
    if (state.matches("closing")) return;
    send({ type: "POINTER_DOWN", point: getEventPoint(event) });
  }
  return {
    open,
    dragging,
    setOpen(nextOpen) {
      const open2 = state.hasTag("open");
      if (open2 === nextOpen) return;
      send({ type: nextOpen ? "OPEN" : "CLOSE" });
    },
    snapPoints: prop("snapPoints"),
    activeSnapPoint,
    setActiveSnapPoint(snapPoint) {
      const activeSnapPoint2 = context.get("activeSnapPoint");
      if (activeSnapPoint2 === snapPoint) return;
      send({ type: "ACTIVE_SNAP_POINT.SET", snapPoint });
    },
    getOpenPercentage() {
      if (!open) return 0;
      const contentHeight = context.get("contentHeight");
      if (!contentHeight) return 0;
      const currentOffset = translate ?? 0;
      return Math.max(0, Math.min(1, 1 - currentOffset / contentHeight));
    },
    getActiveSnapIndex() {
      const snapPoints = prop("snapPoints");
      return snapPoints.indexOf(activeSnapPoint);
    },
    getContentHeight() {
      return context.get("contentHeight");
    },
    getContentProps(props2 = { draggable: true }) {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: getContentId(scope),
        tabIndex: -1,
        role: "dialog",
        "aria-modal": prop("modal"),
        "aria-labelledby": getTitleId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          transform: "translate3d(0, var(--bottom-sheet-translate, 0), 0)",
          transitionDuration: dragging ? "0s" : void 0,
          "--bottom-sheet-translate": toPx(translate),
          willChange: "transform"
        },
        onPointerDown(event) {
          if (!props2.draggable) return;
          onPointerDown(event);
        }
      });
    },
    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: getTitleId(scope),
        dir: prop("dir")
      });
    },
    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: getTriggerId(scope),
        type: "button",
        onClick() {
          send({ type: open ? "CLOSE" : "OPEN" });
        }
      });
    },
    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: getBackdropId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          willChange: "opacity"
        }
      });
    },
    getGrabberProps() {
      return normalize.element({
        ...parts.grabber.attrs,
        id: getGrabberId(scope),
        onPointerDown(event) {
          onPointerDown(event);
        },
        style: {
          touchAction: "none"
        }
      });
    },
    getGrabberIndicatorProps() {
      return normalize.element({
        ...parts.grabberIndicator.attrs,
        id: getGrabberIndicatorId(scope)
      });
    },
    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        id: getCloseTriggerId(scope),
        onClick() {
          send({ type: "CLOSE" });
        }
      });
    }
  };
}

// src/utils/find-closest-snap-point.ts
function findClosestSnapPoint(offset, snapPoints) {
  return snapPoints.reduce((acc, curr) => {
    const closestDiff = Math.abs(offset - acc.offset);
    const currentDiff = Math.abs(offset - curr.offset);
    return currentDiff < closestDiff ? curr : acc;
  });
}

// src/utils/get-scroll-info.ts
function isScrollContainer(element) {
  const styles = getComputedStyle(element);
  const overflow = styles.overflowY;
  return overflow === "auto" || overflow === "scroll";
}
function getScrollInfo(target, container) {
  let element = target;
  let availableScroll = 0;
  let availableScrollTop = 0;
  while (element) {
    const { clientHeight, scrollTop, scrollHeight } = element;
    const scrolled = scrollHeight - scrollTop - clientHeight;
    if ((scrollTop !== 0 || scrolled !== 0) && isScrollContainer(element)) {
      availableScroll += scrolled;
      availableScrollTop += scrollTop;
    }
    if (element === container || element === document.documentElement) break;
    element = element.parentNode;
  }
  return {
    availableScroll,
    availableScrollTop
  };
}

// src/utils/drag-manager.ts
var DRAG_START_THRESHOLD = 0.3;
var DragManager = class {
  constructor() {
    __publicField(this, "pointerStart", null);
    __publicField(this, "dragOffset", null);
    __publicField(this, "lastPoint", null);
    __publicField(this, "lastTimestamp", null);
    __publicField(this, "velocity", null);
  }
  setPointerStart(point) {
    this.pointerStart = point;
  }
  clearPointerStart() {
    this.pointerStart = null;
  }
  getPointerStart() {
    return this.pointerStart;
  }
  setDragOffset(point, resolvedActiveSnapPointOffset) {
    if (!this.pointerStart) return;
    const currentTimestamp = (/* @__PURE__ */ new Date()).getTime();
    if (this.lastPoint) {
      const dy = point.y - this.lastPoint.y;
      if (this.lastTimestamp) {
        const dt = currentTimestamp - this.lastTimestamp;
        if (dt > 0) {
          const calculatedVelocity = dy / dt * 1e3;
          this.velocity = Number.isFinite(calculatedVelocity) ? calculatedVelocity : 0;
        }
      }
    }
    this.lastPoint = point;
    this.lastTimestamp = currentTimestamp;
    let delta = this.pointerStart.y - point.y - resolvedActiveSnapPointOffset;
    if (delta > 0) delta = 0;
    this.dragOffset = -delta;
  }
  getDragOffset() {
    return this.dragOffset;
  }
  clearDragOffset() {
    this.dragOffset = null;
  }
  getVelocity() {
    return this.velocity;
  }
  clearVelocityTracking() {
    this.lastPoint = null;
    this.lastTimestamp = null;
    this.velocity = null;
  }
  clear() {
    this.clearPointerStart();
    this.clearDragOffset();
    this.clearVelocityTracking();
  }
  shouldStartDragging(point, target, container, preventDragOnScroll) {
    if (!this.pointerStart || !container) return false;
    if (preventDragOnScroll) {
      const delta = this.pointerStart.y - point.y;
      if (Math.abs(delta) < DRAG_START_THRESHOLD) return false;
      const { availableScroll, availableScrollTop } = getScrollInfo(target, container);
      if (delta > 0 && Math.abs(availableScroll) > 1 || delta < 0 && Math.abs(availableScrollTop) > 0) {
        return false;
      }
    }
    return true;
  }
  findClosestSnapPoint(snapPoints) {
    if (this.dragOffset === null) {
      return snapPoints[0]?.value ?? 1;
    }
    const closest = findClosestSnapPoint(this.dragOffset, snapPoints);
    return closest.value;
  }
  shouldDismiss(contentHeight, snapPoints, swipeVelocityThreshold, closeThreshold) {
    if (this.dragOffset === null || this.velocity === null || contentHeight === null) return false;
    const visibleHeight = contentHeight - this.dragOffset;
    const smallestSnapPoint = snapPoints.reduce((acc, curr) => curr.offset > acc.offset ? curr : acc);
    const isFastSwipe = this.velocity > 0 && this.velocity >= swipeVelocityThreshold;
    const closeThresholdInPixels = contentHeight * (1 - closeThreshold);
    const isBelowSmallestSnapPoint = visibleHeight < contentHeight - smallestSnapPoint.offset;
    const isBelowCloseThreshold = visibleHeight < closeThresholdInPixels;
    const hasEnoughDragToDismiss = isBelowCloseThreshold && isBelowSmallestSnapPoint || visibleHeight === 0;
    return isFastSwipe || hasEnoughDragToDismiss;
  }
};

// src/utils/resolve-snap-point.ts
function resolveSnapPoint(snapPoint, containerHeight) {
  if (typeof snapPoint === "number") {
    return {
      value: snapPoint,
      offset: containerHeight - snapPoint * containerHeight
    };
  }
  if (typeof snapPoint === "string") {
    return {
      value: snapPoint,
      offset: containerHeight - parseFloat(snapPoint)
    };
  }
  throw new Error(`Invalid snap point: ${snapPoint}`);
}

// src/bottom-sheet.machine.ts
var machine = createMachine({
  props({ props: props2, scope }) {
    const alertDialog = props2.role === "alertdialog";
    const initialFocusEl = alertDialog ? () => getCloseTriggerEl(scope) : void 0;
    const modal = typeof props2.modal === "boolean" ? props2.modal : true;
    return {
      modal,
      trapFocus: modal,
      preventScroll: modal,
      closeOnInteractOutside: true,
      closeOnEscape: true,
      restoreFocus: true,
      initialFocusEl,
      snapPoints: [1],
      defaultActiveSnapPoint: 1,
      swipeVelocityThreshold: 700,
      closeThreshold: 0.25,
      preventDragOnScroll: true,
      ...props2
    };
  },
  context({ bindable, prop }) {
    return {
      dragOffset: bindable(() => ({
        defaultValue: null
      })),
      activeSnapPoint: bindable(() => ({
        defaultValue: prop("defaultActiveSnapPoint"),
        value: prop("activeSnapPoint"),
        onChange(value) {
          return prop("onActiveSnapPointChange")?.({ snapPoint: value });
        }
      })),
      resolvedActiveSnapPoint: bindable(() => ({
        defaultValue: null
      })),
      contentHeight: bindable(() => ({
        defaultValue: null
      }))
    };
  },
  refs() {
    return {
      dragManager: new DragManager()
    };
  },
  computed: {
    resolvedSnapPoints({ context, prop }) {
      const contentHeight = context.get("contentHeight");
      if (contentHeight === null) return [];
      return prop("snapPoints").map((snapPoint) => resolveSnapPoint(snapPoint, contentHeight));
    }
  },
  watch({ track, context, prop, action }) {
    track([() => context.get("activeSnapPoint"), () => context.get("contentHeight")], () => {
      const activeSnapPoint = context.get("activeSnapPoint");
      const contentHeight = context.get("contentHeight");
      if (contentHeight === null) return;
      const resolvedActiveSnapPoint = resolveSnapPoint(activeSnapPoint, contentHeight);
      context.set("resolvedActiveSnapPoint", resolvedActiveSnapPoint);
    });
    track([() => prop("open")], () => {
      action(["toggleVisibility"]);
    });
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "open" : "closed";
  },
  on: {
    "ACTIVE_SNAP_POINT.SET": {
      actions: ["setActiveSnapPoint"]
    }
  },
  states: {
    open: {
      tags: ["open"],
      effects: [
        "trackDismissableElement",
        "preventScroll",
        "trapFocus",
        "hideContentBelow",
        "trackPointerMove",
        "trackContentHeight"
      ],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed"
        },
        POINTER_DOWN: {
          actions: ["setPointerStart"]
        },
        POINTER_MOVE: [
          {
            guard: "isDragging",
            actions: ["setDragOffset"]
          },
          {
            guard: "shouldStartDragging",
            actions: ["setDragOffset"]
          }
        ],
        POINTER_UP: [
          {
            guard: "shouldCloseOnSwipe",
            target: "closing"
          },
          {
            guard: "isDragging",
            actions: ["setClosestSnapPoint", "clearPointerStart", "clearDragOffset"]
          },
          {
            actions: ["clearPointerStart", "clearDragOffset"]
          }
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "closing",
            actions: ["invokeOnClose"]
          }
        ]
      }
    },
    closing: {
      effects: ["trackExitAnimation"],
      on: {
        ANIMATION_END: {
          target: "closed",
          actions: [
            "invokeOnClose",
            "clearPointerStart",
            "clearDragOffset",
            "clearActiveSnapPoint",
            "clearResolvedActiveSnapPoint",
            "clearContentHeight",
            "clearVelocityTracking"
          ]
        }
      }
    },
    closed: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open"
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"]
          },
          {
            target: "open",
            actions: ["invokeOnOpen"]
          }
        ]
      }
    }
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") !== void 0,
      isDragging({ context }) {
        return context.get("dragOffset") !== null;
      },
      shouldStartDragging({ prop, refs, event, scope }) {
        const dragManager = refs.get("dragManager");
        return dragManager.shouldStartDragging(
          event.point,
          event.target,
          getContentEl(scope),
          prop("preventDragOnScroll")
        );
      },
      shouldCloseOnSwipe({ prop, context, computed, refs }) {
        const dragManager = refs.get("dragManager");
        return dragManager.shouldDismiss(
          context.get("contentHeight"),
          computed("resolvedSnapPoints"),
          prop("swipeVelocityThreshold"),
          prop("closeThreshold")
        );
      }
    },
    actions: {
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true });
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false });
      },
      setActiveSnapPoint({ context, event }) {
        context.set("activeSnapPoint", event.snapPoint);
      },
      setPointerStart({ event, refs }) {
        refs.get("dragManager").setPointerStart(event.point);
      },
      setDragOffset({ context, event, refs }) {
        const dragManager = refs.get("dragManager");
        dragManager.setDragOffset(event.point, context.get("resolvedActiveSnapPoint")?.offset || 0);
        context.set("dragOffset", dragManager.getDragOffset());
      },
      setClosestSnapPoint({ computed, context, refs }) {
        const snapPoints = computed("resolvedSnapPoints");
        const contentHeight = context.get("contentHeight");
        if (!snapPoints.length || contentHeight === null) return;
        const dragManager = refs.get("dragManager");
        const closestSnapPoint = dragManager.findClosestSnapPoint(snapPoints);
        context.set("activeSnapPoint", closestSnapPoint);
        const resolved = resolveSnapPoint(closestSnapPoint, contentHeight);
        context.set("resolvedActiveSnapPoint", resolved);
      },
      clearDragOffset({ context, refs }) {
        refs.get("dragManager").clearDragOffset();
        context.set("dragOffset", null);
      },
      clearActiveSnapPoint({ context, prop }) {
        context.set("activeSnapPoint", prop("defaultActiveSnapPoint"));
      },
      clearResolvedActiveSnapPoint({ context }) {
        context.set("resolvedActiveSnapPoint", null);
      },
      clearPointerStart({ refs }) {
        refs.get("dragManager").clearPointerStart();
      },
      clearContentHeight({ context }) {
        context.set("contentHeight", null);
      },
      clearVelocityTracking({ refs }) {
        refs.get("dragManager").clearVelocityTracking();
      },
      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event });
      }
    },
    effects: {
      trackDismissableElement({ scope, prop, send }) {
        const getContentEl2 = () => getContentEl(scope);
        return trackDismissableElement(getContentEl2, {
          defer: true,
          exclude: [getTriggerEl(scope)],
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event);
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault();
            }
          },
          onFocusOutside: prop("onFocusOutside"),
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event);
            if (!prop("closeOnEscape")) {
              event.preventDefault();
            }
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" });
          }
        });
      },
      preventScroll({ scope, prop }) {
        if (!prop("preventScroll")) return;
        return preventBodyScroll(scope.getDoc());
      },
      trapFocus({ scope, prop }) {
        if (!prop("trapFocus")) return;
        const contentEl = () => getContentEl(scope);
        return trapFocus(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: prop("initialFocusEl"),
          setReturnFocus: (el) => prop("finalFocusEl")?.() || el,
          getShadowRoot: true
        });
      },
      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return;
        const getElements = () => [getContentEl(scope)];
        return ariaHidden(getElements, { defer: true });
      },
      trackPointerMove({ scope, send, prop }) {
        let lastY = 0;
        function onPointerMove(event) {
          const point = getEventPoint(event);
          const target = getEventTarget(event);
          send({ type: "POINTER_MOVE", point, target });
        }
        function onPointerUp(event) {
          if (event.pointerType === "touch") return;
          const point = getEventPoint(event);
          send({ type: "POINTER_UP", point });
        }
        function onTouchStart(event) {
          if (!event.touches[0]) return;
          lastY = event.touches[0].clientY;
        }
        function onTouchMove(event) {
          if (!event.touches[0]) return;
          const point = getEventPoint(event);
          const target = event.target;
          if (!prop("preventDragOnScroll")) {
            send({ type: "POINTER_MOVE", point, target });
            return;
          }
          const contentEl = getContentEl(scope);
          if (!contentEl) return;
          let el = target;
          while (el && el !== contentEl && el.scrollHeight <= el.clientHeight) {
            el = el.parentElement;
          }
          if (el && el !== contentEl) {
            const scrollTop = el.scrollTop;
            const y = event.touches[0].clientY;
            const atTop = scrollTop <= 0;
            if (atTop && y > lastY) {
              event.preventDefault();
            }
            lastY = y;
          }
          send({ type: "POINTER_MOVE", point, target });
        }
        function onTouchEnd(event) {
          if (event.touches.length !== 0) return;
          const point = getEventPoint(event);
          send({ type: "POINTER_UP", point });
        }
        const doc = scope.getDoc();
        const cleanups = [
          addDomEvent(doc, "pointermove", onPointerMove),
          addDomEvent(doc, "pointerup", onPointerUp),
          addDomEvent(doc, "touchstart", onTouchStart, { passive: false }),
          addDomEvent(doc, "touchmove", onTouchMove, { passive: false }),
          addDomEvent(doc, "touchend", onTouchEnd)
        ];
        return () => {
          cleanups.forEach((cleanup) => cleanup());
        };
      },
      trackContentHeight({ context, scope }) {
        const contentEl = getContentEl(scope);
        if (!contentEl) return;
        const updateHeight = () => {
          const rect = contentEl.getBoundingClientRect();
          context.set("contentHeight", rect.height);
        };
        updateHeight();
        return resizeObserverBorderBox.observe(contentEl, updateHeight);
      },
      trackExitAnimation({ send, scope }) {
        let cleanup;
        const rafCleanup = raf(() => {
          const contentEl = getContentEl(scope);
          if (!contentEl) return;
          const animationName = getComputedStyle(contentEl).animationName;
          const hasNoAnimation = !animationName || animationName === "none";
          if (hasNoAnimation) {
            send({ type: "ANIMATION_END" });
            return;
          }
          const onEnd = (event) => {
            const target = getEventTarget(event);
            if (target === contentEl) {
              send({ type: "ANIMATION_END" });
            }
          };
          contentEl.addEventListener("animationend", onEnd);
          cleanup = () => {
            contentEl.removeEventListener("animationend", onEnd);
          };
        });
        return () => {
          rafCleanup();
          cleanup?.();
        };
      }
    }
  }
});
var props = createProps()([
  "id",
  "ids",
  "dir",
  "modal",
  "initialFocusEl",
  "finalFocusEl",
  "open",
  "defaultOpen",
  "getRootNode",
  "snapPoints",
  "swipeVelocityThreshold",
  "closeThreshold",
  "preventDragOnScroll",
  "closeOnEscape",
  "closeOnInteractOutside",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus",
  "defaultActiveSnapPoint",
  "activeSnapPoint",
  "onActiveSnapPointChange"
]);
var splitProps = createSplitProps(props);

export { anatomy, connect, machine, props, splitProps };
