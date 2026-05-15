"use strict";
'use strict';

var react = require('@ark-ui/react');
var accordion = require('@ark-ui/react/accordion');
var anatomy = require('@ark-ui/react/anatomy');
var clipboard = require('@ark-ui/react/clipboard');
var colorPicker = require('@ark-ui/react/color-picker');
var dialog = require('@ark-ui/react/dialog');
var editable = require('@ark-ui/react/editable');
var field = require('@ark-ui/react/field');
var fieldset = require('@ark-ui/react/fieldset');
var fileUpload = require('@ark-ui/react/file-upload');
var listbox = require('@ark-ui/react/listbox');
var menu = require('@ark-ui/react/menu');
var popover = require('@ark-ui/react/popover');
var radioGroup = require('@ark-ui/react/radio-group');
var ratingGroup = require('@ark-ui/react/rating-group');
var select = require('@ark-ui/react/select');
var slider = require('@ark-ui/react/slider');
var splitter = require('@ark-ui/react/splitter');
var _switch = require('@ark-ui/react/switch');
var treeView = require('@ark-ui/react/tree-view');
var avatar = require('@ark-ui/react/avatar');
var checkbox = require('@ark-ui/react/checkbox');
var collapsible = require('@ark-ui/react/collapsible');
var hoverCard = require('@ark-ui/react/hover-card');
var numberInput = require('@ark-ui/react/number-input');
var pinInput = require('@ark-ui/react/pin-input');
var progress = require('@ark-ui/react/progress');
var qrCode = require('@ark-ui/react/qr-code');
var scrollArea = require('@ark-ui/react/scroll-area');
var segmentGroup = require('@ark-ui/react/segment-group');
var tooltip = require('@ark-ui/react/tooltip');
var tagsInput = require('@ark-ui/react/tags-input');
var carousel = require('@ark-ui/react/carousel');

