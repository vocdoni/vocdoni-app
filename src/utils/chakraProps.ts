// DOM-typed props (react-markdown, react-dropzone) carry HTML attributes such as `color: string` or
// `border: number`, which strict tokens reject. Drops those keys from the type only; nothing changes at runtime.
export const chakraProps = <P extends object>(props: P) => props as Omit<P, 'color' | 'width' | 'height' | 'border'>
