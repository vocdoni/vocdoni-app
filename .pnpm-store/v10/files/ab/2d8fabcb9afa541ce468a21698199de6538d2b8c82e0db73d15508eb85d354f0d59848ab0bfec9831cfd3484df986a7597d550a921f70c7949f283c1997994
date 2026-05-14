import { Plugin } from "vite";

//#region src/index.d.ts
type StringFilter<Value = string | RegExp> = Value | Array<Value> | {
  include?: Value | Array<Value>;
  exclude?: Value | Array<Value>;
};
type LoadCallback = Extract<Plugin["load"], Function>;
interface WrapperOptions {
  resolveId: {
    filter: {
      id?: StringFilter<RegExp>;
    } | ((id: string, importer?: string | undefined) => boolean | Promise<boolean>);
  };
  load: LoadCallback;
}
declare function wrapper(options: WrapperOptions): Plugin;
//#endregion
export { WrapperOptions, wrapper };