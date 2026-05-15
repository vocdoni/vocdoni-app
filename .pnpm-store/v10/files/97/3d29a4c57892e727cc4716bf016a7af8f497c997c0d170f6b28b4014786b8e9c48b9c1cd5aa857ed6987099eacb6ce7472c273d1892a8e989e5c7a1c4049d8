declare type MatcherResult = string | null | symbol;
declare type Matcher = string | ((dir: string) => MatcherResult | Promise<MatcherResult>);
declare type MatcherSync = string | ((dir: string) => MatcherResult);

declare const lookItUp: (matcher: Matcher, dir?: string) => Promise<string | null>;

declare const lookItUpSync: (matcher: MatcherSync, dir?: string) => string | null | never;

declare const exists: (path: string) => Promise<boolean>;
declare const stop: unique symbol;

export { exists, lookItUp, lookItUpSync, stop };
