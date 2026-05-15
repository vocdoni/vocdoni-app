"use strict";var Ls=Object.defineProperty;var bh=Object.getOwnPropertyDescriptor;var gh=Object.getOwnPropertyNames;var _h=Object.prototype.hasOwnProperty;var su=t=>{throw TypeError(t)};var Ah=(t,e)=>{for(var i in e)Ls(t,i,{get:e[i],enumerable:!0})},Th=(t,e,i,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of gh(e))!_h.call(t,r)&&r!==i&&Ls(t,r,{get:()=>e[r],enumerable:!(a=bh(e,r))||a.enumerable});return t};var yh=t=>Th(Ls({},"__esModule",{value:!0}),t);var ws=(t,e,i)=>e.has(t)||su("Cannot "+i);var B=(t,e,i)=>(ws(t,e,"read from private field"),i?i.call(t):e.get(t)),pe=(t,e,i)=>e.has(t)?su("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,i),ye=(t,e,i,a)=>(ws(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),X=(t,e,i)=>(ws(t,e,"access private method"),i);var kE={};Ah(kE,{MediaError:()=>g.MediaError,default:()=>yE,generatePlayerInitTime:()=>D.generatePlayerInitTime,getVideoAttribute:()=>Vt,playerSoftwareName:()=>Vd,playerSoftwareVersion:()=>Fd});module.exports=yh(kE);var Mi=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment=="undefined"){class t extends Mi{}globalThis.DocumentFragment=t}var Fa=class extends Mi{},Rs=class extends Mi{},kh={get(t){},define(t,e,i){},getName(t){return null},upgrade(t){},whenDefined(t){return Promise.resolve(Fa)}},Va,xs=class{constructor(e,i={}){pe(this,Va);ye(this,Va,i==null?void 0:i.detail)}get detail(){return B(this,Va)}initCustomEvent(){}};Va=new WeakMap;function Sh(t,e){return new Fa}var lu={document:{createElement:Sh},DocumentFragment,customElements:kh,CustomEvent:xs,EventTarget:Mi,HTMLElement:Fa,HTMLVideoElement:Rs},du=typeof window=="undefined"||typeof globalThis.customElements=="undefined",ke=du?lu:globalThis,Gt=du?lu.document:globalThis.document;var m={MEDIA_PLAY_REQUEST:"mediaplayrequest",MEDIA_PAUSE_REQUEST:"mediapauserequest",MEDIA_MUTE_REQUEST:"mediamuterequest",MEDIA_UNMUTE_REQUEST:"mediaunmuterequest",MEDIA_LOOP_REQUEST:"medialooprequest",MEDIA_VOLUME_REQUEST:"mediavolumerequest",MEDIA_SEEK_REQUEST:"mediaseekrequest",MEDIA_AIRPLAY_REQUEST:"mediaairplayrequest",MEDIA_ENTER_FULLSCREEN_REQUEST:"mediaenterfullscreenrequest",MEDIA_EXIT_FULLSCREEN_REQUEST:"mediaexitfullscreenrequest",MEDIA_PREVIEW_REQUEST:"mediapreviewrequest",MEDIA_ENTER_PIP_REQUEST:"mediaenterpiprequest",MEDIA_EXIT_PIP_REQUEST:"mediaexitpiprequest",MEDIA_ENTER_CAST_REQUEST:"mediaentercastrequest",MEDIA_EXIT_CAST_REQUEST:"mediaexitcastrequest",MEDIA_SHOW_TEXT_TRACKS_REQUEST:"mediashowtexttracksrequest",MEDIA_HIDE_TEXT_TRACKS_REQUEST:"mediahidetexttracksrequest",MEDIA_SHOW_SUBTITLES_REQUEST:"mediashowsubtitlesrequest",MEDIA_DISABLE_SUBTITLES_REQUEST:"mediadisablesubtitlesrequest",MEDIA_TOGGLE_SUBTITLES_REQUEST:"mediatogglesubtitlesrequest",MEDIA_PLAYBACK_RATE_REQUEST:"mediaplaybackraterequest",MEDIA_RENDITION_REQUEST:"mediarenditionrequest",MEDIA_AUDIO_TRACK_REQUEST:"mediaaudiotrackrequest",MEDIA_SEEK_TO_LIVE_REQUEST:"mediaseektoliverequest",REGISTER_MEDIA_STATE_RECEIVER:"registermediastatereceiver",UNREGISTER_MEDIA_STATE_RECEIVER:"unregistermediastatereceiver"},x={MEDIA_CHROME_ATTRIBUTES:"mediachromeattributes",MEDIA_CONTROLLER:"mediacontroller"},Ds={MEDIA_AIRPLAY_UNAVAILABLE:"mediaAirplayUnavailable",MEDIA_AUDIO_TRACK_ENABLED:"mediaAudioTrackEnabled",MEDIA_AUDIO_TRACK_LIST:"mediaAudioTrackList",MEDIA_AUDIO_TRACK_UNAVAILABLE:"mediaAudioTrackUnavailable",MEDIA_BUFFERED:"mediaBuffered",MEDIA_CAST_UNAVAILABLE:"mediaCastUnavailable",MEDIA_CHAPTERS_CUES:"mediaChaptersCues",MEDIA_CURRENT_TIME:"mediaCurrentTime",MEDIA_DURATION:"mediaDuration",MEDIA_ENDED:"mediaEnded",MEDIA_ERROR:"mediaError",MEDIA_ERROR_CODE:"mediaErrorCode",MEDIA_ERROR_MESSAGE:"mediaErrorMessage",MEDIA_FULLSCREEN_UNAVAILABLE:"mediaFullscreenUnavailable",MEDIA_HAS_PLAYED:"mediaHasPlayed",MEDIA_HEIGHT:"mediaHeight",MEDIA_IS_AIRPLAYING:"mediaIsAirplaying",MEDIA_IS_CASTING:"mediaIsCasting",MEDIA_IS_FULLSCREEN:"mediaIsFullscreen",MEDIA_IS_PIP:"mediaIsPip",MEDIA_LOADING:"mediaLoading",MEDIA_MUTED:"mediaMuted",MEDIA_LOOP:"mediaLoop",MEDIA_PAUSED:"mediaPaused",MEDIA_PIP_UNAVAILABLE:"mediaPipUnavailable",MEDIA_PLAYBACK_RATE:"mediaPlaybackRate",MEDIA_PREVIEW_CHAPTER:"mediaPreviewChapter",MEDIA_PREVIEW_COORDS:"mediaPreviewCoords",MEDIA_PREVIEW_IMAGE:"mediaPreviewImage",MEDIA_PREVIEW_TIME:"mediaPreviewTime",MEDIA_RENDITION_LIST:"mediaRenditionList",MEDIA_RENDITION_SELECTED:"mediaRenditionSelected",MEDIA_RENDITION_UNAVAILABLE:"mediaRenditionUnavailable",MEDIA_SEEKABLE:"mediaSeekable",MEDIA_STREAM_TYPE:"mediaStreamType",MEDIA_SUBTITLES_LIST:"mediaSubtitlesList",MEDIA_SUBTITLES_SHOWING:"mediaSubtitlesShowing",MEDIA_TARGET_LIVE_WINDOW:"mediaTargetLiveWindow",MEDIA_TIME_IS_LIVE:"mediaTimeIsLive",MEDIA_VOLUME:"mediaVolume",MEDIA_VOLUME_LEVEL:"mediaVolumeLevel",MEDIA_VOLUME_UNAVAILABLE:"mediaVolumeUnavailable",MEDIA_LANG:"mediaLang",MEDIA_WIDTH:"mediaWidth"},uu=Object.entries(Ds),n=uu.reduce((t,[e,i])=>(t[e]=i.toLowerCase(),t),{}),Ih={USER_INACTIVE_CHANGE:"userinactivechange",BREAKPOINTS_CHANGE:"breakpointchange",BREAKPOINTS_COMPUTED:"breakpointscomputed"},Le=uu.reduce((t,[e,i])=>(t[e]=i.toLowerCase(),t),{...Ih}),LE=Object.entries(Le).reduce((t,[e,i])=>{let a=n[e];return a&&(t[i]=a),t},{userinactivechange:"userinactive"}),cu=Object.entries(n).reduce((t,[e,i])=>{let a=Le[e];return a&&(t[i]=a),t},{userinactive:"userinactivechange"}),fe={SUBTITLES:"subtitles",CAPTIONS:"captions",DESCRIPTIONS:"descriptions",CHAPTERS:"chapters",METADATA:"metadata"},St={DISABLED:"disabled",HIDDEN:"hidden",SHOWING:"showing"};var uo={MOUSE:"mouse",PEN:"pen",TOUCH:"touch"},ve={UNAVAILABLE:"unavailable",UNSUPPORTED:"unsupported"},Pe={LIVE:"live",ON_DEMAND:"on-demand",UNKNOWN:"unknown"};var mu={INLINE:"inline",FULLSCREEN:"fullscreen",PICTURE_IN_PICTURE:"picture-in-picture"};function hu(t){return t==null?void 0:t.map(Ch).join(" ")}function pu(t){return t==null?void 0:t.split(/\s+/).map(Lh)}function Ch(t){if(t){let{id:e,width:i,height:a}=t;return[e,i,a].filter(r=>r!=null).join(":")}}function Lh(t){if(t){let[e,i,a]=t.split(":");return{id:e,width:+i,height:+a}}}function fu(t){return t==null?void 0:t.map(wh).join(" ")}function vu(t){return t==null?void 0:t.split(/\s+/).map(Rh)}function wh(t){if(t){let{id:e,kind:i,language:a,label:r}=t;return[e,i,a,r].filter(o=>o!=null).join(":")}}function Rh(t){if(t){let[e,i,a,r]=t.split(":");return{id:e,kind:i,language:a,label:r}}}function Eu(t){return t.replace(/[-_]([a-z])/g,(e,i)=>i.toUpperCase())}function Ci(t){return typeof t=="number"&&!Number.isNaN(t)&&Number.isFinite(t)}function co(t){return typeof t!="string"?!1:!isNaN(t)&&!isNaN(parseFloat(t))}var mo=t=>new Promise(e=>setTimeout(e,t));var bu=[{singular:"hour",plural:"hours"},{singular:"minute",plural:"minutes"},{singular:"second",plural:"seconds"}],xh=(t,e)=>{let i=t===1?bu[e].singular:bu[e].plural;return`${t} ${i}`},Yt=t=>{if(!Ci(t))return"";let e=Math.abs(t),i=e!==t,a=new Date(0,0,0,0,0,e,0);return`${[a.getHours(),a.getMinutes(),a.getSeconds()].map((d,u)=>d&&xh(d,u)).filter(d=>d).join(", ")}${i?" remaining":""}`};function Ue(t,e){let i=!1;t<0&&(i=!0,t=0-t),t=t<0?0:t;let a=Math.floor(t%60),r=Math.floor(t/60%60),o=Math.floor(t/3600),s=Math.floor(e/60%60),d=Math.floor(e/3600);return(isNaN(t)||t===1/0)&&(o=r=a="0"),o=o>0||d>0?o+":":"",r=((o||s>=10)&&r<10?"0"+r:r)+":",a=a<10?"0"+a:a,(i?"-":"")+o+r+a}var xE=Object.freeze({length:0,start(t){let e=t>>>0;if(e>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${e}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(t){let e=t>>>0;if(e>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${e}) is greater than or equal to the maximum bound (${this.length}).`);return 0}});var gu={"Start airplay":"Start airplay","Stop airplay":"Stop airplay",Audio:"Audio",Captions:"Captions","Enable captions":"Enable captions","Disable captions":"Disable captions","Start casting":"Start casting","Stop casting":"Stop casting","Enter fullscreen mode":"Enter fullscreen mode","Exit fullscreen mode":"Exit fullscreen mode",Mute:"Mute",Unmute:"Unmute",Loop:"Loop","Enter picture in picture mode":"Enter picture in picture mode","Exit picture in picture mode":"Exit picture in picture mode",Play:"Play",Pause:"Pause","Playback rate":"Playback rate","Playback rate {playbackRate}":"Playback rate {playbackRate}",Quality:"Quality","Seek backward":"Seek backward","Seek forward":"Seek forward",Settings:"Settings",Auto:"Auto","audio player":"audio player","video player":"video player",volume:"volume",seek:"seek","closed captions":"closed captions","current playback rate":"current playback rate","playback time":"playback time","media loading":"media loading",settings:"settings","audio tracks":"audio tracks",quality:"quality",play:"play",pause:"pause",mute:"mute",unmute:"unmute","chapter: {chapterName}":"chapter: {chapterName}",live:"live",Off:"Off","start airplay":"start airplay","stop airplay":"stop airplay","start casting":"start casting","stop casting":"stop casting","enter fullscreen mode":"enter fullscreen mode","exit fullscreen mode":"exit fullscreen mode","enter picture in picture mode":"enter picture in picture mode","exit picture in picture mode":"exit picture in picture mode","seek to live":"seek to live","playing live":"playing live","seek back {seekOffset} seconds":"seek back {seekOffset} seconds","seek forward {seekOffset} seconds":"seek forward {seekOffset} seconds","Network Error":"Network Error","Decode Error":"Decode Error","Source Not Supported":"Source Not Supported","Encryption Error":"Encryption Error","A network error caused the media download to fail.":"A network error caused the media download to fail.","A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.":"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.","An unsupported error occurred. The server or network failed, or your browser does not support this format.":"An unsupported error occurred. The server or network failed, or your browser does not support this format.","The media is encrypted and there are no keys to decrypt it.":"The media is encrypted and there are no keys to decrypt it."};var _u,Os={en:gu},Ns=((_u=globalThis.navigator)==null?void 0:_u.language)||"en",Au=t=>{Ns=t};var Oh=t=>{var e,i,a;let[r]=Ns.split("-");return((e=Os[Ns])==null?void 0:e[t])||((i=Os[r])==null?void 0:i[t])||((a=Os.en)==null?void 0:a[t])||t},h=(t,e={})=>Oh(t).replace(/\{(\w+)\}/g,(i,a)=>a in e?String(e[a]):`{${a}}`);var ho=class{addEventListener(){}removeEventListener(){}dispatchEvent(){return!0}},po=class extends ho{},fo=class extends po{constructor(){super(...arguments),this.role=null}},Ps=class{observe(){}unobserve(){}disconnect(){}},Tu={createElement:function(){return new Ka.HTMLElement},createElementNS:function(){return new Ka.HTMLElement},addEventListener(){},removeEventListener(){},dispatchEvent(t){return!1}},Ka={ResizeObserver:Ps,document:Tu,Node:po,Element:fo,HTMLElement:class extends fo{constructor(){super(...arguments),this.innerHTML=""}get content(){return new Ka.DocumentFragment}},DocumentFragment:class extends ho{},customElements:{get:function(){},define:function(){},whenDefined:function(){}},localStorage:{getItem(t){return null},setItem(t,e){},removeItem(t){}},CustomEvent:function(){},getComputedStyle:function(){},navigator:{languages:[],get userAgent(){return""}},matchMedia(t){return{matches:!1,media:t}},DOMParser:class{parseFromString(e,i){return{body:{textContent:e}}}}},yu="global"in globalThis&&(globalThis==null?void 0:globalThis.global)===globalThis||typeof window=="undefined"||typeof window.customElements=="undefined",ku=Object.keys(Ka).every(t=>t in globalThis),l=yu&&!ku?Ka:globalThis,V=yu&&!ku?Tu:globalThis.document;var Su=new WeakMap,Us=t=>{let e=Su.get(t);return e||Su.set(t,e=new Set),e},Iu=new l.ResizeObserver(t=>{for(let e of t)for(let i of Us(e.target))i(e)});function pt(t,e){Us(t).add(e),Iu.observe(t)}function ft(t,e){let i=Us(t);i.delete(e),i.size||Iu.unobserve(t)}function Z(t){let e={};for(let i of t)e[i.name]=i.value;return e}function Y(t){var e;return(e=vo(t))!=null?e:Ve(t,"media-controller")}function vo(t){var e;let{MEDIA_CONTROLLER:i}=x,a=t.getAttribute(i);if(a)return(e=qt(t))==null?void 0:e.getElementById(a)}var Eo=(t,e,i=".value")=>{let a=t.querySelector(i);a&&(a.textContent=e)},Nh=(t,e)=>{let i=`slot[name="${e}"]`,a=t.shadowRoot.querySelector(i);return a?a.children:[]},bo=(t,e)=>Nh(t,e)[0],ue=(t,e)=>!t||!e?!1:t!=null&&t.contains(e)?!0:ue(t,e.getRootNode().host),Ve=(t,e)=>{if(!t)return null;let i=t.closest(e);return i||Ve(t.getRootNode().host,e)};function Ga(t=document){var e;let i=t==null?void 0:t.activeElement;return i?(e=Ga(i.shadowRoot))!=null?e:i:null}function qt(t){var e;let i=(e=t==null?void 0:t.getRootNode)==null?void 0:e.call(t);return i instanceof ShadowRoot||i instanceof Document?i:null}function go(t,{depth:e=3,checkOpacity:i=!0,checkVisibilityCSS:a=!0}={}){if(t.checkVisibility)return t.checkVisibility({checkOpacity:i,checkVisibilityCSS:a});let r=t;for(;r&&e>0;){let o=getComputedStyle(r);if(i&&o.opacity==="0"||a&&o.visibility==="hidden"||o.display==="none")return!1;r=r.parentElement,e--}return!0}function Mu(t,e,i,a){let r=a.x-i.x,o=a.y-i.y,s=r*r+o*o;if(s===0)return 0;let d=((t-i.x)*r+(e-i.y)*o)/s;return Math.max(0,Math.min(1,d))}function q(t,e){let i=Ph(t,a=>a===e);return i||Ya(t,e)}function Ph(t,e){var i,a;let r;for(r of(i=t.querySelectorAll("style:not([media])"))!=null?i:[]){let o;try{o=(a=r.sheet)==null?void 0:a.cssRules}catch{continue}for(let s of o!=null?o:[])if(e(s.selectorText))return s}}function Ya(t,e){var i,a;let r=(i=t.querySelectorAll("style:not([media])"))!=null?i:[],o=r==null?void 0:r[r.length-1];return o!=null&&o.sheet?(o==null||o.sheet.insertRule(`${e}{}`,o.sheet.cssRules.length),(a=o.sheet.cssRules)==null?void 0:a[o.sheet.cssRules.length-1]):(console.warn("Media Chrome: No style sheet found on style tag of",t),{style:{setProperty:()=>{},removeProperty:()=>"",getPropertyValue:()=>""}})}function O(t,e,i=Number.NaN){let a=t.getAttribute(e);return a!=null?+a:i}function P(t,e,i){let a=+i;if(i==null||Number.isNaN(a)){t.hasAttribute(e)&&t.removeAttribute(e);return}O(t,e,void 0)!==a&&t.setAttribute(e,`${a}`)}function k(t,e){return t.hasAttribute(e)}function S(t,e,i){if(i==null){t.hasAttribute(e)&&t.removeAttribute(e);return}k(t,e)!=i&&t.toggleAttribute(e,i)}function w(t,e,i=null){var a;return(a=t.getAttribute(e))!=null?a:i}function R(t,e,i){if(i==null){t.hasAttribute(e)&&t.removeAttribute(e);return}let a=`${i}`;w(t,e,void 0)!==a&&t.setAttribute(e,a)}var Cu=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},It=(t,e,i)=>(Cu(t,e,"read from private field"),i?i.call(t):e.get(t)),Uh=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},_o=(t,e,i,a)=>(Cu(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Ee;function Hh(t){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `}var Li=class extends l.HTMLElement{constructor(){if(super(),Uh(this,Ee,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[x.MEDIA_CONTROLLER,n.MEDIA_PAUSED]}attributeChangedCallback(e,i,a){var r,o,s,d,u;e===x.MEDIA_CONTROLLER&&(i&&((o=(r=It(this,Ee))==null?void 0:r.unassociateElement)==null||o.call(r,this),_o(this,Ee,null)),a&&this.isConnected&&(_o(this,Ee,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=It(this,Ee))==null?void 0:d.associateElement)==null||u.call(d,this)))}connectedCallback(){var e,i,a,r;this.tabIndex=-1,this.setAttribute("aria-hidden","true"),_o(this,Ee,Bh(this)),this.getAttribute(x.MEDIA_CONTROLLER)&&((i=(e=It(this,Ee))==null?void 0:e.associateElement)==null||i.call(e,this)),(a=It(this,Ee))==null||a.addEventListener("pointerdown",this),(r=It(this,Ee))==null||r.addEventListener("click",this)}disconnectedCallback(){var e,i,a,r;this.getAttribute(x.MEDIA_CONTROLLER)&&((i=(e=It(this,Ee))==null?void 0:e.unassociateElement)==null||i.call(e,this)),(a=It(this,Ee))==null||a.removeEventListener("pointerdown",this),(r=It(this,Ee))==null||r.removeEventListener("click",this),_o(this,Ee,null)}handleEvent(e){var i;let a=(i=e.composedPath())==null?void 0:i[0];if(["video","media-controller"].includes(a==null?void 0:a.localName)){if(e.type==="pointerdown")this._pointerType=e.pointerType;else if(e.type==="click"){let{clientX:o,clientY:s}=e,{left:d,top:u,width:p,height:T}=this.getBoundingClientRect(),_=o-d,E=s-u;if(_<0||E<0||_>p||E>T||p===0&&T===0)return;let f=this._pointerType||"mouse";if(this._pointerType=void 0,f===uo.TOUCH){this.handleTap(e);return}else if(f===uo.MOUSE||f===uo.PEN){this.handleMouseClick(e);return}}}}get mediaPaused(){return k(this,n.MEDIA_PAUSED)}set mediaPaused(e){S(this,n.MEDIA_PAUSED,e)}handleTap(e){}handleMouseClick(e){let i=this.mediaPaused?m.MEDIA_PLAY_REQUEST:m.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new l.CustomEvent(i,{composed:!0,bubbles:!0}))}};Ee=new WeakMap;Li.shadowRootOptions={mode:"open"};Li.getTemplateHTML=Hh;function Bh(t){var e;let i=t.getAttribute(x.MEDIA_CONTROLLER);return i?(e=t.getRootNode())==null?void 0:e.getElementById(i):Ve(t,"media-controller")}l.customElements.get("media-gesture-receiver")||l.customElements.define("media-gesture-receiver",Li);var Ao=Li;var Ws=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Ie=(t,e,i)=>(Ws(t,e,"read from private field"),i?i.call(t):e.get(t)),Se=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Zt=(t,e,i,a)=>(Ws(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),we=(t,e,i)=>(Ws(t,e,"access private method"),i),ko,wi,Za,Ri,To,Hs,Lu,qa,yo,Bs,wu,$s,Ru,Qa,So,Io,Fs,xi,za,y={AUDIO:"audio",AUTOHIDE:"autohide",BREAKPOINTS:"breakpoints",GESTURES_DISABLED:"gesturesdisabled",KEYBOARD_CONTROL:"keyboardcontrol",NO_AUTOHIDE:"noautohide",USER_INACTIVE:"userinactive",AUTOHIDE_OVER_CONTROLS:"autohideovercontrols"};function $h(t){return`
    <style>
      
      :host([${n.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
        overflow: hidden;
      }

      :host(:not([${y.AUDIO}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      
      :host([${y.AUDIO}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      
      :host([${y.AUDIO}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      
      :host(:not([${y.AUDIO}])[${y.GESTURES_DISABLED}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${y.AUDIO}])[${y.GESTURES_DISABLED}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${y.AUDIO}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${y.AUDIO}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${y.AUDIO}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      
      :host(:not([${y.AUDIO}])) .spacer {
        flex-grow: 1;
      }

      
      :host(:-webkit-full-screen) {
        
        width: 100% !important;
        height: 100% !important;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not([${y.NO_AUTOHIDE}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      
      :host([${y.USER_INACTIVE}]:not([${n.MEDIA_PAUSED}]):not([${n.MEDIA_IS_AIRPLAYING}]):not([${n.MEDIA_IS_CASTING}]):not([${y.AUDIO}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${y.NO_AUTOHIDE}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${y.USER_INACTIVE}]:not([${y.NO_AUTOHIDE}]):not([${n.MEDIA_PAUSED}]):not([${n.MEDIA_IS_CASTING}]):not([${y.AUDIO}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${y.USER_INACTIVE}][${y.AUTOHIDE_OVER_CONTROLS}]:not([${y.NO_AUTOHIDE}]):not([${n.MEDIA_PAUSED}]):not([${n.MEDIA_IS_CASTING}]):not([${y.AUDIO}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      
      :host(:not([${y.AUDIO}])[${n.MEDIA_HAS_PLAYED}]) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${Ao.shadowRootOptions.mode}">
          ${Ao.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `}var Wh=Object.values(n),Fh="sm:384 md:576 lg:768 xl:960";function Vh(t){xu(t.target,t.contentRect.width)}function xu(t,e){var i;if(!t.isConnected)return;let a=(i=t.getAttribute(y.BREAKPOINTS))!=null?i:Fh,r=Kh(a),o=Gh(r,e),s=!1;if(Object.keys(r).forEach(d=>{if(o.includes(d)){t.hasAttribute(`breakpoint${d}`)||(t.setAttribute(`breakpoint${d}`,""),s=!0);return}t.hasAttribute(`breakpoint${d}`)&&(t.removeAttribute(`breakpoint${d}`),s=!0)}),s){let d=new CustomEvent(Le.BREAKPOINTS_CHANGE,{detail:o});t.dispatchEvent(d)}t.breakpointsComputed||(t.breakpointsComputed=!0,t.dispatchEvent(new CustomEvent(Le.BREAKPOINTS_COMPUTED,{bubbles:!0,composed:!0})))}function Kh(t){let e=t.split(/\s+/);return Object.fromEntries(e.map(i=>i.split(":")))}function Gh(t,e){return Object.keys(t).filter(i=>e>=parseInt(t[i]))}var Qt=class extends l.HTMLElement{constructor(){if(super(),Se(this,Hs),Se(this,Bs),Se(this,$s),Se(this,Qa),Se(this,Io),Se(this,xi),Se(this,ko,0),Se(this,wi,null),Se(this,Za,null),Se(this,Ri,void 0),this.breakpointsComputed=!1,Se(this,To,new MutationObserver(we(this,Hs,Lu).bind(this))),Se(this,qa,!1),Se(this,yo,i=>{Ie(this,qa)||(setTimeout(()=>{Vh(i),Zt(this,qa,!1)},0),Zt(this,qa,!0))}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let i=Z(this.attributes),a=this.constructor.getTemplateHTML(i);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(a):this.shadowRoot.innerHTML=a}let e=this.querySelector(":scope > slot[slot=media]");e&&e.addEventListener("slotchange",()=>{if(!e.assignedElements({flatten:!0}).length){Ie(this,wi)&&this.mediaUnsetCallback(Ie(this,wi));return}this.handleMediaUpdated(this.media)})}static get observedAttributes(){return[y.AUTOHIDE,y.GESTURES_DISABLED].concat(Wh).filter(e=>![n.MEDIA_RENDITION_LIST,n.MEDIA_AUDIO_TRACK_LIST,n.MEDIA_CHAPTERS_CUES,n.MEDIA_WIDTH,n.MEDIA_HEIGHT,n.MEDIA_ERROR,n.MEDIA_ERROR_MESSAGE].includes(e))}attributeChangedCallback(e,i,a){e.toLowerCase()==y.AUTOHIDE&&(this.autohide=a)}get media(){let e=this.querySelector(":scope > [slot=media]");return(e==null?void 0:e.nodeName)=="SLOT"&&(e=e.assignedElements({flatten:!0})[0]),e}async handleMediaUpdated(e){e&&(Zt(this,wi,e),e.localName.includes("-")&&await l.customElements.whenDefined(e.localName),this.mediaSetCallback(e))}connectedCallback(){var e;Ie(this,To).observe(this,{childList:!0,subtree:!0}),pt(this,Ie(this,yo));let a=this.getAttribute(y.AUDIO)!=null?h("audio player"):h("video player");this.setAttribute("role","region"),this.setAttribute("aria-label",a),this.handleMediaUpdated(this.media),this.setAttribute(y.USER_INACTIVE,""),xu(this,this.getBoundingClientRect().width),this.addEventListener("pointerdown",this),this.addEventListener("pointermove",this),this.addEventListener("pointerup",this),this.addEventListener("mouseleave",this),this.addEventListener("keyup",this),(e=l.window)==null||e.addEventListener("mouseup",this)}disconnectedCallback(){var e;Ie(this,To).disconnect(),ft(this,Ie(this,yo)),this.media&&this.mediaUnsetCallback(this.media),(e=l.window)==null||e.removeEventListener("mouseup",this)}mediaSetCallback(e){}mediaUnsetCallback(e){Zt(this,wi,null)}handleEvent(e){switch(e.type){case"pointerdown":Zt(this,ko,e.timeStamp);break;case"pointermove":we(this,Bs,wu).call(this,e);break;case"pointerup":we(this,$s,Ru).call(this,e);break;case"mouseleave":we(this,Qa,So).call(this);break;case"mouseup":this.removeAttribute(y.KEYBOARD_CONTROL);break;case"keyup":we(this,xi,za).call(this),this.setAttribute(y.KEYBOARD_CONTROL,"");break}}set autohide(e){let i=Number(e);Zt(this,Ri,isNaN(i)?0:i)}get autohide(){return(Ie(this,Ri)===void 0?2:Ie(this,Ri)).toString()}get breakpoints(){return w(this,y.BREAKPOINTS)}set breakpoints(e){R(this,y.BREAKPOINTS,e)}get audio(){return k(this,y.AUDIO)}set audio(e){S(this,y.AUDIO,e)}get gesturesDisabled(){return k(this,y.GESTURES_DISABLED)}set gesturesDisabled(e){S(this,y.GESTURES_DISABLED,e)}get keyboardControl(){return k(this,y.KEYBOARD_CONTROL)}set keyboardControl(e){S(this,y.KEYBOARD_CONTROL,e)}get noAutohide(){return k(this,y.NO_AUTOHIDE)}set noAutohide(e){S(this,y.NO_AUTOHIDE,e)}get autohideOverControls(){return k(this,y.AUTOHIDE_OVER_CONTROLS)}set autohideOverControls(e){S(this,y.AUTOHIDE_OVER_CONTROLS,e)}get userInteractive(){return k(this,y.USER_INACTIVE)}set userInteractive(e){S(this,y.USER_INACTIVE,e)}};ko=new WeakMap;wi=new WeakMap;Za=new WeakMap;Ri=new WeakMap;To=new WeakMap;Hs=new WeakSet;Lu=function(t){let e=this.media;for(let i of t){if(i.type!=="childList")continue;let a=i.removedNodes;for(let r of a){if(r.slot!="media"||i.target!=this)continue;let o=i.previousSibling&&i.previousSibling.previousElementSibling;if(!o||!e)this.mediaUnsetCallback(r);else{let s=o.slot!=="media";for(;(o=o.previousSibling)!==null;)o.slot=="media"&&(s=!1);s&&this.mediaUnsetCallback(r)}}if(e)for(let r of i.addedNodes)r===e&&this.handleMediaUpdated(e)}};qa=new WeakMap;yo=new WeakMap;Bs=new WeakSet;wu=function(t){if(t.pointerType!=="mouse"&&t.timeStamp-Ie(this,ko)<250)return;we(this,Io,Fs).call(this),clearTimeout(Ie(this,Za));let e=this.hasAttribute(y.AUTOHIDE_OVER_CONTROLS);([this,this.media].includes(t.target)||e)&&we(this,xi,za).call(this)};$s=new WeakSet;Ru=function(t){if(t.pointerType==="touch"){let e=!this.hasAttribute(y.USER_INACTIVE);[this,this.media].includes(t.target)&&e?we(this,Qa,So).call(this):we(this,xi,za).call(this)}else t.composedPath().some(e=>["media-play-button","media-fullscreen-button"].includes(e==null?void 0:e.localName))&&we(this,xi,za).call(this)};Qa=new WeakSet;So=function(){if(Ie(this,Ri)<0||this.hasAttribute(y.USER_INACTIVE))return;this.setAttribute(y.USER_INACTIVE,"");let t=new l.CustomEvent(Le.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!0});this.dispatchEvent(t)};Io=new WeakSet;Fs=function(){if(!this.hasAttribute(y.USER_INACTIVE))return;this.removeAttribute(y.USER_INACTIVE);let t=new l.CustomEvent(Le.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!1});this.dispatchEvent(t)};xi=new WeakSet;za=function(){we(this,Io,Fs).call(this),clearTimeout(Ie(this,Za));let t=parseInt(this.autohide);t<0||Zt(this,Za,setTimeout(()=>{we(this,Qa,So).call(this)},t*1e3))};Qt.shadowRootOptions={mode:"open"};Qt.getTemplateHTML=$h;l.customElements.get("media-container")||l.customElements.define("media-container",Qt);var Du=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},oe=(t,e,i)=>(Du(t,e,"read from private field"),i?i.call(t):e.get(t)),Xa=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Mo=(t,e,i,a)=>(Du(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Di,Oi,Co,zt,vt,Mt,Ct=class{constructor(e,i,{defaultValue:a}={defaultValue:void 0}){Xa(this,vt),Xa(this,Di,void 0),Xa(this,Oi,void 0),Xa(this,Co,void 0),Xa(this,zt,new Set),Mo(this,Di,e),Mo(this,Oi,i),Mo(this,Co,new Set(a))}[Symbol.iterator](){return oe(this,vt,Mt).values()}get length(){return oe(this,vt,Mt).size}get value(){var e;return(e=[...oe(this,vt,Mt)].join(" "))!=null?e:""}set value(e){var i;e!==this.value&&(Mo(this,zt,new Set),this.add(...(i=e==null?void 0:e.split(" "))!=null?i:[]))}toString(){return this.value}item(e){return[...oe(this,vt,Mt)][e]}values(){return oe(this,vt,Mt).values()}forEach(e,i){oe(this,vt,Mt).forEach(e,i)}add(...e){var i,a;e.forEach(r=>oe(this,zt).add(r)),!(this.value===""&&!((i=oe(this,Di))!=null&&i.hasAttribute(`${oe(this,Oi)}`)))&&((a=oe(this,Di))==null||a.setAttribute(`${oe(this,Oi)}`,`${this.value}`))}remove(...e){var i;e.forEach(a=>oe(this,zt).delete(a)),(i=oe(this,Di))==null||i.setAttribute(`${oe(this,Oi)}`,`${this.value}`)}contains(e){return oe(this,vt,Mt).has(e)}toggle(e,i){return typeof i!="undefined"?i?(this.add(e),!0):(this.remove(e),!1):this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,i){return this.remove(e),this.add(i),e===i}};Di=new WeakMap;Oi=new WeakMap;Co=new WeakMap;zt=new WeakMap;vt=new WeakSet;Mt=function(){return oe(this,zt).size?oe(this,zt):oe(this,Co)};var Yh=(t="")=>t.split(/\s+/),Ou=(t="")=>{let[e,i,a]=t.split(":"),r=a?decodeURIComponent(a):void 0;return{kind:e==="cc"?fe.CAPTIONS:fe.SUBTITLES,language:i,label:r}},Xt=(t="",e={})=>Yh(t).map(i=>{let a=Ou(i);return{...e,...a}}),Vs=t=>t?Array.isArray(t)?t.map(e=>typeof e=="string"?Ou(e):e):typeof t=="string"?Xt(t):[t]:[],Lo=({kind:t,label:e,language:i}={kind:"subtitles"})=>e?`${t==="captions"?"cc":"sb"}:${i}:${encodeURIComponent(e)}`:i,Et=(t=[])=>Array.prototype.map.call(t,Lo).join(" "),qh=(t,e)=>i=>i[t]===e,Nu=t=>{let e=Object.entries(t).map(([i,a])=>qh(i,a));return i=>e.every(a=>a(i))},Jt=(t,e=[],i=[])=>{let a=Vs(i).map(Nu),r=o=>a.some(s=>s(o));Array.from(e).filter(r).forEach(o=>{o.mode=t})},jt=(t,e=()=>!0)=>{if(!(t!=null&&t.textTracks))return[];let i=typeof e=="function"?e:Nu(e);return Array.from(t.textTracks).filter(i)},wo=t=>{var e;return!!((e=t.mediaSubtitlesShowing)!=null&&e.length)||t.hasAttribute(n.MEDIA_SUBTITLES_SHOWING)};var Uu=t=>{var e;let{media:i,fullscreenElement:a}=t;try{let r=a&&"requestFullscreen"in a?"requestFullscreen":a&&"webkitRequestFullScreen"in a?"webkitRequestFullScreen":void 0;if(r){let o=(e=a[r])==null?void 0:e.call(a);if(o instanceof Promise)return o.catch(()=>{})}else i!=null&&i.webkitEnterFullscreen?i.webkitEnterFullscreen():i!=null&&i.requestFullscreen&&i.requestFullscreen()}catch(r){console.error(r)}},Pu="exitFullscreen"in V?"exitFullscreen":"webkitExitFullscreen"in V?"webkitExitFullscreen":"webkitCancelFullScreen"in V?"webkitCancelFullScreen":void 0,Hu=t=>{var e;let{documentElement:i}=t;if(Pu){let a=(e=i==null?void 0:i[Pu])==null?void 0:e.call(i);if(a instanceof Promise)return a.catch(()=>{})}},Ja="fullscreenElement"in V?"fullscreenElement":"webkitFullscreenElement"in V?"webkitFullscreenElement":void 0,Zh=t=>{let{documentElement:e,media:i}=t,a=e==null?void 0:e[Ja];return!a&&"webkitDisplayingFullscreen"in i&&"webkitPresentationMode"in i&&i.webkitDisplayingFullscreen&&i.webkitPresentationMode===mu.FULLSCREEN?i:a},Bu=t=>{var e;let{media:i,documentElement:a,fullscreenElement:r=i}=t;if(!i||!a)return!1;let o=Zh(t);if(!o)return!1;if(o===r||o===i)return!0;if(o.localName.includes("-")){let s=o.shadowRoot;if(!(Ja in s))return ue(o,r);for(;s!=null&&s[Ja];){if(s[Ja]===r)return!0;s=(e=s[Ja])==null?void 0:e.shadowRoot}}return!1},Qh="fullscreenEnabled"in V?"fullscreenEnabled":"webkitFullscreenEnabled"in V?"webkitFullscreenEnabled":void 0,$u=t=>{let{documentElement:e,media:i}=t;return!!(e!=null&&e[Qh])||i&&"webkitSupportsFullscreen"in i};var Ro,Ks=()=>{var t,e;return Ro||(Ro=(e=(t=V)==null?void 0:t.createElement)==null?void 0:e.call(t,"video"),Ro)},Wu=async(t=Ks())=>{if(!t)return!1;let e=t.volume;t.volume=e/2+.1;let i=new AbortController,a=await Promise.race([zh(t,i.signal),Xh(t,e)]);return i.abort(),a},zh=(t,e)=>new Promise(i=>{t.addEventListener("volumechange",()=>i(!0),{signal:e})}),Xh=async(t,e)=>{for(let i=0;i<10;i++){if(t.volume===e)return!1;await mo(10)}return t.volume!==e},Jh=/.*Version\/.*Safari\/.*/.test(l.navigator.userAgent),Gs=(t=Ks())=>l.matchMedia("(display-mode: standalone)").matches&&Jh?!1:typeof(t==null?void 0:t.requestPictureInPicture)=="function",Ys=(t=Ks())=>$u({documentElement:V,media:t}),Fu=Ys(),Vu=Gs(),Ku=!!l.WebKitPlaybackTargetAvailabilityEvent,Gu=!!l.chrome;var Ni=t=>jt(t.media,e=>[fe.SUBTITLES,fe.CAPTIONS].includes(e.kind)).sort((e,i)=>e.kind>=i.kind?1:-1),qs=t=>jt(t.media,e=>e.mode===St.SHOWING&&[fe.SUBTITLES,fe.CAPTIONS].includes(e.kind)),xo=(t,e)=>{let i=Ni(t),a=qs(t),r=!!a.length;if(i.length){if(e===!1||r&&e!==!0)Jt(St.DISABLED,i,a);else if(e===!0||!r&&e!==!1){let o=i[0],{options:s}=t;if(!(s!=null&&s.noSubtitlesLangPref)){let T=globalThis.localStorage.getItem("media-chrome-pref-subtitles-lang"),_=T?[T,...globalThis.navigator.languages]:globalThis.navigator.languages,E=i.filter(f=>_.some(M=>f.language.toLowerCase().startsWith(M.split("-")[0]))).sort((f,M)=>{let b=_.findIndex(L=>f.language.toLowerCase().startsWith(L.split("-")[0])),C=_.findIndex(L=>M.language.toLowerCase().startsWith(L.split("-")[0]));return b-C});E[0]&&(o=E[0])}let{language:d,label:u,kind:p}=o;Jt(St.DISABLED,i,a),Jt(St.SHOWING,i,[{language:d,label:u,kind:p}])}}},Do=(t,e)=>t===e?!0:t==null||e==null||typeof t!=typeof e?!1:typeof t=="number"&&Number.isNaN(t)&&Number.isNaN(e)?!0:typeof t!="object"?!1:Array.isArray(t)?jh(t,e):Object.entries(t).every(([i,a])=>i in e&&Do(a,e[i])),jh=(t,e)=>{let i=Array.isArray(t),a=Array.isArray(e);return i!==a?!1:i||a?t.length!==e.length?!1:t.every((r,o)=>Do(r,e[o])):!0};var ep=Object.values(Pe),Oo,tp=Wu().then(t=>(Oo=t,Oo)),Yu=async(...t)=>{await Promise.all(t.filter(e=>e).map(async e=>{if(!("localName"in e&&e instanceof l.HTMLElement))return;let i=e.localName;if(!i.includes("-"))return;let a=l.customElements.get(i);a&&e instanceof a||(await l.customElements.whenDefined(i),l.customElements.upgrade(e))}))},ip=new l.DOMParser,ap=t=>t&&(ip.parseFromString(t,"text/html").body.textContent||t),Pi={mediaError:{get(t,e){let{media:i}=t;if((e==null?void 0:e.type)!=="playing")return i==null?void 0:i.error},mediaEvents:["emptied","error","playing"]},mediaErrorCode:{get(t,e){var i;let{media:a}=t;if((e==null?void 0:e.type)!=="playing")return(i=a==null?void 0:a.error)==null?void 0:i.code},mediaEvents:["emptied","error","playing"]},mediaErrorMessage:{get(t,e){var i,a;let{media:r}=t;if((e==null?void 0:e.type)!=="playing")return(a=(i=r==null?void 0:r.error)==null?void 0:i.message)!=null?a:""},mediaEvents:["emptied","error","playing"]},mediaWidth:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.videoWidth)!=null?e:0},mediaEvents:["resize"]},mediaHeight:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.videoHeight)!=null?e:0},mediaEvents:["resize"]},mediaPaused:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.paused)!=null?e:!0},set(t,e){var i;let{media:a}=e;a&&(t?a.pause():(i=a.play())==null||i.catch(()=>{}))},mediaEvents:["play","playing","pause","emptied"]},mediaHasPlayed:{get(t,e){let{media:i}=t;return i?e?e.type==="playing":!i.paused:!1},mediaEvents:["playing","emptied"]},mediaEnded:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.ended)!=null?e:!1},mediaEvents:["seeked","ended","emptied"]},mediaPlaybackRate:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.playbackRate)!=null?e:1},set(t,e){let{media:i}=e;i&&Number.isFinite(+t)&&(i.playbackRate=+t)},mediaEvents:["ratechange","loadstart"]},mediaMuted:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.muted)!=null?e:!1},set(t,e){let{media:i,options:{noMutedPref:a}={}}=e;if(i){i.muted=t;try{let r=l.localStorage.getItem("media-chrome-pref-muted")!==null,o=i.hasAttribute("muted");if(a){r&&l.localStorage.removeItem("media-chrome-pref-muted");return}if(o&&!r)return;l.localStorage.setItem("media-chrome-pref-muted",t?"true":"false")}catch(r){console.debug("Error setting muted pref",r)}}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(t,e)=>{let{options:{noMutedPref:i}}=e,{media:a}=e;if(!(!a||a.muted||i))try{let r=l.localStorage.getItem("media-chrome-pref-muted")==="true";Pi.mediaMuted.set(r,e),t(r)}catch(r){console.debug("Error getting muted pref",r)}}]},mediaLoop:{get(t){let{media:e}=t;return e==null?void 0:e.loop},set(t,e){let{media:i}=e;i&&(i.loop=t)},mediaEvents:["medialooprequest"]},mediaVolume:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.volume)!=null?e:1},set(t,e){let{media:i,options:{noVolumePref:a}={}}=e;if(i){try{t==null?l.localStorage.removeItem("media-chrome-pref-volume"):!i.hasAttribute("muted")&&!a&&l.localStorage.setItem("media-chrome-pref-volume",t.toString())}catch(r){console.debug("Error setting volume pref",r)}Number.isFinite(+t)&&(i.volume=+t)}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(t,e)=>{let{options:{noVolumePref:i}}=e;if(!i)try{let{media:a}=e;if(!a)return;let r=l.localStorage.getItem("media-chrome-pref-volume");if(r==null)return;Pi.mediaVolume.set(+r,e),t(+r)}catch(a){console.debug("Error getting volume pref",a)}}]},mediaVolumeLevel:{get(t){let{media:e}=t;return typeof(e==null?void 0:e.volume)=="undefined"?"high":e.muted||e.volume===0?"off":e.volume<.5?"low":e.volume<.75?"medium":"high"},mediaEvents:["volumechange"]},mediaCurrentTime:{get(t){var e;let{media:i}=t;return(e=i==null?void 0:i.currentTime)!=null?e:0},set(t,e){let{media:i}=e;!i||!Ci(t)||(i.currentTime=t)},mediaEvents:["timeupdate","loadedmetadata"]},mediaDuration:{get(t){let{media:e,options:{defaultDuration:i}={}}=t;return i&&(!e||!e.duration||Number.isNaN(e.duration)||!Number.isFinite(e.duration))?i:Number.isFinite(e==null?void 0:e.duration)?e.duration:Number.NaN},mediaEvents:["durationchange","loadedmetadata","emptied"]},mediaLoading:{get(t){let{media:e}=t;return(e==null?void 0:e.readyState)<3},mediaEvents:["waiting","playing","emptied"]},mediaSeekable:{get(t){var e;let{media:i}=t;if(!((e=i==null?void 0:i.seekable)!=null&&e.length))return;let a=i.seekable.start(0),r=i.seekable.end(i.seekable.length-1);if(!(!a&&!r))return[Number(a.toFixed(3)),Number(r.toFixed(3))]},mediaEvents:["loadedmetadata","emptied","progress","seekablechange"]},mediaBuffered:{get(t){var e;let{media:i}=t,a=(e=i==null?void 0:i.buffered)!=null?e:[];return Array.from(a).map((r,o)=>[Number(a.start(o).toFixed(3)),Number(a.end(o).toFixed(3))])},mediaEvents:["progress","emptied"]},mediaStreamType:{get(t){let{media:e,options:{defaultStreamType:i}={}}=t,a=[Pe.LIVE,Pe.ON_DEMAND].includes(i)?i:void 0;if(!e)return a;let{streamType:r}=e;if(ep.includes(r))return r===Pe.UNKNOWN?a:r;let o=e.duration;return o===1/0?Pe.LIVE:Number.isFinite(o)?Pe.ON_DEMAND:a},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange"]},mediaTargetLiveWindow:{get(t){let{media:e}=t;if(!e)return Number.NaN;let{targetLiveWindow:i}=e,a=Pi.mediaStreamType.get(t);return(i==null||Number.isNaN(i))&&a===Pe.LIVE?0:i},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange","targetlivewindowchange"]},mediaTimeIsLive:{get(t){let{media:e,options:{liveEdgeOffset:i=10}={}}=t;if(!e)return!1;if(typeof e.liveEdgeStart=="number")return Number.isNaN(e.liveEdgeStart)?!1:e.currentTime>=e.liveEdgeStart;if(!(Pi.mediaStreamType.get(t)===Pe.LIVE))return!1;let r=e.seekable;if(!r)return!0;if(!r.length)return!1;let o=r.end(r.length-1)-i;return e.currentTime>=o},mediaEvents:["playing","timeupdate","progress","waiting","emptied"]},mediaSubtitlesList:{get(t){return Ni(t).map(({kind:e,label:i,language:a})=>({kind:e,label:i,language:a}))},mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack"]},mediaSubtitlesShowing:{get(t){return qs(t).map(({kind:e,label:i,language:a})=>({kind:e,label:i,language:a}))},mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(t,e)=>{var i,a;let{media:r,options:o}=e;if(!r)return;let s=d=>{var u;!o.defaultSubtitles||d&&![fe.CAPTIONS,fe.SUBTITLES].includes((u=d==null?void 0:d.track)==null?void 0:u.kind)||xo(e,!0)};return r.addEventListener("loadstart",s),(i=r.textTracks)==null||i.addEventListener("addtrack",s),(a=r.textTracks)==null||a.addEventListener("removetrack",s),()=>{var d,u;r.removeEventListener("loadstart",s),(d=r.textTracks)==null||d.removeEventListener("addtrack",s),(u=r.textTracks)==null||u.removeEventListener("removetrack",s)}}]},mediaChaptersCues:{get(t){var e;let{media:i}=t;if(!i)return[];let[a]=jt(i,{kind:fe.CHAPTERS});return Array.from((e=a==null?void 0:a.cues)!=null?e:[]).map(({text:r,startTime:o,endTime:s})=>({text:ap(r),startTime:o,endTime:s}))},mediaEvents:["loadstart","loadedmetadata"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(t,e)=>{var i;let{media:a}=e;if(!a)return;let r=a.querySelector('track[kind="chapters"][default][src]'),o=(i=a.shadowRoot)==null?void 0:i.querySelector(':is(video,audio) > track[kind="chapters"][default][src]');return r==null||r.addEventListener("load",t),o==null||o.addEventListener("load",t),()=>{r==null||r.removeEventListener("load",t),o==null||o.removeEventListener("load",t)}}]},mediaIsPip:{get(t){var e,i;let{media:a,documentElement:r}=t;if(!a||!r||!r.pictureInPictureElement)return!1;if(r.pictureInPictureElement===a)return!0;if(r.pictureInPictureElement instanceof HTMLMediaElement)return(e=a.localName)!=null&&e.includes("-")?ue(a,r.pictureInPictureElement):!1;if(r.pictureInPictureElement.localName.includes("-")){let o=r.pictureInPictureElement.shadowRoot;for(;o!=null&&o.pictureInPictureElement;){if(o.pictureInPictureElement===a)return!0;o=(i=o.pictureInPictureElement)==null?void 0:i.shadowRoot}}return!1},set(t,e){let{media:i}=e;if(i)if(t){if(!V.pictureInPictureEnabled){console.warn("MediaChrome: Picture-in-picture is not enabled");return}if(!i.requestPictureInPicture){console.warn("MediaChrome: The current media does not support picture-in-picture");return}let a=()=>{console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.")};i.requestPictureInPicture().catch(r=>{if(r.code===11){if(!i.src){console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a src set.");return}if(i.readyState===0&&i.preload==="none"){let o=()=>{i.removeEventListener("loadedmetadata",s),i.preload="none"},s=()=>{i.requestPictureInPicture().catch(a),o()};i.addEventListener("loadedmetadata",s),i.preload="metadata",setTimeout(()=>{i.readyState===0&&a(),o()},1e3)}else throw r}else throw r})}else V.pictureInPictureElement&&V.exitPictureInPicture()},mediaEvents:["enterpictureinpicture","leavepictureinpicture"]},mediaRenditionList:{get(t){var e;let{media:i}=t;return[...(e=i==null?void 0:i.videoRenditions)!=null?e:[]].map(a=>({...a}))},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaRenditionSelected:{get(t){var e,i,a;let{media:r}=t;return(a=(i=r==null?void 0:r.videoRenditions)==null?void 0:i[(e=r.videoRenditions)==null?void 0:e.selectedIndex])==null?void 0:a.id},set(t,e){let{media:i}=e;if(!(i!=null&&i.videoRenditions)){console.warn("MediaController: Rendition selection not supported by this media.");return}let a=t,r=Array.prototype.findIndex.call(i.videoRenditions,o=>o.id==a);i.videoRenditions.selectedIndex!=r&&(i.videoRenditions.selectedIndex=r)},mediaEvents:["emptied"],videoRenditionsEvents:["addrendition","removerendition","change"]},mediaAudioTrackList:{get(t){var e;let{media:i}=t;return[...(e=i==null?void 0:i.audioTracks)!=null?e:[]]},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaAudioTrackEnabled:{get(t){var e,i;let{media:a}=t;return(i=[...(e=a==null?void 0:a.audioTracks)!=null?e:[]].find(r=>r.enabled))==null?void 0:i.id},set(t,e){let{media:i}=e;if(!(i!=null&&i.audioTracks)){console.warn("MediaChrome: Audio track selection not supported by this media.");return}let a=t;for(let r of i.audioTracks)r.enabled=a==r.id},mediaEvents:["emptied"],audioTracksEvents:["addtrack","removetrack","change"]},mediaIsFullscreen:{get(t){return Bu(t)},set(t,e,i){var a;t?(Uu(e),i.detail&&((a=e.media)==null||a.focus())):Hu(e)},rootEvents:["fullscreenchange","webkitfullscreenchange"],mediaEvents:["webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"]},mediaIsCasting:{get(t){var e;let{media:i}=t;return!(i!=null&&i.remote)||((e=i.remote)==null?void 0:e.state)==="disconnected"?!1:!!i.remote.state},set(t,e){var i,a;let{media:r}=e;if(r&&!(t&&((i=r.remote)==null?void 0:i.state)!=="disconnected")&&!(!t&&((a=r.remote)==null?void 0:a.state)!=="connected")){if(typeof r.remote.prompt!="function"){console.warn("MediaChrome: Casting is not supported in this environment");return}r.remote.prompt().catch(()=>{})}},remoteEvents:["connect","connecting","disconnect"]},mediaIsAirplaying:{get(){return!1},set(t,e){let{media:i}=e;if(i){if(!(i.webkitShowPlaybackTargetPicker&&l.WebKitPlaybackTargetAvailabilityEvent)){console.error("MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment");return}i.webkitShowPlaybackTargetPicker()}},mediaEvents:["webkitcurrentplaybacktargetiswirelesschanged"]},mediaFullscreenUnavailable:{get(t){let{media:e}=t;if(!Fu||!Ys(e))return ve.UNSUPPORTED}},mediaPipUnavailable:{get(t){let{media:e}=t;if(!Vu||!Gs(e))return ve.UNSUPPORTED;if(e!=null&&e.disablePictureInPicture)return ve.UNAVAILABLE}},mediaVolumeUnavailable:{get(t){let{media:e}=t;if(Oo===!1||(e==null?void 0:e.volume)==null)return ve.UNSUPPORTED},stateOwnersUpdateHandlers:[t=>{Oo==null&&tp.then(e=>t(e?void 0:ve.UNSUPPORTED))}]},mediaCastUnavailable:{get(t,{availability:e="not-available"}={}){var i;let{media:a}=t;if(!Gu||!((i=a==null?void 0:a.remote)!=null&&i.state))return ve.UNSUPPORTED;if(!(e==null||e==="available"))return ve.UNAVAILABLE},stateOwnersUpdateHandlers:[(t,e)=>{var i;let{media:a}=e;return a?(a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||(i=a==null?void 0:a.remote)==null||i.watchAvailability(o=>{t({availability:o?"available":"not-available"})}).catch(o=>{o.name==="NotSupportedError"?t({availability:null}):t({availability:"not-available"})}),()=>{var o;(o=a==null?void 0:a.remote)==null||o.cancelWatchAvailability().catch(()=>{})}):void 0}]},mediaAirplayUnavailable:{get(t,e){if(!Ku)return ve.UNSUPPORTED;if((e==null?void 0:e.availability)==="not-available")return ve.UNAVAILABLE},mediaEvents:["webkitplaybacktargetavailabilitychanged"],stateOwnersUpdateHandlers:[(t,e)=>{var i;let{media:a}=e;return a?(a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||(i=a==null?void 0:a.remote)==null||i.watchAvailability(o=>{t({availability:o?"available":"not-available"})}).catch(o=>{o.name==="NotSupportedError"?t({availability:null}):t({availability:"not-available"})}),()=>{var o;(o=a==null?void 0:a.remote)==null||o.cancelWatchAvailability().catch(()=>{})}):void 0}]},mediaRenditionUnavailable:{get(t){var e;let{media:i}=t;if(!(i!=null&&i.videoRenditions))return ve.UNSUPPORTED;if(!((e=i.videoRenditions)!=null&&e.length))return ve.UNAVAILABLE},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaAudioTrackUnavailable:{get(t){var e,i;let{media:a}=t;if(!(a!=null&&a.audioTracks))return ve.UNSUPPORTED;if(((i=(e=a.audioTracks)==null?void 0:e.length)!=null?i:0)<=1)return ve.UNAVAILABLE},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaLang:{get(t){let{options:{mediaLang:e}={}}=t;return e!=null?e:"en"}}};var qu={[m.MEDIA_PREVIEW_REQUEST](t,e,{detail:i}){var a,r,o;let{media:s}=e,d=i!=null?i:void 0,u,p;if(s&&d!=null){let[f]=jt(s,{kind:fe.METADATA,label:"thumbnails"}),M=Array.prototype.find.call((a=f==null?void 0:f.cues)!=null?a:[],(b,C,L)=>C===0?b.endTime>d:C===L.length-1?b.startTime<=d:b.startTime<=d&&b.endTime>d);if(M){let b=/'^(?:[a-z]+:)?\/\//i.test(M.text)||(r=s==null?void 0:s.querySelector('track[label="thumbnails"]'))==null?void 0:r.src,C=new URL(M.text,b);p=new URLSearchParams(C.hash).get("#xywh").split(",").map(ie=>+ie),u=C.href}}let T=t.mediaDuration.get(e),E=(o=t.mediaChaptersCues.get(e).find((f,M,b)=>M===b.length-1&&T===f.endTime?f.startTime<=d&&f.endTime>=d:f.startTime<=d&&f.endTime>d))==null?void 0:o.text;return i!=null&&E==null&&(E=""),{mediaPreviewTime:d,mediaPreviewImage:u,mediaPreviewCoords:p,mediaPreviewChapter:E}},[m.MEDIA_PAUSE_REQUEST](t,e){t["mediaPaused"].set(!0,e)},[m.MEDIA_PLAY_REQUEST](t,e){var i,a,r,o;let s="mediaPaused",u=t.mediaStreamType.get(e)===Pe.LIVE,p=!((i=e.options)!=null&&i.noAutoSeekToLive),T=t.mediaTargetLiveWindow.get(e)>0;if(u&&p&&!T){let _=(a=t.mediaSeekable.get(e))==null?void 0:a[1];if(_){let E=(o=(r=e.options)==null?void 0:r.seekToLiveOffset)!=null?o:0,f=_-E;t.mediaCurrentTime.set(f,e)}}t[s].set(!1,e)},[m.MEDIA_PLAYBACK_RATE_REQUEST](t,e,{detail:i}){let a="mediaPlaybackRate",r=i;t[a].set(r,e)},[m.MEDIA_MUTE_REQUEST](t,e){t["mediaMuted"].set(!0,e)},[m.MEDIA_UNMUTE_REQUEST](t,e){let i="mediaMuted";t.mediaVolume.get(e)||t.mediaVolume.set(.25,e),t[i].set(!1,e)},[m.MEDIA_LOOP_REQUEST](t,e,{detail:i}){let a="mediaLoop",r=!!i;return t[a].set(r,e),{mediaLoop:r}},[m.MEDIA_VOLUME_REQUEST](t,e,{detail:i}){let a="mediaVolume",r=i;r&&t.mediaMuted.get(e)&&t.mediaMuted.set(!1,e),t[a].set(r,e)},[m.MEDIA_SEEK_REQUEST](t,e,{detail:i}){let a="mediaCurrentTime",r=i;t[a].set(r,e)},[m.MEDIA_SEEK_TO_LIVE_REQUEST](t,e){var i,a,r;let o="mediaCurrentTime",s=(i=t.mediaSeekable.get(e))==null?void 0:i[1];if(Number.isNaN(Number(s)))return;let d=(r=(a=e.options)==null?void 0:a.seekToLiveOffset)!=null?r:0,u=s-d;t[o].set(u,e)},[m.MEDIA_SHOW_SUBTITLES_REQUEST](t,e,{detail:i}){var a;let{options:r}=e,o=Ni(e),s=Vs(i),d=(a=s[0])==null?void 0:a.language;d&&!r.noSubtitlesLangPref&&l.localStorage.setItem("media-chrome-pref-subtitles-lang",d),Jt(St.SHOWING,o,s)},[m.MEDIA_DISABLE_SUBTITLES_REQUEST](t,e,{detail:i}){let a=Ni(e),r=i!=null?i:[];Jt(St.DISABLED,a,r)},[m.MEDIA_TOGGLE_SUBTITLES_REQUEST](t,e,{detail:i}){xo(e,i)},[m.MEDIA_RENDITION_REQUEST](t,e,{detail:i}){let a="mediaRenditionSelected",r=i;t[a].set(r,e)},[m.MEDIA_AUDIO_TRACK_REQUEST](t,e,{detail:i}){let a="mediaAudioTrackEnabled",r=i;t[a].set(r,e)},[m.MEDIA_ENTER_PIP_REQUEST](t,e){let i="mediaIsPip";t.mediaIsFullscreen.get(e)&&t.mediaIsFullscreen.set(!1,e),t[i].set(!0,e)},[m.MEDIA_EXIT_PIP_REQUEST](t,e){t["mediaIsPip"].set(!1,e)},[m.MEDIA_ENTER_FULLSCREEN_REQUEST](t,e,i){let a="mediaIsFullscreen";t.mediaIsPip.get(e)&&t.mediaIsPip.set(!1,e),t[a].set(!0,e,i)},[m.MEDIA_EXIT_FULLSCREEN_REQUEST](t,e){t["mediaIsFullscreen"].set(!1,e)},[m.MEDIA_ENTER_CAST_REQUEST](t,e){let i="mediaIsCasting";t.mediaIsFullscreen.get(e)&&t.mediaIsFullscreen.set(!1,e),t[i].set(!0,e)},[m.MEDIA_EXIT_CAST_REQUEST](t,e){t["mediaIsCasting"].set(!1,e)},[m.MEDIA_AIRPLAY_REQUEST](t,e){t["mediaIsAirplaying"].set(!0,e)}};var Zu=({media:t,fullscreenElement:e,documentElement:i,stateMediator:a=Pi,requestMap:r=qu,options:o={},monitorStateOwnersOnlyWithSubscriptions:s=!0})=>{let d=[],u={options:{...o}},p=Object.freeze({mediaPreviewTime:void 0,mediaPreviewImage:void 0,mediaPreviewCoords:void 0,mediaPreviewChapter:void 0}),T=b=>{b!=null&&(Do(b,p)||(p=Object.freeze({...p,...b}),d.forEach(C=>C(p))))},_=()=>{let b=Object.entries(a).reduce((C,[L,{get:ie}])=>(C[L]=ie(u),C),{});T(b)},E={},f,M=async(b,C)=>{var L,ie,Ae,kt,mt,Ia,Ma,Ca,La,wa,Ra,xa,Da,Oa,Na,Pa;let so=!!f;if(f={...u,...f!=null?f:{},...b},so)return;await Yu(...Object.values(b));let ht=d.length>0&&C===0&&s,Ua=u.media!==f.media,Ha=((L=u.media)==null?void 0:L.textTracks)!==((ie=f.media)==null?void 0:ie.textTracks),Ba=((Ae=u.media)==null?void 0:Ae.videoRenditions)!==((kt=f.media)==null?void 0:kt.videoRenditions),$a=((mt=u.media)==null?void 0:mt.audioTracks)!==((Ia=f.media)==null?void 0:Ia.audioTracks),Yd=((Ma=u.media)==null?void 0:Ma.remote)!==((Ca=f.media)==null?void 0:Ca.remote),qd=u.documentElement!==f.documentElement,Zd=!!u.media&&(Ua||ht),Qd=!!((La=u.media)!=null&&La.textTracks)&&(Ha||ht),zd=!!((wa=u.media)!=null&&wa.videoRenditions)&&(Ba||ht),Xd=!!((Ra=u.media)!=null&&Ra.audioTracks)&&($a||ht),Jd=!!((xa=u.media)!=null&&xa.remote)&&(Yd||ht),jd=!!u.documentElement&&(qd||ht),Cs=Zd||Qd||zd||Xd||Jd||jd,Ii=d.length===0&&C===1&&s,eu=!!f.media&&(Ua||Ii),tu=!!((Da=f.media)!=null&&Da.textTracks)&&(Ha||Ii),iu=!!((Oa=f.media)!=null&&Oa.videoRenditions)&&(Ba||Ii),au=!!((Na=f.media)!=null&&Na.audioTracks)&&($a||Ii),ru=!!((Pa=f.media)!=null&&Pa.remote)&&(Yd||Ii),ou=!!f.documentElement&&(qd||Ii),nu=eu||tu||iu||au||ru||ou;if(!(Cs||nu)){Object.entries(f).forEach(([F,Wa])=>{u[F]=Wa}),_(),f=void 0;return}Object.entries(a).forEach(([F,{get:Wa,mediaEvents:ch=[],textTracksEvents:mh=[],videoRenditionsEvents:hh=[],audioTracksEvents:ph=[],remoteEvents:fh=[],rootEvents:vh=[],stateOwnersUpdateHandlers:Eh=[]}])=>{E[F]||(E[F]={});let Te=Q=>{let ee=Wa(u,Q);T({[F]:ee})},re;re=E[F].mediaEvents,ch.forEach(Q=>{re&&Zd&&(u.media.removeEventListener(Q,re),E[F].mediaEvents=void 0),eu&&(f.media.addEventListener(Q,Te),E[F].mediaEvents=Te)}),re=E[F].textTracksEvents,mh.forEach(Q=>{var ee,Ne;re&&Qd&&((ee=u.media.textTracks)==null||ee.removeEventListener(Q,re),E[F].textTracksEvents=void 0),tu&&((Ne=f.media.textTracks)==null||Ne.addEventListener(Q,Te),E[F].textTracksEvents=Te)}),re=E[F].videoRenditionsEvents,hh.forEach(Q=>{var ee,Ne;re&&zd&&((ee=u.media.videoRenditions)==null||ee.removeEventListener(Q,re),E[F].videoRenditionsEvents=void 0),iu&&((Ne=f.media.videoRenditions)==null||Ne.addEventListener(Q,Te),E[F].videoRenditionsEvents=Te)}),re=E[F].audioTracksEvents,ph.forEach(Q=>{var ee,Ne;re&&Xd&&((ee=u.media.audioTracks)==null||ee.removeEventListener(Q,re),E[F].audioTracksEvents=void 0),au&&((Ne=f.media.audioTracks)==null||Ne.addEventListener(Q,Te),E[F].audioTracksEvents=Te)}),re=E[F].remoteEvents,fh.forEach(Q=>{var ee,Ne;re&&Jd&&((ee=u.media.remote)==null||ee.removeEventListener(Q,re),E[F].remoteEvents=void 0),ru&&((Ne=f.media.remote)==null||Ne.addEventListener(Q,Te),E[F].remoteEvents=Te)}),re=E[F].rootEvents,vh.forEach(Q=>{re&&jd&&(u.documentElement.removeEventListener(Q,re),E[F].rootEvents=void 0),ou&&(f.documentElement.addEventListener(Q,Te),E[F].rootEvents=Te)});let lo=E[F].stateOwnersUpdateHandlers;if(lo&&Cs&&(Array.isArray(lo)?lo:[lo]).forEach(ee=>{typeof ee=="function"&&ee()}),nu){let Q=Eh.map(ee=>ee(Te,f)).filter(ee=>typeof ee=="function");E[F].stateOwnersUpdateHandlers=Q.length===1?Q[0]:Q}else Cs&&(E[F].stateOwnersUpdateHandlers=void 0)}),Object.entries(f).forEach(([F,Wa])=>{u[F]=Wa}),_(),f=void 0};return M({media:t,fullscreenElement:e,documentElement:i,options:o}),{dispatch(b){let{type:C,detail:L}=b;if(r[C]&&p.mediaErrorCode==null){T(r[C](a,u,b));return}C==="mediaelementchangerequest"?M({media:L}):C==="fullscreenelementchangerequest"?M({fullscreenElement:L}):C==="documentelementchangerequest"?M({documentElement:L}):C==="optionschangerequest"&&(Object.entries(L!=null?L:{}).forEach(([ie,Ae])=>{u.options[ie]=Ae}),_())},getState(){return p},subscribe(b){return M({},d.length+1),d.push(b),b(p),()=>{let C=d.indexOf(b);C>=0&&(M({},d.length-1),d.splice(C,1))}}}};var Js=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},I=(t,e,i)=>(Js(t,e,"read from private field"),i?i.call(t):e.get(t)),Re=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Ke=(t,e,i,a)=>(Js(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Ye=(t,e,i)=>(Js(t,e,"access private method"),i),Lt,ja,U,ti,er,Ge,No,tr,Po,Zs,ii,Ui,Uo,Qs,zs,tc,ic=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"," ","f","m","k","c","l","j",">","<","p"],Qu=10,zu=.025,Xu=.25,rp=.25,op=2,v={DEFAULT_SUBTITLES:"defaultsubtitles",DEFAULT_STREAM_TYPE:"defaultstreamtype",DEFAULT_DURATION:"defaultduration",FULLSCREEN_ELEMENT:"fullscreenelement",HOTKEYS:"hotkeys",KEYBOARD_BACKWARD_SEEK_OFFSET:"keyboardbackwardseekoffset",KEYBOARD_FORWARD_SEEK_OFFSET:"keyboardforwardseekoffset",KEYBOARD_DOWN_VOLUME_STEP:"keyboarddownvolumestep",KEYBOARD_UP_VOLUME_STEP:"keyboardupvolumestep",KEYS_USED:"keysused",LANG:"lang",LOOP:"loop",LIVE_EDGE_OFFSET:"liveedgeoffset",NO_AUTO_SEEK_TO_LIVE:"noautoseektolive",NO_DEFAULT_STORE:"nodefaultstore",NO_HOTKEYS:"nohotkeys",NO_MUTED_PREF:"nomutedpref",NO_SUBTITLES_LANG_PREF:"nosubtitleslangpref",NO_VOLUME_PREF:"novolumepref",SEEK_TO_LIVE_OFFSET:"seektoliveoffset"},Ho=class extends Qt{constructor(){super(),Re(this,Po),Re(this,ii),Re(this,Uo),Re(this,zs),this.mediaStateReceivers=[],this.associatedElementSubscriptions=new Map,Re(this,Lt,new Ct(this,v.HOTKEYS)),Re(this,ja,void 0),Re(this,U,void 0),Re(this,ti,null),Re(this,er,void 0),Re(this,Ge,void 0),Re(this,No,i=>{var a;(a=I(this,U))==null||a.dispatch(i)}),Re(this,tr,void 0),this.associateElement(this);let e={};Ke(this,er,i=>{Object.entries(i).forEach(([a,r])=>{if(a in e&&e[a]===r)return;this.propagateMediaState(a,r);let o=a.toLowerCase(),s=new l.CustomEvent(cu[o],{composed:!0,detail:r});this.dispatchEvent(s)}),e=i}),this.hasAttribute(v.NO_HOTKEYS)?this.disableHotkeys():this.enableHotkeys()}static get observedAttributes(){return super.observedAttributes.concat(v.NO_HOTKEYS,v.HOTKEYS,v.DEFAULT_STREAM_TYPE,v.DEFAULT_SUBTITLES,v.DEFAULT_DURATION,v.NO_MUTED_PREF,v.NO_VOLUME_PREF,v.LANG,v.LOOP)}get mediaStore(){return I(this,U)}set mediaStore(e){var i,a;if(I(this,U)&&((i=I(this,Ge))==null||i.call(this),Ke(this,Ge,void 0)),Ke(this,U,e),!I(this,U)&&!this.hasAttribute(v.NO_DEFAULT_STORE)){Ye(this,Po,Zs).call(this);return}Ke(this,Ge,(a=I(this,U))==null?void 0:a.subscribe(I(this,er)))}get fullscreenElement(){var e;return(e=I(this,ja))!=null?e:this}set fullscreenElement(e){var i;this.hasAttribute(v.FULLSCREEN_ELEMENT)&&this.removeAttribute(v.FULLSCREEN_ELEMENT),Ke(this,ja,e),(i=I(this,U))==null||i.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}get defaultSubtitles(){return k(this,v.DEFAULT_SUBTITLES)}set defaultSubtitles(e){S(this,v.DEFAULT_SUBTITLES,e)}get defaultStreamType(){return w(this,v.DEFAULT_STREAM_TYPE)}set defaultStreamType(e){R(this,v.DEFAULT_STREAM_TYPE,e)}get defaultDuration(){return O(this,v.DEFAULT_DURATION)}set defaultDuration(e){P(this,v.DEFAULT_DURATION,e)}get noHotkeys(){return k(this,v.NO_HOTKEYS)}set noHotkeys(e){S(this,v.NO_HOTKEYS,e)}get keysUsed(){return w(this,v.KEYS_USED)}set keysUsed(e){R(this,v.KEYS_USED,e)}get liveEdgeOffset(){return O(this,v.LIVE_EDGE_OFFSET)}set liveEdgeOffset(e){P(this,v.LIVE_EDGE_OFFSET,e)}get noAutoSeekToLive(){return k(this,v.NO_AUTO_SEEK_TO_LIVE)}set noAutoSeekToLive(e){S(this,v.NO_AUTO_SEEK_TO_LIVE,e)}get noVolumePref(){return k(this,v.NO_VOLUME_PREF)}set noVolumePref(e){S(this,v.NO_VOLUME_PREF,e)}get noMutedPref(){return k(this,v.NO_MUTED_PREF)}set noMutedPref(e){S(this,v.NO_MUTED_PREF,e)}get noSubtitlesLangPref(){return k(this,v.NO_SUBTITLES_LANG_PREF)}set noSubtitlesLangPref(e){S(this,v.NO_SUBTITLES_LANG_PREF,e)}get noDefaultStore(){return k(this,v.NO_DEFAULT_STORE)}set noDefaultStore(e){S(this,v.NO_DEFAULT_STORE,e)}attributeChangedCallback(e,i,a){var r,o,s,d,u,p,T,_,E,f,M,b;if(super.attributeChangedCallback(e,i,a),e===v.NO_HOTKEYS)a!==i&&a===""?(this.hasAttribute(v.HOTKEYS)&&console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."),this.disableHotkeys()):a!==i&&a===null&&this.enableHotkeys();else if(e===v.HOTKEYS)I(this,Lt).value=a;else if(e===v.DEFAULT_SUBTITLES&&a!==i)(r=I(this,U))==null||r.dispatch({type:"optionschangerequest",detail:{defaultSubtitles:this.hasAttribute(v.DEFAULT_SUBTITLES)}});else if(e===v.DEFAULT_STREAM_TYPE)(s=I(this,U))==null||s.dispatch({type:"optionschangerequest",detail:{defaultStreamType:(o=this.getAttribute(v.DEFAULT_STREAM_TYPE))!=null?o:void 0}});else if(e===v.LIVE_EDGE_OFFSET)(d=I(this,U))==null||d.dispatch({type:"optionschangerequest",detail:{liveEdgeOffset:this.hasAttribute(v.LIVE_EDGE_OFFSET)?+this.getAttribute(v.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(v.SEEK_TO_LIVE_OFFSET)?void 0:+this.getAttribute(v.LIVE_EDGE_OFFSET)}});else if(e===v.SEEK_TO_LIVE_OFFSET)(u=I(this,U))==null||u.dispatch({type:"optionschangerequest",detail:{seekToLiveOffset:this.hasAttribute(v.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(v.SEEK_TO_LIVE_OFFSET):void 0}});else if(e===v.NO_AUTO_SEEK_TO_LIVE)(p=I(this,U))==null||p.dispatch({type:"optionschangerequest",detail:{noAutoSeekToLive:this.hasAttribute(v.NO_AUTO_SEEK_TO_LIVE)}});else if(e===v.FULLSCREEN_ELEMENT){let C=a?(T=this.getRootNode())==null?void 0:T.getElementById(a):void 0;Ke(this,ja,C),(_=I(this,U))==null||_.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}else e===v.LANG&&a!==i?(Au(a),(E=I(this,U))==null||E.dispatch({type:"optionschangerequest",detail:{mediaLang:a}})):e===v.LOOP&&a!==i?(f=I(this,U))==null||f.dispatch({type:m.MEDIA_LOOP_REQUEST,detail:a!=null}):e===v.NO_VOLUME_PREF&&a!==i?(M=I(this,U))==null||M.dispatch({type:"optionschangerequest",detail:{noVolumePref:this.hasAttribute(v.NO_VOLUME_PREF)}}):e===v.NO_MUTED_PREF&&a!==i&&((b=I(this,U))==null||b.dispatch({type:"optionschangerequest",detail:{noMutedPref:this.hasAttribute(v.NO_MUTED_PREF)}}))}connectedCallback(){var e,i;!I(this,U)&&!this.hasAttribute(v.NO_DEFAULT_STORE)&&Ye(this,Po,Zs).call(this),(e=I(this,U))==null||e.dispatch({type:"documentelementchangerequest",detail:V}),super.connectedCallback(),I(this,U)&&!I(this,Ge)&&Ke(this,Ge,(i=I(this,U))==null?void 0:i.subscribe(I(this,er))),I(this,tr)!==void 0&&I(this,U)&&this.media&&setTimeout(()=>{var a,r,o;(r=(a=this.media)==null?void 0:a.textTracks)!=null&&r.length&&((o=I(this,U))==null||o.dispatch({type:m.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:I(this,tr)}))},0),this.hasAttribute(v.NO_HOTKEYS)?this.disableHotkeys():this.enableHotkeys()}disconnectedCallback(){var e,i,a,r,o;if((e=super.disconnectedCallback)==null||e.call(this),I(this,U)){let s=I(this,U).getState();Ke(this,tr,!!((i=s.mediaSubtitlesShowing)!=null&&i.length)),(a=I(this,U))==null||a.dispatch({type:"documentelementchangerequest",detail:void 0}),(r=I(this,U))==null||r.dispatch({type:m.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:!1})}I(this,Ge)&&((o=I(this,Ge))==null||o.call(this),Ke(this,Ge,void 0))}mediaSetCallback(e){var i;super.mediaSetCallback(e),(i=I(this,U))==null||i.dispatch({type:"mediaelementchangerequest",detail:e}),e.hasAttribute("tabindex")||(e.tabIndex=-1)}mediaUnsetCallback(e){var i;super.mediaUnsetCallback(e),(i=I(this,U))==null||i.dispatch({type:"mediaelementchangerequest",detail:void 0})}propagateMediaState(e,i){ec(this.mediaStateReceivers,e,i)}associateElement(e){if(!e)return;let{associatedElementSubscriptions:i}=this;if(i.has(e))return;let a=this.registerMediaStateReceiver.bind(this),r=this.unregisterMediaStateReceiver.bind(this),o=cp(e,a,r);Object.values(m).forEach(s=>{e.addEventListener(s,I(this,No))}),i.set(e,o)}unassociateElement(e){if(!e)return;let{associatedElementSubscriptions:i}=this;if(!i.has(e))return;i.get(e)(),i.delete(e),Object.values(m).forEach(r=>{e.removeEventListener(r,I(this,No))})}registerMediaStateReceiver(e){if(!e)return;let i=this.mediaStateReceivers;i.indexOf(e)>-1||(i.push(e),I(this,U)&&Object.entries(I(this,U).getState()).forEach(([r,o])=>{ec([e],r,o)}))}unregisterMediaStateReceiver(e){let i=this.mediaStateReceivers,a=i.indexOf(e);a<0||i.splice(a,1)}enableHotkeys(){this.addEventListener("keydown",Ye(this,Uo,Qs))}disableHotkeys(){this.removeEventListener("keydown",Ye(this,Uo,Qs)),this.removeEventListener("keyup",Ye(this,ii,Ui))}get hotkeys(){return w(this,v.HOTKEYS)}set hotkeys(e){R(this,v.HOTKEYS,e)}keyboardShortcutHandler(e){var i,a,r,o,s,d,u,p,T;let _=e.target;if(((r=(a=(i=_.getAttribute(v.KEYS_USED))==null?void 0:i.split(" "))!=null?a:_==null?void 0:_.keysUsed)!=null?r:[]).map(L=>L==="Space"?" ":L).filter(Boolean).includes(e.key))return;let f,M,b;if(!(I(this,Lt).contains(`no${e.key.toLowerCase()}`)||e.key===" "&&I(this,Lt).contains("nospace")||e.shiftKey&&(e.key==="/"||e.key==="?")&&I(this,Lt).contains("noshift+/")))switch(e.key){case" ":case"k":f=I(this,U).getState().mediaPaused?m.MEDIA_PLAY_REQUEST:m.MEDIA_PAUSE_REQUEST,this.dispatchEvent(new l.CustomEvent(f,{composed:!0,bubbles:!0}));break;case"m":f=this.mediaStore.getState().mediaVolumeLevel==="off"?m.MEDIA_UNMUTE_REQUEST:m.MEDIA_MUTE_REQUEST,this.dispatchEvent(new l.CustomEvent(f,{composed:!0,bubbles:!0}));break;case"f":f=this.mediaStore.getState().mediaIsFullscreen?m.MEDIA_EXIT_FULLSCREEN_REQUEST:m.MEDIA_ENTER_FULLSCREEN_REQUEST,this.dispatchEvent(new l.CustomEvent(f,{composed:!0,bubbles:!0}));break;case"c":this.dispatchEvent(new l.CustomEvent(m.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}));break;case"ArrowLeft":case"j":{let L=this.hasAttribute(v.KEYBOARD_BACKWARD_SEEK_OFFSET)?+this.getAttribute(v.KEYBOARD_BACKWARD_SEEK_OFFSET):Qu;M=Math.max(((o=this.mediaStore.getState().mediaCurrentTime)!=null?o:0)-L,0),b=new l.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:M}),this.dispatchEvent(b);break}case"ArrowRight":case"l":{let L=this.hasAttribute(v.KEYBOARD_FORWARD_SEEK_OFFSET)?+this.getAttribute(v.KEYBOARD_FORWARD_SEEK_OFFSET):Qu;M=Math.max(((s=this.mediaStore.getState().mediaCurrentTime)!=null?s:0)+L,0),b=new l.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:M}),this.dispatchEvent(b);break}case"ArrowUp":{let L=this.hasAttribute(v.KEYBOARD_UP_VOLUME_STEP)?+this.getAttribute(v.KEYBOARD_UP_VOLUME_STEP):zu;M=Math.min(((d=this.mediaStore.getState().mediaVolume)!=null?d:1)+L,1),b=new l.CustomEvent(m.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:M}),this.dispatchEvent(b);break}case"ArrowDown":{let L=this.hasAttribute(v.KEYBOARD_DOWN_VOLUME_STEP)?+this.getAttribute(v.KEYBOARD_DOWN_VOLUME_STEP):zu;M=Math.max(((u=this.mediaStore.getState().mediaVolume)!=null?u:1)-L,0),b=new l.CustomEvent(m.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:M}),this.dispatchEvent(b);break}case"<":{let L=(p=this.mediaStore.getState().mediaPlaybackRate)!=null?p:1;M=Math.max(L-Xu,rp).toFixed(2),b=new l.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:M}),this.dispatchEvent(b);break}case">":{let L=(T=this.mediaStore.getState().mediaPlaybackRate)!=null?T:1;M=Math.min(L+Xu,op).toFixed(2),b=new l.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:M}),this.dispatchEvent(b);break}case"/":case"?":{e.shiftKey&&Ye(this,zs,tc).call(this);break}case"p":{f=this.mediaStore.getState().mediaIsPip?m.MEDIA_EXIT_PIP_REQUEST:m.MEDIA_ENTER_PIP_REQUEST,b=new l.CustomEvent(f,{composed:!0,bubbles:!0}),this.dispatchEvent(b);break}default:break}}};Lt=new WeakMap;ja=new WeakMap;U=new WeakMap;ti=new WeakMap;er=new WeakMap;Ge=new WeakMap;No=new WeakMap;tr=new WeakMap;Po=new WeakSet;Zs=function(){var t;this.mediaStore=Zu({media:this.media,fullscreenElement:this.fullscreenElement,options:{defaultSubtitles:this.hasAttribute(v.DEFAULT_SUBTITLES),defaultDuration:this.hasAttribute(v.DEFAULT_DURATION)?+this.getAttribute(v.DEFAULT_DURATION):void 0,defaultStreamType:(t=this.getAttribute(v.DEFAULT_STREAM_TYPE))!=null?t:void 0,liveEdgeOffset:this.hasAttribute(v.LIVE_EDGE_OFFSET)?+this.getAttribute(v.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(v.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(v.SEEK_TO_LIVE_OFFSET):this.hasAttribute(v.LIVE_EDGE_OFFSET)?+this.getAttribute(v.LIVE_EDGE_OFFSET):void 0,noAutoSeekToLive:this.hasAttribute(v.NO_AUTO_SEEK_TO_LIVE),noVolumePref:this.hasAttribute(v.NO_VOLUME_PREF),noMutedPref:this.hasAttribute(v.NO_MUTED_PREF),noSubtitlesLangPref:this.hasAttribute(v.NO_SUBTITLES_LANG_PREF)}})};ii=new WeakSet;Ui=function(t){let{key:e,shiftKey:i}=t;if(!(i&&(e==="/"||e==="?")||ic.includes(e))){this.removeEventListener("keyup",Ye(this,ii,Ui));return}this.keyboardShortcutHandler(t)};Uo=new WeakSet;Qs=function(t){var e;let{metaKey:i,altKey:a,key:r,shiftKey:o}=t,s=o&&(r==="/"||r==="?");if(s&&((e=I(this,ti))!=null&&e.open)){this.removeEventListener("keyup",Ye(this,ii,Ui));return}if(i||a||!s&&!ic.includes(r)){this.removeEventListener("keyup",Ye(this,ii,Ui));return}let d=t.target,u=d instanceof HTMLElement&&(d.tagName.toLowerCase()==="media-volume-range"||d.tagName.toLowerCase()==="media-time-range");[" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(r)&&!(I(this,Lt).contains(`no${r.toLowerCase()}`)||r===" "&&I(this,Lt).contains("nospace"))&&!u&&t.preventDefault(),this.addEventListener("keyup",Ye(this,ii,Ui),{once:!0})};zs=new WeakSet;tc=function(){I(this,ti)||(Ke(this,ti,V.createElement("media-keyboard-shortcuts-dialog")),this.appendChild(I(this,ti))),I(this,ti).open=!0};var np=Object.values(n),sp=Object.values(Ds),ac=t=>{var e,i,a,r;let{observedAttributes:o}=t.constructor;!o&&((e=t.nodeName)!=null&&e.includes("-"))&&(l.customElements.upgrade(t),{observedAttributes:o}=t.constructor);let s=(r=(a=(i=t==null?void 0:t.getAttribute)==null?void 0:i.call(t,x.MEDIA_CHROME_ATTRIBUTES))==null?void 0:a.split)==null?void 0:r.call(a,/\s+/);return Array.isArray(o||s)?(o||s).filter(d=>np.includes(d)):[]},lp=t=>{var e,i;return(e=t.nodeName)!=null&&e.includes("-")&&l.customElements.get((i=t.nodeName)==null?void 0:i.toLowerCase())&&!(t instanceof l.customElements.get(t.nodeName.toLowerCase()))&&l.customElements.upgrade(t),sp.some(a=>a in t)},Xs=t=>lp(t)||!!ac(t).length,Ju=t=>{var e;return(e=t==null?void 0:t.join)==null?void 0:e.call(t,":")},ju={[n.MEDIA_SUBTITLES_LIST]:Et,[n.MEDIA_SUBTITLES_SHOWING]:Et,[n.MEDIA_SEEKABLE]:Ju,[n.MEDIA_BUFFERED]:t=>t==null?void 0:t.map(Ju).join(" "),[n.MEDIA_PREVIEW_COORDS]:t=>t==null?void 0:t.join(" "),[n.MEDIA_RENDITION_LIST]:hu,[n.MEDIA_AUDIO_TRACK_LIST]:fu},dp=async(t,e,i)=>{var a,r;if(t.isConnected||await mo(0),typeof i=="boolean"||i==null)return S(t,e,i);if(typeof i=="number")return P(t,e,i);if(typeof i=="string")return R(t,e,i);if(Array.isArray(i)&&!i.length)return t.removeAttribute(e);let o=(r=(a=ju[e])==null?void 0:a.call(ju,i))!=null?r:i;return t.setAttribute(e,o)},up=t=>{var e;return!!((e=t.closest)!=null&&e.call(t,'*[slot="media"]'))},ei=(t,e)=>{if(up(t))return;let i=(r,o)=>{var s,d;Xs(r)&&o(r);let{children:u=[]}=r!=null?r:{},p=(d=(s=r==null?void 0:r.shadowRoot)==null?void 0:s.children)!=null?d:[];[...u,...p].forEach(_=>ei(_,o))},a=t==null?void 0:t.nodeName.toLowerCase();if(a.includes("-")&&!Xs(t)){l.customElements.whenDefined(a).then(()=>{i(t,e)});return}i(t,e)},ec=(t,e,i)=>{t.forEach(a=>{if(e in a){a[e]=i;return}let r=ac(a),o=e.toLowerCase();r.includes(o)&&dp(a,o,i)})},cp=(t,e,i)=>{ei(t,e);let a=T=>{var _;let E=(_=T==null?void 0:T.composedPath()[0])!=null?_:T.target;e(E)},r=T=>{var _;let E=(_=T==null?void 0:T.composedPath()[0])!=null?_:T.target;i(E)};t.addEventListener(m.REGISTER_MEDIA_STATE_RECEIVER,a),t.addEventListener(m.UNREGISTER_MEDIA_STATE_RECEIVER,r);let o=T=>{T.forEach(_=>{let{addedNodes:E=[],removedNodes:f=[],type:M,target:b,attributeName:C}=_;M==="childList"?(Array.prototype.forEach.call(E,L=>ei(L,e)),Array.prototype.forEach.call(f,L=>ei(L,i))):M==="attributes"&&C===x.MEDIA_CHROME_ATTRIBUTES&&(Xs(b)?e(b):i(b))})},s=[],d=T=>{let _=T.target;_.name!=="media"&&(s.forEach(E=>ei(E,i)),s=[..._.assignedElements({flatten:!0})],s.forEach(E=>ei(E,e)))};t.addEventListener("slotchange",d);let u=new MutationObserver(o);return u.observe(t,{childList:!0,attributes:!0,subtree:!0}),()=>{ei(t,i),t.removeEventListener("slotchange",d),u.disconnect(),t.removeEventListener(m.REGISTER_MEDIA_STATE_RECEIVER,a),t.removeEventListener(m.UNREGISTER_MEDIA_STATE_RECEIVER,r)}};l.customElements.get("media-controller")||l.customElements.define("media-controller",Ho);var js=Ho;var Hi={PLACEMENT:"placement",BOUNDS:"bounds"};function mp(t){return`
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `}var Bi=class extends l.HTMLElement{constructor(){if(super(),this.updateXOffset=()=>{var e;if(!go(this,{checkOpacity:!1,checkVisibilityCSS:!1}))return;let i=this.placement;if(i==="left"||i==="right"){this.style.removeProperty("--media-tooltip-offset-x");return}let a=getComputedStyle(this),r=(e=Ve(this,"#"+this.bounds))!=null?e:Y(this);if(!r)return;let{x:o,width:s}=r.getBoundingClientRect(),{x:d,width:u}=this.getBoundingClientRect(),p=d+u,T=o+s,_=a.getPropertyValue("--media-tooltip-offset-x"),E=_?parseFloat(_.replace("px","")):0,f=a.getPropertyValue("--media-tooltip-container-margin"),M=f?parseFloat(f.replace("px","")):0,b=d-o+E-M,C=p-T+E+M;if(b<0){this.style.setProperty("--media-tooltip-offset-x",`${b}px`);return}if(C>0){this.style.setProperty("--media-tooltip-offset-x",`${C}px`);return}this.style.removeProperty("--media-tooltip-offset-x")},!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}if(this.arrowEl=this.shadowRoot.querySelector("#arrow"),Object.prototype.hasOwnProperty.call(this,"placement")){let e=this.placement;delete this.placement,this.placement=e}}static get observedAttributes(){return[Hi.PLACEMENT,Hi.BOUNDS]}get placement(){return w(this,Hi.PLACEMENT)}set placement(e){R(this,Hi.PLACEMENT,e)}get bounds(){return w(this,Hi.BOUNDS)}set bounds(e){R(this,Hi.BOUNDS,e)}};Bi.shadowRootOptions={mode:"open"};Bi.getTemplateHTML=mp;l.customElements.get("media-tooltip")||l.customElements.define("media-tooltip",Bi);var Bo=Bi;var tl=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},te=(t,e,i)=>(tl(t,e,"read from private field"),i?i.call(t):e.get(t)),$i=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},$o=(t,e,i,a)=>(tl(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),hp=(t,e,i)=>(tl(t,e,"access private method"),i),qe,Fi,Rt,Wi,Wo,el,rc,wt={TOOLTIP_PLACEMENT:"tooltipplacement",DISABLED:"disabled",NO_TOOLTIP:"notooltip"};function pp(t,e={}){return`
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }
      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(t,e)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${Bo.shadowRootOptions.mode}">
          ${Bo.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(t)}
        </slot>
      </media-tooltip>
    </slot>
  `}function fp(t,e){return`
    <slot></slot>
  `}function vp(){return""}var H=class extends l.HTMLElement{constructor(){if(super(),$i(this,el),$i(this,qe,void 0),this.preventClick=!1,this.tooltipEl=null,$i(this,Fi,e=>{this.preventClick||this.handleClick(e),setTimeout(te(this,Rt),0)}),$i(this,Rt,()=>{var e,i;(i=(e=this.tooltipEl)==null?void 0:e.updateXOffset)==null||i.call(e)}),$i(this,Wi,e=>{let{key:i}=e;if(!this.keysUsed.includes(i)){this.removeEventListener("keyup",te(this,Wi));return}this.preventClick||this.handleClick(e)}),$i(this,Wo,e=>{let{metaKey:i,altKey:a,key:r}=e;if(i||a||!this.keysUsed.includes(r)){this.removeEventListener("keyup",te(this,Wi));return}this.addEventListener("keyup",te(this,Wi),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes),i=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(i):this.shadowRoot.innerHTML=i}this.tooltipEl=this.shadowRoot.querySelector("media-tooltip")}static get observedAttributes(){return["disabled",wt.TOOLTIP_PLACEMENT,x.MEDIA_CONTROLLER,n.MEDIA_LANG]}enable(){this.addEventListener("click",te(this,Fi)),this.addEventListener("keydown",te(this,Wo)),this.tabIndex=0}disable(){this.removeEventListener("click",te(this,Fi)),this.removeEventListener("keydown",te(this,Wo)),this.removeEventListener("keyup",te(this,Wi)),this.tabIndex=-1}attributeChangedCallback(e,i,a){var r,o,s,d,u;e===x.MEDIA_CONTROLLER?(i&&((o=(r=te(this,qe))==null?void 0:r.unassociateElement)==null||o.call(r,this),$o(this,qe,null)),a&&this.isConnected&&($o(this,qe,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=te(this,qe))==null?void 0:d.associateElement)==null||u.call(d,this))):e==="disabled"&&a!==i?a==null?this.enable():this.disable():e===wt.TOOLTIP_PLACEMENT&&this.tooltipEl&&a!==i?this.tooltipEl.placement=a:e===n.MEDIA_LANG&&(this.shadowRoot.querySelector('slot[name="tooltip-content"]').innerHTML=this.constructor.getTooltipContentHTML()),te(this,Rt).call(this)}connectedCallback(){var e,i,a;let{style:r}=q(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),this.hasAttribute("disabled")?this.disable():this.enable(),this.setAttribute("role","button");let o=this.getAttribute(x.MEDIA_CONTROLLER);o&&($o(this,qe,(e=this.getRootNode())==null?void 0:e.getElementById(o)),(a=(i=te(this,qe))==null?void 0:i.associateElement)==null||a.call(i,this)),l.customElements.whenDefined("media-tooltip").then(()=>hp(this,el,rc).call(this))}disconnectedCallback(){var e,i;this.disable(),(i=(e=te(this,qe))==null?void 0:e.unassociateElement)==null||i.call(e,this),$o(this,qe,null),this.removeEventListener("mouseenter",te(this,Rt)),this.removeEventListener("focus",te(this,Rt)),this.removeEventListener("click",te(this,Fi))}get keysUsed(){return["Enter"," "]}get tooltipPlacement(){return w(this,wt.TOOLTIP_PLACEMENT)}set tooltipPlacement(e){R(this,wt.TOOLTIP_PLACEMENT,e)}get mediaController(){return w(this,x.MEDIA_CONTROLLER)}set mediaController(e){R(this,x.MEDIA_CONTROLLER,e)}get disabled(){return k(this,wt.DISABLED)}set disabled(e){S(this,wt.DISABLED,e)}get noTooltip(){return k(this,wt.NO_TOOLTIP)}set noTooltip(e){S(this,wt.NO_TOOLTIP,e)}handleClick(e){}};qe=new WeakMap;Fi=new WeakMap;Rt=new WeakMap;Wi=new WeakMap;Wo=new WeakMap;el=new WeakSet;rc=function(){this.addEventListener("mouseenter",te(this,Rt)),this.addEventListener("focus",te(this,Rt)),this.addEventListener("click",te(this,Fi));let t=this.tooltipPlacement;t&&this.tooltipEl&&(this.tooltipEl.placement=t)};H.shadowRootOptions={mode:"open"};H.getTemplateHTML=pp;H.getSlotTemplateHTML=fp;H.getTooltipContentHTML=vp;l.customElements.get("media-chrome-button")||l.customElements.define("media-chrome-button",H);var oc=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`;function Ep(t){return`
    <style>
      :host([${n.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${n.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${n.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${n.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${oc}</slot>
      <slot name="exit">${oc}</slot>
    </slot>
  `}function bp(){return`
    <slot name="tooltip-enter">${h("start airplay")}</slot>
    <slot name="tooltip-exit">${h("stop airplay")}</slot>
  `}var nc=t=>{let e=t.mediaIsAirplaying?h("stop airplay"):h("start airplay");t.setAttribute("aria-label",e)},ir=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_IS_AIRPLAYING,n.MEDIA_AIRPLAY_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),nc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_IS_AIRPLAYING&&nc(this)}get mediaIsAirplaying(){return k(this,n.MEDIA_IS_AIRPLAYING)}set mediaIsAirplaying(e){S(this,n.MEDIA_IS_AIRPLAYING,e)}get mediaAirplayUnavailable(){return w(this,n.MEDIA_AIRPLAY_UNAVAILABLE)}set mediaAirplayUnavailable(e){R(this,n.MEDIA_AIRPLAY_UNAVAILABLE,e)}handleClick(){let e=new l.CustomEvent(m.MEDIA_AIRPLAY_REQUEST,{composed:!0,bubbles:!0});this.dispatchEvent(e)}};ir.getSlotTemplateHTML=Ep;ir.getTooltipContentHTML=bp;l.customElements.get("media-airplay-button")||l.customElements.define("media-airplay-button",ir);var gp=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,_p=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function Ap(t){return`
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${gp}</slot>
      <slot name="off">${_p}</slot>
    </slot>
  `}function Tp(){return`
    <slot name="tooltip-enable">${h("Enable captions")}</slot>
    <slot name="tooltip-disable">${h("Disable captions")}</slot>
  `}var sc=t=>{t.setAttribute("aria-checked",wo(t).toString())},ar=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_SUBTITLES_LIST,n.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute("role","switch"),this.setAttribute("aria-label",h("closed captions")),sc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_SUBTITLES_SHOWING&&sc(this)}get mediaSubtitlesList(){return lc(this,n.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){dc(this,n.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return lc(this,n.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){dc(this,n.MEDIA_SUBTITLES_SHOWING,e)}handleClick(){this.dispatchEvent(new l.CustomEvent(m.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}))}};ar.getSlotTemplateHTML=Ap;ar.getTooltipContentHTML=Tp;var lc=(t,e)=>{let i=t.getAttribute(e);return i?Xt(i):[]},dc=(t,e,i)=>{if(!(i!=null&&i.length)){t.removeAttribute(e);return}let a=Et(i);t.getAttribute(e)!==a&&t.setAttribute(e,a)};l.customElements.get("media-captions-button")||l.customElements.define("media-captions-button",ar);var yp='<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg>',kp='<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg>';function Sp(t){return`
    <style>
      :host([${n.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${n.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${n.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${n.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${yp}</slot>
      <slot name="exit">${kp}</slot>
    </slot>
  `}function Ip(){return`
    <slot name="tooltip-enter">${h("Start casting")}</slot>
    <slot name="tooltip-exit">${h("Stop casting")}</slot>
  `}var uc=t=>{let e=t.mediaIsCasting?h("stop casting"):h("start casting");t.setAttribute("aria-label",e)},rr=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_IS_CASTING,n.MEDIA_CAST_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),uc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_IS_CASTING&&uc(this)}get mediaIsCasting(){return k(this,n.MEDIA_IS_CASTING)}set mediaIsCasting(e){S(this,n.MEDIA_IS_CASTING,e)}get mediaCastUnavailable(){return w(this,n.MEDIA_CAST_UNAVAILABLE)}set mediaCastUnavailable(e){R(this,n.MEDIA_CAST_UNAVAILABLE,e)}handleClick(){let e=this.mediaIsCasting?m.MEDIA_EXIT_CAST_REQUEST:m.MEDIA_ENTER_CAST_REQUEST;this.dispatchEvent(new l.CustomEvent(e,{composed:!0,bubbles:!0}))}};rr.getSlotTemplateHTML=Sp;rr.getTooltipContentHTML=Ip;l.customElements.get("media-cast-button")||l.customElements.define("media-cast-button",rr);var ll=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},ri=(t,e,i)=>(ll(t,e,"read from private field"),i?i.call(t):e.get(t)),bt=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},dl=(t,e,i,a)=>(ll(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),ai=(t,e,i)=>(ll(t,e,"access private method"),i),Vo,nr,oi,Fo,il,al,cc,rl,mc,ol,hc,nl,pc,sl,fc;function Mp(t){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(t)}
  `}function Cp(t){return`
    <slot id="content"></slot>
  `}var or={OPEN:"open",ANCHOR:"anchor"},Ze=class extends l.HTMLElement{constructor(){super(),bt(this,Fo),bt(this,al),bt(this,rl),bt(this,ol),bt(this,nl),bt(this,sl),bt(this,Vo,!1),bt(this,nr,null),bt(this,oi,null),this.addEventListener("invoke",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this)}static get observedAttributes(){return[or.OPEN,or.ANCHOR]}get open(){return k(this,or.OPEN)}set open(e){S(this,or.OPEN,e)}handleEvent(e){switch(e.type){case"invoke":ai(this,ol,hc).call(this,e);break;case"focusout":ai(this,nl,pc).call(this,e);break;case"keydown":ai(this,sl,fc).call(this,e);break}}connectedCallback(){ai(this,Fo,il).call(this),this.role||(this.role="dialog")}attributeChangedCallback(e,i,a){ai(this,Fo,il).call(this),e===or.OPEN&&a!==i&&(this.open?ai(this,al,cc).call(this):ai(this,rl,mc).call(this))}focus(){dl(this,nr,Ga());let e=!this.dispatchEvent(new Event("focus",{composed:!0,cancelable:!0})),i=!this.dispatchEvent(new Event("focusin",{composed:!0,bubbles:!0,cancelable:!0}));if(e||i)return;let a=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');a==null||a.focus()}get keysUsed(){return["Escape","Tab"]}};Vo=new WeakMap;nr=new WeakMap;oi=new WeakMap;Fo=new WeakSet;il=function(){if(!ri(this,Vo)&&(dl(this,Vo,!0),!this.shadowRoot)){this.attachShadow(this.constructor.shadowRootOptions);let t=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t),queueMicrotask(()=>{let{style:e}=q(this.shadowRoot,":host");e.setProperty("transition","display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in")})}};al=new WeakSet;cc=function(){var t;(t=ri(this,oi))==null||t.setAttribute("aria-expanded","true"),this.dispatchEvent(new Event("open",{composed:!0,bubbles:!0})),this.addEventListener("transitionend",()=>this.focus(),{once:!0})};rl=new WeakSet;mc=function(){var t;(t=ri(this,oi))==null||t.setAttribute("aria-expanded","false"),this.dispatchEvent(new Event("close",{composed:!0,bubbles:!0}))};ol=new WeakSet;hc=function(t){dl(this,oi,t.relatedTarget),ue(this,t.relatedTarget)||(this.open=!this.open)};nl=new WeakSet;pc=function(t){var e;ue(this,t.relatedTarget)||((e=ri(this,nr))==null||e.focus(),ri(this,oi)&&ri(this,oi)!==t.relatedTarget&&this.open&&(this.open=!1))};sl=new WeakSet;fc=function(t){var e,i,a,r,o;let{key:s,ctrlKey:d,altKey:u,metaKey:p}=t;d||u||p||this.keysUsed.includes(s)&&(t.preventDefault(),t.stopPropagation(),s==="Tab"?(t.shiftKey?(i=(e=this.previousElementSibling)==null?void 0:e.focus)==null||i.call(e):(r=(a=this.nextElementSibling)==null?void 0:a.focus)==null||r.call(a),this.blur()):s==="Escape"&&((o=ri(this,nr))==null||o.focus(),this.open=!1))};Ze.shadowRootOptions={mode:"open"};Ze.getTemplateHTML=Mp;Ze.getSlotTemplateHTML=Cp;l.customElements.get("media-chrome-dialog")||l.customElements.define("media-chrome-dialog",Ze);var vl=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},z=(t,e,i)=>(vl(t,e,"read from private field"),i?i.call(t):e.get(t)),se=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},xt=(t,e,i,a)=>(vl(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),He=(t,e,i)=>(vl(t,e,"access private method"),i),Qe,jo,Ko,Go,Be,Xo,Yo,qo,Zo,El,vc,Qo,ul,zo,cl,Jo,bl,ml,Ec,hl,bc,pl,gc,fl,_c;function Lp(t){return`
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; 
      }

      
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, -7px);
        height: var(--media-time-range-hover-height, max(100% + 7px, 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; 
        -webkit-tap-highlight-color: transparent;
        background: transparent; 
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, -5px);
          height: var(--media-time-range-hover-height, max(100% + 5px, 20px));
        }
      }

      
      
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
      <input id="range" type="range" min="0" max="1" step="any" value="0">

      ${this.getContainerTemplateHTML(t)}
    </div>
    <div id="rightgap"></div>
  `}function wp(t){return""}var ze=class extends l.HTMLElement{constructor(){if(super(),se(this,El),se(this,Qo),se(this,zo),se(this,Jo),se(this,ml),se(this,hl),se(this,pl),se(this,fl),se(this,Qe,void 0),se(this,jo,void 0),se(this,Ko,void 0),se(this,Go,void 0),se(this,Be,{}),se(this,Xo,[]),se(this,Yo,()=>{if(this.range.matches(":focus-visible")){let{style:e}=q(this.shadowRoot,":host");e.setProperty("--_focus-visible-box-shadow","var(--_focus-box-shadow)")}}),se(this,qo,()=>{let{style:e}=q(this.shadowRoot,":host");e.removeProperty("--_focus-visible-box-shadow")}),se(this,Zo,()=>{let e=this.shadowRoot.querySelector("#segments-clipping");e&&e.parentNode.append(e)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes),i=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(i):this.shadowRoot.innerHTML=i}this.container=this.shadowRoot.querySelector("#container"),xt(this,Ko,this.shadowRoot.querySelector("#startpoint")),xt(this,Go,this.shadowRoot.querySelector("#endpoint")),this.range=this.shadowRoot.querySelector("#range"),this.appearance=this.shadowRoot.querySelector("#appearance")}static get observedAttributes(){return["disabled","aria-disabled",x.MEDIA_CONTROLLER]}attributeChangedCallback(e,i,a){var r,o,s,d,u;e===x.MEDIA_CONTROLLER?(i&&((o=(r=z(this,Qe))==null?void 0:r.unassociateElement)==null||o.call(r,this),xt(this,Qe,null)),a&&this.isConnected&&(xt(this,Qe,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=z(this,Qe))==null?void 0:d.associateElement)==null||u.call(d,this))):(e==="disabled"||e==="aria-disabled"&&i!==a)&&(a==null?(this.range.removeAttribute(e),He(this,Qo,ul).call(this)):(this.range.setAttribute(e,a),He(this,zo,cl).call(this)))}connectedCallback(){var e,i,a;let{style:r}=q(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),z(this,Be).pointer=q(this.shadowRoot,"#pointer"),z(this,Be).progress=q(this.shadowRoot,"#progress"),z(this,Be).thumb=q(this.shadowRoot,'#thumb, ::slotted([slot="thumb"])'),z(this,Be).activeSegment=q(this.shadowRoot,"#segments-clipping rect:nth-child(0)");let o=this.getAttribute(x.MEDIA_CONTROLLER);o&&(xt(this,Qe,(e=this.getRootNode())==null?void 0:e.getElementById(o)),(a=(i=z(this,Qe))==null?void 0:i.associateElement)==null||a.call(i,this)),this.updateBar(),this.shadowRoot.addEventListener("focusin",z(this,Yo)),this.shadowRoot.addEventListener("focusout",z(this,qo)),He(this,Qo,ul).call(this),pt(this.container,z(this,Zo))}disconnectedCallback(){var e,i;He(this,zo,cl).call(this),(i=(e=z(this,Qe))==null?void 0:e.unassociateElement)==null||i.call(e,this),xt(this,Qe,null),this.shadowRoot.removeEventListener("focusin",z(this,Yo)),this.shadowRoot.removeEventListener("focusout",z(this,qo)),ft(this.container,z(this,Zo))}updatePointerBar(e){var i;(i=z(this,Be).pointer)==null||i.style.setProperty("width",`${this.getPointerRatio(e)*100}%`)}updateBar(){var e,i;let a=this.range.valueAsNumber*100;(e=z(this,Be).progress)==null||e.style.setProperty("width",`${a}%`),(i=z(this,Be).thumb)==null||i.style.setProperty("left",`${a}%`)}updateSegments(e){let i=this.shadowRoot.querySelector("#segments-clipping");if(i.textContent="",this.container.classList.toggle("segments",!!(e!=null&&e.length)),!(e!=null&&e.length))return;let a=[...new Set([+this.range.min,...e.flatMap(o=>[o.start,o.end]),+this.range.max])];xt(this,Xo,[...a]);let r=a.pop();for(let[o,s]of a.entries()){let[d,u]=[o===0,o===a.length-1],p=d?"calc(var(--segments-gap) / -1)":`${s*100}%`,_=`calc(${((u?r:a[o+1])-s)*100}%${d||u?"":" - var(--segments-gap)"})`,E=V.createElementNS("http://www.w3.org/2000/svg","rect"),f=Ya(this.shadowRoot,`#segments-clipping rect:nth-child(${o+1})`);f.style.setProperty("x",p),f.style.setProperty("width",_),i.append(E)}}getPointerRatio(e){return Mu(e.clientX,e.clientY,z(this,Ko).getBoundingClientRect(),z(this,Go).getBoundingClientRect())}get dragging(){return this.hasAttribute("dragging")}handleEvent(e){switch(e.type){case"pointermove":He(this,fl,_c).call(this,e);break;case"input":this.updateBar();break;case"pointerenter":He(this,ml,Ec).call(this,e);break;case"pointerdown":He(this,Jo,bl).call(this,e);break;case"pointerup":He(this,hl,bc).call(this);break;case"pointerleave":He(this,pl,gc).call(this);break}}get keysUsed(){return["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]}};Qe=new WeakMap;jo=new WeakMap;Ko=new WeakMap;Go=new WeakMap;Be=new WeakMap;Xo=new WeakMap;Yo=new WeakMap;qo=new WeakMap;Zo=new WeakMap;El=new WeakSet;vc=function(t){let e=z(this,Be).activeSegment;if(!e)return;let i=this.getPointerRatio(t),r=`#segments-clipping rect:nth-child(${z(this,Xo).findIndex((o,s,d)=>{let u=d[s+1];return u!=null&&i>=o&&i<=u})+1})`;(e.selectorText!=r||!e.style.transform)&&(e.selectorText=r,e.style.setProperty("transform","var(--media-range-segment-hover-transform, scaleY(2))"))};Qo=new WeakSet;ul=function(){this.hasAttribute("disabled")||(this.addEventListener("input",this),this.addEventListener("pointerdown",this),this.addEventListener("pointerenter",this))};zo=new WeakSet;cl=function(){var t,e;this.removeEventListener("input",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointerenter",this),(t=l.window)==null||t.removeEventListener("pointerup",this),(e=l.window)==null||e.removeEventListener("pointermove",this)};Jo=new WeakSet;bl=function(t){var e;xt(this,jo,t.composedPath().includes(this.range)),(e=l.window)==null||e.addEventListener("pointerup",this)};ml=new WeakSet;Ec=function(t){var e;t.pointerType!=="mouse"&&He(this,Jo,bl).call(this,t),this.addEventListener("pointerleave",this),(e=l.window)==null||e.addEventListener("pointermove",this)};hl=new WeakSet;bc=function(){var t;(t=l.window)==null||t.removeEventListener("pointerup",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled")};pl=new WeakSet;gc=function(){var t,e;this.removeEventListener("pointerleave",this),(t=l.window)==null||t.removeEventListener("pointermove",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled"),(e=z(this,Be).activeSegment)==null||e.style.removeProperty("transform")};fl=new WeakSet;_c=function(t){t.pointerType==="pen"&&t.buttons===0||(this.toggleAttribute("dragging",t.buttons===1||t.pointerType!=="mouse"),this.updatePointerBar(t),He(this,El,vc).call(this,t),this.dragging&&(t.pointerType!=="mouse"||!z(this,jo))&&(this.range.disabled=!0,this.range.valueAsNumber=this.getPointerRatio(t),this.range.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))))};ze.shadowRootOptions={mode:"open"};ze.getTemplateHTML=Lp;ze.getContainerTemplateHTML=wp;l.customElements.get("media-chrome-range")||l.customElements.define("media-chrome-range",ze);var Ac=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},en=(t,e,i)=>(Ac(t,e,"read from private field"),i?i.call(t):e.get(t)),Rp=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},tn=(t,e,i,a)=>(Ac(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Xe;function xp(t){return`
    <style>
      :host {
        
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `}var sr=class extends l.HTMLElement{constructor(){if(super(),Rp(this,Xe,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[x.MEDIA_CONTROLLER]}attributeChangedCallback(e,i,a){var r,o,s,d,u;e===x.MEDIA_CONTROLLER&&(i&&((o=(r=en(this,Xe))==null?void 0:r.unassociateElement)==null||o.call(r,this),tn(this,Xe,null)),a&&this.isConnected&&(tn(this,Xe,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=en(this,Xe))==null?void 0:d.associateElement)==null||u.call(d,this)))}connectedCallback(){var e,i,a;let r=this.getAttribute(x.MEDIA_CONTROLLER);r&&(tn(this,Xe,(e=this.getRootNode())==null?void 0:e.getElementById(r)),(a=(i=en(this,Xe))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var e,i;(i=(e=en(this,Xe))==null?void 0:e.unassociateElement)==null||i.call(e,this),tn(this,Xe,null)}};Xe=new WeakMap;sr.shadowRootOptions={mode:"open"};sr.getTemplateHTML=xp;l.customElements.get("media-control-bar")||l.customElements.define("media-control-bar",sr);var Tc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},an=(t,e,i)=>(Tc(t,e,"read from private field"),i?i.call(t):e.get(t)),Dp=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},rn=(t,e,i,a)=>(Tc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Je;function Op(t,e={}){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px rgb(27 127 204 / .9);
        outline: 0;
      }

      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(t,e)}
  `}function Np(t,e){return`
    <slot></slot>
  `}var be=class extends l.HTMLElement{constructor(){if(super(),Dp(this,Je,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[x.MEDIA_CONTROLLER]}attributeChangedCallback(e,i,a){var r,o,s,d,u;e===x.MEDIA_CONTROLLER&&(i&&((o=(r=an(this,Je))==null?void 0:r.unassociateElement)==null||o.call(r,this),rn(this,Je,null)),a&&this.isConnected&&(rn(this,Je,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=an(this,Je))==null?void 0:d.associateElement)==null||u.call(d,this)))}connectedCallback(){var e,i,a;let{style:r}=q(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`);let o=this.getAttribute(x.MEDIA_CONTROLLER);o&&(rn(this,Je,(e=this.getRootNode())==null?void 0:e.getElementById(o)),(a=(i=an(this,Je))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var e,i;(i=(e=an(this,Je))==null?void 0:e.unassociateElement)==null||i.call(e,this),rn(this,Je,null)}};Je=new WeakMap;be.shadowRootOptions={mode:"open"};be.getTemplateHTML=Op;be.getSlotTemplateHTML=Np;l.customElements.get("media-text-display")||l.customElements.define("media-text-display",be);var kc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},yc=(t,e,i)=>(kc(t,e,"read from private field"),i?i.call(t):e.get(t)),Pp=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Up=(t,e,i,a)=>(kc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),lr;function Hp(t,e){return`
    <slot>${Ue(e.mediaDuration)}</slot>
  `}var on=class extends be{constructor(){var e;super(),Pp(this,lr,void 0),Up(this,lr,this.shadowRoot.querySelector("slot")),yc(this,lr).textContent=Ue((e=this.mediaDuration)!=null?e:0)}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_DURATION]}attributeChangedCallback(e,i,a){e===n.MEDIA_DURATION&&(yc(this,lr).textContent=Ue(+a)),super.attributeChangedCallback(e,i,a)}get mediaDuration(){return O(this,n.MEDIA_DURATION)}set mediaDuration(e){P(this,n.MEDIA_DURATION,e)}};lr=new WeakMap;on.getSlotTemplateHTML=Hp;l.customElements.get("media-duration-display")||l.customElements.define("media-duration-display",on);var Bp={2:h("Network Error"),3:h("Decode Error"),4:h("Source Not Supported"),5:h("Encryption Error")},$p={2:h("A network error caused the media download to fail."),3:h("A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."),4:h("An unsupported error occurred. The server or network failed, or your browser does not support this format."),5:h("The media is encrypted and there are no keys to decrypt it.")},gl=t=>{var e,i;return t.code===1?null:{title:(e=Bp[t.code])!=null?e:`Error ${t.code}`,message:(i=$p[t.code])!=null?i:t.message}};var Ic=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Wp=(t,e,i)=>(Ic(t,e,"read from private field"),i?i.call(t):e.get(t)),Fp=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Vp=(t,e,i,a)=>(Ic(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),nn;function Kp(t){return`
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${t.mediaerrorcode}" id="content">
      ${Mc({code:+t.mediaerrorcode,message:t.mediaerrormessage})}
    </slot>
  `}function Gp(t){return t.code&&gl(t)!==null}function Mc(t){var e;let{title:i,message:a}=(e=gl(t))!=null?e:{},r="";return i&&(r+=`<slot name="error-${t.code}-title"><h3>${i}</h3></slot>`),a&&(r+=`<slot name="error-${t.code}-message"><p>${a}</p></slot>`),r}var Sc=[n.MEDIA_ERROR_CODE,n.MEDIA_ERROR_MESSAGE],Vi=class extends Ze{constructor(){super(...arguments),Fp(this,nn,null)}static get observedAttributes(){return[...super.observedAttributes,...Sc]}formatErrorMessage(e){return this.constructor.formatErrorMessage(e)}attributeChangedCallback(e,i,a){var r;if(super.attributeChangedCallback(e,i,a),!Sc.includes(e))return;let o=(r=this.mediaError)!=null?r:{code:this.mediaErrorCode,message:this.mediaErrorMessage};this.open=Gp(o),this.open&&(this.shadowRoot.querySelector("slot").name=`error-${this.mediaErrorCode}`,this.shadowRoot.querySelector("#content").innerHTML=this.formatErrorMessage(o))}get mediaError(){return Wp(this,nn)}set mediaError(e){Vp(this,nn,e)}get mediaErrorCode(){return O(this,"mediaerrorcode")}set mediaErrorCode(e){P(this,"mediaerrorcode",e)}get mediaErrorMessage(){return w(this,"mediaerrormessage")}set mediaErrorMessage(e){R(this,"mediaerrormessage",e)}};nn=new WeakMap;Vi.getSlotTemplateHTML=Kp;Vi.formatErrorMessage=Mc;l.customElements.get("media-error-dialog")||l.customElements.define("media-error-dialog",Vi);var sn=Vi;var Yp=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Dt=(t,e,i)=>(Yp(t,e,"read from private field"),i?i.call(t):e.get(t)),Cc=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Ki,Gi;function qp(t){return`
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: rgb(20 20 30 / .8);
        backdrop-filter: blur(10px);
      }

      #content {
        display: block;
        width: clamp(400px, 40vw, 700px);
        max-width: 90vw;
        text-align: left;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
      }

      .shortcuts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .shortcuts-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-table tr:last-child {
        border-bottom: none;
      }

      .shortcuts-table td {
        padding: 0.75rem 0.5rem;
      }

      .shortcuts-table td:first-child {
        text-align: right;
        padding-right: 1rem;
        width: 40%;
        min-width: 120px;
      }

      .shortcuts-table td:last-child {
        padding-left: 1rem;
      }

      .key {
        display: inline-block;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        margin: 0 0.2rem;
      }

      .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .key-combo {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .key-separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
    </style>
    <slot id="content">
      ${Zp()}
    </slot>
  `}function Zp(){return`
    <h2>Keyboard Shortcuts</h2>
    <table class="shortcuts-table">${[{keys:["Space","k"],description:"Toggle Playback"},{keys:["m"],description:"Toggle mute"},{keys:["f"],description:"Toggle fullscreen"},{keys:["c"],description:"Toggle captions or subtitles, if available"},{keys:["p"],description:"Toggle Picture in Picture"},{keys:["\u2190","j"],description:"Seek back 10s"},{keys:["\u2192","l"],description:"Seek forward 10s"},{keys:["\u2191"],description:"Turn volume up"},{keys:["\u2193"],description:"Turn volume down"},{keys:["< (SHIFT+,)"],description:"Decrease playback rate"},{keys:["> (SHIFT+.)"],description:"Increase playback rate"}].map(({keys:i,description:a})=>`
      <tr>
        <td>
          <div class="key-combo">${i.map((o,s)=>s>0?`<span class="key-separator">or</span><span class="key">${o}</span>`:`<span class="key">${o}</span>`).join("")}</div>
        </td>
        <td class="description">${a}</td>
      </tr>
    `).join("")}</table>
  `}var ln=class extends Ze{constructor(){super(...arguments),Cc(this,Ki,e=>{var i;if(!this.open)return;let a=(i=this.shadowRoot)==null?void 0:i.querySelector("#content");if(!a)return;let r=e.composedPath(),o=r[0]===this||r.includes(this),s=r.includes(a);o&&!s&&(this.open=!1)}),Cc(this,Gi,e=>{if(!this.open)return;let i=e.shiftKey&&(e.key==="/"||e.key==="?");(e.key==="Escape"||i)&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&(this.open=!1,e.preventDefault(),e.stopPropagation())})}connectedCallback(){super.connectedCallback(),this.open&&(this.addEventListener("click",Dt(this,Ki)),document.addEventListener("keydown",Dt(this,Gi)))}disconnectedCallback(){this.removeEventListener("click",Dt(this,Ki)),document.removeEventListener("keydown",Dt(this,Gi))}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e==="open"&&(this.open?(this.addEventListener("click",Dt(this,Ki)),document.addEventListener("keydown",Dt(this,Gi))):(this.removeEventListener("click",Dt(this,Ki)),document.removeEventListener("keydown",Dt(this,Gi))))}};Ki=new WeakMap;Gi=new WeakMap;ln.getSlotTemplateHTML=qp;l.customElements.get("media-keyboard-shortcuts-dialog")||l.customElements.define("media-keyboard-shortcuts-dialog",ln);var wc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Qp=(t,e,i)=>(wc(t,e,"read from private field"),i?i.call(t):e.get(t)),zp=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Xp=(t,e,i,a)=>(wc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),dn,Jp=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`,jp=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`;function ef(t){return`
    <style>
      :host([${n.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${n.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${n.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${n.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Jp}</slot>
      <slot name="exit">${jp}</slot>
    </slot>
  `}function tf(){return`
    <slot name="tooltip-enter">${h("Enter fullscreen mode")}</slot>
    <slot name="tooltip-exit">${h("Exit fullscreen mode")}</slot>
  `}var Lc=t=>{let e=t.mediaIsFullscreen?h("exit fullscreen mode"):h("enter fullscreen mode");t.setAttribute("aria-label",e)},dr=class extends H{constructor(){super(...arguments),zp(this,dn,null)}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_IS_FULLSCREEN,n.MEDIA_FULLSCREEN_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Lc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_IS_FULLSCREEN&&Lc(this)}get mediaFullscreenUnavailable(){return w(this,n.MEDIA_FULLSCREEN_UNAVAILABLE)}set mediaFullscreenUnavailable(e){R(this,n.MEDIA_FULLSCREEN_UNAVAILABLE,e)}get mediaIsFullscreen(){return k(this,n.MEDIA_IS_FULLSCREEN)}set mediaIsFullscreen(e){S(this,n.MEDIA_IS_FULLSCREEN,e)}handleClick(e){Xp(this,dn,e);let i=Qp(this,dn)instanceof PointerEvent,a=this.mediaIsFullscreen?new l.CustomEvent(m.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0}):new l.CustomEvent(m.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0,detail:i});this.dispatchEvent(a)}};dn=new WeakMap;dr.getSlotTemplateHTML=ef;dr.getTooltipContentHTML=tf;l.customElements.get("media-fullscreen-button")||l.customElements.define("media-fullscreen-button",dr);var{MEDIA_TIME_IS_LIVE:un,MEDIA_PAUSED:ur}=n,{MEDIA_SEEK_TO_LIVE_REQUEST:af,MEDIA_PLAY_REQUEST:rf}=m,of='<svg viewBox="0 0 6 12"><circle cx="3" cy="6" r="2"></circle></svg>';function nf(t){return`
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${un}]:not([${ur}])) slot[name=indicator] > *,
      :host([${un}]:not([${ur}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${un}]:not([${ur}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator">${of}</slot>
    
    <slot name="spacer">&nbsp;</slot><slot name="text">${h("live")}</slot>
  `}var Rc=t=>{var e;let i=t.mediaPaused||!t.mediaTimeIsLive,a=i?h("seek to live"):h("playing live");t.setAttribute("aria-label",a);let r=(e=t.shadowRoot)==null?void 0:e.querySelector('slot[name="text"]');r&&(r.textContent=h("live")),i?t.removeAttribute("aria-disabled"):t.setAttribute("aria-disabled","true")},cn=class extends H{static get observedAttributes(){return[...super.observedAttributes,un,ur]}connectedCallback(){super.connectedCallback(),Rc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),Rc(this)}get mediaPaused(){return k(this,n.MEDIA_PAUSED)}set mediaPaused(e){S(this,n.MEDIA_PAUSED,e)}get mediaTimeIsLive(){return k(this,n.MEDIA_TIME_IS_LIVE)}set mediaTimeIsLive(e){S(this,n.MEDIA_TIME_IS_LIVE,e)}handleClick(){!this.mediaPaused&&this.mediaTimeIsLive||(this.dispatchEvent(new l.CustomEvent(af,{composed:!0,bubbles:!0})),this.hasAttribute(ur)&&this.dispatchEvent(new l.CustomEvent(rf,{composed:!0,bubbles:!0})))}};cn.getSlotTemplateHTML=nf;l.customElements.get("media-live-button")||l.customElements.define("media-live-button",cn);var Dc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},cr=(t,e,i)=>(Dc(t,e,"read from private field"),i?i.call(t):e.get(t)),xc=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},mr=(t,e,i,a)=>(Dc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),je,hn,mn={LOADING_DELAY:"loadingdelay",NO_AUTOHIDE:"noautohide"},Oc=500,sf=`
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;function lf(t){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, ${Oc}ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${n.MEDIA_LOADING}]:not([${n.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${n.MEDIA_LOADING}]:not([${n.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${n.MEDIA_LOADING}]:not([${n.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${sf}</slot>
    <div id="status" role="status" aria-live="polite">${h("media loading")}</div>
  `}var hr=class extends l.HTMLElement{constructor(){if(super(),xc(this,je,void 0),xc(this,hn,Oc),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[x.MEDIA_CONTROLLER,n.MEDIA_PAUSED,n.MEDIA_LOADING,mn.LOADING_DELAY]}attributeChangedCallback(e,i,a){var r,o,s,d,u;e===mn.LOADING_DELAY&&i!==a?this.loadingDelay=Number(a):e===x.MEDIA_CONTROLLER&&(i&&((o=(r=cr(this,je))==null?void 0:r.unassociateElement)==null||o.call(r,this),mr(this,je,null)),a&&this.isConnected&&(mr(this,je,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=cr(this,je))==null?void 0:d.associateElement)==null||u.call(d,this)))}connectedCallback(){var e,i,a;let r=this.getAttribute(x.MEDIA_CONTROLLER);r&&(mr(this,je,(e=this.getRootNode())==null?void 0:e.getElementById(r)),(a=(i=cr(this,je))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var e,i;(i=(e=cr(this,je))==null?void 0:e.unassociateElement)==null||i.call(e,this),mr(this,je,null)}get loadingDelay(){return cr(this,hn)}set loadingDelay(e){mr(this,hn,e);let{style:i}=q(this.shadowRoot,":host");i.setProperty("--_loading-indicator-delay",`var(--media-loading-indicator-transition-delay, ${e}ms)`)}get mediaPaused(){return k(this,n.MEDIA_PAUSED)}set mediaPaused(e){S(this,n.MEDIA_PAUSED,e)}get mediaLoading(){return k(this,n.MEDIA_LOADING)}set mediaLoading(e){S(this,n.MEDIA_LOADING,e)}get mediaController(){return w(this,x.MEDIA_CONTROLLER)}set mediaController(e){R(this,x.MEDIA_CONTROLLER,e)}get noAutohide(){return k(this,mn.NO_AUTOHIDE)}set noAutohide(e){S(this,mn.NO_AUTOHIDE,e)}};je=new WeakMap;hn=new WeakMap;hr.shadowRootOptions={mode:"open"};hr.getTemplateHTML=lf;l.customElements.get("media-loading-indicator")||l.customElements.define("media-loading-indicator",hr);var df=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`,Nc=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`,uf=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;function cf(t){return`
    <style>
      :host(:not([${n.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${n.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${n.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${n.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${n.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${n.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${n.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${df}</slot>
      <slot name="low">${Nc}</slot>
      <slot name="medium">${Nc}</slot>
      <slot name="high">${uf}</slot>
    </slot>
  `}function mf(){return`
    <slot name="tooltip-mute">${h("Mute")}</slot>
    <slot name="tooltip-unmute">${h("Unmute")}</slot>
  `}var Pc=t=>{let i=t.mediaVolumeLevel==="off"?h("unmute"):h("mute");t.setAttribute("aria-label",i)},pr=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_VOLUME_LEVEL]}connectedCallback(){super.connectedCallback(),Pc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_VOLUME_LEVEL&&Pc(this)}get mediaVolumeLevel(){return w(this,n.MEDIA_VOLUME_LEVEL)}set mediaVolumeLevel(e){R(this,n.MEDIA_VOLUME_LEVEL,e)}handleClick(){let e=this.mediaVolumeLevel==="off"?m.MEDIA_UNMUTE_REQUEST:m.MEDIA_MUTE_REQUEST;this.dispatchEvent(new l.CustomEvent(e,{composed:!0,bubbles:!0}))}};pr.getSlotTemplateHTML=cf;pr.getTooltipContentHTML=mf;l.customElements.get("media-mute-button")||l.customElements.define("media-mute-button",pr);var Uc=`<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`;function hf(t){return`
    <style>
      :host([${n.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${n.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${n.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${n.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Uc}</slot>
      <slot name="exit">${Uc}</slot>
    </slot>
  `}function pf(){return`
    <slot name="tooltip-enter">${h("Enter picture in picture mode")}</slot>
    <slot name="tooltip-exit">${h("Exit picture in picture mode")}</slot>
  `}var Hc=t=>{let e=t.mediaIsPip?h("exit picture in picture mode"):h("enter picture in picture mode");t.setAttribute("aria-label",e)},fr=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_IS_PIP,n.MEDIA_PIP_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Hc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_IS_PIP&&Hc(this)}get mediaPipUnavailable(){return w(this,n.MEDIA_PIP_UNAVAILABLE)}set mediaPipUnavailable(e){R(this,n.MEDIA_PIP_UNAVAILABLE,e)}get mediaIsPip(){return k(this,n.MEDIA_IS_PIP)}set mediaIsPip(e){S(this,n.MEDIA_IS_PIP,e)}handleClick(){let e=this.mediaIsPip?m.MEDIA_EXIT_PIP_REQUEST:m.MEDIA_ENTER_PIP_REQUEST;this.dispatchEvent(new l.CustomEvent(e,{composed:!0,bubbles:!0}))}};fr.getSlotTemplateHTML=hf;fr.getTooltipContentHTML=pf;l.customElements.get("media-pip-button")||l.customElements.define("media-pip-button",fr);var ff=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Yi=(t,e,i)=>(ff(t,e,"read from private field"),i?i.call(t):e.get(t)),vf=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Ot,_l={RATES:"rates"},Al=[1,1.2,1.5,1.7,2],ni=1;function Ef(t){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${t.mediaplaybackrate||ni}x</slot>
  `}function bf(){return h("Playback rate")}var vr=class extends H{constructor(){var e;super(),vf(this,Ot,new Ct(this,_l.RATES,{defaultValue:Al})),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${(e=this.mediaPlaybackRate)!=null?e:ni}x`}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PLAYBACK_RATE,_l.RATES]}attributeChangedCallback(e,i,a){if(super.attributeChangedCallback(e,i,a),e===_l.RATES&&(Yi(this,Ot).value=a),e===n.MEDIA_PLAYBACK_RATE){let r=a?+a:Number.NaN,o=Number.isNaN(r)?ni:r;this.container.innerHTML=`${o}x`,this.setAttribute("aria-label",h("Playback rate {playbackRate}",{playbackRate:o}))}}get rates(){return Yi(this,Ot)}set rates(e){e?Array.isArray(e)?Yi(this,Ot).value=e.join(" "):typeof e=="string"&&(Yi(this,Ot).value=e):Yi(this,Ot).value=""}get mediaPlaybackRate(){return O(this,n.MEDIA_PLAYBACK_RATE,ni)}set mediaPlaybackRate(e){P(this,n.MEDIA_PLAYBACK_RATE,e)}handleClick(){var e,i;let a=Array.from(Yi(this,Ot).values(),s=>+s).sort((s,d)=>s-d),r=(i=(e=a.find(s=>s>this.mediaPlaybackRate))!=null?e:a[0])!=null?i:ni,o=new l.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:r});this.dispatchEvent(o)}};Ot=new WeakMap;vr.getSlotTemplateHTML=Ef;vr.getTooltipContentHTML=bf;l.customElements.get("media-playback-rate-button")||l.customElements.define("media-playback-rate-button",vr);var gf=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`,_f=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`;function Af(t){return`
    <style>
      :host([${n.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${n.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${n.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${n.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${gf}</slot>
      <slot name="pause">${_f}</slot>
    </slot>
  `}function Tf(){return`
    <slot name="tooltip-play">${h("Play")}</slot>
    <slot name="tooltip-pause">${h("Pause")}</slot>
  `}var Bc=t=>{let e=t.mediaPaused?h("play"):h("pause");t.setAttribute("aria-label",e)},Er=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PAUSED,n.MEDIA_ENDED]}connectedCallback(){super.connectedCallback(),Bc(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),(e===n.MEDIA_PAUSED||e===n.MEDIA_LANG)&&Bc(this)}get mediaPaused(){return k(this,n.MEDIA_PAUSED)}set mediaPaused(e){S(this,n.MEDIA_PAUSED,e)}handleClick(){let e=this.mediaPaused?m.MEDIA_PLAY_REQUEST:m.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new l.CustomEvent(e,{composed:!0,bubbles:!0}))}};Er.getSlotTemplateHTML=Af;Er.getTooltipContentHTML=Tf;l.customElements.get("media-play-button")||l.customElements.define("media-play-button",Er);var et={PLACEHOLDER_SRC:"placeholdersrc",SRC:"src"};function yf(t){return`
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `}var kf=t=>{t.style.removeProperty("background-image")},Sf=(t,e)=>{t.style["background-image"]=`url('${e}')`},br=class extends l.HTMLElement{static get observedAttributes(){return[et.PLACEHOLDER_SRC,et.SRC]}constructor(){if(super(),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}this.image=this.shadowRoot.querySelector("#image")}attributeChangedCallback(e,i,a){e===et.SRC&&(a==null?this.image.removeAttribute(et.SRC):this.image.setAttribute(et.SRC,a)),e===et.PLACEHOLDER_SRC&&(a==null?kf(this.image):Sf(this.image,a))}get placeholderSrc(){return w(this,et.PLACEHOLDER_SRC)}set placeholderSrc(e){R(this,et.SRC,e)}get src(){return w(this,et.SRC)}set src(e){R(this,et.SRC,e)}};br.shadowRootOptions={mode:"open"};br.getTemplateHTML=yf;l.customElements.get("media-poster-image")||l.customElements.define("media-poster-image",br);var $c=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},If=(t,e,i)=>($c(t,e,"read from private field"),i?i.call(t):e.get(t)),Mf=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Cf=(t,e,i,a)=>($c(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),pn,Tl=class extends be{constructor(){super(),Mf(this,pn,void 0),Cf(this,pn,this.shadowRoot.querySelector("slot"))}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PREVIEW_CHAPTER,n.MEDIA_LANG]}attributeChangedCallback(e,i,a){if(super.attributeChangedCallback(e,i,a),(e===n.MEDIA_PREVIEW_CHAPTER||e===n.MEDIA_LANG)&&a!==i&&a!=null)if(If(this,pn).textContent=a,a!==""){let r=h("chapter: {chapterName}",{chapterName:a});this.setAttribute("aria-valuetext",r)}else this.removeAttribute("aria-valuetext")}get mediaPreviewChapter(){return w(this,n.MEDIA_PREVIEW_CHAPTER)}set mediaPreviewChapter(e){R(this,n.MEDIA_PREVIEW_CHAPTER,e)}};pn=new WeakMap;l.customElements.get("media-preview-chapter-display")||l.customElements.define("media-preview-chapter-display",Tl);var Wc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},fn=(t,e,i)=>(Wc(t,e,"read from private field"),i?i.call(t):e.get(t)),Lf=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},vn=(t,e,i,a)=>(Wc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),tt;function wf(t){return`
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `}var qi=class extends l.HTMLElement{constructor(){if(super(),Lf(this,tt,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[x.MEDIA_CONTROLLER,n.MEDIA_PREVIEW_IMAGE,n.MEDIA_PREVIEW_COORDS]}connectedCallback(){var e,i,a;let r=this.getAttribute(x.MEDIA_CONTROLLER);r&&(vn(this,tt,(e=this.getRootNode())==null?void 0:e.getElementById(r)),(a=(i=fn(this,tt))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var e,i;(i=(e=fn(this,tt))==null?void 0:e.unassociateElement)==null||i.call(e,this),vn(this,tt,null)}attributeChangedCallback(e,i,a){var r,o,s,d,u;[n.MEDIA_PREVIEW_IMAGE,n.MEDIA_PREVIEW_COORDS].includes(e)&&this.update(),e===x.MEDIA_CONTROLLER&&(i&&((o=(r=fn(this,tt))==null?void 0:r.unassociateElement)==null||o.call(r,this),vn(this,tt,null)),a&&this.isConnected&&(vn(this,tt,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(u=(d=fn(this,tt))==null?void 0:d.associateElement)==null||u.call(d,this)))}get mediaPreviewImage(){return w(this,n.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){R(this,n.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewCoords(){let e=this.getAttribute(n.MEDIA_PREVIEW_COORDS);if(e)return e.split(/\s+/).map(i=>+i)}set mediaPreviewCoords(e){if(!e){this.removeAttribute(n.MEDIA_PREVIEW_COORDS);return}this.setAttribute(n.MEDIA_PREVIEW_COORDS,e.join(" "))}update(){let e=this.mediaPreviewCoords,i=this.mediaPreviewImage;if(!(e&&i))return;let[a,r,o,s]=e,d=i.split("#")[0],u=getComputedStyle(this),{maxWidth:p,maxHeight:T,minWidth:_,minHeight:E}=u,f=Math.min(parseInt(p)/o,parseInt(T)/s),M=Math.max(parseInt(_)/o,parseInt(E)/s),b=f<1,C=b?f:M>1?M:1,{style:L}=q(this.shadowRoot,":host"),ie=q(this.shadowRoot,"img").style,Ae=this.shadowRoot.querySelector("img"),kt=b?"min":"max";L.setProperty(`${kt}-width`,"initial","important"),L.setProperty(`${kt}-height`,"initial","important"),L.width=`${o*C}px`,L.height=`${s*C}px`;let mt=()=>{ie.width=`${this.imgWidth*C}px`,ie.height=`${this.imgHeight*C}px`,ie.display="block"};Ae.src!==d&&(Ae.onload=()=>{this.imgWidth=Ae.naturalWidth,this.imgHeight=Ae.naturalHeight,mt()},Ae.src=d,mt()),mt(),ie.transform=`translate(-${a*C}px, -${r*C}px)`}};tt=new WeakMap;qi.shadowRootOptions={mode:"open"};qi.getTemplateHTML=wf;l.customElements.get("media-preview-thumbnail")||l.customElements.define("media-preview-thumbnail",qi);var En=qi;var Vc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Fc=(t,e,i)=>(Vc(t,e,"read from private field"),i?i.call(t):e.get(t)),Rf=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},xf=(t,e,i,a)=>(Vc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),gr,yl=class extends be{constructor(){super(),Rf(this,gr,void 0),xf(this,gr,this.shadowRoot.querySelector("slot")),Fc(this,gr).textContent=Ue(0)}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PREVIEW_TIME]}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_PREVIEW_TIME&&a!=null&&(Fc(this,gr).textContent=Ue(parseFloat(a)))}get mediaPreviewTime(){return O(this,n.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){P(this,n.MEDIA_PREVIEW_TIME,e)}};gr=new WeakMap;l.customElements.get("media-preview-time-display")||l.customElements.define("media-preview-time-display",yl);var Zi={SEEK_OFFSET:"seekoffset"},kl=30,Df=t=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${t}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`;function Of(t,e){return`
    <slot name="icon">${Df(e.seekOffset)}</slot>
  `}function Nf(){return h("Seek backward")}var Pf=0,_r=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_CURRENT_TIME,Zi.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=O(this,Zi.SEEK_OFFSET,kl)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===Zi.SEEK_OFFSET&&(this.seekOffset=O(this,Zi.SEEK_OFFSET,kl))}get seekOffset(){return O(this,Zi.SEEK_OFFSET,kl)}set seekOffset(e){P(this,Zi.SEEK_OFFSET,e),this.setAttribute("aria-label",h("seek back {seekOffset} seconds",{seekOffset:this.seekOffset})),Eo(bo(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return O(this,n.MEDIA_CURRENT_TIME,Pf)}set mediaCurrentTime(e){P(this,n.MEDIA_CURRENT_TIME,e)}handleClick(){let e=Math.max(this.mediaCurrentTime-this.seekOffset,0),i=new l.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(i)}};_r.getSlotTemplateHTML=Of;_r.getTooltipContentHTML=Nf;l.customElements.get("media-seek-backward-button")||l.customElements.define("media-seek-backward-button",_r);var Qi={SEEK_OFFSET:"seekoffset"},Sl=30,Uf=t=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${t}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`;function Hf(t,e){return`
    <slot name="icon">${Uf(e.seekOffset)}</slot>
  `}function Bf(){return h("Seek forward")}var $f=0,Ar=class extends H{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_CURRENT_TIME,Qi.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=O(this,Qi.SEEK_OFFSET,Sl)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===Qi.SEEK_OFFSET&&(this.seekOffset=O(this,Qi.SEEK_OFFSET,Sl))}get seekOffset(){return O(this,Qi.SEEK_OFFSET,Sl)}set seekOffset(e){P(this,Qi.SEEK_OFFSET,e),this.setAttribute("aria-label",h("seek forward {seekOffset} seconds",{seekOffset:this.seekOffset})),Eo(bo(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return O(this,n.MEDIA_CURRENT_TIME,$f)}set mediaCurrentTime(e){P(this,n.MEDIA_CURRENT_TIME,e)}handleClick(){let e=this.mediaCurrentTime+this.seekOffset,i=new l.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(i)}};Ar.getSlotTemplateHTML=Hf;Ar.getTooltipContentHTML=Bf;l.customElements.get("media-seek-forward-button")||l.customElements.define("media-seek-forward-button",Ar);var Yc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Il=(t,e,i)=>(Yc(t,e,"read from private field"),i?i.call(t):e.get(t)),Wf=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Ff=(t,e,i,a)=>(Yc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),zi,si={REMAINING:"remaining",SHOW_DURATION:"showduration",NO_TOGGLE:"notoggle"},Kc=[...Object.values(si),n.MEDIA_CURRENT_TIME,n.MEDIA_DURATION,n.MEDIA_SEEKABLE],Gc=["Enter"," "],Vf="&nbsp;/&nbsp;",Ml=(t,{timesSep:e=Vf}={})=>{var i,a;let r=(i=t.mediaCurrentTime)!=null?i:0,[,o]=(a=t.mediaSeekable)!=null?a:[],s=0;Number.isFinite(t.mediaDuration)?s=t.mediaDuration:Number.isFinite(o)&&(s=o);let d=t.remaining?Ue(0-(s-r)):Ue(r);return t.showDuration?`${d}${e}${Ue(s)}`:d},Kf="video not loaded, unknown time.",Gf=t=>{var e;let i=t.mediaCurrentTime,[,a]=(e=t.mediaSeekable)!=null?e:[],r=null;if(Number.isFinite(t.mediaDuration)?r=t.mediaDuration:Number.isFinite(a)&&(r=a),i==null||r===null){t.setAttribute("aria-valuetext",Kf);return}let o=t.remaining?Yt(0-(r-i)):Yt(i);if(!t.showDuration){t.setAttribute("aria-valuetext",o);return}let s=Yt(r),d=`${o} of ${s}`;t.setAttribute("aria-valuetext",d)};function Yf(t,e){return`
    <slot>${Ml(e)}</slot>
  `}var bn=class extends be{constructor(){super(),Wf(this,zi,void 0),Ff(this,zi,this.shadowRoot.querySelector("slot")),Il(this,zi).innerHTML=`${Ml(this)}`}static get observedAttributes(){return[...super.observedAttributes,...Kc,"disabled"]}connectedCallback(){let{style:e}=q(this.shadowRoot,":host(:hover:not([notoggle]))");e.setProperty("cursor","var(--media-cursor, pointer)"),e.setProperty("background","var(--media-control-hover-background, rgba(50 50 70 / .7))"),this.hasAttribute("disabled")||this.enable(),this.setAttribute("role","progressbar"),this.setAttribute("aria-label",h("playback time"));let i=a=>{let{key:r}=a;if(!Gc.includes(r)){this.removeEventListener("keyup",i);return}this.toggleTimeDisplay()};this.addEventListener("keydown",a=>{let{metaKey:r,altKey:o,key:s}=a;if(r||o||!Gc.includes(s)){this.removeEventListener("keyup",i);return}this.addEventListener("keyup",i)}),this.addEventListener("click",this.toggleTimeDisplay),super.connectedCallback()}toggleTimeDisplay(){this.noToggle||(this.hasAttribute("remaining")?this.removeAttribute("remaining"):this.setAttribute("remaining",""))}disconnectedCallback(){this.disable(),super.disconnectedCallback()}attributeChangedCallback(e,i,a){Kc.includes(e)?this.update():e==="disabled"&&a!==i&&(a==null?this.enable():this.disable()),super.attributeChangedCallback(e,i,a)}enable(){this.tabIndex=0}disable(){this.tabIndex=-1}get remaining(){return k(this,si.REMAINING)}set remaining(e){S(this,si.REMAINING,e)}get showDuration(){return k(this,si.SHOW_DURATION)}set showDuration(e){S(this,si.SHOW_DURATION,e)}get noToggle(){return k(this,si.NO_TOGGLE)}set noToggle(e){S(this,si.NO_TOGGLE,e)}get mediaDuration(){return O(this,n.MEDIA_DURATION)}set mediaDuration(e){P(this,n.MEDIA_DURATION,e)}get mediaCurrentTime(){return O(this,n.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){P(this,n.MEDIA_CURRENT_TIME,e)}get mediaSeekable(){let e=this.getAttribute(n.MEDIA_SEEKABLE);if(e)return e.split(":").map(i=>+i)}set mediaSeekable(e){if(e==null){this.removeAttribute(n.MEDIA_SEEKABLE);return}this.setAttribute(n.MEDIA_SEEKABLE,e.join(":"))}update(){let e=Ml(this);Gf(this),e!==Il(this,zi).innerHTML&&(Il(this,zi).innerHTML=e)}};zi=new WeakMap;bn.getSlotTemplateHTML=Yf;l.customElements.get("media-time-display")||l.customElements.define("media-time-display",bn);var qc=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},ne=(t,e,i)=>(qc(t,e,"read from private field"),i?i.call(t):e.get(t)),it=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Me=(t,e,i,a)=>(qc(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),qf=(t,e,i,a)=>({set _(r){Me(t,e,r,i)},get _(){return ne(t,e,a)}}),Xi,gn,Ji,Tr,_n,An,Tn,ji,li,yn,kn=class{constructor(e,i,a){it(this,Xi,void 0),it(this,gn,void 0),it(this,Ji,void 0),it(this,Tr,void 0),it(this,_n,void 0),it(this,An,void 0),it(this,Tn,void 0),it(this,ji,void 0),it(this,li,0),it(this,yn,(r=performance.now())=>{Me(this,li,requestAnimationFrame(ne(this,yn))),Me(this,Tr,performance.now()-ne(this,Ji));let o=1e3/this.fps;if(ne(this,Tr)>o){Me(this,Ji,r-ne(this,Tr)%o);let s=1e3/((r-ne(this,gn))/++qf(this,_n)._),d=(r-ne(this,An))/1e3/this.duration,u=ne(this,Tn)+d*this.playbackRate;u-ne(this,Xi).valueAsNumber>0?Me(this,ji,this.playbackRate/this.duration/s):(Me(this,ji,.995*ne(this,ji)),u=ne(this,Xi).valueAsNumber+ne(this,ji)),this.callback(u)}}),Me(this,Xi,e),this.callback=i,this.fps=a}start(){ne(this,li)===0&&(Me(this,Ji,performance.now()),Me(this,gn,ne(this,Ji)),Me(this,_n,0),ne(this,yn).call(this))}stop(){ne(this,li)!==0&&(cancelAnimationFrame(ne(this,li)),Me(this,li,0))}update({start:e,duration:i,playbackRate:a}){let r=e-ne(this,Xi).valueAsNumber,o=Math.abs(i-this.duration);(r>0||r<-.03||o>=.5)&&this.callback(e),Me(this,Tn,e),Me(this,An,performance.now()),this.duration=i,this.playbackRate=a}};Xi=new WeakMap;gn=new WeakMap;Ji=new WeakMap;Tr=new WeakMap;_n=new WeakMap;An=new WeakMap;Tn=new WeakMap;ji=new WeakMap;li=new WeakMap;yn=new WeakMap;var Rl=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},J=(t,e,i)=>(Rl(t,e,"read from private field"),i?i.call(t):e.get(t)),ae=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},xe=(t,e,i,a)=>(Rl(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),de=(t,e,i)=>(Rl(t,e,"access private method"),i),ea,di,Mn,kr,Cn,In,Sr,Ir,ta,ia,aa,yr,xl,Zc,Cl,Ln,Dl,wn,Ol,Rn,Nl,Ll,Qc,Mr,xn,wl,zc,Zf="video not loaded, unknown time.",Qf=t=>{let e=t.range,i=Yt(+Xc(t)),a=Yt(+t.mediaSeekableEnd),r=i&&a?`${i} of ${a}`:Zf;e.setAttribute("aria-valuetext",r)};function zf(t){return`
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${n.MEDIA_PREVIEW_IMAGE}], [${n.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${n.MEDIA_PREVIEW_IMAGE}], [${n.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${n.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${n.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${n.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${n.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${n.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${n.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${n.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${n.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${n.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${n.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${n.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${n.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${En.shadowRootOptions.mode}">
            ${En.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        
      </slot>
    </div>
  `}var Sn=(t,e=t.mediaCurrentTime)=>{let i=Number.isFinite(t.mediaSeekableStart)?t.mediaSeekableStart:0,a=Number.isFinite(t.mediaDuration)?t.mediaDuration:t.mediaSeekableEnd;if(Number.isNaN(a))return 0;let r=(e-i)/(a-i);return Math.max(0,Math.min(r,1))},Xc=(t,e=t.range.valueAsNumber)=>{let i=Number.isFinite(t.mediaSeekableStart)?t.mediaSeekableStart:0,a=Number.isFinite(t.mediaDuration)?t.mediaDuration:t.mediaSeekableEnd;return Number.isNaN(a)?0:e*(a-i)+i},Cr=class extends ze{constructor(){super(),ae(this,aa),ae(this,xl),ae(this,Ln),ae(this,wn),ae(this,Rn),ae(this,Ll),ae(this,Mr),ae(this,wl),ae(this,ea,void 0),ae(this,di,void 0),ae(this,Mn,void 0),ae(this,kr,void 0),ae(this,Cn,void 0),ae(this,In,void 0),ae(this,Sr,void 0),ae(this,Ir,void 0),ae(this,ta,void 0),ae(this,ia,void 0),ae(this,Cl,a=>{this.dragging||(Ci(a)&&(this.range.valueAsNumber=a),J(this,ia)||this.updateBar())}),this.shadowRoot.querySelector("#track").insertAdjacentHTML("afterbegin",'<div id="buffered" part="buffered"></div>'),xe(this,Mn,this.shadowRoot.querySelectorAll('[part~="box"]')),xe(this,Cn,this.shadowRoot.querySelector('[part~="preview-box"]')),xe(this,In,this.shadowRoot.querySelector('[part~="current-box"]'));let i=getComputedStyle(this);xe(this,Sr,parseInt(i.getPropertyValue("--media-box-padding-left"))),xe(this,Ir,parseInt(i.getPropertyValue("--media-box-padding-right"))),xe(this,di,new kn(this.range,J(this,Cl),60))}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PAUSED,n.MEDIA_DURATION,n.MEDIA_SEEKABLE,n.MEDIA_CURRENT_TIME,n.MEDIA_PREVIEW_IMAGE,n.MEDIA_PREVIEW_TIME,n.MEDIA_PREVIEW_CHAPTER,n.MEDIA_BUFFERED,n.MEDIA_PLAYBACK_RATE,n.MEDIA_LOADING,n.MEDIA_ENDED]}connectedCallback(){var e;super.connectedCallback(),this.range.setAttribute("aria-label",h("seek")),de(this,aa,yr).call(this),xe(this,ea,this.getRootNode()),(e=J(this,ea))==null||e.addEventListener("transitionstart",this)}disconnectedCallback(){var e;super.disconnectedCallback(),de(this,aa,yr).call(this),(e=J(this,ea))==null||e.removeEventListener("transitionstart",this),xe(this,ea,null)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),i!=a&&(e===n.MEDIA_CURRENT_TIME||e===n.MEDIA_PAUSED||e===n.MEDIA_ENDED||e===n.MEDIA_LOADING||e===n.MEDIA_DURATION||e===n.MEDIA_SEEKABLE?(J(this,di).update({start:Sn(this),duration:this.mediaSeekableEnd-this.mediaSeekableStart,playbackRate:this.mediaPlaybackRate}),de(this,aa,yr).call(this),Qf(this)):e===n.MEDIA_BUFFERED&&this.updateBufferedBar(),(e===n.MEDIA_DURATION||e===n.MEDIA_SEEKABLE)&&(this.mediaChaptersCues=J(this,ta),this.updateBar()))}get mediaChaptersCues(){return J(this,ta)}set mediaChaptersCues(e){var i;xe(this,ta,e),this.updateSegments((i=J(this,ta))==null?void 0:i.map(a=>({start:Sn(this,a.startTime),end:Sn(this,a.endTime)})))}get mediaPaused(){return k(this,n.MEDIA_PAUSED)}set mediaPaused(e){S(this,n.MEDIA_PAUSED,e)}get mediaLoading(){return k(this,n.MEDIA_LOADING)}set mediaLoading(e){S(this,n.MEDIA_LOADING,e)}get mediaDuration(){return O(this,n.MEDIA_DURATION)}set mediaDuration(e){P(this,n.MEDIA_DURATION,e)}get mediaCurrentTime(){return O(this,n.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){P(this,n.MEDIA_CURRENT_TIME,e)}get mediaPlaybackRate(){return O(this,n.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){P(this,n.MEDIA_PLAYBACK_RATE,e)}get mediaBuffered(){let e=this.getAttribute(n.MEDIA_BUFFERED);return e?e.split(" ").map(i=>i.split(":").map(a=>+a)):[]}set mediaBuffered(e){if(!e){this.removeAttribute(n.MEDIA_BUFFERED);return}let i=e.map(a=>a.join(":")).join(" ");this.setAttribute(n.MEDIA_BUFFERED,i)}get mediaSeekable(){let e=this.getAttribute(n.MEDIA_SEEKABLE);if(e)return e.split(":").map(i=>+i)}set mediaSeekable(e){if(e==null){this.removeAttribute(n.MEDIA_SEEKABLE);return}this.setAttribute(n.MEDIA_SEEKABLE,e.join(":"))}get mediaSeekableEnd(){var e;let[,i=this.mediaDuration]=(e=this.mediaSeekable)!=null?e:[];return i}get mediaSeekableStart(){var e;let[i=0]=(e=this.mediaSeekable)!=null?e:[];return i}get mediaPreviewImage(){return w(this,n.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){R(this,n.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewTime(){return O(this,n.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){P(this,n.MEDIA_PREVIEW_TIME,e)}get mediaEnded(){return k(this,n.MEDIA_ENDED)}set mediaEnded(e){S(this,n.MEDIA_ENDED,e)}updateBar(){super.updateBar(),this.updateBufferedBar(),this.updateCurrentBox()}updateBufferedBar(){var e;let i=this.mediaBuffered;if(!i.length)return;let a;if(this.mediaEnded)a=1;else{let o=this.mediaCurrentTime,[,s=this.mediaSeekableStart]=(e=i.find(([d,u])=>d<=o&&o<=u))!=null?e:[];a=Sn(this,s)}let{style:r}=q(this.shadowRoot,"#buffered");r.setProperty("width",`${a*100}%`)}updateCurrentBox(){if(!this.shadowRoot.querySelector('slot[name="current"]').assignedElements().length)return;let i=q(this.shadowRoot,"#current-rail"),a=q(this.shadowRoot,'[part~="current-box"]'),r=de(this,Ln,Dl).call(this,J(this,In)),o=de(this,wn,Ol).call(this,r,this.range.valueAsNumber),s=de(this,Rn,Nl).call(this,r,this.range.valueAsNumber);i.style.transform=`translateX(${o})`,i.style.setProperty("--_range-width",`${r.range.width}`),a.style.setProperty("--_box-shift",`${s}`),a.style.setProperty("--_box-width",`${r.box.width}px`),a.style.setProperty("visibility","initial")}handleEvent(e){switch(super.handleEvent(e),e.type){case"input":de(this,wl,zc).call(this);break;case"pointermove":de(this,Ll,Qc).call(this,e);break;case"pointerup":J(this,ia)&&xe(this,ia,!1);break;case"pointerdown":xe(this,ia,!0);break;case"pointerleave":de(this,Mr,xn).call(this,null);break;case"transitionstart":ue(e.target,this)&&setTimeout(()=>de(this,aa,yr).call(this),0);break}}};ea=new WeakMap;di=new WeakMap;Mn=new WeakMap;kr=new WeakMap;Cn=new WeakMap;In=new WeakMap;Sr=new WeakMap;Ir=new WeakMap;ta=new WeakMap;ia=new WeakMap;aa=new WeakSet;yr=function(){de(this,xl,Zc).call(this)?J(this,di).start():J(this,di).stop()};xl=new WeakSet;Zc=function(){return this.isConnected&&!this.mediaPaused&&!this.mediaLoading&&!this.mediaEnded&&this.mediaSeekableEnd>0&&go(this)};Cl=new WeakMap;Ln=new WeakSet;Dl=function(t){var e;let a=((e=this.getAttribute("bounds")?Ve(this,`#${this.getAttribute("bounds")}`):this.parentElement)!=null?e:this).getBoundingClientRect(),r=this.range.getBoundingClientRect(),o=t.offsetWidth,s=-(r.left-a.left-o/2),d=a.right-r.left-o/2;return{box:{width:o,min:s,max:d},bounds:a,range:r}};wn=new WeakSet;Ol=function(t,e){let i=`${e*100}%`,{width:a,min:r,max:o}=t.box;if(!a)return i;if(Number.isNaN(r)||(i=`max(${`calc(1 / var(--_range-width) * 100 * ${r}% + var(--media-box-padding-left))`}, ${i})`),!Number.isNaN(o)){let d=`calc(1 / var(--_range-width) * 100 * ${o}% - var(--media-box-padding-right))`;i=`min(${i}, ${d})`}return i};Rn=new WeakSet;Nl=function(t,e){let{width:i,min:a,max:r}=t.box,o=e*t.range.width;if(o<a+J(this,Sr)){let s=t.range.left-t.bounds.left-J(this,Sr);return`${o-i/2+s}px`}if(o>r-J(this,Ir)){let s=t.bounds.right-t.range.right-J(this,Ir);return`${o+i/2-s-t.range.width}px`}return 0};Ll=new WeakSet;Qc=function(t){let e=[...J(this,Mn)].some(T=>t.composedPath().includes(T));if(!this.dragging&&(e||!t.composedPath().includes(this))){de(this,Mr,xn).call(this,null);return}let i=this.mediaSeekableEnd;if(!i)return;let a=q(this.shadowRoot,"#preview-rail"),r=q(this.shadowRoot,'[part~="preview-box"]'),o=de(this,Ln,Dl).call(this,J(this,Cn)),s=(t.clientX-o.range.left)/o.range.width;s=Math.max(0,Math.min(1,s));let d=de(this,wn,Ol).call(this,o,s),u=de(this,Rn,Nl).call(this,o,s);a.style.transform=`translateX(${d})`,a.style.setProperty("--_range-width",`${o.range.width}`),r.style.setProperty("--_box-shift",`${u}`),r.style.setProperty("--_box-width",`${o.box.width}px`);let p=Math.round(J(this,kr))-Math.round(s*i);Math.abs(p)<1&&s>.01&&s<.99||(xe(this,kr,s*i),de(this,Mr,xn).call(this,J(this,kr)))};Mr=new WeakSet;xn=function(t){this.dispatchEvent(new l.CustomEvent(m.MEDIA_PREVIEW_REQUEST,{composed:!0,bubbles:!0,detail:t}))};wl=new WeakSet;zc=function(){J(this,di).stop();let t=Xc(this);this.dispatchEvent(new l.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:t}))};Cr.shadowRootOptions={mode:"open"};Cr.getContainerTemplateHTML=zf;l.customElements.get("media-time-range")||l.customElements.define("media-time-range",Cr);var Xf=1,Jf=t=>t.mediaMuted?0:t.mediaVolume,jf=t=>`${Math.round(t*100)}%`,Pl=class extends ze{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_VOLUME,n.MEDIA_MUTED,n.MEDIA_VOLUME_UNAVAILABLE]}constructor(){super(),this.range.addEventListener("input",()=>{let e=this.range.value,i=new l.CustomEvent(m.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(i)})}connectedCallback(){super.connectedCallback(),this.range.setAttribute("aria-label",h("volume"))}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),(e===n.MEDIA_VOLUME||e===n.MEDIA_MUTED)&&(this.range.valueAsNumber=Jf(this),this.range.setAttribute("aria-valuetext",jf(this.range.valueAsNumber)),this.updateBar())}get mediaVolume(){return O(this,n.MEDIA_VOLUME,Xf)}set mediaVolume(e){P(this,n.MEDIA_VOLUME,e)}get mediaMuted(){return k(this,n.MEDIA_MUTED)}set mediaMuted(e){S(this,n.MEDIA_MUTED,e)}get mediaVolumeUnavailable(){return w(this,n.MEDIA_VOLUME_UNAVAILABLE)}set mediaVolumeUnavailable(e){R(this,n.MEDIA_VOLUME_UNAVAILABLE,e)}};l.customElements.get("media-volume-range")||l.customElements.define("media-volume-range",Pl);function ev(t){return`
      <style>
        :host {
          min-width: 4ch;
          padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          font-weight: var(--media-button-font-weight, normal);
        }

        #checked-indicator {
          display: none;
        }

        :host([${n.MEDIA_LOOP}]) #checked-indicator {
          display: block;
        }
      </style>
      
      <span id="icon">
     </span>

      <div id="checked-indicator">
        <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
          <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
        </svg>
      </div>
    `}function tv(){return h("Loop")}var Lr=class extends H{constructor(){super(...arguments),this.container=null}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_LOOP]}connectedCallback(){var e;super.connectedCallback(),this.container=((e=this.shadowRoot)==null?void 0:e.querySelector("#icon"))||null,this.container&&(this.container.textContent=h("Loop"))}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_LOOP&&this.container&&this.setAttribute("aria-checked",this.mediaLoop?"true":"false")}get mediaLoop(){return k(this,n.MEDIA_LOOP)}set mediaLoop(e){S(this,n.MEDIA_LOOP,e)}handleClick(){let e=!this.mediaLoop,i=new l.CustomEvent(m.MEDIA_LOOP_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(i)}};Lr.getSlotTemplateHTML=ev;Lr.getTooltipContentHTML=tv;l.customElements.get("media-loop-button")||l.customElements.define("media-loop-button",Lr);var g=require("@mux/mux-video/base"),D=require("@mux/playback-core");var am=require("@mux/playback-core");var mi=require("@mux/playback-core");function Jc(t){let e="";return Object.entries(t).forEach(([i,a])=>{a!=null&&(e+=`${Dn(i)}: ${a}; `)}),e?e.trim():void 0}function Dn(t){return t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function On(t){return t.replace(/[-_]([a-z])/g,(e,i)=>i.toUpperCase())}function ce(t){if(t==null)return;let e=+t;return Number.isNaN(e)?void 0:e}function Ul(t){let e=iv(t).toString();return e?"?"+e:""}function iv(t){let e={};for(let i in t)t[i]!=null&&(e[i]=t[i]);return new URLSearchParams(e)}var Hl=(t,e)=>!t||!e?!1:t.contains(e)?!0:Hl(t,e.getRootNode().host);var jc="mux.com",av=()=>{try{return"3.10.2"}catch{}return"UNKNOWN"},rv=av(),Pn=()=>rv,em=(t,{token:e,customDomain:i=jc,thumbnailTime:a,programTime:r}={})=>{var d;let o=e==null?a:void 0,{aud:s}=(d=(0,mi.parseJwt)(e))!=null?d:{};if(!(e&&s!=="t"))return`https://image.${i}/${t}/thumbnail.webp${Ul({token:e,time:o,program_time:r})}`},tm=(t,{token:e,customDomain:i=jc,programStartTime:a,programEndTime:r}={})=>{var s;let{aud:o}=(s=(0,mi.parseJwt)(e))!=null?s:{};if(!(e&&o!=="s"))return`https://image.${i}/${t}/storyboard.vtt${Ul({token:e,format:"webp",program_start_time:a,program_end_time:r})}`},wr=t=>{if(t){if([mi.StreamTypes.LIVE,mi.StreamTypes.ON_DEMAND].includes(t))return t;if(t!=null&&t.includes("live"))return mi.StreamTypes.LIVE}};var ov={crossorigin:"crossOrigin",playsinline:"playsInline"};function im(t){var e;return(e=ov[t])!=null?e:On(t)}var ui,ci,me,Nn=class{constructor(e,i){pe(this,ui);pe(this,ci);pe(this,me,[]);ye(this,ui,e),ye(this,ci,i)}[Symbol.iterator](){return B(this,me).values()}get length(){return B(this,me).length}get value(){var e;return(e=B(this,me).join(" "))!=null?e:""}set value(e){var i;e!==this.value&&(ye(this,me,[]),this.add(...(i=e==null?void 0:e.split(" "))!=null?i:[]))}toString(){return this.value}item(e){return B(this,me)[e]}values(){return B(this,me).values()}keys(){return B(this,me).keys()}forEach(e){B(this,me).forEach(e)}add(...e){var i,a;e.forEach(r=>{this.contains(r)||B(this,me).push(r)}),!(this.value===""&&!((i=B(this,ui))!=null&&i.hasAttribute(`${B(this,ci)}`)))&&((a=B(this,ui))==null||a.setAttribute(`${B(this,ci)}`,`${this.value}`))}remove(...e){var i;e.forEach(a=>{B(this,me).splice(B(this,me).indexOf(a),1)}),(i=B(this,ui))==null||i.setAttribute(`${B(this,ci)}`,`${this.value}`)}contains(e){return B(this,me).includes(e)}toggle(e,i){return typeof i!="undefined"?i?(this.add(e),!0):(this.remove(e),!1):this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,i){this.remove(e),this.add(i)}};ui=new WeakMap,ci=new WeakMap,me=new WeakMap;var rm=`[mux-player ${Pn()}]`;function at(...t){console.warn(rm,...t)}function ge(...t){console.error(rm,...t)}function Bl(t){var i;let e=(i=t.message)!=null?i:"";t.context&&(e+=` ${t.context}`),t.file&&(e+=` ${(0,am.i18n)("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${t.file}`),at(e)}var le={AUTOPLAY:"autoplay",CROSSORIGIN:"crossorigin",LOOP:"loop",MUTED:"muted",PLAYSINLINE:"playsinline",PRELOAD:"preload"},Nt={VOLUME:"volume",PLAYBACKRATE:"playbackrate",MUTED:"muted"},lA={...le,...Nt},nm=Object.freeze({length:0,start(t){let e=t>>>0;if(e>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${e}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(t){let e=t>>>0;if(e>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${e}) is greater than or equal to the maximum bound (${this.length}).`);return 0}}),nv=Object.values(le).filter(t=>le.PLAYSINLINE!==t),sv=Object.values(Nt),lv=[...nv,...sv],$l=class extends ke.HTMLElement{static get observedAttributes(){return lv}constructor(){super()}attributeChangedCallback(e,i,a){var r,o;switch(e){case Nt.MUTED:{this.media&&(this.media.muted=a!=null,this.media.defaultMuted=a!=null);return}case Nt.VOLUME:{let s=(r=ce(a))!=null?r:1;this.media&&(this.media.volume=s);return}case Nt.PLAYBACKRATE:{let s=(o=ce(a))!=null?o:1;this.media&&(this.media.playbackRate=s,this.media.defaultPlaybackRate=s);return}}}play(){var e,i;return(i=(e=this.media)==null?void 0:e.play())!=null?i:Promise.reject()}pause(){var e;(e=this.media)==null||e.pause()}load(){var e;(e=this.media)==null||e.load()}get media(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("mux-video")}get audioTracks(){return this.media.audioTracks}get videoTracks(){return this.media.videoTracks}get audioRenditions(){return this.media.audioRenditions}get videoRenditions(){return this.media.videoRenditions}get paused(){var e,i;return(i=(e=this.media)==null?void 0:e.paused)!=null?i:!0}get duration(){var e,i;return(i=(e=this.media)==null?void 0:e.duration)!=null?i:NaN}get ended(){var e,i;return(i=(e=this.media)==null?void 0:e.ended)!=null?i:!1}get buffered(){var e,i;return(i=(e=this.media)==null?void 0:e.buffered)!=null?i:nm}get seekable(){var e,i;return(i=(e=this.media)==null?void 0:e.seekable)!=null?i:nm}get readyState(){var e,i;return(i=(e=this.media)==null?void 0:e.readyState)!=null?i:0}get videoWidth(){var e,i;return(i=(e=this.media)==null?void 0:e.videoWidth)!=null?i:0}get videoHeight(){var e,i;return(i=(e=this.media)==null?void 0:e.videoHeight)!=null?i:0}get currentSrc(){var e,i;return(i=(e=this.media)==null?void 0:e.currentSrc)!=null?i:""}get currentTime(){var e,i;return(i=(e=this.media)==null?void 0:e.currentTime)!=null?i:0}set currentTime(e){this.media&&(this.media.currentTime=Number(e))}get volume(){var e,i;return(i=(e=this.media)==null?void 0:e.volume)!=null?i:1}set volume(e){this.media&&(this.media.volume=Number(e))}get playbackRate(){var e,i;return(i=(e=this.media)==null?void 0:e.playbackRate)!=null?i:1}set playbackRate(e){this.media&&(this.media.playbackRate=Number(e))}get defaultPlaybackRate(){var e;return(e=ce(this.getAttribute(Nt.PLAYBACKRATE)))!=null?e:1}set defaultPlaybackRate(e){e!=null?this.setAttribute(Nt.PLAYBACKRATE,`${e}`):this.removeAttribute(Nt.PLAYBACKRATE)}get crossOrigin(){return Rr(this,le.CROSSORIGIN)}set crossOrigin(e){this.setAttribute(le.CROSSORIGIN,`${e}`)}get autoplay(){return Rr(this,le.AUTOPLAY)!=null}set autoplay(e){e?this.setAttribute(le.AUTOPLAY,typeof e=="string"?e:""):this.removeAttribute(le.AUTOPLAY)}get loop(){return Rr(this,le.LOOP)!=null}set loop(e){e?this.setAttribute(le.LOOP,""):this.removeAttribute(le.LOOP)}get muted(){var e,i;return(i=(e=this.media)==null?void 0:e.muted)!=null?i:!1}set muted(e){this.media&&(this.media.muted=!!e)}get defaultMuted(){return Rr(this,le.MUTED)!=null}set defaultMuted(e){e?this.setAttribute(le.MUTED,""):this.removeAttribute(le.MUTED)}get playsInline(){return Rr(this,le.PLAYSINLINE)!=null}set playsInline(e){ge("playsInline is set to true by default and is not currently supported as a setter.")}get preload(){return this.media?this.media.preload:this.getAttribute("preload")}set preload(e){["","none","metadata","auto"].includes(e)?this.setAttribute(le.PRELOAD,e):this.removeAttribute(le.PRELOAD)}};function Rr(t,e){return t.media?t.media.getAttribute(e):t.getAttribute(e)}var Wl=$l;var cm=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},N=(t,e,i)=>(cm(t,e,"read from private field"),i?i.call(t):e.get(t)),rt=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},gt=(t,e,i,a)=>(cm(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),ra,Un,hi,xr,Pt,Ut,Ht,pi,oa,Hn,$e,sm=1,lm=0,dv=1,uv={processCallback(t,e,i){if(i){for(let[a,r]of e)if(a in i){let o=i[a];typeof o=="boolean"&&r instanceof he&&typeof r.element[r.attributeName]=="boolean"?r.booleanValue=o:typeof o=="function"&&r instanceof he?r.element[r.attributeName]=o:r.value=o}}}},_t=class extends l.DocumentFragment{constructor(e,i,a=uv){var r;super(),rt(this,ra,void 0),rt(this,Un,void 0),this.append(e.content.cloneNode(!0)),gt(this,ra,mm(this)),gt(this,Un,a),(r=a.createCallback)==null||r.call(a,this,N(this,ra),i),a.processCallback(this,N(this,ra),i)}update(e){N(this,Un).processCallback(this,N(this,ra),e)}};ra=new WeakMap;Un=new WeakMap;var mm=(t,e=[])=>{let i,a;for(let r of t.attributes||[])if(r.value.includes("{{")){let o=new Fl;for([i,a]of um(r.value))if(!i)o.append(a);else{let s=new he(t,r.name,r.namespaceURI);o.append(s),e.push([a,s])}r.value=o.toString()}for(let r of t.childNodes)if(r.nodeType===sm&&!(r instanceof HTMLTemplateElement))mm(r,e);else{let o=r.data;if(r.nodeType===sm||o.includes("{{")){let s=[];if(o)for([i,a]of um(o))if(!i)s.push(new Text(a));else{let d=new At(t);s.push(d),e.push([a,d])}else if(r instanceof HTMLTemplateElement){let d=new Dr(t,r);s.push(d),e.push([d.expression,d])}r.replaceWith(...s.flatMap(d=>d.replacementNodes||[d]))}}return e},dm={},um=t=>{let e="",i=0,a=dm[t],r=0,o;if(a)return a;for(a=[];o=t[r];r++)o==="{"&&t[r+1]==="{"&&t[r-1]!=="\\"&&t[r+2]&&++i==1?(e&&a.push([lm,e]),e="",r++):o==="}"&&t[r+1]==="}"&&t[r-1]!=="\\"&&!--i?(a.push([dv,e.trim()]),e="",r++):e+=o||"";return e&&a.push([lm,(i>0?"{{":"")+e]),dm[t]=a},cv=11,Bn=class{get value(){return""}set value(e){}toString(){return this.value}},hm=new WeakMap,Fl=class{constructor(){rt(this,hi,[])}[Symbol.iterator](){return N(this,hi).values()}get length(){return N(this,hi).length}item(e){return N(this,hi)[e]}append(...e){for(let i of e)i instanceof he&&hm.set(i,this),N(this,hi).push(i)}toString(){return N(this,hi).join("")}};hi=new WeakMap;var he=class extends Bn{constructor(e,i,a){super(),rt(this,pi),rt(this,xr,""),rt(this,Pt,void 0),rt(this,Ut,void 0),rt(this,Ht,void 0),gt(this,Pt,e),gt(this,Ut,i),gt(this,Ht,a)}get attributeName(){return N(this,Ut)}get attributeNamespace(){return N(this,Ht)}get element(){return N(this,Pt)}get value(){return N(this,xr)}set value(e){N(this,xr)!==e&&(gt(this,xr,e),!N(this,pi,oa)||N(this,pi,oa).length===1?e==null?N(this,Pt).removeAttributeNS(N(this,Ht),N(this,Ut)):N(this,Pt).setAttributeNS(N(this,Ht),N(this,Ut),e):N(this,Pt).setAttributeNS(N(this,Ht),N(this,Ut),N(this,pi,oa).toString()))}get booleanValue(){return N(this,Pt).hasAttributeNS(N(this,Ht),N(this,Ut))}set booleanValue(e){if(!N(this,pi,oa)||N(this,pi,oa).length===1)this.value=e?"":null;else throw new DOMException("Value is not fully templatized")}};xr=new WeakMap;Pt=new WeakMap;Ut=new WeakMap;Ht=new WeakMap;pi=new WeakSet;oa=function(){return hm.get(this)};var At=class extends Bn{constructor(e,i){super(),rt(this,Hn,void 0),rt(this,$e,void 0),gt(this,Hn,e),gt(this,$e,i?[...i]:[new Text])}get replacementNodes(){return N(this,$e)}get parentNode(){return N(this,Hn)}get nextSibling(){return N(this,$e)[N(this,$e).length-1].nextSibling}get previousSibling(){return N(this,$e)[0].previousSibling}get value(){return N(this,$e).map(e=>e.textContent).join("")}set value(e){this.replace(e)}replace(...e){let i=e.flat().flatMap(a=>a==null?[new Text]:a.forEach?[...a]:a.nodeType===cv?[...a.childNodes]:a.nodeType?[a]:[new Text(a)]);i.length||i.push(new Text),gt(this,$e,mv(N(this,$e)[0].parentNode,N(this,$e),i,this.nextSibling))}};Hn=new WeakMap;$e=new WeakMap;var Dr=class extends At{constructor(e,i){let a=i.getAttribute("directive")||i.getAttribute("type"),r=i.getAttribute("expression")||i.getAttribute(a)||"";r.startsWith("{{")&&(r=r.trim().slice(2,-2).trim()),super(e),this.expression=r,this.template=i,this.directive=a}};function mv(t,e,i,a=null){let r=0,o,s,d,u=i.length,p=e.length;for(;r<u&&r<p&&e[r]==i[r];)r++;for(;r<u&&r<p&&i[u-1]==e[p-1];)a=i[--p,--u];if(r==p)for(;r<u;)t.insertBefore(i[r++],a);if(r==u)for(;r<p;)t.removeChild(e[r++]);else{for(o=e[r];r<u;)d=i[r++],s=o?o.nextSibling:a,o==d?o=s:r<u&&i[r]==s?(t.replaceChild(d,o),o=s):t.insertBefore(d,o);for(;o!=a;)s=o.nextSibling,t.removeChild(o),o=s}return i}var pm={string:t=>String(t)},Wn=class{constructor(e){this.template=e,this.state=void 0}},fi=new WeakMap,vi=new WeakMap,Vl={partial:(t,e)=>{e[t.expression]=new Wn(t.template)},if:(t,e)=>{var i;if(vm(t.expression,e))if(fi.get(t)!==t.template){fi.set(t,t.template);let a=new _t(t.template,e,Fn);t.replace(a),vi.set(t,a)}else(i=vi.get(t))==null||i.update(e);else t.replace(""),fi.delete(t),vi.delete(t)}},hv=Object.keys(Vl),Fn={processCallback(t,e,i){var a,r;if(i)for(let[o,s]of e){if(s instanceof Dr){if(!s.directive){let u=hv.find(p=>s.template.hasAttribute(p));u&&(s.directive=u,s.expression=s.template.getAttribute(u))}(a=Vl[s.directive])==null||a.call(Vl,s,i);continue}let d=vm(o,i);if(d instanceof Wn){fi.get(s)!==d.template?(fi.set(s,d.template),d=new _t(d.template,d.state,Fn),s.value=d,vi.set(s,d)):(r=vi.get(s))==null||r.update(d.state);continue}d?(s instanceof he&&s.attributeName.startsWith("aria-")&&(d=String(d)),s instanceof he?typeof d=="boolean"?s.booleanValue=d:typeof d=="function"?s.element[s.attributeName]=d:s.value=d:(s.value=d,fi.delete(s),vi.delete(s))):s instanceof he?s.value=void 0:(s.value=void 0,fi.delete(s),vi.delete(s))}}},fm={"!":t=>!t,"!!":t=>!!t,"==":(t,e)=>t==e,"!=":(t,e)=>t!=e,">":(t,e)=>t>e,">=":(t,e)=>t>=e,"<":(t,e)=>t<e,"<=":(t,e)=>t<=e,"??":(t,e)=>t!=null?t:e,"|":(t,e)=>{var i;return(i=pm[e])==null?void 0:i.call(pm,t)}};function pv(t){return fv(t,{boolean:/true|false/,number:/-?\d+\.?\d*/,string:/(["'])((?:\\.|[^\\])*?)\1/,operator:/[!=><][=!]?|\?\?|\|/,ws:/\s+/,param:/[$a-z_][$\w]*/i}).filter(({type:e})=>e!=="ws")}function vm(t,e={}){var i,a,r,o,s,d,u;let p=pv(t);if(p.length===0||p.some(({type:T})=>!T))return Or(t);if(((i=p[0])==null?void 0:i.token)===">"){let T=e[(a=p[1])==null?void 0:a.token];if(!T)return Or(t);let _={...e};T.state=_;let E=p.slice(2);for(let f=0;f<E.length;f+=3){let M=(r=E[f])==null?void 0:r.token,b=(o=E[f+1])==null?void 0:o.token,C=(s=E[f+2])==null?void 0:s.token;M&&b==="="&&(_[M]=Nr(C,e))}return T}if(p.length===1)return $n(p[0])?Nr(p[0].token,e):Or(t);if(p.length===2){let T=(d=p[0])==null?void 0:d.token,_=fm[T];if(!_||!$n(p[1]))return Or(t);let E=Nr(p[1].token,e);return _(E)}if(p.length===3){let T=(u=p[1])==null?void 0:u.token,_=fm[T];if(!_||!$n(p[0])||!$n(p[2]))return Or(t);let E=Nr(p[0].token,e);if(T==="|")return _(E,p[2].token);let f=Nr(p[2].token,e);return _(E,f)}}function Or(t){return console.warn(`Warning: invalid expression \`${t}\``),!1}function $n({type:t}){return["number","boolean","string","param"].includes(t)}function Nr(t,e){let i=t[0],a=t.slice(-1);return t==="true"||t==="false"?t==="true":i===a&&["'",'"'].includes(i)?t.slice(1,-1):co(t)?parseFloat(t):e[t]}function fv(t,e){let i,a,r,o=[];for(;t;){r=null,i=t.length;for(let s in e)a=e[s].exec(t),a&&a.index<i&&(r={token:a[0],type:s,matches:a.slice(1)},i=a.index);i&&o.push({token:t.substr(0,i),type:void 0}),r&&o.push(r),t=t.substr(i+(r?r.token.length:0))}return o}var Ql=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Yl=(t,e,i)=>(Ql(t,e,"read from private field"),i?i.call(t):e.get(t)),Pr=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Ei=(t,e,i,a)=>(Ql(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Kl=(t,e,i)=>(Ql(t,e,"access private method"),i),na,Vn,sa,ql,Em,Kn,Zl,Gl={mediatargetlivewindow:"targetlivewindow",mediastreamtype:"streamtype"},bm=V.createElement("template");bm.innerHTML=`
  <style>
    :host {
      display: inline-block;
      line-height: 0;
    }

    media-controller {
      width: 100%;
      height: 100%;
    }

    media-captions-button:not([mediasubtitleslist]),
    media-captions-menu:not([mediasubtitleslist]),
    media-captions-menu-button:not([mediasubtitleslist]),
    media-audio-track-menu[mediaaudiotrackunavailable],
    media-audio-track-menu-button[mediaaudiotrackunavailable],
    media-rendition-menu[mediarenditionunavailable],
    media-rendition-menu-button[mediarenditionunavailable],
    media-volume-range[mediavolumeunavailable],
    media-airplay-button[mediaairplayunavailable],
    media-fullscreen-button[mediafullscreenunavailable],
    media-cast-button[mediacastunavailable],
    media-pip-button[mediapipunavailable] {
      display: none;
    }
  </style>
`;var bi=class extends l.HTMLElement{constructor(){super(),Pr(this,ql),Pr(this,Kn),Pr(this,na,void 0),Pr(this,Vn,void 0),Pr(this,sa,void 0),this.shadowRoot?this.renderRoot=this.shadowRoot:(this.renderRoot=this.attachShadow({mode:"open"}),this.createRenderer());let e=new MutationObserver(i=>{var a;this.mediaController&&!((a=this.mediaController)!=null&&a.breakpointsComputed)||i.some(r=>{let o=r.target;return o===this?!0:o.localName!=="media-controller"?!1:!!(Gl[r.attributeName]||r.attributeName.startsWith("breakpoint"))})&&this.render()});e.observe(this,{attributes:!0}),e.observe(this.renderRoot,{attributes:!0,subtree:!0}),this.addEventListener(Le.BREAKPOINTS_COMPUTED,this.render),Kl(this,ql,Em).call(this,"template")}get mediaController(){return this.renderRoot.querySelector("media-controller")}get template(){var e;return(e=Yl(this,na))!=null?e:this.constructor.template}set template(e){if(e===null){this.removeAttribute("template");return}typeof e=="string"?this.setAttribute("template",e):e instanceof HTMLTemplateElement&&(Ei(this,na,e),Ei(this,sa,null),this.createRenderer())}get props(){var e,i,a;let r=[...Array.from((i=(e=this.mediaController)==null?void 0:e.attributes)!=null?i:[]).filter(({name:s})=>Gl[s]||s.startsWith("breakpoint")),...Array.from(this.attributes)],o={};for(let s of r){let d=(a=Gl[s.name])!=null?a:Eu(s.name),{value:u}=s;u!=null?(co(u)&&(u=parseFloat(u)),o[d]=u===""?!0:u):o[d]=!1}return o}attributeChangedCallback(e,i,a){e==="template"&&i!=a&&Kl(this,Kn,Zl).call(this)}connectedCallback(){Kl(this,Kn,Zl).call(this)}createRenderer(){this.template instanceof HTMLTemplateElement&&this.template!==Yl(this,Vn)&&(Ei(this,Vn,this.template),this.renderer=new _t(this.template,this.props,this.constructor.processor),this.renderRoot.textContent="",this.renderRoot.append(bm.content.cloneNode(!0),this.renderer))}render(){var e;(e=this.renderer)==null||e.update(this.props)}};na=new WeakMap;Vn=new WeakMap;sa=new WeakMap;ql=new WeakSet;Em=function(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}};Kn=new WeakSet;Zl=function(){var t;let e=this.getAttribute("template");if(!e||e===Yl(this,sa))return;let i=this.getRootNode(),a=(t=i==null?void 0:i.getElementById)==null?void 0:t.call(i,e);if(a){Ei(this,sa,e),Ei(this,na,a),this.createRenderer();return}vv(e)&&(Ei(this,sa,e),Ev(e).then(r=>{let o=V.createElement("template");o.innerHTML=r,Ei(this,na,o),this.createRenderer()}).catch(console.error))};bi.observedAttributes=["template"];bi.processor=Fn;function vv(t){if(!/^(\/|\.\/|https?:\/\/)/.test(t))return!1;let e=/^https?:\/\//.test(t)?void 0:location.origin;try{new URL(t,e)}catch{return!1}return!0}async function Ev(t){let e=await fetch(t);if(e.status!==200)throw new Error(`Failed to load resource: the server responded with a status of ${e.status}`);return e.text()}l.customElements.get("media-theme")||l.customElements.define("media-theme",bi);var gm=`:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`;var Ur=new WeakMap,Xl=class t{constructor(e,i){this.element=e;this.type=i;this.element.addEventListener(this.type,this);let a=Ur.get(this.element);a&&a.set(this.type,this)}set(e){if(typeof e=="function")this.handleEvent=e.bind(this.element);else if(typeof e=="object"&&typeof e.handleEvent=="function")this.handleEvent=e.handleEvent.bind(e);else{this.element.removeEventListener(this.type,this);let i=Ur.get(this.element);i&&i.delete(this.type)}}static for(e){Ur.has(e.element)||Ur.set(e.element,new Map);let i=e.attributeName.slice(2),a=Ur.get(e.element);return a&&a.has(i)?a.get(i):new t(e.element,i)}};function gv(t,e){return t instanceof he&&t.attributeName.startsWith("on")?(Xl.for(t).set(e),t.element.removeAttributeNS(t.attributeNamespace,t.attributeName),!0):!1}function _v(t,e){return e instanceof Gn&&t instanceof At?(e.renderInto(t),!0):!1}function Av(t,e){return e instanceof DocumentFragment&&t instanceof At?(e.childNodes.length&&t.replace(...e.childNodes),!0):!1}function Tv(t,e){if(t instanceof he){let i=t.attributeNamespace,a=t.element.getAttributeNS(i,t.attributeName);return String(e)!==a&&(t.value=String(e)),!0}return t.value=String(e),!0}function yv(t,e){if(t instanceof he&&e instanceof Element){let i=t.element;return i[t.attributeName]!==e&&(t.element.removeAttributeNS(t.attributeNamespace,t.attributeName),i[t.attributeName]=e),!0}return!1}function kv(t,e){if(typeof e=="boolean"&&t instanceof he){let i=t.attributeNamespace,a=t.element.hasAttributeNS(i,t.attributeName);return e!==a&&(t.booleanValue=e),!0}return!1}function Sv(t,e){return e===!1&&t instanceof At?(t.replace(""),!0):!1}function Iv(t,e){yv(t,e)||kv(t,e)||gv(t,e)||Sv(t,e)||_v(t,e)||Av(t,e)||Tv(t,e)}var zl=new Map,_m=new WeakMap,Am=new WeakMap,Gn=class{constructor(e,i,a){this.strings=e;this.values=i;this.processor=a;this.stringsKey=this.strings.join("")}get template(){if(zl.has(this.stringsKey))return zl.get(this.stringsKey);{let e=Gt.createElement("template"),i=this.strings.length-1;return e.innerHTML=this.strings.reduce((a,r,o)=>a+r+(o<i?`{{ ${o} }}`:""),""),zl.set(this.stringsKey,e),e}}renderInto(e){var r;let i=this.template;if(_m.get(e)!==i){_m.set(e,i);let o=new _t(i,this.values,this.processor);Am.set(e,o),e instanceof At?e.replace(...o.children):e.appendChild(o);return}let a=Am.get(e);(r=a==null?void 0:a.update)==null||r.call(a,this.values)}},Mv={processCallback(t,e,i){var a;if(i){for(let[r,o]of e)if(r in i){let s=(a=i[r])!=null?a:"";Iv(o,s)}}}};function Hr(t,...e){return new Gn(t,e,Mv)}function Tm(t,e){t.renderInto(e)}var Br=require("@mux/playback-core"),Cv=t=>{let{tokens:e}=t;return e.drm?":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }":""},ym=t=>Hr`
  <style>
    ${Cv(t)}
    ${gm}
  </style>
  ${xv(t)}
`,Lv=t=>{let e=t.hotKeys?`${t.hotKeys}`:"";return wr(t.streamType)==="live"&&(e+=" noarrowleft noarrowright"),e},wv={TOP:"top",CENTER:"center",BOTTOM:"bottom",LAYER:"layer",MEDIA_LAYER:"media-layer",POSTER_LAYER:"poster-layer",VERTICAL_LAYER:"vertical-layer",CENTERED_LAYER:"centered-layer",GESTURE_LAYER:"gesture-layer",CONTROLLER_LAYER:"controller",BUTTON:"button",RANGE:"range",THUMB:"thumb",DISPLAY:"display",CONTROL_BAR:"control-bar",MENU_BUTTON:"menu-button",MENU:"menu",MENU_ITEM:"menu-item",OPTION:"option",POSTER:"poster",LIVE:"live",PLAY:"play",PRE_PLAY:"pre-play",SEEK_BACKWARD:"seek-backward",SEEK_FORWARD:"seek-forward",MUTE:"mute",CAPTIONS:"captions",AIRPLAY:"airplay",PIP:"pip",FULLSCREEN:"fullscreen",CAST:"cast",PLAYBACK_RATE:"playback-rate",VOLUME:"volume",TIME:"time",TITLE:"title",AUDIO_TRACK:"audio-track",RENDITION:"rendition"},Rv=Object.values(wv).join(", "),xv=t=>{var e,i,a,r,o,s,d,u,p,T,_,E,f,M,b,C,L,ie,Ae,kt,mt,Ia,Ma,Ca,La,wa,Ra,xa,Da,Oa,Na,Pa,so,ht,Ua,Ha,Ba,$a;return Hr`
  <media-theme
    template="${t.themeTemplate||!1}"
    defaultstreamtype="${(e=t.defaultStreamType)!=null?e:!1}"
    hotkeys="${Lv(t)||!1}"
    nohotkeys="${t.noHotKeys||!t.hasSrc||!1}"
    noautoseektolive="${!!((i=t.streamType)!=null&&i.includes(Br.StreamTypes.LIVE))&&t.targetLiveWindow!==0}"
    novolumepref="${t.novolumepref||!1}"
    nomutedpref="${t.nomutedpref||!1}"
    disabled="${!t.hasSrc||t.isDialogOpen}"
    audio="${(a=t.audio)!=null?a:!1}"
    style="${(r=Jc({"--media-primary-color":t.primaryColor,"--media-secondary-color":t.secondaryColor,"--media-accent-color":t.accentColor}))!=null?r:!1}"
    defaultsubtitles="${!t.defaultHiddenCaptions}"
    forwardseekoffset="${(o=t.forwardSeekOffset)!=null?o:!1}"
    backwardseekoffset="${(s=t.backwardSeekOffset)!=null?s:!1}"
    playbackrates="${(d=t.playbackRates)!=null?d:!1}"
    defaultshowremainingtime="${(u=t.defaultShowRemainingTime)!=null?u:!1}"
    defaultduration="${(p=t.defaultDuration)!=null?p:!1}"
    hideduration="${(T=t.hideDuration)!=null?T:!1}"
    title="${(_=t.title)!=null?_:!1}"
    videotitle="${(E=t.videoTitle)!=null?E:!1}"
    proudlydisplaymuxbadge="${(f=t.proudlyDisplayMuxBadge)!=null?f:!1}"
    exportparts="${Rv}"
    onclose="${t.onCloseErrorDialog}"
    onfocusin="${t.onFocusInErrorDialog}"
  >
    <mux-video
      slot="media"
      inert="${(M=t.noHotKeys)!=null?M:!1}"
      target-live-window="${(b=t.targetLiveWindow)!=null?b:!1}"
      stream-type="${(C=wr(t.streamType))!=null?C:!1}"
      crossorigin="${(L=t.crossOrigin)!=null?L:""}"
      playsinline
      autoplay="${(ie=t.autoplay)!=null?ie:!1}"
      muted="${(Ae=t.muted)!=null?Ae:!1}"
      loop="${(kt=t.loop)!=null?kt:!1}"
      preload="${(mt=t.preload)!=null?mt:!1}"
      debug="${(Ia=t.debug)!=null?Ia:!1}"
      prefer-cmcd="${(Ma=t.preferCmcd)!=null?Ma:!1}"
      disable-tracking="${(Ca=t.disableTracking)!=null?Ca:!1}"
      disable-cookies="${(La=t.disableCookies)!=null?La:!1}"
      prefer-playback="${(wa=t.preferPlayback)!=null?wa:!1}"
      start-time="${t.startTime!=null?t.startTime:!1}"
      beacon-collection-domain="${(Ra=t.beaconCollectionDomain)!=null?Ra:!1}"
      player-init-time="${(xa=t.playerInitTime)!=null?xa:!1}"
      player-software-name="${(Da=t.playerSoftwareName)!=null?Da:!1}"
      player-software-version="${(Oa=t.playerSoftwareVersion)!=null?Oa:!1}"
      env-key="${(Na=t.envKey)!=null?Na:!1}"
      custom-domain="${(Pa=t.customDomain)!=null?Pa:!1}"
      src="${t.src?t.src:t.playbackId?(0,Br.toMuxVideoURL)(t):!1}"
      cast-src="${t.src?t.src:t.playbackId?(0,Br.toMuxVideoURL)(t):!1}"
      cast-receiver="${(so=t.castReceiver)!=null?so:!1}"
      drm-token="${(Ua=(ht=t.tokens)==null?void 0:ht.drm)!=null?Ua:!1}"
      exportparts="video"
      disable-pseudo-ended="${(Ha=t.disablePseudoEnded)!=null?Ha:!1}"
      max-auto-resolution="${(Ba=t.maxAutoResolution)!=null?Ba:!1}"
    >
      ${t.storyboard?Hr`<track label="thumbnails" default kind="metadata" src="${t.storyboard}" />`:Hr``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${t.poster?t.poster:!1}"
        placeholdersrc="${($a=t.placeholder)!=null?$a:!1}"
      ></media-poster-image>
    </slot>
  </media-theme>
`};var A=require("@mux/playback-core"),km=t=>t.charAt(0).toUpperCase()+t.slice(1),Dv=(t,e=!1)=>{var i,a;if(t.muxCode){let r=km((i=t.errorCategory)!=null?i:"video"),o=(0,A.errorCategoryToTokenNameOrPrefix)((a=t.errorCategory)!=null?a:A.MuxErrorCategory.VIDEO);if(t.muxCode===A.MuxErrorCode.NETWORK_OFFLINE)return(0,A.i18n)("Your device appears to be offline",e);if(t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_EXPIRED)return(0,A.i18n)("{category} URL has expired",e).format({category:r});if([A.MuxErrorCode.NETWORK_TOKEN_SUB_MISMATCH,A.MuxErrorCode.NETWORK_TOKEN_AUD_MISMATCH,A.MuxErrorCode.NETWORK_TOKEN_AUD_MISSING,A.MuxErrorCode.NETWORK_TOKEN_MALFORMED].includes(t.muxCode))return(0,A.i18n)("{category} URL is formatted incorrectly",e).format({category:r});if(t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_MISSING)return(0,A.i18n)("Invalid {categoryName} URL",e).format({categoryName:o});if(t.muxCode===A.MuxErrorCode.NETWORK_NOT_FOUND)return(0,A.i18n)("{category} does not exist",e).format({category:r});if(t.muxCode===A.MuxErrorCode.NETWORK_NOT_READY){let s=t.streamType==="live"?"Live stream":"Video";return(0,A.i18n)("{mediaType} is not currently available",e).format({mediaType:s})}}if(t.code){if(t.code===A.MediaError.MEDIA_ERR_NETWORK)return(0,A.i18n)("Network Error",e);if(t.code===A.MediaError.MEDIA_ERR_DECODE)return(0,A.i18n)("Media Error",e);if(t.code===A.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)return(0,A.i18n)("Source Not Supported",e)}return(0,A.i18n)("Error",e)},Ov=(t,e=!1)=>{var i,a;if(t.muxCode){let r=km((i=t.errorCategory)!=null?i:"video"),o=(0,A.errorCategoryToTokenNameOrPrefix)((a=t.errorCategory)!=null?a:A.MuxErrorCategory.VIDEO);return t.muxCode===A.MuxErrorCode.NETWORK_OFFLINE?(0,A.i18n)("Check your internet connection and try reloading this video.",e):t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_EXPIRED?(0,A.i18n)("The video\u2019s secured {tokenNamePrefix}-token has expired.",e).format({tokenNamePrefix:o}):t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_SUB_MISMATCH?(0,A.i18n)("The video\u2019s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",e).format({tokenNamePrefix:o}):t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_MALFORMED?(0,A.i18n)("{category} URL is formatted incorrectly",e).format({category:r}):[A.MuxErrorCode.NETWORK_TOKEN_AUD_MISMATCH,A.MuxErrorCode.NETWORK_TOKEN_AUD_MISSING].includes(t.muxCode)?(0,A.i18n)("The {tokenNamePrefix}-token is formatted with incorrect information.",e).format({tokenNamePrefix:o}):[A.MuxErrorCode.NETWORK_TOKEN_MISSING,A.MuxErrorCode.NETWORK_INVALID_URL].includes(t.muxCode)?(0,A.i18n)("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.",e).format({tokenNamePrefix:o}):t.muxCode===A.MuxErrorCode.NETWORK_NOT_FOUND?"":t.message}return t.code&&(t.code===A.MediaError.MEDIA_ERR_NETWORK||t.code===A.MediaError.MEDIA_ERR_DECODE||t.code===A.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED),t.message},Sm=(t,e=!1)=>{let i=Dv(t,e).toString(),a=Ov(t,e).toString();return{title:i,message:a}},Nv=t=>{if(t.muxCode){if(t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_EXPIRED)return"403-expired-token.md";if(t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_MALFORMED)return"403-malformatted-token.md";if([A.MuxErrorCode.NETWORK_TOKEN_AUD_MISMATCH,A.MuxErrorCode.NETWORK_TOKEN_AUD_MISSING].includes(t.muxCode))return"403-incorrect-aud-value.md";if(t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_SUB_MISMATCH)return"403-playback-id-mismatch.md";if(t.muxCode===A.MuxErrorCode.NETWORK_TOKEN_MISSING)return"missing-signed-tokens.md";if(t.muxCode===A.MuxErrorCode.NETWORK_NOT_FOUND)return"404-not-found.md";if(t.muxCode===A.MuxErrorCode.NETWORK_NOT_READY)return"412-not-playable.md"}if(t.code){if(t.code===A.MediaError.MEDIA_ERR_NETWORK)return"";if(t.code===A.MediaError.MEDIA_ERR_DECODE)return"media-decode-error.md";if(t.code===A.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)return"media-src-not-supported.md"}return""},Jl=(t,e)=>{let i=Nv(t);return{message:t.message,context:t.context,file:i}};var Im=`<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before,
    :host([videotitle]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}" exportparts="thumb">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>

    <template if="!audio">
      <media-error-dialog slot="dialog" noautohide></media-error-dialog>
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`;function Mm({anchor:t,floating:e,placement:i}){let a=Uv({anchor:t,floating:e}),{x:r,y:o}=Bv(a,i);return{x:r,y:o}}function Uv({anchor:t,floating:e}){return{anchor:Hv(t,e.offsetParent),floating:{x:0,y:0,width:e.offsetWidth,height:e.offsetHeight}}}function Hv(t,e){var i;let a=t.getBoundingClientRect(),r=(i=e==null?void 0:e.getBoundingClientRect())!=null?i:{x:0,y:0};return{x:a.x-r.x,y:a.y-r.y,width:a.width,height:a.height}}function Bv({anchor:t,floating:e},i){let a=$v(i)==="x"?"y":"x",r=a==="y"?"height":"width",o=Cm(i),s=t.x+t.width/2-e.width/2,d=t.y+t.height/2-e.height/2,u=t[r]/2-e[r]/2,p;switch(o){case"top":p={x:s,y:t.y-e.height};break;case"bottom":p={x:s,y:t.y+t.height};break;case"right":p={x:t.x+t.width,y:d};break;case"left":p={x:t.x-e.width,y:d};break;default:p={x:t.x,y:t.y}}switch(i.split("-")[1]){case"start":p[a]-=u;break;case"end":p[a]+=u;break}return p}function Cm(t){return t.split("-")[0]}function $v(t){return["top","bottom"].includes(Cm(t))?"y":"x"}var Bt=class extends Event{constructor({action:e="auto",relatedTarget:i,...a}){super("invoke",a),this.action=e,this.relatedTarget=i}},Yn=class extends Event{constructor({newState:e,oldState:i,...a}){super("toggle",a),this.newState=e,this.oldState=i}};var ud=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},$=(t,e,i)=>(ud(t,e,"read from private field"),i?i.call(t):e.get(t)),K=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},ot=(t,e,i,a)=>(ud(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),G=(t,e,i)=>(ud(t,e,"access private method"),i),nt,_i,$t,qn,Zn,Ai,Fr,jl,Lm,Xn,cd,Jn,Qn,ed,td,wm,id,Rm,ad,xm,la,da,ua,Vr,jn,md,rd,Dm,hd,Om,od,Nm,pd,Pm,nd,Um,sd,Hm,$r,es,ld,Bm,Wr,ts,zn,dd;function st({type:t,text:e,value:i,checked:a}){let r=V.createElement("media-chrome-menu-item");r.type=t!=null?t:"",r.part.add("menu-item"),t&&r.part.add(t),r.value=i,r.checked=a;let o=V.createElement("span");return o.textContent=e,r.append(o),r}function We(t,e){let i=t.querySelector(`:scope > [slot="${e}"]`);if((i==null?void 0:i.nodeName)=="SLOT"&&(i=i.assignedElements({flatten:!0})[0]),i)return i=i.cloneNode(!0),i;let a=t.shadowRoot.querySelector(`[name="${e}"] > svg`);return a?a.cloneNode(!0):""}function Wv(t){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-menu-background, var(--media-control-background, var(--media-secondary-color, var(--_menu-bg))));
        border-radius: var(--media-menu-border-radius);
        border: var(--media-menu-border, none);
        display: var(--media-menu-display, inline-flex) !important;
        
        transition: var(--media-menu-transition-in,
          visibility 0s,
          opacity .2s ease-out,
          transform .15s ease-out,
          left .2s ease-in-out,
          min-width .2s ease-in-out,
          min-height .2s ease-in-out
        ) !important;
        
        visibility: var(--media-menu-visibility, visible);
        opacity: var(--media-menu-opacity, 1);
        max-height: var(--media-menu-max-height, var(--_menu-max-height, 300px));
        transform: var(--media-menu-transform-in, translateY(0) scale(1));
        flex-direction: column;
        
        min-height: 0;
        position: relative;
        bottom: var(--_menu-bottom);
        box-sizing: border-box;
      } 

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([hidden]) {
        transition: var(--media-menu-transition-out,
          visibility .15s ease-in,
          opacity .15s ease-in,
          transform .15s ease-in
        ) !important;
        visibility: var(--media-menu-hidden-visibility, hidden);
        opacity: var(--media-menu-hidden-opacity, 0);
        max-height: var(--media-menu-hidden-max-height,
          var(--media-menu-max-height, var(--_menu-max-height, 300px)));
        transform: var(--media-menu-transform-out, translateY(2px) scale(.99));
        pointer-events: none;
      }

      :host([slot="submenu"]) {
        background: none;
        width: 100%;
        min-height: 100%;
        position: absolute;
        bottom: 0;
        right: -100%;
      }

      #container {
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: transform .2s ease-out;
        transform: translate(0, 0);
      }

      #container.has-expanded {
        transition: transform .2s ease-in;
        transform: translate(-100%, 0);
      }

      button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        outline: inherit;
        display: inline-flex;
        align-items: center;
      }

      slot[name="header"][hidden] {
        display: none;
      }

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .7em;
        border-bottom: 1px solid rgb(255 255 255 / .25);
        cursor: var(--media-cursor, default);
      }

      slot[name="header"] > button[part~="back"],
      slot[name="header"]::slotted(button[part~="back"]) {
        cursor: var(--media-cursor, pointer);
      }

      svg[part~="back"] {
        height: var(--media-menu-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
        margin-right: .5ch;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap);
        flex-direction: var(--media-menu-flex-direction, column);
        overflow: var(--media-menu-overflow, hidden auto);
        display: flex;
        min-height: 0;
      }

      :host([role="menu"]) slot:not([name]) {
        padding-block: .4em;
      }

      slot:not([name])::slotted([role="menu"]) {
        background: none;
      }

      media-chrome-menu-item > span {
        margin-right: .5ch;
        max-width: var(--media-menu-item-max-width);
        text-overflow: ellipsis;
        overflow: hidden;
      }
    </style>
    <style id="layout-row" media="width:0">

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .5em;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap, .25em);
        flex-direction: var(--media-menu-flex-direction, row);
        padding-inline: .5em;
      }

      media-chrome-menu-item {
        padding: .3em .5em;
      }

      media-chrome-menu-item[aria-checked="true"] {
        background: var(--media-menu-item-checked-background, rgb(255 255 255 / .2));
      }

      
      media-chrome-menu-item::part(checked-indicator) {
        display: var(--media-menu-item-checked-indicator-display, none);
      }
    </style>
    <div id="container" part="container">
      <slot name="header" hidden>
        <button part="back button" aria-label="Back to previous menu">
          <slot name="back-icon">
            <svg aria-hidden="true" viewBox="0 0 20 24" part="back indicator">
              <path d="m11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z"/>
            </svg>
          </slot>
          <slot name="title"></slot>
        </button>
      </slot>
      <slot></slot>
    </div>
    <slot name="checked-indicator" hidden></slot>
  `}var gi={STYLE:"style",HIDDEN:"hidden",DISABLED:"disabled",ANCHOR:"anchor"},j=class extends l.HTMLElement{constructor(){if(super(),K(this,jl),K(this,Xn),K(this,Qn),K(this,td),K(this,id),K(this,ad),K(this,ua),K(this,jn),K(this,rd),K(this,hd),K(this,od),K(this,pd),K(this,nd),K(this,sd),K(this,$r),K(this,ld),K(this,Wr),K(this,zn),K(this,nt,null),K(this,_i,null),K(this,$t,null),K(this,qn,new Set),K(this,Zn,void 0),K(this,Ai,!1),K(this,Fr,null),K(this,Jn,()=>{let e=$(this,qn),i=new Set(this.items);for(let a of e)i.has(a)||this.dispatchEvent(new CustomEvent("removemenuitem",{detail:a}));for(let a of i)e.has(a)||this.dispatchEvent(new CustomEvent("addmenuitem",{detail:a}));ot(this,qn,i)}),K(this,la,()=>{G(this,ua,Vr).call(this),G(this,jn,md).call(this,!1)}),K(this,da,()=>{G(this,ua,Vr).call(this)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}this.container=this.shadowRoot.querySelector("#container"),this.defaultSlot=this.shadowRoot.querySelector("slot:not([name])"),this.shadowRoot.addEventListener("slotchange",this),ot(this,Zn,new MutationObserver($(this,Jn))),$(this,Zn).observe(this.defaultSlot,{childList:!0})}static get observedAttributes(){return[gi.DISABLED,gi.HIDDEN,gi.STYLE,gi.ANCHOR,x.MEDIA_CONTROLLER]}static formatMenuItemText(e,i){return e}enable(){this.addEventListener("click",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this),this.addEventListener("invoke",this),this.addEventListener("toggle",this)}disable(){this.removeEventListener("click",this),this.removeEventListener("focusout",this),this.removeEventListener("keyup",this),this.removeEventListener("invoke",this),this.removeEventListener("toggle",this)}handleEvent(e){switch(e.type){case"slotchange":G(this,jl,Lm).call(this,e);break;case"invoke":G(this,td,wm).call(this,e);break;case"click":G(this,rd,Dm).call(this,e);break;case"toggle":G(this,od,Nm).call(this,e);break;case"focusout":G(this,nd,Um).call(this,e);break;case"keydown":G(this,sd,Hm).call(this,e);break}}connectedCallback(){var e,i;ot(this,Fr,Ya(this.shadowRoot,":host")),G(this,Qn,ed).call(this),this.hasAttribute("disabled")||this.enable(),this.role||(this.role="menu"),ot(this,nt,vo(this)),(i=(e=$(this,nt))==null?void 0:e.associateElement)==null||i.call(e,this),this.hidden||(pt(Kr(this),$(this,la)),pt(this,$(this,da))),G(this,Xn,cd).call(this)}disconnectedCallback(){var e,i;ft(Kr(this),$(this,la)),ft(this,$(this,da)),this.disable(),(i=(e=$(this,nt))==null?void 0:e.unassociateElement)==null||i.call(e,this),ot(this,nt,null)}attributeChangedCallback(e,i,a){var r,o,s,d;e===gi.HIDDEN&&a!==i?($(this,Ai)||ot(this,Ai,!0),this.hidden?G(this,ad,xm).call(this):G(this,id,Rm).call(this),this.dispatchEvent(new Yn({oldState:this.hidden?"open":"closed",newState:this.hidden?"closed":"open",bubbles:!0}))):e===x.MEDIA_CONTROLLER?(i&&((o=(r=$(this,nt))==null?void 0:r.unassociateElement)==null||o.call(r,this),ot(this,nt,null)),a&&this.isConnected&&(ot(this,nt,vo(this)),(d=(s=$(this,nt))==null?void 0:s.associateElement)==null||d.call(s,this))):e===gi.DISABLED&&a!==i?a==null?this.enable():this.disable():e===gi.STYLE&&a!==i&&G(this,Qn,ed).call(this)}formatMenuItemText(e,i){return this.constructor.formatMenuItemText(e,i)}get anchor(){return this.getAttribute("anchor")}set anchor(e){this.setAttribute("anchor",`${e}`)}get anchorElement(){var e;return this.anchor?(e=qt(this))==null?void 0:e.querySelector(`#${this.anchor}`):null}get items(){return this.defaultSlot.assignedElements({flatten:!0}).filter(Fv)}get radioGroupItems(){return this.items.filter(e=>e.role==="menuitemradio")}get checkedItems(){return this.items.filter(e=>e.checked)}get value(){var e,i;return(i=(e=this.checkedItems[0])==null?void 0:e.value)!=null?i:""}set value(e){let i=this.items.find(a=>a.value===e);i&&G(this,zn,dd).call(this,i)}focus(){if(ot(this,_i,Ga()),this.items.length){G(this,Wr,ts).call(this,this.items[0]),this.items[0].focus();return}let e=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');e==null||e.focus()}handleSelect(e){var i;let a=G(this,$r,es).call(this,e);a&&(G(this,zn,dd).call(this,a,a.type==="checkbox"),$(this,$t)&&!this.hidden&&((i=$(this,_i))==null||i.focus(),this.hidden=!0))}get keysUsed(){return["Enter","Escape","Tab"," ","ArrowDown","ArrowUp","Home","End"]}handleMove(e){var i,a;let{key:r}=e,o=this.items,s=(a=(i=G(this,$r,es).call(this,e))!=null?i:G(this,ld,Bm).call(this))!=null?a:o[0],d=o.indexOf(s),u=Math.max(0,d);r==="ArrowDown"?u++:r==="ArrowUp"?u--:e.key==="Home"?u=0:e.key==="End"&&(u=o.length-1),u<0&&(u=o.length-1),u>o.length-1&&(u=0),G(this,Wr,ts).call(this,o[u]),o[u].focus()}};nt=new WeakMap;_i=new WeakMap;$t=new WeakMap;qn=new WeakMap;Zn=new WeakMap;Ai=new WeakMap;Fr=new WeakMap;jl=new WeakSet;Lm=function(t){let e=t.target;for(let i of e.assignedNodes({flatten:!0}))i.nodeType===3&&i.textContent.trim()===""&&i.remove();["header","title"].includes(e.name)&&G(this,Xn,cd).call(this),e.name||$(this,Jn).call(this)};Xn=new WeakSet;cd=function(){let t=this.shadowRoot.querySelector('slot[name="header"]'),e=this.shadowRoot.querySelector('slot[name="title"]');t.hidden=e.assignedNodes().length===0&&t.assignedNodes().length===0};Jn=new WeakMap;Qn=new WeakSet;ed=function(){var t;let e=this.shadowRoot.querySelector("#layout-row"),i=(t=getComputedStyle(this).getPropertyValue("--media-menu-layout"))==null?void 0:t.trim();e.setAttribute("media",i==="row"?"":"width:0")};td=new WeakSet;wm=function(t){ot(this,$t,t.relatedTarget),ue(this,t.relatedTarget)||(this.hidden=!this.hidden)};id=new WeakSet;Rm=function(){var t;(t=$(this,$t))==null||t.setAttribute("aria-expanded","true"),this.addEventListener("transitionend",()=>this.focus(),{once:!0}),pt(Kr(this),$(this,la)),pt(this,$(this,da))};ad=new WeakSet;xm=function(){var t;(t=$(this,$t))==null||t.setAttribute("aria-expanded","false"),ft(Kr(this),$(this,la)),ft(this,$(this,da))};la=new WeakMap;da=new WeakMap;ua=new WeakSet;Vr=function(t){if(this.hasAttribute("mediacontroller")&&!this.anchor||this.hidden||!this.anchorElement)return;let{x:e,y:i}=Mm({anchor:this.anchorElement,floating:this,placement:"top-start"});t!=null||(t=this.offsetWidth);let r=Kr(this).getBoundingClientRect(),o=r.width-e-t,s=r.height-i-this.offsetHeight,{style:d}=$(this,Fr);d.setProperty("position","absolute"),d.setProperty("right",`${Math.max(0,o)}px`),d.setProperty("--_menu-bottom",`${s}px`);let u=getComputedStyle(this),T=d.getPropertyValue("--_menu-bottom")===u.bottom?s:parseFloat(u.bottom),_=r.height-T-parseFloat(u.marginBottom);this.style.setProperty("--_menu-max-height",`${_}px`)};jn=new WeakSet;md=function(t){let e=this.querySelector('[role="menuitem"][aria-haspopup][aria-expanded="true"]'),i=e==null?void 0:e.querySelector('[role="menu"]'),{style:a}=$(this,Fr);if(t||a.setProperty("--media-menu-transition-in","none"),i){let r=i.offsetHeight,o=Math.max(i.offsetWidth,e.offsetWidth);this.style.setProperty("min-width",`${o}px`),this.style.setProperty("min-height",`${r}px`),G(this,ua,Vr).call(this,o)}else this.style.removeProperty("min-width"),this.style.removeProperty("min-height"),G(this,ua,Vr).call(this);a.removeProperty("--media-menu-transition-in")};rd=new WeakSet;Dm=function(t){var e;if(t.stopPropagation(),t.composedPath().includes($(this,hd,Om))){(e=$(this,_i))==null||e.focus(),this.hidden=!0;return}let i=G(this,$r,es).call(this,t);!i||i.hasAttribute("disabled")||(G(this,Wr,ts).call(this,i),this.handleSelect(t))};hd=new WeakSet;Om=function(){var t;return(t=this.shadowRoot.querySelector('slot[name="header"]').assignedElements({flatten:!0}))==null?void 0:t.find(i=>i.matches('button[part~="back"]'))};od=new WeakSet;Nm=function(t){if(t.target===this)return;G(this,pd,Pm).call(this);let e=Array.from(this.querySelectorAll('[role="menuitem"][aria-haspopup]'));for(let i of e)i.invokeTargetElement!=t.target&&t.newState=="open"&&i.getAttribute("aria-expanded")=="true"&&!i.invokeTargetElement.hidden&&i.invokeTargetElement.dispatchEvent(new Bt({relatedTarget:i}));for(let i of e)i.setAttribute("aria-expanded",`${!i.submenuElement.hidden}`);G(this,jn,md).call(this,!0)};pd=new WeakSet;Pm=function(){let e=this.querySelector('[role="menuitem"] > [role="menu"]:not([hidden])');this.container.classList.toggle("has-expanded",!!e)};nd=new WeakSet;Um=function(t){var e;ue(this,t.relatedTarget)||($(this,Ai)&&((e=$(this,_i))==null||e.focus()),$(this,$t)&&$(this,$t)!==t.relatedTarget&&!this.hidden&&(this.hidden=!0))};sd=new WeakSet;Hm=function(t){var e,i,a,r,o;let{key:s,ctrlKey:d,altKey:u,metaKey:p}=t;if(!(d||u||p)&&this.keysUsed.includes(s))if(t.preventDefault(),t.stopPropagation(),s==="Tab"){if($(this,Ai)){this.hidden=!0;return}t.shiftKey?(i=(e=this.previousElementSibling)==null?void 0:e.focus)==null||i.call(e):(r=(a=this.nextElementSibling)==null?void 0:a.focus)==null||r.call(a),this.blur()}else s==="Escape"?((o=$(this,_i))==null||o.focus(),$(this,Ai)&&(this.hidden=!0)):s==="Enter"||s===" "?this.handleSelect(t):this.handleMove(t)};$r=new WeakSet;es=function(t){return t.composedPath().find(e=>["menuitemradio","menuitemcheckbox"].includes(e.role))};ld=new WeakSet;Bm=function(){return this.items.find(t=>t.tabIndex===0)};Wr=new WeakSet;ts=function(t){for(let e of this.items)e.tabIndex=e===t?0:-1};zn=new WeakSet;dd=function(t,e){let i=[...this.checkedItems];t.type==="radio"&&this.radioGroupItems.forEach(a=>a.checked=!1),e?t.checked=!t.checked:t.checked=!0,this.checkedItems.some((a,r)=>a!=i[r])&&this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};j.shadowRootOptions={mode:"open"};j.getTemplateHTML=Wv;function Fv(t){return["menuitem","menuitemradio","menuitemcheckbox"].includes(t==null?void 0:t.role)}function Kr(t){var e;return(e=t.getAttribute("bounds")?Ve(t,`#${t.getAttribute("bounds")}`):Y(t)||t.parentElement)!=null?e:t}l.customElements.get("media-chrome-menu")||l.customElements.define("media-chrome-menu",j);var _d=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},lt=(t,e,i)=>(_d(t,e,"read from private field"),i?i.call(t):e.get(t)),Tt=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},fd=(t,e,i,a)=>(_d(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Fe=(t,e,i)=>(_d(t,e,"access private method"),i),is,Yr,vd,$m,rs,Ad,Td,Wm,dt,ca,qr,Ed,Fm,as,bd;function Vv(t){return`
    <style>
      :host {
        transition: var(--media-menu-item-transition,
          background .15s linear,
          opacity .2s ease-in-out
        );
        outline: var(--media-menu-item-outline, 0);
        outline-offset: var(--media-menu-item-outline-offset, -1px);
        cursor: var(--media-cursor, pointer);
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-self: stretch;
        white-space: nowrap;
        white-space-collapse: collapse;
        text-wrap: nowrap;
        padding: .4em .8em .4em 1em;
      }

      :host(:focus-visible) {
        box-shadow: var(--media-menu-item-focus-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: var(--media-menu-item-hover-outline, 0);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host(:hover) {
        cursor: var(--media-cursor, pointer);
        background: var(--media-menu-item-hover-background, rgb(92 92 102 / .5));
        outline: var(--media-menu-item-hover-outline);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host([aria-checked="true"]) {
        background: var(--media-menu-item-checked-background);
      }

      :host([hidden]) {
        display: none;
      }

      :host([disabled]) {
        pointer-events: none;
        color: rgba(255, 255, 255, .3);
      }

      slot:not([name]) {
        width: 100%;
      }

      slot:not([name="submenu"]) {
        display: inline-flex;
        align-items: center;
        transition: inherit;
        opacity: var(--media-menu-item-opacity, 1);
      }

      slot[name="description"] {
        justify-content: end;
      }

      slot[name="description"] > span {
        display: inline-block;
        margin-inline: 1em .2em;
        max-width: var(--media-menu-item-description-max-width, 100px);
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: .8em;
        font-weight: 400;
        text-align: right;
        position: relative;
        top: .04em;
      }

      slot[name="checked-indicator"] {
        display: none;
      }

      :host(:is([role="menuitemradio"],[role="menuitemcheckbox"])) slot[name="checked-indicator"] {
        display: var(--media-menu-item-checked-indicator-display, inline-block);
      }

      
      svg, img, ::slotted(svg), ::slotted(img) {
        height: var(--media-menu-item-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
      }

      
      [part~="indicator"],
      ::slotted([part~="indicator"]) {
        fill: var(--media-menu-item-indicator-fill,
          var(--media-icon-color, var(--media-primary-color, rgb(238 238 238))));
        height: var(--media-menu-item-indicator-height, 1.25em);
        margin-right: .5ch;
      }

      [part~="checked-indicator"] {
        visibility: hidden;
      }

      :host([aria-checked="true"]) [part~="checked-indicator"] {
        visibility: visible;
      }
    </style>
    <slot name="checked-indicator">
      <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
        <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
      </svg>
    </slot>
    <slot name="prefix"></slot>
    <slot></slot>
    <slot name="description"></slot>
    <slot name="suffix">
      ${this.getSuffixSlotInnerHTML(t)}
    </slot>
    <slot name="submenu"></slot>
  `}function Kv(t){return""}var De={TYPE:"type",VALUE:"value",CHECKED:"checked",DISABLED:"disabled"},Ce=class extends l.HTMLElement{constructor(){if(super(),Tt(this,vd),Tt(this,rs),Tt(this,Td),Tt(this,ca),Tt(this,Ed),Tt(this,as),Tt(this,is,!1),Tt(this,Yr,void 0),Tt(this,dt,()=>{var e,i;this.submenuElement.items&&this.setAttribute("submenusize",`${this.submenuElement.items.length}`);let a=this.shadowRoot.querySelector('slot[name="description"]'),r=(e=this.submenuElement.checkedItems)==null?void 0:e[0],o=(i=r==null?void 0:r.dataset.description)!=null?i:r==null?void 0:r.text,s=V.createElement("span");s.textContent=o!=null?o:"",a.replaceChildren(s)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Z(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}this.shadowRoot.addEventListener("slotchange",this)}static get observedAttributes(){return[De.TYPE,De.DISABLED,De.CHECKED,De.VALUE]}enable(){this.hasAttribute("tabindex")||this.setAttribute("tabindex","-1"),Gr(this)&&!this.hasAttribute("aria-checked")&&this.setAttribute("aria-checked","false"),this.addEventListener("click",this),this.addEventListener("keydown",this)}disable(){this.removeAttribute("tabindex"),this.removeEventListener("click",this),this.removeEventListener("keydown",this),this.removeEventListener("keyup",this)}handleEvent(e){switch(e.type){case"slotchange":Fe(this,vd,$m).call(this,e);break;case"click":this.handleClick(e);break;case"keydown":Fe(this,Ed,Fm).call(this,e);break;case"keyup":Fe(this,ca,qr).call(this,e);break}}attributeChangedCallback(e,i,a){e===De.CHECKED&&Gr(this)&&!lt(this,is)?this.setAttribute("aria-checked",a!=null?"true":"false"):e===De.TYPE&&a!==i?this.role="menuitem"+a:e===De.DISABLED&&a!==i&&(a==null?this.enable():this.disable())}connectedCallback(){this.hasAttribute(De.DISABLED)||this.enable(),this.role="menuitem"+this.type,fd(this,Yr,gd(this,this.parentNode)),Fe(this,as,bd).call(this),this.submenuElement&&Fe(this,rs,Ad).call(this)}disconnectedCallback(){this.disable(),Fe(this,as,bd).call(this),fd(this,Yr,null)}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(e){this.setAttribute("invoketarget",`${e}`)}get invokeTargetElement(){var e;return this.invokeTarget?(e=qt(this))==null?void 0:e.querySelector(`#${this.invokeTarget}`):this.submenuElement}get submenuElement(){return this.shadowRoot.querySelector('slot[name="submenu"]').assignedElements({flatten:!0})[0]}get type(){var e;return(e=this.getAttribute(De.TYPE))!=null?e:""}set type(e){this.setAttribute(De.TYPE,`${e}`)}get value(){var e;return(e=this.getAttribute(De.VALUE))!=null?e:this.text}set value(e){this.setAttribute(De.VALUE,e)}get text(){var e;return((e=this.textContent)!=null?e:"").trim()}get checked(){if(Gr(this))return this.getAttribute("aria-checked")==="true"}set checked(e){Gr(this)&&(fd(this,is,!0),this.setAttribute("aria-checked",e?"true":"false"),e?this.part.add("checked"):this.part.remove("checked"))}handleClick(e){Gr(this)||this.invokeTargetElement&&ue(this,e.target)&&this.invokeTargetElement.dispatchEvent(new Bt({relatedTarget:this}))}get keysUsed(){return["Enter"," "]}};is=new WeakMap;Yr=new WeakMap;vd=new WeakSet;$m=function(t){let e=t.target;if(!(e!=null&&e.name))for(let a of e.assignedNodes({flatten:!0}))a instanceof Text&&a.textContent.trim()===""&&a.remove();e.name==="submenu"&&(this.submenuElement?Fe(this,rs,Ad).call(this):Fe(this,Td,Wm).call(this))};rs=new WeakSet;Ad=async function(){this.setAttribute("aria-haspopup","menu"),this.setAttribute("aria-expanded",`${!this.submenuElement.hidden}`),this.submenuElement.addEventListener("change",lt(this,dt)),this.submenuElement.addEventListener("addmenuitem",lt(this,dt)),this.submenuElement.addEventListener("removemenuitem",lt(this,dt)),lt(this,dt).call(this)};Td=new WeakSet;Wm=function(){this.removeAttribute("aria-haspopup"),this.removeAttribute("aria-expanded"),this.submenuElement.removeEventListener("change",lt(this,dt)),this.submenuElement.removeEventListener("addmenuitem",lt(this,dt)),this.submenuElement.removeEventListener("removemenuitem",lt(this,dt)),lt(this,dt).call(this)};dt=new WeakMap;ca=new WeakSet;qr=function(t){let{key:e}=t;if(!this.keysUsed.includes(e)){this.removeEventListener("keyup",Fe(this,ca,qr));return}this.handleClick(t)};Ed=new WeakSet;Fm=function(t){let{metaKey:e,altKey:i,key:a}=t;if(e||i||!this.keysUsed.includes(a)){this.removeEventListener("keyup",Fe(this,ca,qr));return}this.addEventListener("keyup",Fe(this,ca,qr),{once:!0})};as=new WeakSet;bd=function(){var t;let e=(t=lt(this,Yr))==null?void 0:t.radioGroupItems;if(!e)return;let i=e.filter(a=>a.getAttribute("aria-checked")==="true").pop();i||(i=e[0]);for(let a of e)a.setAttribute("aria-checked","false");i==null||i.setAttribute("aria-checked","true")};Ce.shadowRootOptions={mode:"open"};Ce.getTemplateHTML=Vv;Ce.getSuffixSlotInnerHTML=Kv;function Gr(t){return t.type==="radio"||t.type==="checkbox"}function gd(t,e){if(!t)return null;let{host:i}=t.getRootNode();return!e&&i?gd(t,i):e!=null&&e.items?e:gd(e,e==null?void 0:e.parentNode)}l.customElements.get("media-chrome-menu-item")||l.customElements.define("media-chrome-menu-item",Ce);function Gv(t){return`
    ${j.getTemplateHTML(t)}
    <style>
      :host {
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
        min-width: var(--media-settings-menu-min-width, 170px);
        border-radius: 2px 2px 0 0;
        overflow: hidden;
      }

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([role="menu"]) {
        
        justify-content: end;
      }

      slot:not([name]) {
        justify-content: var(--media-settings-menu-justify-content);
        flex-direction: var(--media-settings-menu-flex-direction, column);
        overflow: visible;
      }

      #container.has-expanded {
        --media-settings-menu-item-opacity: 0;
      }
    </style>
  `}var Zr=class extends j{get anchorElement(){return this.anchor!=="auto"?super.anchorElement:Y(this).querySelector("media-settings-menu-button")}};Zr.getTemplateHTML=Gv;l.customElements.get("media-settings-menu")||l.customElements.define("media-settings-menu",Zr);function Yv(t){return`
    ${Ce.getTemplateHTML.call(this,t)}
    <style>
      slot:not([name="submenu"]) {
        opacity: var(--media-settings-menu-item-opacity, var(--media-menu-item-opacity));
      }

      :host([aria-expanded="true"]:hover) {
        background: transparent;
      }
    </style>
  `}function qv(t){return`
    <svg aria-hidden="true" viewBox="0 0 20 24">
      <path d="m8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z"/>
    </svg>
  `}var Ti=class extends Ce{};Ti.shadowRootOptions={mode:"open"};Ti.getTemplateHTML=Yv;Ti.getSuffixSlotInnerHTML=qv;l.customElements.get("media-settings-menu-item")||l.customElements.define("media-settings-menu-item",Ti);var _e=class extends H{connectedCallback(){super.connectedCallback(),this.invokeTargetElement&&this.setAttribute("aria-haspopup","menu")}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(e){this.setAttribute("invoketarget",`${e}`)}get invokeTargetElement(){var e;return this.invokeTarget?(e=qt(this))==null?void 0:e.querySelector(`#${this.invokeTarget}`):null}handleClick(){var e;(e=this.invokeTargetElement)==null||e.dispatchEvent(new Bt({relatedTarget:this}))}};l.customElements.get("media-chrome-menu-button")||l.customElements.define("media-chrome-menu-button",_e);function Zv(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
      </svg>
    </slot>
  `}function Qv(){return h("Settings")}var ma=class extends _e{static get observedAttributes(){return[...super.observedAttributes,"target"]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",h("settings"))}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:Y(this).querySelector("media-settings-menu")}};ma.getSlotTemplateHTML=Zv;ma.getTooltipContentHTML=Qv;l.customElements.get("media-settings-menu-button")||l.customElements.define("media-settings-menu-button",ma);var Id=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Vm=(t,e,i)=>(Id(t,e,"read from private field"),i?i.call(t):e.get(t)),os=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},yd=(t,e,i,a)=>(Id(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),ns=(t,e,i)=>(Id(t,e,"access private method"),i),Qr,ds,ss,kd,ls,Sd,us=class extends j{constructor(){super(...arguments),os(this,ss),os(this,ls),os(this,Qr,[]),os(this,ds,void 0)}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_AUDIO_TRACK_LIST,n.MEDIA_AUDIO_TRACK_ENABLED,n.MEDIA_AUDIO_TRACK_UNAVAILABLE]}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_AUDIO_TRACK_ENABLED&&i!==a?this.value=a:e===n.MEDIA_AUDIO_TRACK_LIST&&i!==a&&(yd(this,Qr,vu(a!=null?a:"")),ns(this,ss,kd).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",ns(this,ls,Sd))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",ns(this,ls,Sd))}get anchorElement(){var e;return this.anchor!=="auto"?super.anchorElement:(e=Y(this))==null?void 0:e.querySelector("media-audio-track-menu-button")}get mediaAudioTrackList(){return Vm(this,Qr)}set mediaAudioTrackList(e){yd(this,Qr,e),ns(this,ss,kd).call(this)}get mediaAudioTrackEnabled(){var e;return(e=w(this,n.MEDIA_AUDIO_TRACK_ENABLED))!=null?e:""}set mediaAudioTrackEnabled(e){R(this,n.MEDIA_AUDIO_TRACK_ENABLED,e)}};Qr=new WeakMap;ds=new WeakMap;ss=new WeakSet;kd=function(){if(Vm(this,ds)===JSON.stringify(this.mediaAudioTrackList))return;yd(this,ds,JSON.stringify(this.mediaAudioTrackList));let t=this.mediaAudioTrackList;this.defaultSlot.textContent="",t.sort((e,i)=>e.id.localeCompare(i.id,void 0,{numeric:!0}));for(let e of t){let i=this.formatMenuItemText(e.label,e),a=st({type:"radio",text:i,value:`${e.id}`,checked:e.enabled});a.prepend(We(this,"checked-indicator")),this.defaultSlot.append(a)}};ls=new WeakSet;Sd=function(){if(this.value==null)return;let t=new l.CustomEvent(m.MEDIA_AUDIO_TRACK_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(t)};l.customElements.get("media-audio-track-menu")||l.customElements.define("media-audio-track-menu",us);var zv=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M11 17H9.5V7H11v10Zm-3-3H6.5v-4H8v4Zm6-5h-1.5v6H14V9Zm3 7h-1.5V8H17v8Z"/>
  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-2 0a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/>
</svg>`;function Xv(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${zv}</slot>
  `}function Jv(){return h("Audio")}var Km=t=>{let e=h("Audio");t.setAttribute("aria-label",e)},ha=class extends _e{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_AUDIO_TRACK_ENABLED,n.MEDIA_AUDIO_TRACK_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Km(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_LANG&&Km(this)}get invokeTargetElement(){var e;return this.invokeTarget!=null?super.invokeTargetElement:(e=Y(this))==null?void 0:e.querySelector("media-audio-track-menu")}get mediaAudioTrackEnabled(){var e;return(e=w(this,n.MEDIA_AUDIO_TRACK_ENABLED))!=null?e:""}set mediaAudioTrackEnabled(e){R(this,n.MEDIA_AUDIO_TRACK_ENABLED,e)}};ha.getSlotTemplateHTML=Xv;ha.getTooltipContentHTML=Jv;l.customElements.get("media-audio-track-menu-button")||l.customElements.define("media-audio-track-menu-button",ha);var wd=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},jv=(t,e,i)=>(wd(t,e,"read from private field"),i?i.call(t):e.get(t)),Md=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},eE=(t,e,i,a)=>(wd(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),cs=(t,e,i)=>(wd(t,e,"access private method"),i),ps,ms,Cd,hs,Ld,tE=`
  <svg aria-hidden="true" viewBox="0 0 26 24" part="captions-indicator indicator">
    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
  </svg>`;function iE(t){return`
    ${j.getTemplateHTML(t)}
    <slot name="captions-indicator" hidden>${tE}</slot>
  `}var zr=class extends j{constructor(){super(...arguments),Md(this,ms),Md(this,hs),Md(this,ps,void 0)}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_SUBTITLES_LIST,n.MEDIA_SUBTITLES_SHOWING]}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_SUBTITLES_LIST&&i!==a?cs(this,ms,Cd).call(this):e===n.MEDIA_SUBTITLES_SHOWING&&i!==a&&(this.value=a||"",cs(this,ms,Cd).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",cs(this,hs,Ld))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",cs(this,hs,Ld))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:Y(this).querySelector("media-captions-menu-button")}get mediaSubtitlesList(){return Gm(this,n.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){Ym(this,n.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return Gm(this,n.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){Ym(this,n.MEDIA_SUBTITLES_SHOWING,e)}};ps=new WeakMap;ms=new WeakSet;Cd=function(){var t;let e=jv(this,ps)!==JSON.stringify(this.mediaSubtitlesList),i=this.value!==this.getAttribute(n.MEDIA_SUBTITLES_SHOWING);if(!e&&!i)return;eE(this,ps,JSON.stringify(this.mediaSubtitlesList)),this.defaultSlot.textContent="";let a=!this.value,r=st({type:"radio",text:this.formatMenuItemText(h("Off")),value:"off",checked:a});r.prepend(We(this,"checked-indicator")),this.defaultSlot.append(r);let o=this.mediaSubtitlesList;for(let s of o){let d=st({type:"radio",text:this.formatMenuItemText(s.label,s),value:Lo(s),checked:this.value==Lo(s)});d.prepend(We(this,"checked-indicator")),((t=s.kind)!=null?t:"subs")==="captions"&&d.append(We(this,"captions-indicator")),this.defaultSlot.append(d)}};hs=new WeakSet;Ld=function(){let t=this.mediaSubtitlesShowing,e=this.getAttribute(n.MEDIA_SUBTITLES_SHOWING),i=this.value!==e;if(t!=null&&t.length&&i&&this.dispatchEvent(new l.CustomEvent(m.MEDIA_DISABLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:t})),!this.value||!i)return;let a=new l.CustomEvent(m.MEDIA_SHOW_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(a)};zr.getTemplateHTML=iE;var Gm=(t,e)=>{let i=t.getAttribute(e);return i?Xt(i):[]},Ym=(t,e,i)=>{if(!(i!=null&&i.length)){t.removeAttribute(e);return}let a=Et(i);t.getAttribute(e)!==a&&t.setAttribute(e,a)};l.customElements.get("media-captions-menu")||l.customElements.define("media-captions-menu",zr);var aE=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,rE=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function oE(){return`
    <style>
      :host([data-captions-enabled="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([data-captions-enabled="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${aE}</slot>
      <slot name="off">${rE}</slot>
    </slot>
  `}function nE(){return h("Captions")}var qm=t=>{t.setAttribute("data-captions-enabled",wo(t).toString())},Zm=t=>{t.setAttribute("aria-label",h("closed captions"))},pa=class extends _e{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_SUBTITLES_LIST,n.MEDIA_SUBTITLES_SHOWING,n.MEDIA_LANG]}connectedCallback(){super.connectedCallback(),Zm(this),qm(this)}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_SUBTITLES_SHOWING?qm(this):e===n.MEDIA_LANG&&Zm(this)}get invokeTargetElement(){var e;return this.invokeTarget!=null?super.invokeTargetElement:(e=Y(this))==null?void 0:e.querySelector("media-captions-menu")}get mediaSubtitlesList(){return Qm(this,n.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){zm(this,n.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return Qm(this,n.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){zm(this,n.MEDIA_SUBTITLES_SHOWING,e)}};pa.getSlotTemplateHTML=oE;pa.getTooltipContentHTML=nE;var Qm=(t,e)=>{let i=t.getAttribute(e);return i?Xt(i):[]},zm=(t,e,i)=>{if(!(i!=null&&i.length)){t.removeAttribute(e);return}let a=Et(i);t.getAttribute(e)!==a&&t.setAttribute(e,a)};l.customElements.get("media-captions-menu-button")||l.customElements.define("media-captions-menu-button",pa);var Xm=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},va=(t,e,i)=>(Xm(t,e,"read from private field"),i?i.call(t):e.get(t)),Rd=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},fa=(t,e,i)=>(Xm(t,e,"access private method"),i),Wt,Ea,Xr,fs,Dd,xd={RATES:"rates"},vs=class extends j{constructor(){super(),Rd(this,Ea),Rd(this,fs),Rd(this,Wt,new Ct(this,xd.RATES,{defaultValue:Al})),fa(this,Ea,Xr).call(this)}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PLAYBACK_RATE,xd.RATES]}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_PLAYBACK_RATE&&i!=a?(this.value=a,fa(this,Ea,Xr).call(this)):e===xd.RATES&&i!=a&&(va(this,Wt).value=a,fa(this,Ea,Xr).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",fa(this,fs,Dd))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",fa(this,fs,Dd))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:Y(this).querySelector("media-playback-rate-menu-button")}get rates(){return va(this,Wt)}set rates(e){e?Array.isArray(e)?va(this,Wt).value=e.join(" "):typeof e=="string"&&(va(this,Wt).value=e):va(this,Wt).value="",fa(this,Ea,Xr).call(this)}get mediaPlaybackRate(){return O(this,n.MEDIA_PLAYBACK_RATE,ni)}set mediaPlaybackRate(e){P(this,n.MEDIA_PLAYBACK_RATE,e)}};Wt=new WeakMap;Ea=new WeakSet;Xr=function(){this.defaultSlot.textContent="";let t=this.mediaPlaybackRate,e=new Set(Array.from(va(this,Wt)).map(a=>Number(a)));t>0&&!e.has(t)&&e.add(t);let i=Array.from(e).sort((a,r)=>a-r);for(let a of i){let r=st({type:"radio",text:this.formatMenuItemText(`${a}x`,a),value:a.toString(),checked:t===a});r.prepend(We(this,"checked-indicator")),this.defaultSlot.append(r)}};fs=new WeakSet;Dd=function(){if(!this.value)return;let t=new l.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(t)};l.customElements.get("media-playback-rate-menu")||l.customElements.define("media-playback-rate-menu",vs);var Es=1;function sE(t){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
      
      :host([aria-expanded="true"]) slot {
        display: block;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${t.mediaplaybackrate||Es}x</slot>
  `}function lE(){return h("Playback rate")}var ba=class extends _e{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_PLAYBACK_RATE]}constructor(){var e;super(),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${(e=this.mediaPlaybackRate)!=null?e:Es}x`}attributeChangedCallback(e,i,a){if(super.attributeChangedCallback(e,i,a),e===n.MEDIA_PLAYBACK_RATE){let r=a?+a:Number.NaN,o=Number.isNaN(r)?Es:r;this.container.innerHTML=`${o}x`,this.setAttribute("aria-label",h("Playback rate {playbackRate}",{playbackRate:o}))}}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:Y(this).querySelector("media-playback-rate-menu")}get mediaPlaybackRate(){return O(this,n.MEDIA_PLAYBACK_RATE,Es)}set mediaPlaybackRate(e){P(this,n.MEDIA_PLAYBACK_RATE,e)}};ba.getSlotTemplateHTML=sE;ba.getTooltipContentHTML=lE;l.customElements.get("media-playback-rate-menu-button")||l.customElements.define("media-playback-rate-menu-button",ba);var Nd=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},Jr=(t,e,i)=>(Nd(t,e,"read from private field"),i?i.call(t):e.get(t)),bs=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},Jm=(t,e,i,a)=>(Nd(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),ga=(t,e,i)=>(Nd(t,e,"access private method"),i),jr,Aa,_a,eo,gs,Od,_s=class extends j{constructor(){super(...arguments),bs(this,_a),bs(this,gs),bs(this,jr,[]),bs(this,Aa,{})}static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_RENDITION_LIST,n.MEDIA_RENDITION_SELECTED,n.MEDIA_RENDITION_UNAVAILABLE,n.MEDIA_HEIGHT]}static formatMenuItemText(e,i){return super.formatMenuItemText(e,i)}static formatRendition(e,{showBitrate:i=!1}={}){let a=`${Math.min(e.width,e.height)}p`;if(i&&e.bitrate){let r=e.bitrate/1e6,o=`${r.toFixed(r<1?1:0)} Mbps`;return`${a} (${o})`}return this.formatMenuItemText(a,e)}static compareRendition(e,i){var a,r;return i.height===e.height?((a=i.bitrate)!=null?a:0)-((r=e.bitrate)!=null?r:0):i.height-e.height}attributeChangedCallback(e,i,a){super.attributeChangedCallback(e,i,a),e===n.MEDIA_RENDITION_SELECTED&&i!==a?(this.value=a!=null?a:"auto",ga(this,_a,eo).call(this)):e===n.MEDIA_RENDITION_LIST&&i!==a?(Jm(this,jr,pu(a)),ga(this,_a,eo).call(this)):e===n.MEDIA_HEIGHT&&i!==a&&ga(this,_a,eo).call(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("change",ga(this,gs,Od))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",ga(this,gs,Od))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:Y(this).querySelector("media-rendition-menu-button")}get mediaRenditionList(){return Jr(this,jr)}set mediaRenditionList(e){Jm(this,jr,e),ga(this,_a,eo).call(this)}get mediaRenditionSelected(){return w(this,n.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(e){R(this,n.MEDIA_RENDITION_SELECTED,e)}get mediaHeight(){return O(this,n.MEDIA_HEIGHT)}set mediaHeight(e){P(this,n.MEDIA_HEIGHT,e)}compareRendition(e,i){return this.constructor.compareRendition(e,i)}formatMenuItemText(e,i){return this.constructor.formatMenuItemText(e,i)}formatRendition(e,i){return this.constructor.formatRendition(e,i)}showRenditionBitrate(e){return this.mediaRenditionList.some(i=>i!==e&&i.height===e.height&&i.bitrate!==e.bitrate)}};jr=new WeakMap;Aa=new WeakMap;_a=new WeakSet;eo=function(){if(Jr(this,Aa).mediaRenditionList===JSON.stringify(this.mediaRenditionList)&&Jr(this,Aa).mediaHeight===this.mediaHeight)return;Jr(this,Aa).mediaRenditionList=JSON.stringify(this.mediaRenditionList),Jr(this,Aa).mediaHeight=this.mediaHeight;let t=this.mediaRenditionList.sort(this.compareRendition.bind(this)),e=t.find(s=>s.id===this.mediaRenditionSelected);for(let s of t)s.selected=s===e;this.defaultSlot.textContent="";let i=!this.mediaRenditionSelected;for(let s of t){let d=this.formatRendition(s,{showBitrate:this.showRenditionBitrate(s)}),u=st({type:"radio",text:d,value:`${s.id}`,checked:s.selected&&!i});u.prepend(We(this,"checked-indicator")),this.defaultSlot.append(u)}let a=e&&this.showRenditionBitrate(e),r=i?e?this.formatMenuItemText(`${h("Auto")} \u2022 ${this.formatRendition(e,{showBitrate:a})}`,e):this.formatMenuItemText(`${h("Auto")} (${this.mediaHeight}p)`):this.formatMenuItemText(h("Auto")),o=st({type:"radio",text:r,value:"auto",checked:i});o.dataset.description=r,o.prepend(We(this,"checked-indicator")),this.defaultSlot.append(o)};gs=new WeakSet;Od=function(){if(this.value==null)return;let t=new l.CustomEvent(m.MEDIA_RENDITION_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(t)};l.customElements.get("media-rendition-menu")||l.customElements.define("media-rendition-menu",_s);var dE=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M13.5 2.5h2v6h-2v-2h-11v-2h11v-2Zm4 2h4v2h-4v-2Zm-12 4h2v6h-2v-2h-3v-2h3v-2Zm4 2h12v2h-12v-2Zm1 4h2v6h-2v-2h-8v-2h8v-2Zm4 2h7v2h-7v-2Z" />
</svg>`;function uE(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${dE}</slot>
  `}function cE(){return h("Quality")}var Ta=class extends _e{static get observedAttributes(){return[...super.observedAttributes,n.MEDIA_RENDITION_SELECTED,n.MEDIA_RENDITION_UNAVAILABLE,n.MEDIA_HEIGHT]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",h("quality"))}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:Y(this).querySelector("media-rendition-menu")}get mediaRenditionSelected(){return w(this,n.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(e){R(this,n.MEDIA_RENDITION_SELECTED,e)}get mediaHeight(){return O(this,n.MEDIA_HEIGHT)}set mediaHeight(e){P(this,n.MEDIA_HEIGHT,e)}};Ta.getSlotTemplateHTML=uE;Ta.getTooltipContentHTML=cE;l.customElements.get("media-rendition-menu-button")||l.customElements.define("media-rendition-menu-button",Ta);var Hd=(t,e,i)=>{if(!e.has(t))throw TypeError("Cannot "+i)},ct=(t,e,i)=>(Hd(t,e,"read from private field"),i?i.call(t):e.get(t)),ut=(t,e,i)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,i)},jm=(t,e,i,a)=>(Hd(t,e,"write to private field"),a?a.call(t,i):e.set(t,i),i),Oe=(t,e,i)=>(Hd(t,e,"access private method"),i),ka,to,Is,yi,ya,Bd,eh,As,Pd,Ts,Ud,th,ks,Ss,ys;function mE(t){return`
      ${j.getTemplateHTML(t)}
      <style>
        :host {
          --_menu-bg: rgb(20 20 30 / .8);
          background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
          min-width: var(--media-settings-menu-min-width, 170px);
          border-radius: 2px;
          overflow: hidden;
        }
      </style>
    `}var io=class extends j{constructor(){super(),ut(this,to),ut(this,yi),ut(this,Bd),ut(this,As),ut(this,Ud),ut(this,ka,!1),ut(this,Ts,e=>{let i=e.target,a=(i==null?void 0:i.nodeName)==="VIDEO",r=Oe(this,As,Pd).call(this,i);(a||r)&&(ct(this,ka)?Oe(this,yi,ya).call(this):Oe(this,Ud,th).call(this,e))}),ut(this,ks,e=>{let i=e.target,a=this.contains(i),r=e.button===2,o=(i==null?void 0:i.nodeName)==="VIDEO",s=Oe(this,As,Pd).call(this,i);a||r&&(o||s)||Oe(this,yi,ya).call(this)}),ut(this,Ss,e=>{e.key==="Escape"&&Oe(this,yi,ya).call(this)}),ut(this,ys,e=>{var i,a;let r=e.target;if((i=r.matches)!=null&&i.call(r,'button[invoke="copy"]')){let o=(a=r.closest("media-context-menu-item"))==null?void 0:a.querySelector('input[slot="copy"]');o&&navigator.clipboard.writeText(o.value)}Oe(this,yi,ya).call(this)}),this.setAttribute("noautohide",""),Oe(this,to,Is).call(this)}connectedCallback(){super.connectedCallback(),Y(this).addEventListener("contextmenu",ct(this,Ts)),this.addEventListener("click",ct(this,ys))}disconnectedCallback(){super.disconnectedCallback(),Y(this).removeEventListener("contextmenu",ct(this,Ts)),this.removeEventListener("click",ct(this,ys)),document.removeEventListener("mousedown",ct(this,ks)),document.removeEventListener("keydown",ct(this,Ss))}};ka=new WeakMap;to=new WeakSet;Is=function(){this.hidden=!ct(this,ka)};yi=new WeakSet;ya=function(){jm(this,ka,!1),Oe(this,to,Is).call(this)};Bd=new WeakSet;eh=function(){document.querySelectorAll("media-context-menu").forEach(e=>{var i;e!==this&&Oe(i=e,yi,ya).call(i)})};As=new WeakSet;Pd=function(t){return t?t.hasAttribute("slot")&&t.getAttribute("slot")==="media"?!0:t.nodeName.includes("-")&&t.tagName.includes("-")?t.hasAttribute("src")||t.hasAttribute("poster")||t.hasAttribute("preload")||t.hasAttribute("playsinline"):!1:!1};Ts=new WeakMap;Ud=new WeakSet;th=function(t){t.preventDefault(),Oe(this,Bd,eh).call(this),jm(this,ka,!0),this.style.position="fixed",this.style.left=`${t.clientX}px`,this.style.top=`${t.clientY}px`,Oe(this,to,Is).call(this),document.addEventListener("mousedown",ct(this,ks),{once:!0}),document.addEventListener("keydown",ct(this,Ss),{once:!0})};ks=new WeakMap;Ss=new WeakMap;ys=new WeakMap;io.getTemplateHTML=mE;l.customElements.get("media-context-menu")||l.customElements.define("media-context-menu",io);function hE(t){return`
    ${Ce.getTemplateHTML.call(this,t)}
    <style>
        ::slotted(*) {
            color: var(--media-text-color, white);
            text-decoration: none;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            min-height: var(--media-control-height, 24px);
        }
    </style>
  `}var Sa=class extends Ce{};Sa.shadowRootOptions={mode:"open"};Sa.getTemplateHTML=hE;l.customElements.get("media-context-menu-item")||l.customElements.define("media-context-menu-item",Sa);var $d=Gt.createElement("template");"innerHTML"in $d&&($d.innerHTML=Im);var ih,ah,Ms=class extends bi{};Ms.template=(ah=(ih=$d.content)==null?void 0:ih.children)==null?void 0:ah[0];ke.customElements.get("media-theme-gerwig")||ke.customElements.define("media-theme-gerwig",Ms);var pE="gerwig",yt={SRC:"src",POSTER:"poster"},c={STYLE:"style",DEFAULT_HIDDEN_CAPTIONS:"default-hidden-captions",PRIMARY_COLOR:"primary-color",SECONDARY_COLOR:"secondary-color",ACCENT_COLOR:"accent-color",FORWARD_SEEK_OFFSET:"forward-seek-offset",BACKWARD_SEEK_OFFSET:"backward-seek-offset",PLAYBACK_TOKEN:"playback-token",THUMBNAIL_TOKEN:"thumbnail-token",STORYBOARD_TOKEN:"storyboard-token",FULLSCREEN_ELEMENT:"fullscreen-element",DRM_TOKEN:"drm-token",STORYBOARD_SRC:"storyboard-src",THUMBNAIL_TIME:"thumbnail-time",AUDIO:"audio",NOHOTKEYS:"nohotkeys",HOTKEYS:"hotkeys",PLAYBACK_RATES:"playbackrates",DEFAULT_SHOW_REMAINING_TIME:"default-show-remaining-time",DEFAULT_DURATION:"default-duration",TITLE:"title",VIDEO_TITLE:"video-title",PLACEHOLDER:"placeholder",THEME:"theme",DEFAULT_STREAM_TYPE:"default-stream-type",TARGET_LIVE_WINDOW:"target-live-window",EXTRA_SOURCE_PARAMS:"extra-source-params",NO_VOLUME_PREF:"no-volume-pref",NO_MUTED_PREF:"no-muted-pref",CAST_RECEIVER:"cast-receiver",NO_TOOLTIPS:"no-tooltips",PROUDLY_DISPLAY_MUX_BADGE:"proudly-display-mux-badge",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended"},Wd=["audio","backwardseekoffset","defaultduration","defaultshowremainingtime","defaultsubtitles","noautoseektolive","disabled","exportparts","forwardseekoffset","hideduration","hotkeys","nohotkeys","playbackrates","defaultstreamtype","streamtype","style","targetlivewindow","template","title","videotitle","novolumepref","nomutedpref","proudlydisplaymuxbadge"];function fE(t,e){var a,r,o;return{src:!t.playbackId&&t.src,playbackId:t.playbackId,hasSrc:!!t.playbackId||!!t.src||!!t.currentSrc,poster:t.poster,storyboard:((a=t.media)==null?void 0:a.currentSrc)&&t.storyboard,storyboardSrc:t.getAttribute(c.STORYBOARD_SRC),fullscreenElement:t.getAttribute(c.FULLSCREEN_ELEMENT),placeholder:t.getAttribute("placeholder"),themeTemplate:EE(t),thumbnailTime:!t.tokens.thumbnail&&t.thumbnailTime,autoplay:t.autoplay,crossOrigin:t.crossOrigin,loop:t.loop,noHotKeys:t.hasAttribute(c.NOHOTKEYS),hotKeys:t.getAttribute(c.HOTKEYS),muted:t.muted,paused:t.paused,preload:t.preload,envKey:t.envKey,preferCmcd:t.preferCmcd,debug:t.debug,disableTracking:t.disableTracking,disableCookies:t.disableCookies,tokens:t.tokens,beaconCollectionDomain:t.beaconCollectionDomain,maxResolution:t.maxResolution,minResolution:t.minResolution,maxAutoResolution:t.maxAutoResolution,programStartTime:t.programStartTime,programEndTime:t.programEndTime,assetStartTime:t.assetStartTime,assetEndTime:t.assetEndTime,renditionOrder:t.renditionOrder,metadata:t.metadata,playerInitTime:t.playerInitTime,playerSoftwareName:t.playerSoftwareName,playerSoftwareVersion:t.playerSoftwareVersion,startTime:t.startTime,preferPlayback:t.preferPlayback,audio:t.audio,defaultStreamType:t.defaultStreamType,targetLiveWindow:t.getAttribute(g.Attributes.TARGET_LIVE_WINDOW),streamType:wr(t.getAttribute(g.Attributes.STREAM_TYPE)),primaryColor:t.getAttribute(c.PRIMARY_COLOR),secondaryColor:t.getAttribute(c.SECONDARY_COLOR),accentColor:t.getAttribute(c.ACCENT_COLOR),forwardSeekOffset:t.forwardSeekOffset,backwardSeekOffset:t.backwardSeekOffset,defaultHiddenCaptions:t.defaultHiddenCaptions,defaultDuration:t.defaultDuration,defaultShowRemainingTime:t.defaultShowRemainingTime,hideDuration:bE(t),playbackRates:t.getAttribute(c.PLAYBACK_RATES),customDomain:(r=t.getAttribute(g.Attributes.CUSTOM_DOMAIN))!=null?r:void 0,title:t.getAttribute(c.TITLE),videoTitle:(o=t.getAttribute(c.VIDEO_TITLE))!=null?o:t.getAttribute(c.TITLE),novolumepref:t.hasAttribute(c.NO_VOLUME_PREF),nomutedpref:t.hasAttribute(c.NO_MUTED_PREF),proudlyDisplayMuxBadge:t.hasAttribute(c.PROUDLY_DISPLAY_MUX_BADGE),castReceiver:t.castReceiver,disablePseudoEnded:t.hasAttribute(c.DISABLE_PSEUDO_ENDED),...e,extraSourceParams:t.extraSourceParams}}var vE=sn.formatErrorMessage;sn.formatErrorMessage=t=>{var e,i;if(t instanceof g.MediaError){let a=Sm(t,!1);return`
      ${a!=null&&a.title?`<h3>${a.title}</h3>`:""}
      ${a!=null&&a.message||a!=null&&a.linkUrl?`<p>
        ${a==null?void 0:a.message}
        ${a!=null&&a.linkUrl?`<a
              href="${a.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(e=a.linkText)!=null?e:""} ${(0,D.i18n)("(opens in a new window)")}"
              >${(i=a.linkText)!=null?i:a.linkUrl}</a
            >`:""}
      </p>`:""}
    `}return vE(t)};function EE(t){var i,a;let e=t.theme;if(e){let r=(a=(i=t.getRootNode())==null?void 0:i.getElementById)==null?void 0:a.call(i,e);if(r&&r instanceof HTMLTemplateElement)return r;e.startsWith("media-theme-")||(e=`media-theme-${e}`);let o=ke.customElements.get(e);if(o!=null&&o.template)return o.template}}function bE(t){var i;let e=(i=t.mediaController)==null?void 0:i.querySelector("media-time-display");return e&&getComputedStyle(e).getPropertyValue("--media-duration-display-display").trim()==="none"}function rh(t){let e=t.videoTitle?{video_title:t.videoTitle}:{};return t.getAttributeNames().filter(i=>i.startsWith("metadata-")).reduce((i,a)=>{let r=t.getAttribute(a);return r!==null&&(i[a.replace(/^metadata-/,"").replace(/-/g,"_")]=r),i},e)}var gE=Object.values(g.Attributes),_E=Object.values(yt),AE=Object.values(c),Fd=Pn(),Vd="mux-player",oh={isDialogOpen:!1},TE={redundant_streams:!0},ao,ro,oo,Kt,no,Si,W,Ft,nh,Gd,ki,sh,lh,dh,uh,Kd=class extends Wl{constructor(){super();pe(this,W);pe(this,ao);pe(this,ro,!1);pe(this,oo,{});pe(this,Kt,!0);pe(this,no,new Nn(this,"hotkeys"));pe(this,Si,{...oh,onCloseErrorDialog:i=>{var r;((r=i.composedPath()[0])==null?void 0:r.localName)==="media-error-dialog"&&X(this,W,Gd).call(this,{isDialogOpen:!1})},onFocusInErrorDialog:i=>{var o;if(((o=i.composedPath()[0])==null?void 0:o.localName)!=="media-error-dialog")return;Hl(this,Gt.activeElement)||i.preventDefault()}});ye(this,ao,(0,D.generatePlayerInitTime)()),this.attachShadow({mode:"open"}),X(this,W,nh).call(this),this.isConnected&&X(this,W,Ft).call(this)}static get NAME(){return Vd}static get VERSION(){return Fd}static get observedAttributes(){var i;return[...(i=Wl.observedAttributes)!=null?i:[],..._E,...gE,...AE]}get mediaTheme(){var i;return(i=this.shadowRoot)==null?void 0:i.querySelector("media-theme")}get mediaController(){var i,a;return(a=(i=this.mediaTheme)==null?void 0:i.shadowRoot)==null?void 0:a.querySelector("media-controller")}connectedCallback(){let i=this.media;i&&(i.metadata=rh(this))}attributeChangedCallback(i,a,r){switch(X(this,W,Ft).call(this),super.attributeChangedCallback(i,a,r),i){case c.HOTKEYS:B(this,no).value=r;break;case c.THUMBNAIL_TIME:{r!=null&&this.tokens.thumbnail&&at((0,D.i18n)("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());break}case c.THUMBNAIL_TOKEN:{if(r){let s=(0,D.parseJwt)(r);if(s){let{aud:d}=s,u=D.MuxJWTAud.THUMBNAIL;d!==u&&at((0,D.i18n)("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:d,expectedAud:u,tokenNamePrefix:"thumbnail"}))}}break}case c.STORYBOARD_TOKEN:{if(r){let s=(0,D.parseJwt)(r);if(s){let{aud:d}=s,u=D.MuxJWTAud.STORYBOARD;d!==u&&at((0,D.i18n)("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:d,expectedAud:u,tokenNamePrefix:"storyboard"}))}}break}case c.DRM_TOKEN:{if(r){let s=(0,D.parseJwt)(r);if(s){let{aud:d}=s,u=D.MuxJWTAud.DRM;d!==u&&at((0,D.i18n)("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:d,expectedAud:u,tokenNamePrefix:"drm"}))}}break}case g.Attributes.PLAYBACK_ID:{r!=null&&r.includes("?token")&&ge((0,D.i18n)("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({playbackId:r}));break}case g.Attributes.STREAM_TYPE:{r&&![D.StreamTypes.LIVE,D.StreamTypes.ON_DEMAND,D.StreamTypes.UNKNOWN].includes(r)?["ll-live","live:dvr","ll-live:dvr"].includes(this.streamType)?this.targetLiveWindow=r.includes("dvr")?Number.POSITIVE_INFINITY:0:Bl({file:"invalid-stream-type.md",message:(0,D.i18n)("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({streamType:this.streamType})}):r===D.StreamTypes.LIVE?this.getAttribute(c.TARGET_LIVE_WINDOW)==null&&(this.targetLiveWindow=0):this.targetLiveWindow=Number.NaN;break}case c.FULLSCREEN_ELEMENT:{if(r!=null||r!==a){let s=Gt.getElementById(r),d=s==null?void 0:s.querySelector("mux-player");this.mediaController&&s&&d&&(this.mediaController.fullscreenElement=s)}break}}[g.Attributes.PLAYBACK_ID,yt.SRC,c.PLAYBACK_TOKEN].includes(i)&&a!==r&&ye(this,Si,{...B(this,Si),...oh}),X(this,W,ki).call(this,{[im(i)]:r})}async requestFullscreen(i){var a;if(!(!this.mediaController||this.mediaController.hasAttribute(n.MEDIA_IS_FULLSCREEN)))return(a=this.mediaController)==null||a.dispatchEvent(new ke.CustomEvent(m.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((r,o)=>{var s;(s=this.mediaController)==null||s.addEventListener(Le.MEDIA_IS_FULLSCREEN,()=>r(),{once:!0})})}async exitFullscreen(){var i;if(!(!this.mediaController||!this.mediaController.hasAttribute(n.MEDIA_IS_FULLSCREEN)))return(i=this.mediaController)==null||i.dispatchEvent(new ke.CustomEvent(m.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((a,r)=>{var o;(o=this.mediaController)==null||o.addEventListener(Le.MEDIA_IS_FULLSCREEN,()=>a(),{once:!0})})}get preferCmcd(){var i;return(i=this.getAttribute(g.Attributes.PREFER_CMCD))!=null?i:void 0}set preferCmcd(i){i!==this.preferCmcd&&(i?D.CmcdTypeValues.includes(i)?this.setAttribute(g.Attributes.PREFER_CMCD,i):at(`Invalid value for preferCmcd. Must be one of ${D.CmcdTypeValues.join()}`):this.removeAttribute(g.Attributes.PREFER_CMCD))}get hasPlayed(){var i,a;return(a=(i=this.mediaController)==null?void 0:i.hasAttribute(n.MEDIA_HAS_PLAYED))!=null?a:!1}get inLiveWindow(){var i;return(i=this.mediaController)==null?void 0:i.hasAttribute(n.MEDIA_TIME_IS_LIVE)}get _hls(){var i;return(i=this.media)==null?void 0:i._hls}get mux(){var i;return(i=this.media)==null?void 0:i.mux}get theme(){var i;return(i=this.getAttribute(c.THEME))!=null?i:pE}set theme(i){this.setAttribute(c.THEME,`${i}`)}get themeProps(){let i=this.mediaTheme;if(!i)return;let a={};for(let r of i.getAttributeNames()){if(Wd.includes(r))continue;let o=i.getAttribute(r);a[On(r)]=o===""?!0:o}return a}set themeProps(i){var r,o;X(this,W,Ft).call(this);let a={...this.themeProps,...i};for(let s in a){if(Wd.includes(s))continue;let d=i==null?void 0:i[s];typeof d=="boolean"||d==null?(r=this.mediaTheme)==null||r.toggleAttribute(Dn(s),!!d):(o=this.mediaTheme)==null||o.setAttribute(Dn(s),d)}}get playbackId(){var i;return(i=this.getAttribute(g.Attributes.PLAYBACK_ID))!=null?i:void 0}set playbackId(i){i?this.setAttribute(g.Attributes.PLAYBACK_ID,i):this.removeAttribute(g.Attributes.PLAYBACK_ID)}get src(){var i,a;return this.playbackId?(i=Vt(this,yt.SRC))!=null?i:void 0:(a=this.getAttribute(yt.SRC))!=null?a:void 0}set src(i){i?this.setAttribute(yt.SRC,i):this.removeAttribute(yt.SRC)}get poster(){var r;let i=this.getAttribute(yt.POSTER);if(i!=null)return i;let{tokens:a}=this;if(a.playback&&!a.thumbnail){at("Missing expected thumbnail token. No poster image will be shown");return}if(this.playbackId&&!this.audio)return em(this.playbackId,{customDomain:this.customDomain,thumbnailTime:(r=this.thumbnailTime)!=null?r:this.startTime,programTime:this.programStartTime,token:a.thumbnail})}set poster(i){i||i===""?this.setAttribute(yt.POSTER,i):this.removeAttribute(yt.POSTER)}get storyboardSrc(){var i;return(i=this.getAttribute(c.STORYBOARD_SRC))!=null?i:void 0}set storyboardSrc(i){i?this.setAttribute(c.STORYBOARD_SRC,i):this.removeAttribute(c.STORYBOARD_SRC)}get storyboard(){let{tokens:i}=this;if(this.storyboardSrc&&!i.storyboard)return this.storyboardSrc;if(!(this.audio||!this.playbackId||!this.streamType||[D.StreamTypes.LIVE,D.StreamTypes.UNKNOWN].includes(this.streamType)||i.playback&&!i.storyboard))return tm(this.playbackId,{customDomain:this.customDomain,token:i.storyboard,programStartTime:this.programStartTime,programEndTime:this.programEndTime})}get audio(){return this.hasAttribute(c.AUDIO)}set audio(i){if(!i){this.removeAttribute(c.AUDIO);return}this.setAttribute(c.AUDIO,"")}get hotkeys(){return B(this,no)}get nohotkeys(){return this.hasAttribute(c.NOHOTKEYS)}set nohotkeys(i){if(!i){this.removeAttribute(c.NOHOTKEYS);return}this.setAttribute(c.NOHOTKEYS,"")}get thumbnailTime(){return ce(this.getAttribute(c.THUMBNAIL_TIME))}set thumbnailTime(i){this.setAttribute(c.THUMBNAIL_TIME,`${i}`)}get videoTitle(){var i,a;return(a=(i=this.getAttribute(c.VIDEO_TITLE))!=null?i:this.getAttribute(c.TITLE))!=null?a:""}set videoTitle(i){i!==this.videoTitle&&(i?this.setAttribute(c.VIDEO_TITLE,i):this.removeAttribute(c.VIDEO_TITLE))}get placeholder(){var i;return(i=Vt(this,c.PLACEHOLDER))!=null?i:""}set placeholder(i){this.setAttribute(c.PLACEHOLDER,`${i}`)}get primaryColor(){var a,r;let i=this.getAttribute(c.PRIMARY_COLOR);if(i!=null||this.mediaTheme&&(i=(r=(a=ke.getComputedStyle(this.mediaTheme))==null?void 0:a.getPropertyValue("--_primary-color"))==null?void 0:r.trim(),i))return i}set primaryColor(i){this.setAttribute(c.PRIMARY_COLOR,`${i}`)}get secondaryColor(){var a,r;let i=this.getAttribute(c.SECONDARY_COLOR);if(i!=null||this.mediaTheme&&(i=(r=(a=ke.getComputedStyle(this.mediaTheme))==null?void 0:a.getPropertyValue("--_secondary-color"))==null?void 0:r.trim(),i))return i}set secondaryColor(i){this.setAttribute(c.SECONDARY_COLOR,`${i}`)}get accentColor(){var a,r;let i=this.getAttribute(c.ACCENT_COLOR);if(i!=null||this.mediaTheme&&(i=(r=(a=ke.getComputedStyle(this.mediaTheme))==null?void 0:a.getPropertyValue("--_accent-color"))==null?void 0:r.trim(),i))return i}set accentColor(i){this.setAttribute(c.ACCENT_COLOR,`${i}`)}get defaultShowRemainingTime(){return this.hasAttribute(c.DEFAULT_SHOW_REMAINING_TIME)}set defaultShowRemainingTime(i){i?this.setAttribute(c.DEFAULT_SHOW_REMAINING_TIME,""):this.removeAttribute(c.DEFAULT_SHOW_REMAINING_TIME)}get playbackRates(){if(this.hasAttribute(c.PLAYBACK_RATES))return this.getAttribute(c.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map(i=>Number(i)).filter(i=>!Number.isNaN(i)).sort((i,a)=>i-a)}set playbackRates(i){if(!i){this.removeAttribute(c.PLAYBACK_RATES);return}this.setAttribute(c.PLAYBACK_RATES,i.join(" "))}get forwardSeekOffset(){var i;return(i=ce(this.getAttribute(c.FORWARD_SEEK_OFFSET)))!=null?i:10}set forwardSeekOffset(i){this.setAttribute(c.FORWARD_SEEK_OFFSET,`${i}`)}get backwardSeekOffset(){var i;return(i=ce(this.getAttribute(c.BACKWARD_SEEK_OFFSET)))!=null?i:10}set backwardSeekOffset(i){this.setAttribute(c.BACKWARD_SEEK_OFFSET,`${i}`)}get defaultHiddenCaptions(){return this.hasAttribute(c.DEFAULT_HIDDEN_CAPTIONS)}set defaultHiddenCaptions(i){i?this.setAttribute(c.DEFAULT_HIDDEN_CAPTIONS,""):this.removeAttribute(c.DEFAULT_HIDDEN_CAPTIONS)}get defaultDuration(){return ce(this.getAttribute(c.DEFAULT_DURATION))}set defaultDuration(i){i==null?this.removeAttribute(c.DEFAULT_DURATION):this.setAttribute(c.DEFAULT_DURATION,`${i}`)}get playerInitTime(){return this.hasAttribute(g.Attributes.PLAYER_INIT_TIME)?ce(this.getAttribute(g.Attributes.PLAYER_INIT_TIME)):B(this,ao)}set playerInitTime(i){i!=this.playerInitTime&&(i==null?this.removeAttribute(g.Attributes.PLAYER_INIT_TIME):this.setAttribute(g.Attributes.PLAYER_INIT_TIME,`${+i}`))}get playerSoftwareName(){var i;return(i=this.getAttribute(g.Attributes.PLAYER_SOFTWARE_NAME))!=null?i:Vd}get playerSoftwareVersion(){var i;return(i=this.getAttribute(g.Attributes.PLAYER_SOFTWARE_VERSION))!=null?i:Fd}get beaconCollectionDomain(){var i;return(i=this.getAttribute(g.Attributes.BEACON_COLLECTION_DOMAIN))!=null?i:void 0}set beaconCollectionDomain(i){i!==this.beaconCollectionDomain&&(i?this.setAttribute(g.Attributes.BEACON_COLLECTION_DOMAIN,i):this.removeAttribute(g.Attributes.BEACON_COLLECTION_DOMAIN))}get maxResolution(){var i;return(i=this.getAttribute(g.Attributes.MAX_RESOLUTION))!=null?i:void 0}set maxResolution(i){i!==this.maxResolution&&(i?this.setAttribute(g.Attributes.MAX_RESOLUTION,i):this.removeAttribute(g.Attributes.MAX_RESOLUTION))}get minResolution(){var i;return(i=this.getAttribute(g.Attributes.MIN_RESOLUTION))!=null?i:void 0}set minResolution(i){i!==this.minResolution&&(i?this.setAttribute(g.Attributes.MIN_RESOLUTION,i):this.removeAttribute(g.Attributes.MIN_RESOLUTION))}get maxAutoResolution(){var i;return(i=this.getAttribute(g.Attributes.MAX_AUTO_RESOLUTION))!=null?i:void 0}set maxAutoResolution(i){i==null?this.removeAttribute(g.Attributes.MAX_AUTO_RESOLUTION):this.setAttribute(g.Attributes.MAX_AUTO_RESOLUTION,i)}get renditionOrder(){var i;return(i=this.getAttribute(g.Attributes.RENDITION_ORDER))!=null?i:void 0}set renditionOrder(i){i!==this.renditionOrder&&(i?this.setAttribute(g.Attributes.RENDITION_ORDER,i):this.removeAttribute(g.Attributes.RENDITION_ORDER))}get programStartTime(){return ce(this.getAttribute(g.Attributes.PROGRAM_START_TIME))}set programStartTime(i){i==null?this.removeAttribute(g.Attributes.PROGRAM_START_TIME):this.setAttribute(g.Attributes.PROGRAM_START_TIME,`${i}`)}get programEndTime(){return ce(this.getAttribute(g.Attributes.PROGRAM_END_TIME))}set programEndTime(i){i==null?this.removeAttribute(g.Attributes.PROGRAM_END_TIME):this.setAttribute(g.Attributes.PROGRAM_END_TIME,`${i}`)}get assetStartTime(){return ce(this.getAttribute(g.Attributes.ASSET_START_TIME))}set assetStartTime(i){i==null?this.removeAttribute(g.Attributes.ASSET_START_TIME):this.setAttribute(g.Attributes.ASSET_START_TIME,`${i}`)}get assetEndTime(){return ce(this.getAttribute(g.Attributes.ASSET_END_TIME))}set assetEndTime(i){i==null?this.removeAttribute(g.Attributes.ASSET_END_TIME):this.setAttribute(g.Attributes.ASSET_END_TIME,`${i}`)}get extraSourceParams(){return this.hasAttribute(c.EXTRA_SOURCE_PARAMS)?[...new URLSearchParams(this.getAttribute(c.EXTRA_SOURCE_PARAMS)).entries()].reduce((i,[a,r])=>(i[a]=r,i),{}):TE}set extraSourceParams(i){i==null?this.removeAttribute(c.EXTRA_SOURCE_PARAMS):this.setAttribute(c.EXTRA_SOURCE_PARAMS,new URLSearchParams(i).toString())}get customDomain(){var i;return(i=this.getAttribute(g.Attributes.CUSTOM_DOMAIN))!=null?i:void 0}set customDomain(i){i!==this.customDomain&&(i?this.setAttribute(g.Attributes.CUSTOM_DOMAIN,i):this.removeAttribute(g.Attributes.CUSTOM_DOMAIN))}get envKey(){var i;return(i=Vt(this,g.Attributes.ENV_KEY))!=null?i:void 0}set envKey(i){this.setAttribute(g.Attributes.ENV_KEY,`${i}`)}get noVolumePref(){return this.hasAttribute(c.NO_VOLUME_PREF)}set noVolumePref(i){i?this.setAttribute(c.NO_VOLUME_PREF,""):this.removeAttribute(c.NO_VOLUME_PREF)}get noMutedPref(){return this.hasAttribute(c.NO_MUTED_PREF)}set noMutedPref(i){i?this.setAttribute(c.NO_MUTED_PREF,""):this.removeAttribute(c.NO_MUTED_PREF)}get debug(){return Vt(this,g.Attributes.DEBUG)!=null}set debug(i){i?this.setAttribute(g.Attributes.DEBUG,""):this.removeAttribute(g.Attributes.DEBUG)}get disableTracking(){return Vt(this,g.Attributes.DISABLE_TRACKING)!=null}set disableTracking(i){this.toggleAttribute(g.Attributes.DISABLE_TRACKING,!!i)}get disableCookies(){return Vt(this,g.Attributes.DISABLE_COOKIES)!=null}set disableCookies(i){i?this.setAttribute(g.Attributes.DISABLE_COOKIES,""):this.removeAttribute(g.Attributes.DISABLE_COOKIES)}get streamType(){var i,a,r;return(r=(a=this.getAttribute(g.Attributes.STREAM_TYPE))!=null?a:(i=this.media)==null?void 0:i.streamType)!=null?r:D.StreamTypes.UNKNOWN}set streamType(i){this.setAttribute(g.Attributes.STREAM_TYPE,`${i}`)}get defaultStreamType(){var i,a,r;return(r=(a=this.getAttribute(c.DEFAULT_STREAM_TYPE))!=null?a:(i=this.mediaController)==null?void 0:i.getAttribute(c.DEFAULT_STREAM_TYPE))!=null?r:D.StreamTypes.ON_DEMAND}set defaultStreamType(i){i?this.setAttribute(c.DEFAULT_STREAM_TYPE,i):this.removeAttribute(c.DEFAULT_STREAM_TYPE)}get targetLiveWindow(){var i,a;return this.hasAttribute(c.TARGET_LIVE_WINDOW)?+this.getAttribute(c.TARGET_LIVE_WINDOW):(a=(i=this.media)==null?void 0:i.targetLiveWindow)!=null?a:Number.NaN}set targetLiveWindow(i){i==this.targetLiveWindow||Number.isNaN(i)&&Number.isNaN(this.targetLiveWindow)||(i==null?this.removeAttribute(c.TARGET_LIVE_WINDOW):this.setAttribute(c.TARGET_LIVE_WINDOW,`${+i}`))}get liveEdgeStart(){var i;return(i=this.media)==null?void 0:i.liveEdgeStart}get startTime(){return ce(Vt(this,g.Attributes.START_TIME))}set startTime(i){this.setAttribute(g.Attributes.START_TIME,`${i}`)}get preferPlayback(){let i=this.getAttribute(g.Attributes.PREFER_PLAYBACK);if(i===D.PlaybackTypes.MSE||i===D.PlaybackTypes.NATIVE)return i}set preferPlayback(i){i!==this.preferPlayback&&(i===D.PlaybackTypes.MSE||i===D.PlaybackTypes.NATIVE?this.setAttribute(g.Attributes.PREFER_PLAYBACK,i):this.removeAttribute(g.Attributes.PREFER_PLAYBACK))}get metadata(){var i;return(i=this.media)==null?void 0:i.metadata}set metadata(i){if(X(this,W,Ft).call(this),!this.media){ge("underlying media element missing when trying to set metadata. metadata will not be set.");return}this.media.metadata={...rh(this),...i}}get _hlsConfig(){var i;return(i=this.media)==null?void 0:i._hlsConfig}set _hlsConfig(i){if(X(this,W,Ft).call(this),!this.media){ge("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.");return}this.media._hlsConfig=i}async addCuePoints(i){var a;if(X(this,W,Ft).call(this),!this.media){ge("underlying media element missing when trying to addCuePoints. cuePoints will not be added.");return}return(a=this.media)==null?void 0:a.addCuePoints(i)}get activeCuePoint(){var i;return(i=this.media)==null?void 0:i.activeCuePoint}get cuePoints(){var i,a;return(a=(i=this.media)==null?void 0:i.cuePoints)!=null?a:[]}addChapters(i){var a;if(X(this,W,Ft).call(this),!this.media){ge("underlying media element missing when trying to addChapters. chapters will not be added.");return}return(a=this.media)==null?void 0:a.addChapters(i)}get activeChapter(){var i;return(i=this.media)==null?void 0:i.activeChapter}get chapters(){var i,a;return(a=(i=this.media)==null?void 0:i.chapters)!=null?a:[]}getStartDate(){var i;return(i=this.media)==null?void 0:i.getStartDate()}get currentPdt(){var i;return(i=this.media)==null?void 0:i.currentPdt}get tokens(){let i=this.getAttribute(c.PLAYBACK_TOKEN),a=this.getAttribute(c.DRM_TOKEN),r=this.getAttribute(c.THUMBNAIL_TOKEN),o=this.getAttribute(c.STORYBOARD_TOKEN);return{...B(this,oo),...i!=null?{playback:i}:{},...a!=null?{drm:a}:{},...r!=null?{thumbnail:r}:{},...o!=null?{storyboard:o}:{}}}set tokens(i){ye(this,oo,i!=null?i:{})}get playbackToken(){var i;return(i=this.getAttribute(c.PLAYBACK_TOKEN))!=null?i:void 0}set playbackToken(i){this.setAttribute(c.PLAYBACK_TOKEN,`${i}`)}get drmToken(){var i;return(i=this.getAttribute(c.DRM_TOKEN))!=null?i:void 0}set drmToken(i){this.setAttribute(c.DRM_TOKEN,`${i}`)}get thumbnailToken(){var i;return(i=this.getAttribute(c.THUMBNAIL_TOKEN))!=null?i:void 0}set thumbnailToken(i){this.setAttribute(c.THUMBNAIL_TOKEN,`${i}`)}get storyboardToken(){var i;return(i=this.getAttribute(c.STORYBOARD_TOKEN))!=null?i:void 0}set storyboardToken(i){this.setAttribute(c.STORYBOARD_TOKEN,`${i}`)}addTextTrack(i,a,r,o){var d;let s=(d=this.media)==null?void 0:d.nativeEl;if(s)return(0,D.addTextTrack)(s,i,a,r,o)}removeTextTrack(i){var r;let a=(r=this.media)==null?void 0:r.nativeEl;if(a)return(0,D.removeTextTrack)(a,i)}get textTracks(){var i;return(i=this.media)==null?void 0:i.textTracks}get castReceiver(){var i;return(i=this.getAttribute(c.CAST_RECEIVER))!=null?i:void 0}set castReceiver(i){i!==this.castReceiver&&(i?this.setAttribute(c.CAST_RECEIVER,i):this.removeAttribute(c.CAST_RECEIVER))}get castCustomData(){var i;return(i=this.media)==null?void 0:i.castCustomData}set castCustomData(i){if(!this.media){ge("underlying media element missing when trying to set castCustomData. castCustomData will not be set.");return}this.media.castCustomData=i}get noTooltips(){return this.hasAttribute(c.NO_TOOLTIPS)}set noTooltips(i){if(!i){this.removeAttribute(c.NO_TOOLTIPS);return}this.setAttribute(c.NO_TOOLTIPS,"")}get proudlyDisplayMuxBadge(){return this.hasAttribute(c.PROUDLY_DISPLAY_MUX_BADGE)}set proudlyDisplayMuxBadge(i){i?this.setAttribute(c.PROUDLY_DISPLAY_MUX_BADGE,""):this.removeAttribute(c.PROUDLY_DISPLAY_MUX_BADGE)}};ao=new WeakMap,ro=new WeakMap,oo=new WeakMap,Kt=new WeakMap,no=new WeakMap,Si=new WeakMap,W=new WeakSet,Ft=function(){var i,a,r,o;if(!B(this,ro)){ye(this,ro,!0),X(this,W,ki).call(this);try{if(customElements.upgrade(this.mediaTheme),!(this.mediaTheme instanceof ke.HTMLElement))throw""}catch{ge("<media-theme> failed to upgrade!")}try{customElements.upgrade(this.media)}catch{ge("underlying media element failed to upgrade!")}try{if(customElements.upgrade(this.mediaController),!(this.mediaController instanceof js))throw""}catch{ge("<media-controller> failed to upgrade!")}X(this,W,sh).call(this),X(this,W,lh).call(this),X(this,W,dh).call(this),ye(this,Kt,(a=(i=this.mediaController)==null?void 0:i.hasAttribute(y.USER_INACTIVE))!=null?a:!0),X(this,W,uh).call(this),(r=this.media)==null||r.addEventListener("streamtypechange",()=>X(this,W,ki).call(this)),(o=this.media)==null||o.addEventListener("loadstart",()=>X(this,W,ki).call(this))}},nh=function(){var i,a;try{(i=window==null?void 0:window.CSS)==null||i.registerProperty({name:"--media-primary-color",syntax:"<color>",inherits:!0}),(a=window==null?void 0:window.CSS)==null||a.registerProperty({name:"--media-secondary-color",syntax:"<color>",inherits:!0})}catch{}},Gd=function(i){Object.assign(B(this,Si),i),X(this,W,ki).call(this)},ki=function(i={}){Tm(ym(fE(this,{...B(this,Si),...i})),this.shadowRoot)},sh=function(){let i=r=>{var d,u;if(!(r!=null&&r.startsWith("theme-")))return;let o=r.replace(/^theme-/,"");if(Wd.includes(o))return;let s=this.getAttribute(r);s!=null?(d=this.mediaTheme)==null||d.setAttribute(o,s):(u=this.mediaTheme)==null||u.removeAttribute(o)};new MutationObserver(r=>{for(let{attributeName:o}of r)i(o)}).observe(this,{attributes:!0}),this.getAttributeNames().forEach(i)},lh=function(){let i=a=>{var s;let r=(s=this.media)==null?void 0:s.error;if(!(r instanceof g.MediaError)){let{message:d,code:u}=r!=null?r:{};r=new g.MediaError(d,u)}if(!(r!=null&&r.fatal)){at(r),r.data&&at(`${r.name} data:`,r.data);return}let o=Jl(r,!1);o.message&&Bl(o),ge(r),r.data&&ge(`${r.name} data:`,r.data),X(this,W,Gd).call(this,{isDialogOpen:!0})};this.addEventListener("error",i),this.media&&(this.media.errorTranslator=(a={})=>{var o,s,d;if(!(((o=this.media)==null?void 0:o.error)instanceof g.MediaError))return a;let r=Jl((s=this.media)==null?void 0:s.error,!1);return{player_error_code:(d=this.media)==null?void 0:d.error.code,player_error_message:r.message?String(r.message):a.player_error_message,player_error_context:r.context?String(r.context):a.player_error_context}})},dh=function(){var a,r,o,s;let i=()=>X(this,W,ki).call(this);(r=(a=this.media)==null?void 0:a.textTracks)==null||r.addEventListener("addtrack",i),(s=(o=this.media)==null?void 0:o.textTracks)==null||s.addEventListener("removetrack",i)},uh=function(){var p,T;if(!/Firefox/i.test(navigator.userAgent))return;let a,r=new WeakMap,o=()=>this.streamType===D.StreamTypes.LIVE&&!this.secondaryColor&&this.offsetWidth>=800,s=(_,E,f=!1)=>{if(o())return;Array.from(_&&_.activeCues||[]).forEach(b=>{if(!(!b.snapToLines||b.line<-5||b.line>=0&&b.line<10))if(!E||this.paused){let C=b.text.split(`
`).length,L=-3;this.streamType===D.StreamTypes.LIVE&&(L=-2);let ie=L-C;if(b.line===ie&&!f)return;r.has(b)||r.set(b,b.line),b.line=ie}else setTimeout(()=>{b.line=r.get(b)||"auto"},500)})},d=()=>{var _,E;s(a,(E=(_=this.mediaController)==null?void 0:_.hasAttribute(y.USER_INACTIVE))!=null?E:!1)},u=()=>{var f,M;let E=Array.from(((M=(f=this.mediaController)==null?void 0:f.media)==null?void 0:M.textTracks)||[]).filter(b=>["subtitles","captions"].includes(b.kind)&&b.mode==="showing")[0];E!==a&&(a==null||a.removeEventListener("cuechange",d)),a=E,a==null||a.addEventListener("cuechange",d),s(a,B(this,Kt))};u(),(p=this.textTracks)==null||p.addEventListener("change",u),(T=this.textTracks)==null||T.addEventListener("addtrack",u),this.addEventListener("userinactivechange",()=>{var E,f;let _=(f=(E=this.mediaController)==null?void 0:E.hasAttribute(y.USER_INACTIVE))!=null?f:!0;B(this,Kt)!==_&&(ye(this,Kt,_),s(a,B(this,Kt)))})};function Vt(t,e){return t.media?t.media.getAttribute(e):t.getAttribute(e)}var yE=Kd;
