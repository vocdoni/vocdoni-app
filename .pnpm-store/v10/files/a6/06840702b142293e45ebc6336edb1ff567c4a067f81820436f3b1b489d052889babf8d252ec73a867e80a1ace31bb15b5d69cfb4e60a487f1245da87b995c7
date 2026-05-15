import parseArgs from 'minimist';
import { compact } from '../util/array.js';
import { toBinary, toDeferResolve, toEntry } from '../util/input.js';
import { isValidBinary } from './bash-parser.js';
const spawningBinaries = ['cross-env', 'retry-cli'];
const endOfCommandBinaries = ['dotenvx', 'env-cmd', 'op'];
const positionals = new Set(['babel-node', 'esbuild', 'execa', 'jiti', 'oxnode', 'vite-node', 'zx']);
const positionalBinaries = new Set(['concurrently']);
export const resolve = (binary, args, { fromArgs }) => {
    const parsed = parseArgs(args, { boolean: ['quiet', 'verbose'], '--': endOfCommandBinaries.includes(binary) });
    const bin = binary.startsWith('.') ? toEntry(binary) : isValidBinary(binary) ? toBinary(binary) : undefined;
    const shiftedArgs = spawningBinaries.includes(binary) ? fromArgs(args) : [];
    const pos = positionals.has(binary) ? [toDeferResolve(parsed._[0])] : [];
    const newCommand = parsed['--'] && parsed['--'].length > 0 ? fromArgs(parsed['--']) : [];
    const commands = positionalBinaries.has(binary) ? parsed._.flatMap(cmd => fromArgs([cmd])) : [];
    return compact([bin, ...shiftedArgs, ...pos, ...newCommand, ...commands]);
};
