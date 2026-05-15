'use client';
import { useState, useRef, useCallback, useMemo } from 'react';
import { useEvent } from '../../utils/use-event.js';
import { createListCollection } from './list-collection.js';

function useListCollection(props) {
  const { initialItems = [], filter, limit, ...collectionOptions } = props;
  const [items, setItemsImpl] = useState(initialItems);
  const [filterText, setFilterText] = useState("");
  const setItems = useEvent((items2) => {
    setItemsImpl(items2);
    setFilterText("");
  });
  const collectionOptionsRef = useRef(collectionOptions);
  collectionOptionsRef.current = collectionOptions;
  const create = useCallback((items2) => {
    return createListCollection({ ...collectionOptionsRef.current, items: items2 });
  }, []);
  const collection = useMemo(() => {
    let activeItems = items;
    if (filterText && filter) {
      activeItems = create(items).filter((itemString, _index, item) => filter(itemString, filterText, item)).items;
    }
    const limitedItems = limit == null ? activeItems : activeItems.slice(0, limit);
    return createListCollection({ ...collectionOptionsRef.current, items: limitedItems });
  }, [items, filterText, filter, limit, create]);
  return {
    collection,
    filter: useEvent((inputValue) => {
      setFilterText(inputValue || "");
    }),
    set: useEvent((newItems) => {
      setItems(newItems);
    }),
    reset: useEvent(() => {
      setItems(initialItems);
    }),
    clear: useEvent(() => {
      setItems([]);
    }),
    insert: useEvent((index, ...itemsToInsert) => {
      const newItems = create(items).insert(index, ...itemsToInsert).items;
      setItems(newItems);
    }),
    insertBefore: useEvent((value, ...itemsToInsert) => {
      const newItems = create(items).insertBefore(value, ...itemsToInsert).items;
      setItems(newItems);
    }),
    insertAfter: useEvent((value, ...itemsToInsert) => {
      const newItems = create(items).insertAfter(value, ...itemsToInsert).items;
      setItems(newItems);
    }),
    remove: useEvent((...itemOrValues) => {
      const newItems = create(items).remove(...itemOrValues).items;
      setItems(newItems);
    }),
    move: useEvent((value, to) => {
      const newItems = create(items).move(value, to).items;
      setItems(newItems);
    }),
    moveBefore: useEvent((value, ...values) => {
      const newItems = create(items).moveBefore(value, ...values).items;
      setItems(newItems);
    }),
    moveAfter: useEvent((value, ...values) => {
      const newItems = create(items).moveAfter(value, ...values).items;
      setItems(newItems);
    }),
    reorder: useEvent((from, to) => {
      const newItems = create(items).reorder(from, to).items;
      setItems(newItems);
    }),
    append: useEvent((...itemsToAppend) => {
      const newItems = create(items).append(...itemsToAppend).items;
      setItems(newItems);
    }),
    upsert: useEvent((value, item, mode = "append") => {
      const newItems = create(items).upsert(value, item, mode).items;
      setItems(newItems);
    }),
    prepend: useEvent((...itemsToPrepend) => {
      const newItems = create(items).prepend(...itemsToPrepend).items;
      setItems(newItems);
    }),
    update: useEvent((value, item) => {
      const newItems = create(items).update(value, item).items;
      setItems(newItems);
    })
  };
}

export { useListCollection };
