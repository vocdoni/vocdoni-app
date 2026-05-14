import { createAnatomy } from '@zag-js/anatomy';
import { dataAttr } from '@zag-js/dom-query';
import { createSplitProps, isNumber } from '@zag-js/utils';
import { createMachine, memo } from '@zag-js/core';
import { createProps } from '@zag-js/types';

// src/pagination.anatomy.ts
var anatomy = createAnatomy("pagination").parts(
  "root",
  "item",
  "ellipsis",
  "firstTrigger",
  "prevTrigger",
  "nextTrigger",
  "lastTrigger"
);
var parts = anatomy.build();

// src/pagination.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`;
var getFirstTriggerId = (ctx) => ctx.ids?.firstTrigger ?? `pagination:${ctx.id}:first`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `pagination:${ctx.id}:prev`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `pagination:${ctx.id}:next`;
var getLastTriggerId = (ctx) => ctx.ids?.lastTrigger ?? `pagination:${ctx.id}:last`;
var getEllipsisId = (ctx, index) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`;
var getItemId = (ctx, page) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`;
var range = (start, end) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};
var transform = (items) => {
  return items.map((value) => {
    if (isNumber(value)) return { type: "page", value };
    return { type: "ellipsis" };
  });
};
var ELLIPSIS = "ellipsis";
var getRange = (ctx) => {
  const { page, totalPages, siblingCount, boundaryCount = 1 } = ctx;
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];
  const firstPageIndex = 1;
  const lastPageIndex = totalPages;
  const leftSiblingIndex = Math.max(page - siblingCount, firstPageIndex);
  const rightSiblingIndex = Math.min(page + siblingCount, lastPageIndex);
  const totalPageNumbers = Math.min(siblingCount * 2 + 3 + boundaryCount * 2, totalPages);
  if (totalPages <= totalPageNumbers) {
    return range(firstPageIndex, lastPageIndex);
  }
  const itemCount = totalPageNumbers - 1 - boundaryCount;
  const showLeftEllipsis = leftSiblingIndex > firstPageIndex + boundaryCount + 1 && Math.abs(leftSiblingIndex - firstPageIndex) > boundaryCount + 1;
  const showRightEllipsis = rightSiblingIndex < lastPageIndex - boundaryCount - 1 && Math.abs(lastPageIndex - rightSiblingIndex) > boundaryCount + 1;
  let pages = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, itemCount);
    pages.push(...leftRange, ELLIPSIS);
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
  } else if (showLeftEllipsis && !showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1));
    pages.push(ELLIPSIS);
    const rightRange = range(lastPageIndex - itemCount + 1, lastPageIndex);
    pages.push(...rightRange);
  } else if (showLeftEllipsis && showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1));
    pages.push(ELLIPSIS);
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    pages.push(...middleRange);
    pages.push(ELLIPSIS);
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
  } else {
    pages.push(...range(firstPageIndex, lastPageIndex));
  }
  for (let i = 0; i < pages.length; i++) {
    if (pages[i] === ELLIPSIS) {
      const prevPage = isNumber(pages[i - 1]) ? pages[i - 1] : 0;
      const nextPage = isNumber(pages[i + 1]) ? pages[i + 1] : totalPages + 1;
      if (nextPage - prevPage === 2) {
        pages[i] = prevPage + 1;
      }
    }
  }
  return pages;
};
var getTransformedRange = (ctx) => transform(getRange(ctx));

