"use strict";
import { defineConfig } from '../styled-system/config.js';
import { breakpoints } from './breakpoints.js';
import { globalCss } from './global-css.js';
import { layerStyles } from './layer-styles.js';
import { animationStyles } from './motion-styles.js';
import { recipes } from './recipes.js';
import { semanticColors } from './semantic-tokens/colors.js';
import { semanticRadii } from './semantic-tokens/radii.js';
import { semanticShadows } from './semantic-tokens/shadows.js';
import { slotRecipes } from './slot-recipes.js';
import { textStyles } from './text-styles.js';
import { animations } from './tokens/animations.js';
import { aspectRatios } from './tokens/aspect-ratios.js';
import { blurs } from './tokens/blurs.js';
import { borders } from './tokens/borders.js';
import { colors } from './tokens/colors.js';
import { cursor } from './tokens/cursor.js';
import { durations } from './tokens/durations.js';
import { easings } from './tokens/easings.js';
import { fontSizes } from './tokens/font-sizes.js';
import { fontWeights } from './tokens/font-weights.js';
import { fonts } from './tokens/fonts.js';
import { keyframes } from './tokens/keyframes.js';
import { letterSpacings } from './tokens/letter-spacing.js';
import { lineHeights } from './tokens/line-heights.js';
import { radii } from './tokens/radius.js';
import { sizes } from './tokens/sizes.js';
import { spacing } from './tokens/spacing.js';
import { zIndices } from './tokens/z-indices.js';
export { badgeRecipe } from './recipes/badge.js';
export { buttonRecipe } from './recipes/button.js';
export { checkmarkRecipe } from './recipes/checkmark.js';
export { codeRecipe } from './recipes/code.js';
export { colorSwatchRecipe } from './recipes/color-swatch.js';
export { containerRecipe } from './recipes/container.js';
export { headingRecipe } from './recipes/heading.js';
export { iconRecipe } from './recipes/icon.js';
export { inputRecipe } from './recipes/input.js';
export { inputAddonRecipe } from './recipes/input-addon.js';
export { kbdRecipe } from './recipes/kbd.js';
export { linkRecipe } from './recipes/link.js';
export { markRecipe } from './recipes/mark.js';
export { radiomarkRecipe } from './recipes/radiomark.js';
export { separatorRecipe } from './recipes/separator.js';
export { skeletonRecipe } from './recipes/skeleton.js';
export { skipNavLinkRecipe } from './recipes/skip-nav-link.js';
export { spinnerRecipe } from './recipes/spinner.js';
export { textareaRecipe } from './recipes/textarea.js';
export { accordionSlotRecipe } from './recipes/accordion.js';
export { actionBarSlotRecipe } from './recipes/action-bar.js';
export { alertSlotRecipe } from './recipes/alert.js';
export { avatarSlotRecipe } from './recipes/avatar.js';
export { blockquoteSlotRecipe } from './recipes/blockquote.js';
export { breadcrumbSlotRecipe } from './recipes/breadcrumb.js';
export { cardSlotRecipe } from './recipes/card.js';
export { carouselSlotRecipe } from './recipes/carousel.js';
export { checkboxSlotRecipe } from './recipes/checkbox.js';
export { checkboxCardSlotRecipe } from './recipes/checkbox-card.js';
export { codeBlockSlotRecipe } from './recipes/code-block.js';
export { collapsibleSlotRecipe } from './recipes/collapsible.js';
export { colorPickerSlotRecipe } from './recipes/color-picker.js';
export { comboboxSlotRecipe } from './recipes/combobox.js';
export { dataListSlotRecipe } from './recipes/data-list.js';
export { dialogSlotRecipe } from './recipes/dialog.js';
export { drawerSlotRecipe } from './recipes/drawer.js';
export { editableSlotRecipe } from './recipes/editable.js';
export { emptyStateSlotRecipe } from './recipes/empty-state.js';
export { fieldSlotRecipe } from './recipes/field.js';
export { fieldsetSlotRecipe } from './recipes/fieldset.js';
export { fileUploadSlotRecipe } from './recipes/file-upload.js';
export { hoverCardSlotRecipe } from './recipes/hover-card.js';
export { listSlotRecipe } from './recipes/list.js';
export { listboxSlotRecipe } from './recipes/listbox.js';
export { menuSlotRecipe } from './recipes/menu.js';
export { nativeSelectSlotRecipe } from './recipes/native-select.js';
export { numberInputSlotRecipe } from './recipes/number-input.js';
export { pinInputSlotRecipe } from './recipes/pin-input.js';
export { popoverSlotRecipe } from './recipes/popover.js';
export { progressSlotRecipe } from './recipes/progress.js';
export { progressCircleSlotRecipe } from './recipes/progress-circle.js';
export { qrCodeSlotRecipe } from './recipes/qr-code.js';
export { radioCardSlotRecipe } from './recipes/radio-card.js';
export { radioGroupSlotRecipe } from './recipes/radio-group.js';
export { ratingGroupSlotRecipe } from './recipes/rating-group.js';
export { scrollAreaSlotRecipe } from './recipes/scroll-area.js';
export { segmentGroupSlotRecipe } from './recipes/segment-group.js';
export { selectSlotRecipe } from './recipes/select.js';
export { sliderSlotRecipe } from './recipes/slider.js';
export { splitterSlotRecipe } from './recipes/splitter.js';
export { statSlotRecipe } from './recipes/stat.js';
export { statusSlotRecipe } from './recipes/status.js';
export { stepsSlotRecipe } from './recipes/steps.js';
export { switchSlotRecipe } from './recipes/switch.js';
export { tableSlotRecipe } from './recipes/table.js';
export { tabsSlotRecipe } from './recipes/tabs.js';
export { tagSlotRecipe } from './recipes/tag.js';
export { tagsInputSlotRecipe } from './recipes/tags-input.js';
export { timelineSlotRecipe } from './recipes/timeline.js';
export { toastSlotRecipe } from './recipes/toast.js';
export { tooltipSlotRecipe } from './recipes/tooltip.js';
export { treeViewSlotRecipe } from './recipes/tree-view.js';

const tokens = {
  aspectRatios,
  animations,
  blurs,
  borders,
  colors,
  durations,
  easings,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  spacing,
  sizes,
  zIndex: zIndices,
  cursor
};
const semanticTokens = {
  colors: semanticColors,
  shadows: semanticShadows,
  radii: semanticRadii
};
const cssVarsPrefix = "chakra";
const cssVarsRoot = ":where(html, .chakra-theme)";
const defaultThemeConfig = defineConfig({
  preflight: true,
  cssVarsPrefix,
  cssVarsRoot,
  globalCss,
  theme: {
    breakpoints,
    keyframes,
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
    textStyles,
    layerStyles,
    animationStyles
  }
});

export { animationStyles, breakpoints, cssVarsPrefix, cssVarsRoot, defaultThemeConfig, globalCss, keyframes, layerStyles, recipes, semanticTokens, slotRecipes, textStyles, tokens };
