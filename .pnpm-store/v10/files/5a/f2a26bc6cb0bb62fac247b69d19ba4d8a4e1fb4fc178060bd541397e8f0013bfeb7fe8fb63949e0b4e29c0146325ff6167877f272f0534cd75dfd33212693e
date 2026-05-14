'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const react = require('react');
const useEvent = require('../../utils/use-event.cjs');
const listCollection = require('./list-collection.cjs');

function useListCollection(props) {
  const { initialItems = [], filter, limit, ...collectionOptions } = props;
  const [items, setItemsImpl] = react.useState(initialItems);
  const [filterText, setFilterText] = react.useState("");
  const setItems = useEvent.useEvent((items2) => {
    setItemsImpl(items2);
    setFilterText("");
  });
  const collectionOptionsRef = react.useRef(collectionOptions);
  collectionOptionsRef.current = collectionOptions;
  const create = react.useCallback((items2) => {
    return listCollection.createListCollection({ ...collectionOptionsRef.current, items: items2 });
  }, []);
  const collection = react.useMemo(() => {
    let activeItems = items;
    if (filterText && filter) {
      activeItems = create(items).filter((itemString, _index, item) => filter(itemString, filterText, item)).items;
    }
    const limitedItems = limit == null ? activeItems : activeItems.slice(0, limit);
    return listCollection.createListCollection({ ...collectionOptionsRef.current, items: limitedItems });
  }, [items, filterText, filter, limit, create]);
  return {
    collection,
    filter: useEvent.useEvent((inputValue) => {
      setFilterText(inputValue || "");
    }),
    set: useEvent.useEvent((newItems) => {
      setItems(newItems);
    }),
    reset: useEvent.useEvent(() => {
      setItems(initialItems);
    }),
    clear: useEvent.useEvent(() => {
      setItems([]);
    }),
    insert: useEvent.useEvent((index, ...itemsToInsert) => {
      const newItems = create(items).insert(index, ...itemsToInsert).items;
      setItems(newItems);
    }),
    insertBefore: useEvent.useEvent((value, ...itemsToInsert) => {
      const newItems = create(items).insertBefore(value, ...itemsToInsert).items;
      setItems(newItems);
    }),
    insertAfter: useEvent.useEvent((value, ...itemsToInsert) => {
      const newItems = create(items).insertAfter(value, ...itemsToInsert).items;
      setItems(newItems);
    }),
    remove: useEvent.useEvent((...itemOrValues) => {
      const newItems = create(items).remove(...itemOrValues).items;
      setItems(newItems);
    }),
    move: useEvent.useEvent((value, to) => {
      const newItems = create(items).move(value, to).items;
      setItems(newItems);
    }),
    moveBefore: useEvent.useEvent((value, ...values) => {
      const newItems = create(items).moveBefore(value, ...values).items;
      setItems(newItems);
    }),
    moveAfter: useEvent.useEvent((value, ...values) => {
      const newItems = create(items).moveAfter(value, ...values).items;
      setItems(newItems);
    }),
    reorder: useEvent.useEvent((from, to) => {
      const newItems = create(items).reorder(from, to).items;
      setItems(newItems);
    }),
    append: useEvent.useEvent((...itemsToAppend) => {
      const newItems = create(items).append(...itemsToAppend).items;
      setItems(newItems);
    }),
    upsert: useEvent.useEvent((value, item, mode = "append") => {
      const newItems = create(items).upsert(value, item, mode).items;
      setItems(newItems);
    }),
    prepend: useEvent.useEvent((...itemsToPrepend) => {
      const newItems = create(items).prepend(...itemsToPrepend).items;
      setItems(newItems);
    }),
    update: useEvent.useEvent((value, item) => {
      const newItems = create(items).update(value, item).items;
      setItems(newItems);
    })
  };
}

exports.useListCollection = useListCollection;
