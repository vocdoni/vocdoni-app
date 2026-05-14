export { onPageHide };
export { onPageShow };
function onPageHide(listener) {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            listener();
        }
    });
}
function onPageShow(listener) {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            listener();
        }
    });
}
