"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = vitePluginSvgr;
const pluginutils_1 = require("@rollup/pluginutils");
const fs_1 = __importDefault(require("fs"));
const vite_1 = require("vite");
const viteModule = __importStar(require("vite"));
// @ts-ignore - check if transformWithOxc is available, i.e. rolldown-vite is installed and aliased
let useOxc = viteModule.transformWithOxc != null;
// @ts-ignore - assign transformer function
let transformWith = useOxc ? viteModule.transformWithOxc : vite_1.transformWithEsbuild;
function vitePluginSvgr({ svgrOptions, esbuildOptions, include = "**/*.svg?react", exclude, } = {}) {
    const filter = (0, pluginutils_1.createFilter)(include, exclude);
    const postfixRE = /[?#].*$/s;
    return {
        name: "vite-plugin-svgr",
        enforce: "pre", // to override `vite:asset`'s behavior
        async load(id) {
            if (filter(id)) {
                const { transform } = await Promise.resolve().then(() => __importStar(require("@svgr/core")));
                const { default: jsx } = await Promise.resolve().then(() => __importStar(require("@svgr/plugin-jsx")));
                const filePath = id.replace(postfixRE, "");
                const svgCode = await fs_1.default.promises.readFile(filePath, "utf8");
                const componentCode = await transform(svgCode, svgrOptions, {
                    filePath,
                    caller: {
                        defaultPlugins: [jsx],
                    },
                });
                const res = await transformWith(componentCode, id, useOxc ? {
                    // @ts-ignore - "lang" is required for transformWithOxc
                    lang: "jsx",
                    ...esbuildOptions,
                } : {
                    loader: "jsx",
                    ...esbuildOptions,
                });
                return {
                    code: res.code,
                    map: null, // TODO:
                };
            }
        },
    };
}
