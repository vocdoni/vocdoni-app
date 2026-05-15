export { getEarlyHints };
import { isFontFallback } from './isFontFallback.js';
import { inferEarlyHintLink } from './html/injectAssets/inferHtmlTags.js';
import '../../assertEnvServer.js';
function getEarlyHints(assets) {
    const earlyHints = [];
    {
        assets.forEach((asset) => {
            // Don't early hint fallback fonts, https://github.com/vikejs/vike/issues/624
            if (isFontFallback(asset, earlyHints))
                return;
            earlyHints.push({
                ...asset,
                earlyHintLink: inferEarlyHintLink(asset),
            });
        });
    }
    return earlyHints;
}
