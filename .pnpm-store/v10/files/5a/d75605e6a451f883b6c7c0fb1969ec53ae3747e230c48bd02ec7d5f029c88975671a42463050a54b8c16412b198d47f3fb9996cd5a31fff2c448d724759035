'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const collection = require('@zag-js/collection');
const react = require('react');
const useEvent = require('../../utils/use-event.cjs');

function useListSelection(props) {
  const {
    collection: collection$1,
    selectionMode = "single",
    deselectable = true,
    initialSelectedValues = [],
    resetOnCollectionChange = false
  } = props;
  const createSelection = react.useCallback(
    (values = []) => {
      const selection2 = new collection.Selection(values);
      selection2.selectionMode = selectionMode;
      selection2.deselectable = deselectable;
      return selection2;
    },
    [selectionMode, deselectable]
  );
  const [selection, setSelectionState] = react.useState(() => createSelection(initialSelectedValues));
  react.useEffect(() => {
    if (resetOnCollectionChange) {
      setSelectionState(createSelection());
    }
  }, [collection$1.toString(), resetOnCollectionChange, createSelection]);
  const selectedValues = react.useMemo(() => Array.from(selection), [selection]);
  const isEmpty = react.useMemo(() => selection.isEmpty(), [selection]);
  const firstSelectedValue = react.useMemo(() => selection.firstSelectedValue(collection$1), [selection, collection$1]);
  const lastSelectedValue = react.useMemo(() => selection.lastSelectedValue(collection$1), [selection, collection$1]);
  return {
    selectedValues,
    isEmpty,
    firstSelectedValue,
    lastSelectedValue,
    isSelected: useEvent.useEvent((value) => {
      return selection.isSelected(value);
    }),
    isAllSelected: useEvent.useEvent(() => {
      const allValues = collection$1.getValues();
      return allValues.length > 0 && allValues.every((value) => selection.isSelected(value));
    }),
    isSomeSelected: useEvent.useEvent(() => {
      const allValues = collection$1.getValues();
      return allValues.some((value) => selection.isSelected(value));
    }),
    canSelect: useEvent.useEvent((value) => {
      return selection.canSelect(collection$1, value);
    }),
    select: useEvent.useEvent((value, forceToggle) => {
      setSelectionState(selection.select(collection$1, value, forceToggle));
    }),
    deselect: useEvent.useEvent((value) => {
      setSelectionState(selection.deselect(value));
    }),
    toggle: useEvent.useEvent((value) => {
      setSelectionState(selection.toggleSelection(collection$1, value));
    }),
    replace: useEvent.useEvent((value) => {
      setSelectionState(selection.replaceSelection(collection$1, value));
    }),
    extend: useEvent.useEvent((anchorValue, targetValue) => {
      setSelectionState(selection.extendSelection(collection$1, anchorValue, targetValue));
    }),
    setSelectedValues: useEvent.useEvent((values) => {
      setSelectionState(selection.setSelection(values));
    }),
    clear: useEvent.useEvent(() => {
      setSelectionState(selection.clearSelection());
    }),
    resetSelection: useEvent.useEvent(() => {
      setSelectionState(createSelection());
    })
  };
}

exports.useListSelection = useListSelection;
