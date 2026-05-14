"use strict";
'use strict';

var config = require('../styled-system/config.cjs');
var breakpoints = require('./breakpoints.cjs');
var globalCss = require('./global-css.cjs');
var layerStyles = require('./layer-styles.cjs');
var motionStyles = require('./motion-styles.cjs');
var recipes = require('./recipes.cjs');
var colors$1 = require('./semantic-tokens/colors.cjs');
var radii = require('./semantic-tokens/radii.cjs');
var shadows = require('./semantic-tokens/shadows.cjs');
var slotRecipes = require('./slot-recipes.cjs');
var textStyles = require('./text-styles.cjs');
var animations = require('./tokens/animations.cjs');
var aspectRatios = require('./tokens/aspect-ratios.cjs');
var blurs = require('./tokens/blurs.cjs');
var borders = require('./tokens/borders.cjs');
var colors = require('./tokens/colors.cjs');
var cursor = require('./tokens/cursor.cjs');
var durations = require('./tokens/durations.cjs');
var easings = require('./tokens/easings.cjs');
var fontSizes = require('./tokens/font-sizes.cjs');
var fontWeights = require('./tokens/font-weights.cjs');
var fonts = require('./tokens/fonts.cjs');
var keyframes = require('./tokens/keyframes.cjs');
var letterSpacing = require('./tokens/letter-spacing.cjs');
var lineHeights = require('./tokens/line-heights.cjs');
var radius = require('./tokens/radius.cjs');
var sizes = require('./tokens/sizes.cjs');
var spacing = require('./tokens/spacing.cjs');
var zIndices = require('./tokens/z-indices.cjs');
var badge = require('./recipes/badge.cjs');
var button = require('./recipes/button.cjs');
var checkmark = require('./recipes/checkmark.cjs');
var code = require('./recipes/code.cjs');
var colorSwatch = require('./recipes/color-swatch.cjs');
var container = require('./recipes/container.cjs');
var heading = require('./recipes/heading.cjs');
var icon = require('./recipes/icon.cjs');
var input = require('./recipes/input.cjs');
var inputAddon = require('./recipes/input-addon.cjs');
var kbd = require('./recipes/kbd.cjs');
var link = require('./recipes/link.cjs');
var mark = require('./recipes/mark.cjs');
var radiomark = require('./recipes/radiomark.cjs');
var separator = require('./recipes/separator.cjs');
var skeleton = require('./recipes/skeleton.cjs');
var skipNavLink = require('./recipes/skip-nav-link.cjs');
var spinner = require('./recipes/spinner.cjs');
var textarea = require('./recipes/textarea.cjs');
var accordion = require('./recipes/accordion.cjs');
var actionBar = require('./recipes/action-bar.cjs');
var alert = require('./recipes/alert.cjs');
var avatar = require('./recipes/avatar.cjs');
var blockquote = require('./recipes/blockquote.cjs');
var breadcrumb = require('./recipes/breadcrumb.cjs');
var card = require('./recipes/card.cjs');
var carousel = require('./recipes/carousel.cjs');
var checkbox = require('./recipes/checkbox.cjs');
var checkboxCard = require('./recipes/checkbox-card.cjs');
var codeBlock = require('./recipes/code-block.cjs');
var collapsible = require('./recipes/collapsible.cjs');
var colorPicker = require('./recipes/color-picker.cjs');
var combobox = require('./recipes/combobox.cjs');
var dataList = require('./recipes/data-list.cjs');
var dialog = require('./recipes/dialog.cjs');
var drawer = require('./recipes/drawer.cjs');
var editable = require('./recipes/editable.cjs');
var emptyState = require('./recipes/empty-state.cjs');
var field = require('./recipes/field.cjs');
var fieldset = require('./recipes/fieldset.cjs');
var fileUpload = require('./recipes/file-upload.cjs');
var hoverCard = require('./recipes/hover-card.cjs');
var list = require('./recipes/list.cjs');
var listbox = require('./recipes/listbox.cjs');
var menu = require('./recipes/menu.cjs');
var nativeSelect = require('./recipes/native-select.cjs');
var numberInput = require('./recipes/number-input.cjs');
var pinInput = require('./recipes/pin-input.cjs');
var popover = require('./recipes/popover.cjs');
var progress = require('./recipes/progress.cjs');
var progressCircle = require('./recipes/progress-circle.cjs');
var qrCode = require('./recipes/qr-code.cjs');
var radioCard = require('./recipes/radio-card.cjs');
var radioGroup = require('./recipes/radio-group.cjs');
var ratingGroup = require('./recipes/rating-group.cjs');
var scrollArea = require('./recipes/scroll-area.cjs');
var segmentGroup = require('./recipes/segment-group.cjs');
var select = require('./recipes/select.cjs');
var slider = require('./recipes/slider.cjs');
var splitter = require('./recipes/splitter.cjs');
var stat = require('./recipes/stat.cjs');
var status = require('./recipes/status.cjs');
var steps = require('./recipes/steps.cjs');
var _switch = require('./recipes/switch.cjs');
var table = require('./recipes/table.cjs');
var tabs = require('./recipes/tabs.cjs');
var tag = require('./recipes/tag.cjs');
var tagsInput = require('./recipes/tags-input.cjs');
var timeline = require('./recipes/timeline.cjs');
var toast = require('./recipes/toast.cjs');
var tooltip = require('./recipes/tooltip.cjs');
var treeView = require('./recipes/tree-view.cjs');

