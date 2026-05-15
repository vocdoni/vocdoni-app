'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var core = require('@zag-js/core');
var domQuery = require('@zag-js/dom-query');
var popper = require('@zag-js/popper');
var dismissable = require('@zag-js/dismissable');
var focusTrap = require('@zag-js/focus-trap');
var interactOutside = require('@zag-js/interact-outside');
var utils = require('@zag-js/utils');
var types = require('@zag-js/types');

// src/tour.anatomy.ts
var anatomy = anatomy$1.createAnatomy("tour").parts(
  "content",
  "actionTrigger",
  "closeTrigger",
  "progressText",
  "title",
  "description",
  "positioner",
  "arrow",
  "arrowTip",
  "backdrop",
  "spotlight"
);
var parts = anatomy.build();
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `tour-positioner-${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `tour-content-${ctx.id}`;
var getTitleId = (ctx) => ctx.ids?.title ?? `tour-title-${ctx.id}`;
var getDescriptionId = (ctx) => ctx.ids?.description ?? `tour-desc-${ctx.id}`;
var getArrowId = (ctx) => ctx.ids?.arrow ?? `tour-arrow-${ctx.id}`;
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `tour-backdrop-${ctx.id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getBackdropEl = (ctx) => ctx.getById(getBackdropId(ctx));
function syncZIndex(scope) {
  return domQuery.raf(() => {
    const contentEl = getContentEl(scope);
    if (!contentEl) return;
    const styles = domQuery.getComputedStyle(contentEl);
    const positionerEl = getPositionerEl(scope);
    const backdropEl = getBackdropEl(scope);
    if (positionerEl) {
      positionerEl.style.setProperty("--z-index", styles.zIndex);
      positionerEl.style.setProperty("z-index", "var(--z-index)");
    }
    if (backdropEl) {
      backdropEl.style.setProperty("--z-index", styles.zIndex);
    }
  });
}

// src/utils/clip-path.ts
function getClipPath(options) {
  const {
    radius = 0,
    rootSize: { width: w, height: h },
    rect: { width, height, x, y },
    enabled = true
  } = options;
  if (!enabled) return "";
  const {
    topLeft = 0,
    topRight = 0,
    bottomRight = 0,
    bottomLeft = 0
  } = typeof radius === "number" ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius } : radius;
  return `M${w},${h}  H0  V0  H${w}  V${h}  Z  M${x + topLeft},${y}  a${topLeft},${topLeft},0,0,0-${topLeft},${topLeft}  V${height + y - bottomLeft}  a${bottomLeft},${bottomLeft},0,0,0,${bottomLeft},${bottomLeft}  H${width + x - bottomRight}  a${bottomRight},${bottomRight},0,0,0,${bottomRight}-${bottomRight}  V${y + topRight}  a${topRight},${topRight},0,0,0-${topRight}-${topRight}  Z`;
}

// src/utils/step.ts
var isTooltipStep = (step) => {
  return step?.type === "tooltip";
};
var isDialogStep = (step) => {
  return step?.type === "dialog";
};
var isWaitStep = (step) => {
  return step?.type === "wait";
};
var getEffectiveSteps = (steps) => {
  return steps.filter((step) => step.type !== "wait");
};
var getProgress = (steps, stepIndex) => {
  const effectiveLength = getEffectiveSteps(steps).length;
  return (stepIndex + 1) / effectiveLength;
};
var getEffectiveStepIndex = (steps, stepId) => {
  const effectiveSteps = getEffectiveSteps(steps);
  return findStepIndex(effectiveSteps, stepId);
};
var isTooltipPlacement = (placement) => {
  return placement != null && placement != "center";
};
var normalizeStep = (step) => {
  if (step.type === "floating") {
    return { backdrop: false, arrow: false, placement: "bottom-end", ...step };
  }
  if (step.target == null || step.type === "dialog") {
    return { type: "dialog", placement: "center", backdrop: true, ...step };
  }
  if (!step.type || step.type === "tooltip") {
    return { type: "tooltip", arrow: true, backdrop: true, ...step };
  }
  return step;
};
var findStep = (steps, id) => {
  const res = id != null ? steps.find((step) => step.id === id) : null;
  return res ? normalizeStep(res) : null;
};
var findStepIndex = (steps, id) => {
  return id != null ? steps.findIndex((step) => step.id === id) : -1;
};

