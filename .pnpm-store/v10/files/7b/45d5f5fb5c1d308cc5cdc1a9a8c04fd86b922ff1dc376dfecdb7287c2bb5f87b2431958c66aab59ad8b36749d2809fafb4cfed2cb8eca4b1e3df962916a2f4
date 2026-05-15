export { pushHistoryState };
export { replaceHistoryStateOriginal };
export { onPopStateBegin };
export { saveScrollPosition };
export { initHistory };
import { getCurrentUrl } from '../shared/getCurrentUrl.js';
import { assert, assertUsage } from '../../utils/assert.js';
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { isObject } from '../../utils/isObject.js';
import { redirectHard } from '../../utils/redirectHard.js';
import '../assertEnvClient.js';
const globalObject = getGlobalObject('history.ts', {
    monkeyPatched: false,
    previous: undefined,
});
initHistory(); // we redundantly call initHistory() to ensure it's called early
globalObject.previous = getHistoryInfo();
// `window.history.state === null` when:
// - The very first render
// - Click on `<a href="#some-hash" />`
// - `location.hash = 'some-hash'`
function enhance() {
    if (isEnhanced(window.history.state))
        return;
    const stateEnhanced = {
        vike: {
            timestamp: getTimestamp(),
            scrollPosition: getScrollPosition(),
            triggeredBy: 'browser',
        },
    };
    replaceHistoryState(stateEnhanced);
}
function getState() {
    const state = window.history.state;
    // *Every* state added to the history needs to go through Vike.
    // - Otherwise Vike's `popstate` listener won't work. (Because, for example, if globalObject.previous is outdated => isHashNavigation faulty => client-side navigation is wrongfully skipped.)
    // - Therefore, we have to monkey patch history.pushState() and history.replaceState()
    // - Therefore, we need the assert() below to ensure history.state has been enhanced by Vike
    //   - If users stumble upon this assert() then let's make it a assertUsage()
    assertIsEnhanced(state);
    return state;
}
function getScrollPosition() {
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    return scrollPosition;
}
function getTimestamp() {
    return new Date().getTime();
}
function saveScrollPosition(scrollPosition) {
    scrollPosition || (scrollPosition = getScrollPosition());
    // Don't overwrite history.state if it was set by a non-Vike history.pushState() call.
    // https://github.com/vikejs/vike/issues/2801#issuecomment-3490431479
    if (!isEnhanced(window.history.state))
        return;
    const state = getState();
    replaceHistoryState({ ...state, vike: { ...state.vike, scrollPosition } });
}
function pushHistoryState(url, overwriteLastHistoryEntry) {
    if (!overwriteLastHistoryEntry) {
        const state = {
            vike: {
                timestamp: getTimestamp(),
                // I don't remember why I set it to `null`, maybe because setting it now would be too early? (Maybe there is a delay between renderPageClient() is finished and the browser updating the scroll position.) Anyways, it seems like autoSaveScrollPosition() is enough.
                scrollPosition: null,
                triggeredBy: 'vike',
            },
        };
        // Calling the monkey patched history.pushState() (and not the original) so that other tools (e.g. user tracking) can listen to Vike's pushState() calls.
        // - https://github.com/vikejs/vike/issues/1582
        window.history.pushState(state, '', url);
    }
    else {
        replaceHistoryState(getState(), url);
    }
}
function replaceHistoryState(state, url) {
    const url_ = url ?? null; // Passing `undefined` chokes older Edge versions.
    window.history.replaceState(state, '', url_);
    assertIsEnhanced(window.history.state);
}
function replaceHistoryStateOriginal(state, url) {
    // Bypass all monkey patches.
    // - Useful, for example, to avoid other tools listening to history.replaceState() calls
    History.prototype.replaceState.bind(window.history)(state, '', url);
}
// Monkey patch:
// - history.pushState()
// - history.replaceState()
function monkeyPatchHistoryAPI() {
    if (globalObject.monkeyPatched)
        return;
    globalObject.monkeyPatched = true;
    ['pushState', 'replaceState'].forEach((funcName) => {
        const funcOriginal = window.history[funcName].bind(window.history);
        window.history[funcName] = (stateFromUser = {}, ...rest) => {
            assertUsage(stateFromUser === undefined || stateFromUser === null || isObject(stateFromUser), `history.${funcName}(state) argument state must be an object`);
            const state = isEnhanced(stateFromUser)
                ? stateFromUser
                : {
                    ...stateFromUser,
                    vike: {
                        scrollPosition: getScrollPosition(),
                        timestamp: getTimestamp(),
                        triggeredBy: 'user',
                    },
                };
            funcOriginal(state, ...rest);
            assertIsEnhanced(window.history.state);
            globalObject.previous = getHistoryInfo();
            // Workaround https://github.com/vikejs/vike/issues/2504#issuecomment-3149764736
            queueMicrotask(() => {
                if (isEnhanced(window.history.state))
                    return;
                Object.assign(state, window.history.state);
                replaceHistoryStateOriginal(state);
            });
        };
    });
}
function isEnhanced(state) {
    if (state?.vike) {
        /* We don't use the assert() below to save client-side KBs.
        const vikeData = state.vike
        assert(isObject(vikeData))
        assert(hasProp(vikeData, 'timestamp', 'number'))
        assert(hasProp(vikeData, 'scrollPosition'))
        if (vikeData.scrollPosition !== null) {
          assert(hasProp(vikeData, 'scrollPosition', 'object'))
          assert(hasProp(vikeData.scrollPosition, 'x', 'number') && hasProp(vikeData.scrollPosition, 'y', 'number'))
        }
        //*/
        return true;
    }
    return false;
}
function assertIsEnhanced(state) {
    if (isEnhanced(state))
        return;
    assert(false, { state });
}
function getHistoryInfo() {
    return {
        url: getCurrentUrl(),
        state: getState(),
    };
}
function onPopStateBegin() {
    const { previous } = globalObject;
    const isStateEnhanced = isEnhanced(window.history.state);
    // Either:
    // - `window.history.pushState(null, '', '/some-path')` , or
    // - hash navigation
    //   - Click on `<a href="#some-hash">`
    //   - Using the `location` API (only hash navigation)
    // See comments a the top of the ./initOnPopState.ts file.
    const isStatePristine = window.history.state === null;
    if (!isStateEnhanced && !isStatePristine) {
        // Going to a history entry not created by Vike — entering another "SPA realm" => hard reload
        // https://github.com/vikejs/vike/issues/2801#issuecomment-3490431479
        redirectHard(getCurrentUrl());
        return { skip: true };
    }
    if (!isStateEnhanced)
        enhance();
    const current = getHistoryInfo();
    globalObject.previous = current;
    // Let the browser handle hash navigations.
    // - Upon hash navigation: `isHistoryStatePristine===true` (see comment above).
    if (isStatePristine) {
        return { skip: true };
    }
    return { previous, current };
}
function initHistory() {
    monkeyPatchHistoryAPI(); // the earlier we call it the better (Vike can workaround erroneous library monkey patches if Vike is the last one in the monkey patch chain)
    enhance(); // enhance very first window.history.state which is `null`
}
