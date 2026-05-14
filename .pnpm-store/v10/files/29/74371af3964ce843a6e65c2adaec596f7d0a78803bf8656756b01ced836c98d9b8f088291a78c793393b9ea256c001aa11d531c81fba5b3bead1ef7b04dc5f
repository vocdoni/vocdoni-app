import type { CSSProperties } from "react";
type Theme = "dark" | "light";
export type EmbedThemeConfig = Theme | "auto";
export type BookerLayouts = "month_view" | "week_view" | "column_view";
export type AllPossibleLayouts = BookerLayouts | "mobile";
export interface EmbedStyles {
    body?: Pick<CSSProperties, "background">;
    eventTypeListItem?: Pick<CSSProperties, "background" | "color" | "backgroundColor">;
    enabledDateButton?: Pick<CSSProperties, "background" | "color" | "backgroundColor">;
    disabledDateButton?: Pick<CSSProperties, "background" | "color" | "backgroundColor">;
    availabilityDatePicker?: Pick<CSSProperties, "background" | "color" | "backgroundColor">;
}
export interface EmbedNonStylesConfig {
    /** Default would be center */
    align?: "left";
    branding?: {
        brandColor?: string;
    };
}
export type UiConfig = {
    hideEventTypeDetails?: boolean;
    theme?: EmbedThemeConfig | null;
    styles?: EmbedStyles & EmbedNonStylesConfig;
    cssVarsPerTheme?: Record<Theme, Record<string, string>>;
    layout?: BookerLayouts;
    colorScheme?: string | null;
};
declare global {
    interface Window {
        CalComPageStatus: string;
        isEmbed?: () => boolean;
        getEmbedNamespace: () => string | null;
        getEmbedTheme: () => EmbedThemeConfig | null;
    }
}
export type EmbedPageType = "team.event.booking.slots" | "user.event.booking.slots" | "team.event.booking.form" | "user.event.booking.form";
export type KnownConfig = {
    "flag.coep"?: "true" | "false";
    layout?: BookerLayouts;
    "ui.color-scheme"?: string;
    theme?: EmbedThemeConfig;
    "cal.embed.pageType"?: EmbedPageType;
};
export {};
//# sourceMappingURL=types.d.ts.map