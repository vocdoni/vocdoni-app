/**
 * Runs in <head>, before the body is parsed and before any analytics or React code: moves a
 * certificate return fragment (#code=..&state=.. or #error=..) into this tab's sessionStorage,
 * strips it from the address bar and history, and flags <html> so "Checking your certificate..."
 * shows from first paint. Keep in sync with readReturnStash (storage.ts).
 */
export const CERT_RETURN_SCRIPT = `(function(){try{var h=window.location.hash;if(!/^#(code|error)=/.test(h))return;var p=new URLSearchParams(h.slice(1));var t=/^[A-Za-z0-9._~-]{1,256}$/;var c=p.get('code'),s=p.get('state'),e=p.get('error');var v=c&&s&&t.test(c)&&t.test(s)?{code:c,state:s}:e&&/^[a-z_]{1,64}$/.test(e)?{error:e}:null;window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);if(!v)return;v.at=Date.now();var j=JSON.stringify(v);try{window.sessionStorage.setItem('vocdoni.cert.return',j)}catch(x){window.__vocdoniCertReturn=j}document.documentElement.setAttribute('data-cert-return','')}catch(x){}})()`

/** Shows the slot matching the flag before React hydrates; after hydration React renders one slot. */
export const CERT_RETURN_CSS =
  "html[data-cert-return] [data-cert-slot='idle']{display:none!important}" +
  "html:not([data-cert-return]) [data-cert-slot='returning']{display:none!important}"

export const CERT_RETURN_ATTRIBUTE = 'data-cert-return'
