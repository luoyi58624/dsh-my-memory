window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Ze=Object.create;var se=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var et=Object.getOwnPropertyNames;var tt=Object.getPrototypeOf,at=Object.prototype.hasOwnProperty;var st=(e,t)=>{for(var a in t)se(e,a,{get:t[a],enumerable:!0})},fe=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of et(t))!at.call(e,n)&&n!==a&&se(e,n,{get:()=>t[n],enumerable:!(o=Qe(t,n))||o.enumerable});return e};var W=(e,t,a)=>(a=e!=null?Ze(tt(e)):{},fe(t||!e||!e.__esModule?se(a,"default",{value:e,enumerable:!0}):a,e)),rt=e=>fe(se({},"__esModule",{value:!0}),e);var Pt={};st(Pt,{apply:()=>Ct,inject:()=>St,name:()=>kt});module.exports=rt(Pt);var T=W(require("react"),1);var G=W(require("react"),1);var nt="/my-memory/api";async function X(e,t){let a=await fetch(`${nt}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),n;try{n=o?JSON.parse(o):null}catch{n={error:o.slice(0,500)}}if(!a.ok){let i=new Error(n&&(n.error||n.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=n,i}return n}function ot(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function re(e){let t=String(e?.id??""),a=String(e?.path??""),o=String(e?.display??"")||ot(a)||(t?`~\\${t}\\agent.md`:"");return{id:t,name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:a,display:o}}async function Z(){let e=await X("/personas"),t=Array.isArray(e?.items)?e.items.map(re):[],a=e?.activeId?String(e.activeId):t[0]?.id??null;return{items:t,activeId:a}}async function be(e){let t=String(e?.dir??"").trim(),a=await X("/personas",{method:"POST",body:JSON.stringify({dir:t,name:t})});return re(a)}async function ne(e,t){let a=await X(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(t??{})});return re(a)}function ge(e){return X(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function xe(e){return X(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function ve(e){return X(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function we(e,t){let a=await X(`/personas/${encodeURIComponent(String(e))}/rename`,{method:"POST",body:JSON.stringify({dir:String(t??"").trim()})});return re(a)}var J=require("react/jsx-runtime"),it=1600;function ke({persona:e,onSaved:t}={}){let[a,o]=G.useState(String(e?.name??"")),[n,i]=G.useState(String(e?.body??"")),[m,u]=G.useState(!1),[f,p]=G.useState(""),[b,h]=G.useState(""),N=G.useRef({name:String(e?.name??""),body:String(e?.body??"")}),C=G.useRef(!1),P=G.useRef(null);G.useEffect(()=>()=>{P.current&&clearTimeout(P.current)},[]);async function E(x){if(C.current)return;let y={name:x.name!==void 0?String(x.name):a,body:x.body!==void 0?String(x.body):n};if(!(y.name===N.current.name&&y.body===N.current.body)){C.current=!0,u(!0),h("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let r={};y.name!==N.current.name&&(r.name=y.name),y.body!==N.current.body&&(r.body=y.body);let d=await ne(e.id,r),v={name:String(d?.name??y.name),body:String(d?.body??y.body)};N.current=v,o(v.name),i(v.body),t?.({...v,id:e.id,updated:Number(d?.updated)||0}),p("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),P.current&&clearTimeout(P.current),P.current=setTimeout(()=>{P.current=null,p("")},it)}catch(r){h(`\u4FDD\u5B58\u5931\u8D25\uFF1A${r?.message||r}`)}finally{C.current=!1,u(!1)}}}return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{className:"dsh-mymem-field",children:[(0,J.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,J.jsx)("input",{className:"dsh-mymem-input",value:a,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onChange:x=>o(x.target.value),onBlur:()=>void E({name:a})})]}),(0,J.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",m?" \xB7 \u4FDD\u5B58\u4E2D\u2026":f?` \xB7 ${f}`:""]}),b?(0,J.jsx)("div",{className:"dsh-mymem-error",children:b}):null,(0,J.jsxs)("label",{className:"dsh-mymem-field",children:[(0,J.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,J.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:n,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:x=>i(x.target.value),onBlur:()=>void E({body:n})})]})]})}var z=W(require("react"),1);var mt="/my-memory/api";async function K(e,t){let a=await fetch(`${mt}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),n;try{n=o?JSON.parse(o):null}catch{n={error:o.slice(0,500)}}if(!a.ok){let i=new Error(n&&(n.error||n.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=n,i}return n}async function Se(e){let t=e?.scope==="project"?"project":"global",a=new URLSearchParams({scope:t});t==="project"&&e?.project&&a.set("project",String(e.project));let o=await K(`/memory?${a.toString()}`);return{items:(Array.isArray(o?.items)?o.items:[]).map(i=>({id:String(i?.id??""),summary:String(i?.summary??i?.text??""),date:String(i?.date??""),title:i?.title?String(i.title):"",tags:Array.isArray(i?.tags)?i.tags:[]}))}}async function le(){let e=await K("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??""),rev:String(e?.rev??"")}}function ce(e){return K("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??""),baseRev:String(e?.baseRev??""),...e?.force?{force:!0}:{}})})}async function Re(){let e=await K("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??""),folderName:String(e?.folderName??"dsh-my-memory")}}function Ne(e){return K("/settings/dataDir",{method:"POST",body:JSON.stringify({parent:String(e??"")})})}function Ce(){return K("/settings/reveal",{method:"POST"})}async function Q(e){let t=await K(`/session/persona?session=${encodeURIComponent(String(e))}`);return{sessionId:String(t?.sessionId??e),personaId:t?.personaId?String(t.personaId):null,name:String(t?.name??""),locked:!!t?.locked}}function Pe(e,t){return K("/session/persona",{method:"POST",body:JSON.stringify({session:String(e),personaId:String(t)})})}async function Ee(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await K(`/project/state${t}`);return{cwd:String(a?.cwd??""),memoryPath:String(a?.memoryPath??""),exists:!!a?.exists,enabled:!!a?.enabled,hasLegacy:!!a?.hasLegacy}}function De(e,t){return K("/project/state",{method:"POST",body:JSON.stringify({...e?{cwd:String(e)}:{},enabled:!!t})})}async function Me(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await K(`/project/raw${t}`);return{path:String(a?.path??""),text:String(a?.text??"")}}function ze(e,t){let a=String(e??"").split(`
`),o=String(t??"").split(`
`);if(a.length>1500||o.length>1500)return[...a.map(b=>({kind:"del",text:b})),...o.map(b=>({kind:"add",text:b}))];let n=a.length,i=o.length,m=Array.from({length:n+1},()=>new Uint16Array(i+1));for(let b=n-1;b>=0;b-=1)for(let h=i-1;h>=0;h-=1)m[b][h]=a[b]===o[h]?m[b+1][h+1]+1:Math.max(m[b+1][h],m[b][h+1]);let u=[],f=0,p=0;for(;f<n&&p<i;)a[f]===o[p]?(u.push({kind:"same",text:a[f]}),f+=1,p+=1):m[f+1][p]>=m[f][p+1]?(u.push({kind:"del",text:a[f]}),f+=1):(u.push({kind:"add",text:o[p]}),p+=1);for(;f<n;)u.push({kind:"del",text:a[f]}),f+=1;for(;p<i;)u.push({kind:"add",text:o[p]}),p+=1;return u}function Te(e){let t=0,a=0;for(let o of e||[])o.kind==="add"?t+=1:o.kind==="del"&&(a+=1);return{added:t,removed:a}}var g=require("react/jsx-runtime");function dt(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Ie(){let e=new Date,t=a=>String(a).padStart(2,"0");return`${t(e.getHours())}:${t(e.getMinutes())}`}function $e(){let[e,t]=z.useState(null),[a,o]=z.useState(!0),[n,i]=z.useState(""),[m,u]=z.useState(""),[f,p]=z.useState(""),[b,h]=z.useState(""),[N,C]=z.useState(!1),[P,E]=z.useState(""),[x,y]=z.useState(null),[r,d]=z.useState(null),v=m!==f,l=z.useRef(m),D=z.useRef(v),_=z.useRef(b);z.useEffect(()=>{l.current=m,D.current=v,_.current=b},[m,v,b]);let w=z.useCallback(async()=>{o(!0);try{let k=await le(),M=String(k?.text??"");t({path:String(k?.path??"")}),u(M),p(M),h(String(k?.rev??"")),y(null),i("")}catch(k){i(`\u8BFB\u53D6\u5931\u8D25\uFF1A${k?.message||k}`)}finally{o(!1)}},[]);z.useEffect(()=>{w()},[w]);async function U(){try{let k=await le(),M=String(k?.text??""),F=String(k?.rev??"");if(!D.current){u(M),p(M),h(F),y(null),i("");return}F&&F!==_.current&&y({text:M,rev:F})}catch{}}async function oe(){if(!D.current||N)return;let k=l.current;C(!0),i("");try{let M=await ce({scope:"global",text:k,baseRev:_.current});h(String(M?.rev??"")),p(String(M?.text??k)),y(null),E(Ie())}catch(M){if(M?.status===409){let F=M.body||{};d({mode:"conflict",diskText:String(F.text??""),diskRev:String(F.rev??""),baseRev:String(F.baseRev??_.current)})}else i(`\u4FDD\u5B58\u5931\u8D25\uFF1A${M?.message||M}`)}finally{C(!1)}}async function ie(){C(!0),i("");try{let k=await ce({scope:"global",text:l.current,baseRev:_.current,force:!0});h(String(k?.rev??"")),p(String(k?.text??l.current)),y(null),d(null),E(Ie())}catch(k){i(`\u8986\u76D6\u5931\u8D25\uFF1A${k?.message||k}`)}finally{C(!1)}}function me(k,M){u(k),p(k),M&&h(M),y(null),d(null)}let te=r?ze(r.mode==="conflict"?r.diskText:r.text,m):[],ae=Te(te);return(0,g.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,g.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,g.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${dt(e.path)}`:""}),(0,g.jsx)("span",{className:"dsh-mymem-spacer"}),(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:a||N,onClick:()=>void w(),children:a?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),x&&!r?(0,g.jsxs)("div",{className:"dsh-mymem-remotebar",children:[(0,g.jsx)("span",{children:"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u66F4\u65B0"}),(0,g.jsx)("span",{className:"dsh-mymem-raw-grow"}),(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>d({mode:"compare",text:x.text,rev:x.rev}),children:"\u5BF9\u6BD4"})]}):null,n?(0,g.jsx)("div",{className:"dsh-mymem-error",children:n}):null,(0,g.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:m,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C\uFF1B\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",onFocus:()=>void U(),onBlur:()=>void oe(),onChange:k=>u(k.target.value)}),r?(0,g.jsxs)("div",{className:"dsh-mymem-diff","data-kind":r.mode,children:[(0,g.jsxs)("div",{className:"dsh-mymem-diff-head",children:[(0,g.jsx)("span",{className:"dsh-mymem-diff-title",children:r.mode==="conflict"?"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u7ECF\u88AB\u6539\u8FC7":"\u548C\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5BF9\u6BD4"}),(0,g.jsxs)("span",{className:"dsh-mymem-diff-count",children:["\u65B0\u589E ",ae.added," \u884C \xB7 \u5220\u9664 ",ae.removed," \u884C"]})]}),(0,g.jsx)("div",{className:"dsh-mymem-diff-body",children:te.map((k,M)=>(0,g.jsxs)("div",{className:"dsh-mymem-diffline","data-kind":k.kind,children:[(0,g.jsx)("span",{className:"dsh-mymem-diffmark",children:k.kind==="add"?"+":k.kind==="del"?"\u2212":" "}),(0,g.jsx)("span",{className:"dsh-mymem-difftext",children:k.text||" "})]},M))}),(0,g.jsx)("div",{className:"dsh-mymem-diff-actions",children:r.mode==="conflict"?(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:N,onClick:()=>void ie(),children:"\u7528\u6211\u7684\u8986\u76D6"}),(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>me(r.diskText,r.diskRev),children:"\u7528\u78C1\u76D8\u7684"}),(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>d(null),children:"\u53D6\u6D88"})]}):(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>me(r.text,r.rev),children:"\u7528\u78C1\u76D8\u7684"}),(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>d(null),children:"\u5173\u95ED"})]})})]}):null,(0,g.jsxs)("div",{className:"dsh-mymem-raw-status",children:[N?"\u4FDD\u5B58\u4E2D\u2026":P?`\u5DF2\u4FDD\u5B58 \xB7 ${P}`:"\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",v&&!N?" \xB7 \u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8":""]})]})}var O=W(require("react"),1);var H=W(require("react"),1),ue=W(require("react-dom"),1),I=require("react/jsx-runtime");function je(e,t){let a=H.useRef(null);H.useEffect(()=>{a.current=typeof document<"u"?document.activeElement:null;let o=t.current;return o&&(o.focus(),typeof o.select=="function"&&o.select()),()=>{let n=a.current;if(n&&typeof n.focus=="function"&&document.contains(n))try{n.focus()}catch{}}},[t]),H.useEffect(()=>{let o=n=>{n.key==="Escape"&&e?.()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[e])}function Y({title:e,description:t,label:a,defaultValue:o="",placeholder:n,confirmText:i="\u786E\u5B9A",validate:m,allowEmpty:u=!1,onSubmit:f,onCancel:p}){let[b,h]=H.useState(o),[N,C]=H.useState(""),[P,E]=H.useState(!1),x=H.useRef(null);je(p,x);let y=b.trim(),r=y&&m?m(y):"",d=(u||!!y)&&!r&&!P;async function v(){if(d){if(m&&y){let l=m(y);if(l){C(l);return}}E(!0),C("");try{await f?.(y)}catch(l){C(String(l?.message||l))}finally{E(!1)}}}return typeof document>"u"?null:ue.createPortal((0,I.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:l=>{l.target===l.currentTarget&&p?.()},children:(0,I.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,I.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,I.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,a?(0,I.jsx)("div",{className:"dsh-mymem-modal-label",children:a}):null,(0,I.jsx)("input",{ref:x,className:"dsh-mymem-input",value:b,placeholder:n||"",spellCheck:!1,onChange:l=>{h(l.target.value),C("")},onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),v())}}),r||N?(0,I.jsx)("div",{className:"dsh-mymem-modal-error",children:N||r}):null,(0,I.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,I.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>p?.(),children:"\u53D6\u6D88"}),(0,I.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!d,onClick:()=>void v(),children:P?"\u5904\u7406\u4E2D\u2026":i})]})]})}),document.body)}function Le({title:e,message:t,confirmText:a="\u786E\u5B9A",danger:o,onOk:n,onCancel:i}){let m=H.useRef(null);return je(i,m),H.useEffect(()=>{let u=f=>{f.key==="Enter"&&(f.preventDefault(),n?.())};return document.addEventListener("keydown",u),()=>document.removeEventListener("keydown",u)},[n]),typeof document>"u"?null:ue.createPortal((0,I.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:u=>{u.target===u.currentTarget&&i?.()},children:(0,I.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,I.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,I.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,(0,I.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,I.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>i?.(),children:"\u53D6\u6D88"}),(0,I.jsx)("button",{ref:m,className:`dsh-mymem-btn${o?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>n?.(),children:a})]})]})}),document.body)}var j=require("react/jsx-runtime");function pe(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Oe({onChanged:e,pick:t}={}){let[a,o]=O.useState(null),[n,i]=O.useState(""),[m,u]=O.useState(""),[f,p]=O.useState(""),[b,h]=O.useState(!1),[N,C]=O.useState(!1),[P,E]=O.useState(!1),x=O.useRef(null);O.useEffect(()=>()=>{x.current&&clearTimeout(x.current)},[]);let y=O.useCallback(async()=>{try{let w=await Re();o(w),i("")}catch(w){i(`\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A${w?.message||w}`)}},[]);O.useEffect(()=>{y()},[y]);function r(w){u(w),x.current&&clearTimeout(x.current),x.current=setTimeout(()=>{x.current=null,u("")},2600)}let d=a?.folderName||"dsh-my-memory",v=typeof t=="function";async function l(w){E(!0),i("");try{let U=await Ne(w);h(!1),p(String(U?.movedFrom??"")),await y(),r(`\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362\uFF1A${pe(String(U?.dataDir??""))}`),e?.()}catch(U){throw new Error(String(U?.message||U))}finally{E(!1)}}async function D(){if(i(""),!v){h(!0);return}C(!0);try{let w=await t();if(!w)return;await l(w)}catch(w){i(`\u9009\u62E9\u76EE\u5F55\u5931\u8D25\uFF1A${w?.message||w}`)}finally{C(!1)}}async function _(){i("");try{await Ce()}catch(w){i(`\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A${w?.message||w}`)}}return(0,j.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,j.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,j.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5168\u5C40\u8BB0\u5FC6\u3001\u9879\u76EE\u8BB0\u5FC6\u90FD\u5B58\u5728\u8FD9\u4E2A\u76EE\u5F55\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,j.jsx)("div",{className:"dsh-mymem-settings-path",title:a?.dataDir||"",children:a?.dataDir||(a?"\uFF08\u7A7A\uFF09":"\u8BFB\u53D6\u4E2D\u2026")}),(0,j.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,j.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>void _(),children:"\u6253\u5F00\u76EE\u5F55"}),(0,j.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a||N||P,onClick:()=>void D(),children:N?"\u9009\u62E9\u4E2D\u2026":"\u66F4\u6539\u76EE\u5F55"}),m?(0,j.jsx)("span",{className:"dsh-mymem-ok",children:m}):null]}),(0,j.jsxs)("div",{className:"dsh-mymem-hint",children:["\u66F4\u6539\u76EE\u5F55\u65F6\u9009\u7684\u662F\u7236\u76EE\u5F55\uFF0C\u6570\u636E\u56FA\u5B9A\u653E\u5728 ",(0,j.jsx)("code",{children:d})," \u5B50\u76EE\u5F55\u91CC\uFF1A\u4F8B\u5982\u9009\u4E86 D:\\projects\uFF0C\u5B9E\u9645\u4F4D\u7F6E\u662F D:\\projects\\"+d+"\u3002"]}),a?.defaultDataDir?(0,j.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",pe(a.defaultDataDir),"\uFF08\u4E0D\u9009 = \u4F7F\u7528\u9ED8\u8BA4\uFF09"]}):null,f?(0,j.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",pe(f),"\uFF1B\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u624B\u52A8\u590D\u5236\u8FC7\u6765\u3002"]}):null,n?(0,j.jsx)("div",{className:"dsh-mymem-error",children:n}):null,b?(0,j.jsx)(Y,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:`\u9009\u4E00\u4E2A\u7236\u76EE\u5F55\uFF08\u7559\u7A7A = \u4F7F\u7528\u9ED8\u8BA4\u76EE\u5F55\uFF09\u3002\u6570\u636E\u4F1A\u653E\u5728\u6240\u9009\u76EE\u5F55\u4E0B\u7684 ${d} \u91CC\u3002`,label:"\u7236\u76EE\u5F55",defaultValue:"",placeholder:"\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u4F8B\u5982 D:\\projects",confirmText:P?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:l,onCancel:()=>h(!1)}):null]})}var Ae=W(require("react"),1),Be=W(require("react-dom"),1),he=require("react/jsx-runtime"),lt=160,ct=130;function _e({menu:e,onClose:t}){if(Ae.useEffect(()=>{if(!e)return;let m=()=>t(),u=f=>{f.key==="Escape"&&t()};return document.addEventListener("mousedown",m),document.addEventListener("keydown",u),window.addEventListener("blur",m),()=>{document.removeEventListener("mousedown",m),document.removeEventListener("keydown",u),window.removeEventListener("blur",m)}},[e,t]),!e||typeof document>"u")return null;let a=window.innerWidth||0,o=window.innerHeight||0,n=Math.max(4,Math.min(e.x,a-lt-6)),i=Math.max(4,Math.min(e.y,o-ct-6));return Be.createPortal((0,he.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:n,top:i,zIndex:2147483002},onMouseDown:m=>m.stopPropagation(),children:e.items.map(m=>(0,he.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:m.disabled,onClick:()=>{t(),m.onClick?.()},children:m.label},m.label))}),document.body)}function Ue(e,t){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:t}}var Fe="dsh-my-memory-style",ut=`
/* ---------- \u6839\u5BB9\u5668 ---------- */

/* height:100% + position:relative \u662F\u786C\u6027\u8981\u6C42\u3002
   **\u4E0D\u8981** position:absolute \u2014\u2014 \u5916\u58F3\u7ED9\u7684\u5BB9\u5668\u672C\u8EAB\u4E0D\u662F\u5B9A\u4F4D\u5143\u7D20\u65F6\uFF0Cabsolute \u4F1A\u4E00\u8DEF\u627E\u5230\u89C6\u53E3\uFF0C
   \u628A\u6574\u4E2A\u7A97\u53E3\u90FD\u76D6\u4F4F\u3002position:relative \u53EA\u4E3A\u8BA9\u5185\u90E8\u7EDD\u5BF9\u5B9A\u4F4D\u951A\u5728\u8FD9\u91CC\u3002 */
.dsh-mymem-root {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-size: 13px;
}

/* ---------- \u9762\u677F\uFF1A\u5DE6\u53F3\u5206\u680F\uFF08\u7167\u6284\u539F\u63D2\u4EF6 .dsh-memory-split\uFF09 ---------- */

.dsh-mymem-panel {
  background: var(--dsw-alias-bg-base, #16181d);
  /* \u9762\u677F\u81EA\u5DF1\u4E0D\u7559\u5185\u8FB9\u8DDD\uFF1A\u9876\u5C42 tab \u884C\u8981\u8D34\u7740\u9762\u677F\u8FB9\u7F18\u753B\u6EE1\u8D2F\u901A\u7684\u5E95\u7EBF */
  padding: 0;
}
.dsh-mymem-split {
  display: grid;
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
  height: 100%;
}
@media (max-width: 640px) {
  .dsh-mymem-split { grid-template-columns: 1fr; }
}

/* ---------- \u4E24\u5C42 tab ---------- */

/* ---------- \u6807\u9898\u533A\uFF08\u7167\u539F\u63D2\u4EF6 .dsh-memory-head\uFF09 ---------- */

.dsh-mymem-panel .dsh-mymem-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 0;
  flex: 0 0 auto;
}
.dsh-mymem-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-sub {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- \u4E24\u5C42 tab ---------- */

/* \u9876\u5C42\uFF1A\u7167\u539F\u63D2\u4EF6 .dsh-memory-tabs / .dsh-memory-tab\uFF0813px + 2px \u54C1\u724C\u8272\u77ED\u4E0B\u5212\u7EBF\uFF09 */
.dsh-mymem-toptabs {
  display: flex;
  gap: 4px;
  padding: 10px 16px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  flex: 0 0 auto;
}
.dsh-mymem-toptab {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font: inherit;
  font-size: 13px;
  padding: 7px 12px 9px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
}
.dsh-mymem-toptab:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-toptab[data-active="1"] {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-toptab[data-active="1"]::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--dsw-alias-brand-primary, #4f7dff);
}

/* \u5DE5\u5177\u884C\uFF1A\u5DE6\u300C\uFF0B \u65B0\u5EFA\u300D\u3001\u53F3\u5185\u9875\u5206\u6BB5\u3002
   \u7528\u548C\u5206\u680F\u540C\u4E00\u5957\u6805\u683C\uFF08260 + gap 14\uFF09\uFF0C\u5206\u6BB5\u63A7\u4EF6\u624D\u4F1A**\u6B63\u597D\u843D\u5728\u53F3\u680F\u7684\u5DE6\u8FB9\u7EBF**\u4E0A
   \u2014\u2014 \u539F\u63D2\u4EF6\u5C31\u662F\u8FD9\u4E2A\u4F4D\u7F6E\uFF08\u5206\u6BB5\u5728\u53F3\u680F\u5F00\u5934\uFF09\uFF0C\u4E0D\u662F\u8D34\u9762\u677F\u53F3\u8FB9\u7F18\u3002 */
.dsh-mymem-toolbar {
  display: grid;
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  flex: 0 0 auto;
  margin-bottom: 8px;
}
.dsh-mymem-toolbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dsh-mymem-toolbar-right { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dsh-mymem-tabs-spacer { flex: 1 1 auto; }
/* \u5F39\u6027\u5360\u4F4D\uFF1A\u628A\u53F3\u8FB9\u7684\u4E1C\u897F\uFF08\u5237\u65B0\u6309\u94AE / \u5F00\u5173\uFF09\u63A8\u5230\u884C\u5C3E\u3002
   \u6CE8\u610F\u5B83\u548C .dsh-mymem-tabs-spacer \u662F\u4E24\u4E2A\u7C7B\uFF0C\u90FD\u522B\u5220 \u2014\u2014 \u65E9\u524D\u6574\u7406\u6837\u5F0F\u65F6\u8BEF\u5220\u8FC7\u4E00\u6B21\uFF0C
   \u7ED3\u679C\u300C\u5237\u65B0\u300D\u548C\u5F00\u5173\u90FD\u6324\u5230\u4E86\u6587\u4EF6\u540D/\u89D2\u8272\u540D\u65C1\u8FB9\u3002 */
.dsh-mymem-spacer { flex: 1 1 auto; }

/* \u5185\u9875\uFF1A\u4E00\u4E2A\u5706\u89D2\u5BB9\u5668\u88C5\u7740\u82E5\u5E72\u6BB5\uFF08\u7167\u539F\u63D2\u4EF6 .dsh-segmented\uFF09 */
.dsh-mymem-inner-tabs {
  display: inline-flex;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 8px;
  overflow: hidden;
  flex: 0 0 auto;
}
.dsh-mymem-inner-tab {
  appearance: none;
  font: inherit;
  font-size: 12px;
  padding: 4px 12px;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  cursor: pointer;
}
.dsh-mymem-inner-tab:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-inner-tab[data-active="1"] {
  background: var(--dsw-alias-bg-layer-2, #24272f);
  color: var(--dsw-alias-label-primary, #e8ecf7);
}

/* \u89D2\u8272\u5361\u9875\u7684\u5185\u5BB9\u5BB9\u5668\uFF08\u5185\u8FB9\u8DDD\u7167\u539F\u63D2\u4EF6 .dsh-memory-body\uFF09 */
.dsh-mymem-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 24px;
}
.dsh-mymem-body .dsh-mymem-split { flex: 1 1 auto; height: auto; }

/* \u5DE6\u5217\uFF1A\u56FA\u5B9A 260\uFF0C\u4E0D\u8DDF\u7740\u9762\u677F\u4E00\u8D77\u53D8\u5BBD */
.dsh-mymem-side {
  min-height: 0;
  overflow: auto;
  width: 100%;
  max-width: 260px;
}
.dsh-mymem-cards { display: flex; flex-direction: column; gap: 8px; }

/* \u4E00\u5F20\u5361\uFF1A\u5706\u5934\u50CF + \u540D\u5B57 + \u300C\u9ED8\u8BA4\u300Dchip\uFF0C\u9009\u4E2D\u6001\u662F\u54C1\u724C\u8272\u63CF\u8FB9\uFF08\u539F\u63D2\u4EF6\u540C\u6B3E\uFF09 */
.dsh-mymem-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-row:hover { background: var(--dsw-alias-bg-layer-2, #24272f); }
.dsh-mymem-row[data-active="1"] {
  border-color: var(--dsw-alias-brand-primary, #4f7dff);
  background: var(--dsw-alias-bg-layer-2, #24272f);
}
.dsh-mymem-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex: 0 0 auto;
  background: var(--dsw-alias-bg-layer-2, #24272f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
}
.dsh-mymem-rowmain { min-width: 0; }
.dsh-mymem-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* \u5361\u7247\u7B2C\u4E8C\u884C\uFF1A\u8FD9\u5F20\u5361\u7684 agent.md \u8DEF\u5F84\u3002\u5B83\u56DE\u7B54\u300C\u6211\u73B0\u5728\u6539\u7684\u662F\u54EA\u4E2A\u6587\u4EF6\u300D\uFF0C\u6BD4\u4EFB\u4F55\u8BF4\u660E\u90FD\u76F4\u63A5 */
.dsh-mymem-path {
  margin-top: 2px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-mymem-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.3));
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  white-space: nowrap;
  vertical-align: 1px;
}

/* \u53F3\u533A\uFF1A\u7EB5\u5411\u6392\u5E03\uFF0C\u81EA\u5DF1\u6EDA\uFF08\u9762\u677F\u91CC\u5185\u5BB9\u53EF\u80FD\u6BD4\u89C6\u53E3\u957F\uFF09 */
.dsh-mymem-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

/* \u5173\u95ED\u6309\u94AE\uFF1A\u539F\u63D2\u4EF6\u9762\u677F\u6CA1\u6709\uFF08\u5B83\u7684\u5173\u95ED\u5728\u5916\u58F3\u5C42\uFF09\uFF0C\u4F46\u6211\u4EEC\u8981\u80FD\u9000\u56DE\u4F1A\u8BDD */
.dsh-mymem-close {
  flex: 0 0 auto;
  /* 20px \u9AD8\uFF1A\u4E0D\u628A .dsh-mymem-head \u6491\u9AD8\uFF08\u539F\u63D2\u4EF6\u6CA1\u6709\u8FD9\u4E2A\u6309\u94AE\uFF0Chead \u662F 31px\uFF09 */
  width: 22px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #6d7686);
  background: transparent;
  cursor: pointer;
}
.dsh-mymem-close:hover {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}

/* ---------- \u901A\u7528\u8868\u5355\u4EF6\uFF08\u7167\u6284\u539F\u63D2\u4EF6 .dsh-memory-input / -textarea\uFF09 ---------- */

.dsh-mymem-input,
.dsh-mymem-textarea {
  font: inherit;
  font-size: 12.5px;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-2, #24272f);
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 8px;
  padding: 6px 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.dsh-mymem-input:focus,
.dsh-mymem-textarea:focus { border-color: var(--dsw-alias-brand-primary, #4f7dff); }
.dsh-mymem-textarea {
  resize: vertical;
  line-height: 1.65;
  font-family: inherit;
}
.dsh-mymem-input::placeholder,
.dsh-mymem-textarea::placeholder { color: var(--dsw-alias-label-tertiary, #6d7686); }

/* \u4E00\u884C\u300C\u6807\u7B7E + \u63A7\u4EF6\u300D\u6CA1\u6709\u5171\u7528 CSS\uFF1A\u539F\u63D2\u4EF6\u7528 SETTING_* \u5185\u8054\u5E38\u91CF\uFF0C\u8FD9\u91CC\u540C\u6837\u5185\u8054\uFF08Panel \u91CC\u90A3\u4EFD\u5E38\u91CF\uFF09 */

/* \u6B63\u6587\u6574\u884C\uFF1A\u6807\u7B7E\u5728\u4E0A\u3001\u63A7\u4EF6\u5728\u4E0B\uFF08\u539F\u63D2\u4EF6 .dsh-persona-field / -label\uFF09 */
.dsh-mymem-field { display: flex; flex-direction: column; gap: 5px; }
.dsh-mymem-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #e8ecf7);
}

.dsh-mymem-hint {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  line-height: 1.7;
}
.dsh-mymem-error {
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  word-break: break-word;
}
.dsh-mymem-ok {
  font-size: 11.5px;
  color: var(--dsw-alias-state-done-primary, #48b884);
}

/* ---------- \u901A\u7528\u6309\u94AE\uFF08bg-layer-2 + \u63CF\u8FB9\uFF0C\u7EDD\u4E0D\u7528\u5B9E\u5FC3\u54C1\u724C\u586B\u5145\uFF09 ---------- */

.dsh-mymem-btn {
  appearance: none;
  font: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-2, #24272f);
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}
.dsh-mymem-btn:hover:not(:disabled) { border-color: var(--dsw-alias-border-l2, rgba(150,170,210,0.32)); }
.dsh-mymem-btn:disabled { opacity: .5; cursor: default; }
.dsh-mymem-btn--ghost { background: transparent; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-btn--ghost:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}
.dsh-mymem-btn--danger {
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  border-color: currentColor;
}
.dsh-mymem-btn--danger:hover:not(:disabled) { border-color: currentColor; }

/* ---------- \u5168\u5C40\u8BBE\u7F6E\u9875 ---------- */

.dsh-mymem-settings {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.dsh-mymem-settings-title { font-size: 13px; font-weight: 600; }
/* \u5F53\u524D\u6570\u636E\u76EE\u5F55\uFF1A\u7B49\u5BBD + \u53EF\u9009\u4E2D\u590D\u5236\uFF08\u8FD9\u884C\u662F\u7ED9\u4EBA\u590D\u5236\u53BB\u8D44\u6E90\u7BA1\u7406\u5668\u7528\u7684\uFF0C\u4E0D\u662F\u8F93\u5165\u6846\uFF09 */
.dsh-mymem-settings-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  color: var(--dsw-alias-label-primary, #e8ecf7);
  word-break: break-all;
  user-select: text;
}
.dsh-mymem-settings-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }


/* ---------- \u53F3\u952E\u83DC\u5355\uFF08portal + fixed\uFF0C\u4E0D\u80FD\u88AB\u9762\u677F\u5BB9\u5668\u88C1\u6389\uFF09 ---------- */

.dsh-mymem-ctxmenu {
  min-width: 160px;
  padding: 5px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-3, #23262e);
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dsh-mymem-ctxitem {
  appearance: none;
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  padding: 6px 10px;
  border-radius: 7px;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  cursor: pointer;
  white-space: nowrap;
}
.dsh-mymem-ctxitem:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2, #2b2f38); }
.dsh-mymem-ctxitem:disabled {
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  cursor: not-allowed;
  background: transparent;
}

/* ---------- \u5C0F\u5F39\u7A97\uFF08\u65B0\u5EFA / \u91CD\u547D\u540D / \u5220\u9664\u786E\u8BA4\uFF09 ---------- */

.dsh-mymem-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
}
.dsh-mymem-modal {
  width: 360px;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3, #23262e);
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-modal-title { font-size: 13.5px; font-weight: 600; }
.dsh-mymem-modal-label { font-size: 11.5px; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-modal-message { font-size: 12.5px; line-height: 1.7; color: var(--dsw-alias-label-secondary, #9aa3b2); }
/* \u5F39\u7A97\u5185\u6821\u9A8C/\u63A5\u53E3\u9519\u8BEF\uFF1A\u4E00\u884C\u7EA2\u5B57\uFF0C\u4E0D\u5F39 alert\uFF0C\u4E5F\u4E0D\u628A\u5F39\u7A97\u5173\u6389 */
.dsh-mymem-modal-error {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  word-break: break-word;
}
.dsh-mymem-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}

/* ---------- \u5168\u5C40\u8BB0\u5FC6\u9875\uFF1AMEMORY.md \u539F\u6587\u9605\u8BFB\u533A ---------- */

/* \u8FD9\u4E00\u9875\u4E0D\u5361\u7247\u5316\u3001\u4E0D\u5206\u6BB5\u3001\u4E0D\u5217\u8868\uFF1A\u5C31\u662F\u628A\u6587\u4EF6\u539F\u6587\u94FA\u51FA\u6765\uFF0C\u5360\u6EE1\u5185\u5BB9\u533A\u9AD8\u5EA6\u81EA\u5DF1\u6EDA */
.dsh-mymem-raw {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dsh-mymem-raw-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dsh-mymem-raw-pre {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

/* \u7F16\u8F91\u6001\uFF1A\u540C\u4E00\u4E2A\u4F4D\u7F6E\u6362\u6210\u5927 textarea\uFF08\u7B49\u5BBD\u3001\u5360\u6EE1\u3001\u53EF\u7AD6\u5411\u62C9\u4F38\uFF09 */
.dsh-mymem-raw-edit {
  flex: 1 1 auto;
  min-height: 220px;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  outline: none;
  resize: vertical;
}
.dsh-mymem-raw-edit:focus { border-color: var(--dsw-alias-brand-primary, #4f7dff); }
/* \u957F\u671F\u8BB0\u5FC6\u9875\uFF1A\u5E95\u90E8\u72B6\u6001\u5C0F\u5B57\uFF08\u65E0\u4FDD\u5B58\u6309\u94AE\uFF0C\u6539\u52A8\u81EA\u52A8\u4FDD\u5B58\uFF09 */
.dsh-mymem-raw-status {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #8d95a5);
}
.dsh-mymem-raw-grow { flex: 1 1 auto; }

/* \u78C1\u76D8\u53D8\u4E86\u4F46\u672C\u5730\u6709\u6539\u52A8\uFF1A\u53EA\u63D0\u793A\uFF0C\u4E0D\u52A8\u7528\u6237\u8F93\u5165 */
.dsh-mymem-remotebar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-state-warning-primary, #d9a441);
  background: rgba(217, 164, 65, 0.12);
  color: var(--dsw-alias-state-warning-primary, #d9a441);
  font-size: 11.5px;
}

/* \u51B2\u7A81 / \u5BF9\u6BD4\u9762\u677F\uFF1A\u884C\u7EA7 diff\uFF08\u65B0\u589E\u7EFF\u5E95\u3001\u5220\u9664\u7EA2\u5E95\uFF09 */
.dsh-mymem-diff {
  flex: 0 0 auto;
  max-height: 44%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  overflow: hidden;
}
.dsh-mymem-diff-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}
.dsh-mymem-diff-title { font-size: 12.5px; font-weight: 600; }
.dsh-mymem-diff-count { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8d95a5); }
.dsh-mymem-diff-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 6px 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}
.dsh-mymem-diffline { display: flex; gap: 6px; padding: 0 10px; white-space: pre-wrap; word-break: break-word; }
.dsh-mymem-diffline[data-kind="add"] { background: rgba(72, 184, 132, 0.16); }
.dsh-mymem-diffline[data-kind="del"] { background: rgba(224, 107, 107, 0.16); }
.dsh-mymem-diffmark { flex: 0 0 10px; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-diffline[data-kind="add"] .dsh-mymem-diffmark { color: var(--dsw-alias-state-done-primary, #48b884); }
.dsh-mymem-diffline[data-kind="del"] .dsh-mymem-diffmark { color: var(--dsw-alias-state-error-primary, #e06b6b); }
.dsh-mymem-difftext { flex: 1 1 auto; min-width: 0; }
.dsh-mymem-diff-actions {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}

.dsh-mymem-raw-actions {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ---------- \u4F1A\u8BDD\u6807\u7B7E\u680F\u300C\u8BB0\u5FC6\u300D\u9875\uFF08conversation.view\uFF0C\u4FDD\u6301\u539F\u6837\uFF09 ---------- */

.dsh-mymem-pane {
  flex: 1 1 auto;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 14px;
  background: var(--dsw-alias-bg-base, transparent);
}
.dsh-mymem-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 0 0 auto; }
.dsh-mymem-scope-name { font-size: 12.5px; font-weight: 600; }
.dsh-mymem-datadir {
  min-width: 0;
  max-width: 44ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #6d7686);
}
.dsh-mymem-seg {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-seg-btn {
  height: 24px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  background: transparent;
  cursor: pointer;
}
.dsh-mymem-seg-btn:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-seg-btn--on {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-weight: 600;
  background: var(--dsw-alias-bg-layer-2, rgba(150,170,210,.16));
}
.dsh-mymem-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
}
.dsh-mymem-item:last-child { border-bottom: 0; }
.dsh-mymem-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.1)); }
.dsh-mymem-item-main { flex: 1 1 auto; min-width: 0; }
.dsh-mymem-item-summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
}
.dsh-mymem-item-date { margin-top: 2px; font-size: 10.5px; color: var(--dsw-alias-label-tertiary, #6d7686); }
.dsh-mymem-del {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #6d7686);
  background: transparent;
  cursor: pointer;
  opacity: .55;
  transition: opacity .12s ease, background .12s ease, color .12s ease;
}
.dsh-mymem-item:hover .dsh-mymem-del,
.dsh-mymem-del:focus-visible { opacity: 1; }
.dsh-mymem-del:hover {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-state-error-primary, #e06b6b);
}
.dsh-mymem-empty {
  padding: 28px 10px;
  text-align: center;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font-size: 12.5px;
  line-height: 1.8;
}
.dsh-mymem-compose { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
.dsh-mymem-compose .dsh-mymem-input { flex: 1 1 auto; }
/* ---------- \u65B0\u5EFA\u4F1A\u8BDD\u9875\uFF1A\u89D2\u8272\u9009\u62E9\uFF08\u80F6\u56CA\u6309\u94AE + \u6D6E\u5C42\u83DC\u5355\uFF09 ---------- */

.dsh-mymem-herobtn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease;
}
.dsh-mymem-herobtn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-herobtn-icon,
.dsh-mymem-herobtn-chev { display: inline-flex; align-items: center; color: inherit; }
.dsh-mymem-herobtn-chev { opacity: .7; }
.dsh-mymem-herobtn-label { white-space: nowrap; }

.dsh-mymem-heromenu {
  z-index: 2147483002;
  box-sizing: border-box;
  max-height: 340px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-overlay, #2b2f38));
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}
.dsh-mymem-heromenu-list { min-height: 0; overflow: auto; display: flex; flex-direction: column; }
.dsh-mymem-heroitem {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-mymem-heroitem:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12)); }
.dsh-mymem-heroitem:disabled { cursor: default; }
.dsh-mymem-heroitem[data-active="1"] .dsh-mymem-heroitem-name { font-weight: 700; }
.dsh-mymem-heroitem-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dsh-mymem-heroitem-name { font-size: 13px; font-weight: 600; }
.dsh-mymem-heroitem-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dsh-mymem-heroitem-check {
  flex: 0 0 auto;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-heromenu-hint {
  padding: 8px 12px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary, #8d95a5);
}
.dsh-mymem-heromenu-err {
  margin: 2px 2px 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  background: rgba(224, 107, 107, 0.12);
}

/* ---------- \u4F1A\u8BDD\u300C\u8BB0\u5FC6\u300D\u9875\uFF1A\u5C40\u90E8\u8BB0\u5FC6\u5F00\u5173 + \u53EA\u8BFB\u539F\u6587 ---------- */

.dsh-mymem-switch { display: inline-flex; align-items: center; gap: 8px; }
.dsh-mymem-switch-label { font-size: 12px; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-switch-track {
  position: relative;
  width: 34px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2, #24272f);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  cursor: pointer;
  transition: background .15s ease;
}
.dsh-mymem-switch-track[data-on="1"] {
  background: var(--dsw-alias-brand-primary, #4f7dff);
  box-shadow: none;
}
.dsh-mymem-switch-track:disabled { opacity: .5; cursor: default; }
.dsh-mymem-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform .15s ease;
}
.dsh-mymem-switch-track[data-on="1"] .dsh-mymem-switch-thumb { transform: translateX(16px); }

.dsh-mymem-local {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.dsh-mymem-localpre { flex: 1 1 auto; min-height: 0; }
/* \u5173\u6389\u5F00\u5173\uFF1A\u5185\u5BB9\u8FD8\u5728\uFF0C\u53EA\u662F\u53D8\u7070\u770B\u4E0D\u6E05 */
.dsh-mymem-local[data-off="1"] .dsh-mymem-localpre { opacity: .28; }
.dsh-mymem-localmask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(22, 24, 29, 0.35);
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font-size: 12.5px;
  pointer-events: none;
}

`;function q(){if(typeof document>"u"||document.getElementById(Fe))return;let e=document.createElement("style");e.id=Fe,e.textContent=ut,document.head.appendChild(e)}var c=require("react/jsx-runtime"),pt=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],ht=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],Je=/^[A-Za-z0-9._-]{1,40}$/;function Ge({close:e,pick:t}={}){let[a,o]=T.useState("persona"),[n,i]=T.useState("role"),[m,u]=T.useState(null),[f,p]=T.useState(null),[b,h]=T.useState(""),[N,C]=T.useState(""),[P,E]=T.useState(null),[x,y]=T.useState(null),[r,d]=T.useState(null),[v,l]=T.useState(0),D=T.useRef(null);T.useEffect(()=>(q(),()=>{D.current&&clearTimeout(D.current)}),[]);let _=T.useCallback(s=>{C(s),D.current&&clearTimeout(D.current),D.current=setTimeout(()=>{D.current=null,C("")},1600)},[]),w=T.useCallback(async()=>{let s=await Z();return u(s),p(S=>S&&s.items.some($=>$.id===S)?S:s.activeId??s.items[0]?.id??null),s},[]);T.useEffect(()=>{let s=!0;return(async()=>{try{let S=await Z();if(!s)return;u(S),p(S.activeId??S.items[0]?.id??null),Se({scope:"global"}).then($=>{s&&y($.items.length)}).catch(()=>{})}catch(S){s&&h(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${S?.message||S}`)}})(),()=>{s=!1}},[]);async function U(s){h("");try{await s(),await w()}catch(S){h(String(S?.message||S))}}let oe=T.useCallback(()=>E(null),[]);function ie(){d({kind:"create",onCancel:()=>d(null),onSubmit:async s=>{h("");try{let S=await be({dir:s});d(null),await w(),S?.id&&p(S.id),i("role")}catch(S){let $=String(S?.message||S);throw h(`\u65B0\u5EFA\u5931\u8D25\uFF1A${$}`),new Error($)}}})}function me(s){d({kind:"rename",persona:s,onCancel:()=>d(null),onSubmit:async S=>{await ne(s.id,{name:S}),d(null),await w()}})}function te(s){d({kind:"delete",persona:s,onCancel:()=>d(null),onOk:async()=>{d(null),await U(()=>ge(s.id))}})}function ae(s){d({kind:"renameDir",persona:s,onCancel:()=>d(null),onSubmit:async S=>{h("");try{let $=await we(s.id,S);d(null),await w(),$?.id&&p($.id),_("\u76EE\u5F55\u5DF2\u66F4\u65B0")}catch($){throw h(`\u66F4\u65B0\u76EE\u5F55\u5931\u8D25\uFF1A${String($?.message||$)}`),new Error(String($?.message||$))}}})}function k(s){return[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:!!m&&m.activeId===s.id,onClick:()=>U(()=>xe(s.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>U(async()=>{await ve(s.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>ae(s)},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>te(s)}]}async function M(){h("");try{await w(),l(s=>s+1)}catch(s){h(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${s?.message||s}`)}}let F=m?.items.find(s=>s.id===f)||null,de=m?.items.find(s=>s.id===m.activeId)||F,Ye=[x===null?"":`${x} \u6761\u957F\u671F\u8BB0\u5FC6`,de?`\u5F53\u524D\u89D2\u8272 ${de.name||de.id}`:""].filter(Boolean).join(" \xB7 ");return(0,c.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,c.jsxs)("div",{className:"dsh-mymem-head",children:[(0,c.jsx)("div",{className:"dsh-mymem-title",children:"\u8BB0\u5FC6"}),(0,c.jsx)("div",{className:"dsh-mymem-sub",children:Ye}),(0,c.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,c.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),(0,c.jsx)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:pt.map(s=>(0,c.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":a===s.key,"data-active":a===s.key?"1":"0",onClick:()=>o(s.key),children:s.label},s.key))}),a==="settings"?(0,c.jsx)(Oe,{onChanged:M,pick:t}):(0,c.jsx)(c.Fragment,{children:(0,c.jsxs)("div",{className:"dsh-mymem-body",children:[(0,c.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,c.jsxs)("div",{className:"dsh-mymem-toolbar-left",children:[(0,c.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:ie,children:"\uFF0B \u65B0\u5EFA"}),N?(0,c.jsx)("span",{className:"dsh-mymem-ok",children:N}):null]}),(0,c.jsx)("div",{className:"dsh-mymem-toolbar-right",children:(0,c.jsx)("div",{className:"dsh-mymem-inner-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:ht.map(s=>(0,c.jsx)("button",{className:"dsh-mymem-inner-tab",type:"button",role:"tab","aria-selected":n===s.key,"data-active":n===s.key?"1":"0",onClick:()=>i(s.key),children:s.label},s.key))})})]}),b?(0,c.jsx)("div",{className:"dsh-mymem-error",children:b}):null,(0,c.jsxs)("div",{className:"dsh-mymem-split",children:[(0,c.jsx)("div",{className:"dsh-mymem-side",children:(0,c.jsx)("div",{className:"dsh-mymem-cards",children:m?m.items.map(s=>(0,c.jsxs)("div",{className:"dsh-mymem-row","data-active":s.id===f?"1":"0",onClick:()=>p(s.id),onContextMenu:S=>E(Ue(S,k(s))),children:[(0,c.jsx)("span",{className:"dsh-mymem-avatar",children:(s.name||s.id).slice(0,1)}),(0,c.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,c.jsxs)("div",{className:"dsh-mymem-name",title:s.name||s.id,children:[s.name||s.id,m.activeId===s.id?(0,c.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,c.jsx)("div",{className:"dsh-mymem-path",title:s.path||s.display,children:s.display})]})]},s.id)):(0,c.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,c.jsx)("div",{className:"dsh-mymem-main",children:n==="memory"?(0,c.jsx)($e,{},`raw:${v}`):F?(0,c.jsx)(ke,{persona:F,onSaved:s=>u(S=>S&&{...S,items:S.items.map($=>$.id===s.id?{...$,...s}:$)})},`${F.id}:${v}`):(0,c.jsx)("div",{className:"dsh-mymem-hint",children:m?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})}),(0,c.jsx)(_e,{menu:P,onClose:oe}),r?.kind==="create"?(0,c.jsx)(Y,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:s=>Je.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:r.onSubmit,onCancel:r.onCancel}):null,r?.kind==="renameDir"?(0,c.jsx)(Y,{title:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",description:"\u6539\u7684\u662F\u78C1\u76D8\u4E0A\u7684\u89D2\u8272\u6587\u4EF6\u5939\u540D\uFF0C\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\u3002",label:"\u89D2\u8272\u76EE\u5F55",defaultValue:r.persona.id||"",placeholder:"\u4F8B\u5982 baby",confirmText:"\u66F4\u65B0",validate:s=>Je.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:r.onSubmit,onCancel:r.onCancel}):null,r?.kind==="rename"?(0,c.jsx)(Y,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:r.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:r.onSubmit,onCancel:r.onCancel}):null,r?.kind==="delete"?(0,c.jsx)(Le,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${r.persona.name||r.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:r.onOk,onCancel:r.onCancel}):null]})}var Zt=require("react"),V=require("react/jsx-runtime");function yt({size:e=16}){return(0,V.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,V.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,V.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,V.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function He({size:e=16}){return(0,V.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,V.jsx)(yt,{size:e})})}var A=W(require("react"),1);var L=require("react/jsx-runtime");function ft(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function bt(e){return e?.session?.cwd||e?.cwd||e?.session?.workingDirectory||null}function We(e){let t=ft(e),a=bt(e),[o,n]=A.useState(null),[i,m]=A.useState(null),[u,f]=A.useState(null),[p,b]=A.useState(!0),[h,N]=A.useState(!1),[C,P]=A.useState(""),E=A.useRef(0);A.useEffect(()=>{q()},[]);let x=A.useCallback(async()=>{let l=++E.current;b(!0);try{let D=await Ee(a);if(l!==E.current)return;m(D);try{let _=await Me(a);l===E.current&&f(_)}catch{l===E.current&&f({path:"",text:""})}P("")}catch(D){l===E.current&&P(`\u8BFB\u53D6\u5931\u8D25\uFF1A${D?.message||D}`)}finally{l===E.current&&b(!1)}},[a]);A.useEffect(()=>{x()},[x]),A.useEffect(()=>{let l=!0;if(t)return(async()=>{try{let D=await Q(t);l&&n(D)}catch{}})(),()=>{l=!1}},[t]);let y=!!i?.enabled;async function r(){if(!(h||!i)){N(!0),P("");try{await De(a,!y),await x()}catch(l){P(`\u5207\u6362\u5931\u8D25\uFF1A${l?.message||l}`)}finally{N(!1)}}}let d=String(u?.text??""),v=d.trim().length>0;return(0,L.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"session-memory",children:[(0,L.jsxs)("div",{className:"dsh-mymem-head",children:[(0,L.jsx)("span",{className:"dsh-mymem-scope-name",children:o?.name||"\u672A\u7ED1\u5B9A\u89D2\u8272"}),(0,L.jsx)("span",{className:"dsh-mymem-spacer"}),(0,L.jsxs)("span",{className:"dsh-mymem-switch",children:[(0,L.jsx)("span",{className:"dsh-mymem-switch-label",children:"\u5C40\u90E8\u8BB0\u5FC6"}),(0,L.jsx)("button",{type:"button",role:"switch","aria-checked":y,"aria-label":"\u5C40\u90E8\u8BB0\u5FC6",className:"dsh-mymem-switch-track","data-on":y?"1":"0",disabled:h||p||!i,onClick:()=>void r(),children:(0,L.jsx)("span",{className:"dsh-mymem-switch-thumb"})})]})]}),C?(0,L.jsx)("div",{className:"dsh-mymem-error",children:C}):null,(0,L.jsxs)("div",{className:"dsh-mymem-local","data-off":y?"0":"1",children:[v?(0,L.jsx)("pre",{className:"dsh-mymem-raw-pre dsh-mymem-localpre",children:d}):(0,L.jsx)("div",{className:"dsh-mymem-empty",children:p?"\u8BFB\u53D6\u4E2D\u2026":y?"\u8FD8\u6CA1\u6709\u5C40\u90E8\u8BB0\u5FC6":"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}),!y&&v?(0,L.jsx)("div",{className:"dsh-mymem-localmask",children:"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}):null]}),(0,L.jsx)("div",{className:"dsh-mymem-hint",children:"\u5173\u95ED\u53EA\u662F\u4E0D\u518D\u8BB0\u5F55\uFF0C\u5DF2\u6709\u5185\u5BB9\u4E0D\u4F1A\u5220\u9664\u3002"})]})}var B=W(require("react"),1),qe=W(require("react-dom"),1);var R=require("react/jsx-runtime");function gt(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function Ke(e){let t=String(e??"").trim();if(!t)return"";let a=t.split(`
`).map(o=>o.trim()).find(Boolean)||"";return a.replace(/^[「【\[]?[^」】\]]{0,6}[」】\]]?\s*/,"").trim()||a}function xt({size:e=14}){return(0,R.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:[(0,R.jsx)("circle",{cx:"12",cy:"8.2",r:"3.4",stroke:"currentColor",strokeWidth:"1.7"}),(0,R.jsx)("path",{d:"M5.2 19.2c.9-3.3 3.6-5.2 6.8-5.2s5.9 1.9 6.8 5.2",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"})]})}function vt({size:e=12}){return(0,R.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,R.jsx)("path",{d:"M6 9.5 12 15l6-5.5",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})}function wt({sessionId:e}){let[t,a]=B.useState(null),[o,n]=B.useState(null),[i,m]=B.useState(!1),[u,f]=B.useState(null),[p,b]=B.useState(""),[h,N]=B.useState(!1),C=B.useRef(null);B.useEffect(()=>{q()},[]),B.useEffect(()=>{let r=!0;return(async()=>{try{let d=await Z();r&&a(d.items||[])}catch{r&&a([])}try{let d=await Q(e);r&&n(d)}catch{}})(),()=>{r=!1}},[e]);let P=B.useCallback(()=>{let r=C.current;if(!r)return;let d=r.getBoundingClientRect(),v=380,l=window.innerWidth||0,D=window.innerHeight||0,_=Math.max(8,Math.min(d.left,l-v-8)),w=d.bottom+6,U=w+320>D?Math.max(8,d.top-6-320):w;f({left:_,top:U,width:v})},[]);B.useEffect(()=>{if(!i)return;P();let r=l=>{C.current?.contains(l.target)||l.target?.closest?.(".dsh-mymem-heromenu")||m(!1)},d=l=>{l.key==="Escape"&&m(!1)},v=()=>P();return document.addEventListener("mousedown",r),document.addEventListener("keydown",d),window.addEventListener("resize",v),window.addEventListener("scroll",v,!0),()=>{document.removeEventListener("mousedown",r),document.removeEventListener("keydown",d),window.removeEventListener("resize",v),window.removeEventListener("scroll",v,!0)}},[i,P]);let E=!!o?.locked||!!p,x=o?.name||"\u9009\u62E9\u89D2\u8272";async function y(r){if(!(E||h)){if(r.id===o?.personaId){m(!1);return}N(!0),b("");try{let d=await Pe(e,r.id);n({sessionId:e,personaId:String(d?.personaId??r.id),name:String(d?.name??r.name??""),locked:d?.locked===void 0?!0:!!d.locked}),m(!1)}catch(d){if(d?.status===409){b("\u4F1A\u8BDD\u5DF2\u7ECF\u5EFA\u7ACB\uFF0C\u89D2\u8272\u4E0D\u80FD\u5207\u6362");try{let v=await Q(e);n(v)}catch{}}else b(`\u7ED1\u5B9A\u5931\u8D25\uFF1A${d?.message||d}`)}finally{N(!1)}}}return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)("button",{ref:C,type:"button",className:"dsh-mymem-herobtn","aria-haspopup":"listbox","aria-expanded":i,onClick:()=>m(r=>!r),children:[(0,R.jsx)("span",{className:"dsh-mymem-herobtn-icon",children:(0,R.jsx)(xt,{})}),(0,R.jsx)("span",{className:"dsh-mymem-herobtn-label",children:x}),(0,R.jsx)("span",{className:"dsh-mymem-herobtn-chev",children:(0,R.jsx)(vt,{})})]}),i&&u&&typeof document<"u"?qe.createPortal((0,R.jsxs)("div",{className:"dsh-mymem-heromenu",style:{position:"fixed",left:u.left,top:u.top,width:u.width},children:[p?(0,R.jsx)("div",{className:"dsh-mymem-heromenu-err",children:p}):null,(0,R.jsxs)("div",{className:"dsh-mymem-heromenu-list",role:"listbox",children:[(t||[]).map(r=>{let d=r.id===o?.personaId;return(0,R.jsxs)("button",{type:"button",role:"option","aria-selected":d,className:"dsh-mymem-heroitem","data-active":d?"1":"0",disabled:E||h,onClick:()=>void y(r),children:[(0,R.jsxs)("span",{className:"dsh-mymem-heroitem-main",children:[(0,R.jsx)("span",{className:"dsh-mymem-heroitem-name",children:r.name||r.id}),Ke(r.body)?(0,R.jsx)("span",{className:"dsh-mymem-heroitem-desc",children:Ke(r.body)}):null]}),d?(0,R.jsx)("span",{className:"dsh-mymem-heroitem-check",children:"\u2713"}):null]},r.id)}),t&&t.length===0?(0,R.jsx)("div",{className:"dsh-mymem-heromenu-hint",children:"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361"}):null]}),E?(0,R.jsx)("div",{className:"dsh-mymem-heromenu-hint",children:"\u4F1A\u8BDD\u5EFA\u7ACB\u540E\u89D2\u8272\u4E0D\u53EF\u66F4\u6539"}):null]}),document.body):null]})}function Ve(e){let t=gt(e);return t?(0,R.jsx)(wt,{sessionId:String(t)}):null}var kt="my-memory",St=["slots","layout"],ee="[my-memory]",ye="my-memory";function Rt(e){let t=globalThis.__DSH_DIRECTORY_PICKER__;return{pick:typeof t?.pick=="function"?()=>t.pick():null,close(){try{e.layout.selectPanel(null)}catch(o){console.warn(ee,"selectPanel(null) \u5931\u8D25",o)}}}}function Xe(e,t,a,o,n,i){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:o,label:n},i)),`my-memory.${t}`),console.info(ee,`\u5DF2\u6CE8\u518C ${t} \u2192 ${n()}`),!0}catch(m){return console.warn(ee,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,m),!1}}function Nt(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:ye,inject:()=>({close:t.close,pick:t.pick})},Ge),o=null;try{o=e.slots.register({name:"sidebar.panellist",id:ye,order:43,label:()=>"\u8BB0\u5FC6"},He)}catch(n){try{a()}catch{}throw n}return()=>{try{o()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(ee,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(ee,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}function Ct(e){q(),Nt(e,Rt(e)),Xe(e,"conversation.view",ye,40,()=>"\u8BB0\u5FC6",We),Xe(e,"conversation.hero.options","my-memory-persona",10,()=>"\u89D2\u8272",Ve)}

		return module.exports;
	}
});
