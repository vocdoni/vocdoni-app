export { pluginCommon };
import type { Plugin } from 'vite';
import '../../assertEnvVite.js';
declare const pluginCommon: {
    applyToEnvironment(env: {
        name: string;
        getTopLevelConfig(): import("vite").ResolvedConfig;
        config: import("vite").ResolvedConfig & {
            define?: Record<string, any>;
            resolve: Required<import("vite").ResolveOptions>;
            consumer: "client" | "server";
            keepProcessEnv?: boolean;
            optimizeDeps: import("vite").DepOptimizationOptions;
            dev: import("vite").ResolvedDevEnvironmentOptions;
            build: import("vite").ResolvedBuildEnvironmentOptions;
            plugins: readonly Plugin[];
        };
        logger: import("vite").Logger;
    }): boolean;
    sharedDuringBuild: true;
};
