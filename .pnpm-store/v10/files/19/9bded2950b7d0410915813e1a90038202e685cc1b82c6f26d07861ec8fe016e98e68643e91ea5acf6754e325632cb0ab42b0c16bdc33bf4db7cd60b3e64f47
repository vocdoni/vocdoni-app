import { fix } from './IssueFixer.js';
import { run } from './run.js';
export const main = async (options) => {
    const { results } = await run(options);
    if (options.isFix)
        await fix(results.issues, options);
    return results;
};
