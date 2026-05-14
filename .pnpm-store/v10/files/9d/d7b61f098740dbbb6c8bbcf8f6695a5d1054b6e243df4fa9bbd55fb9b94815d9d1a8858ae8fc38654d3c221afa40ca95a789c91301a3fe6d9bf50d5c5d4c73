'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var domQuery = require('@zag-js/dom-query');
var utils = require('@zag-js/utils');
var core = require('@zag-js/core');
var types = require('@zag-js/types');

// src/image-cropper.anatomy.ts
var anatomy = anatomy$1.createAnatomy("image-cropper").parts("root", "viewport", "image", "selection", "handle", "grid");
var parts = anatomy.build();

// src/get-resize-axis-style.ts
function getHandlePositionStyles(handlePosition) {
  switch (handlePosition) {
    case "n":
      return {
        position: "absolute",
        cursor: "n-resize",
        width: "96%",
        top: 0,
        left: "50%",
        translate: "-50% -50%"
      };
    case "e":
      return {
        position: "absolute",
        cursor: "e-resize",
        height: "96%",
        right: 0,
        top: "50%",
        translate: "50% -50%"
      };
    case "s":
      return {
        position: "absolute",
        cursor: "s-resize",
        width: "96%",
        bottom: 0,
        left: "50%",
        translate: "-50% 50%"
      };
    case "w":
      return {
        position: "absolute",
        cursor: "w-resize",
        height: "96%",
        left: 0,
        top: "50%",
        translate: "-50% -50%"
      };
    case "se":
      return {
        position: "absolute",
        cursor: "se-resize",
        bottom: 0,
        right: 0,
        translate: "50% 50%"
      };
    case "sw":
      return {
        position: "absolute",
        cursor: "sw-resize",
        bottom: 0,
        left: 0,
        translate: "-50% 50%"
      };
    case "ne":
      return {
        position: "absolute",
        cursor: "ne-resize",
        top: 0,
        right: 0,
        translate: "50% -50%"
      };
    case "nw":
      return {
        position: "absolute",
        cursor: "nw-resize",
        top: 0,
        left: 0,
        translate: "-50% -50%"
      };
    default:
      throw new Error(`Invalid handlePosition: ${handlePosition}`);
  }
}

