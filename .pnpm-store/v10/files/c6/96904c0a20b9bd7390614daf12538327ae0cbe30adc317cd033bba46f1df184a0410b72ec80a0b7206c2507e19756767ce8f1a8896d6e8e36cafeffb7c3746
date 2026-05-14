import { globalThis } from "../utils/server-safe-globals.js";
import { MediaChromeMenuItem } from "./media-chrome-menu-item.js";
function getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${MediaChromeMenuItem.getTemplateHTML.call(this, _attrs)}
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
class MediaContextMenuItem extends MediaChromeMenuItem {
}
MediaContextMenuItem.shadowRootOptions = { mode: "open" };
MediaContextMenuItem.getTemplateHTML = getTemplateHTML;
if (!globalThis.customElements.get("media-context-menu-item")) {
  globalThis.customElements.define(
    "media-context-menu-item",
    MediaContextMenuItem
  );
}
var media_context_menu_item_default = MediaContextMenuItem;
export {
  MediaContextMenuItem,
  media_context_menu_item_default as default
};
