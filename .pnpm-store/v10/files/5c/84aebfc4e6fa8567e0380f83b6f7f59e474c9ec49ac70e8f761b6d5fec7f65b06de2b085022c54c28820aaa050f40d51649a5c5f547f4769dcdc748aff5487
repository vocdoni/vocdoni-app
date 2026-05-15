export { getPublicProxy };
export type { DangerouslyUseInternals };
type ObjProxy<Obj> = Obj & {
    _isProxyObject: true;
    _originalObject: Obj;
};
declare function getPublicProxy<Obj extends Record<string | symbol, unknown>>(obj: Obj, objName: 'pageContext' | 'globalContext' | 'prerenderContext' | 'vikeConfig', skipOnInternalProp?: boolean, fallback?: (prop: string | symbol) => unknown): ObjProxy<Obj> & {
    /** https://vike.dev/warning/internals */
    dangerouslyUseInternals: DangerouslyUseInternals<Obj>;
};
/** https://vike.dev/warning/internals */
type DangerouslyUseInternals<Obj> = ObjProxy<Obj>;
