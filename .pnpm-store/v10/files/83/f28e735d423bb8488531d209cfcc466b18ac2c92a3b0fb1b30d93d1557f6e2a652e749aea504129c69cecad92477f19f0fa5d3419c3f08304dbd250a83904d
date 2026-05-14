export { runPrerenderFromAPI };
export { runPrerenderFromCLIPrerenderCommand };
export { runPrerenderFromAutoRun };
export { runPrerender_forceExit };
import type { InlineConfig, ResolvedConfig } from 'vite';
import { PrerenderOptions } from './runPrerender.js';
declare function runPrerenderFromAPI(options?: PrerenderOptions): Promise<{
    viteConfig: null | ResolvedConfig;
}>;
declare function runPrerenderFromCLIPrerenderCommand(): Promise<void>;
declare function runPrerenderFromAutoRun(viteConfig: InlineConfig | undefined): Promise<{
    forceExit: boolean;
}>;
declare function runPrerender_forceExit(): void;
