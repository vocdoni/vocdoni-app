export { initOnLinkClick };
import { isLinkIgnored, isHrefCurrentUrl, isLinkSkipped } from './isLinkSkipped.js';
import { renderPageClient } from './renderPageClient.js';
import { scrollToHashOrTop } from './setScrollPosition.js';
import '../assertEnvClient.js';
function initOnLinkClick() {
    document.addEventListener('click', onLinkClick);
}
async function onLinkClick(ev) {
    if (!isNormalLeftClick(ev))
        return;
    const linkTag = findLinkTag(ev.target);
    if (!linkTag)
        return;
    const href = linkTag.getAttribute('href');
    if (href === null)
        return;
    if (isLinkIgnored(linkTag))
        return;
    // Workaround for Firefox bug: clicking on a hash link that doesn't change the current URL causes Firefox to erroneously set `window.history.state = null` without firing any signal that we can detect.
    // - https://github.com/vikejs/vike/issues/1962
    // - https://github.com/sveltejs/kit/issues/8725
    if (href.includes('#') && isHrefCurrentUrl(href)) {
        // Prevent Firefox from setting `window.history.state` to `null`
        ev.preventDefault();
        // Replicate the browser's native behavior
        scrollToHashOrTop(href.split('#')[1]);
        return;
    }
    if (isLinkSkipped(linkTag))
        return;
    ev.preventDefault();
    let scrollTarget;
    {
        const v = linkTag.getAttribute('keep-scroll-position');
        if (v !== null)
            scrollTarget = { preserveScroll: v === 'false' ? false : true };
    }
    await renderPageClient({
        scrollTarget,
        urlOriginal: href,
    });
}
function isNormalLeftClick(ev) {
    return ev.button === 0 && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey;
}
function findLinkTag(target) {
    while (target.tagName !== 'A') {
        const { parentNode } = target;
        if (!parentNode) {
            return null;
        }
        target = parentNode;
    }
    return target;
}
