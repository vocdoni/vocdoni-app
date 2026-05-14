export { createDebugger };
export { isDebugEnabled };
export type { Debug };
type Debug = ReturnType<typeof createDebugger>;
type Options = {
    serialization?: {
        emptyArray?: string;
    };
};
type Namespace = 'react-streaming:createPipeWrapper' | 'react-streaming:chunks' | 'react-streaming:flow';
declare function createDebugger(namespace: Namespace, optionsGlobal?: Options): ((msg: string, info?: unknown) => void) & {
    options: (options: Options) => (msg: string, info?: unknown) => void;
    isEnabled: boolean;
};
declare function isDebugEnabled(namespace: string): boolean;
