import ora from 'ora';

/**
 * Creates a spinner-like object that either:
 * - is fully silent (quiet mode),
 * - logs only start/succeed/fail events to a logger (no animation),
 * - or falls back to ora's default spinner.
 *
 * This avoids flooding structured loggers with spinner frames and ensures clean output in CI, Vite, etc.
 */
function createSpinnerLike(initialText, options = {}) {
    const { quiet, logger } = options;
    let text = initialText;
    // If interactive (no logger and not quiet), create a single real ora spinner
    let realSpinner = null;
    if (!quiet && !logger) {
        realSpinner = ora({ text }).start();
    }
    const self = {
        get text() { return text; },
        set text(v) {
            text = v;
            if (realSpinner)
                realSpinner.text = v;
        },
        start() { return self; },
        succeed(msg) {
            const message = msg ?? text;
            if (quiet)
                return;
            if (logger) {
                if (typeof logger.info === 'function')
                    logger.info(message);
                else if (typeof logger.log === 'function')
                    logger.log(message);
                else
                    process.stderr.write(message + '\n');
            }
            else {
                if (!realSpinner)
                    realSpinner = ora({ text }).start();
                realSpinner.succeed(message);
            }
        },
        fail(msg) {
            const message = msg ?? text;
            if (quiet)
                return;
            if (logger) {
                if (typeof logger.error === 'function')
                    logger.error(message);
                else if (typeof logger.log === 'function')
                    logger.log(message);
                else
                    process.stderr.write(message + '\n');
            }
            else {
                if (!realSpinner)
                    realSpinner = ora({ text }).start();
                realSpinner.fail(message);
            }
        },
        warn(msg) {
            const message = msg ?? text;
            if (quiet)
                return;
            if (logger) {
                if (typeof logger.warn === 'function')
                    logger.warn(message);
                else if (typeof logger.log === 'function')
                    logger.log(message);
                else
                    process.stderr.write(message + '\n');
            }
            else {
                if (!realSpinner)
                    realSpinner = ora({ text }).start();
                try {
                    realSpinner.warn?.(message);
                }
                catch {
                    realSpinner.stop();
                    process.stderr.write(message + '\n');
                }
            }
        },
        stop() { if (realSpinner)
            realSpinner.stop(); },
        progress(msg) {
            if (quiet)
                return;
            if (logger) {
                if (typeof logger.info === 'function')
                    logger.info(msg);
                else if (typeof logger.log === 'function')
                    logger.log(msg);
                else
                    process.stderr.write(msg + '\n');
            }
            else {
                if (!realSpinner)
                    realSpinner = ora({ text }).start();
                realSpinner.text = String(msg);
            }
        }
    };
    return self;
}

export { createSpinnerLike };
