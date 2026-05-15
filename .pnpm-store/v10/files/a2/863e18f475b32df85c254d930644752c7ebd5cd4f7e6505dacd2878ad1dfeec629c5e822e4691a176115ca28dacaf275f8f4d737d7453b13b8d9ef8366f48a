import { catchAllEntry } from "@universal-deploy/store";
//#region src/plugin.ts
const moduleId = "ud:netlify";
function netlify() {
	return [{
		name: `${moduleId}:apply-store`,
		apply: "build",
		enforce: "post",
		applyToEnvironment(env) {
			return env.name === "ssr";
		},
		configEnvironment: {
			order: "post",
			handler(name, env) {
				if (env.consumer !== "server" && name !== "ssr") return;
				return { build: { [this.meta?.rolldownVersion ? "rolldownOptions" : "rollupOptions"]: { input: { index: catchAllEntry } } } };
			}
		},
		generateBundle(_opts, bundle) {
			Object.values(bundle).forEach((v) => {
				if (v.type !== "chunk") return;
				if (v.isEntry && v.facadeModuleId !== catchAllEntry) v.isEntry = false;
			});
		}
	}];
}
//#endregion
export { netlify as default, netlify };
