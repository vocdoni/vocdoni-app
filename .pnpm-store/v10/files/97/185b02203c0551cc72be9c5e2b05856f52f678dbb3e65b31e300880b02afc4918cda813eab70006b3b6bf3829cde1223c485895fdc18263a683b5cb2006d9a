import { MediaChromeButton } from "./media-chrome-button.js";
import { globalThis } from "./utils/server-safe-globals.js";
import { MediaUIEvents, MediaUIAttributes } from "./constants.js";
import { getBooleanAttr, setBooleanAttr } from "./utils/element-utils.js";
import { t } from "./utils/i18n.js";
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

        :host([${MediaUIAttributes.MEDIA_LOOP}]) #checked-indicator {
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
  return t("Loop");
}
class MediaLoopButton extends MediaChromeButton {
  constructor() {
    super(...arguments);
    this.container = null;
  }
  static get observedAttributes() {
    return [...super.observedAttributes, MediaUIAttributes.MEDIA_LOOP];
  }
  connectedCallback() {
    var _a;
    super.connectedCallback();
    this.container = ((_a = this.shadowRoot) == null ? void 0 : _a.querySelector("#icon")) || null;
    if (this.container) {
      this.container.textContent = t("Loop");
    }
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_LOOP && this.container) {
      this.setAttribute(
        "aria-checked",
        this.mediaLoop ? "true" : "false"
      );
    }
  }
  get mediaLoop() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_LOOP);
  }
  set mediaLoop(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_LOOP, value);
  }
  handleClick() {
    const looping = !this.mediaLoop;
    const evt = new globalThis.CustomEvent(MediaUIEvents.MEDIA_LOOP_REQUEST, {
      composed: true,
      bubbles: true,
      detail: looping
    });
    this.dispatchEvent(evt);
  }
}
MediaLoopButton.getSlotTemplateHTML = getSlotTemplateHTML;
MediaLoopButton.getTooltipContentHTML = getTooltipContentHTML;
if (!globalThis.customElements.get("media-loop-button")) {
  globalThis.customElements.define("media-loop-button", MediaLoopButton);
}
var media_loop_button_default = MediaLoopButton;
export {
  media_loop_button_default as default
};
