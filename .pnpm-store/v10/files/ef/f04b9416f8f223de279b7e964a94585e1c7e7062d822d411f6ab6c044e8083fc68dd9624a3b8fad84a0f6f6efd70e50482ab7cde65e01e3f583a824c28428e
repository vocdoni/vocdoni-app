export { isVikeCli };
export { setContextCliCommand };
export { getCliOptions };
import { assert } from '../../utils/assert.js';
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import './assertEnvCli.js';
const globalObject = getGlobalObject('cli/context.ts', {});
function getCliOptions() {
    return globalObject.cliCommand?.cliOptions ?? null;
}
function isVikeCli() {
    return !!globalObject.cliCommand;
}
function setContextCliCommand(command, cliOptions) {
    assert(!globalObject.cliCommand);
    globalObject.cliCommand = { command, cliOptions };
}
