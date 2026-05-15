export { parseCli };
export type { Command };
export type { CliOptions };
import './assertEnvCli.js';
type CliOptions = Record<string, unknown>;
type Command = 'dev' | 'build' | 'preview' | 'prerender';
declare function parseCli(): {
    command: Command;
    cliOptions: CliOptions;
};
