function j(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var F={exports:{}},a={};Object.defineProperty(a,"__esModule",{value:!0});a.DATA_CLONE_ERROR=a.MESSAGE=a.REJECTED=a.FULFILLED=a.REPLY=a.CALL=a.HANDSHAKE_REPLY=a.HANDSHAKE=void 0;const J="handshake";a.HANDSHAKE=J;const W="handshake-reply";a.HANDSHAKE_REPLY=W;const B="call";a.CALL=B;const q="reply";a.REPLY=q;const k="fulfilled";a.FULFILLED=k;const Q="rejected";a.REJECTED=Q;const X="message";a.MESSAGE=X;const Z="DataCloneError";a.DATA_CLONE_ERROR=Z;var N={};Object.defineProperty(N,"__esModule",{value:!0});N.ERR_NO_IFRAME_SRC=N.ERR_NOT_IN_IFRAME=N.ERR_CONNECTION_TIMEOUT=N.ERR_CONNECTION_DESTROYED=void 0;const ee="ConnectionDestroyed";N.ERR_CONNECTION_DESTROYED=ee;const re="ConnectionTimeout";N.ERR_CONNECTION_TIMEOUT=re;const te="NotInIframe";N.ERR_NOT_IN_IFRAME=te;const ne="NoIframeSrc";N.ERR_NO_IFRAME_SRC=ne;var $={exports:{}};(function(r,e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t=()=>{const n=[];let s=!1;return{destroy(){s=!0,n.forEach(i=>{i()})},onDestroy(i){s?i():n.push(i)}}};e.default=t,r.exports=e.default})($,$.exports);var H={exports:{}},A={};Object.defineProperty(A,"__esModule",{value:!0});A.deserializeError=A.serializeError=void 0;const oe=r=>{let e=r.name,t=r.message,n=r.stack;return{name:e,message:t,stack:n}};A.serializeError=oe;const ie=r=>{const e=new Error;return Object.keys(r).forEach(t=>e[t]=r[t]),e};A.deserializeError=ie;(function(r,e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t=a,n=A,s=(i,u,m)=>{const d=i.localName,_=i.local,E=i.remote,p=i.originForSending,l=i.originForReceiving;let f=!1;m(`${d}: Connecting call receiver`);const O=c=>{if(c.source!==E||c.data.penpal!==t.CALL)return;if(c.origin!==l){m(`${d} received message from origin ${c.origin} which did not match expected origin ${l}`);return}const h=c.data,D=h.methodName,S=h.args,T=h.id;m(`${d}: Received ${D}() call`);const g=R=>v=>{if(m(`${d}: Sending ${D}() reply`),f){m(`${d}: Unable to send ${D}() reply due to destroyed connection`);return}const C={penpal:t.REPLY,id:T,resolution:R,returnValue:v};R===t.REJECTED&&v instanceof Error&&(C.returnValue=(0,n.serializeError)(v),C.returnValueIsError=!0);try{E.postMessage(C,p)}catch(L){throw L.name===t.DATA_CLONE_ERROR&&E.postMessage({penpal:t.REPLY,id:T,resolution:t.REJECTED,returnValue:(0,n.serializeError)(L),returnValueIsError:!0},p),L}};new Promise(R=>R(u[D].apply(u,S))).then(g(t.FULFILLED),g(t.REJECTED))};return _.addEventListener(t.MESSAGE,O),()=>{f=!0,_.removeEventListener(t.MESSAGE,O)}};e.default=s,r.exports=e.default})(H,H.exports);var Y={exports:{}},G={exports:{}};(function(r,e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;let t=0;var n=()=>++t;e.default=n,r.exports=e.default})(G,G.exports);(function(r,e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t=a,n=N,s=u(G.exports),i=A;function u(d){return d&&d.__esModule?d:{default:d}}var m=(d,_,E,p,l)=>{const f=_.localName,O=_.local,c=_.remote,h=_.originForSending,D=_.originForReceiving;let S=!1;l(`${f}: Connecting call sender`);const T=g=>function(){for(var R=arguments.length,v=new Array(R),C=0;C<R;C++)v[C]=arguments[C];l(`${f}: Sending ${g}() call`);let L;try{c.closed&&(L=!0)}catch{L=!0}if(L&&p(),S){const w=new Error(`Unable to send ${g}() call due to destroyed connection`);throw w.code=n.ERR_CONNECTION_DESTROYED,w}return new Promise((w,P)=>{const M=(0,s.default)(),I=o=>{if(o.source!==c||o.data.penpal!==t.REPLY||o.data.id!==M)return;if(o.origin!==D){l(`${f} received message from origin ${o.origin} which did not match expected origin ${D}`);return}l(`${f}: Received ${g}() reply`),O.removeEventListener(t.MESSAGE,I);let y=o.data.returnValue;o.data.returnValueIsError&&(y=(0,i.deserializeError)(y)),(o.data.resolution===t.FULFILLED?w:P)(y)};O.addEventListener(t.MESSAGE,I),c.postMessage({penpal:t.CALL,id:M,methodName:g,args:v},h)})};return E.reduce((g,R)=>(g[R]=T(R),g),d),()=>{S=!0}};e.default=m,r.exports=e.default})(Y,Y.exports);var V={exports:{}};(function(r,e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t=n=>function(){if(n){for(var s=arguments.length,i=new Array(s),u=0;u<s;u++)i[u]=arguments[u];console.log("[Penpal]",...i)}};e.default=t,r.exports=e.default})(V,V.exports);(function(r,e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var t=a,n=N,s=d($.exports),i=d(H.exports),u=d(Y.exports),m=d(V.exports);function d(E){return E&&E.__esModule?E:{default:E}}var _=function(){let p=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},l=p.parentOrigin,f=l===void 0?"*":l,O=p.methods,c=O===void 0?{}:O,h=p.timeout,D=p.debug;const S=(0,m.default)(D);if(window===window.top){const w=new Error("connectToParent() must be called within an iframe");throw w.code=n.ERR_NOT_IN_IFRAME,w}const T=(0,s.default)(),g=T.destroy,R=T.onDestroy,v=window,C=v.parent;return{promise:new Promise((w,P)=>{let M;h!==void 0&&(M=setTimeout(()=>{const o=new Error(`Connection to parent timed out after ${h}ms`);o.code=n.ERR_CONNECTION_TIMEOUT,P(o),g()},h));const I=o=>{try{clearTimeout()}catch{return}if(o.source!==C||o.data.penpal!==t.HANDSHAKE_REPLY)return;if(f!=="*"&&f!==o.origin){S(`Child received handshake reply from origin ${o.origin} which did not match expected origin ${f}`);return}S("Child: Received handshake reply"),v.removeEventListener(t.MESSAGE,I);const y={localName:"Child",local:v,remote:C,originForSending:o.origin==="null"?"*":o.origin,originForReceiving:o.origin},x={},K=(0,i.default)(y,c,S);R(K);const b=(0,u.default)(x,y,o.data.methodNames,g,S);R(b),clearTimeout(M),w(x)};v.addEventListener(t.MESSAGE,I),R(()=>{v.removeEventListener(t.MESSAGE,I);const o=new Error("Connection destroyed");o.code=n.ERR_CONNECTION_DESTROYED,P(o)}),S("Child: Sending handshake"),C.postMessage({penpal:t.HANDSHAKE,methodNames:Object.keys(c)},f)}),destroy:g}};e.default=_,r.exports=e.default})(F,F.exports);const ae=j(F.exports);function U(r,e,t,n){var s,i=!1,u=0;function m(){s&&clearTimeout(s)}function d(){m(),i=!0}typeof e!="boolean"&&(n=t,t=e,e=void 0);function _(){for(var E=arguments.length,p=new Array(E),l=0;l<E;l++)p[l]=arguments[l];var f=this,O=Date.now()-u;if(i)return;function c(){u=Date.now(),t.apply(f,p)}function h(){s=void 0}n&&!s&&c(),m(),n===void 0&&O>r?c():e!==!0&&(s=setTimeout(n?h:c,n===void 0?r-O:r))}return _.cancel=d,_}function de(r,e,t){return t===void 0?U(r,e,!1):U(r,t,e!==!1)}const se=!1,ce="<%= origin %>";function le(){return window.editor.doc.getValue()}function z(r){window.editor.doc.setValue(r)}function ue(r){if(window.cmClient!=null){z(r);return}const e=setInterval(()=>{window.cmClient!=null&&(clearInterval(e),z(r))},250)}function Ee(r){window.growi.notifyBodyChanges(r)}const fe=de(800,Ee);function ge(r){window.growi.saveWithShortcut(r)}function Re(){const r=window.CodeMirror,e=window.editor;r==null||e==null||(e.on("change",(t,n)=>{n.origin!=="ignoreHistory"&&fe(t.doc.getValue())}),r.commands.save=function(t){ge(t.doc.getValue())},delete e.options.extraKeys["Cmd-S"],delete e.options.extraKeys["Ctrl-S"])}function _e(){ae({parentOrigin:ce,methods:{getValue(){return le()},setValue(e){z(e)},setValueOnInit(e){ue(e)}},debug:se}).promise.then(e=>{window.growi=e}).catch(e=>{console.log(e)})}(function(){if(window===window.parent){console.log("[GROWI] Loading agent for HackMD is not processed because currently not in iframe");return}console.log("[HackMD] Loading GROWI agent for HackMD..."),window.addEventListener("load",()=>{Re()}),_e(),console.log("[HackMD] GROWI agent for HackMD has successfully loaded.")})();