const tokens = {
  aspectRatios: aspectRatios.aspectRatios,
  animations: animations.animations,
  blurs: blurs.blurs,
  borders: borders.borders,
  colors: colors.colors,
  durations: durations.durations,
  easings: easings.easings,
  fonts: fonts.fonts,
  fontSizes: fontSizes.fontSizes,
  fontWeights: fontWeights.fontWeights,
  letterSpacings: letterSpacing.letterSpacings,
  lineHeights: lineHeights.lineHeights,
  radii: radius.radii,
  spacing: spacing.spacing,
  sizes: sizes.sizes,
  zIndex: zIndices.zIndices,
  cursor: cursor.cursor
};
const semanticTokens = {
  colors: colors$1.semanticColors,
  shadows: shadows.semanticShadows,
  radii: radii.semanticRadii
};
const cssVarsPrefix = "chakra";
const cssVarsRoot = ":where(html, .chakra-theme)";
const defaultThemeConfig = config.defineConfig({
  preflight: true,
  cssVarsPrefix,
  cssVarsRoot,
  globalCss: globalCss.globalCss,
  theme: {
    breakpoints: breakpoints.breakpoints,
    keyframes: keyframes.keyframes,
    tokens,
    semanticTokens,
    recipes: recipes.recipes,
    slotRecipes: slotRecipes.slotRecipes,
    textStyles: textStyles.textStyles,
    layerStyles: layerStyles.layerStyles,
    animationStyles: motionStyles.animationStyles
  }
});

