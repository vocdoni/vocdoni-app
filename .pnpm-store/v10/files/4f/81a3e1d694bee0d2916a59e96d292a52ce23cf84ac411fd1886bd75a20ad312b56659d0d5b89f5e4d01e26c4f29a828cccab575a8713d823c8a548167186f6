'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var collection$1 = require('@zag-js/collection');
var domQuery = require('@zag-js/dom-query');
var popper = require('@zag-js/popper');
var utils = require('@zag-js/utils');
var core = require('@zag-js/core');
var dismissable = require('@zag-js/dismissable');
var types = require('@zag-js/types');

// src/combobox.anatomy.ts
var anatomy = anatomy$1.createAnatomy("combobox").parts(
  "root",
  "clearTrigger",
  "content",
  "control",
  "input",
  "item",
  "itemGroup",
  "itemGroupLabel",
  "itemIndicator",
  "itemText",
  "label",
  "list",
  "positioner",
  "trigger"
);
var parts = anatomy.build();
var collection = (options) => {
  return new collection$1.ListCollection(options);
};
collection.empty = () => {
  return new collection$1.ListCollection({ items: [] });
};
var getRootId = (ctx) => ctx.ids?.root ?? `combobox:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `combobox:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `combobox:${ctx.id}:control`;
var getInputId = (ctx) => ctx.ids?.input ?? `combobox:${ctx.id}:input`;
var getContentId = (ctx) => ctx.ids?.content ?? `combobox:${ctx.id}:content`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `combobox:${ctx.id}:popper`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `combobox:${ctx.id}:toggle-btn`;
var getClearTriggerId = (ctx) => ctx.ids?.clearTrigger ?? `combobox:${ctx.id}:clear-btn`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `combobox:${ctx.id}:optgroup:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `combobox:${ctx.id}:optgroup-label:${id}`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `combobox:${ctx.id}:option:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getClearTriggerEl = (ctx) => ctx.getById(getClearTriggerId(ctx));
var getItemEl = (ctx, value) => {
  if (value == null) return null;
  const selector = `[role=option][data-value="${CSS.escape(value)}"]`;
  return domQuery.query(getContentEl(ctx), selector);
};
var focusInputEl = (ctx) => {
  const inputEl = getInputEl(ctx);
  if (ctx.isActiveElement(inputEl)) return;
  inputEl?.focus({ preventScroll: true });
};
var focusTriggerEl = (ctx) => {
  const triggerEl = getTriggerEl(ctx);
  if (ctx.isActiveElement(triggerEl)) return;
  triggerEl?.focus({ preventScroll: true });
};

