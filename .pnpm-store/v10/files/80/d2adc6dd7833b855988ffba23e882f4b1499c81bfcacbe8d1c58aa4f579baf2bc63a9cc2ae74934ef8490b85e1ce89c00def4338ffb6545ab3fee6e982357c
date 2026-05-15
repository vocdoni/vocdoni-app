import { useState as C, useEffect as g, useRef as p } from "react";
import { jsx as w } from "react/jsx-runtime";
const b = "https://app.cal.com/embed/embed.js";
function m(s = b) {
  (function(r, e, l) {
    let t = function(n, i) {
      n.q.push(i);
    }, o = r.document;
    r.Cal = r.Cal || function() {
      let n = r.Cal, i = arguments;
      if (n.loaded || (n.ns = {}, n.q = n.q || [], o.head.appendChild(o.createElement("script")).src = e, n.loaded = !0), i[0] === l) {
        const u = function() {
          t(u, arguments);
        }, c = i[1];
        u.q = u.q || [], typeof c == "string" ? (n.ns[c] = n.ns[c] || u, t(n.ns[c], i), t(n, ["initNamespace", c])) : t(n, i);
        return;
      }
      t(n, i);
    };
  })(
    window,
    //! Replace it with "https://cal.com/embed.js" or the URL where you have embed.js installed
    s,
    "init"
  );
  /*!  Copying ends here. */
  return window.Cal;
}
m.toString();
function q(s) {
  const [r, e] = C();
  return g(() => {
    e(() => m(s));
  }, []), r;
}
const h = function(r) {
  const {
    calLink: e,
    calOrigin: l,
    namespace: t = "",
    config: o,
    initConfig: n = {},
    embedJsUrl: i,
    ...u
  } = r;
  if (!e)
    throw new Error("calLink is required");
  const c = p(!1), a = q(i), f = p(null);
  return g(() => {
    if (!a || c.current || !f.current)
      return;
    c.current = !0;
    const d = f.current;
    t ? (a("init", t, {
      ...n,
      origin: l
    }), a.ns[t]("inline", {
      elementOrSelector: d,
      calLink: e,
      config: o
    })) : (a("init", {
      ...n,
      origin: l
    }), a("inline", {
      elementOrSelector: d,
      calLink: e,
      config: o
    }));
  }, [a, e, o, t, l, n]), a ? /* @__PURE__ */ w("div", {
    ref: f,
    ...u
  }) : null;
}, R = h;
function j(s) {
  const r = typeof s == "string" ? { embedJsUrl: s } : s ?? {}, { namespace: e = "", embedJsUrl: l } = r;
  return new Promise(function t(o) {
    const n = m(l);
    n("init", e);
    const i = e ? n.ns[e] : n;
    if (!i) {
      setTimeout(() => {
        t(o);
      }, 50);
      return;
    }
    o(i);
  });
}
export {
  R as default,
  j as getCalApi
};