// src/pagination.connect.ts
function connect(service, normalize) {
  const { send, scope, prop, computed, context } = service;
  const totalPages = computed("totalPages");
  const page = context.get("page");
  const pageSize = context.get("pageSize");
  const translations = prop("translations");
  const count = prop("count");
  const getPageUrl = prop("getPageUrl");
  const type = prop("type");
  const previousPage = computed("previousPage");
  const nextPage = computed("nextPage");
  const pageRange = computed("pageRange");
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;
  const pages = getTransformedRange({
    page,
    totalPages,
    siblingCount: prop("siblingCount"),
    boundaryCount: prop("boundaryCount")
  });
  return {
    count,
    page,
    pageSize,
    totalPages,
    pages,
    previousPage,
    nextPage,
    pageRange,
    slice(data) {
      return data.slice(pageRange.start, pageRange.end);
    },
    setPageSize(size) {
      send({ type: "SET_PAGE_SIZE", size });
    },
    setPage(page2) {
      send({ type: "SET_PAGE", page: page2 });
    },
    goToNextPage() {
      send({ type: "NEXT_PAGE" });
    },
    goToPrevPage() {
      send({ type: "PREVIOUS_PAGE" });
    },
    goToFirstPage() {
      send({ type: "FIRST_PAGE" });
    },
    goToLastPage() {
      send({ type: "LAST_PAGE" });
    },
    getRootProps() {
      return normalize.element({
        id: getRootId(scope),
        ...parts.root.attrs,
        dir: prop("dir"),
        "aria-label": translations.rootLabel
      });
    },
    getEllipsisProps(props2) {
      return normalize.element({
        id: getEllipsisId(scope, props2.index),
        ...parts.ellipsis.attrs,
        dir: prop("dir")
      });
    },
    getItemProps(props2) {
      const index = props2.value;
      const isCurrentPage = index === page;
      return normalize.element({
        id: getItemId(scope, index),
        ...parts.item.attrs,
        dir: prop("dir"),
        "data-index": index,
        "data-selected": dataAttr(isCurrentPage),
        "aria-current": isCurrentPage ? "page" : void 0,
        "aria-label": translations.itemLabel?.({ page: index, totalPages }),
        onClick() {
          send({ type: "SET_PAGE", page: index });
        },
        ...type === "button" && { type: "button" },
        ...type === "link" && getPageUrl && {
          href: getPageUrl({ page: index, pageSize })
        }
      });
    },
    getPrevTriggerProps() {
      return normalize.element({
        id: getPrevTriggerId(scope),
        ...parts.prevTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isFirstPage),
        "aria-label": translations.prevTriggerLabel,
        onClick() {
          send({ type: "PREVIOUS_PAGE" });
        },
        ...type === "button" && { disabled: isFirstPage, type: "button" },
        ...type === "link" && getPageUrl && previousPage && {
          href: getPageUrl({ page: previousPage, pageSize })
        }
      });
    },
    getFirstTriggerProps() {
      return normalize.element({
        id: getFirstTriggerId(scope),
        ...parts.firstTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isFirstPage),
        "aria-label": translations.firstTriggerLabel,
        onClick() {
          send({ type: "FIRST_PAGE" });
        },
        ...type === "button" && { disabled: isFirstPage, type: "button" },
        ...type === "link" && getPageUrl && {
          href: getPageUrl({ page: 1, pageSize })
        }
      });
    },
    getNextTriggerProps() {
      return normalize.element({
        id: getNextTriggerId(scope),
        ...parts.nextTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isLastPage),
        "aria-label": translations.nextTriggerLabel,
        onClick() {
          send({ type: "NEXT_PAGE" });
        },
        ...type === "button" && { disabled: isLastPage, type: "button" },
        ...type === "link" && getPageUrl && nextPage && {
          href: getPageUrl({ page: nextPage, pageSize })
        }
      });
    },
    getLastTriggerProps() {
      return normalize.element({
        id: getLastTriggerId(scope),
        ...parts.lastTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isLastPage),
        "aria-label": translations.lastTriggerLabel,
        onClick() {
          send({ type: "LAST_PAGE" });
        },
        ...type === "button" && { disabled: isLastPage, type: "button" },
        ...type === "link" && getPageUrl && {
          href: getPageUrl({ page: totalPages, pageSize })
        }
      });
    }
  };
}
var machine = createMachine({
  props({ props: props2 }) {
    return {
      defaultPageSize: 10,
      siblingCount: 1,
      boundaryCount: 1,
      defaultPage: 1,
      type: "button",
      count: 1,
      ...props2,
      translations: {
        rootLabel: "pagination",
        firstTriggerLabel: "first page",
        prevTriggerLabel: "previous page",
        nextTriggerLabel: "next page",
        lastTriggerLabel: "last page",
        itemLabel({ page, totalPages }) {
          const isLastPage = totalPages > 1 && page === totalPages;
          return `${isLastPage ? "last page, " : ""}page ${page}`;
        },
        ...props2.translations
      }
    };
  },
  initialState() {
    return "idle";
  },
  context({ prop, bindable, getContext }) {
    return {
      page: bindable(() => ({
        value: prop("page"),
        defaultValue: prop("defaultPage"),
        onChange(value) {
          const context = getContext();
          prop("onPageChange")?.({ page: value, pageSize: context.get("pageSize") });
        }
      })),
      pageSize: bindable(() => ({
        value: prop("pageSize"),
        defaultValue: prop("defaultPageSize"),
        onChange(value) {
          prop("onPageSizeChange")?.({ pageSize: value });
        }
      }))
    };
  },
  watch({ track, context, action }) {
    track([() => context.get("pageSize")], () => {
      action(["setPageIfNeeded"]);
    });
  },
  computed: {
    totalPages: memo(
      ({ prop, context }) => [context.get("pageSize"), prop("count")],
      ([pageSize, count]) => Math.ceil(count / pageSize)
    ),
    pageRange: memo(
      ({ context, prop }) => [context.get("page"), context.get("pageSize"), prop("count")],
      ([page, pageSize, count]) => {
        const start = (page - 1) * pageSize;
        return { start, end: Math.min(start + pageSize, count) };
      }
    ),
    previousPage: ({ context }) => context.get("page") === 1 ? null : context.get("page") - 1,
    nextPage: ({ context, computed }) => context.get("page") === computed("totalPages") ? null : context.get("page") + 1,
    isValidPage: ({ context, computed }) => context.get("page") >= 1 && context.get("page") <= computed("totalPages")
  },
  on: {
    SET_PAGE: {
      guard: "isValidPage",
      actions: ["setPage"]
    },
    SET_PAGE_SIZE: {
      actions: ["setPageSize"]
    },
    FIRST_PAGE: {
      actions: ["goToFirstPage"]
    },
    LAST_PAGE: {
      actions: ["goToLastPage"]
    },
    PREVIOUS_PAGE: {
      guard: "canGoToPrevPage",
      actions: ["goToPrevPage"]
    },
    NEXT_PAGE: {
      guard: "canGoToNextPage",
      actions: ["goToNextPage"]
    }
  },
  states: {
    idle: {}
  },
  implementations: {
    guards: {
      isValidPage: ({ event, computed }) => event.page >= 1 && event.page <= computed("totalPages"),
      isValidCount: ({ context, event }) => context.get("page") > event.count,
      canGoToNextPage: ({ context, computed }) => context.get("page") < computed("totalPages"),
      canGoToPrevPage: ({ context }) => context.get("page") > 1
    },
    actions: {
      setPage({ context, event, computed }) {
        const page = clampPage(event.page, computed("totalPages"));
        context.set("page", page);
      },
      setPageSize({ context, event }) {
        context.set("pageSize", event.size);
      },
      goToFirstPage({ context }) {
        context.set("page", 1);
      },
      goToLastPage({ context, computed }) {
        context.set("page", computed("totalPages"));
      },
      goToPrevPage({ context, computed }) {
        context.set("page", (prev) => clampPage(prev - 1, computed("totalPages")));
      },
      goToNextPage({ context, computed }) {
        context.set("page", (prev) => clampPage(prev + 1, computed("totalPages")));
      },
      setPageIfNeeded({ context, computed }) {
        if (computed("isValidPage")) return;
        context.set("page", 1);
      }
    }
  }
});
var clampPage = (page, totalPages) => Math.min(Math.max(page, 1), totalPages);
var props = createProps()([
  "boundaryCount",
  "count",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onPageChange",
  "onPageSizeChange",
  "page",
  "defaultPage",
  "pageSize",
  "defaultPageSize",
  "siblingCount",
  "translations",
  "type",
  "getPageUrl"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["value", "type"]);
var splitItemProps = createSplitProps(itemProps);
var ellipsisProps = createProps()(["index"]);
var splitEllipsisProps = createSplitProps(ellipsisProps);

export { anatomy, connect, ellipsisProps, itemProps, machine, props, splitEllipsisProps, splitItemProps, splitProps };
