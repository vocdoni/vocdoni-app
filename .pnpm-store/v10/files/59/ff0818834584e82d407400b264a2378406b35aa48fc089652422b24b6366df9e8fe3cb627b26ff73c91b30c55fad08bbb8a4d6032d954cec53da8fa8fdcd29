import parseArgs from 'minimist';
export const resolve = (_binary, args, options) => {
    const { fromArgs, manifestScriptNames } = options;
    const parsed = parseArgs(args, { '--': true });
    const [command, script] = parsed._;
    const _childArgs = parsed['--'] && parsed['--'].length > 0 ? fromArgs(parsed['--']) : [];
    if (command === 'exec')
        return _childArgs;
    if (command === 'run' && manifestScriptNames.has(script))
        return _childArgs;
    return [];
};