const accordionAnatomy = accordion.accordionAnatomy.extendWith("itemBody");
const actionBarAnatomy = anatomy.createAnatomy("action-bar").parts(
  "positioner",
  "content",
  "separator",
  "selectionTrigger",
  "closeTrigger"
);
const alertAnatomy = anatomy.createAnatomy("alert").parts(
  "title",
  "description",
  "root",
  "indicator",
  "content"
);
const breadcrumbAnatomy = anatomy.createAnatomy("breadcrumb").parts(
  "link",
  "currentLink",
  "item",
  "list",
  "root",
  "ellipsis",
  "separator"
);
const blockquoteAnatomy = anatomy.createAnatomy("blockquote").parts(
  "root",
  "icon",
  "content",
  "caption"
);
const cardAnatomy = anatomy.createAnatomy("card").parts(
  "root",
  "header",
  "body",
  "footer",
  "title",
  "description"
);
const checkboxCardAnatomy = anatomy.createAnatomy("checkbox-card", [
  "root",
  "control",
  "label",
  "description",
  "addon",
  "indicator",
  "content"
]);
const dataListAnatomy = anatomy.createAnatomy("data-list").parts(
  "root",
  "item",
  "itemLabel",
  "itemValue"
);
const dialogAnatomy = dialog.dialogAnatomy.extendWith(
  "header",
  "body",
  "footer",
  "backdrop"
);
const drawerAnatomy = dialog.dialogAnatomy.extendWith(
  "header",
  "body",
  "footer",
  "backdrop"
);
const editableAnatomy = editable.editableAnatomy.extendWith("textarea");
const emptyStateAnatomy = anatomy.createAnatomy("empty-state", [
  "root",
  "content",
  "indicator",
  "title",
  "description"
]);
const fieldAnatomy = field.fieldAnatomy.extendWith("requiredIndicator");
const fieldsetAnatomy = fieldset.fieldsetAnatomy.extendWith("content");
const fileUploadAnatomy = fileUpload.fileUploadAnatomy.extendWith(
  "itemContent",
  "dropzoneContent",
  "fileText"
);
const listAnatomy = anatomy.createAnatomy("list").parts(
  "root",
  "item",
  "indicator"
);
const menuAnatomy = menu.menuAnatomy.extendWith("itemCommand");
const nativeSelectAnatomy = anatomy.createAnatomy("select").parts(
  "root",
  "field",
  "indicator"
);
const popoverAnatomy = popover.popoverAnatomy.extendWith(
  "header",
  "body",
  "footer"
);
const radioGroupAnatomy = radioGroup.radioGroupAnatomy.extendWith(
  "itemAddon",
  "itemIndicator"
);
const radioCardAnatomy = radioGroupAnatomy.extendWith(
  "itemContent",
  "itemDescription"
);
const ratingGroupAnatomy = ratingGroup.ratingGroupAnatomy.extendWith("itemIndicator");
const selectAnatomy = select.selectAnatomy.extendWith("indicatorGroup");
const comboboxAnatomy = react.comboboxAnatomy.extendWith(
  "indicatorGroup",
  "empty"
);
const sliderAnatomy = slider.sliderAnatomy.extendWith(
  "markerIndicator",
  "markerLabel"
);
const statAnatomy = anatomy.createAnatomy("stat").parts(
  "root",
  "label",
  "helpText",
  "valueText",
  "valueUnit",
  "indicator"
);
const statusAnatomy = anatomy.createAnatomy("status").parts("root", "indicator");
const stepsAnatomy = anatomy.createAnatomy("steps", [
  "root",
  "list",
  "item",
  "trigger",
  "indicator",
  "separator",
  "content",
  "title",
  "description",
  "nextTrigger",
  "prevTrigger",
  "progress"
]);
const switchAnatomy = _switch.switchAnatomy.extendWith("indicator");
const tableAnatomy = anatomy.createAnatomy("table").parts(
  "root",
  "header",
  "body",
  "row",
  "columnHeader",
  "cell",
  "footer",
  "caption"
);
const toastAnatomy = anatomy.createAnatomy("toast").parts(
  "root",
  "title",
  "description",
  "indicator",
  "closeTrigger",
  "actionTrigger"
);
const tabsAnatomy = anatomy.createAnatomy("tabs").parts(
  "root",
  "trigger",
  "list",
  "content",
  "contentGroup",
  "indicator"
);
const tagAnatomy = anatomy.createAnatomy("tag").parts(
  "root",
  "label",
  "closeTrigger",
  "startElement",
  "endElement"
);
const timelineAnatomy = anatomy.createAnatomy("timeline").parts(
  "root",
  "item",
  "content",
  "separator",
  "indicator",
  "connector",
  "title",
  "description"
);
const colorPickerAnatomy = colorPicker.colorPickerAnatomy.extendWith("channelText");
const codeBlockAnatomy = anatomy.createAnatomy("code-block", [
  "root",
  "content",
  "title",
  "header",
  "footer",
  "control",
  "overlay",
  "code",
  "codeText",
  "copyTrigger",
  "copyIndicator",
  "collapseTrigger",
  "collapseIndicator",
  "collapseText"
]);
const splitterAnatomy = splitter.splitterAnatomy.extendWith(
  "resizeTriggerSeparator",
  "resizeTriggerIndicator"
);
const clipboardAnatomy = clipboard.clipboardAnatomy.extendWith("valueText");
const listboxAnatomy = listbox.listboxAnatomy;

