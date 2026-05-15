//#region src/types.d.ts
type RouteParam = {
  optional: boolean;
} & ({
  value: string;
  catchAll?: never;
} | {
  value?: never;
  catchAll: {
    name?: string;
    greedy: boolean;
  };
});
interface RouteIR {
  pathname: RouteParam[];
}
//#endregion
export { RouteIR };