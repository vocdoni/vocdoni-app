var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var media_loop_button_exports = {};
__export(media_loop_button_exports, {
  default: () => media_loop_button_default
});
module.exports = __toCommonJS(media_loop_button_exports);
var import_media_chrome_button = require("./media-chrome-button.js");
var import_server_safe_globals = require("./utils/server-safe-globals.js");
var import_constants = require("./constants.js");
var import_element_utils = require("./utils/element-utils.js");
var import_i18n = require("./utils/i18n.js");
function getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
      <style>
        :host {
          min-width: 4ch;
          padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          font-weight: var(--media-button-font-weight, normal);
        }

        #checked-indicator {
          display: none;
        }

        :host([${import_constants.MediaUIAttributes.MEDIA_LOOP}]) #checked-indicator {
          display: block;
        }
      </style>
      
      <span id="icon">
     </span>

      <div id="checked-indicator">
        <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
          <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
        </svg>
      </div>
    `
  );
}
function getTooltipContentHTML() {
  return (0, import_i18n.t)("Loop");
}
class MediaLoopButton extends import_media_chrome_button.MediaChromeButton {
  constructor() {
    super(...arguments);
    this.container = null;
  }
  static get observedAttributes() {
    return [...super.observedAttributes, import_constants.MediaUIAttributes.MEDIA_LOOP];
  }
  connectedCallback() {
    var _a;
    super.connectedCallback();
    this.container = ((_a = this.shadowRoot) == null ? void 0 : _a.querySelector("#icon")) || null;
    if (this.container) {
      this.container.textContent = (0, import_i18n.t)("Loop");
    }
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === import_constants.MediaUIAttributes.MEDIA_LOOP && this.container) {
      this.setAttribute(
        "aria-checked",
        this.mediaLoop ? "true" : "false"
      );
    }
  }
  get mediaLoop() {
    return (0, import_element_utils.getBooleanAttr)(this, import_constants.MediaUIAttributes.MEDIA_LOOP);
  }
  set mediaLoop(value) {
    (0, import_element_utils.setBooleanAttr)(this, import_constants.MediaUIAttributes.MEDIA_LOOP, value);
  }
  handleClick() {
    const looping = !this.mediaLoop;
    const evt = new import_server_safe_globals.globalThis.CustomEvent(import_constants.MediaUIEvents.MEDIA_LOOP_REQUEST, {
      composed: true,
      bubbles: true,
      detail: looping
    });
    this.dispatchEvent(evt);
  }
}
MediaLoopButton.getSlotTemplateHTML = getSlotTemplateHTML;
MediaLoopButton.getTooltipContentHTML = getTooltipContentHTML;
if (!import_server_safe_globals.globalThis.customElements.get("media-loop-button")) {
  import_server_safe_globals.globalThis.customElements.define("media-loop-button", MediaLoopButton);
}
var media_loop_button_default = MediaLoopButton;
