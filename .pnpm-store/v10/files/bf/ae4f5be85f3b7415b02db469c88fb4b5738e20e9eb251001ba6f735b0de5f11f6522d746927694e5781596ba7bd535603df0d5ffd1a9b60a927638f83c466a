type Namespace = string;
export type EventDataMap = {
    eventTypeSelected: {
        eventType: any;
    };
    linkFailed: {
        code: string;
        msg: string;
        data: {
            url: string;
        };
    };
    linkReady: Record<string, never>;
    bookingSuccessfulV2: {
        uid: string | undefined;
        title: string | undefined;
        startTime: string | undefined;
        endTime: string | undefined;
        eventTypeId: number | null | undefined;
        status: string | undefined;
        paymentRequired: boolean;
        isRecurring: boolean;
        /**
         * This is only used for recurring bookings
         */
        allBookings?: {
            startTime: string;
            endTime: string;
        }[];
        videoCallUrl?: string;
    };
    /**
     * @deprecated Use `bookingSuccessfulV2` instead. We restrict the data heavily there, only sending what is absolutely needed and keeping it light as well. Plus, more importantly that can be documented well.
     */
    bookingSuccessful: {
        booking: unknown;
        eventType: unknown;
        date: string;
        duration: number | undefined;
        organizer: {
            name: string;
            email: string;
            timeZone: string;
        };
        confirmed: boolean;
    };
    rescheduleBookingSuccessfulV2: {
        uid: string | undefined;
        title: string | undefined;
        startTime: string | undefined;
        endTime: string | undefined;
        eventTypeId: number | null | undefined;
        status: string | undefined;
        paymentRequired: boolean;
        isRecurring: boolean;
        /**
         * This is only used for recurring bookings
         */
        allBookings?: {
            startTime: string;
            endTime: string;
        }[];
    };
    /**
     * @deprecated Use `rescheduleBookingSuccessfulV2` instead. We restrict the data heavily there, only sending what is absolutely needed and keeping it light as well. Plus, more importantly that can be documented well.
     */
    rescheduleBookingSuccessful: {
        booking: unknown;
        eventType: unknown;
        date: string;
        duration: number | undefined;
        organizer: {
            name: string;
            email: string;
            timeZone: string;
        };
        confirmed: boolean;
    };
    bookingCancelled: {
        booking: unknown;
        organizer: {
            name: string;
            email: string;
            timeZone?: string | undefined;
        };
        eventType: unknown;
    };
    routed: {
        actionType: "customPageMessage" | "externalRedirectUrl" | "eventTypeRedirectUrl";
        actionValue: string;
    };
    navigatedToBooker: Record<string, never>;
    "*": Record<string, unknown>;
    __routeChanged: Record<string, never>;
    __windowLoadComplete: Record<string, never>;
    __closeIframe: Record<string, never>;
    __iframeReady: Record<string, never>;
    __dimensionChanged: {
        iframeHeight: number;
        iframeWidth: number;
        isFirstTime: boolean;
    };
};
export type EventData<T extends keyof EventDataMap> = {
    [K in T]: {
        type: string;
        namespace: string;
        fullType: string;
        data: EventDataMap[K];
    };
}[T];
export type EmbedEvent<T extends keyof EventDataMap> = CustomEvent<EventData<T>>;
export declare class SdkActionManager {
    namespace: Namespace;
    static parseAction(fullType: string): {
        ns: string;
        type: string;
    } | null;
    getFullActionName(name: string): string;
    fire<T extends keyof EventDataMap>(name: T, data: EventDataMap[T]): void;
    on<T extends keyof EventDataMap>(name: T, callback: (arg0: CustomEvent<EventData<T>>) => void): void;
    off<T extends keyof EventDataMap>(name: T, callback: (arg0: CustomEvent<EventData<T>>) => void): void;
    constructor(ns: string | null);
}
export {};
//# sourceMappingURL=sdk-action-manager.d.ts.map