Object.defineProperty(exports, "treeViewAnatomy", {
  enumerable: true,
  get: function () { return treeView.treeViewAnatomy; }
});
Object.defineProperty(exports, "avatarAnatomy", {
  enumerable: true,
  get: function () { return avatar.avatarAnatomy; }
});
Object.defineProperty(exports, "checkboxAnatomy", {
  enumerable: true,
  get: function () { return checkbox.checkboxAnatomy; }
});
Object.defineProperty(exports, "collapsibleAnatomy", {
  enumerable: true,
  get: function () { return collapsible.collapsibleAnatomy; }
});
Object.defineProperty(exports, "hoverCardAnatomy", {
  enumerable: true,
  get: function () { return hoverCard.hoverCardAnatomy; }
});
Object.defineProperty(exports, "numberInputAnatomy", {
  enumerable: true,
  get: function () { return numberInput.numberInputAnatomy; }
});
Object.defineProperty(exports, "pinInputAnatomy", {
  enumerable: true,
  get: function () { return pinInput.pinInputAnatomy; }
});
Object.defineProperty(exports, "progressAnatomy", {
  enumerable: true,
  get: function () { return progress.progressAnatomy; }
});
Object.defineProperty(exports, "qrCodeAnatomy", {
  enumerable: true,
  get: function () { return qrCode.qrCodeAnatomy; }
});
Object.defineProperty(exports, "scrollAreaAnatomy", {
  enumerable: true,
  get: function () { return scrollArea.scrollAreaAnatomy; }
});
Object.defineProperty(exports, "segmentGroupAnatomy", {
  enumerable: true,
  get: function () { return segmentGroup.segmentGroupAnatomy; }
});
Object.defineProperty(exports, "tooltipAnatomy", {
  enumerable: true,
  get: function () { return tooltip.tooltipAnatomy; }
});
Object.defineProperty(exports, "tagsInputAnatomy", {
  enumerable: true,
  get: function () { return tagsInput.tagsInputAnatomy; }
});
Object.defineProperty(exports, "carouselAnatomy", {
  enumerable: true,
  get: function () { return carousel.carouselAnatomy; }
});
exports.accordionAnatomy = accordionAnatomy;
exports.actionBarAnatomy = actionBarAnatomy;
exports.alertAnatomy = alertAnatomy;
exports.blockquoteAnatomy = blockquoteAnatomy;
exports.breadcrumbAnatomy = breadcrumbAnatomy;
exports.cardAnatomy = cardAnatomy;
exports.checkboxCardAnatomy = checkboxCardAnatomy;
exports.clipboardAnatomy = clipboardAnatomy;
exports.codeBlockAnatomy = codeBlockAnatomy;
exports.colorPickerAnatomy = colorPickerAnatomy;
exports.comboboxAnatomy = comboboxAnatomy;
exports.dataListAnatomy = dataListAnatomy;
exports.dialogAnatomy = dialogAnatomy;
exports.drawerAnatomy = drawerAnatomy;
exports.editableAnatomy = editableAnatomy;
exports.emptyStateAnatomy = emptyStateAnatomy;
exports.fieldAnatomy = fieldAnatomy;
exports.fieldsetAnatomy = fieldsetAnatomy;
exports.fileUploadAnatomy = fileUploadAnatomy;
exports.listAnatomy = listAnatomy;
exports.listboxAnatomy = listboxAnatomy;
exports.menuAnatomy = menuAnatomy;
exports.nativeSelectAnatomy = nativeSelectAnatomy;
exports.popoverAnatomy = popoverAnatomy;
exports.radioCardAnatomy = radioCardAnatomy;
exports.radioGroupAnatomy = radioGroupAnatomy;
exports.ratingGroupAnatomy = ratingGroupAnatomy;
exports.selectAnatomy = selectAnatomy;
exports.sliderAnatomy = sliderAnatomy;
exports.splitterAnatomy = splitterAnatomy;
exports.statAnatomy = statAnatomy;
exports.statusAnatomy = statusAnatomy;
exports.stepsAnatomy = stepsAnatomy;
exports.switchAnatomy = switchAnatomy;
exports.tableAnatomy = tableAnatomy;
exports.tabsAnatomy = tabsAnatomy;
exports.tagAnatomy = tagAnatomy;
exports.timelineAnatomy = timelineAnatomy;
exports.toastAnatomy = toastAnatomy;
