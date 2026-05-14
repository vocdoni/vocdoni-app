var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var _clickHandler, _keyDownHandler;
import { globalThis } from "./utils/server-safe-globals.js";
import { MediaChromeDialog } from "./media-chrome-dialog.js";
function getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: rgb(20 20 30 / .8);
        backdrop-filter: blur(10px);
      }

      #content {
        display: block;
        width: clamp(400px, 40vw, 700px);
        max-width: 90vw;
        text-align: left;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
      }

      .shortcuts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .shortcuts-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-table tr:last-child {
        border-bottom: none;
      }

      .shortcuts-table td {
        padding: 0.75rem 0.5rem;
      }

      .shortcuts-table td:first-child {
        text-align: right;
        padding-right: 1rem;
        width: 40%;
        min-width: 120px;
      }

      .shortcuts-table td:last-child {
        padding-left: 1rem;
      }

      .key {
        display: inline-block;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        margin: 0 0.2rem;
      }

      .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .key-combo {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .key-separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
    </style>
    <slot id="content">
      ${formatKeyboardShortcuts()}
    </slot>
  `
  );
}
function formatKeyboardShortcuts() {
  const shortcuts = [
    { keys: ["Space", "k"], description: "Toggle Playback" },
    { keys: ["m"], description: "Toggle mute" },
    { keys: ["f"], description: "Toggle fullscreen" },
    { keys: ["c"], description: "Toggle captions or subtitles, if available" },
    { keys: ["p"], description: "Toggle Picture in Picture" },
    { keys: ["\u2190", "j"], description: "Seek back 10s" },
    { keys: ["\u2192", "l"], description: "Seek forward 10s" },
    { keys: ["\u2191"], description: "Turn volume up" },
    { keys: ["\u2193"], description: "Turn volume down" },
    { keys: ["< (SHIFT+,)"], description: "Decrease playback rate" },
    { keys: ["> (SHIFT+.)"], description: "Increase playback rate" }
  ];
  const rows = shortcuts.map(({ keys, description }) => {
    const keyCombo = keys.map(
      (key, index) => index > 0 ? `<span class="key-separator">or</span><span class="key">${key}</span>` : `<span class="key">${key}</span>`
    ).join("");
    return `
      <tr>
        <td>
          <div class="key-combo">${keyCombo}</div>
        </td>
        <td class="description">${description}</td>
      </tr>
    `;
  }).join("");
  return `
    <h2>Keyboard Shortcuts</h2>
    <table class="shortcuts-table">${rows}</table>
  `;
}
class MediaKeyboardShortcutsDialog extends MediaChromeDialog {
  constructor() {
    super(...arguments);
    __privateAdd(this, _clickHandler, (e) => {
      var _a;
      if (!this.open)
        return;
      const content = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector("#content");
      if (!content)
        return;
      const path = e.composedPath();
      const isClickOnHost = path[0] === this || path.includes(this);
      const isClickInsideContent = path.includes(content);
      if (isClickOnHost && !isClickInsideContent) {
        this.open = false;
      }
    });
    __privateAdd(this, _keyDownHandler, (e) => {
      if (!this.open)
        return;
      const isShiftSlash = e.shiftKey && (e.key === "/" || e.key === "?");
      if ((e.key === "Escape" || isShiftSlash) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        this.open = false;
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.open) {
      this.addEventListener("click", __privateGet(this, _clickHandler));
      document.addEventListener("keydown", __privateGet(this, _keyDownHandler));
    }
  }
  disconnectedCallback() {
    this.removeEventListener("click", __privateGet(this, _clickHandler));
    document.removeEventListener("keydown", __privateGet(this, _keyDownHandler));
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === "open") {
      if (this.open) {
        this.addEventListener("click", __privateGet(this, _clickHandler));
        document.addEventListener("keydown", __privateGet(this, _keyDownHandler));
      } else {
        this.removeEventListener("click", __privateGet(this, _clickHandler));
        document.removeEventListener("keydown", __privateGet(this, _keyDownHandler));
      }
    }
  }
}
_clickHandler = new WeakMap();
_keyDownHandler = new WeakMap();
MediaKeyboardShortcutsDialog.getSlotTemplateHTML = getSlotTemplateHTML;
if (!globalThis.customElements.get("media-keyboard-shortcuts-dialog")) {
  globalThis.customElements.define("media-keyboard-shortcuts-dialog", MediaKeyboardShortcutsDialog);
}
var media_keyboard_shortcuts_dialog_default = MediaKeyboardShortcutsDialog;
export {
  MediaKeyboardShortcutsDialog,
  media_keyboard_shortcuts_dialog_default as default
};
