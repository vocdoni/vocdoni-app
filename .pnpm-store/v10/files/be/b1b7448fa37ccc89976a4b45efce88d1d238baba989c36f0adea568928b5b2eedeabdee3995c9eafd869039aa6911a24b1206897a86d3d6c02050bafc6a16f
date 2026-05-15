import type { HlsInterface } from './hls';
import type { Level } from 'hls.js';
import type { MaxAutoResolutionValue } from './types';
declare const CapLevelController: typeof import("hls.js").CapLevelController;
/**
 * A custom HLS.js CapLevelController that behaves like the default one, except
 * it enforces a "minimum maximum" to avoid forced capping to lower quality at small sizes
 */
declare class MinCapLevelController extends CapLevelController {
    static minMaxResolution: number;
    private static maxAutoResolution;
    constructor(hls: HlsInterface);
    static setMaxAutoResolution(hls: HlsInterface, maxAutoResolution: MaxAutoResolutionValue | undefined): void;
    private getMaxAutoResolution;
    get levels(): Level[];
    getValidLevels(capLevelIndex: number): Level[];
    /**
     * Get the maximum level capped to maxAutoResolution
     *
     * Selection logic (in order of priority):
     * 1. If there's an exact match for maxAutoResolution, use it
     * 2. If no exact match exists, always select the highest quality that doesn't exceed the cap
     *    (to prevent extra costs by going over the resolution limit)
     */
    private getMaxLevelCapped;
    getMaxLevel(capLevelIndex: number): number;
}
export default MinCapLevelController;
