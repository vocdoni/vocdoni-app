//#region src/index.ts
const re_unwrap = /[&?]unwrap\b/;
function wrapper(options) {
	const wrapperSymbol = `wrapper_${Math.random().toString(36).slice(2, 11)}`;
	const re_wrapper = new RegExp(`[&?]${wrapperSymbol}\\b`);
	let staticFilter = {};
	let filterFn;
	if (typeof options.resolveId.filter === "function") filterFn = options.resolveId.filter;
	else {
		staticFilter = options.resolveId.filter;
		filterFn = () => true;
		if (Array.isArray(staticFilter.id)) staticFilter.id.push(re_unwrap);
		else if (staticFilter.id instanceof RegExp) staticFilter.id = [staticFilter.id, re_unwrap];
		else {
			staticFilter.id ??= {};
			if (!staticFilter.id.include) staticFilter.id.include ??= [];
			else if (!Array.isArray(staticFilter.id.include)) staticFilter.id.include = [staticFilter.id.include];
			staticFilter.id.include.push(re_unwrap);
		}
	}
	return {
		name: `vite-plugin-wrapper:${wrapperSymbol}`,
		enforce: "pre",
		resolveId: {
			filter: staticFilter,
			async handler(id, importer) {
				if (id.match(re_unwrap)) return id.replace(re_unwrap, "");
				if (!await filterFn(id, importer)) return;
				const resolved = await this.resolve(id, importer, { skipSelf: true });
				if (resolved) return `${resolved.id}${getSeparator(resolved.id)}${wrapperSymbol}`;
			}
		},
		load: {
			filter: { id: re_wrapper },
			handler(id, opts) {
				const wrappedModule = id.replace(re_wrapper, "");
				return options.load.call(this, `${wrappedModule}${getSeparator(wrappedModule)}unwrap`, opts);
			}
		}
	};
}
function getSeparator(id) {
	return id.includes("?") ? "&" : "?";
}

//#endregion
export { wrapper };