'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var collection$1 = require('@zag-js/collection');
var domQuery = require('@zag-js/dom-query');
var utils = require('@zag-js/utils');
var core = require('@zag-js/core');
var types = require('@zag-js/types');

// src/tree-view.anatomy.ts
var anatomy = anatomy$1.createAnatomy("tree-view").parts(
  "branch",
  "branchContent",
  "branchControl",
  "branchIndentGuide",
  "branchIndicator",
  "branchText",
  "branchTrigger",
  "item",
  "itemIndicator",
  "itemText",
  "label",
  "nodeCheckbox",
  "nodeRenameInput",
  "root",
  "tree"
);
var parts = anatomy.build();
var collection = (options) => {
  return new collection$1.TreeCollection(options);
};
collection.empty = () => {
  return new collection$1.TreeCollection({ rootNode: { children: [] } });
};
function filePathCollection(paths) {
  return collection$1.filePathToTree(paths);
}

// src/tree-view.dom.ts
var getRootId = (ctx) => ctx.ids?.root ?? `tree:${ctx.id}:root`;
var getLabelId = (ctx) => ctx.ids?.label ?? `tree:${ctx.id}:label`;
var getNodeId = (ctx, value) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`;
var getTreeId = (ctx) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`;
var focusNode = (ctx, value) => {
  if (value == null) return;
  ctx.getById(getNodeId(ctx, value))?.focus();
};
var getRenameInputId = (ctx, value) => `tree:${ctx.id}:rename-input:${value}`;
var getRenameInputEl = (ctx, value) => {
  return ctx.getById(getRenameInputId(ctx, value));
};
function getCheckedState(collection2, node, checkedValue) {
  const value = collection2.getNodeValue(node);
  if (!collection2.isBranchNode(node)) {
    return checkedValue.includes(value);
  }
  const childValues = collection2.getDescendantValues(value);
  const allChecked = childValues.every((v) => checkedValue.includes(v));
  const someChecked = childValues.some((v) => checkedValue.includes(v));
  return allChecked ? true : someChecked ? "indeterminate" : false;
}
function toggleBranchChecked(collection2, value, checkedValue) {
  const childValues = collection2.getDescendantValues(value);
  const allChecked = childValues.every((child) => checkedValue.includes(child));
  return utils.uniq(allChecked ? utils.remove(checkedValue, ...childValues) : utils.add(checkedValue, ...childValues));
}
function getCheckedValueMap(collection2, checkedValue) {
  const map = /* @__PURE__ */ new Map();
  collection2.visit({
    onEnter: (node) => {
      const value = collection2.getNodeValue(node);
      const isBranch = collection2.isBranchNode(node);
      const checked = getCheckedState(collection2, node, checkedValue);
      map.set(value, {
        type: isBranch ? "branch" : "leaf",
        checked
      });
    }
  });
  return map;
}

