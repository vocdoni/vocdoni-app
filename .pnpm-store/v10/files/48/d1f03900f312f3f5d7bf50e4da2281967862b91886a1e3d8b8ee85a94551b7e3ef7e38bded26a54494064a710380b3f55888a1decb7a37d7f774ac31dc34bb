import { MediaChromeButton } from './media-chrome-button.js';
/**
 * @attr {boolean} medialoop - (read-only) Indicates whether looping is currently enabled.
 */
declare function getSlotTemplateHTML(_attrs: Record<string, string>): string;
declare function getTooltipContentHTML(): string;
declare class MediaLoopButton extends MediaChromeButton {
    static getSlotTemplateHTML: typeof getSlotTemplateHTML;
    static getTooltipContentHTML: typeof getTooltipContentHTML;
    static get observedAttributes(): string[];
    container: HTMLElement | null;
    connectedCallback(): void;
    attributeChangedCallback(attrName: string, oldValue: string | null, newValue: string | null): void;
    get mediaLoop(): boolean;
    set mediaLoop(value: boolean);
    handleClick(): void;
}
export default MediaLoopButton;