// src/tour.connect.ts
function connect(service, normalize) {
  const { state, context, computed, send, prop, scope } = service;
  const open = state.hasTag("open");
  const steps = Array.from(context.get("steps"));
  const stepIndex = computed("stepIndex");
  const step = computed("step");
  const hasTarget = typeof step?.target?.() !== "undefined";
  const hasNextStep = computed("hasNextStep");
  const hasPrevStep = computed("hasPrevStep");
  const firstStep = computed("isFirstStep");
  const lastStep = computed("isLastStep");
  const placement = context.get("currentPlacement");
  const targetRect = context.get("targetRect");
  const popperStyles = popper.getPlacementStyles({
    strategy: "absolute",
    placement: isTooltipPlacement(placement) ? placement : void 0
  });
  const clipPath = getClipPath({
    enabled: isTooltipStep(step),
    rect: targetRect,
    rootSize: context.get("boundarySize"),
    radius: prop("spotlightRadius")
  });
  const actionMap = {
    next() {
      send({ type: "STEP.NEXT", src: "actionTrigger" });
    },
    prev() {
      send({ type: "STEP.PREV", src: "actionTrigger" });
    },
    dismiss() {
      send({ type: "DISMISS", src: "actionTrigger" });
    },
    skip() {
      send({ type: "SKIP", src: "actionTrigger" });
    },
    goto(id) {
      send({ type: "STEP.SET", value: id, src: "actionTrigger" });
    }
  };
  return {
    open,
    totalSteps: steps.length,
    stepIndex,
    step,
    hasNextStep,
    hasPrevStep,
    firstStep,
    lastStep,
    addStep(step2) {
      const next = steps.concat(step2);
      send({ type: "STEPS.SET", value: next, src: "addStep" });
    },
    removeStep(id) {
      const next = steps.filter((step2) => step2.id !== id);
      send({ type: "STEPS.SET", value: next, src: "removeStep" });
    },
    updateStep(id, stepOverrides) {
      const next = steps.map((step2) => step2.id === id ? core.mergeProps(step2, stepOverrides) : step2);
      send({ type: "STEPS.SET", value: next, src: "updateStep" });
    },
    setSteps(steps2) {
      send({ type: "STEPS.SET", value: steps2, src: "setSteps" });
    },
    setStep(id) {
      send({ type: "STEP.SET", value: id });
    },
    start(id) {
      send({ type: "START", value: id });
    },
    isValidStep(id) {
      return steps.some((step2) => step2.id === id);
    },
    isCurrentStep(id) {
      return Boolean(step?.id === id);
    },
    next() {
      send({ type: "STEP.NEXT" });
    },
    prev() {
      send({ type: "STEP.PREV" });
    },
    getProgressPercent() {
      const index = getEffectiveStepIndex(steps, step?.id);
      const total = getEffectiveSteps(steps).length;
      return (index + 1) / total * 100;
    },
    getProgressText() {
      const index = getEffectiveStepIndex(steps, step?.id);
      const total = getEffectiveSteps(steps).length;
      const details = { current: index, total };
      return prop("translations").progressText?.(details) ?? "";
    },
    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: getBackdropId(scope),
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        style: {
          "--tour-layer": 0,
          clipPath: isTooltipStep(step) ? `path("${clipPath}")` : void 0,
          position: "absolute",
          inset: "0",
          willChange: "clip-path"
        }
      });
    },
    getSpotlightProps() {
      return normalize.element({
        ...parts.spotlight.attrs,
        hidden: !open || !step?.target?.(),
        style: {
          "--tour-layer": 1,
          position: "absolute",
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          left: `${targetRect.x}px`,
          top: `${targetRect.y}px`,
          borderRadius: `${prop("spotlightRadius")}px`,
          pointerEvents: "none"
        }
      });
    },
    getProgressTextProps() {
      return normalize.element({
        ...parts.progressText.attrs
      });
    },
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: getPositionerId(scope),
        "data-type": step?.type,
        "data-placement": placement,
        style: {
          "--tour-layer": 2,
          ...step?.type === "tooltip" && popperStyles.floating
        }
      });
    },
    getArrowProps() {
      return normalize.element({
        id: getArrowId(scope),
        ...parts.arrow.attrs,
        dir: prop("dir"),
        hidden: step?.type !== "tooltip",
        style: step?.type === "tooltip" ? popperStyles.arrow : void 0,
        opacity: hasTarget ? void 0 : 0
      });
    },
    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: prop("dir"),
        style: popperStyles.arrowTip
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: getContentId(scope),
        dir: prop("dir"),
        role: "alertdialog",
        "aria-modal": "true",
        "aria-live": "polite",
        "aria-atomic": "true",
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        "data-placement": placement,
        "data-step": step?.id,
        "aria-labelledby": getTitleId(scope),
        "aria-describedby": getDescriptionId(scope),
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (!prop("keyboardNavigation")) return;
          const isRtl = prop("dir") === "rtl";
          switch (event.key) {
            case "ArrowRight":
              if (!hasNextStep) return;
              send({ type: isRtl ? "STEP.PREV" : "STEP.NEXT", src: "keydown" });
              break;
            case "ArrowLeft":
              if (!hasPrevStep) return;
              send({ type: isRtl ? "STEP.NEXT" : "STEP.PREV", src: "keydown" });
              break;
          }
        }
      });
    },
    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: getTitleId(scope),
        "data-placement": hasTarget ? placement : "center"
      });
    },
    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: getDescriptionId(scope),
        "data-placement": hasTarget ? placement : "center"
      });
    },
    getCloseTriggerProps() {
      return normalize.element({
        ...parts.closeTrigger.attrs,
        "data-type": step?.type,
        "aria-label": prop("translations").close,
        onClick: actionMap.dismiss
      });
    },
    getActionTriggerProps(props2) {
      const { action, attrs } = props2.action;
      let actionProps = {};
      switch (action) {
        case "next":
          actionProps = {
            "data-type": "next",
            disabled: !hasNextStep,
            "data-disabled": domQuery.dataAttr(!hasNextStep),
            "aria-label": prop("translations").nextStep,
            onClick: actionMap.next
          };
          break;
        case "prev":
          actionProps = {
            "data-type": "prev",
            disabled: !hasPrevStep,
            "data-disabled": domQuery.dataAttr(!hasPrevStep),
            "aria-label": prop("translations").prevStep,
            onClick: actionMap.prev
          };
          break;
        case "dismiss":
          actionProps = {
            "data-type": "close",
            "aria-label": prop("translations").close,
            onClick: actionMap.dismiss
          };
          break;
        default:
          actionProps = {
            "data-type": "custom",
            onClick() {
              if (typeof action === "function") {
                action(actionMap);
              }
            }
          };
          break;
      }
      return normalize.button({
        ...parts.actionTrigger.attrs,
        type: "button",
        ...attrs,
        ...actionProps
      });
    }
  };
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
var normalizeEventPoint = (event) => {
  let clientX = event.clientX;
  let clientY = event.clientY;
  let win = event.view || window;
  let frame = getFrameElement(win);
  while (frame) {
    const iframeRect = frame.getBoundingClientRect();
    const css = getComputedStyle(frame);
    const left = iframeRect.left + (frame.clientLeft + parseFloat(css.paddingLeft));
    const top = iframeRect.top + (frame.clientTop + parseFloat(css.paddingTop));
    clientX += left;
    clientY += top;
    win = domQuery.getWindow(frame);
    frame = getFrameElement(win);
  }
  return { clientX, clientY };
};
function isEventInRect(rect, event) {
  const { clientX, clientY } = normalizeEventPoint(event);
  return rect.y <= clientY && clientY <= rect.y + rect.height && rect.x <= clientX && clientX <= rect.x + rect.width;
}
function offset(r, i) {
  const dx = i.x || 0;
  const dy = i.y || 0;
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy
  };
}

