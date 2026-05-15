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
var media_context_menu_item_exports = {};
__export(media_context_menu_item_exports, {
  MediaContextMenuItem: () => MediaContextMenuItem,
  default: () => media_context_menu_item_default
});
module.exports = __toCommonJS(media_context_menu_item_exports);
var import_server_safe_globals = require("../utils/server-safe-globals.js");
var import_media_chrome_menu_item = require("./media-chrome-menu-item.js");
function getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${import_media_chrome_menu_item.MediaChromeMenuItem.getTemplateHTML.call(this, _attrs)}
    <style>
        ::slotted(*) {
            color: var(--media-text-color, white);
            text-decoration: none;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            min-height: var(--media-control-height, 24px);
        }
    </style>
  `
  );
}
class MediaContextMenuItem extends import_media_chrome_menu_item.MediaChromeMenuItem {
}
MediaContextMenuItem.shadowRootOptions = { mode: "open" };
MediaContextMenuItem.getTemplateHTML = getTemplateHTML;
if (!import_server_safe_globals.globalThis.customElements.get("media-context-menu-item")) {
  import_server_safe_globals.globalThis.customElements.define(
    "media-context-menu-item",
    MediaContextMenuItem
  );
}
var media_context_menu_item_default = MediaContextMenuItem;
