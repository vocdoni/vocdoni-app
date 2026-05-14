'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var domQuery = require('@zag-js/dom-query');
var focusVisible = require('@zag-js/focus-visible');
var utils = require('@zag-js/utils');
var core = require('@zag-js/core');
var types = require('@zag-js/types');

// src/radio-group.anatomy.ts
var anatomy = anatomy$1.createAnatomy("radio-group").parts(
  "root",
  "label",
  "item",
  "itemText",
  "itemControl",
  "indicator"
);
var parts = anatomy.build();
var getRootId = (ctx) => ctx.ids?.root ?? `radio-group:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `radio-group:${ctx.id}:label`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `radio-group:${ctx.id}:radio:${value}`;
var getItemHiddenInputId = (ctx, value) => ctx.ids?.itemHiddenInput?.(value) ?? `radio-group:${ctx.id}:radio:input:${value}`;
var getItemControlId = (ctx, value) => ctx.ids?.itemControl?.(value) ?? `radio-group:${ctx.id}:radio:control:${value}`;
var getItemLabelId = (ctx, value) => ctx.ids?.itemLabel?.(value) ?? `radio-group:${ctx.id}:radio:label:${value}`;
var getIndicatorId = (ctx) => ctx.ids?.indicator ?? `radio-group:${ctx.id}:indicator`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getItemHiddenInputEl = (ctx, value) => ctx.getById(getItemHiddenInputId(ctx, value));
var getIndicatorEl = (ctx) => ctx.getById(getIndicatorId(ctx));
var getFirstEnabledInputEl = (ctx) => getRootEl(ctx)?.querySelector("input:not(:disabled)");
var getFirstEnabledAndCheckedInputEl = (ctx) => getRootEl(ctx)?.querySelector("input:not(:disabled):checked");
var getInputEls = (ctx) => {
  const ownerId = CSS.escape(getRootId(ctx));
  const selector = `input[type=radio][data-ownedby='${ownerId}']:not([disabled])`;
  return domQuery.queryAll(getRootEl(ctx), selector);
};
var getRadioEl = (ctx, value) => {
  if (!value) return;
  return ctx.getById(getItemId(ctx, value));
};
var getOffsetRect = (el) => ({
  x: el?.offsetLeft ?? 0,
  y: el?.offsetTop ?? 0,
  width: el?.offsetWidth ?? 0,
  height: el?.offsetHeight ?? 0
});

// src/radio-group.connect.ts
function connect(service, normalize) {
  const { context, send, computed, prop, scope } = service;
  const groupDisabled = computed("isDisabled");
  const groupInvalid = prop("invalid");
  const readOnly = prop("readOnly");
  function getItemState(props2) {
    return {
      value: props2.value,
      invalid: !!props2.invalid || !!groupInvalid,
      disabled: !!props2.disabled || groupDisabled,
      checked: context.get("value") === props2.value,
      focused: context.get("focusedValue") === props2.value,
      focusVisible: context.get("focusVisibleValue") === props2.value,
      hovered: context.get("hoveredValue") === props2.value,
      active: context.get("activeValue") === props2.value
    };
  }
  function getItemDataAttrs(props2) {
    const itemState = getItemState(props2);
    return {
      "data-focus": domQuery.dataAttr(itemState.focused),
      "data-focus-visible": domQuery.dataAttr(itemState.focusVisible),
      "data-disabled": domQuery.dataAttr(itemState.disabled),
      "data-readonly": domQuery.dataAttr(readOnly),
      "data-state": itemState.checked ? "checked" : "unchecked",
      "data-hover": domQuery.dataAttr(itemState.hovered),
      "data-invalid": domQuery.dataAttr(itemState.invalid),
      "data-orientation": prop("orientation"),
      "data-ssr": domQuery.dataAttr(context.get("ssr"))
    };
  }
  const focus = () => {
    const nodeToFocus = getFirstEnabledAndCheckedInputEl(scope) ?? getFirstEnabledInputEl(scope);
    nodeToFocus?.focus();
  };
  return {
    focus,
    value: context.get("value"),
    setValue(value) {
      send({ type: "SET_VALUE", value, isTrusted: false });
    },
    clearValue() {
      send({ type: "SET_VALUE", value: null, isTrusted: false });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        role: "radiogroup",
        id: getRootId(scope),
        "aria-labelledby": getLabelId(scope),
        "aria-required": prop("required") || void 0,
        "aria-disabled": groupDisabled || void 0,
        "aria-readonly": readOnly || void 0,
        "data-orientation": prop("orientation"),
        "data-disabled": domQuery.dataAttr(groupDisabled),
        "data-invalid": domQuery.dataAttr(groupInvalid),
        "data-required": domQuery.dataAttr(prop("required")),
        "aria-orientation": prop("orientation"),
        dir: prop("dir"),
        style: {
          position: "relative"
        }
      });
    },
    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-disabled": domQuery.dataAttr(groupDisabled),
        "data-invalid": domQuery.dataAttr(groupInvalid),
        "data-required": domQuery.dataAttr(prop("required")),
        id: getLabelId(scope),
        onClick: focus
      });
    },
    getItemState,
    getItemProps(props2) {
      const itemState = getItemState(props2);
      return normalize.label({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: getItemId(scope, props2.value),
        htmlFor: getItemHiddenInputId(scope, props2.value),
        ...getItemDataAttrs(props2),
        onPointerMove() {
          if (itemState.disabled) return;
          if (itemState.hovered) return;
          send({ type: "SET_HOVERED", value: props2.value, hovered: true });
        },
        onPointerLeave() {
          if (itemState.disabled) return;
          send({ type: "SET_HOVERED", value: null });
        },
        onPointerDown(event) {
          if (itemState.disabled) return;
          if (!domQuery.isLeftClick(event)) return;
          if (itemState.focused && event.pointerType === "mouse") {
            event.preventDefault();
          }
          send({ type: "SET_ACTIVE", value: props2.value, active: true });
        },
        onPointerUp() {
          if (itemState.disabled) return;
          send({ type: "SET_ACTIVE", value: null });
        },
        onClick() {
          if (!itemState.disabled && domQuery.isSafari()) {
            getItemHiddenInputEl(scope, props2.value)?.focus();
          }
        }
      });
    },
    getItemTextProps(props2) {
      return normalize.element({
        ...parts.itemText.attrs,
        dir: prop("dir"),
        id: getItemLabelId(scope, props2.value),
        ...getItemDataAttrs(props2)
      });
    },
    getItemControlProps(props2) {
      const itemState = getItemState(props2);
      return normalize.element({
        ...parts.itemControl.attrs,
        dir: prop("dir"),
        id: getItemControlId(scope, props2.value),
        "data-active": domQuery.dataAttr(itemState.active),
        "aria-hidden": true,
        ...getItemDataAttrs(props2)
      });
    },
    getItemHiddenInputProps(props2) {
      const itemState = getItemState(props2);
      return normalize.input({
        "data-ownedby": getRootId(scope),
        id: getItemHiddenInputId(scope, props2.value),
        type: "radio",
        name: prop("name") || prop("id"),
        form: prop("form"),
        value: props2.value,
        required: prop("required"),
        "aria-invalid": itemState.invalid || void 0,
        onClick(event) {
          if (readOnly) {
            event.preventDefault();
            return;
          }
          if (event.currentTarget.checked) {
            send({ type: "SET_VALUE", value: props2.value, isTrusted: true });
          }
        },
        onBlur() {
          send({ type: "SET_FOCUSED", value: null, focused: false, focusVisible: false });
        },
        onFocus() {
          const focusVisible$1 = focusVisible.isFocusVisible();
          send({ type: "SET_FOCUSED", value: props2.value, focused: true, focusVisible: focusVisible$1 });
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (event.key === " ") {
            send({ type: "SET_ACTIVE", value: props2.value, active: true });
          }
        },
        onKeyUp(event) {
          if (event.defaultPrevented) return;
          if (event.key === " ") {
            send({ type: "SET_ACTIVE", value: null });
          }
        },
        disabled: itemState.disabled || readOnly,
        defaultChecked: itemState.checked,
        style: domQuery.visuallyHiddenStyle
      });
    },
    getIndicatorProps() {
      const rect = context.get("indicatorRect");
      const rectIsEmpty = rect == null || rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0;
      return normalize.element({
        id: getIndicatorId(scope),
        ...parts.indicator.attrs,
        dir: prop("dir"),
        hidden: context.get("value") == null || rectIsEmpty,
        "data-disabled": domQuery.dataAttr(groupDisabled),
        "data-orientation": prop("orientation"),
        style: {
          "--transition-property": "left, top, width, height",
          "--left": utils.toPx(rect?.x),
          "--top": utils.toPx(rect?.y),
          "--width": utils.toPx(rect?.width),
          "--height": utils.toPx(rect?.height),
          position: "absolute",
          willChange: "var(--transition-property)",
          transitionProperty: "var(--transition-property)",
          transitionDuration: "var(--transition-duration, 150ms)",
          transitionTimingFunction: "var(--transition-timing-function)",
          [prop("orientation") === "horizontal" ? "left" : "top"]: prop("orientation") === "horizontal" ? "var(--left)" : "var(--top)"
        }
      });
    }
  };
}
var { not } = core.createGuards();
var machine = core.createMachine({
  props({ props: props2 }) {
    return {
      orientation: "vertical",
      ...props2
    };
  },
  initialState() {
    return "idle";
  },
  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value });
        }
      })),
      activeValue: bindable(() => ({
        defaultValue: null
      })),
      focusedValue: bindable(() => ({
        defaultValue: null
      })),
      focusVisibleValue: bindable(() => ({
        defaultValue: null
      })),
      hoveredValue: bindable(() => ({
        defaultValue: null
      })),
      indicatorRect: bindable(() => ({
        defaultValue: null
      })),
      fieldsetDisabled: bindable(() => ({
        defaultValue: false
      })),
      ssr: bindable(() => ({
        defaultValue: true
      }))
    };
  },
  refs() {
    return {
      indicatorCleanup: null,
      focusVisibleValue: null
    };
  },
  computed: {
    isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled")
  },
  entry: ["syncIndicatorRect", "syncSsr"],
  exit: ["cleanupObserver"],
  effects: ["trackFormControlState", "trackFocusVisible"],
  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["syncIndicatorRect", "syncInputElements"]);
    });
  },
  on: {
    SET_VALUE: [
      {
        guard: not("isTrusted"),
        actions: ["setValue", "dispatchChangeEvent"]
      },
      {
        actions: ["setValue"]
      }
    ],
    SET_HOVERED: {
      actions: ["setHovered"]
    },
    SET_ACTIVE: {
      actions: ["setActive"]
    },
    SET_FOCUSED: {
      actions: ["setFocused"]
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    guards: {
      isTrusted: ({ event }) => !!event.isTrusted
    },
    effects: {
      trackFormControlState({ context, scope }) {
        return domQuery.trackFormControl(getRootEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled);
          },
          onFormReset() {
            context.set("value", context.initial("value"));
          }
        });
      },
      trackFocusVisible({ scope }) {
        return focusVisible.trackFocusVisible({ root: scope.getRootNode?.() });
      }
    },
    actions: {
      setValue({ context, event }) {
        context.set("value", event.value);
      },
      setHovered({ context, event }) {
        context.set("hoveredValue", event.value);
      },
      setActive({ context, event }) {
        context.set("activeValue", event.value);
      },
      setFocused({ context, event }) {
        context.set("focusedValue", event.value);
        const focusVisibleValue = event.value != null && event.focusVisible ? event.value : null;
        context.set("focusVisibleValue", focusVisibleValue);
      },
      syncInputElements({ context, scope }) {
        const inputs = getInputEls(scope);
        inputs.forEach((input) => {
          input.checked = input.value === context.get("value");
        });
      },
      cleanupObserver({ refs }) {
        refs.get("indicatorCleanup")?.();
      },
      syncSsr({ context }) {
        context.set("ssr", false);
      },
      syncIndicatorRect({ context, scope, refs }) {
        refs.get("indicatorCleanup")?.();
        if (!getIndicatorEl(scope)) return;
        const value = context.get("value");
        const radioEl = getRadioEl(scope, value);
        if (value == null || !radioEl) {
          context.set("indicatorRect", null);
          return;
        }
        const exec = () => {
          context.set("indicatorRect", getOffsetRect(radioEl));
        };
        exec();
        const indicatorCleanup = domQuery.resizeObserverBorderBox.observe(radioEl, exec);
        refs.set("indicatorCleanup", indicatorCleanup);
      },
      dispatchChangeEvent({ context, scope }) {
        const inputEls = getInputEls(scope);
        inputEls.forEach((inputEl) => {
          const checked = inputEl.value === context.get("value");
          if (checked === inputEl.checked) return;
          domQuery.dispatchInputCheckedEvent(inputEl, { checked });
        });
      }
    }
  }
});
var props = types.createProps()([
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onValueChange",
  "orientation",
  "readOnly",
  "required",
  "value",
  "defaultValue"
]);
var splitProps = utils.createSplitProps(props);
var itemProps = types.createProps()(["value", "disabled", "invalid"]);
var splitItemProps = utils.createSplitProps(itemProps);

exports.anatomy = anatomy;
exports.connect = connect;
exports.itemProps = itemProps;
exports.machine = machine;
exports.props = props;
exports.splitItemProps = splitItemProps;
exports.splitProps = splitProps;
