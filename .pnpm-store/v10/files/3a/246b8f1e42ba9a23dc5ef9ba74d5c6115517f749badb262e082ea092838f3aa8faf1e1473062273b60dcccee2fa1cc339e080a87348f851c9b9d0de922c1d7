//#region src/index.ts
const catchAllEntry = "virtual:ud:catch-all";
const storeSymbol = Symbol.for("ud:store");
const transformerSymbol = Symbol.for("ud:transformer");
globalThis[storeSymbol] ??= { entries: [] };
function getStore() {
	return globalThis[storeSymbol];
}
function getTransformer() {
	return getStore()[transformerSymbol];
}
/**
* Add a Fetchable server entry to the store
*/
function addEntry(entry) {
	const serializedEntry = serializeEntry(entry);
	const store = getStore();
	if (store.entries.some((e) => serializeEntry(e) === serializedEntry)) return;
	store.entries.push(entry);
}
/**
* Retrieve all server entries
*/
function getAllEntries() {
	const transformer = getTransformer();
	const entries = [...getStore().entries];
	return Object.freeze(transformer ? entries.map(transformer) : entries);
}
/**
* @experimental
*/
function setEntryTransformer(transformer) {
	getStore()[transformerSymbol] = transformer;
}
function serializeEntry(entry) {
	return JSON.stringify({
		...entry,
		route: Array.isArray(entry.route) ? entry.route : [entry.route],
		method: Array.isArray(entry.method) ? entry.method : entry.method ? [entry.method] : void 0
	});
}
//#endregion
export { addEntry, catchAllEntry, getAllEntries, setEntryTransformer };
