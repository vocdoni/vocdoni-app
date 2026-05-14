type ModalTargetDatasetProps = {
    calLink: string;
    calNamespace: string;
    calOrigin: string;
    calConfig: string;
};
type CamelCase<T extends string> = T extends `${infer U}${infer V}` ? `${Uppercase<U>}${V}` : T;
type HyphenatedStringToCamelCase<S extends string> = S extends `${infer T}-${infer U}` ? `${T}${HyphenatedStringToCamelCase<CamelCase<U>>}` : CamelCase<S>;
type HyphenatedDataStringToCamelCase<S extends string> = S extends `data-${infer U}` ? HyphenatedStringToCamelCase<U> : S;
declare const dataAttributes: readonly ["data-button-text", "data-hide-button-icon", "data-button-position", "data-button-color", "data-button-text-color", "data-toggle-off"];
type DataAttributes = (typeof dataAttributes)[number];
type DataAttributesCamelCase = HyphenatedDataStringToCamelCase<DataAttributes>;
export type FloatingButtonDataset = {
    [key in DataAttributesCamelCase]: string;
};
export declare class FloatingButton extends HTMLElement {
    static updatedClassString(position: string, classString: string): string;
    dataset: DOMStringMap & FloatingButtonDataset & ModalTargetDatasetProps;
    buttonWrapperStyleDisplay: HTMLElement["style"]["display"];
    static get observedAttributes(): readonly ["data-button-text", "data-hide-button-icon", "data-button-position", "data-button-color", "data-button-text-color", "data-toggle-off"];
    attributeChangedCallback(name: DataAttributes, oldValue: string, newValue: string): void;
    assertHasShadowRoot(): asserts this is HTMLElement & {
        shadowRoot: ShadowRoot;
    };
    constructor();
}
export {};
//# sourceMappingURL=FloatingButton.d.ts.map