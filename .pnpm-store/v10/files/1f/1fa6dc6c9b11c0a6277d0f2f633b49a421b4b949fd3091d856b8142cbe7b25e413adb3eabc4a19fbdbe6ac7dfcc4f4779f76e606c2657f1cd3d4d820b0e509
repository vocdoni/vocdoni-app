/**
 * Determines whether a funnel message should be shown to the user.
 *
 * A funnel message will not be shown if:
 * - It has already been shown in the current session (in-memory cache)
 * - It was shown within the last 24 hours (persistent file cache)
 *
 * @param funnelMessage - The unique identifier for the funnel message
 * @returns Promise that resolves to true if the message should be shown, false otherwise
 */
export declare function shouldShowFunnel(funnelMessage: string): Promise<boolean>;
/**
 * Records that a funnel message has been shown to the user.
 *
 * Updates both the in-memory cache and the persistent file cache with the current timestamp.
 * This prevents the message from being shown again within the cooldown period.
 *
 * @param funnelMessage - The unique identifier for the funnel message that was shown
 * @returns Promise that resolves when the record has been updated
 */
export declare function recordFunnelShown(funnelMessage: string): Promise<void>;
/**
 * Resets the in-memory cache for a specific funnel message.
 *
 * This function is intended for testing purposes only. It clears the session cache
 * but does not affect the persistent file cache.
 *
 * @param funnelMessage - The unique identifier for the funnel message to reset
 */
export declare function reset(funnelMessage: string): void;
//# sourceMappingURL=funnel-msg-tracker.d.ts.map