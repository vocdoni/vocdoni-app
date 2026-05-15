import { createAnatomy } from '@zag-js/anatomy';
import { raf, addDomEvent, getWindow, contains, getEventTarget, dataAttr, visuallyHiddenStyle } from '@zag-js/dom-query';
import { getAcceptAttrString, isFileEqual, isValidFileType, isValidFileSize, getFileEntries } from '@zag-js/file-utils';
import { formatBytes } from '@zag-js/i18n-utils';
import { createProps } from '@zag-js/types';
import { warn, callAll, createSplitProps, flatArray } from '@zag-js/utils';
import { createMachine } from '@zag-js/core';

// src/file-upload.anatomy.ts
var anatomy = createAnatomy("file-upload").parts(
  "root",
  "dropzone",
  "item",
  "itemDeleteTrigger",
  "itemGroup",
  "itemName",
  "itemPreview",
  "itemPreviewImage",
  "itemSizeText",
  "label",
  "trigger",
  "clearTrigger"
);
var parts = anatomy.build();

// src/file-upload.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `file:${ctx.id}`;
var getDropzoneId = (ctx) => ctx.ids?.dropzone ?? `file:${ctx.id}:dropzone`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `file:${ctx.id}:input`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `file:${ctx.id}:trigger`;
var getLabelId = (ctx) => ctx.ids?.label ?? `file:${ctx.id}:label`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `file:${ctx.id}:item:${id}`;
var getItemNameId = (ctx, id) => ctx.ids?.itemName?.(id) ?? `file:${ctx.id}:item-name:${id}`;
var getItemSizeTextId = (ctx, id) => ctx.ids?.itemSizeText?.(id) ?? `file:${ctx.id}:item-size:${id}`;
var getItemPreviewId = (ctx, id) => ctx.ids?.itemPreview?.(id) ?? `file:${ctx.id}:item-preview:${id}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDropzoneEl = (ctx) => ctx.getById(getDropzoneId(ctx));
function isEventWithFiles(event) {
  const target = getEventTarget(event);
  if (!event.dataTransfer) return !!target && "files" in target;
  return event.dataTransfer.types.some((type) => {
    return type === "Files" || type === "application/x-moz-file";
  });
}
function isFilesWithinRange(ctx, incomingCount, currentAcceptedFiles) {
  const { prop, computed } = ctx;
  if (!computed("multiple") && incomingCount > 1) return false;
  if (!computed("multiple") && incomingCount + currentAcceptedFiles.length === 2) return true;
  if (incomingCount + currentAcceptedFiles.length > prop("maxFiles")) return false;
  return true;
}
function getEventFiles(ctx, files, currentAcceptedFiles = [], currentRejectedFiles = []) {
  const { prop, computed } = ctx;
  const acceptedFiles = [];
  const rejectedFiles = [];
  const validateParams = {
    acceptedFiles: currentAcceptedFiles,
    rejectedFiles: currentRejectedFiles
  };
  files.forEach((file) => {
    const [accepted, acceptError] = isValidFileType(file, computed("acceptAttr"));
    const [sizeMatch, sizeError] = isValidFileSize(file, prop("minFileSize"), prop("maxFileSize"));
    const validateErrors = prop("validate")?.(file, validateParams);
    const valid = validateErrors ? validateErrors.length === 0 : true;
    if (accepted && sizeMatch && valid) {
      acceptedFiles.push(file);
    } else {
      const errors = [acceptError, sizeError];
      if (!valid) errors.push(...validateErrors ?? []);
      rejectedFiles.push({ file, errors: errors.filter(Boolean) });
    }
  });
  if (!isFilesWithinRange(ctx, acceptedFiles.length, currentAcceptedFiles)) {
    acceptedFiles.forEach((file) => {
      rejectedFiles.push({ file, errors: ["TOO_MANY_FILES"] });
    });
    acceptedFiles.splice(0);
  }
  return {
    acceptedFiles,
    rejectedFiles
  };
}
function setInputFiles(inputEl, files) {
  const win = getWindow(inputEl);
  try {
    if ("DataTransfer" in win) {
      const dataTransfer = new win.DataTransfer();
      files.forEach((file) => {
        dataTransfer.items.add(file);
      });
      inputEl.files = dataTransfer.files;
    }
  } catch {
  }
}

// src/file-upload.connect.ts
var DEFAULT_ITEM_TYPE = "accepted";
var INTERACTIVE_SELECTOR = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
function isInteractiveTarget(element, container) {
  if (!element || element.getAttribute("type") === "file") return false;
  const interactive = element.closest(INTERACTIVE_SELECTOR);
  return interactive != container && contains(container, interactive);
}
function connect(service, normalize) {
  const { state, send, prop, computed, scope, context } = service;
  const disabled = !!prop("disabled");
  const required = !!prop("required");
  const allowDrop = prop("allowDrop");
  const translations = prop("translations");
  const dragging = state.matches("dragging");
  const focused = state.matches("focused") && !disabled;
  return {
    dragging,
    focused,
    disabled: !!disabled,
    transforming: context.get("transforming"),
    openFilePicker() {
      if (disabled) return;
      send({ type: "OPEN" });
    },
    deleteFile(file, type = DEFAULT_ITEM_TYPE) {
      send({ type: "FILE.DELETE", file, itemType: type });
    },
    acceptedFiles: context.get("acceptedFiles"),
    rejectedFiles: context.get("rejectedFiles"),
    setFiles(files) {
      send({ type: "FILES.SET", files, count: files.length });
    },
    clearRejectedFiles() {
      send({ type: "REJECTED_FILES.CLEAR" });
    },
    clearFiles() {
      send({ type: "FILES.CLEAR" });
    },
    getFileSize(file) {
      return formatBytes(file.size, prop("locale"));
    },
    createFileUrl(file, cb) {
      const win = scope.getWin();
      const url = win.URL.createObjectURL(file);
      cb(url);
      return () => win.URL.revokeObjectURL(url);
    },
    setClipboardFiles(dt) {
      if (disabled) return false;
      const items = Array.from(dt?.items ?? []);
      const files = items.reduce((acc, item) => {
        if (item.kind !== "file") return acc;
        const file = item.getAsFile();
        if (!file) return acc;
        return [...acc, file];
      }, []);
      if (!files.length) return false;
      send({ type: "FILES.SET", files });
      return true;
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: getRootId(scope),
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(dragging)
      });
    },
    getDropzoneProps(props2 = {}) {
      return normalize.element({
        ...parts.dropzone.attrs,
        dir: prop("dir"),
        id: getDropzoneId(scope),
        tabIndex: disabled || props2.disableClick ? void 0 : 0,
        role: props2.disableClick ? "application" : "button",
        "aria-label": translations.dropzone,
        "aria-disabled": disabled,
        "data-invalid": dataAttr(prop("invalid")),
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(dragging),
        onKeyDown(event) {
          if (disabled) return;
          if (event.defaultPrevented) return;
          const target = getEventTarget(event);
          if (!contains(event.currentTarget, target)) return;
          if (isInteractiveTarget(target, event.currentTarget)) return;
          if (props2.disableClick) return;
          if (event.key !== "Enter" && event.key !== " ") return;
          send({ type: "DROPZONE.CLICK", src: "keydown" });
        },
        onClick(event) {
          if (disabled) return;
          if (event.defaultPrevented) return;
          if (props2.disableClick) return;
          const target = getEventTarget(event);
          if (!contains(event.currentTarget, target)) return;
          if (isInteractiveTarget(target, event.currentTarget)) return;
          if (event.currentTarget.localName === "label") {
            event.preventDefault();
          }
          send({ type: "DROPZONE.CLICK" });
        },
        onDragOver(event) {
          if (disabled) return;
          if (!allowDrop) return;
          event.preventDefault();
          event.stopPropagation();
          try {
            event.dataTransfer.dropEffect = "copy";
          } catch {
          }
          const hasFiles = isEventWithFiles(event);
          if (!hasFiles) return;
          const count = event.dataTransfer.items.length;
          send({ type: "DROPZONE.DRAG_OVER", count });
        },
        onDragLeave(event) {
          if (disabled) return;
          if (!allowDrop) return;
          if (contains(event.currentTarget, event.relatedTarget)) return;
          send({ type: "DROPZONE.DRAG_LEAVE" });
        },
        onDrop(event) {
          if (disabled) return;
          if (allowDrop) {
            event.preventDefault();
            event.stopPropagation();
          }
          const hasFiles = isEventWithFiles(event);
          if (disabled || !hasFiles) return;
          getFileEntries(event.dataTransfer.items, prop("directory")).then((files) => {
            send({ type: "DROPZONE.DROP", files: flatArray(files) });
          });
        },
        onFocus() {
          if (disabled) return;
          send({ type: "DROPZONE.FOCUS" });
        },
        onBlur() {
          if (disabled) return;
          send({ type: "DROPZONE.BLUR" });
        }
      });
    },
    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: getTriggerId(scope),
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(prop("invalid")),
        type: "button",
        onClick(event) {
          if (disabled) return;
          if (contains(getDropzoneEl(scope), event.currentTarget)) {
            event.stopPropagation();
          }
          send({ type: "OPEN" });
        }
      });
    },
    getHiddenInputProps() {
      return normalize.input({
        id: getHiddenInputId(scope),
        tabIndex: -1,
        disabled,
        type: "file",
        required: prop("required"),
        capture: prop("capture"),
        name: prop("name"),
        accept: computed("acceptAttr"),
        webkitdirectory: prop("directory") ? "" : void 0,
        multiple: computed("multiple") || prop("maxFiles") > 1,
        onClick(event) {
          event.stopPropagation();
          event.currentTarget.value = "";
        },
        onInput(event) {
          if (disabled) return;
          const { files } = event.currentTarget;
          send({ type: "FILE.SELECT", files: files ? Array.from(files) : [] });
        },
        style: visuallyHiddenStyle
      });
    },
    getItemGroupProps(props2 = {}) {
      const { type = DEFAULT_ITEM_TYPE } = props2;
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemProps(props2) {
      const { file, type = DEFAULT_ITEM_TYPE } = props2;
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: getItemId(scope, file.name),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemNameProps(props2) {
      const { file, type = DEFAULT_ITEM_TYPE } = props2;
      return normalize.element({
        ...parts.itemName.attrs,
        dir: prop("dir"),
        id: getItemNameId(scope, file.name),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemSizeTextProps(props2) {
      const { file, type = DEFAULT_ITEM_TYPE } = props2;
      return normalize.element({
        ...parts.itemSizeText.attrs,
        dir: prop("dir"),
        id: getItemSizeTextId(scope, file.name),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemPreviewProps(props2) {
      const { file, type = DEFAULT_ITEM_TYPE } = props2;
      return normalize.element({
        ...parts.itemPreview.attrs,
        dir: prop("dir"),
        id: getItemPreviewId(scope, file.name),
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemPreviewImageProps(props2) {
      const { file, url, type = DEFAULT_ITEM_TYPE } = props2;
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        throw new Error("Preview Image is only supported for image files");
      }
      return normalize.img({
        ...parts.itemPreviewImage.attrs,
        alt: translations.itemPreview?.(file),
        src: url,
        "data-disabled": dataAttr(disabled),
        "data-type": type
      });
    },
    getItemDeleteTriggerProps(props2) {
      const { file, type = DEFAULT_ITEM_TYPE } = props2;
      return normalize.button({
        ...parts.itemDeleteTrigger.attrs,
        dir: prop("dir"),
        type: "button",
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-type": type,
        "aria-label": translations.deleteFile?.(file),
        onClick() {
          if (disabled) return;
          send({ type: "FILE.DELETE", file, itemType: type });
        }
      });
    },
    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        id: getLabelId(scope),
        htmlFor: getHiddenInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-required": dataAttr(required)
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        type: "button",
        disabled,
        hidden: context.get("acceptedFiles").length === 0,
        "data-disabled": dataAttr(disabled),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (disabled) return;
          send({ type: "FILES.CLEAR" });
        }
      });
    }
  };
}
var machine = createMachine({
  props({ props: props2 }) {
    return {
      minFileSize: 0,
      maxFileSize: Number.POSITIVE_INFINITY,
      maxFiles: 1,
      allowDrop: true,
      preventDocumentDrop: true,
      defaultAcceptedFiles: [],
      ...props2,
      translations: {
        dropzone: "dropzone",
        itemPreview: (file) => `preview of ${file.name}`,
        deleteFile: (file) => `delete file ${file.name}`,
        ...props2.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  context({ prop, bindable, getContext }) {
    return {
      acceptedFiles: bindable(() => ({
        defaultValue: prop("defaultAcceptedFiles"),
        value: prop("acceptedFiles"),
        isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file, b[i])),
        hash(value) {
          return value.map((file) => `${file.name}-${file.size}`).join(",");
        },
        onChange(value) {
          const ctx = getContext();
          prop("onFileAccept")?.({ files: value });
          prop("onFileChange")?.({ acceptedFiles: value, rejectedFiles: ctx.get("rejectedFiles") });
        }
      })),
      rejectedFiles: bindable(() => ({
        defaultValue: [],
        isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file.file, b[i].file)),
        onChange(value) {
          const ctx = getContext();
          prop("onFileReject")?.({ files: value });
          prop("onFileChange")?.({ acceptedFiles: ctx.get("acceptedFiles"), rejectedFiles: value });
        }
      })),
      transforming: bindable(() => ({
        defaultValue: false
      }))
    };
  },
  computed: {
    acceptAttr: ({ prop }) => getAcceptAttrString(prop("accept")),
    multiple: ({ prop }) => prop("maxFiles") > 1
  },
  watch({ track, context, action }) {
    track([() => context.hash("acceptedFiles")], () => {
      action(["syncInputElement"]);
    });
  },
  on: {
    "FILES.SET": {
      actions: ["setFiles"]
    },
    "FILE.SELECT": {
      actions: ["setEventFiles"]
    },
    "FILE.DELETE": {
      actions: ["removeFile"]
    },
    "FILES.CLEAR": {
      actions: ["clearFiles"]
    },
    "REJECTED_FILES.CLEAR": {
      actions: ["clearRejectedFiles"]
    }
  },
  effects: ["preventDocumentDrop"],
  states: {
    idle: {
      on: {
        OPEN: {
          actions: ["openFilePicker"]
        },
        "DROPZONE.CLICK": {
          actions: ["openFilePicker"]
        },
        "DROPZONE.FOCUS": {
          target: "focused"
        },
        "DROPZONE.DRAG_OVER": {
          target: "dragging"
        }
      }
    },
    focused: {
      on: {
        "DROPZONE.BLUR": {
          target: "idle"
        },
        OPEN: {
          actions: ["openFilePicker"]
        },
        "DROPZONE.CLICK": {
          actions: ["openFilePicker"]
        },
        "DROPZONE.DRAG_OVER": {
          target: "dragging"
        }
      }
    },
    dragging: {
      on: {
        "DROPZONE.DROP": {
          target: "idle",
          actions: ["setEventFiles"]
        },
        "DROPZONE.DRAG_LEAVE": {
          target: "idle"
        }
      }
    }
  },
  implementations: {
    effects: {
      preventDocumentDrop({ prop, scope }) {
        if (!prop("preventDocumentDrop")) return;
        if (!prop("allowDrop")) return;
        if (prop("disabled")) return;
        const doc = scope.getDoc();
        const onDragOver = (event) => {
          event?.preventDefault();
        };
        const onDrop = (event) => {
          if (contains(getRootEl(scope), getEventTarget(event))) return;
          event.preventDefault();
        };
        return callAll(addDomEvent(doc, "dragover", onDragOver, false), addDomEvent(doc, "drop", onDrop, false));
      }
    },
    actions: {
      syncInputElement({ scope, context }) {
        queueMicrotask(() => {
          const inputEl = getHiddenInputEl(scope);
          if (!inputEl) return;
          setInputFiles(inputEl, context.get("acceptedFiles"));
          const win = scope.getWin();
          inputEl.dispatchEvent(new win.Event("change", { bubbles: true }));
        });
      },
      openFilePicker({ scope }) {
        raf(() => {
          getHiddenInputEl(scope)?.click();
        });
      },
      setFiles(params) {
        const { computed, context, event } = params;
        const { acceptedFiles, rejectedFiles } = getEventFiles(params, event.files);
        context.set(
          "acceptedFiles",
          computed("multiple") ? acceptedFiles : acceptedFiles.length > 0 ? [acceptedFiles[0]] : []
        );
        context.set("rejectedFiles", rejectedFiles);
      },
      setEventFiles(params) {
        const { computed, context, event, prop } = params;
        const currentAcceptedFiles = context.get("acceptedFiles");
        const currentRejectedFiles = context.get("rejectedFiles");
        const { acceptedFiles, rejectedFiles } = getEventFiles(
          params,
          event.files,
          currentAcceptedFiles,
          currentRejectedFiles
        );
        const set = (files) => {
          if (computed("multiple")) {
            context.set("acceptedFiles", (prev) => [...prev, ...files]);
            context.set("rejectedFiles", rejectedFiles);
            return;
          }
          if (files.length) {
            context.set("acceptedFiles", [files[0]]);
            context.set("rejectedFiles", rejectedFiles);
            return;
          }
          if (rejectedFiles.length) {
            context.set("acceptedFiles", context.get("acceptedFiles"));
            context.set("rejectedFiles", rejectedFiles);
          }
        };
        const transform = prop("transformFiles");
        if (transform) {
          context.set("transforming", true);
          transform(acceptedFiles).then(set).catch((err) => {
            warn(`[zag-js/file-upload] error transforming files