// src/tour.machine.ts
var { and } = core.createGuards();
var machine = core.createMachine({
  props({ props: props2 }) {
    return {
      preventInteraction: false,
      closeOnInteractOutside: true,
      closeOnEscape: true,
      keyboardNavigation: true,
      spotlightOffset: { x: 10, y: 10 },
      spotlightRadius: 4,
      ...props2,
      translations: {
        nextStep: "next step",
        prevStep: "previous step",
        close: "close tour",
        progressText: ({ current, total }) => `${current + 1} of ${total}`,
        skip: "skip tour",
        ...props2.translations
      }
    };
  },
  initialState() {
    return "tour.inactive";
  },
  context({ prop, bindable, getContext }) {
    return {
      steps: bindable(() => ({
        defaultValue: prop("steps") ?? [],
        onChange(value) {
          prop("onStepsChange")?.({ steps: value });
        }
      })),
      stepId: bindable(() => ({
        defaultValue: prop("stepId"),
        sync: true,
        onChange(value) {
          const context = getContext();
          const steps = context.get("steps");
          const stepIndex = findStepIndex(steps, value);
          const progress = getProgress(steps, stepIndex);
          const complete = stepIndex == steps.length - 1;
          prop("onStepChange")?.({ stepId: value, stepIndex, totalSteps: steps.length, complete, progress });
        }
      })),
      resolvedTarget: bindable(() => ({
        sync: true,
        defaultValue: null
      })),
      targetRect: bindable(() => ({
        defaultValue: { width: 0, height: 0, x: 0, y: 0 }
      })),
      boundarySize: bindable(() => ({
        defaultValue: { width: 0, height: 0 }
      })),
      currentPlacement: bindable(() => ({
        defaultValue: void 0
      }))
    };
  },
  computed: {
    stepIndex: ({ context }) => findStepIndex(context.get("steps"), context.get("stepId")),
    step: ({ context }) => findStep(context.get("steps"), context.get("stepId")),
    hasNextStep: ({ context, computed }) => computed("stepIndex") < context.get("steps").length - 1,
    hasPrevStep: ({ computed }) => computed("stepIndex") > 0,
    isFirstStep: ({ computed }) => computed("stepIndex") === 0,
    isLastStep: ({ context, computed }) => computed("stepIndex") === context.get("steps").length - 1,
    progress: ({ context, computed }) => {
      const effectiveLength = getEffectiveSteps(context.get("steps")).length;
      return (computed("stepIndex") + 1) / effectiveLength;
    }
  },
  watch({ track, context, action }) {
    track([() => context.get("stepId")], () => {
      queueMicrotask(() => {
        action(["setResolvedTarget", "raiseStepChange", "syncTargetAttrs"]);
      });
    });
  },
  effects: ["trackBoundarySize"],
  exit: ["cleanupAll"],
  on: {
    "STEPS.SET": {
      actions: ["setSteps", "validateSteps"]
    },
    "STEP.SET": {
      actions: ["setStep"]
    },
    "STEP.NEXT": {
      actions: ["setNextStep"]
    },
    "STEP.PREV": {
      actions: ["setPrevStep"]
    },
    "STEP.CHANGED": [
      {
        guard: and("isValidStep", "hasResolvedTarget"),
        target: "target.scrolling",
        actions: ["cleanupStepEffect"]
      },
      {
        guard: and("isValidStep", "hasTarget"),
        target: "target.resolving",
        actions: ["cleanupStepEffect"]
      },
      {
        guard: and("isValidStep", "isWaitingStep"),
        target: "step.waiting",
        actions: ["cleanupStepEffect"]
      },
      {
        guard: "isValidStep",
        target: "tour.active",
        actions: ["cleanupStepEffect"]
      }
    ],
    DISMISS: [
      {
        guard: "isLastStep",
        target: "tour.inactive",
        actions: ["cleanupAll", "invokeOnDismiss", "invokeOnComplete", "clearStep"]
      },
      {
        target: "tour.inactive",
        actions: ["cleanupAll", "invokeOnDismiss", "clearStep"]
      }
    ],
    SKIP: {
      target: "tour.inactive",
      actions: ["cleanupAll", "invokeOnSkip", "clearStep"]
    }
  },
  states: {
    "tour.inactive": {
      tags: ["closed"],
      entry: ["validateSteps"],
      on: {
        START: {
          actions: ["setInitialStep", "invokeOnStart"]
        }
      }
    },
    "target.resolving": {
      tags: ["closed"],
      effects: ["waitForTarget", "waitForTargetTimeout"],
      on: {
        "TARGET.NOT_FOUND": {
          target: "tour.inactive",
          actions: ["invokeOnNotFound", "clearStep"]
        },
        "TARGET.RESOLVED": {
          target: "target.scrolling",
          actions: ["setResolvedTarget"]
        }
      }
    },
    "target.scrolling": {
      tags: ["open"],
      entry: ["scrollToTarget"],
      effects: [
        "waitForScrollEnd",
        "trapFocus",
        "trackPlacement",
        "trackDismissableBranch",
        "trackInteractOutside",
        "trackEscapeKeydown"
      ],
      on: {
        "SCROLL.END": {
          target: "tour.active"
        }
      }
    },
    "step.waiting": {
      tags: ["closed"]
    },
    "tour.active": {
      tags: ["open"],
      effects: ["trapFocus", "trackPlacement", "trackDismissableBranch", "trackInteractOutside", "trackEscapeKeydown"]
    }
  },
  implementations: {
    guards: {
      isLastStep: ({ computed, context }) => computed("stepIndex") === context.get("steps").length - 1,
      isValidStep: ({ context }) => context.get("stepId") != null,
      hasTarget: ({ computed }) => computed("step")?.target != null,
      hasResolvedTarget: ({ context }) => context.get("resolvedTarget") != null,
      isWaitingStep: ({ computed }) => computed("step")?.type === "wait"
    },
    actions: {
      scrollToTarget({ context }) {
        const node = context.get("resolvedTarget");
        node?.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
      },
      setSteps(params) {
        const { event, context } = params;
        context.set("steps", event.value);
      },
      setStep(params) {
        const { event } = params;
        const step = event.value;
        if (step == null) return;
        const manager = new StepManager(params);
        manager.transitionToStep(step);
      },
      clearStep(params) {
        const manager = new StepManager(params);
        manager.clear();
      },
      setInitialStep(params) {
        const { context, event } = params;
        const steps = context.get("steps");
        if (steps.length === 0) return;
        const manager = new StepManager(params);
        manager.transitionToStep(event.value ?? 0);
      },
      setNextStep(params) {
        const { computed } = params;
        const manager = new StepManager(params);
        manager.next(computed("stepIndex"));
      },
      setPrevStep(params) {
        const { computed } = params;
        const manager = new StepManager(params);
        manager.prev(computed("stepIndex"));
      },
      invokeOnStart({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "started",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex")
        });
      },
      invokeOnDismiss({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "dismissed",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex")
        });
      },
      invokeOnComplete({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "completed",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex")
        });
      },
      invokeOnSkip({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "skipped",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex")
        });
      },
      invokeOnNotFound({ prop, context, computed }) {
        prop("onStatusChange")?.({
          status: "not-found",
          stepId: context.get("stepId"),
          stepIndex: computed("stepIndex")
        });
      },
      raiseStepChange({ send }) {
        send({ type: "STEP.CHANGED" });
      },
      setResolvedTarget({ context, event, computed }) {
        const node = event.node ?? computed("step")?.target?.();
        context.set("resolvedTarget", node ?? null);
      },
      syncTargetAttrs(params) {
        const { context } = params;
        const targetEl = context.get("resolvedTarget");
        const manager = new StepManager(params);
        manager.syncTarget(targetEl);
      },
      cleanupAll(params) {
        const manager = new StepManager(params);
        manager.cleanupAll();
      },
      cleanupStepEffect(params) {
        const manager = new StepManager(params);
        manager.cleanupStepEffect();
      },
      validateSteps({ context }) {
        const ids = /* @__PURE__ */ new Set();
        context.get("steps").forEach((step) => {
          if (ids.has(step.id)) {
            throw new Error(`[zag-js/tour] Duplicate step id: ${step.id}`);
          }
          if (step.target == null && step.type == null) {
            throw new Error(`[zag-js/tour] Step ${step.id} has no target or type. At least one of those is required.`);
          }
          ids.add(step.id);
        });
      }
    },
    effects: {
      waitForScrollEnd({ send }) {
        const id = setTimeout(() => {
          send({ type: "SCROLL.END" });
        }, 100);
        return () => clearTimeout(id);
      },
      waitForTargetTimeout({ send }) {
        const id = setTimeout(() => {
          send({ type: "TARGET.NOT_FOUND" });
        }, 3e3);
        return () => clearTimeout(id);
      },
      waitForTarget({ scope, computed, send }) {
        const step = computed("step");
        if (!step) return;
        const targetEl = step.target;
        const win = scope.getWin();
        const rootNode = scope.getRootNode();
        const observer = new win.MutationObserver(() => {
          const node = targetEl?.();
          if (node) {
            send({ type: "TARGET.RESOLVED", node });
            observer.disconnect();
          }
        });
        observer.observe(rootNode, {
          childList: true,
          subtree: true,
          characterData: true
        });
        return () => {
          observer.disconnect();
        };
      },
      trackBoundarySize({ context, scope }) {
        const win = scope.getWin();
        const doc = scope.getDoc();
        const onResize = () => {
          const width = visualViewport?.width ?? win.innerWidth;
          const height = doc.documentElement.scrollHeight;
          context.set("boundarySize", { width, height });
        };
        onResize();
        const viewport = win.visualViewport ?? win;
        viewport.addEventListener("resize", onResize);
        return () => viewport.removeEventListener("resize", onResize);
      },
      trackEscapeKeydown({ scope, send, prop }) {
        if (!prop("closeOnEscape")) return;
        const doc = scope.getDoc();
        const onKeyDown = (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            send({ type: "DISMISS", src: "esc" });
          }
        };
        doc.addEventListener("keydown", onKeyDown, true);
        return () => {
          doc.removeEventListener("keydown", onKeyDown, true);
        };
      },
      trackInteractOutside({ context, computed, scope, send, prop }) {
        const step = computed("step");
        if (step == null) return;
        const contentEl = () => getContentEl(scope);
        return interactOutside.trackInteractOutside(contentEl, {
          defer: true,
          exclude(target) {
            return domQuery.contains(step.target?.(), target);
          },
          onFocusOutside(event) {
            prop("onFocusOutside")?.(event);
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault();
            }
          },
          onPointerDownOutside(event) {
            prop("onPointerDownOutside")?.(event);
            const isWithin = isEventInRect(context.get("targetRect"), event.detail.originalEvent);
            if (isWithin) {
              event.preventDefault();
              return;
            }
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault();
            }
          },
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event);
            if (event.defaultPrevented) return;
            send({ type: "DISMISS", src: "interact-outside" });
          }
        });
      },
      trackDismissableBranch({ computed, scope }) {
        const step = computed("step");
        if (step == null) return;
        const contentEl = () => getContentEl(scope);
        return dismissable.trackDismissableBranch(contentEl, { defer: true });
      },
      trapFocus({ computed, scope }) {
        const step = computed("step");
        if (step == null) return;
        const contentEl = () => getContentEl(scope);
        return focusTrap.trapFocus(contentEl, {
          escapeDeactivates: false,
          allowOutsideClick: true,
          preventScroll: true,
          returnFocusOnDeactivate: false,
          getShadowRoot: true
        });
      },
      trackPlacement({ context, computed, scope, prop }) {
        const step = computed("step");
        if (step == null) return;
        context.set("currentPlacement", step.placement ?? "bottom");
        if (isDialogStep(step)) {
          return syncZIndex(scope);
        }
        if (!isTooltipStep(step)) {
          return;
        }
        const positionerEl = () => getPositionerEl(scope);
        return popper.getPlacement(context.get("resolvedTarget"), positionerEl, {
          defer: true,
          placement: step.placement ?? "bottom",
          strategy: "absolute",
          gutter: 10,
          offset: step.offset,
          getAnchorRect(el) {
            if (!domQuery.isHTMLElement(el)) return null;
            const rect = el.getBoundingClientRect();
            return offset(rect, prop("spotlightOffset"));
          },
          onComplete(data) {
            const { rects } = data.middlewareData;
            context.set("currentPlacement", data.placement);
            context.set("targetRect", rects.reference);
          }
        });
      }
    }
  }
});
var StepManager = class {
  constructor(params) {
    this.params = params;
  }
  /**
   * Transition to a step by id or index
   */
  transitionToStep(step) {
    const steps = this.params.context.get("steps");
    const idx = utils.isString(step) ? findStepIndex(steps, step) : step;
    this.transitionTo(idx);
  }
  /**
   * Transition to the next step from the given index
   */
  next(currentIndex) {
    const steps = this.params.context.get("steps");
    const idx = utils.nextIndex(steps, currentIndex);
    this.transitionTo(idx);
  }
  /**
   * Transition to the previous step from the given index
   */
  prev(currentIndex) {
    const steps = this.params.context.get("steps");
    const idx = utils.prevIndex(steps, currentIndex);
    this.transitionTo(idx);
  }
  /**
   * Clear the current step and reset tour state
   */
  clear() {
    const { context } = this.params;
    context.set("targetRect", { width: 0, height: 0, x: 0, y: 0 });
    context.set("resolvedTarget", null);
    this.transitionTo(-1);
  }
  /**
   * Cleanup all resources including effects, target attributes, and resolved target.
   * Use when completely tearing down the tour or transitioning between steps.
   */
  cleanupAll() {
    const { refs } = this.params;
    refs.get("_targetCleanup")?.();
    refs.set("_targetCleanup", void 0);
    refs.set("_prevTarget", void 0);
    refs.get("_effectCleanup")?.();
    refs.set("_effectCleanup", void 0);
  }
  /**
   * Cleanup only the step effect cleanup function.
   * Skips cleanup if an effect is currently running.
   */
  cleanupStepEffect() {
    const { refs } = this.params;
    if (refs.get("_runningEffect")) {
      return;
    }
    refs.get("_effectCleanup")?.();
    refs.set("_effectCleanup", void 0);
  }
  /**
   * Sync target element attributes (inert, data-tour-highlighted).
   * Handles cleanup of previous target and applies attributes to new target.
   */
  syncTarget(targetEl) {
    const { refs, prop } = this.params;
    const prevTarget = refs.get("_prevTarget");
    if (targetEl !== prevTarget) {
      refs.get("_targetCleanup")?.();
      refs.set("_targetCleanup", void 0);
    }
    if (!targetEl) {
      refs.set("_prevTarget", null);
      return;
    }
    if (targetEl === prevTarget) {
      return;
    }
    if (prop("preventInteraction")) targetEl.inert = true;
    targetEl.setAttribute("data-tour-highlighted", "");
    refs.set("_targetCleanup", () => {
      if (prop("preventInteraction")) targetEl.inert = false;
      targetEl.removeAttribute("data-tour-highlighted");
    });
    refs.set("_prevTarget", targetEl);
  }
  /**
   * Transition to a step by index
   */
  transitionTo(idx) {
    const { context, refs } = this.params;
    const steps = context.get("steps");
    const step = steps[idx];
    if (!step) {
      context.set("stepId", null);
      return;
    }
    if (utils.isEqual(context.get("stepId"), step.id)) {
      refs.set("_runningEffect", false);
      return;
    }
    this.cleanup();
    const utilities = this.createUtilities(step, idx);
    if (step.effect) {
      this.executeEffect(step, utilities);
    } else {
      utilities.show();
    }
  }
  /**
   * Clean up previous step effects and target attributes
   */
  cleanup() {
    const { refs } = this.params;
    refs.get("_effectCleanup")?.();
    refs.set("_effectCleanup", void 0);
    refs.get("_targetCleanup")?.();
    refs.set("_targetCleanup", void 0);
  }
  /**
   * Create utility functions for step effects
   */
  createUtilities(step, idx) {
    const { context, computed, prop } = this.params;
    const steps = context.get("steps");
    return {
      show: () => {
        context.set("stepId", step.id);
      },
      update: (data) => {
        context.set("steps", (prev) => prev.map((s, i) => i === idx ? { ...s, ...data } : s));
      },
      next: () => {
        const nextIdx = utils.nextIndex(steps, computed("stepIndex"));
        this.transitionTo(nextIdx);
      },
      goto: (id) => {
        const targetIdx = findStepIndex(steps, id);
        if (targetIdx === -1) {
          utils.warn(`[zag-js/tour] Step with id "${id}" not found`);
          return;
        }
        this.transitionTo(targetIdx);
      },
      dismiss: () => {
        context.set("stepId", null);
        prop("onStatusChange")?.({ status: "dismissed", stepId: null, stepIndex: -1 });
      },
      target: step.target
    };
  }
  /**
   * Execute a step's effect function
   */
  executeEffect(step, utilities) {
    const { refs } = this.params;
    refs.set("_runningEffect", true);
    let cleanup;
    try {
      cleanup = step.effect(utilities);
    } catch (error) {
      refs.set("_runningEffect", false);
      console.error(error);
      return;
    }
    refs.set("_effectCleanup", cleanup);
    if (isWaitStep(step)) {
      utilities.show();
    }
    queueMicrotask(() => {
      queueMicrotask(() => {
        refs.set("_runningEffect", false);
      });
    });
  }
};
var props = types.createProps()([
  "closeOnEscape",
  "closeOnInteractOutside",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "keyboardNavigation",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onStatusChange",
  "onStepChange",
  "onStepsChange",
  "preventInteraction",
  "spotlightOffset",
  "spotlightRadius",
  "stepId",
  "steps",
  "translations"
]);
var splitProps = utils.createSplitProps(props);
function waitForElementValue(target, value, options) {
  const { timeout, rootNode } = options;
  const win = domQuery.getWindow(rootNode);
  const controller = new win.AbortController();
  return domQuery.waitForPromise(
    new Promise((resolve) => {
      const el = target();
      if (!el) return;
      const checkValue = () => {
        if (el.value === value) {
          resolve();
          el.removeEventListener("input", checkValue);
        }
      };
      checkValue();
      el.addEventListener("input", checkValue, { signal: controller.signal });
    }),
    controller,
    timeout
  );
}

Object.defineProperty(exports, "waitForElement", {
  enumerable: true,
  get: function () { return domQuery.waitForElement; }
});
Object.defineProperty(exports, "waitForPromise", {
  enumerable: true,
  get: function () { return domQuery.waitForPromise; }
});
exports.anatomy = anatomy;
exports.connect = connect;
exports.machine = machine;
exports.props = props;
exports.splitProps = splitProps;
exports.waitForElementValue = waitForElementValue;