exports.breakpoints = breakpoints.breakpoints;
exports.globalCss = globalCss.globalCss;
exports.layerStyles = layerStyles.layerStyles;
exports.animationStyles = motionStyles.animationStyles;
exports.recipes = recipes.recipes;
exports.slotRecipes = slotRecipes.slotRecipes;
exports.textStyles = textStyles.textStyles;
exports.keyframes = keyframes.keyframes;
exports.badgeRecipe = badge.badgeRecipe;
exports.buttonRecipe = button.buttonRecipe;
exports.checkmarkRecipe = checkmark.checkmarkRecipe;
exports.codeRecipe = code.codeRecipe;
exports.colorSwatchRecipe = colorSwatch.colorSwatchRecipe;
exports.containerRecipe = container.containerRecipe;
exports.headingRecipe = heading.headingRecipe;
exports.iconRecipe = icon.iconRecipe;
exports.inputRecipe = input.inputRecipe;
exports.inputAddonRecipe = inputAddon.inputAddonRecipe;
exports.kbdRecipe = kbd.kbdRecipe;
exports.linkRecipe = link.linkRecipe;
exports.markRecipe = mark.markRecipe;
exports.radiomarkRecipe = radiomark.radiomarkRecipe;
exports.separatorRecipe = separator.separatorRecipe;
exports.skeletonRecipe = skeleton.skeletonRecipe;
exports.skipNavLinkRecipe = skipNavLink.skipNavLinkRecipe;
exports.spinnerRecipe = spinner.spinnerRecipe;
exports.textareaRecipe = textarea.textareaRecipe;
exports.accordionSlotRecipe = accordion.accordionSlotRecipe;
exports.actionBarSlotRecipe = actionBar.actionBarSlotRecipe;
exports.alertSlotRecipe = alert.alertSlotRecipe;
exports.avatarSlotRecipe = avatar.avatarSlotRecipe;
exports.blockquoteSlotRecipe = blockquote.blockquoteSlotRecipe;
exports.breadcrumbSlotRecipe = breadcrumb.breadcrumbSlotRecipe;
exports.cardSlotRecipe = card.cardSlotRecipe;
exports.carouselSlotRecipe = carousel.carouselSlotRecipe;
exports.checkboxSlotRecipe = checkbox.checkboxSlotRecipe;
exports.checkboxCardSlotRecipe = checkboxCard.checkboxCardSlotRecipe;
exports.codeBlockSlotRecipe = codeBlock.codeBlockSlotRecipe;
exports.collapsibleSlotRecipe = collapsible.collapsibleSlotRecipe;
exports.colorPickerSlotRecipe = colorPicker.colorPickerSlotRecipe;
exports.comboboxSlotRecipe = combobox.comboboxSlotRecipe;
exports.dataListSlotRecipe = dataList.dataListSlotRecipe;
exports.dialogSlotRecipe = dialog.dialogSlotRecipe;
exports.drawerSlotRecipe = drawer.drawerSlotRecipe;
exports.editableSlotRecipe = editable.editableSlotRecipe;
exports.emptyStateSlotRecipe = emptyState.emptyStateSlotRecipe;
exports.fieldSlotRecipe = field.fieldSlotRecipe;
exports.fieldsetSlotRecipe = fieldset.fieldsetSlotRecipe;
exports.fileUploadSlotRecipe = fileUpload.fileUploadSlotRecipe;
exports.hoverCardSlotRecipe = hoverCard.hoverCardSlotRecipe;
exports.listSlotRecipe = list.listSlotRecipe;
exports.listboxSlotRecipe = listbox.listboxSlotRecipe;
exports.menuSlotRecipe = menu.menuSlotRecipe;
exports.nativeSelectSlotRecipe = nativeSelect.nativeSelectSlotRecipe;
exports.numberInputSlotRecipe = numberInput.numberInputSlotRecipe;
exports.pinInputSlotRecipe = pinInput.pinInputSlotRecipe;
exports.popoverSlotRecipe = popover.popoverSlotRecipe;
exports.progressSlotRecipe = progress.progressSlotRecipe;
exports.progressCircleSlotRecipe = progressCircle.progressCircleSlotRecipe;
exports.qrCodeSlotRecipe = qrCode.qrCodeSlotRecipe;
exports.radioCardSlotRecipe = radioCard.radioCardSlotRecipe;
exports.radioGroupSlotRecipe = radioGroup.radioGroupSlotRecipe;
exports.ratingGroupSlotRecipe = ratingGroup.ratingGroupSlotRecipe;
exports.scrollAreaSlotRecipe = scrollArea.scrollAreaSlotRecipe;
exports.segmentGroupSlotRecipe = segmentGroup.segmentGroupSlotRecipe;
exports.selectSlotRecipe = select.selectSlotRecipe;
exports.sliderSlotRecipe = slider.sliderSlotRecipe;
exports.splitterSlotRecipe = splitter.splitterSlotRecipe;
exports.statSlotRecipe = stat.statSlotRecipe;
exports.statusSlotRecipe = status.statusSlotRecipe;
exports.stepsSlotRecipe = steps.stepsSlotRecipe;
exports.switchSlotRecipe = _switch.switchSlotRecipe;
exports.tableSlotRecipe = table.tableSlotRecipe;
exports.tabsSlotRecipe = tabs.tabsSlotRecipe;
exports.tagSlotRecipe = tag.tagSlotRecipe;
exports.tagsInputSlotRecipe = tagsInput.tagsInputSlotRecipe;
exports.timelineSlotRecipe = timeline.timelineSlotRecipe;
exports.toastSlotRecipe = toast.toastSlotRecipe;
exports.tooltipSlotRecipe = tooltip.tooltipSlotRecipe;
exports.treeViewSlotRecipe = treeView.treeViewSlotRecipe;
exports.cssVarsPrefix = cssVarsPrefix;
exports.cssVarsRoot = cssVarsRoot;
exports.defaultThemeConfig = defaultThemeConfig;
exports.semanticTokens = semanticTokens;
exports.tokens = tokens;
