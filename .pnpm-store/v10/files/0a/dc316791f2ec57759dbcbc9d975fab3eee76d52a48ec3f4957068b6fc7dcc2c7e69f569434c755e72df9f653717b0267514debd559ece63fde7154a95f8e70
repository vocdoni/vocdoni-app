const l = "https://app.cal.com/embed/embed.js";
function r(o = l) {
  (function(i, p, d) {
    let t = function(e, n) {
      e.q.push(n);
    }, c = i.document;
    i.Cal = i.Cal || function() {
      let e = i.Cal, n = arguments;
      if (e.loaded || (e.ns = {}, e.q = e.q || [], c.head.appendChild(c.createElement("script")).src = p, e.loaded = !0), n[0] === d) {
        const s = function() {
          t(s, arguments);
        }, a = n[1];
        s.q = s.q || [], typeof a == "string" ? (e.ns[a] = e.ns[a] || s, t(e.ns[a], n), t(e, ["initNamespace", a])) : t(e, n);
        return;
      }
      t(e, n);
    };
  })(
    window,
    //! Replace it with "https://cal.com/embed.js" or the URL where you have embed.js installed
    o,
    "init"
  );
  /*!  Copying ends here. */
  return window.Cal;
}
const u = r.toString();
export {
  u as EmbedSnippetString,
  r as default
};