// src/combobox.connect.ts
function connect(service, normalize) {
  const { context, prop, state, send, scope, computed, event } = service;
  const translations = prop("translations");
  const collection2 = prop("collection");
  const disabled = !!prop("disabled");
  const interactive = computed("isInteractive");
  const invalid = !!prop("invalid");
  const required = !!prop("required");
  const readOnly = !!prop("readOnly");
  const open = state.hasTag("open");
  const focused = state.hasTag("focused");
  const composite = prop("composite");
  const highlightedValue = context.get("highlightedValue");
  const popperStyles = popper.getPlacementStyles({
    ...prop("positioning"),
    placement: context.get("currentPlacement")
  });
  function getItemState(props2) {
    const disabled2 = collection2.getItemDisabled(props2.item);
    const value = collection2.getItemValue(props2.item);
    utils.ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props2.item)}`);
    return {
      value,
      disabled: Boolean(disabled2 || disabled2),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value)
    };
  }
  return {
    focused,
    open,
    inputValue: context.get("inputValue"),
    highlightedValue,
    highlightedItem: context.get("highlightedItem"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    hasSelectedItems: computed("hasSelectedItems"),
    selectedItems: context.get("selectedItems"),
    collection: prop("collection"),
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    syncSelectedItems() {
      send({ type: "SELECTED_ITEMS.SYNC" });
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options });
    },
    setHighlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value });
    },
    clearHighlightValue() {
      send({ type: "HIGHLIGHTED_VALUE.CLEAR" });
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value });
    },
    setValue(value) {
      send({ type: "VALUE.SET", value });
    },
    setInputValue(value, reason = "script") {
      send({ type: "INPUT_VALUE.SET", value, src: reason });
    },
    clearValue(value) {
      if (value != null) {
        send({ type: "ITEM.CLEAR", value });
      } else {
        send({ type: "VALUE.CLEAR" });
      }
    },
    focus() {
      getInputEl(scope)?.focus();
    },
    setOpen(nextOpen, reason = "script") {
      const open2 = state.hasTag("open");
      if (open2 === nextOpen) return;
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: getRootId(scope),
        "data-invalid": domQuery.dataAttr(invalid),
        "data-readonly": domQuery.dataAttr(readOnly)
      });
    },
    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        htmlFor: getInputId(scope),
        id: getLabelId(scope),
        "data-readonly": domQuery.dataAttr(readOnly),
        "data-disabled": domQuery.dataAttr(disabled),
        "data-invalid": domQuery.dataAttr(invalid),
        "data-required": domQuery.dataAttr(required),
        "data-focus": domQuery.dataAttr(focused),
        onClick(event2) {
          if (composite) return;
          event2.preventDefault();
          getTriggerEl(scope)?.focus({ preventScroll: true });
        }
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: getControlId(scope),
        "data-state": open ? "open" : "closed",
        "data-focus": domQuery.dataAttr(focused),
        "data-disabled": domQuery.dataAttr(disabled),
        "data-invalid": domQuery.dataAttr(invalid)
      });
    },
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: getPositionerId(scope),
        style: popperStyles.floating
      });
    },
    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        "aria-invalid": domQuery.ariaAttr(invalid),
        "data-invalid": domQuery.dataAttr(invalid),
        "data-autofocus": domQuery.dataAttr(prop("autoFocus")),
        name: prop("name"),
        form: prop("form"),
        disabled,
        required: prop("required"),
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        spellCheck: "false",
        readOnly,
        placeholder: prop("placeholder"),
        id: getInputId(scope),
        type: "text",
        role: "combobox",
        defaultValue: context.get("inputValue"),
        "aria-autocomplete": computed("autoComplete") ? "both" : "list",
        "aria-controls": getContentId(scope),
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-activedescendant": highlightedValue ? getItemId(scope, highlightedValue) : void 0,
        onClick(event2) {
          if (event2.defaultPrevented) return;
          if (!prop("openOnClick")) return;
          if (!interactive) return;
          send({ type: "INPUT.CLICK", src: "input-click" });
        },
        onFocus() {
          if (disabled) return;
          send({ type: "INPUT.FOCUS" });
        },
        onBlur() {
          if (disabled) return;
          send({ type: "INPUT.BLUR" });
        },
        onChange(event2) {
          send({ type: "INPUT.CHANGE", value: event2.currentTarget.value, src: "input-change" });
        },
        onKeyDown(event2) {
          if (event2.defaultPrevented) return;
          if (!interactive) return;
          if (event2.ctrlKey || event2.shiftKey || domQuery.isComposingEvent(event2)) return;
          const openOnKeyPress = prop("openOnKeyPress");
          const isModifierKey = event2.ctrlKey || event2.metaKey || event2.shiftKey;
          const keypress = true;
          const keymap = {
            ArrowDown(event3) {
              if (!openOnKeyPress && !open) return;
              send({ type: event3.altKey ? "OPEN" : "INPUT.ARROW_DOWN", keypress, src: "arrow-key" });
              event3.preventDefault();
            },
            ArrowUp() {
              if (!openOnKeyPress && !open) return;
              send({ type: event2.altKey ? "CLOSE" : "INPUT.ARROW_UP", keypress, src: "arrow-key" });
              event2.preventDefault();
            },
            Home(event3) {
              if (isModifierKey) return;
              send({ type: "INPUT.HOME", keypress });
              if (open) {
                event3.preventDefault();
              }
            },
            End(event3) {
              if (isModifierKey) return;
              send({ type: "INPUT.END", keypress });
              if (open) {
                event3.preventDefault();
              }
            },
            Enter(event3) {
              send({ type: "INPUT.ENTER", keypress, src: "item-select" });
              const submittable = computed("isCustomValue") && prop("allowCustomValue");
              const hasHighlight = highlightedValue != null;
              const alwaysSubmit = prop("alwaysSubmitOnEnter");
              if (open && !submittable && !alwaysSubmit && hasHighlight) {
                event3.preventDefault();
              }
              if (highlightedValue == null) return;
              const itemEl = getItemEl(scope, highlightedValue);
              if (domQuery.isAnchorElement(itemEl)) {
                prop("navigate")?.({ value: highlightedValue, node: itemEl, href: itemEl.href });
              }
            },
            Escape() {
              send({ type: "INPUT.ESCAPE", keypress, src: "escape-key" });
              event2.preventDefault();
            }
          };
          const key = domQuery.getEventKey(event2, { dir: prop("dir") });
          const exec = keymap[key];
          exec?.(event2);
        }
      });
    },
    getTriggerProps(props2 = {}) {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: getTriggerId(scope),
        "aria-haspopup": composite ? "listbox" : "dialog",
        type: "button",
        tabIndex: props2.focusable ? void 0 : -1,
        "aria-label": translations.triggerLabel,
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": open ? getContentId(scope) : void 0,
        disabled,
        "data-invalid": domQuery.dataAttr(invalid),
        "data-focusable": domQuery.dataAttr(props2.focusable),
        "data-readonly": domQuery.dataAttr(readOnly),
        "data-disabled": domQuery.dataAttr(disabled),
        onFocus() {
          if (!props2.focusable) return;
          send({ type: "INPUT.FOCUS", src: "trigger" });
        },
        onClick(event2) {
          if (event2.defaultPrevented) return;
          if (!interactive) return;
          if (!domQuery.isLeftClick(event2)) return;
          send({ type: "TRIGGER.CLICK", src: "trigger-click" });
        },
        onPointerDown(event2) {
          if (!interactive) return;
          if (event2.pointerType === "touch") return;
          if (!domQuery.isLeftClick(event2)) return;
          event2.preventDefault();
          queueMicrotask(() => {
            getInputEl(scope)?.focus({ preventScroll: true });
          });
        },
        onKeyDown(event2) {
          if (event2.defaultPrevented) return;
          if (composite) return;
          const keyMap = {
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", src: "arrow-key" });
            },
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", src: "arrow-key" });
            }
          };
          const key = domQuery.getEventKey(event2, { dir: prop("dir") });
          const exec = keyMap[key];
          if (exec) {
            exec(event2);
            event2.preventDefault();
          }
        }
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: getContentId(scope),
        role: !composite ? "dialog" : "listbox",
        tabIndex: -1,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-placement": context.get("currentPlacement"),
        "aria-labelledby": getLabelId(scope),
        "aria-multiselectable": prop("multiple") && composite ? true : void 0,
        "data-empty": domQuery.dataAttr(collection2.size === 0),
        onPointerDown(event2) {
          if (!domQuery.isLeftClick(event2)) return;
          event2.preventDefault();
        }
      });
    },
    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        role: !composite ? "listbox" : void 0,
        "data-empty": domQuery.dataAttr(collection2.size === 0),
        "aria-labelledby": getLabelId(scope),
        "aria-multiselectable": prop("multiple") && !composite ? true : void 0
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        id: getClearTriggerId(scope),
        type: "button",
        tabIndex: -1,
        disabled,
        "data-invalid": domQuery.dataAttr(invalid),
        "aria-label": translations.clearTriggerLabel,
        "aria-controls": getInputId(scope),
        hidden: !context.get("value").length,
        onPointerDown(event2) {
          if (!domQuery.isLeftClick(event2)) return;
          event2.preventDefault();
        },
        onClick(event2) {
          if (event2.defaultPrevented) return;
          if (!interactive) return;
          send({ type: "VALUE.CLEAR", src: "clear-trigger" });
        }
      });
    },
    getItemState,
    getItemProps(props2) {
      const itemState = getItemState(props2);
      const value = itemState.value;
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: getItemId(scope, value),
        role: "option",
        tabIndex: -1,
        "data-highlighted": domQuery.dataAttr(itemState.highlighted),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "aria-selected": domQuery.ariaAttr(itemState.highlighted),
        "aria-disabled": domQuery.ariaAttr(itemState.disabled),
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "data-value": itemState.value,
        onPointerMove() {
          if (itemState.disabled) return;
          if (itemState.highlighted) return;
          send({ type: "ITEM.POINTER_MOVE", value });
        },
        onPointerLeave() {
          if (props2.persistFocus) return;
          if (itemState.disabled) return;
          const prev = event.previous();
          const mouseMoved = prev?.type.includes("POINTER");
          if (!mouseMoved) return;
          send({ type: "ITEM.POINTER_LEAVE", value });
        },
        onClick(event2) {
          if (domQuery.isDownloadingEvent(event2)) return;
          if (domQuery.isOpeningInNewTab(event2)) return;
          if (domQuery.isContextMenuEvent(event2)) return;
          if (itemState.disabled) return;
          send({ type: "ITEM.CLICK", src: "item-select", value });
        }
      });
    },
    getItemTextProps(props2) {
      const itemState = getItemState(props2);
      return normalize.element({
        ...parts.itemText.attrs,
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "data-highlighted": domQuery.dataAttr(itemState.highlighted)
      });
    },
    getItemIndicatorProps(props2) {
      const itemState = getItemState(props2);
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs,
        dir: prop("dir"),
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected
      });
    },
    getItemGroupProps(props2) {
      const { id } = props2;
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        id: getItemGroupId(scope, id),
        "aria-labelledby": getItemGroupLabelId(scope, id),
        "data-empty": domQuery.dataAttr(collection2.size === 0),
        role: "group"
      });
    },
    getItemGroupLabelProps(props2) {
      const { htmlFor } = props2;
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        dir: prop("dir"),
        id: getItemGroupLabelId(scope, htmlFor),
        role: "presentation"
      });
    }
  };
}
var { guards, createMachine, choose } = core.setup();
var { and, not } = guards;
var machine = createMachine({
  props({ props: props2 }) {
    return {
      loopFocus: true,
      openOnClick: false,
      defaultValue: [],
      defaultInputValue: "",
      closeOnSelect: !props2.multiple,
      allowCustomValue: false,
      alwaysSubmitOnEnter: false,
      inputBehavior: "none",
      selectionBehavior: props2.multiple ? "clear" : "replace",
      openOnKeyPress: true,
      openOnChange: true,
      composite: true,
      navigate({ node }) {
        domQuery.clickIfLink(node);
      },
      collection: collection.empty(),
      ...props2,
      positioning: {
        placement: "bottom",
        sameWidth: true,
        ...props2.positioning
      },
      translations: {
        triggerLabel: "Toggle suggestions",
        clearTriggerLabel: "Clear value",
        ...props2.translations
      }
    };
  },
  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen");
    return open ? "suggesting" : "idle";
  },
  context({ prop, bindable, getContext, getEvent }) {
    return {
      currentPlacement: bindable(() => ({
        defaultValue: void 0
      })),
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual: utils.isEqual,
        hash(value) {
          return value.join(",");
        },
        onChange(value) {
          const context = getContext();
          const prevSelectedItems = context.get("selectedItems");
          const collection2 = prop("collection");
          const nextItems = value.map((v) => {
            const item = prevSelectedItems.find((item2) => collection2.getItemValue(item2) === v);
            return item || collection2.find(v);
          });
          context.set("selectedItems", nextItems);
          prop("onValueChange")?.({ value, items: nextItems });
        }
      })),
      highlightedValue: bindable(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          const item = prop("collection").find(value);
          prop("onHighlightChange")?.({ highlightedValue: value, highlightedItem: item });
        }
      })),
      inputValue: bindable(() => {
        let inputValue = prop("inputValue") || prop("defaultInputValue");
        const value = prop("value") || prop("defaultValue");
        if (!inputValue.trim() && !prop("multiple")) {
          const valueAsString = prop("collection").stringifyMany(value);
          inputValue = utils.match(prop("selectionBehavior"), {
            preserve: inputValue || valueAsString,
            replace: valueAsString,
            clear: ""
          });
        }
        return {
          defaultValue: inputValue,
          value: prop("inputValue"),
          onChange(value2) {
            const event = getEvent();
            const reason = (event.previousEvent || event).src;
            prop("onInputValueChange")?.({ inputValue: value2, reason });
          }
        };
      }),
      highlightedItem: bindable(() => {
        const highlightedValue = prop("highlightedValue");
        const highlightedItem = prop("collection").find(highlightedValue);
        return { defaultValue: highlightedItem };
      }),
      selectedItems: bindable(() => {
        const value = prop("value") || prop("defaultValue") || [];
        const selectedItems = prop("collection").findMany(value);
        return { defaultValue: selectedItems };
      })
    };
  },
  computed: {
    isInputValueEmpty: ({ context }) => context.get("inputValue").length === 0,
    isInteractive: ({ prop }) => !(prop("readOnly") || prop("disabled")),
    autoComplete: ({ prop }) => prop("inputBehavior") === "autocomplete",
    autoHighlight: ({ prop }) => prop("inputBehavior") === "autohighlight",
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    valueAsString: ({ context, prop }) => prop("collection").stringifyItems(context.get("selectedItems")),
    isCustomValue: ({ context, computed }) => context.get("inputValue") !== computed("valueAsString")
  },
  watch({ context, prop, track, action, send }) {
    track([() => context.hash("value")], () => {
      action(["syncSelectedItems"]);
    });
    track([() => context.get("inputValue")], () => {
      action(["syncInputValue"]);
    });
    track([() => context.get("highlightedValue")], () => {
      action(["syncHighlightedItem", "autofillInputValue"]);
    });
    track([() => prop("open")], () => {
      action(["toggleVisibility"]);
    });
    track([() => prop("collection").toString()], () => {
      send({ type: "CHILDREN_CHANGE" });
    });
  },
  on: {
    "SELECTED_ITEMS.SYNC": {
      actions: ["syncSelectedItems"]
    },
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedValue"]
    },
    "HIGHLIGHTED_VALUE.CLEAR": {
      actions: ["clearHighlightedValue"]
    },
    "ITEM.SELECT": {
      actions: ["selectItem"]
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"]
    },
    "VALUE.SET": {
      actions: ["setValue"]
    },
    "INPUT_VALUE.SET": {
      actions: ["setInputValue"]
    },
    "POSITIONING.SET": {
      actions: ["reposition"]
    }
  },
  entry: choose([
    {
      guard: "autoFocus",
      actions: ["setInitialFocus"]
    }
  ]),
  states: {
    idle: {
      tags: ["idle", "closed"],
      entry: ["scrollContentToTop", "clearHighlightedValue"],
      on: {
        "CONTROLLED.OPEN": {
          target: "interacting"
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
          }
        ],
        "INPUT.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
          }
        ],
        "INPUT.FOCUS": {
          target: "focused"
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["invokeOnOpen"]
          }
        ],
        "VALUE.CLEAR": {
          target: "focused",
          actions: ["clearInputValue", "clearSelectedItems", "setInitialFocus"]
        }
      }
    },
    focused: {
      tags: ["focused", "closed"],
      entry: ["scrollContentToTop", "clearHighlightedValue"],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: "isChangeEvent",
            target: "suggesting"
          },
          {
            target: "interacting"
          }
        ],
        "INPUT.CHANGE": [
          {
            guard: and("isOpenControlled", "openOnChange"),
            actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"]
          },
          {
            guard: "openOnChange",
            target: "suggesting",
            actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"]
          },
          {
            actions: ["setInputValue"]
          }
        ],
        "LAYER.INTERACT_OUTSIDE": {
          target: "idle"
        },
        "INPUT.ESCAPE": {
          guard: and("isCustomValue", not("allowCustomValue")),
          actions: ["revertInputValue"]
        },
        "INPUT.BLUR": {
          target: "idle"
        },
        "INPUT.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"]
          }
        ],
        "INPUT.ARROW_DOWN": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "autoComplete"),
            actions: ["invokeOnOpen"]
          },
          {
            guard: "autoComplete",
            target: "interacting",
            actions: ["invokeOnOpen"]
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
          }
        ],
        "INPUT.ARROW_UP": [
          // == group 1 ==
          {
            guard: "autoComplete",
            target: "interacting",
            actions: ["invokeOnOpen"]
          },
          {
            guard: "autoComplete",
            target: "interacting",
            actions: ["invokeOnOpen"]
          },
          // == group 2 ==
          {
            target: "interacting",
            actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
          }
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"]
          },
          {
            target: "interacting",
            actions: ["invokeOnOpen"]
          }
        ],
        "VALUE.CLEAR": {
          actions: ["clearInputValue", "clearSelectedItems"]
        }
      }
    },
    interacting: {
      tags: ["open", "focused"],
      entry: ["setInitialFocus"],
      effects: ["scrollToHighlightedItem", "trackDismissableLayer", "trackPlacement"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "focused",
            actions: ["setFinalFocus"]
          },
          {
            target: "idle"
          }
        ],
        CHILDREN_CHANGE: [
          {
            guard: "isHighlightedItemRemoved",
            actions: ["clearHighlightedValue"]
          },
          {
            actions: ["scrollToHighlightedItem"]
          }
        ],
        "INPUT.HOME": {
          actions: ["highlightFirstItem"]
        },
        "INPUT.END": {
          actions: ["highlightLastItem"]
        },
        "INPUT.ARROW_DOWN": [
          {
            guard: and("autoComplete", "isLastItemHighlighted"),
            actions: ["clearHighlightedValue", "scrollContentToTop"]
          },
          {
            actions: ["highlightNextItem"]
          }
        ],
        "INPUT.ARROW_UP": [
          {
            guard: and("autoComplete", "isFirstItemHighlighted"),
            actions: ["clearHighlightedValue"]
          },
          {
            actions: ["highlightPrevItem"]
          }
        ],
        "INPUT.ENTER": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"]
          },
          {
            guard: and("isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            target: "focused",
            actions: ["revertInputValue", "invokeOnClose"]
          },
          // == group 2 ==
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectHighlightedItem", "invokeOnClose"]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"]
          },
          {
            actions: ["selectHighlightedItem"]
          }
        ],
        "INPUT.CHANGE": [
          {
            guard: "autoComplete",
            target: "suggesting",
            actions: ["setInputValue"]
          },
          {
            target: "suggesting",
            actions: ["clearHighlightedValue", "setInputValue"]
          }
        ],
        "ITEM.POINTER_MOVE": {
          actions: ["setHighlightedValue"]
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedValue"]
        },
        "ITEM.CLICK": [
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectItem", "invokeOnClose"]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectItem", "invokeOnClose", "setFinalFocus"]
          },
          {
            actions: ["selectItem"]
          }
        ],
        "LAYER.ESCAPE": [
          {
            guard: and("isOpenControlled", "autoComplete"),
            actions: ["syncInputValue", "invokeOnClose"]
          },
          {
            guard: "autoComplete",
            target: "focused",
            actions: ["syncInputValue", "invokeOnClose"]
          },
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "setFinalFocus"]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["invokeOnClose"]
          }
        ],
        "LAYER.INTERACT_OUTSIDE": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"]
          },
          {
            guard: and("isCustomValue", not("allowCustomValue")),
            target: "idle",
            actions: ["revertInputValue", "invokeOnClose"]
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "idle",
            actions: ["invokeOnClose"]
          }
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "setFinalFocus"]
          }
        ],
        "VALUE.CLEAR": [
          {
            guard: "isOpenControlled",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"]
          }
        ]
      }
    },
    suggesting: {
      tags: ["open", "focused"],
      effects: ["trackDismissableLayer", "scrollToHighlightedItem", "trackPlacement"],
      entry: ["setInitialFocus"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "focused",
            actions: ["setFinalFocus"]
          },
          {
            target: "idle"
          }
        ],
        CHILDREN_CHANGE: [
          {
            guard: and("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
            actions: ["clearHighlightedValue", "highlightFirstItem"]
          },
          {
            guard: "isHighlightedItemRemoved",
            actions: ["clearHighlightedValue"]
          },
          {
            guard: "autoHighlight",
            actions: ["highlightFirstItem"]
          }
        ],
        "INPUT.ARROW_DOWN": {
          target: "interacting",
          actions: ["highlightNextItem"]
        },
        "INPUT.ARROW_UP": {
          target: "interacting",
          actions: ["highlightPrevItem"]
        },
        "INPUT.HOME": {
          target: "interacting",
          actions: ["highlightFirstItem"]
        },
        "INPUT.END": {
          target: "interacting",
          actions: ["highlightLastItem"]
        },
        "INPUT.ENTER": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"]
          },
          {
            guard: and("isCustomValue", not("hasHighlightedItem"), not("allowCustomValue")),
            target: "focused",
            actions: ["revertInputValue", "invokeOnClose"]
          },
          // == group 2 ==
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectHighlightedItem", "invokeOnClose"]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"]
          },
          {
            actions: ["selectHighlightedItem"]
          }
        ],
        "INPUT.CHANGE": {
          actions: ["setInputValue"]
        },
        "LAYER.ESCAPE": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["invokeOnClose"]
          }
        ],
        "ITEM.POINTER_MOVE": {
          target: "interacting",
          actions: ["setHighlightedValue"]
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedValue"]
        },
        "LAYER.INTERACT_OUTSIDE": [
          // == group 1 ==
          {
            guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
            actions: ["revertInputValue", "invokeOnClose"]
          },
          {
            guard: and("isCustomValue", not("allowCustomValue")),
            target: "idle",
            actions: ["revertInputValue", "invokeOnClose"]
          },
          // == group 2 ==
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "idle",
            actions: ["invokeOnClose"]
          }
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["invokeOnClose"]
          }
        ],
        "ITEM.CLICK": [
          {
            guard: and("isOpenControlled", "closeOnSelect"),
            actions: ["selectItem", "invokeOnClose"]
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectItem", "invokeOnClose", "setFinalFocus"]
          },
          {
            actions: ["selectItem"]
          }
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "setFinalFocus"]
          }
        ],
        "VALUE.CLEAR": [
          {
            guard: "isOpenControlled",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"]
          }
        ]
      }
    }
  },
  implementations: {
    guards: {
      isInputValueEmpty: ({ computed }) => computed("isInputValueEmpty"),
      autoComplete: ({ computed, prop }) => computed("autoComplete") && !prop("multiple"),
      autoHighlight: ({ computed }) => computed("autoHighlight"),
      isFirstItemHighlighted: ({ prop, context }) => prop("collection").firstValue === context.get("highlightedValue"),
      isLastItemHighlighted: ({ prop, context }) => prop("collection").lastValue === context.get("highlightedValue"),
      isCustomValue: ({ computed }) => computed("isCustomValue"),
      allowCustomValue: ({ prop }) => !!prop("allowCustomValue"),
      hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
      closeOnSelect: ({ prop }) => !!prop("closeOnSelect"),
      isOpenControlled: ({ prop }) => prop("open") != null,
      openOnChange: ({ prop, context }) => {
        const openOnChange = prop("openOnChange");
        if (utils.isBoolean(openOnChange)) return openOnChange;
        return !!openOnChange?.({ inputValue: context.get("inputValue") });
      },
      restoreFocus: ({ event }) => {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus;
        return restoreFocus == null ? true : !!restoreFocus;
      },
      isChangeEvent: ({ event }) => event.previousEvent?.type === "INPUT.CHANGE",
      autoFocus: ({ prop }) => !!prop("autoFocus"),
      isHighlightedItemRemoved: ({ prop, context }) => !prop("collection").has(context.get("highlightedValue")),
      hasCollectionItems: ({ prop }) => prop("collection").size > 0
    },
    effects: {
      trackDismissableLayer({ send, prop, scope }) {
        if (prop("disableLayer")) return;
        const contentEl = () => getContentEl(scope);
        return dismissable.trackDismissableElement(contentEl, {
          type: "listbox",
          defer: true,
          exclude: () => [getInputEl(scope), getTriggerEl(scope), getClearTriggerEl(scope)],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside: prop("onInteractOutside"),
          onEscapeKeyDown(event) {
            event.preventDefault();
            event.stopPropagation();
            send({ type: "LAYER.ESCAPE", src: "escape-key" });
          },
          onDismiss() {
            send({ type: "LAYER.INTERACT_OUTSIDE", src: "interact-outside", restoreFocus: false });
          }
        });
      },
      trackPlacement({ context, prop, scope }) {
        const anchorEl = () => getControlEl(scope) || getTriggerEl(scope);
        const positionerEl = () => getPositionerEl(scope);
        context.set("currentPlacement", prop("positioning").placement);
        return popper.getPlacement(anchorEl, positionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      scrollToHighlightedItem({ context, prop, scope, event }) {
        const inputEl = getInputEl(scope);
        let cleanups = [];
        const exec = (immediate) => {
          const pointer = event.current().type.includes("POINTER");
          const highlightedValue = context.get("highlightedValue");
          if (pointer || !highlightedValue) return;
          const contentEl = getContentEl(scope);
          const scrollToIndexFn = prop("scrollToIndexFn");
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue);
            scrollToIndexFn({
              index: highlightedIndex,
              immediate,
              getElement: () => getItemEl(scope, highlightedValue)
            });
            return;
          }
          const itemEl = getItemEl(scope, highlightedValue);
          const raf_cleanup = domQuery.raf(() => {
            domQuery.scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" });
          });
          cleanups.push(raf_cleanup);
        };
        const rafCleanup = domQuery.raf(() => exec(true));
        cleanups.push(rafCleanup);
        const observerCleanup = domQuery.observeAttributes(inputEl, {
          attributes: ["aria-activedescendant"],
          callback: () => exec(false)
        });
        cleanups.push(observerCleanup);
        return () => {
          cleanups.forEach((cleanup) => cleanup());
        };
      }
    },
    actions: {
      reposition({ context, prop, scope, event }) {
        const controlEl = () => getControlEl(scope);
        const positionerEl = () => getPositionerEl(scope);
        popper.getPlacement(controlEl, positionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement);
          }
        });
      },
      setHighlightedValue({ context, event }) {
        if (event.value == null) return;
        context.set("highlightedValue", event.value);
      },
      clearHighlightedValue({ context }) {
        context.set("highlightedValue", null);
      },
      selectHighlightedItem(params) {
        const { context, prop } = params;
        const collection2 = prop("collection");
        const highlightedValue = context.get("highlightedValue");
        if (!highlightedValue || !collection2.has(highlightedValue)) return;
        const nextValue = prop("multiple") ? utils.addOrRemove(context.get("value"), highlightedValue) : [highlightedValue];
        prop("onSelect")?.({ value: nextValue, itemValue: highlightedValue });
        context.set("value", nextValue);
        const inputValue = utils.match(prop("selectionBehavior"), {
          preserve: context.get("inputValue"),
          replace: collection2.stringifyMany(nextValue),
          clear: ""
        });
        context.set("inputValue", inputValue);
      },
      scrollToHighlightedItem({ context, prop, scope }) {
        domQuery.nextTick(() => {
          const highlightedValue = context.get("highlightedValue");
          if (highlightedValue == null) return;
          const itemEl = getItemEl(scope, highlightedValue);
          const contentEl = getContentEl(scope);
          const scrollToIndexFn = prop("scrollToIndexFn");
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue);
            scrollToIndexFn({
              index: highlightedIndex,
              immediate: true,
              getElement: () => getItemEl(scope, highlightedValue)
            });
            return;
          }
          domQuery.scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" });
        });
      },
      selectItem(params) {
        const { context, event, flush, prop } = params;
        if (event.value == null) return;
        flush(() => {
          const nextValue = prop("multiple") ? utils.addOrRemove(context.get("value"), event.value) : [event.value];
          prop("onSelect")?.({ value: nextValue, itemValue: event.value });
          context.set("value", nextValue);
          const inputValue = utils.match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(nextValue),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      clearItem(params) {
        const { context, event, flush, prop } = params;
        if (event.value == null) return;
        flush(() => {
          const nextValue = utils.remove(context.get("value"), event.value);
          context.set("value", nextValue);
          const inputValue = utils.match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(nextValue),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      setInitialFocus({ scope }) {
        domQuery.raf(() => {
          focusInputEl(scope);
        });
      },
      setFinalFocus({ scope }) {
        domQuery.raf(() => {
          const triggerEl = getTriggerEl(scope);
          if (triggerEl?.dataset.focusable == null) {
            focusInputEl(scope);
          } else {
            focusTriggerEl(scope);
          }
        });
      },
      syncInputValue({ context, scope, event }) {
        const inputEl = getInputEl(scope);
        if (!inputEl) return;
        inputEl.value = context.get("inputValue");
        queueMicrotask(() => {
          if (event.current().type === "INPUT.CHANGE") return;
          domQuery.setCaretToEnd(inputEl);
        });
      },
      setInputValue({ context, event }) {
        context.set("inputValue", event.value);
      },
      clearInputValue({ context }) {
        context.set("inputValue", "");
      },
      revertInputValue({ context, prop, computed }) {
        const selectionBehavior = prop("selectionBehavior");
        const inputValue = utils.match(selectionBehavior, {
          replace: computed("hasSelectedItems") ? computed("valueAsString") : "",
          preserve: context.get("inputValue"),
          clear: ""
        });
        context.set("inputValue", inputValue);
      },
      setValue(params) {
        const { context, flush, event, prop } = params;
        flush(() => {
          context.set("value", event.value);
          const inputValue = utils.match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany(event.value),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      clearSelectedItems(params) {
        const { context, flush, prop } = params;
        flush(() => {
          context.set("value", []);
          const inputValue = utils.match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: prop("collection").stringifyMany([]),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      scrollContentToTop({ prop, scope }) {
        const scrollToIndexFn = prop("scrollToIndexFn");
        if (scrollToIndexFn) {
          const firstValue = prop("collection").firstValue;
          scrollToIndexFn({
            index: 0,
            immediate: true,
            getElement: () => getItemEl(scope, firstValue)
          });
        } else {
          const contentEl = getContentEl(scope);
          if (!contentEl) return;
          contentEl.scrollTop = 0;
        }
      },
      invokeOnOpen({ prop, event, context }) {
        const reason = getOpenChangeReason(event);
        prop("onOpenChange")?.({ open: true, reason, value: context.get("value") });
      },
      invokeOnClose({ prop, event, context }) {
        const reason = getOpenChangeReason(event);
        prop("onOpenChange")?.({ open: false, reason, value: context.get("value") });
      },
      highlightFirstItem({ context, prop, scope }) {
        const exec = getContentEl(scope) ? queueMicrotask : domQuery.raf;
        exec(() => {
          const value = prop("collection").firstValue;
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightFirstItemIfNeeded({ computed, action }) {
        if (!computed("autoHighlight")) return;
        action(["highlightFirstItem"]);
      },
      highlightLastItem({ context, prop, scope }) {
        const exec = getContentEl(scope) ? queueMicrotask : domQuery.raf;
        exec(() => {
          const value = prop("collection").lastValue;
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightNextItem({ context, prop }) {
        let value = null;
        const highlightedValue = context.get("highlightedValue");
        const collection2 = prop("collection");
        if (highlightedValue) {
          value = collection2.getNextValue(highlightedValue);
          if (!value && prop("loopFocus")) value = collection2.firstValue;
        } else {
          value = collection2.firstValue;
        }
        if (value) context.set("highlightedValue", value);
      },
      highlightPrevItem({ context, prop }) {
        let value = null;
        const highlightedValue = context.get("highlightedValue");
        const collection2 = prop("collection");
        if (highlightedValue) {
          value = collection2.getPreviousValue(highlightedValue);
          if (!value && prop("loopFocus")) value = collection2.lastValue;
        } else {
          value = collection2.lastValue;
        }
        if (value) context.set("highlightedValue", value);
      },
      highlightFirstSelectedItem({ context, prop }) {
        domQuery.raf(() => {
          const [value] = prop("collection").sort(context.get("value"));
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightFirstOrSelectedItem({ context, prop, computed }) {
        domQuery.raf(() => {
          let value = null;
          if (computed("hasSelectedItems")) {
            value = prop("collection").sort(context.get("value"))[0];
          } else {
            value = prop("collection").firstValue;
          }
          if (value) context.set("highlightedValue", value);
        });
      },
      highlightLastOrSelectedItem({ context, prop, computed }) {
        domQuery.raf(() => {
          const collection2 = prop("collection");
          let value = null;
          if (computed("hasSelectedItems")) {
            value = collection2.sort(context.get("value"))[0];
          } else {
            value = collection2.lastValue;
          }
          if (value) context.set("highlightedValue", value);
        });
      },
      autofillInputValue({ context, computed, prop, event, scope }) {
        const inputEl = getInputEl(scope);
        const collection2 = prop("collection");
        if (!computed("autoComplete") || !inputEl || !event.keypress) return;
        const valueText = collection2.stringify(context.get("highlightedValue"));
        domQuery.raf(() => {
          inputEl.value = valueText || context.get("inputValue");
        });
      },
      syncSelectedItems(params) {
        queueMicrotask(() => {
          const { context, prop } = params;
          const collection2 = prop("collection");
          const value = context.get("value");
          const selectedItems = value.map((v) => {
            const item = context.get("selectedItems").find((item2) => collection2.getItemValue(item2) === v);
            return item || collection2.find(v);
          });
          context.set("selectedItems", selectedItems);
          const inputValue = utils.match(prop("selectionBehavior"), {
            preserve: context.get("inputValue"),
            replace: collection2.stringifyMany(value),
            clear: ""
          });
          context.set("inputValue", inputValue);
        });
      },
      syncHighlightedItem({ context, prop }) {
        const item = prop("collection").find(context.get("highlightedValue"));
        context.set("highlightedItem", item);
      },
      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event });
      }
    }
  }
});
function getOpenChangeReason(event) {
  return (event.previousEvent || event).src;
}
var props = types.createProps()([
  "allowCustomValue",
  "autoFocus",
  "closeOnSelect",
  "collection",
  "composite",
  "defaultHighlightedValue",
  "defaultInputValue",
  "defaultOpen",
  "defaultValue",
  "dir",
  "disabled",
  "disableLayer",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "inputBehavior",
  "inputValue",
  "invalid",
  "loopFocus",
  "multiple",
  "name",
  "navigate",
  "onFocusOutside",
  "onHighlightChange",
  "onInputValueChange",
  "onInteractOutside",
  "onOpenChange",
  "onOpenChange",
  "onPointerDownOutside",
  "onSelect",
  "onValueChange",
  "open",
  "openOnChange",
  "openOnClick",
  "openOnKeyPress",
  "placeholder",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "selectionBehavior",
  "translations",
  "value",
  "alwaysSubmitOnEnter"
]);
var splitProps = utils.createSplitProps(props);
var itemGroupLabelProps = types.createProps()(["htmlFor"]);
var splitItemGroupLabelProps = utils.createSplitProps(itemGroupLabelProps);
var itemGroupProps = types.createProps()(["id"]);
var splitItemGroupProps = utils.createSplitProps(itemGroupProps);
var itemProps = types.createProps()(["item", "persistFocus"]);
var splitItemProps = utils.createSplitProps(itemProps);

exports.anatomy = anatomy;
exports.collection = collection;
exports.connect = connect;
exports.itemGroupLabelProps = itemGroupLabelProps;
exports.itemGroupProps = itemGroupProps;
exports.itemProps = itemProps;
exports.machine = machine;
exports.props = props;
exports.splitItemGroupLabelProps = splitItemGroupLabelProps;
exports.splitItemGroupProps = splitItemGroupProps;
exports.splitItemProps = splitItemProps;
exports.splitProps = splitProps;
