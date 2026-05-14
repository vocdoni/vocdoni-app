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
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var media_context_menu_exports = {};
__export(media_context_menu_exports, {
  MediaContextMenu: () => MediaContextMenu,
  default: () => media_context_menu_default
});
module.exports = __toCommonJS(media_context_menu_exports);
var import_server_safe_globals = require("../utils/server-safe-globals.js");
var import_media_chrome_menu = require("./media-chrome-menu.js");
var import_element_utils = require("../utils/element-utils.js");
var _isContextMenuOpen, _updateVisibility, updateVisibility_fn, _closeContextMenu, closeContextMenu_fn, _closeOtherContextMenus, closeOtherContextMenus_fn, _isVideoContainer, isVideoContainer_fn, _onControllerContextMenu, _onContextMenu, onContextMenu_fn, _onDocumentClick, _onKeyDown, _onMenuClick;
function getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
      ${import_media_chrome_menu.MediaChromeMenu.getTemplateHTML(_attrs)}
      <style>
        :host {
          --_menu-bg: rgb(20 20 30 / .8);
          background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
          min-width: var(--media-settings-menu-min-width, 170px);
          border-radius: 2px;
          overflow: hidden;
        }
      </style>
    `
  );
}
class MediaContextMenu extends import_media_chrome_menu.MediaChromeMenu {
  constructor() {
    super();
    __privateAdd(this, _updateVisibility);
    __privateAdd(this, _closeContextMenu);
    __privateAdd(this, _closeOtherContextMenus);
    __privateAdd(this, _isVideoContainer);
    __privateAdd(this, _onContextMenu);
    __privateAdd(this, _isContextMenuOpen, false);
    __privateAdd(this, _onControllerContextMenu, (event) => {
      const target = event.target;
      const isVideoElement = (target == null ? void 0 : target.nodeName) === "VIDEO";
      const isVideoContainer = __privateMethod(this, _isVideoContainer, isVideoContainer_fn).call(this, target);
      if (isVideoElement || isVideoContainer) {
        if (!__privateGet(this, _isContextMenuOpen)) {
          __privateMethod(this, _onContextMenu, onContextMenu_fn).call(this, event);
        } else {
          __privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
        }
      }
    });
    __privateAdd(this, _onDocumentClick, (event) => {
      const target = event.target;
      const isInsideMenu = this.contains(target);
      const isRightClick = event.button === 2;
      const isVideo = (target == null ? void 0 : target.nodeName) === "VIDEO";
      const isVideoContainer = __privateMethod(this, _isVideoContainer, isVideoContainer_fn).call(this, target);
      if (isInsideMenu) {
        return;
      }
      const isRightClickOnVideo = isRightClick && (isVideo || isVideoContainer);
      if (isRightClickOnVideo) {
        return;
      }
      __privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
    });
    __privateAdd(this, _onKeyDown, (event) => {
      if (event.key === "Escape") {
        __privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
      }
    });
    __privateAdd(this, _onMenuClick, (event) => {
      var _a, _b;
      const target = event.target;
      if ((_a = target.matches) == null ? void 0 : _a.call(target, 'button[invoke="copy"]')) {
        const input = (_b = target.closest("media-context-menu-item")) == null ? void 0 : _b.querySelector('input[slot="copy"]');
        input && navigator.clipboard.writeText(input.value);
      }
      __privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
    });
    this.setAttribute("noautohide", "");
    __privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
  }
  connectedCallback() {
    super.connectedCallback();
    (0, import_element_utils.getMediaController)(this).addEventListener(
      "contextmenu",
      __privateGet(this, _onControllerContextMenu)
    );
    this.addEventListener("click", __privateGet(this, _onMenuClick));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    (0, import_element_utils.getMediaController)(this).removeEventListener(
      "contextmenu",
      __privateGet(this, _onControllerContextMenu)
    );
    this.removeEventListener("click", __privateGet(this, _onMenuClick));
    document.removeEventListener("mousedown", __privateGet(this, _onDocumentClick));
    document.removeEventListener("keydown", __privateGet(this, _onKeyDown));
  }
}
_isContextMenuOpen = new WeakMap();
_updateVisibility = new WeakSet();
updateVisibility_fn = function() {
  this.hidden = !__privateGet(this, _isContextMenuOpen);
};
_closeContextMenu = new WeakSet();
closeContextMenu_fn = function() {
  __privateSet(this, _isContextMenuOpen, false);
  __privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
};
_closeOtherContextMenus = new WeakSet();
closeOtherContextMenus_fn = function() {
  const allContextMenus = document.querySelectorAll("media-context-menu");
  allContextMenus.forEach((menu) => {
    var _a;
    if (menu !== this) {
      __privateMethod(_a = menu, _closeContextMenu, closeContextMenu_fn).call(_a);
    }
  });
};
_isVideoContainer = new WeakSet();
isVideoContainer_fn = function(element) {
  if (!element)
    return false;
  if (element.hasAttribute("slot") && element.getAttribute("slot") === "media") {
    return true;
  }
  if (element.nodeName.includes("-") && element.tagName.includes("-")) {
    const hasVideoAttributes = element.hasAttribute("src") || element.hasAttribute("poster") || element.hasAttribute("preload") || element.hasAttribute("playsinline");
    return hasVideoAttributes;
  }
  return false;
};
_onControllerContextMenu = new WeakMap();
_onContextMenu = new WeakSet();
onContextMenu_fn = function(event) {
  event.preventDefault();
  __privateMethod(this, _closeOtherContextMenus, closeOtherContextMenus_fn).call(this);
  __privateSet(this, _isContextMenuOpen, true);
  this.style.position = "fixed";
  this.style.left = `${event.clientX}px`;
  this.style.top = `${event.clientY}px`;
  __privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
  document.addEventListener("mousedown", __privateGet(this, _onDocumentClick), {
    once: true
  });
  document.addEventListener("keydown", __privateGet(this, _onKeyDown), { once: true });
};
_onDocumentClick = new WeakMap();
_onKeyDown = new WeakMap();
_onMenuClick = new WeakMap();
MediaContextMenu.getTemplateHTML = getTemplateHTML;
if (!import_server_safe_globals.globalThis.customElements.get("media-context-menu")) {
  import_server_safe_globals.globalThis.customElements.define("media-context-menu", MediaContextMenu);
}
var media_context_menu_default = MediaContextMenu;
