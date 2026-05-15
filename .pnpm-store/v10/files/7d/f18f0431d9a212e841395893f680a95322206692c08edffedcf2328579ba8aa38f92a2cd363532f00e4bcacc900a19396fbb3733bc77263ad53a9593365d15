export interface SpinnerLike {
    text: string;
    start(): SpinnerLike;
    succeed(msg?: string): void;
    fail(msg?: string): void;
    warn(msg?: string): void;
    stop(): void;
    progress?(msg: string): void;
}
/**
 * Creates a spinner-like object that either:
 * - is fully silent (quiet mode),
 * - logs only start/succeed/fail events to a logger (no animation),
 * - or falls back to ora's default spinner.
 *
 * This avoids flooding structured loggers with spinner frames and ensures clean output in CI, Vite, etc.
 */
export declare function createSpinnerLike(initialText: string, options?: {
    quiet?: boolean;
    logger?: any;
}): SpinnerLike;
//# sourceMappingURL=wrap-ora.d.ts.map