// src/image-cropper.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `image-cropper:${ctx.id}`;
var getViewportId = (ctx) => ctx.ids?.viewport ?? `image-cropper:${ctx.id}:viewport`;
var getImageId = (ctx) => ctx.ids?.image ?? `image-cropper:${ctx.id}:image`;
var getSelectionId = (ctx) => ctx.ids?.selection ?? `image-cropper:${ctx.id}:selection`;
var getHandleId = (ctx, position) => ctx.ids?.handle?.(position) ?? `image-cropper:${ctx.id}:handle:${position}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getViewportEl = (ctx) => ctx.getById(getViewportId(ctx));
var getImageEl = (ctx) => ctx.getById(getImageId(ctx));
var getSelectionEl = (ctx) => ctx.getById(getSelectionId(ctx));
function drawCroppedImageToCanvas(params) {
  const { context, scope } = params;
  const imageEl = getImageEl(scope);
  if (!imageEl || !imageEl.complete) return null;
  const doc = imageEl.ownerDocument;
  const crop = context.get("crop");
  const zoom = context.get("zoom");
  const rotation = context.get("rotation");
  const flip = context.get("flip");
  const viewportRect = context.get("viewportRect");
  const naturalSize = context.get("naturalSize");
  const offset = context.get("offset");
  const canvas = doc.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation * Math.PI / 180);
  const scaleX = flip.horizontal ? -1 : 1;
  const scaleY = flip.vertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);
  const viewportCenterX = viewportRect.width / 2;
  const viewportCenterY = viewportRect.height / 2;
  const cropCenterX = crop.x + crop.width / 2;
  const cropCenterY = crop.y + crop.height / 2;
  const deltaX = cropCenterX - viewportCenterX;
  const deltaY = cropCenterY - viewportCenterY;
  const imageCenterX = naturalSize.width / 2;
  const imageCenterY = naturalSize.height / 2;
  const sourceX = imageCenterX + (deltaX - offset.x) / zoom;
  const sourceY = imageCenterY + (deltaY - offset.y) / zoom;
  const sourceWidth = crop.width / zoom;
  const sourceHeight = crop.height / zoom;
  ctx.drawImage(
    imageEl,
    sourceX - sourceWidth / 2,
    sourceY - sourceHeight / 2,
    sourceWidth,
    sourceHeight,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  ctx.restore();
  return canvas;
}
var { min, max, abs, round, hypot, PI, cos, sin } = Math;
var isLeftHandle = (handlePosition) => handlePosition === "w" || handlePosition === "nw" || handlePosition === "sw";
var isRightHandle = (handlePosition) => handlePosition === "e" || handlePosition === "ne" || handlePosition === "se";
var isTopHandle = (handlePosition) => handlePosition === "n" || handlePosition === "nw" || handlePosition === "ne";
var isBottomHandle = (handlePosition) => handlePosition === "s" || handlePosition === "sw" || handlePosition === "se";
var isCornerHandle = (handlePosition) => (isLeftHandle(handlePosition) || isRightHandle(handlePosition)) && (isTopHandle(handlePosition) || isBottomHandle(handlePosition));
var isHorizontalEdgeHandle = (handlePosition) => (isLeftHandle(handlePosition) || isRightHandle(handlePosition)) && !(isTopHandle(handlePosition) || isBottomHandle(handlePosition));
var isVerticalEdgeHandle = (handlePosition) => (isTopHandle(handlePosition) || isBottomHandle(handlePosition)) && !(isLeftHandle(handlePosition) || isRightHandle(handlePosition));
var hasAspectRatio = (value) => typeof value === "number" && value > 0;
var resolveSizeLimits = (options) => {
  const { minSize, maxSize, viewportSize, aspectRatio } = options;
  let minWidth = min(minSize.width, viewportSize.width);
  let minHeight = min(minSize.height, viewportSize.height);
  let maxWidth = maxSize?.width ?? viewportSize.width;
  if (!Number.isFinite(maxWidth)) maxWidth = viewportSize.width;
  maxWidth = min(maxWidth, viewportSize.width);
  let maxHeight = maxSize?.height ?? viewportSize.height;
  if (!Number.isFinite(maxHeight)) maxHeight = viewportSize.height;
  maxHeight = min(maxHeight, viewportSize.height);
  maxWidth = max(minWidth, maxWidth);
  maxHeight = max(minHeight, maxHeight);
  const hasAspect = hasAspectRatio(aspectRatio);
  if (hasAspect) {
    const minWidthWithAspect = max(minWidth, minHeight * aspectRatio);
    const minHeightWithAspect = minWidthWithAspect / aspectRatio;
    minWidth = min(minWidthWithAspect, viewportSize.width);
    minHeight = min(minHeightWithAspect, viewportSize.height);
    let constrainedMaxWidth = min(maxWidth, maxHeight * aspectRatio, viewportSize.width);
    let constrainedMaxHeight = constrainedMaxWidth / aspectRatio;
    if (constrainedMaxHeight > maxHeight || constrainedMaxHeight > viewportSize.height) {
      constrainedMaxHeight = min(maxHeight, viewportSize.height);
      constrainedMaxWidth = constrainedMaxHeight * aspectRatio;
    }
    maxWidth = max(minWidth, min(constrainedMaxWidth, viewportSize.width));
    maxHeight = max(minHeight, min(constrainedMaxHeight, viewportSize.height));
  } else {
    maxWidth = max(minWidth, min(maxWidth, viewportSize.width));
    maxHeight = max(minHeight, min(maxHeight, viewportSize.height));
  }
  return { minWidth, minHeight, maxWidth, maxHeight, hasAspect };
};
var clampAspectSize = (params) => {
  const { widthValue, heightValue, limits, viewportRect, aspectRatio } = params;
  const { minWidth, minHeight, maxWidth, maxHeight } = limits;
  const constrainWidthFromHeight = (height) => {
    let width = utils.clampValue(height * aspectRatio, minWidth, maxWidth);
    width = min(width, viewportRect.width);
    return { width, height: width / aspectRatio };
  };
  const clampByWidth = (value) => {
    let width = utils.clampValue(value, minWidth, maxWidth);
    width = min(width, viewportRect.width);
    let height = width / aspectRatio;
    if (height < minHeight) {
      const constrained = constrainWidthFromHeight(minHeight);
      width = constrained.width;
      height = constrained.height;
    }
    if (height > maxHeight) {
      const clampedHeight = min(maxHeight, viewportRect.height);
      const constrained = constrainWidthFromHeight(clampedHeight);
      width = constrained.width;
      height = constrained.height;
    }
    if (height > viewportRect.height) {
      const constrained = constrainWidthFromHeight(viewportRect.height);
      width = constrained.width;
      height = constrained.height;
      if (height < minHeight) {
        const reconstrainted = constrainWidthFromHeight(minHeight);
        width = reconstrainted.width;
        height = reconstrainted.height;
      }
    }
    return { width, height };
  };
  const clampByHeight = (value) => {
    let height = utils.clampValue(value, minHeight, maxHeight);
    height = min(height, viewportRect.height);
    let width = height * aspectRatio;
    width = utils.clampValue(width, minWidth, maxWidth);
    width = min(width, viewportRect.width);
    let adjustedHeight = width / aspectRatio;
    if (adjustedHeight < minHeight) {
      const constrained = constrainWidthFromHeight(minHeight);
      width = constrained.width;
      adjustedHeight = constrained.height;
    }
    if (adjustedHeight > maxHeight) {
      const clampedHeight = min(maxHeight, viewportRect.height);
      const constrained = constrainWidthFromHeight(clampedHeight);
      width = constrained.width;
      adjustedHeight = constrained.height;
    }
    if (width > viewportRect.width) {
      width = viewportRect.width;
      adjustedHeight = width / aspectRatio;
      if (adjustedHeight > maxHeight) {
        const clampedHeight = min(maxHeight, viewportRect.height);
        const constrained = constrainWidthFromHeight(clampedHeight);
        width = constrained.width;
        adjustedHeight = constrained.height;
      }
      if (adjustedHeight < minHeight) {
        const constrained = constrainWidthFromHeight(minHeight);
        width = constrained.width;
        adjustedHeight = constrained.height;
      }
    }
    return { width, height: adjustedHeight };
  };
  const byWidth = clampByWidth(widthValue);
  const byHeight = clampByHeight(heightValue);
  const deltaWidth = abs(byWidth.width - widthValue) + abs(byWidth.height - heightValue);
  const deltaHeight = abs(byHeight.width - widthValue) + abs(byHeight.height - heightValue);
  return deltaHeight < deltaWidth ? byHeight : byWidth;
};
var applyDeltaToEdges = (params) => {
  const { bounds, delta, handlePosition, viewportRect, minSize, maxSize } = params;
  let { left, top, right, bottom } = bounds;
  if (isLeftHandle(handlePosition)) {
    const minLeft = max(0, right - maxSize.width);
    const maxLeft = right - minSize.width;
    left = utils.clampValue(left + delta.x, minLeft, maxLeft);
  }
  if (isRightHandle(handlePosition)) {
    const minRight = left + minSize.width;
    const maxRight = min(viewportRect.width, left + maxSize.width);
    right = utils.clampValue(right + delta.x, minRight, maxRight);
  }
  if (isTopHandle(handlePosition)) {
    const minTop = max(0, bottom - maxSize.height);
    const maxTop = bottom - minSize.height;
    top = utils.clampValue(top + delta.y, minTop, maxTop);
  }
  if (isBottomHandle(handlePosition)) {
    const minBottom = top + minSize.height;
    const maxBottom = min(viewportRect.height, top + maxSize.height);
    bottom = utils.clampValue(bottom + delta.y, minBottom, maxBottom);
  }
  return { left, top, right, bottom };
};
var applyAspectToHorizontalResize = (params) => {
  const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params;
  const { left, top, right, bottom } = bounds;
  const centerY = (top + bottom) / 2;
  let nextWidth = right - left;
  let nextHeight = nextWidth / aspectRatio;
  const constrained = clampAspectSize({
    widthValue: nextWidth,
    heightValue: nextHeight,
    limits,
    viewportRect,
    aspectRatio
  });
  nextWidth = constrained.width;
  nextHeight = constrained.height;
  const halfH = nextHeight / 2;
  let newTop = centerY - halfH;
  let newBottom = centerY + halfH;
  if (newTop < 0) {
    newTop = 0;
    newBottom = nextHeight;
  }
  if (newBottom > viewportRect.height) {
    newBottom = viewportRect.height;
    newTop = newBottom - nextHeight;
  }
  return {
    left: isRightHandle(handlePosition) ? left : right - nextWidth,
    top: newTop,
    right: isRightHandle(handlePosition) ? left + nextWidth : right,
    bottom: newBottom
  };
};
var applyAspectToVerticalResize = (params) => {
  const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params;
  const { left, top, right, bottom } = bounds;
  const centerX = (left + right) / 2;
  let nextHeight = bottom - top;
  let nextWidth = nextHeight * aspectRatio;
  const constrained = clampAspectSize({
    widthValue: nextWidth,
    heightValue: nextHeight,
    limits,
    viewportRect,
    aspectRatio
  });
  nextWidth = constrained.width;
  nextHeight = constrained.height;
  const halfW = nextWidth / 2;
  let newLeft = centerX - halfW;
  let newRight = centerX + halfW;
  if (newLeft < 0) {
    newLeft = 0;
    newRight = nextWidth;
  }
  if (newRight > viewportRect.width) {
    newRight = viewportRect.width;
    newLeft = newRight - nextWidth;
  }
  return {
    left: newLeft,
    top: isBottomHandle(handlePosition) ? top : bottom - nextHeight,
    right: newRight,
    bottom: isBottomHandle(handlePosition) ? top + nextHeight : bottom
  };
};
var applyCornerResize = (params) => {
  const { bounds, width, height, handlePosition } = params;
  const { left, top, right, bottom } = bounds;
  if (isRightHandle(handlePosition) && isBottomHandle(handlePosition)) {
    return { left, top, right: left + width, bottom: top + height };
  } else if (isRightHandle(handlePosition) && isTopHandle(handlePosition)) {
    return { left, top: bottom - height, right: left + width, bottom };
  } else if (isBottomHandle(handlePosition)) {
    return { left: right - width, top, right, bottom: top + height };
  } else {
    return { left: right - width, top: bottom - height, right, bottom };
  }
};
function computeResizeCrop(options) {
  const { cropStart, handlePosition, delta, viewportRect, minSize, maxSize, aspectRatio } = options;
  let { x, y, width, height } = cropStart;
  let left = x;
  let top = y;
  let right = x + width;
  let bottom = y + height;
  const { minWidth, minHeight, maxWidth, maxHeight, hasAspect } = resolveSizeLimits({
    minSize,
    maxSize,
    viewportSize: viewportRect,
    aspectRatio
  });
  const edgesAfterDelta = applyDeltaToEdges({
    bounds: { left, top, right, bottom },
    delta,
    handlePosition,
    viewportRect,
    minSize,
    maxSize
  });
  left = edgesAfterDelta.left;
  top = edgesAfterDelta.top;
  right = edgesAfterDelta.right;
  bottom = edgesAfterDelta.bottom;
  if (hasAspect) {
    const limits = { minWidth, minHeight, maxWidth, maxHeight, hasAspect };
    if (isCornerHandle(handlePosition)) {
      let tempW = right - left;
      let tempH = tempW / aspectRatio;
      if (tempH > bottom - top || top + tempH > viewportRect.height || left + tempW > viewportRect.width) {
        tempH = bottom - top;
        tempW = tempH * aspectRatio;
      }
      const constrained = clampAspectSize({
        widthValue: tempW,
        heightValue: tempH,
        limits,
        viewportRect,
        aspectRatio
      });
      const result = applyCornerResize({
        bounds: { left, top, right, bottom },
        width: constrained.width,
        height: constrained.height,
        handlePosition
      });
      left = result.left;
      top = result.top;
      right = result.right;
      bottom = result.bottom;
    } else if (isHorizontalEdgeHandle(handlePosition)) {
      const result = applyAspectToHorizontalResize({
        bounds: { left, top, right, bottom },
        limits,
        viewportRect,
        aspectRatio,
        handlePosition
      });
      left = result.left;
      top = result.top;
      right = result.right;
      bottom = result.bottom;
    } else if (isVerticalEdgeHandle(handlePosition)) {
      const result = applyAspectToVerticalResize({
        bounds: { left, top, right, bottom },
        limits,
        viewportRect,
        aspectRatio,
        handlePosition
      });
      left = result.left;
      top = result.top;
      right = result.right;
      bottom = result.bottom;
    }
  }
  const maxLeft = max(0, viewportRect.width - minWidth);
  const maxTop = max(0, viewportRect.height - minHeight);
  left = utils.clampValue(left, 0, maxLeft);
  top = utils.clampValue(top, 0, maxTop);
  const maxRight = min(viewportRect.width, left + maxWidth);
  const maxBottom = min(viewportRect.height, top + maxHeight);
  right = utils.clampValue(right, left + minWidth, maxRight);
  bottom = utils.clampValue(bottom, top + minHeight, maxBottom);
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}
function computeMoveCrop(cropStart, delta, viewportRect) {
  return {
    x: utils.clampValue(cropStart.x + delta.x, 0, viewportRect.width - cropStart.width),
    y: utils.clampValue(cropStart.y + delta.y, 0, viewportRect.height - cropStart.height),
    width: cropStart.width,
    height: cropStart.height
  };
}
function clampOffset(params) {
  const { zoom, rotation, viewportSize, offset, fixedCropArea, crop, naturalSize } = params;
  const { cos: cos2, sin: sin2 } = getRotationTransform(rotation);
  if (fixedCropArea && crop && naturalSize) {
    const aabb2 = computeAABB(naturalSize, zoom, cos2, sin2);
    const center = getViewportCenter(viewportSize);
    const cropRight = crop.x + crop.width;
    const cropBottom = crop.y + crop.height;
    const minPoint2 = {
      x: cropRight - center.x - aabb2.width / 2,
      y: cropBottom - center.y - aabb2.height / 2
    };
    const maxPoint2 = {
      x: crop.x - center.x + aabb2.width / 2,
      y: crop.y - center.y + aabb2.height / 2
    };
    return clampPoint(offset, minPoint2, maxPoint2);
  }
  const aabb = computeAABB(viewportSize, zoom, cos2, sin2);
  const extraWidth = max(0, aabb.width - viewportSize.width);
  const extraHeight = max(0, aabb.height - viewportSize.height);
  const minPoint = { x: -extraWidth / 2, y: -extraHeight / 2 };
  const maxPoint = { x: extraWidth / 2, y: extraHeight / 2 };
  return clampPoint(offset, minPoint, maxPoint);
}
var expandLeft = (crop, step, maxWidth) => {
  const newX = max(0, crop.x - step);
  const newWidth = crop.width + (crop.x - newX);
  if (newWidth <= maxWidth) {
    return { x: newX, width: newWidth };
  }
  return { x: crop.x + crop.width - maxWidth, width: maxWidth };
};
var expandTop = (crop, step, maxHeight) => {
  const newY = max(0, crop.y - step);
  const newHeight = crop.height + (crop.y - newY);
  if (newHeight <= maxHeight) {
    return { y: newY, height: newHeight };
  }
  return { y: crop.y + crop.height - maxHeight, height: maxHeight };
};
var shrinkFromLeft = (crop, step, minWidth) => {
  const newX = min(crop.x + step, crop.x + crop.width - minWidth);
  return { x: newX, width: crop.width - (newX - crop.x) };
};
var shrinkFromTop = (crop, step, minHeight) => {
  const newY = min(crop.y + step, crop.y + crop.height - minHeight);
  return { y: newY, height: crop.height - (newY - crop.y) };
};
function computeKeyboardCrop(key, handlePosition, step, crop, viewportRect, minSize, maxSize) {
  const nextCrop = { ...crop };
  const { minWidth, minHeight, maxWidth, maxHeight } = resolveSizeLimits({
    minSize,
    maxSize,
    viewportSize: viewportRect
  });
  const isCorner = isCornerHandle(handlePosition);
  if (key === "ArrowLeft") {
    if (isLeftHandle(handlePosition)) {
      const expanded = expandLeft(crop, step, maxWidth);
      nextCrop.x = expanded.x;
      nextCrop.width = expanded.width;
      if (isCorner && isTopHandle(handlePosition)) {
        const expandedY = expandTop(crop, step, maxHeight);
        nextCrop.y = expandedY.y;
        nextCrop.height = expandedY.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        const newHeight = nextCrop.height + step;
        nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight));
      }
    } else if (isRightHandle(handlePosition)) {
      nextCrop.width = max(minWidth, nextCrop.width - step);
      if (isCorner && isTopHandle(handlePosition)) {
        const shrunk = shrinkFromTop(crop, step, minHeight);
        nextCrop.y = shrunk.y;
        nextCrop.height = shrunk.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = max(minHeight, nextCrop.height - step);
      }
    }
  } else if (key === "ArrowRight") {
    if (isLeftHandle(handlePosition)) {
      const shrunk = shrinkFromLeft(crop, step, minWidth);
      nextCrop.x = shrunk.x;
      nextCrop.width = shrunk.width;
      if (isCorner && isTopHandle(handlePosition)) {
        const shrunkY = shrinkFromTop(crop, step, minHeight);
        nextCrop.y = shrunkY.y;
        nextCrop.height = shrunkY.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = max(minHeight, nextCrop.height - step);
      }
    } else if (isRightHandle(handlePosition)) {
      const newWidth = nextCrop.width + step;
      nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth));
      if (isCorner && isTopHandle(handlePosition)) {
        const expanded = expandTop(crop, step, maxHeight);
        nextCrop.y = expanded.y;
        nextCrop.height = expanded.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        const newHeight = nextCrop.height + step;
        nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight));
      }
    }
  }
  if (key === "ArrowUp") {
    if (isTopHandle(handlePosition)) {
      const expanded = expandTop(crop, step, maxHeight);
      nextCrop.y = expanded.y;
      nextCrop.height = expanded.height;
      if (isCorner && isLeftHandle(handlePosition)) {
        const expandedX = expandLeft(crop, step, maxWidth);
        nextCrop.x = expandedX.x;
        nextCrop.width = expandedX.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        const newWidth = nextCrop.width + step;
        nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth));
      }
    } else if (isBottomHandle(handlePosition)) {
      nextCrop.height = max(minHeight, nextCrop.height - step);
      if (isCorner && isLeftHandle(handlePosition)) {
        const shrunk = shrinkFromLeft(crop, step, minWidth);
        nextCrop.x = shrunk.x;
        nextCrop.width = shrunk.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = max(minWidth, nextCrop.width - step);
      }
    }
  } else if (key === "ArrowDown") {
    if (isTopHandle(handlePosition)) {
      const shrunk = shrinkFromTop(crop, step, minHeight);
      nextCrop.y = shrunk.y;
      nextCrop.height = shrunk.height;
      if (isCorner && isLeftHandle(handlePosition)) {
        const shrunkX = shrinkFromLeft(crop, step, minWidth);
        nextCrop.x = shrunkX.x;
        nextCrop.width = shrunkX.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = max(minWidth, nextCrop.width - step);
      }
    } else if (isBottomHandle(handlePosition)) {
      const newHeight = nextCrop.height + step;
      nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight));
      if (isCorner && isLeftHandle(handlePosition)) {
        const expanded = expandLeft(crop, step, maxWidth);
        nextCrop.x = expanded.x;
        nextCrop.width = expanded.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        const newWidth = nextCrop.width + step;
        nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth));
      }
    }
  }
  return nextCrop;
}
function getKeyboardMoveDelta(key, step) {
  switch (key) {
    case "ArrowLeft":
      return { x: -step, y: 0 };
    case "ArrowRight":
      return { x: step, y: 0 };
    case "ArrowUp":
      return { x: 0, y: -step };
    case "ArrowDown":
      return { x: 0, y: step };
    default:
      return ZERO_POINT;
  }
}
var resolveCropAspectRatio = (shape, aspectRatio) => shape === "circle" ? 1 : aspectRatio;
var getCropSizeLimits = (prop) => ({
  minSize: { width: prop("minWidth"), height: prop("minHeight") },
  maxSize: { width: prop("maxWidth"), height: prop("maxHeight") }
});
var getNudgeStep = (prop, modifiers) => {
  if (modifiers.ctrlKey || modifiers.metaKey) return prop("nudgeStepCtrl");
  if (modifiers.shiftKey) return prop("nudgeStepShift");
  return prop("nudgeStep");
};
var DEFAULT_VIEWPORT_FILL = 0.8;
var computeDefaultCropDimensions = (viewportRect, aspectRatio, fixedCropArea) => {
  const targetWidth = viewportRect.width * DEFAULT_VIEWPORT_FILL;
  const targetHeight = viewportRect.height * DEFAULT_VIEWPORT_FILL;
  if (typeof aspectRatio === "number" && aspectRatio > 0) {
    if (fixedCropArea) {
      let height2 = viewportRect.height;
      let width2 = height2 * aspectRatio;
      if (width2 > viewportRect.width) {
        width2 = viewportRect.width;
        height2 = width2 / aspectRatio;
      }
      return { width: width2, height: height2 };
    }
    const targetAspect = targetWidth / targetHeight;
    if (aspectRatio > targetAspect) {
      const width2 = targetWidth;
      const height2 = width2 / aspectRatio;
      return { width: width2, height: height2 };
    }
    const height = targetHeight;
    const width = height * aspectRatio;
    return { width, height };
  }
  if (fixedCropArea) {
    const size = min(viewportRect.width, viewportRect.height);
    return { width: size, height: size };
  }
  return { width: targetWidth, height: targetHeight };
};
var normalizeFlipState = (nextFlip, currentFlip) => {
  if (!nextFlip) return currentFlip;
  return {
    horizontal: utils.isBoolean(nextFlip.horizontal) ? nextFlip.horizontal : currentFlip.horizontal,
    vertical: utils.isBoolean(nextFlip.vertical) ? nextFlip.vertical : currentFlip.vertical
  };
};
var isEqualFlip = (a, b) => {
  return a.horizontal === b.horizontal && a.vertical === b.vertical;
};
var isVisibleRect = (rect) => rect.width > 0 && rect.height > 0;
var getCenterPoint = (rect) => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2
});
var getViewportCenter = (size) => ({
  x: size.width / 2,
  y: size.height / 2
});
var centerRect = (size, viewport) => ({
  x: max(0, (viewport.width - size.width) / 2),
  y: max(0, (viewport.height - size.height) / 2)
});
var getMidpoint = (p1, p2, offset = ZERO_POINT) => ({
  x: (p1.x + p2.x) / 2 - offset.x,
  y: (p1.y + p2.y) / 2 - offset.y
});
var getMaxBounds = (cropSize, viewportSize) => ({
  x: max(0, viewportSize.width - cropSize.width),
  y: max(0, viewportSize.height - cropSize.height)
});
var isSameSize = (a, b) => {
  return a.width === b.width && a.height === b.height;
};
var ZERO_POINT = { x: 0, y: 0 };
var getTouchDistance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return hypot(dx, dy);
};
var clampPoint = (point, min2, max2) => ({
  x: utils.clampValue(point.x, min2.x, max2.x),
  y: utils.clampValue(point.y, min2.y, max2.y)
});
var subtractPoints = (a, b) => ({
  x: a.x - b.x,
  y: a.y - b.y
});
var addPoints = (a, b) => ({
  x: a.x + b.x,
  y: a.y + b.y
});
var roundRect = (rect) => ({
  x: round(rect.x),
  y: round(rect.y),
  width: round(rect.width),
  height: round(rect.height)
});
var scaleRect = (rect, scale) => ({
  x: rect.x * scale.x,
  y: rect.y * scale.y,
  width: rect.width * scale.x,
  height: rect.height * scale.y
});
var getRotationTransform = (rotation) => {
  const theta = rotation % 360 * PI / 180;
  return {
    cos: abs(cos(theta)),
    sin: abs(sin(theta))
  };
};
var computeAABB = (size, zoom, cos2, sin2) => {
  const w = size.width * zoom;
  const h = size.height * zoom;
  return {
    width: w * cos2 + h * sin2,
    height: w * sin2 + h * cos2
  };
};
var scaleSize = (size, scale) => ({
  width: size.width * scale,
  height: size.height * scale
});

// src/image-cropper.connect.ts
function connect(service, normalize) {
  const { scope, send, context, prop, state, computed } = service;
  const dragging = state.matches("dragging");
  const panning = state.matches("panning");
  const translations = prop("translations");
  const fixedCropArea = prop("fixedCropArea");
  const cropShape = prop("cropShape");
  const zoom = context.get("zoom");
  const rotation = context.get("rotation");
  const flip = context.get("flip");
  const crop = context.get("crop");
  const offset = context.get("offset");
  const naturalSize = context.get("naturalSize");
  const viewportRect = context.get("viewportRect");
  const isImageReady = computed("isImageReady");
  const isMeasured = computed("isMeasured");
  const roundedCrop = roundRect(crop);
  const shouldIgnoreTouchPointer = (event) => {
    if (event.pointerType !== "touch") return false;
    const isSecondaryTouch = event.isPrimary === false;
    const pinchActive = context.get("pinchDistance") != null;
    return isSecondaryTouch || pinchActive;
  };
  return {
    zoom,
    rotation,
    flip,
    crop,
    offset,
    naturalSize,
    viewportRect,
    dragging,
    panning,
    setZoom(value) {
      send({ type: "SET_ZOOM", zoom: value });
    },
    zoomBy(delta) {
      send({ type: "SET_ZOOM", zoom: zoom + delta });
    },
    setRotation(value) {
      send({ type: "SET_ROTATION", rotation: value });
    },
    rotateBy(degrees) {
      send({ type: "SET_ROTATION", rotation: rotation + degrees });
    },
    setFlip(nextFlip) {
      if (!nextFlip) return;
      const normalized = normalizeFlipState(nextFlip, flip);
      if (isEqualFlip(normalized, flip)) return;
      send({ type: "SET_FLIP", flip: normalized });
    },
    flipHorizontally(value) {
      const nextValue = typeof value === "boolean" ? value : !flip.horizontal;
      if (nextValue === flip.horizontal) return;
      send({ type: "SET_FLIP", flip: { horizontal: nextValue } });
    },
    flipVertically(value) {
      const nextValue = typeof value === "boolean" ? value : !flip.vertical;
      if (nextValue === flip.vertical) return;
      send({ type: "SET_FLIP", flip: { vertical: nextValue } });
    },
    resize(handlePosition, delta) {
      if (!handlePosition) return;
      if (fixedCropArea) return;
      let deltaX = 0;
      let deltaY = 0;
      if (isLeftHandle(handlePosition)) {
        deltaX = -delta;
      } else if (isRightHandle(handlePosition)) {
        deltaX = delta;
      }
      if (isTopHandle(handlePosition)) {
        deltaY = -delta;
      } else if (isBottomHandle(handlePosition)) {
        deltaY = delta;
      }
      send({ type: "RESIZE_CROP", handlePosition, delta: { x: deltaX, y: deltaY } });
    },
    reset() {
      send({ type: "RESET" });
    },
    getCropData() {
      const scale = naturalSize.width / viewportRect.width;
      const naturalX = (crop.x - offset.x) * scale;
      const naturalY = (crop.y - offset.y) * scale;
      const naturalWidth = crop.width * scale;
      const naturalHeight = crop.height * scale;
      return {
        x: Math.round(naturalX),
        y: Math.round(naturalY),
        width: Math.round(naturalWidth),
        height: Math.round(naturalHeight),
        rotate: rotation,
        flipX: flip.horizontal,
        flipY: flip.vertical
      };
    },
    async getCroppedImage(options = {}) {
      const { type = "image/png", quality = 1, output = "blob" } = options;
      if (!isVisibleRect(naturalSize)) return null;
      const canvas = drawCroppedImageToCanvas(service);
      if (!canvas) return null;
      if (output === "dataUrl") {
        return canvas.toDataURL(type, quality);
      }
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          type,
          quality
        );
      });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: getRootId(scope),
        dir: prop("dir"),
        role: "group",
        "aria-roledescription": translations.rootRoleDescription,
        "aria-label": translations.rootLabel,
        "aria-description": isImageReady ? translations.previewDescription({
          crop: roundedCrop,
          zoom: Number.isFinite(zoom) ? zoom : null,
          rotation: Number.isFinite(rotation) ? rotation : null
        }) : translations.previewLoading,
        "aria-live": "polite",
        "aria-controls": `${getViewportId(scope)} ${getSelectionId(scope)}`,
        "aria-busy": isImageReady ? void 0 : "true",
        "data-fixed": domQuery.dataAttr(fixedCropArea),
        "data-shape": cropShape,
        "data-pinch": domQuery.dataAttr(context.get("pinchDistance") != null),
        "data-dragging": domQuery.dataAttr(dragging),
        "data-panning": domQuery.dataAttr(panning),
        style: {
          "--crop-width": utils.toPx(crop.width),
          "--crop-height": utils.toPx(crop.height),
          "--crop-x": utils.toPx(crop.x),
          "--crop-y": utils.toPx(crop.y),
          "--image-zoom": zoom,
          "--image-rotation": rotation,
          "--image-offset-x": utils.toPx(offset.x),
          "--image-offset-y": utils.toPx(offset.y)
        }
      });
    },
    getViewportProps() {
      const viewportId = getViewportId(scope);
      return normalize.element({
        ...parts.viewport.attrs,
        id: viewportId,
        role: "presentation",
        "data-ownedby": getRootId(scope),
        "data-disabled": domQuery.dataAttr(!!fixedCropArea),
        style: {
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
          userSelect: "none"
        },
        onPointerDown(event) {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          if (shouldIgnoreTouchPointer(event)) return;
          const target = domQuery.getEventTarget(event);
          const rootEl = getRootEl(scope);
          if (!target || !rootEl || !domQuery.contains(rootEl, target)) return;
          const selectionEl = getSelectionEl(scope);
          if (!fixedCropArea && domQuery.contains(selectionEl, target)) return;
          const handleEl = target.closest('[data-scope="image-cropper"][data-part="handle"]');
          if (handleEl && domQuery.contains(rootEl, handleEl)) return;
          const point = domQuery.getEventPoint(event);
          send({ type: "PAN_POINTER_DOWN", point });
        }
      });
    },
    getImageProps() {
      const flipHorizontal = flip.horizontal;
      const flipVertical = flip.vertical;
      const translate = `translate(${utils.toPx(offset.x)}, ${utils.toPx(offset.y)})`;
      const rotate = `rotate(${rotation}deg)`;
      const scaleX = zoom * (flipHorizontal ? -1 : 1);
      const scaleY = zoom * (flipVertical ? -1 : 1);
      const scale = `scale(${scaleX}, ${scaleY})`;
      return normalize.element({
        ...parts.image.attrs,
        id: getImageId(scope),
        draggable: false,
        role: "presentation",
        alt: "",
        "aria-hidden": true,
        "data-ownedby": getViewportId(scope),
        "data-ready": domQuery.dataAttr(isImageReady),
        "data-flip-horizontal": domQuery.dataAttr(flipHorizontal),
        "data-flip-vertical": domQuery.dataAttr(flipVertical),
        onLoad(event) {
          const imageEl = event.currentTarget;
          if (!imageEl?.complete) return;
          const { naturalWidth: width, naturalHeight: height } = imageEl;
          send({ type: "SET_NATURAL_SIZE", src: "element", size: { width, height } });
        },
        style: {
          pointerEvents: "none",
          userSelect: "none",
          transform: `${translate} ${rotate} ${scale}`,
          willChange: "transform"
        }
      });
    },
    getSelectionProps() {
      const disabled = !!fixedCropArea;
      return normalize.element({
        ...parts.selection.attrs,
        id: getSelectionId(scope),
        tabIndex: disabled ? void 0 : 0,
        role: "slider",
        "aria-label": translations.selectionLabel({ shape: cropShape }),
        "aria-roledescription": translations.selectionRoleDescription,
        "aria-disabled": disabled ? "true" : void 0,
        "aria-valuemin": 0,
        "aria-valuemax": isVisibleRect(viewportRect) ? Math.max(0, Math.round(viewportRect.width - crop.width)) : Math.max(roundedCrop.x, 0),
        "aria-valuenow": roundedCrop.x,
        "aria-valuetext": translations.selectionValueText({ shape: cropShape, ...roundedCrop }),
        "aria-description": translations.selectionInstructions,
        "data-disabled": domQuery.dataAttr(disabled),
        "data-shape": cropShape,
        "data-measured": domQuery.dataAttr(isMeasured),
        "data-dragging": domQuery.dataAttr(dragging),
        "data-panning": domQuery.dataAttr(panning),
        style: {
          position: "absolute",
          top: "var(--crop-y)",
          left: "var(--crop-x)",
          width: "var(--crop-width)",
          height: "var(--crop-height)",
          touchAction: "none",
          visibility: isMeasured ? void 0 : "hidden"
        },
        onPointerDown(event) {
          if (disabled) {
            event.preventDefault();
            return;
          }
          if (shouldIgnoreTouchPointer(event)) return;
          const point = domQuery.getEventPoint(event);
          send({ type: "POINTER_DOWN", point });
        },
        onKeyDown(event) {
          if (disabled) {
            event.preventDefault();
            return;
          }
          if (event.defaultPrevented) return;
          const src = "selection";
          const { shiftKey, ctrlKey, metaKey, altKey } = event;
          const key = domQuery.getEventKey(event, { dir: prop("dir") });
          const isZoomInKey = key === "+" || key === "=";
          const isZoomOutKey = key === "-" || key === "_";
          if (isZoomInKey || isZoomOutKey) {
            const delta = isZoomInKey ? -1 : 1;
            send({ type: "ZOOM", trigger: "keyboard", delta });
            event.preventDefault();
            return;
          }
          if (altKey && (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight")) {
            const handlePosition = key === "ArrowUp" || key === "ArrowDown" ? "s" : "e";
            send({
              type: "NUDGE_RESIZE_CROP",
              handlePosition,
              key,
              src,
              shiftKey,
              ctrlKey,
              metaKey
            });
            event.preventDefault();
            return;
          }
          const keyMap = {
            ArrowUp() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowUp", src, shiftKey, ctrlKey, metaKey });
            },
            ArrowDown() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowDown", src, shiftKey, ctrlKey, metaKey });
            },
            ArrowLeft() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowLeft", src, shiftKey, ctrlKey, metaKey });
            },
            ArrowRight() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowRight", src, shiftKey, ctrlKey, metaKey });
            }
          };
          const exec = keyMap[key];
          if (exec) {
            exec(event);
            event.preventDefault();
          }
        }
      });
    },
    getHandleProps(props2) {
      const handlePosition = props2.position;
      const disabled = !!fixedCropArea;
      return normalize.element({
        ...parts.handle.attrs,
        id: getHandleId(scope, handlePosition),
        "data-position": handlePosition,
        "aria-hidden": "true",
        role: "presentation",
        "data-disabled": domQuery.dataAttr(disabled),
        style: getHandlePositionStyles(handlePosition),
        onPointerDown(event) {
          if (disabled) {
            event.preventDefault();
            return;
          }
          if (shouldIgnoreTouchPointer(event)) return;
          const point = domQuery.getEventPoint(event);
          send({ type: "POINTER_DOWN", point, handlePosition });
        }
      });
    },
    getGridProps(props2) {
      const axis = props2.axis;
      const isMeasured2 = computed("isMeasured");
      return normalize.element({
        ...parts.grid.attrs,
        "aria-hidden": "true",
        "data-axis": axis,
        "data-dragging": domQuery.dataAttr(dragging),
        "data-panning": domQuery.dataAttr(panning),
        style: {
          position: "absolute",
          inset: axis === "horizontal" ? "33.33% 0" : "0 33.33%",
          pointerEvents: "none",
          visibility: isMeasured2 ? void 0 : "hidden"
        }
      });
    }
  };
}
var machine = core.createMachine({
  props({ props: props2 }) {
    return {
      minWidth: 40,
      minHeight: 40,
      maxWidth: Number.POSITIVE_INFINITY,
      maxHeight: Number.POSITIVE_INFINITY,
      defaultZoom: 1,
      zoomStep: 0.1,
      zoomSensitivity: 2,
      minZoom: 1,
      maxZoom: 5,
      defaultRotation: 0,
      defaultFlip: { horizontal: false, vertical: false },
      fixedCropArea: false,
      cropShape: "rectangle",
      nudgeStep: 1,
      nudgeStepShift: 10,
      nudgeStepCtrl: 50,
      ...props2,
      translations: {
        rootLabel: "Image cropper",
        rootRoleDescription: "Image cropper",
        previewLoading: "Image cropper preview loading",
        previewDescription({ crop, zoom, rotation }) {
          const zoomText = zoom != null && Number.isFinite(zoom) ? `${zoom.toFixed(2)}x zoom` : "default zoom";
          const rotationText = rotation != null && Number.isFinite(rotation) ? `${Math.round(rotation)} degrees rotation` : "0 degrees rotation";
          return `Image cropper preview, ${zoomText}, ${rotationText}. Crop positioned at ${crop.x}px from the left and ${crop.y}px from the top with a size of ${crop.width}px by ${crop.height}px.`;
        },
        selectionLabel: ({ shape }) => `Crop selection area (${shape === "circle" ? "circle" : "rectangle"})`,
        selectionRoleDescription: "2d slider",
        selectionInstructions: "Use arrow keys to move the crop. Hold Alt with arrow keys to resize width or height. Press plus or minus to zoom.",
        selectionValueText({ shape, x, y, width, height }) {
          if (shape === "circle") {
            return `Position X ${x}px, Y ${y}px. Diameter ${width}px.`;
          }
          return `Position X ${x}px, Y ${y}px. Size ${width}px by ${height}px.`;
        },
        ...props2.translations
      }
    };
  },
  context({ bindable, prop }) {
    return {
      naturalSize: bindable(() => ({
        defaultValue: { width: 0, height: 0 }
      })),
      crop: bindable(() => ({
        defaultValue: { x: 0, y: 0, width: 0, height: 0 },
        onChange(crop) {
          prop("onCropChange")?.({ crop });
        }
      })),
      pointerStart: bindable(() => ({
        defaultValue: null
      })),
      cropStart: bindable(() => ({
        defaultValue: null
      })),
      handlePosition: bindable(() => ({
        defaultValue: null
      })),
      shiftLockRatio: bindable(() => ({
        defaultValue: null
      })),
      pinchDistance: bindable(() => ({
        defaultValue: null
      })),
      pinchMidpoint: bindable(() => ({
        defaultValue: null
      })),
      zoom: bindable(() => ({
        defaultValue: prop("zoom") ?? prop("defaultZoom"),
        onChange(zoom) {
          prop("onZoomChange")?.({ zoom });
        }
      })),
      rotation: bindable(() => ({
        defaultValue: prop("defaultRotation"),
        value: prop("rotation"),
        onChange(rotation) {
          prop("onRotationChange")?.({ rotation });
        }
      })),
      flip: bindable(() => {
        const defaultFlip = prop("defaultFlip");
        return {
          defaultValue: { ...defaultFlip },
          value: prop("flip"),
          onChange(flip) {
            prop("onFlipChange")?.({ flip });
          }
        };
      }),
      offset: bindable(() => ({
        defaultValue: ZERO_POINT
      })),
      offsetStart: bindable(() => ({
        defaultValue: null
      })),
      viewportRect: bindable(() => ({
        defaultValue: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
      }))
    };
  },
  initialState() {
    return "idle";
  },
  on: {
    PINCH_START: {
      actions: ["setPinchDistance"]
    },
    PINCH_MOVE: {
      actions: ["handlePinchMove"]
    },
    PINCH_END: {
      actions: ["clearPinchDistance"]
    },
    SET_ZOOM: {
      actions: ["updateZoom"]
    },
    SET_ROTATION: {
      actions: ["setRotation"]
    },
    SET_FLIP: {
      actions: ["setFlip"]
    },
    RESIZE_CROP: {
      guard: "canResizeCrop",
      actions: ["resizeCrop"]
    },
    VIEWPORT_RESIZE: {
      actions: ["resizeViewport"]
    },
    RESET: {
      actions: ["resetToInitialState"]
    }
  },
  computed: {
    isMeasured: ({ context }) => isVisibleRect(context.get("viewportRect")) && isVisibleRect(context.get("crop")),
    isImageReady: ({ context }) => isVisibleRect(context.get("naturalSize"))
  },
  watch({ track, context, prop, send }) {
    track([() => prop("zoom")], () => {
      const propZoom = prop("zoom");
      if (propZoom === void 0) return;
      const currentZoom = context.get("zoom");
      if (propZoom === currentZoom) return;
      send({ type: "SET_ZOOM", zoom: propZoom, src: "prop" });
    });
  },
  states: {
    idle: {
      entry: ["checkImageStatus"],
      effects: ["trackViewportResize", "trackWheelEvent", "trackTouchEvents"],
      on: {
        SET_NATURAL_SIZE: {
          actions: ["setNaturalSize"]
        },
        SET_DEFAULT_CROP: {
          actions: ["setDefaultCrop"]
        },
        POINTER_DOWN: {
          guard: "canDragSelection",
          target: "dragging",
          actions: ["setPointerStart", "setCropStart", "setHandlePosition"]
        },
        PAN_POINTER_DOWN: {
          guard: "canPan",
          target: "panning",
          actions: ["setPointerStart", "setOffsetStart"]
        },
        ZOOM: {
          guard: "hasViewportRect",
          actions: ["updateZoom"]
        },
        NUDGE_RESIZE_CROP: {
          guard: "hasViewportRect",
          actions: ["nudgeResizeCrop"]
        },
        NUDGE_MOVE_CROP: {
          guard: "hasViewportRect",
          actions: ["nudgeMoveCrop"]
        }
      }
    },
    dragging: {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["updateCrop"]
        },
        POINTER_UP: {
          target: "idle",
          actions: [
            "clearPointerStart",
            "clearCropStart",
            "clearHandlePosition",
            "clearOffsetStart",
            "clearShiftRatio"
          ]
        }
      }
    },
    panning: {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["updatePanOffset"]
        },
        POINTER_UP: {
          target: "idle",
          actions: ["clearPointerStart", "clearOffsetStart"]
        }
      }
    }
  },
  implementations: {
    guards: {
      hasViewportRect({ context }) {
        return isVisibleRect(context.get("viewportRect"));
      },
      canResizeCrop({ context, prop }) {
        return !prop("fixedCropArea") && isVisibleRect(context.get("viewportRect"));
      },
      canPan({ context }) {
        return isVisibleRect(context.get("naturalSize")) && isVisibleRect(context.get("viewportRect"));
      },
      canDragSelection({ context, prop }) {
        return isVisibleRect(context.get("viewportRect")) && !prop("fixedCropArea");
      }
    },
    actions: {
      checkImageStatus({ send, scope, context }) {
        const naturalSize = context.get("naturalSize");
        const imageEl = getImageEl(scope);
        if (!imageEl?.complete) return;
        const { naturalWidth: width, naturalHeight: height } = imageEl;
        if (isVisibleRect({ width, height }) && !isVisibleRect(naturalSize)) {
          send({ type: "SET_NATURAL_SIZE", src: "ssr", size: { width, height } });
        }
      },
      setNaturalSize({ event, context, send }) {
        context.set("naturalSize", event.size);
        send({ type: "SET_DEFAULT_CROP", src: "init" });
      },
      setDefaultCrop({ context, prop, scope }) {
        const viewportEl = getViewportEl(scope);
        if (!viewportEl) return;
        const viewportRect = getBoundingRect(viewportEl);
        if (!isVisibleRect(viewportRect)) return;
        const cropShape = prop("cropShape");
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"));
        const { minSize, maxSize } = getCropSizeLimits(prop);
        const clampSize = (rect) => {
          const result = computeResizeCrop({
            cropStart: rect,
            handlePosition: "se",
            delta: ZERO_POINT,
            viewportRect,
            minSize,
            maxSize,
            aspectRatio
          });
          return { width: result.width, height: result.height };
        };
        const initialCrop = prop("initialCrop");
        if (initialCrop) {
          const constrainedSize2 = clampSize({
            x: 0,
            y: 0,
            width: initialCrop.width,
            height: initialCrop.height
          });
          const { width: width2, height: height2 } = constrainedSize2;
          const max2 = getMaxBounds({ width: width2, height: height2 }, viewportRect);
          const { x: x2, y: y2 } = clampPoint(initialCrop, ZERO_POINT, max2);
          context.set("crop", { x: x2, y: y2, width: width2, height: height2 });
          return;
        }
        const fixedCropArea = prop("fixedCropArea");
        const defaultSize = computeDefaultCropDimensions(viewportRect, aspectRatio, fixedCropArea);
        const constrainedSize = clampSize({
          x: 0,
          y: 0,
          width: defaultSize.width,
          height: defaultSize.height
        });
        const width = constrainedSize.width;
        const height = constrainedSize.height;
        const { x, y } = centerRect({ width, height }, viewportRect);
        context.set("crop", { x, y, width, height });
        context.set("viewportRect", viewportRect);
      },
      setPointerStart({ event, context }) {
        const point = event.point;
        if (!point) return;
        context.set("pointerStart", point);
      },
      setOffsetStart({ context }) {
        const offset = context.get("offset");
        context.set("offsetStart", { ...offset });
      },
      setCropStart({ context }) {
        const crop = context.get("crop");
        context.set("cropStart", crop);
      },
      updateCrop({ context, event, prop }) {
        const handlePosition = context.get("handlePosition");
        const pointerStart = context.get("pointerStart");
        const cropStart = context.get("cropStart");
        const viewportRect = context.get("viewportRect");
        const cropShape = prop("cropShape");
        const aspectRatioProp = prop("aspectRatio");
        let aspectRatio = resolveCropAspectRatio(cropShape, aspectRatioProp);
        const { minSize, maxSize } = getCropSizeLimits(prop);
        if (!pointerStart || !cropStart) return;
        const currentPoint = event.point;
        const delta = subtractPoints(currentPoint, pointerStart);
        let nextCrop;
        if (handlePosition) {
          const allowShiftLock = typeof aspectRatioProp === "undefined" && cropShape !== "circle";
          if (allowShiftLock) {
            if (event.shiftKey) {
              const currentCrop = context.get("crop");
              const w = currentCrop.width;
              const h = currentCrop.height;
              if (w > 0 && h > 0) {
                const ratio = w / h;
                if (ratio > 0) context.set("shiftLockRatio", ratio);
              }
              const lockRatio = context.get("shiftLockRatio");
              if (lockRatio !== null && lockRatio > 0) aspectRatio = lockRatio;
            } else {
              context.set("shiftLockRatio", null);
            }
          } else {
            context.set("shiftLockRatio", null);
          }
          nextCrop = computeResizeCrop({
            cropStart,
            handlePosition,
            delta,
            viewportRect,
            minSize,
            maxSize,
            aspectRatio
          });
        } else {
          nextCrop = computeMoveCrop(cropStart, delta, viewportRect);
        }
        context.set("crop", nextCrop);
      },
      updatePanOffset({ context, event, prop }) {
        const point = event.point;
        const pointerStart = context.get("pointerStart");
        const offsetStart = context.get("offsetStart");
        if (!point || !pointerStart || !offsetStart) return;
        const zoom = context.get("zoom");
        const rotation = context.get("rotation");
        const viewportRect = context.get("viewportRect");
        const delta = subtractPoints(point, pointerStart);
        const nextOffset = clampOffset({
          zoom,
          rotation,
          viewportSize: viewportRect,
          offset: addPoints(offsetStart, delta),
          fixedCropArea: prop("fixedCropArea"),
          crop: context.get("crop"),
          naturalSize: context.get("naturalSize")
        });
        context.set("offset", nextOffset);
      },
      setHandlePosition({ event, context }) {
        const position = event.handlePosition;
        if (!position) return;
        context.set("handlePosition", position);
      },
      setRotation({ context, event }) {
        const rotation = event.rotation;
        const nextRotation = utils.clampValue(rotation, 0, 360);
        context.set("rotation", nextRotation);
      },
      setFlip({ context, event }) {
        const nextFlip = event.flip;
        if (!nextFlip) return;
        const currentFlip = context.get("flip");
        const normalized = normalizeFlipState(nextFlip, currentFlip);
        if (isEqualFlip(normalized, currentFlip)) return;
        context.set("flip", normalized);
      },
      resizeCrop({ context, event, prop }) {
        const { handlePosition, delta } = event;
        if (!handlePosition) return;
        const viewportRect = context.get("viewportRect");
        if (!isVisibleRect(viewportRect)) return;
        const cropShape = prop("cropShape");
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"));
        const { minSize, maxSize } = getCropSizeLimits(prop);
        const crop = context.get("crop");
        const nextCrop = computeResizeCrop({
          cropStart: crop,
          handlePosition,
          delta,
          viewportRect,
          minSize,
          maxSize,
          aspectRatio
        });
        context.set("crop", nextCrop);
      },
      clearPointerStart({ context }) {
        context.set("pointerStart", null);
      },
      clearCropStart({ context }) {
        context.set("cropStart", null);
      },
      clearHandlePosition({ context }) {
        context.set("handlePosition", null);
      },
      clearOffsetStart({ context }) {
        context.set("offsetStart", null);
      },
      clearShiftRatio({ context }) {
        context.set("shiftLockRatio", null);
      },
      updateZoom({ context, event, prop }) {
        let { delta, point, zoom: targetZoom, scale, panDelta } = event;
        const crop = context.get("crop");
        const currentZoom = context.get("zoom");
        const currentOffset = context.get("offset");
        const rotation = context.get("rotation");
        const viewportRect = context.get("viewportRect");
        const naturalSize = context.get("naturalSize");
        const fixedCropArea = prop("fixedCropArea");
        if (!point) {
          point = getCenterPoint(crop);
        }
        const step = Math.abs(prop("zoomStep"));
        const sensitivity = Math.max(0, prop("zoomSensitivity"));
        const [minZoom, maxZoom] = [prop("minZoom"), prop("maxZoom")];
        const calculateNextZoom = () => {
          if (typeof targetZoom === "number") {
            return utils.clampValue(targetZoom, minZoom, maxZoom);
          }
          if (event.trigger === "touch" && typeof scale === "number") {
            const minScale = 0.5;
            const maxScale = 2;
            const clampedScale = utils.clampValue(scale, minScale, maxScale);
            const smoothing = sensitivity > 0 ? Math.pow(clampedScale, sensitivity) : clampedScale;
            return utils.clampValue(currentZoom * smoothing, minZoom, maxZoom);
          }
          if (typeof delta === "number") {
            const direction = Math.sign(delta) < 0 ? 1 : -1;
            return utils.clampValue(currentZoom + step * direction, minZoom, maxZoom);
          }
          return null;
        };
        const applyClampedOffset = (zoom, offset) => {
          return clampOffset({
            zoom,
            rotation,
            viewportSize: viewportRect,
            offset,
            fixedCropArea,
            crop,
            naturalSize
          });
        };
        const nextZoom = calculateNextZoom();
        if (nextZoom === null) return;
        if (nextZoom === currentZoom && panDelta) {
          const nextOffset2 = applyClampedOffset(currentZoom, addPoints(currentOffset, panDelta));
          context.set("offset", nextOffset2);
          return;
        }
        if (nextZoom === currentZoom) return;
        const { width: viewportWidth, height: viewportHeight } = viewportRect;
        const { x: centerX, y: centerY } = getViewportCenter(viewportRect);
        const zoomRatio = nextZoom / currentZoom;
        let nextOffset = {
          x: (1 - zoomRatio) * (point.x - centerX) + zoomRatio * currentOffset.x,
          y: (1 - zoomRatio) * (point.y - centerY) + zoomRatio * currentOffset.y
        };
        if (panDelta) {
          nextOffset = applyClampedOffset(nextZoom, addPoints(nextOffset, panDelta));
        } else if (nextZoom < currentZoom) {
          if (fixedCropArea) {
            nextOffset = applyClampedOffset(nextZoom, nextOffset);
          } else {
            const { width: scaledImageWidth, height: scaledImageHeight } = scaleSize(viewportRect, nextZoom);
            if (scaledImageWidth <= viewportWidth) {
              nextOffset.x = 0;
            } else {
              const minX = viewportWidth - centerX - scaledImageWidth / 2;
              const maxX = scaledImageWidth / 2 - centerX;
              nextOffset.x = Math.max(minX, Math.min(maxX, nextOffset.x));
            }
            if (scaledImageHeight <= viewportHeight) {
              nextOffset.y = 0;
            } else {
              const minY = viewportHeight - centerY - scaledImageHeight / 2;
              const maxY = scaledImageHeight / 2 - centerY;
              nextOffset.y = Math.max(minY, Math.min(maxY, nextOffset.y));
            }
          }
        }
        context.set("zoom", nextZoom);
        context.set("offset", nextOffset);
      },
      setPinchDistance({ context, event, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : [];
        if (touches.length < 2) return;
        if (context.get("pointerStart") !== null) {
          send({ type: "POINTER_UP", src: "pinch" });
        }
        const [first, second] = touches;
        const distance = getTouchDistance(first, second);
        const viewportRect = context.get("viewportRect");
        const midpoint = getMidpoint(first, second, { x: viewportRect.left, y: viewportRect.top });
        context.set("pinchDistance", distance);
        context.set("pinchMidpoint", midpoint);
      },
      handlePinchMove({ context, event, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : [];
        if (touches.length < 2) return;
        const [first, second] = touches;
        const distance = getTouchDistance(first, second);
        const lastDistance = context.get("pinchDistance");
        const lastMidpoint = context.get("pinchMidpoint");
        const viewportRect = context.get("viewportRect");
        const midpoint = getMidpoint(first, second, { x: viewportRect.left, y: viewportRect.top });
        if (lastDistance != null && lastDistance > 0 && lastMidpoint != null) {
          const delta = lastDistance - distance;
          const scale = distance / lastDistance;
          const distanceChange = Math.abs(delta);
          const hasSignificantZoom = distanceChange > 1;
          const panDelta = subtractPoints(midpoint, lastMidpoint);
          send({
            type: "ZOOM",
            trigger: "touch",
            delta,
            scale: hasSignificantZoom ? scale : 1,
            point: midpoint,
            panDelta
          });
        }
        context.set("pinchDistance", distance);
        context.set("pinchMidpoint", midpoint);
      },
      clearPinchDistance({ context }) {
        context.set("pinchDistance", null);
        context.set("pinchMidpoint", null);
      },
      nudgeResizeCrop({ context, event, prop }) {
        const { key, handlePosition, shiftKey, ctrlKey, metaKey } = event;
        const crop = context.get("crop");
        const viewportRect = context.get("viewportRect");
        const step = getNudgeStep(prop, { shiftKey, ctrlKey, metaKey });
        const { minSize, maxSize } = getCropSizeLimits(prop);
        const nextCrop = computeKeyboardCrop(key, handlePosition, step, crop, viewportRect, minSize, maxSize);
        context.set("crop", nextCrop);
      },
      nudgeMoveCrop({ context, event, prop }) {
        const { key, shiftKey, ctrlKey, metaKey } = event;
        const crop = context.get("crop");
        const viewportRect = context.get("viewportRect");
        const step = getNudgeStep(prop, { shiftKey, ctrlKey, metaKey });
        const delta = getKeyboardMoveDelta(key, step);
        const nextCrop = computeMoveCrop(crop, delta, viewportRect);
        context.set("crop", nextCrop);
      },
      resizeViewport({ context, prop, scope, send }) {
        const viewportEl = getViewportEl(scope);
        if (!viewportEl) return;
        const newViewportRect = getBoundingRect(viewportEl);
        if (!isVisibleRect(newViewportRect)) return;
        const oldViewportRect = context.get("viewportRect");
        if (isSameSize(oldViewportRect, newViewportRect)) {
          return;
        }
        context.set("viewportRect", newViewportRect);
        const oldCrop = context.get("crop");
        if (!isVisibleRect(oldViewportRect)) {
          if (!isVisibleRect(oldCrop)) {
            send({ type: "SET_DEFAULT_CROP", src: "viewport-resize" });
            return;
          }
        }
        const cropShape = prop("cropShape");
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"));
        const { minSize, maxSize } = getCropSizeLimits(prop);
        const scale = {
          x: newViewportRect.width / oldViewportRect.width,
          y: newViewportRect.height / oldViewportRect.height
        };
        let newCrop = scaleRect(oldCrop, scale);
        const constrainedCrop = computeResizeCrop({
          cropStart: newCrop,
          handlePosition: "se",
          delta: ZERO_POINT,
          viewportRect: newViewportRect,
          minSize,
          maxSize,
          aspectRatio
        });
        const max2 = getMaxBounds(constrainedCrop, newViewportRect);
        const { x, y } = clampPoint(constrainedCrop, ZERO_POINT, max2);
        context.set("crop", {
          x,
          y,
          width: constrainedCrop.width,
          height: constrainedCrop.height
        });
      },
      resetToInitialState({ context }) {
        context.set("zoom", context.initial("zoom"));
        context.set("rotation", context.initial("rotation"));
        context.set("flip", context.initial("flip"));
        context.set("offset", ZERO_POINT);
        context.set("crop", context.initial("crop"));
      }
    },
    effects: {
      trackPointerMove({ scope, send }) {
        function onPointerMove(event) {
          const point = domQuery.getEventPoint(event);
          const target = domQuery.getEventTarget(event);
          send({ type: "POINTER_MOVE", point, target, shiftKey: event.shiftKey });
        }
        function onPointerUp() {
          send({ type: "POINTER_UP" });
        }
        return utils.callAll(
          domQuery.addDomEvent(scope.getDoc(), "pointermove", onPointerMove),
          domQuery.addDomEvent(scope.getDoc(), "pointerup", onPointerUp)
        );
      },
      trackViewportResize({ scope, send }) {
        const viewportEl = getViewportEl(scope);
        if (!viewportEl) return;
        return domQuery.resizeObserverBorderBox.observe(viewportEl, () => {
          send({ type: "VIEWPORT_RESIZE", src: "resize" });
        });
      },
      trackWheelEvent({ scope, send }) {
        const viewportEl = getViewportEl(scope);
        if (!viewportEl) return;
        function onWheel(event) {
          event.preventDefault();
          if (!viewportEl) return;
          const rect = viewportEl.getBoundingClientRect();
          const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          };
          send({ type: "ZOOM", trigger: "wheel", delta: event.deltaY, point });
        }
        return domQuery.addDomEvent(viewportEl, "wheel", onWheel, { passive: false });
      },
      trackTouchEvents({ scope, send }) {
        const viewportEl = getViewportEl(scope);
        if (!viewportEl) return;
        function onTouchStart(event) {
          if (event.touches.length >= 2) {
            event.preventDefault();
            const touches = Array.from(event.touches).map((touch) => ({
              x: touch.clientX,
              y: touch.clientY
            }));
            send({ type: "PINCH_START", touches });
          }
        }
        function onTouchMove(event) {
          if (event.touches.length >= 2) {
            event.preventDefault();
            const touches = Array.from(event.touches).map((touch) => ({
              x: touch.clientX,
              y: touch.clientY
            }));
            send({ type: "PINCH_MOVE", touches });
          }
        }
        function onTouchEnd(event) {
          if (event.touches.length < 2) {
            send({ type: "PINCH_END" });
          }
        }
        return utils.callAll(
          domQuery.addDomEvent(viewportEl, "touchstart", onTouchStart, { passive: false }),
          domQuery.addDomEvent(viewportEl, "touchmove", onTouchMove, { passive: false }),
          domQuery.addDomEvent(viewportEl, "touchend", onTouchEnd)
        );
      }
    }
  }
});
var getBoundingRect = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom
  };
};
var props = types.createProps()([
  "id",
  "ids",
  "dir",
  "getRootNode",
  "initialCrop",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "aspectRatio",
  "cropShape",
  "zoom",
  "rotation",
  "flip",
  "defaultZoom",
  "defaultRotation",
  "defaultFlip",
  "zoomStep",
  "zoomSensitivity",
  "minZoom",
  "maxZoom",
  "onZoomChange",
  "onRotationChange",
  "onFlipChange",
  "onCropChange",
  "fixedCropArea",
  "nudgeStep",
  "nudgeStepShift",
  "nudgeStepCtrl",
  "translations"
]);
var splitProps = utils.createSplitProps(props);
var handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

exports.anatomy = anatomy;
exports.connect = connect;
exports.handles = handles;
exports.machine = machine;
exports.props = props;
exports.splitProps = splitProps;
