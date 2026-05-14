export { interceptViteLogs };
export { processStartupLog };
export { swallowViteLogForceOptimization_enable };
export { swallowViteLogForceOptimization_disable };
export { swallowViteLogConnected };
export { swallowViteLogConnected_clean };
import type { ResolvedConfig } from 'vite';
import '../assertEnvVite.js';
declare function interceptViteLogs(config: ResolvedConfig): void;
declare function processStartupLog(firstLine: string, config: ResolvedConfig, veryCompact?: boolean): {
    firstLine: string;
    isCompact: boolean;
};
declare function swallowViteLogForceOptimization_enable(): void;
declare function swallowViteLogForceOptimization_disable(): void;
declare function swallowViteLogConnected(): void;
declare function swallowViteLogConnected_clean(): void;
