export { preview };
export type { CliPreviewConfig };
import { type ResolvedConfig, type PreviewServer } from 'vite';
import type { ApiOptions } from './types.js';
import './assertEnvApiDev.js';
/**
 * Programmatically trigger `$ vike preview`
 *
 * https://vike.dev/api#preview
 */
declare function preview(options?: ApiOptions): Promise<{
    viteServer?: PreviewServer;
    viteConfig: ResolvedConfig;
}>;
type CliPreviewValue = boolean | 'vite' | undefined;
type CliPreviewConfig = CliPreviewValue | (() => CliPreviewValue | Promise<CliPreviewValue>);