${err}`);
          }).finally(() => {
            context.set("transforming", false);
          });
        } else {
          set(acceptedFiles);
        }
      },
      removeFile({ context, event }) {
        if (event.itemType === "rejected") {
          const rejectedFiles = context.get("rejectedFiles").filter((item) => !isFileEqual(item.file, event.file));
          context.set("rejectedFiles", rejectedFiles);
        } else {
          const files = context.get("acceptedFiles").filter((file) => !isFileEqual(file, event.file));
          context.set("acceptedFiles", files);
        }
      },
      clearRejectedFiles({ context }) {
        context.set("rejectedFiles", []);
      },
      clearFiles({ context }) {
        context.set("acceptedFiles", []);
        context.set("rejectedFiles", []);
      }
    }
  }
});
var props = createProps()([
  "accept",
  "acceptedFiles",
  "allowDrop",
  "capture",
  "defaultAcceptedFiles",
  "dir",
  "directory",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "locale",
  "maxFiles",
  "maxFileSize",
  "minFileSize",
  "name",
  "onFileAccept",
  "onFileChange",
  "onFileReject",
  "preventDocumentDrop",
  "required",
  "transformFiles",
  "translations",
  "validate"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["file", "type"]);
var splitItemProps = createSplitProps(itemProps);

export { anatomy, connect, itemProps, machine, props, splitItemProps, splitProps };
