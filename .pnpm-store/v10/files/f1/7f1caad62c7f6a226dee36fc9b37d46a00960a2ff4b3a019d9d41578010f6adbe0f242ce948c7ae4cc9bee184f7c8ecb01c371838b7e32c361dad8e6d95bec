"use client";import a,{useEffect as h,useState as M}from"react";import c,{Suspense as y}from"react";var m=({condition:r,fallback:t,children:n,...e})=>r?c.createElement(y,{fallback:t,...e},n):c.createElement(c.Fragment,null,t),i=m;import{useState as f,useEffect as x}from"react";var b=()=>{let[r,t]=f(!1);return x(()=>{typeof window!="undefined"&&t(!0)},[]),r},u=b;import{useState as P,useEffect as I}from"react";var g=(r,t)=>{let[n,e]=P(!1);return I(()=>{if(typeof IntersectionObserver=="function"){let o=new IntersectionObserver(([s])=>{e(s.isIntersecting)},t);return r.current&&o.observe(r.current),()=>{o.disconnect()}}},[r,t]),n},p=g;var k=a.lazy(()=>import("./-KWFP7TC7.mjs")),v=r=>{let{style:t,className:n,onIntersection:e,placeholder:o}=r,s=a.useRef(null),l=p(s);return h(()=>{l&&e&&e()},[l,e]),a.createElement(a.Fragment,null,a.createElement("mux-player",{ref:s,"data-mux-player-react-lazy-placeholder":!0,placeholder:o!=null?o:"",style:{"--mux-player-react-lazy-placeholder":o?`url('${o}');`:"",...t},className:n||"",nohotkeys:!0,"aria-hidden":!0,tabIndex:-1},a.createElement("div",{"data-mux-player-react-lazy-placeholder-overlay":!0})),a.createElement("style",null,`
        mux-player[data-mux-player-react-lazy-placeholder] {
          aspect-ratio: 16/9;
          display: block;
          background-color: var(--media-background-color, #000);
          width: 100%;
          position: relative;
          background-image: var(--mux-player-react-lazy-placeholder);
          background-repeat: no-repeat;
          background-size: var(--media-object-fit, contain);
          background-position: var(--media-object-position, 50% 50%);
          --controls: none;
          --controls-backdrop-color: rgba(0, 0, 0, 0.6);
        }
        mux-player [data-mux-player-react-lazy-placeholder-overlay] {
          position: absolute;
          inset: 0;
          background-color: var(--controls-backdrop-color);
        }
      `))},d={PAGE:"page",VIEWPORT:"viewport"},E=a.forwardRef((r,t)=>{let{loading:n=d.VIEWPORT,...e}=r,o=u(),[s,l]=M(()=>n!==d.VIEWPORT);return a.createElement(i,{condition:o&&s,fallback:a.createElement(v,{style:e.style,className:e.className,placeholder:e.placeholder,onIntersection:()=>l(!0)})},a.createElement(k,{...e,ref:t}))}),B=E;export{B as default};
//# sourceMappingURL=lazy.mjs.map
