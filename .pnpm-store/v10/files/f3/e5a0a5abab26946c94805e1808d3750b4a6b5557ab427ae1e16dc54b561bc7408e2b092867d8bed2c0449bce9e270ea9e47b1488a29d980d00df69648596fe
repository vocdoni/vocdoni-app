import { createAnatomy } from '@zag-js/anatomy';
import { dataAttr, isLeftClick, ariaAttr } from '@zag-js/dom-query';
import { createMachine } from '@zag-js/core';
import { uuid, createSplitProps } from '@zag-js/utils';
import { createProps } from '@zag-js/types';

// src/password-input.anatomy.ts
var anatomy = createAnatomy("password-input").parts(
  "root",
  "input",
  "label",
  "control",
  "indicator",
  "visibilityTrigger"
);
var parts = anatomy.build();

// src/password-input.dom.ts
var getInputId = (ctx) => ctx.ids?.input ?? `p-input-${ctx.id}-input`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));

// src/password-input.connect.ts
function connect(service, normalize) {
  const { scope, prop, context } = service;
  const visible = context.get("visible");
  const disabled = !!prop("disabled");
  const invalid = !!prop("invalid");
  const readOnly = !!prop("readOnly");
  const required = !!prop("required");
  const interactive = !(readOnly || disabled);
  const translations = prop("translations");
  return {
    visible,
    disabled,
    invalid,
    focus() {
      getInputEl(scope)?.focus();
    },
    setVisible(value) {
      service.send({ type: "VISIBILITY.SET", value });
    },
    toggleVisible() {
      service.send({ type: "VISIBILITY.SET", value: !visible });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly)
      });
    },
    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        htmlFor: getInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-required": dataAttr(required)
      });
    },
    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        id: getInputId(scope),
        autoCapitalize: "off",
        name: prop("name"),
        required: prop("required"),
        autoComplete: prop("autoComplete"),
        spellCheck: false,
        readOnly,
        disabled,
        type: visible ? "text" : "password",
        "data-state": visible ? "visible" : "hidden",
        "aria-invalid": ariaAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        ...prop("ignorePasswordManagers") ? passwordManagerProps : {}
      });
    },
    getVisibilityTriggerProps() {
      return normalize.button({
        ...parts.visibilityTrigger.attrs,
        type: "button",
        tabIndex: -1,
        "aria-controls": getInputId(scope),
        "aria-expanded": visible,
        "data-readonly": dataAttr(readOnly),
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-state": visible ? "visible" : "hidden",
        "aria-label": translations?.visibilityTrigger?.(visible),
        onPointerDown(event) {
          if (!isLeftClick(event)) return;
          if (!interactive) return;
          event.preventDefault();
          service.send({ type: "TRIGGER.CLICK" });
        }
      });
    },
    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        "data-state": visible ? "visible" : "hidden",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly)
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly)
      });
    }
  };
}
var passwordManagerProps = {
  // 1Password
  "data-1p-ignore": "",
  // LastPass
  "data-lpignore": "true",
  // Bitwarden
  "data-bwignore": "true",
  // Dashlane
  "data-form-type": "other",
  // Proton Pass
  "data-protonpass-ignore": "true"
};
var machine = createMachine({
  props({ props: props2 }) {
    return {
      id: uuid(),
      defaultVisible: false,
      autoComplete: "current-password",
      ignorePasswordManagers: false,
      ...props2,
      translations: {
        visibilityTrigger(visible) {
          return visible ? "Hide password" : "Show password";
        },
        ...props2.translations
      }
    };
  },
  context({ prop, bindable }) {
    return {
      visible: bindable(() => ({
        value: prop("visible"),
        defaultValue: prop("defaultVisible"),
        onChange(value) {
          prop("onVisibilityChange")?.({ visible: value });
        }
      }))
    };
  },
  initialState() {
    return "idle";
  },
  effects: ["trackFormEvents"],
  states: {
    idle: {
      on: {
        "VISIBILITY.SET": {
          actions: ["setVisibility"]
        },
        "TRIGGER.CLICK": {
          actions: ["toggleVisibility", "focusInputEl"]
        }
      }
    }
  },
  implementations: {
    actions: {
      setVisibility({ context, event }) {
        context.set("visible", event.value);
      },
      toggleVisibility({ context }) {
        context.set("visible", (c) => !c);
      },
      focusInputEl({ scope }) {
        const inputEl = getInputEl(scope);
        inputEl?.focus();
      }
    },
    effects: {
      trackFormEvents({ scope, send }) {
        const inputEl = getInputEl(scope);
        const form = inputEl?.form;
        if (!form) return;
        const win = scope.getWin();
        const controller = new win.AbortController();
        form.addEventListener(
          "reset",
          (event) => {
            if (event.defaultPrevented) return;
            send({ type: "VISIBILITY.SET", value: false });
          },
          { signal: controller.signal }
        );
        form.addEventListener(
          "submit",
          () => {
            send({ type: "VISIBILITY.SET", value: false });
          },
          { signal: controller.signal }
        );
        return () => controller.abort();
      }
    }
  }
});
var props = createProps()([
  "defaultVisible",
  "dir",
  "id",
  "onVisibilityChange",
  "visible",
  "ids",
  "getRootNode",
  "disabled",
  "invalid",
  "required",
  "readOnly",
  "translations",
  "ignorePasswordManagers",
  "autoComplete",
  "name"
]);
var splitProps = createSplitProps(props);

export { anatomy, connect, machine, props, splitProps };