// src/tree-view.connect.ts
function connect(service, normalize) {
  const { context, scope, computed, prop, send } = service;
  const collection2 = prop("collection");
  const expandedValue = Array.from(context.get("expandedValue"));
  const selectedValue = Array.from(context.get("selectedValue"));
  const checkedValue = Array.from(context.get("checkedValue"));
  const isTypingAhead = computed("isTypingAhead");
  const focusedValue = context.get("focusedValue");
  const loadingStatus = context.get("loadingStatus");
  const renamingValue = context.get("renamingValue");
  function getNodeState(props2) {
    const { node, indexPath } = props2;
    const value = collection2.getNodeValue(node);
    const firstNode = collection2.getFirstNode();
    const firstNodeValue = firstNode ? collection2.getNodeValue(firstNode) : null;
    return {
      id: getNodeId(scope, value),
      value,
      indexPath,
      valuePath: collection2.getValuePath(indexPath),
      disabled: Boolean(node.disabled),
      focused: focusedValue == null ? firstNodeValue == value : focusedValue === value,
      selected: selectedValue.includes(value),
      expanded: expandedValue.includes(value),
      loading: loadingStatus[value] === "loading",
      depth: indexPath.length,
      isBranch: collection2.isBranchNode(node),
      renaming: renamingValue === value,
      get checked() {
        return getCheckedState(collection2, node, checkedValue);
      }
    };
  }
  return {
    collection: collection2,
    expandedValue,
    selectedValue,
    checkedValue,
    toggleChecked(value, isBranch) {
      send({ type: "CHECKED.TOGGLE", value, isBranch });
    },
    setChecked(value) {
      send({ type: "CHECKED.SET", value });
    },
    clearChecked() {
      send({ type: "CHECKED.CLEAR" });
    },
    getCheckedMap() {
      return getCheckedValueMap(collection2, checkedValue);
    },
    expand(value) {
      send({ type: value ? "BRANCH.EXPAND" : "EXPANDED.ALL", value });
    },
    collapse(value) {
      send({ type: value ? "BRANCH.COLLAPSE" : "EXPANDED.CLEAR", value });
    },
    deselect(value) {
      send({ type: value ? "NODE.DESELECT" : "SELECTED.CLEAR", value });
    },
    select(value) {
      send({ type: value ? "NODE.SELECT" : "SELECTED.ALL", value, isTrusted: false });
    },
    getVisibleNodes() {
      return computed("visibleNodes");
    },
    focus(value) {
      focusNode(scope, value);
    },
    selectParent(value) {
      const parentNode = collection2.getParentNode(value);
      if (!parentNode) return;
      const _selectedValue = utils.add(selectedValue, collection2.getNodeValue(parentNode));
      send({ type: "SELECTED.SET", value: _selectedValue, src: "select.parent" });
    },
    expandParent(value) {
      const parentNode = collection2.getParentNode(value);
      if (!parentNode) return;
      const _expandedValue = utils.add(expandedValue, collection2.getNodeValue(parentNode));
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "expand.parent" });
    },
    setExpandedValue(value) {
      const _expandedValue = utils.uniq(value);
      send({ type: "EXPANDED.SET", value: _expandedValue });
    },
    setSelectedValue(value) {
      const _selectedValue = utils.uniq(value);
      send({ type: "SELECTED.SET", value: _selectedValue });
    },
    startRenaming(value) {
      send({ type: "NODE.RENAME", value });
    },
    submitRenaming(value, label) {
      send({ type: "RENAME.SUBMIT", value, label });
    },
    cancelRenaming() {
      send({ type: "RENAME.CANCEL" });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: getRootId(scope),
        dir: prop("dir")
      });
    },
    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        id: getLabelId(scope),
        dir: prop("dir")
      });
    },
    getTreeProps() {
      return normalize.element({
        ...parts.tree.attrs,
        id: getTreeId(scope),
        dir: prop("dir"),
        role: "tree",
        "aria-label": "Tree View",
        "aria-labelledby": getLabelId(scope),
        "aria-multiselectable": prop("selectionMode") === "multiple" || void 0,
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (domQuery.isComposingEvent(event)) return;
          const target = domQuery.getEventTarget(event);
          if (domQuery.isEditableElement(target)) return;
          const node = target?.closest("[data-part=branch-control], [data-part=item]");
          if (!node) return;
          const nodeId = node.dataset.value;
          if (nodeId == null) {
            console.warn(`[zag-js/tree-view] Node id not found for node`, node);
            return;
          }
          const isBranchNode = node.matches("[data-part=branch-control]");
          const keyMap = {
            ArrowDown(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.ARROW_DOWN", id: nodeId, shiftKey: event2.shiftKey });
            },
            ArrowUp(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.ARROW_UP", id: nodeId, shiftKey: event2.shiftKey });
            },
            ArrowLeft(event2) {
              if (domQuery.isModifierKey(event2) || node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: isBranchNode ? "BRANCH_NODE.ARROW_LEFT" : "NODE.ARROW_LEFT", id: nodeId });
            },
            ArrowRight(event2) {
              if (!isBranchNode || node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: "BRANCH_NODE.ARROW_RIGHT", id: nodeId });
            },
            Home(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.HOME", id: nodeId, shiftKey: event2.shiftKey });
            },
            End(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.END", id: nodeId, shiftKey: event2.shiftKey });
            },
            Space(event2) {
              if (node.dataset.disabled) return;
              if (isTypingAhead) {
                send({ type: "TREE.TYPEAHEAD", key: event2.key });
              } else {
                keyMap.Enter?.(event2);
              }
            },
            Enter(event2) {
              if (node.dataset.disabled) return;
              if (domQuery.isAnchorElement(target) && domQuery.isModifierKey(event2)) return;
              send({ type: isBranchNode ? "BRANCH_NODE.CLICK" : "NODE.CLICK", id: nodeId, src: "keyboard" });
              if (!domQuery.isAnchorElement(target)) {
                event2.preventDefault();
              }
            },
            "*"(event2) {
              if (node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: "SIBLINGS.EXPAND", id: nodeId });
            },
            a(event2) {
              if (!event2.metaKey || node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: "SELECTED.ALL", moveFocus: true });
            },
            F2(event2) {
              if (node.dataset.disabled) return;
              const canRenameFn = prop("canRename");
              if (!canRenameFn) return;
              const indexPath = collection2.getIndexPath(nodeId);
              if (indexPath) {
                const node2 = collection2.at(indexPath);
                if (node2 && !canRenameFn(node2, indexPath)) {
                  return;
                }
              }
              event2.preventDefault();
              send({ type: "NODE.RENAME", value: nodeId });
            }
          };
          const key = domQuery.getEventKey(event, { dir: prop("dir") });
          const exec = keyMap[key];
          if (exec) {
            exec(event);
            return;
          }
          if (!domQuery.getByTypeahead.isValidEvent(event)) return;
          send({ type: "TREE.TYPEAHEAD", key: event.key, id: nodeId });
          event.preventDefault();
        }
      });
    },
    getNodeState,
    getItemProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.item.attrs,
        id: nodeState.id,
        dir: prop("dir"),
        "data-ownedby": getTreeId(scope),
        "data-path": props2.indexPath.join("/"),
        "data-value": nodeState.value,
        tabIndex: nodeState.focused ? 0 : -1,
        "data-focus": domQuery.dataAttr(nodeState.focused),
        role: "treeitem",
        "aria-current": nodeState.selected ? "true" : void 0,
        "aria-selected": nodeState.disabled ? void 0 : nodeState.selected,
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "aria-disabled": domQuery.ariaAttr(nodeState.disabled),
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-renaming": domQuery.dataAttr(nodeState.renaming),
        "aria-level": nodeState.depth,
        "data-depth": nodeState.depth,
        style: {
          "--depth": nodeState.depth
        },
        onFocus(event) {
          event.stopPropagation();
          send({ type: "NODE.FOCUS", id: nodeState.value });
        },
        onClick(event) {
          if (nodeState.disabled) return;
          if (!domQuery.isLeftClick(event)) return;
          if (domQuery.isAnchorElement(event.currentTarget) && domQuery.isModifierKey(event)) return;
          const isMetaKey = event.metaKey || event.ctrlKey;
          send({ type: "NODE.CLICK", id: nodeState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey });
          event.stopPropagation();
          if (!domQuery.isAnchorElement(event.currentTarget)) {
            event.preventDefault();
          }
        }
      });
    },
    getItemTextProps(props2) {
      const itemState = getNodeState(props2);
      return normalize.element({
        ...parts.itemText.attrs,
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "data-selected": domQuery.dataAttr(itemState.selected),
        "data-focus": domQuery.dataAttr(itemState.focused)
      });
    },
    getItemIndicatorProps(props2) {
      const itemState = getNodeState(props2);
      return normalize.element({
        ...parts.itemIndicator.attrs,
        "aria-hidden": true,
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "data-selected": domQuery.dataAttr(itemState.selected),
        "data-focus": domQuery.dataAttr(itemState.focused),
        hidden: !itemState.selected
      });
    },
    getBranchProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branch.attrs,
        "data-depth": nodeState.depth,
        dir: prop("dir"),
        "data-branch": nodeState.value,
        role: "treeitem",
        "data-ownedby": getTreeId(scope),
        "data-value": nodeState.value,
        "aria-level": nodeState.depth,
        "aria-selected": nodeState.disabled ? void 0 : nodeState.selected,
        "data-path": props2.indexPath.join("/"),
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "aria-expanded": nodeState.expanded,
        "data-state": nodeState.expanded ? "open" : "closed",
        "aria-disabled": domQuery.ariaAttr(nodeState.disabled),
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-loading": domQuery.dataAttr(nodeState.loading),
        "aria-busy": domQuery.ariaAttr(nodeState.loading),
        style: {
          "--depth": nodeState.depth
        }
      });
    },
    getBranchIndicatorProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchIndicator.attrs,
        "aria-hidden": true,
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "data-focus": domQuery.dataAttr(nodeState.focused),
        "data-loading": domQuery.dataAttr(nodeState.loading)
      });
    },
    getBranchTriggerProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchTrigger.attrs,
        role: "button",
        dir: prop("dir"),
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-value": nodeState.value,
        "data-loading": domQuery.dataAttr(nodeState.loading),
        disabled: nodeState.loading,
        onClick(event) {
          if (nodeState.disabled || nodeState.loading) return;
          send({ type: "BRANCH_TOGGLE.CLICK", id: nodeState.value });
          event.stopPropagation();
        }
      });
    },
    getBranchControlProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchControl.attrs,
        role: "button",
        id: nodeState.id,
        dir: prop("dir"),
        tabIndex: nodeState.focused ? 0 : -1,
        "data-path": props2.indexPath.join("/"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "data-focus": domQuery.dataAttr(nodeState.focused),
        "data-renaming": domQuery.dataAttr(nodeState.renaming),
        "data-value": nodeState.value,
        "data-depth": nodeState.depth,
        "data-loading": domQuery.dataAttr(nodeState.loading),
        "aria-busy": domQuery.ariaAttr(nodeState.loading),
        onFocus(event) {
          send({ type: "NODE.FOCUS", id: nodeState.value });
          event.stopPropagation();
        },
        onClick(event) {
          if (nodeState.disabled) return;
          if (nodeState.loading) return;
          if (!domQuery.isLeftClick(event)) return;
          if (domQuery.isAnchorElement(event.currentTarget) && domQuery.isModifierKey(event)) return;
          const isMetaKey = event.metaKey || event.ctrlKey;
          send({ type: "BRANCH_NODE.CLICK", id: nodeState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey });
          event.stopPropagation();
        }
      });
    },
    getBranchTextProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchText.attrs,
        dir: prop("dir"),
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-loading": domQuery.dataAttr(nodeState.loading)
      });
    },
    getBranchContentProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchContent.attrs,
        role: "group",
        dir: prop("dir"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-depth": nodeState.depth,
        "data-path": props2.indexPath.join("/"),
        "data-value": nodeState.value,
        hidden: !nodeState.expanded
      });
    },
    getBranchIndentGuideProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchIndentGuide.attrs,
        "data-depth": nodeState.depth
      });
    },
    getNodeCheckboxProps(props2) {
      const nodeState = getNodeState(props2);
      const checkedState = nodeState.checked;
      return normalize.element({
        ...parts.nodeCheckbox.attrs,
        tabIndex: -1,
        role: "checkbox",
        "data-state": checkedState === true ? "checked" : checkedState === false ? "unchecked" : "indeterminate",
        "aria-checked": checkedState === true ? "true" : checkedState === false ? "false" : "mixed",
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (nodeState.disabled) return;
          if (!domQuery.isLeftClick(event)) return;
          send({ type: "CHECKED.TOGGLE", value: nodeState.value, isBranch: nodeState.isBranch });
          event.stopPropagation();
          const node = event.currentTarget.closest("[role=treeitem]");
          node?.focus({ preventScroll: true });
        }
      });
    },
    getNodeRenameInputProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.input({
        ...parts.nodeRenameInput.attrs,
        id: getRenameInputId(scope, nodeState.value),
        type: "text",
        "aria-label": "Rename tree item",
        hidden: !nodeState.renaming,
        onKeyDown(event) {
          if (domQuery.isComposingEvent(event)) return;
          if (event.key === "Escape") {
            send({ type: "RENAME.CANCEL" });
            event.preventDefault();
          }
          if (event.key === "Enter") {
            send({ type: "RENAME.SUBMIT", label: event.currentTarget.value });
            event.preventDefault();
          }
          event.stopPropagation();
        },
        onBlur(event) {
          send({ type: "RENAME.SUBMIT", label: event.currentTarget.value });
        }
      });
    }
  };
}
function expandBranches(params, values) {
  const { context, prop, refs } = params;
  if (!prop("loadChildren")) {
    context.set("expandedValue", (prev) => utils.uniq(utils.add(prev, ...values)));
    return;
  }
  const loadingStatus = context.get("loadingStatus");
  const [loadedValues, loadingValues] = utils.partition(values, (value) => loadingStatus[value] === "loaded");
  if (loadedValues.length > 0) {
    context.set("expandedValue", (prev) => utils.uniq(utils.add(prev, ...loadedValues)));
  }
  if (loadingValues.length === 0) return;
  const collection2 = prop("collection");
  const [nodeWithChildren, nodeWithoutChildren] = utils.partition(loadingValues, (id) => {
    const node = collection2.findNode(id);
    return collection2.getNodeChildren(node).length > 0;
  });
  if (nodeWithChildren.length > 0) {
    context.set("expandedValue", (prev) => utils.uniq(utils.add(prev, ...nodeWithChildren)));
  }
  if (nodeWithoutChildren.length === 0) return;
  context.set("loadingStatus", (prev) => ({
    ...prev,
    ...nodeWithoutChildren.reduce((acc, id) => ({ ...acc, [id]: "loading" }), {})
  }));
  const nodesToLoad = nodeWithoutChildren.map((id) => {
    const indexPath = collection2.getIndexPath(id);
    const valuePath = collection2.getValuePath(indexPath);
    const node = collection2.findNode(id);
    return { id, indexPath, valuePath, node };
  });
  const pendingAborts = refs.get("pendingAborts");
  const loadChildren = prop("loadChildren");
  utils.ensure(loadChildren, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
  const proms = nodesToLoad.map(({ id, indexPath, valuePath, node }) => {
    const existingAbort = pendingAborts.get(id);
    if (existingAbort) {
      existingAbort.abort();
      pendingAborts.delete(id);
    }
    const abortController = new AbortController();
    pendingAborts.set(id, abortController);
    return loadChildren({
      valuePath,
      indexPath,
      node,
      signal: abortController.signal
    });
  });
  Promise.allSettled(proms).then((results) => {
    const loadedValues2 = [];
    const nodeWithErrors = [];
    const nextLoadingStatus = context.get("loadingStatus");
    let collection3 = prop("collection");
    results.forEach((result, index) => {
      const { id, indexPath, node, valuePath } = nodesToLoad[index];
      if (result.status === "fulfilled") {
        nextLoadingStatus[id] = "loaded";
        loadedValues2.push(id);
        collection3 = collection3.replace(indexPath, { ...node, children: result.value });
      } else {
        pendingAborts.delete(id);
        Reflect.deleteProperty(nextLoadingStatus, id);
        nodeWithErrors.push({ node, error: result.reason, indexPath, valuePath });
      }
    });
    context.set("loadingStatus", nextLoadingStatus);
    if (loadedValues2.length) {
      context.set("expandedValue", (prev) => utils.uniq(utils.add(prev, ...loadedValues2)));
      prop("onLoadChildrenComplete")?.({ collection: collection3 });
    }
    if (nodeWithErrors.length) {
      prop("onLoadChildrenError")?.({ nodes: nodeWithErrors });
    }
  });
}

// src/utils/visit-skip.ts
function skipFn(params) {
  const { prop, context } = params;
  return function skip({ indexPath }) {
    const paths = prop("collection").getValuePath(indexPath).slice(0, -1);
    return paths.some((value) => !context.get("expandedValue").includes(value));
  };
}

// src/tree-view.machine.ts
var { and } = core.createGuards();
var machine = core.createMachine({
  props({ props: props2 }) {
    return {
      selectionMode: "single",
      collection: collection.empty(),
      typeahead: true,
      expandOnClick: true,
      defaultExpandedValue: [],
      defaultSelectedValue: [],
      ...props2
    };
  },
  initialState() {
    return "idle";
  },
  context({ prop, bindable, getContext }) {
    return {
      expandedValue: bindable(() => ({
        defaultValue: prop("defaultExpandedValue"),
        value: prop("expandedValue"),
        isEqual: utils.isEqual,
        onChange(expandedValue) {
          const ctx = getContext();
          const focusedValue = ctx.get("focusedValue");
          prop("onExpandedChange")?.({
            expandedValue,
            focusedValue,
            get expandedNodes() {
              return prop("collection").findNodes(expandedValue);
            }
          });
        }
      })),
      selectedValue: bindable(() => ({
        defaultValue: prop("defaultSelectedValue"),
        value: prop("selectedValue"),
        isEqual: utils.isEqual,
        onChange(selectedValue) {
          const ctx = getContext();
          const focusedValue = ctx.get("focusedValue");
          prop("onSelectionChange")?.({
            selectedValue,
            focusedValue,
            get selectedNodes() {
              return prop("collection").findNodes(selectedValue);
            }
          });
        }
      })),
      focusedValue: bindable(() => ({
        defaultValue: prop("defaultFocusedValue") || null,
        value: prop("focusedValue"),
        onChange(focusedValue) {
          prop("onFocusChange")?.({
            focusedValue,
            get focusedNode() {
              return focusedValue ? prop("collection").findNode(focusedValue) : null;
            }
          });
        }
      })),
      loadingStatus: bindable(() => ({
        defaultValue: {}
      })),
      checkedValue: bindable(() => ({
        defaultValue: prop("defaultCheckedValue") || [],
        value: prop("checkedValue"),
        isEqual: utils.isEqual,
        onChange(value) {
          prop("onCheckedChange")?.({ checkedValue: value });
        }
      })),
      renamingValue: bindable(() => ({
        sync: true,
        defaultValue: null
      }))
    };
  },
  refs() {
    return {
      typeaheadState: { ...domQuery.getByTypeahead.defaultOptions },
      pendingAborts: /* @__PURE__ */ new Map()
    };
  },
  computed: {
    isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
    isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar.length > 0,
    visibleNodes: ({ prop, context }) => {
      const nodes = [];
      prop("collection").visit({
        skip: skipFn({ prop, context }),
        onEnter: (node, indexPath) => {
          nodes.push({ node, indexPath });
        }
      });
      return nodes;
    }
  },
  on: {
    "EXPANDED.SET": {
      actions: ["setExpanded"]
    },
    "EXPANDED.CLEAR": {
      actions: ["clearExpanded"]
    },
    "EXPANDED.ALL": {
      actions: ["expandAllBranches"]
    },
    "BRANCH.EXPAND": {
      actions: ["expandBranches"]
    },
    "BRANCH.COLLAPSE": {
      actions: ["collapseBranches"]
    },
    "SELECTED.SET": {
      actions: ["setSelected"]
    },
    "SELECTED.ALL": [
      {
        guard: and("isMultipleSelection", "moveFocus"),
        actions: ["selectAllNodes", "focusTreeLastNode"]
      },
      {
        guard: "isMultipleSelection",
        actions: ["selectAllNodes"]
      }
    ],
    "SELECTED.CLEAR": {
      actions: ["clearSelected"]
    },
    "NODE.SELECT": {
      actions: ["selectNode"]
    },
    "NODE.DESELECT": {
      actions: ["deselectNode"]
    },
    "CHECKED.TOGGLE": {
      actions: ["toggleChecked"]
    },
    "CHECKED.SET": {
      actions: ["setChecked"]
    },
    "CHECKED.CLEAR": {
      actions: ["clearChecked"]
    },
    "NODE.FOCUS": {
      actions: ["setFocusedNode"]
    },
    "NODE.ARROW_DOWN": [
      {
        guard: and("isShiftKey", "isMultipleSelection"),
        actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
      },
      {
        actions: ["focusTreeNextNode"]
      }
    ],
    "NODE.ARROW_UP": [
      {
        guard: and("isShiftKey", "isMultipleSelection"),
        actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
      },
      {
        actions: ["focusTreePrevNode"]
      }
    ],
    "NODE.ARROW_LEFT": {
      actions: ["focusBranchNode"]
    },
    "BRANCH_NODE.ARROW_LEFT": [
      {
        guard: "isBranchExpanded",
        actions: ["collapseBranch"]
      },
      {
        actions: ["focusBranchNode"]
      }
    ],
    "BRANCH_NODE.ARROW_RIGHT": [
      {
        guard: and("isBranchFocused", "isBranchExpanded"),
        actions: ["focusBranchFirstNode"]
      },
      {
        actions: ["expandBranch"]
      }
    ],
    "SIBLINGS.EXPAND": {
      actions: ["expandSiblingBranches"]
    },
    "NODE.HOME": [
      {
        guard: and("isShiftKey", "isMultipleSelection"),
        actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
      },
      {
        actions: ["focusTreeFirstNode"]
      }
    ],
    "NODE.END": [
      {
        guard: and("isShiftKey", "isMultipleSelection"),
        actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
      },
      {
        actions: ["focusTreeLastNode"]
      }
    ],
    "NODE.CLICK": [
      {
        guard: and("isCtrlKey", "isMultipleSelection"),
        actions: ["toggleNodeSelection"]
      },
      {
        guard: and("isShiftKey", "isMultipleSelection"),
        actions: ["extendSelectionToNode"]
      },
      {
        actions: ["selectNode"]
      }
    ],
    "BRANCH_NODE.CLICK": [
      {
        guard: and("isCtrlKey", "isMultipleSelection"),
        actions: ["toggleNodeSelection"]
      },
      {
        guard: and("isShiftKey", "isMultipleSelection"),
        actions: ["extendSelectionToNode"]
      },
      {
        guard: "expandOnClick",
        actions: ["selectNode", "toggleBranchNode"]
      },
      {
        actions: ["selectNode"]
      }
    ],
    "BRANCH_TOGGLE.CLICK": {
      actions: ["toggleBranchNode"]
    },
    "TREE.TYPEAHEAD": {
      actions: ["focusMatchedNode"]
    }
  },
  exit: ["clearPendingAborts"],
  states: {
    idle: {
      on: {
        "NODE.RENAME": {
          target: "renaming",
          actions: ["setRenamingValue"]
        }
      }
    },
    renaming: {
      entry: ["syncRenameInput", "focusRenameInput"],
      on: {
        "RENAME.SUBMIT": {
          guard: "isRenameLabelValid",
          target: "idle",
          actions: ["submitRenaming"]
        },
        "RENAME.CANCEL": {
          target: "idle",
          actions: ["cancelRenaming"]
        }
      }
    }
  },
  implementations: {
    guards: {
      isBranchFocused: ({ context, event }) => context.get("focusedValue") === event.id,
      isBranchExpanded: ({ context, event }) => context.get("expandedValue").includes(event.id),
      isShiftKey: ({ event }) => event.shiftKey,
      isCtrlKey: ({ event }) => event.ctrlKey,
      hasSelectedItems: ({ context }) => context.get("selectedValue").length > 0,
      isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
      moveFocus: ({ event }) => !!event.moveFocus,
      expandOnClick: ({ prop }) => !!prop("expandOnClick"),
      isRenameLabelValid: ({ event }) => event.label.trim() !== ""
    },
    actions: {
      selectNode({ context, event }) {
        const value = event.id || event.value;
        context.set("selectedValue", (prev) => {
          if (value == null) return prev;
          if (!event.isTrusted && utils.isArray(value)) return prev.concat(...value);
          return [utils.isArray(value) ? utils.last(value) : value].filter(Boolean);
        });
      },
      deselectNode({ context, event }) {
        const value = utils.toArray(event.id || event.value);
        context.set("selectedValue", (prev) => utils.remove(prev, ...value));
      },
      setFocusedNode({ context, event }) {
        context.set("focusedValue", event.id);
      },
      clearFocusedNode({ context }) {
        context.set("focusedValue", null);
      },
      clearSelectedItem({ context }) {
        context.set("selectedValue", []);
      },
      toggleBranchNode({ context, event, action }) {
        const isExpanded = context.get("expandedValue").includes(event.id);
        action(isExpanded ? ["collapseBranch"] : ["expandBranch"]);
      },
      expandBranch(params) {
        const { event } = params;
        expandBranches(params, [event.id]);
      },
      expandBranches(params) {
        const { context, event } = params;
        const valuesToExpand = utils.toArray(event.value);
        expandBranches(params, utils.diff(valuesToExpand, context.get("expandedValue")));
      },
      collapseBranch({ context, event }) {
        context.set("expandedValue", (prev) => utils.remove(prev, event.id));
      },
      collapseBranches(params) {
        const { context, event } = params;
        const value = utils.toArray(event.value);
        context.set("expandedValue", (prev) => utils.remove(prev, ...value));
      },
      setExpanded({ context, event }) {
        if (!utils.isArray(event.value)) return;
        context.set("expandedValue", event.value);
      },
      clearExpanded({ context }) {
        context.set("expandedValue", []);
      },
      setSelected({ context, event }) {
        if (!utils.isArray(event.value)) return;
        context.set("selectedValue", event.value);
      },
      clearSelected({ context }) {
        context.set("selectedValue", []);
      },
      focusTreeFirstNode(params) {
        const { prop, scope } = params;
        const collection2 = prop("collection");
        const firstNode = collection2.getFirstNode();
        const firstValue = collection2.getNodeValue(firstNode);
        const scrolled = scrollToNode(params, firstValue);
        if (scrolled) domQuery.raf(() => focusNode(scope, firstValue));
        else focusNode(scope, firstValue);
      },
      focusTreeLastNode(params) {
        const { prop, scope } = params;
        const collection2 = prop("collection");
        const lastNode = collection2.getLastNode(void 0, { skip: skipFn(params) });
        const lastValue = collection2.getNodeValue(lastNode);
        const scrolled = scrollToNode(params, lastValue);
        if (scrolled) domQuery.raf(() => focusNode(scope, lastValue));
        else focusNode(scope, lastValue);
      },
      focusBranchFirstNode(params) {
        const { event, prop, scope } = params;
        const collection2 = prop("collection");
        const branchNode = collection2.findNode(event.id);
        const firstNode = collection2.getFirstNode(branchNode);
        const firstValue = collection2.getNodeValue(firstNode);
        const scrolled = scrollToNode(params, firstValue);
        if (scrolled) domQuery.raf(() => focusNode(scope, firstValue));
        else focusNode(scope, firstValue);
      },
      focusTreeNextNode(params) {
        const { event, prop, scope } = params;
        const collection2 = prop("collection");
        const nextNode = collection2.getNextNode(event.id, { skip: skipFn(params) });
        if (!nextNode) return;
        const nextValue = collection2.getNodeValue(nextNode);
        const scrolled = scrollToNode(params, nextValue);
        if (scrolled) domQuery.raf(() => focusNode(scope, nextValue));
        else focusNode(scope, nextValue);
      },
      focusTreePrevNode(params) {
        const { event, prop, scope } = params;
        const collection2 = prop("collection");
        const prevNode = collection2.getPreviousNode(event.id, { skip: skipFn(params) });
        if (!prevNode) return;
        const prevValue = collection2.getNodeValue(prevNode);
        const scrolled = scrollToNode(params, prevValue);
        if (scrolled) domQuery.raf(() => focusNode(scope, prevValue));
        else focusNode(scope, prevValue);
      },
      focusBranchNode(params) {
        const { event, prop, scope } = params;
        const collection2 = prop("collection");
        const parentNode = collection2.getParentNode(event.id);
        const parentValue = parentNode ? collection2.getNodeValue(parentNode) : void 0;
        if (!parentValue) return;
        const scrolled = scrollToNode(params, parentValue);
        if (scrolled) domQuery.raf(() => focusNode(scope, parentValue));
        else focusNode(scope, parentValue);
      },
      selectAllNodes({ context, prop }) {
        context.set("selectedValue", prop("collection").getValues());
      },
      focusMatchedNode(params) {
        const { context, prop, refs, event, scope, computed } = params;
        const nodes = computed("visibleNodes");
        const elements = nodes.map(({ node: node2 }) => ({
          textContent: prop("collection").stringifyNode(node2),
          id: prop("collection").getNodeValue(node2)
        }));
        const node = domQuery.getByTypeahead(elements, {
          state: refs.get("typeaheadState"),
          activeId: context.get("focusedValue"),
          key: event.key
        });
        if (!node?.id) return;
        const scrolled = scrollToNode(params, node.id);
        if (scrolled) domQuery.raf(() => focusNode(scope, node.id));
        else focusNode(scope, node.id);
      },
      toggleNodeSelection({ context, event }) {
        const selectedValue = utils.addOrRemove(context.get("selectedValue"), event.id);
        context.set("selectedValue", selectedValue);
      },
      expandAllBranches(params) {
        const { context, prop } = params;
        const branchValues = prop("collection").getBranchValues();
        const valuesToExpand = utils.diff(branchValues, context.get("expandedValue"));
        expandBranches(params, valuesToExpand);
      },
      expandSiblingBranches(params) {
        const { context, event, prop } = params;
        const collection2 = prop("collection");
        const indexPath = collection2.getIndexPath(event.id);
        if (!indexPath) return;
        const nodes = collection2.getSiblingNodes(indexPath);
        const values = nodes.map((node) => collection2.getNodeValue(node));
        const valuesToExpand = utils.diff(values, context.get("expandedValue"));
        expandBranches(params, valuesToExpand);
      },
      extendSelectionToNode(params) {
        const { context, event, prop, computed } = params;
        const collection2 = prop("collection");
        const anchorValue = utils.first(context.get("selectedValue")) || collection2.getNodeValue(collection2.getFirstNode());
        const targetValue = event.id;
        let values = [anchorValue, targetValue];
        let hits = 0;
        const visibleNodes = computed("visibleNodes");
        visibleNodes.forEach(({ node }) => {
          const nodeValue = collection2.getNodeValue(node);
          if (hits === 1) values.push(nodeValue);
          if (nodeValue === anchorValue || nodeValue === targetValue) hits++;
        });
        context.set("selectedValue", utils.uniq(values));
      },
      extendSelectionToNextNode(params) {
        const { context, event, prop } = params;
        const collection2 = prop("collection");
        const nextNode = collection2.getNextNode(event.id, { skip: skipFn(params) });
        if (!nextNode) return;
        const values = new Set(context.get("selectedValue"));
        const nextValue = collection2.getNodeValue(nextNode);
        if (nextValue == null) return;
        if (values.has(event.id) && values.has(nextValue)) {
          values.delete(event.id);
        } else if (!values.has(nextValue)) {
          values.add(nextValue);
        }
        context.set("selectedValue", Array.from(values));
      },
      extendSelectionToPrevNode(params) {
        const { context, event, prop } = params;
        const collection2 = prop("collection");
        const prevNode = collection2.getPreviousNode(event.id, { skip: skipFn(params) });
        if (!prevNode) return;
        const values = new Set(context.get("selectedValue"));
        const prevValue = collection2.getNodeValue(prevNode);
        if (prevValue == null) return;
        if (values.has(event.id) && values.has(prevValue)) {
          values.delete(event.id);
        } else if (!values.has(prevValue)) {
          values.add(prevValue);
        }
        context.set("selectedValue", Array.from(values));
      },
      extendSelectionToFirstNode(params) {
        const { context, prop } = params;
        const collection2 = prop("collection");
        const currentSelection = utils.first(context.get("selectedValue"));
        const values = [];
        collection2.visit({
          skip: skipFn(params),
          onEnter: (node) => {
            const nodeValue = collection2.getNodeValue(node);
            values.push(nodeValue);
            if (nodeValue === currentSelection) {
              return "stop";
            }
          }
        });
        context.set("selectedValue", values);
      },
      extendSelectionToLastNode(params) {
        const { context, prop } = params;
        const collection2 = prop("collection");
        const currentSelection = utils.first(context.get("selectedValue"));
        const values = [];
        let current = false;
        collection2.visit({
          skip: skipFn(params),
          onEnter: (node) => {
            const nodeValue = collection2.getNodeValue(node);
            if (nodeValue === currentSelection) current = true;
            if (current) values.push(nodeValue);
          }
        });
        context.set("selectedValue", values);
      },
      clearPendingAborts({ refs }) {
        const aborts = refs.get("pendingAborts");
        aborts.forEach((abort) => abort.abort());
        aborts.clear();
      },
      toggleChecked({ context, event, prop }) {
        const collection2 = prop("collection");
        context.set(
          "checkedValue",
          (prev) => event.isBranch ? toggleBranchChecked(collection2, event.value, prev) : utils.addOrRemove(prev, event.value)
        );
      },
      setChecked({ context, event }) {
        context.set("checkedValue", event.value);
      },
      clearChecked({ context }) {
        context.set("checkedValue", []);
      },
      setRenamingValue({ context, event, prop }) {
        context.set("renamingValue", event.value);
        const onRenameStartFn = prop("onRenameStart");
        if (onRenameStartFn) {
          const collection2 = prop("collection");
          const indexPath = collection2.getIndexPath(event.value);
          if (indexPath) {
            const node = collection2.at(indexPath);
            if (node) {
              onRenameStartFn({
                value: event.value,
                node,
                indexPath
              });
            }
          }
        }
      },
      submitRenaming({ context, event, prop, scope }) {
        const renamingValue = context.get("renamingValue");
        if (!renamingValue) return;
        const collection2 = prop("collection");
        const indexPath = collection2.getIndexPath(renamingValue);
        if (!indexPath) return;
        const trimmedLabel = event.label.trim();
        const onBeforeRenameFn = prop("onBeforeRename");
        if (onBeforeRenameFn) {
          const details = {
            value: renamingValue,
            label: trimmedLabel,
            indexPath
          };
          const shouldRename = onBeforeRenameFn(details);
          if (!shouldRename) {
            context.set("renamingValue", null);
            focusNode(scope, renamingValue);
            return;
          }
        }
        prop("onRenameComplete")?.({
          value: renamingValue,
          label: trimmedLabel,
          indexPath
        });
        context.set("renamingValue", null);
        focusNode(scope, renamingValue);
      },
      cancelRenaming({ context, scope }) {
        const renamingValue = context.get("renamingValue");
        context.set("renamingValue", null);
        if (renamingValue) {
          focusNode(scope, renamingValue);
        }
      },
      syncRenameInput({ context, scope, prop }) {
        const renamingValue = context.get("renamingValue");
        if (!renamingValue) return;
        const collection2 = prop("collection");
        const node = collection2.findNode(renamingValue);
        if (!node) return;
        const label = collection2.stringifyNode(node);
        const inputEl = getRenameInputEl(scope, renamingValue);
        domQuery.setElementValue(inputEl, label);
      },
      focusRenameInput({ context, scope }) {
        const renamingValue = context.get("renamingValue");
        if (!renamingValue) return;
        const inputEl = getRenameInputEl(scope, renamingValue);
        if (!inputEl) return;
        inputEl.focus();
        inputEl.select();
      }
    }
  }
});
function scrollToNode(params, value) {
  const { prop, scope, computed } = params;
  const scrollToIndexFn = prop("scrollToIndexFn");
  if (!scrollToIndexFn) return false;
  const collection2 = prop("collection");
  const visibleNodes = computed("visibleNodes");
  for (let i = 0; i < visibleNodes.length; i++) {
    const { node, indexPath } = visibleNodes[i];
    if (collection2.getNodeValue(node) !== value) continue;
    scrollToIndexFn({
      index: i,
      node,
      indexPath,
      getElement: () => scope.getById(getNodeId(scope, value))
    });
    return true;
  }
  return false;
}
var props = types.createProps()([
  "ids",
  "collection",
  "dir",
  "expandedValue",
  "expandOnClick",
  "defaultFocusedValue",
  "focusedValue",
  "getRootNode",
  "id",
  "onExpandedChange",
  "onFocusChange",
  "onSelectionChange",
  "checkedValue",
  "selectedValue",
  "selectionMode",
  "typeahead",
  "defaultExpandedValue",
  "defaultSelectedValue",
  "defaultCheckedValue",
  "onCheckedChange",
  "onLoadChildrenComplete",
  "onLoadChildrenError",
  "loadChildren",
  "canRename",
  "onRenameStart",
  "onBeforeRename",
  "onRenameComplete",
  "scrollToIndexFn"
]);
var splitProps = utils.createSplitProps(props);
var itemProps = types.createProps()(["node", "indexPath"]);
var splitItemProps = utils.createSplitProps(itemProps);

exports.anatomy = anatomy;
exports.collection = collection;
exports.connect = connect;
exports.filePathCollection = filePathCollection;
exports.itemProps = itemProps;
exports.machine = machine;
exports.props = props;
exports.splitItemProps = splitItemProps;
exports.splitProps = splitProps;
