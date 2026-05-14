'use client';
import { Selection } from '@zag-js/collection';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useEvent } from '../../utils/use-event.js';

function useListSelection(props) {
  const {
    collection,
    selectionMode = "single",
    deselectable = true,
    initialSelectedValues = [],
    resetOnCollectionChange = false
  } = props;
  const createSelection = useCallback(
    (values = []) => {
      const selection2 = new Selection(values);
      selection2.selectionMode = selectionMode;
      selection2.deselectable = deselectable;
      return selection2;
    },
    [selectionMode, deselectable]
  );
  const [selection, setSelectionState] = useState(() => createSelection(initialSelectedValues));
  useEffect(() => {
    if (resetOnCollectionChange) {
      setSelectionState(createSelection());
    }
  }, [collection.toString(), resetOnCollectionChange, createSelection]);
  const selectedValues = useMemo(() => Array.from(selection), [selection]);
  const isEmpty = useMemo(() => selection.isEmpty(), [selection]);
  const firstSelectedValue = useMemo(() => selection.firstSelectedValue(collection), [selection, collection]);
  const lastSelectedValue = useMemo(() => selection.lastSelectedValue(collection), [selection, collection]);
  return {
    selectedValues,
    isEmpty,
    firstSelectedValue,
    lastSelectedValue,
    isSelected: useEvent((value) => {
      return selection.isSelected(value);
    }),
    isAllSelected: useEvent(() => {
      const allValues = collection.getValues();
      return allValues.length > 0 && allValues.every((value) => selection.isSelected(value));
    }),
    isSomeSelected: useEvent(() => {
      const allValues = collection.getValues();
      return allValues.some((value) => selection.isSelected(value));
    }),
    canSelect: useEvent((value) => {
      return selection.canSelect(collection, value);
    }),
    select: useEvent((value, forceToggle) => {
      setSelectionState(selection.select(collection, value, forceToggle));
    }),
    deselect: useEvent((value) => {
      setSelectionState(selection.deselect(value));
    }),
    toggle: useEvent((value) => {
      setSelectionState(selection.toggleSelection(collection, value));
    }),
    replace: useEvent((value) => {
      setSelectionState(selection.replaceSelection(collection, value));
    }),
    extend: useEvent((anchorValue, targetValue) => {
      setSelectionState(selection.extendSelection(collection, anchorValue, targetValue));
    }),
    setSelectedValues: useEvent((values) => {
      setSelectionState(selection.setSelection(values));
    }),
    clear: useEvent(() => {
      setSelectionState(selection.clearSelection());
    }),
    resetSelection: useEvent(() => {
      setSelectionState(createSelection());
    })
  };
}

export { useListSelection };
