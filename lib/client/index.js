window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Ze=Object.create;var ae=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var et=Object.getOwnPropertyNames;var tt=Object.getPrototypeOf,at=Object.prototype.hasOwnProperty;var st=(e,t)=>{for(var a in t)ae(e,a,{get:t[a],enumerable:!0})},fe=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of et(t))!at.call(e,r)&&r!==a&&ae(e,r,{get:()=>t[r],enumerable:!(o=Qe(t,r))||o.enumerable});return e};var H=(e,t,a)=>(a=e!=null?Ze(tt(e)):{},fe(t||!e||!e.__esModule?ae(a,"default",{value:e,enumerable:!0}):a,e)),rt=e=>fe(ae({},"__esModule",{value:!0}),e);var Pt={};st(Pt,{apply:()=>Ct,inject:()=>St,name:()=>kt});module.exports=rt(Pt);var T=H(require("react"),1);var W=H(require("react"),1);var nt="/my-memory/api";async function X(e,t){let a=await fetch(`${nt}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!a.ok){let i=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=r,i}return r}function ot(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function se(e){let t=String(e?.id??""),a=String(e?.path??""),o=String(e?.display??"")||ot(a)||(t?`~\\${t}\\agent.md`:"");return{id:t,name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:a,display:o}}async function Z(){let e=await X("/personas"),t=Array.isArray(e?.items)?e.items.map(se):[],a=e?.activeId?String(e.activeId):t[0]?.id??null;return{items:t,activeId:a}}async function be(e){let t=String(e?.dir??"").trim(),a=await X("/personas",{method:"POST",body:JSON.stringify({dir:t,name:t})});return se(a)}async function re(e,t){let a=await X(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(t??{})});return se(a)}function ge(e){return X(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function xe(e){return X(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function ve(e){return X(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function we(e,t){let a=await X(`/personas/${encodeURIComponent(String(e))}/rename`,{method:"POST",body:JSON.stringify({dir:String(t??"").trim()})});return se(a)}var F=require("react/jsx-runtime"),it=1600;function ke({persona:e,onSaved:t}={}){let[a,o]=W.useState(String(e?.name??"")),[r,i]=W.useState(String(e?.body??"")),[d,u]=W.useState(!1),[f,h]=W.useState(""),[g,p]=W.useState(""),R=W.useRef({name:String(e?.name??""),body:String(e?.body??"")}),N=W.useRef(!1),C=W.useRef(null);W.useEffect(()=>()=>{C.current&&clearTimeout(C.current)},[]);async function E(x){if(N.current)return;let m={name:x.name!==void 0?String(x.name):a,body:x.body!==void 0?String(x.body):r};if(!(m.name===R.current.name&&m.body===R.current.body)){N.current=!0,u(!0),p("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let n={};m.name!==R.current.name&&(n.name=m.name),m.body!==R.current.body&&(n.body=m.body);let c=await re(e.id,n),S={name:String(c?.name??m.name),body:String(c?.body??m.body)};R.current=S,o(S.name),i(S.body),t?.({...S,id:e.id,updated:Number(c?.updated)||0}),h("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),C.current&&clearTimeout(C.current),C.current=setTimeout(()=>{C.current=null,h("")},it)}catch(n){p(`\u4FDD\u5B58\u5931\u8D25\uFF1A${n?.message||n}`)}finally{N.current=!1,u(!1)}}}return(0,F.jsxs)(F.Fragment,{children:[(0,F.jsxs)("label",{className:"dsh-mymem-field",children:[(0,F.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,F.jsx)("input",{className:"dsh-mymem-input",value:a,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onChange:x=>o(x.target.value),onBlur:()=>void E({name:a})})]}),(0,F.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",d?" \xB7 \u4FDD\u5B58\u4E2D\u2026":f?` \xB7 ${f}`:""]}),g?(0,F.jsx)("div",{className:"dsh-mymem-error",children:g}):null,(0,F.jsxs)("label",{className:"dsh-mymem-field",children:[(0,F.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,F.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:r,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:x=>i(x.target.value),onBlur:()=>void E({body:r})})]})]})}var z=H(require("react"),1);var mt="/my-memory/api";async function K(e,t){let a=await fetch(`${mt}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!a.ok){let i=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=r,i}return r}async function Se(e){let t=e?.scope==="project"?"project":"global",a=new URLSearchParams({scope:t});t==="project"&&e?.project&&a.set("project",String(e.project));let o=await K(`/memory?${a.toString()}`);return{items:(Array.isArray(o?.items)?o.items:[]).map(i=>({id:String(i?.id??""),summary:String(i?.summary??i?.text??""),date:String(i?.date??""),title:i?.title?String(i.title):"",tags:Array.isArray(i?.tags)?i.tags:[]}))}}async function le(){let e=await K("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??""),rev:String(e?.rev??"")}}function ce(e){return K("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??""),baseRev:String(e?.baseRev??""),...e?.force?{force:!0}:{}})})}async function Re(){let e=await K("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??""),folderName:String(e?.folderName??"dsh-my-memory")}}function Ne(e){return K("/settings/dataDir",{method:"POST",body:JSON.stringify({parent:String(e??"")})})}function Ce(){return K("/settings/reveal",{method:"POST"})}async function ne(e){let t=await K(`/session/persona?session=${encodeURIComponent(String(e))}`);return{sessionId:String(t?.sessionId??e),personaId:t?.personaId?String(t.personaId):null,name:String(t?.name??""),locked:!!t?.locked}}function Pe(e,t){return K("/session/persona",{method:"POST",body:JSON.stringify({session:String(e),personaId:String(t)})})}async function Ee(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await K(`/project/state${t}`);return{cwd:String(a?.cwd??""),memoryPath:String(a?.memoryPath??""),exists:!!a?.exists,enabled:!!a?.enabled,hasLegacy:!!a?.hasLegacy}}function De(e,t){return K("/project/state",{method:"POST",body:JSON.stringify({...e?{cwd:String(e)}:{},enabled:!!t})})}async function Me(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await K(`/project/raw${t}`);return{path:String(a?.path??""),text:String(a?.text??"")}}function ze(e,t){let a=String(e??"").split(`
`),o=String(t??"").split(`
`);if(a.length>1500||o.length>1500)return[...a.map(g=>({kind:"del",text:g})),...o.map(g=>({kind:"add",text:g}))];let r=a.length,i=o.length,d=Array.from({length:r+1},()=>new Uint16Array(i+1));for(let g=r-1;g>=0;g-=1)for(let p=i-1;p>=0;p-=1)d[g][p]=a[g]===o[p]?d[g+1][p+1]+1:Math.max(d[g+1][p],d[g][p+1]);let u=[],f=0,h=0;for(;f<r&&h<i;)a[f]===o[h]?(u.push({kind:"same",text:a[f]}),f+=1,h+=1):d[f+1][h]>=d[f][h+1]?(u.push({kind:"del",text:a[f]}),f+=1):(u.push({kind:"add",text:o[h]}),h+=1);for(;f<r;)u.push({kind:"del",text:a[f]}),f+=1;for(;h<i;)u.push({kind:"add",text:o[h]}),h+=1;return u}function Te(e){let t=0,a=0;for(let o of e||[])o.kind==="add"?t+=1:o.kind==="del"&&(a+=1);return{added:t,removed:a}}var b=require("react/jsx-runtime");function dt(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Ie(){let e=new Date,t=a=>String(a).padStart(2,"0");return`${t(e.getHours())}:${t(e.getMinutes())}`}function $e(){let[e,t]=z.useState(null),[a,o]=z.useState(!0),[r,i]=z.useState(""),[d,u]=z.useState(""),[f,h]=z.useState(""),[g,p]=z.useState(""),[R,N]=z.useState(!1),[C,E]=z.useState(""),[x,m]=z.useState(null),[n,c]=z.useState(null),S=d!==f,y=z.useRef(d),D=z.useRef(S),B=z.useRef(g);z.useEffect(()=>{y.current=d,D.current=S,B.current=g},[d,S,g]);let k=z.useCallback(async()=>{o(!0);try{let v=await le(),M=String(v?.text??"");t({path:String(v?.path??"")}),u(M),h(M),p(String(v?.rev??"")),m(null),i("")}catch(v){i(`\u8BFB\u53D6\u5931\u8D25\uFF1A${v?.message||v}`)}finally{o(!1)}},[]);z.useEffect(()=>{k()},[k]);async function J(){try{let v=await le(),M=String(v?.text??""),U=String(v?.rev??"");if(!D.current){u(M),h(M),p(U),m(null),i("");return}U&&U!==B.current&&m({text:M,rev:U})}catch{}}async function oe(){if(!D.current||R)return;let v=y.current;N(!0),i("");try{let M=await ce({scope:"global",text:v,baseRev:B.current});p(String(M?.rev??"")),h(String(M?.text??v)),m(null),E(Ie())}catch(M){if(M?.status===409){let U=M.body||{};c({mode:"conflict",diskText:String(U.text??""),diskRev:String(U.rev??""),baseRev:String(U.baseRev??B.current)})}else i(`\u4FDD\u5B58\u5931\u8D25\uFF1A${M?.message||M}`)}finally{N(!1)}}async function ie(){N(!0),i("");try{let v=await ce({scope:"global",text:y.current,baseRev:B.current,force:!0});p(String(v?.rev??"")),h(String(v?.text??y.current)),m(null),c(null),E(Ie())}catch(v){i(`\u8986\u76D6\u5931\u8D25\uFF1A${v?.message||v}`)}finally{N(!1)}}function me(v,M){u(v),h(v),M&&p(M),m(null),c(null)}let ee=n?ze(n.mode==="conflict"?n.diskText:n.text,d):[],te=Te(ee);return(0,b.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,b.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,b.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${dt(e.path)}`:""}),(0,b.jsx)("span",{className:"dsh-mymem-spacer"}),(0,b.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:a||R,onClick:()=>void k(),children:a?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),x&&!n?(0,b.jsxs)("div",{className:"dsh-mymem-remotebar",children:[(0,b.jsx)("span",{children:"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u66F4\u65B0"}),(0,b.jsx)("span",{className:"dsh-mymem-raw-grow"}),(0,b.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>c({mode:"compare",text:x.text,rev:x.rev}),children:"\u5BF9\u6BD4"})]}):null,r?(0,b.jsx)("div",{className:"dsh-mymem-error",children:r}):null,(0,b.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:d,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C\uFF1B\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",onFocus:()=>void J(),onBlur:()=>void oe(),onChange:v=>u(v.target.value)}),n?(0,b.jsxs)("div",{className:"dsh-mymem-diff","data-kind":n.mode,children:[(0,b.jsxs)("div",{className:"dsh-mymem-diff-head",children:[(0,b.jsx)("span",{className:"dsh-mymem-diff-title",children:n.mode==="conflict"?"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u7ECF\u88AB\u6539\u8FC7":"\u548C\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5BF9\u6BD4"}),(0,b.jsxs)("span",{className:"dsh-mymem-diff-count",children:["\u65B0\u589E ",te.added," \u884C \xB7 \u5220\u9664 ",te.removed," \u884C"]})]}),(0,b.jsx)("div",{className:"dsh-mymem-diff-body",children:ee.map((v,M)=>(0,b.jsxs)("div",{className:"dsh-mymem-diffline","data-kind":v.kind,children:[(0,b.jsx)("span",{className:"dsh-mymem-diffmark",children:v.kind==="add"?"+":v.kind==="del"?"\u2212":" "}),(0,b.jsx)("span",{className:"dsh-mymem-difftext",children:v.text||" "})]},M))}),(0,b.jsx)("div",{className:"dsh-mymem-diff-actions",children:n.mode==="conflict"?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:R,onClick:()=>void ie(),children:"\u7528\u6211\u7684\u8986\u76D6"}),(0,b.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>me(n.diskText,n.diskRev),children:"\u7528\u78C1\u76D8\u7684"}),(0,b.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>c(null),children:"\u53D6\u6D88"})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>me(n.text,n.rev),children:"\u7528\u78C1\u76D8\u7684"}),(0,b.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>c(null),children:"\u5173\u95ED"})]})})]}):null,(0,b.jsxs)("div",{className:"dsh-mymem-raw-status",children:[R?"\u4FDD\u5B58\u4E2D\u2026":C?`\u5DF2\u4FDD\u5B58 \xB7 ${C}`:"\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",S&&!R?" \xB7 \u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8":""]})]})}var O=H(require("react"),1);var G=H(require("react"),1),ue=H(require("react-dom"),1),I=require("react/jsx-runtime");function je(e,t){let a=G.useRef(null);G.useEffect(()=>{a.current=typeof document<"u"?document.activeElement:null;let o=t.current;return o&&(o.focus(),typeof o.select=="function"&&o.select()),()=>{let r=a.current;if(r&&typeof r.focus=="function"&&document.contains(r))try{r.focus()}catch{}}},[t]),G.useEffect(()=>{let o=r=>{r.key==="Escape"&&e?.()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[e])}function Y({title:e,description:t,label:a,defaultValue:o="",placeholder:r,confirmText:i="\u786E\u5B9A",validate:d,allowEmpty:u=!1,onSubmit:f,onCancel:h}){let[g,p]=G.useState(o),[R,N]=G.useState(""),[C,E]=G.useState(!1),x=G.useRef(null);je(h,x);let m=g.trim(),n=m&&d?d(m):"",c=(u||!!m)&&!n&&!C;async function S(){if(c){if(d&&m){let y=d(m);if(y){N(y);return}}E(!0),N("");try{await f?.(m)}catch(y){N(String(y?.message||y))}finally{E(!1)}}}return typeof document>"u"?null:ue.createPortal((0,I.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:y=>{y.target===y.currentTarget&&h?.()},children:(0,I.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,I.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,I.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,a?(0,I.jsx)("div",{className:"dsh-mymem-modal-label",children:a}):null,(0,I.jsx)("input",{ref:x,className:"dsh-mymem-input",value:g,placeholder:r||"",spellCheck:!1,onChange:y=>{p(y.target.value),N("")},onKeyDown:y=>{y.key==="Enter"&&(y.preventDefault(),S())}}),n||R?(0,I.jsx)("div",{className:"dsh-mymem-modal-error",children:R||n}):null,(0,I.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,I.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>h?.(),children:"\u53D6\u6D88"}),(0,I.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!c,onClick:()=>void S(),children:C?"\u5904\u7406\u4E2D\u2026":i})]})]})}),document.body)}function Le({title:e,message:t,confirmText:a="\u786E\u5B9A",danger:o,onOk:r,onCancel:i}){let d=G.useRef(null);return je(i,d),G.useEffect(()=>{let u=f=>{f.key==="Enter"&&(f.preventDefault(),r?.())};return document.addEventListener("keydown",u),()=>document.removeEventListener("keydown",u)},[r]),typeof document>"u"?null:ue.createPortal((0,I.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:u=>{u.target===u.currentTarget&&i?.()},children:(0,I.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,I.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,I.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,(0,I.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,I.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>i?.(),children:"\u53D6\u6D88"}),(0,I.jsx)("button",{ref:d,className:`dsh-mymem-btn${o?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>r?.(),children:a})]})]})}),document.body)}var j=require("react/jsx-runtime");function pe(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Oe({onChanged:e,pick:t}={}){let[a,o]=O.useState(null),[r,i]=O.useState(""),[d,u]=O.useState(""),[f,h]=O.useState(""),[g,p]=O.useState(!1),[R,N]=O.useState(!1),[C,E]=O.useState(!1),x=O.useRef(null);O.useEffect(()=>()=>{x.current&&clearTimeout(x.current)},[]);let m=O.useCallback(async()=>{try{let k=await Re();o(k),i("")}catch(k){i(`\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A${k?.message||k}`)}},[]);O.useEffect(()=>{m()},[m]);function n(k){u(k),x.current&&clearTimeout(x.current),x.current=setTimeout(()=>{x.current=null,u("")},2600)}let c=a?.folderName||"dsh-my-memory",S=typeof t=="function";async function y(k){E(!0),i("");try{let J=await Ne(k);p(!1),h(String(J?.movedFrom??"")),await m(),n(`\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362\uFF1A${pe(String(J?.dataDir??""))}`),e?.()}catch(J){throw new Error(String(J?.message||J))}finally{E(!1)}}async function D(){if(i(""),!S){p(!0);return}N(!0);try{let k=await t();if(!k)return;await y(k)}catch(k){i(`\u9009\u62E9\u76EE\u5F55\u5931\u8D25\uFF1A${k?.message||k}`)}finally{N(!1)}}async function B(){i("");try{await Ce()}catch(k){i(`\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A${k?.message||k}`)}}return(0,j.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,j.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,j.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5168\u5C40\u8BB0\u5FC6\u3001\u9879\u76EE\u8BB0\u5FC6\u90FD\u5B58\u5728\u8FD9\u4E2A\u76EE\u5F55\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,j.jsx)("div",{className:"dsh-mymem-settings-path",title:a?.dataDir||"",children:a?.dataDir||(a?"\uFF08\u7A7A\uFF09":"\u8BFB\u53D6\u4E2D\u2026")}),(0,j.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,j.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>void B(),children:"\u6253\u5F00\u76EE\u5F55"}),(0,j.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a||R||C,onClick:()=>void D(),children:R?"\u9009\u62E9\u4E2D\u2026":"\u66F4\u6539\u76EE\u5F55"}),d?(0,j.jsx)("span",{className:"dsh-mymem-ok",children:d}):null]}),(0,j.jsxs)("div",{className:"dsh-mymem-hint",children:["\u66F4\u6539\u76EE\u5F55\u65F6\u9009\u7684\u662F\u7236\u76EE\u5F55\uFF0C\u6570\u636E\u56FA\u5B9A\u653E\u5728 ",(0,j.jsx)("code",{children:c})," \u5B50\u76EE\u5F55\u91CC\uFF1A\u4F8B\u5982\u9009\u4E86 D:\\projects\uFF0C\u5B9E\u9645\u4F4D\u7F6E\u662F D:\\projects\\"+c+"\u3002"]}),a?.defaultDataDir?(0,j.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",pe(a.defaultDataDir),"\uFF08\u4E0D\u9009 = \u4F7F\u7528\u9ED8\u8BA4\uFF09"]}):null,f?(0,j.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",pe(f),"\uFF1B\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u624B\u52A8\u590D\u5236\u8FC7\u6765\u3002"]}):null,r?(0,j.jsx)("div",{className:"dsh-mymem-error",children:r}):null,g?(0,j.jsx)(Y,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:`\u9009\u4E00\u4E2A\u7236\u76EE\u5F55\uFF08\u7559\u7A7A = \u4F7F\u7528\u9ED8\u8BA4\u76EE\u5F55\uFF09\u3002\u6570\u636E\u4F1A\u653E\u5728\u6240\u9009\u76EE\u5F55\u4E0B\u7684 ${c} \u91CC\u3002`,label:"\u7236\u76EE\u5F55",defaultValue:"",placeholder:"\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u4F8B\u5982 D:\\projects",confirmText:C?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:y,onCancel:()=>p(!1)}):null]})}var Ae=H(require("react"),1),_e=H(require("react-dom"),1),he=require("react/jsx-runtime"),lt=160,ct=130;function Be({menu:e,onClose:t}){if(Ae.useEffect(()=>{if(!e)return;let d=()=>t(),u=f=>{f.key==="Escape"&&t()};return document.addEventListener("mousedown",d),document.addEventListener("keydown",u),window.addEventListener("blur",d),()=>{document.removeEventListener("mousedown",d),document.removeEventListener("keydown",u),window.removeEventListener("blur",d)}},[e,t]),!e||typeof document>"u")return null;let a=window.innerWidth||0,o=window.innerHeight||0,r=Math.max(4,Math.min(e.x,a-lt-6)),i=Math.max(4,Math.min(e.y,o-ct-6));return _e.createPortal((0,he.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:r,top:i,zIndex:2147483002},onMouseDown:d=>d.stopPropagation(),children:e.items.map(d=>(0,he.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:d.disabled,onClick:()=>{t(),d.onClick?.()},children:d.label},d.label))}),document.body)}function Ue(e,t){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:t}}var Fe="dsh-my-memory-style",ut=`
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
/* \u89D2\u8272\u9009\u62E9\u8981\u8DDF\u300C\u6587\u4EF6\u5939 / \u6807\u51C6\u6A21\u5F0F\u300D\u6392\u6210\u4E00\u6392\u5DE6\u8D77\u3002
   \u5B98\u65B9\u5E03\u5C40\uFF08conversation \u5305\u7684 CSS module\uFF09\uFF1AheroWorkspaceRow \u662F flex \u884C\uFF0C
   \u91CC\u9762 workspace chip \u2192 agentPreset \u2192 \u4E00\u4E2A heroOptions \u5BB9\u5668\uFF0C\u800C heroOptions \u7528
   \u7528\u4E86 margin-left:auto \u88AB\u9876\u5230\u884C\u5C3E\uFF0C\u6240\u4EE5\u6302\u5728\u8FD9\u4E2A\u69FD\u4F4D\u91CC\u7684\u4E1C\u897F\u5929\u7136\u9760\u53F3\u3002
   \u8FD9\u91CC\u53EA\u628A\u90A3\u4E2A auto \u62FF\u6389\uFF0C\u8BA9\u6574\u7EC4\u56DE\u5230\u5DE6\u8D77\uFF1B\u522B\u7684\u4E00\u6982\u4E0D\u52A8\u3002
   \u7C7B\u540D\u5E26\u6784\u5EFA\u54C8\u5E0C\uFF08\u5F62\u5982 an3WzG_heroOptions\uFF09\uFF0C\u6240\u4EE5\u7528\u5C5E\u6027\u5305\u542B\u9009\u62E9\u5668\uFF0C\u4E0D\u5199\u6B7B\u54C8\u5E0C\u3002 */
[class*="_heroWorkspaceRow"] > [class*="_heroOptions"] { margin-left: 0; }

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

`;function q(){if(typeof document>"u"||document.getElementById(Fe))return;let e=document.createElement("style");e.id=Fe,e.textContent=ut,document.head.appendChild(e)}var l=require("react/jsx-runtime"),pt=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],ht=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],We=/^[A-Za-z0-9._-]{1,40}$/;function Ge({close:e,pick:t}={}){let[a,o]=T.useState("persona"),[r,i]=T.useState("role"),[d,u]=T.useState(null),[f,h]=T.useState(null),[g,p]=T.useState(""),[R,N]=T.useState(""),[C,E]=T.useState(null),[x,m]=T.useState(null),[n,c]=T.useState(null),[S,y]=T.useState(0),D=T.useRef(null);T.useEffect(()=>(q(),()=>{D.current&&clearTimeout(D.current)}),[]);let B=T.useCallback(s=>{N(s),D.current&&clearTimeout(D.current),D.current=setTimeout(()=>{D.current=null,N("")},1600)},[]),k=T.useCallback(async()=>{let s=await Z();return u(s),h(w=>w&&s.items.some($=>$.id===w)?w:s.activeId??s.items[0]?.id??null),s},[]);T.useEffect(()=>{let s=!0;return(async()=>{try{let w=await Z();if(!s)return;u(w),h(w.activeId??w.items[0]?.id??null),Se({scope:"global"}).then($=>{s&&m($.items.length)}).catch(()=>{})}catch(w){s&&p(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${w?.message||w}`)}})(),()=>{s=!1}},[]);async function J(s){p("");try{await s(),await k()}catch(w){p(String(w?.message||w))}}let oe=T.useCallback(()=>E(null),[]);function ie(){c({kind:"create",onCancel:()=>c(null),onSubmit:async s=>{p("");try{let w=await be({dir:s});c(null),await k(),w?.id&&h(w.id),i("role")}catch(w){let $=String(w?.message||w);throw p(`\u65B0\u5EFA\u5931\u8D25\uFF1A${$}`),new Error($)}}})}function me(s){c({kind:"rename",persona:s,onCancel:()=>c(null),onSubmit:async w=>{await re(s.id,{name:w}),c(null),await k()}})}function ee(s){c({kind:"delete",persona:s,onCancel:()=>c(null),onOk:async()=>{c(null),await J(()=>ge(s.id))}})}function te(s){c({kind:"renameDir",persona:s,onCancel:()=>c(null),onSubmit:async w=>{p("");try{let $=await we(s.id,w);c(null),await k(),$?.id&&h($.id),B("\u76EE\u5F55\u5DF2\u66F4\u65B0")}catch($){throw p(`\u66F4\u65B0\u76EE\u5F55\u5931\u8D25\uFF1A${String($?.message||$)}`),new Error(String($?.message||$))}}})}function v(s){return[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:!!d&&d.activeId===s.id,onClick:()=>J(()=>xe(s.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>J(async()=>{await ve(s.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>te(s)},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>ee(s)}]}async function M(){p("");try{await k(),y(s=>s+1)}catch(s){p(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${s?.message||s}`)}}let U=d?.items.find(s=>s.id===f)||null,de=d?.items.find(s=>s.id===d.activeId)||U,Ye=[x===null?"":`${x} \u6761\u957F\u671F\u8BB0\u5FC6`,de?`\u5F53\u524D\u89D2\u8272 ${de.name||de.id}`:""].filter(Boolean).join(" \xB7 ");return(0,l.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,l.jsxs)("div",{className:"dsh-mymem-head",children:[(0,l.jsx)("div",{className:"dsh-mymem-title",children:"\u8BB0\u5FC6"}),(0,l.jsx)("div",{className:"dsh-mymem-sub",children:Ye}),(0,l.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,l.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:pt.map(s=>(0,l.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":a===s.key,"data-active":a===s.key?"1":"0",onClick:()=>o(s.key),children:s.label},s.key))}),a==="settings"?(0,l.jsx)(Oe,{onChanged:M,pick:t}):(0,l.jsx)(l.Fragment,{children:(0,l.jsxs)("div",{className:"dsh-mymem-body",children:[(0,l.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,l.jsxs)("div",{className:"dsh-mymem-toolbar-left",children:[(0,l.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:ie,children:"\uFF0B \u65B0\u5EFA"}),R?(0,l.jsx)("span",{className:"dsh-mymem-ok",children:R}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-toolbar-right",children:(0,l.jsx)("div",{className:"dsh-mymem-inner-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:ht.map(s=>(0,l.jsx)("button",{className:"dsh-mymem-inner-tab",type:"button",role:"tab","aria-selected":r===s.key,"data-active":r===s.key?"1":"0",onClick:()=>i(s.key),children:s.label},s.key))})})]}),g?(0,l.jsx)("div",{className:"dsh-mymem-error",children:g}):null,(0,l.jsxs)("div",{className:"dsh-mymem-split",children:[(0,l.jsx)("div",{className:"dsh-mymem-side",children:(0,l.jsx)("div",{className:"dsh-mymem-cards",children:d?d.items.map(s=>(0,l.jsxs)("div",{className:"dsh-mymem-row","data-active":s.id===f?"1":"0",onClick:()=>h(s.id),onContextMenu:w=>E(Ue(w,v(s))),children:[(0,l.jsx)("span",{className:"dsh-mymem-avatar",children:(s.name||s.id).slice(0,1)}),(0,l.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,l.jsxs)("div",{className:"dsh-mymem-name",title:s.name||s.id,children:[s.name||s.id,d.activeId===s.id?(0,l.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-path",title:s.path||s.display,children:s.display})]})]},s.id)):(0,l.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,l.jsx)("div",{className:"dsh-mymem-main",children:r==="memory"?(0,l.jsx)($e,{},`raw:${S}`):U?(0,l.jsx)(ke,{persona:U,onSaved:s=>u(w=>w&&{...w,items:w.items.map($=>$.id===s.id?{...$,...s}:$)})},`${U.id}:${S}`):(0,l.jsx)("div",{className:"dsh-mymem-hint",children:d?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})}),(0,l.jsx)(Be,{menu:C,onClose:oe}),n?.kind==="create"?(0,l.jsx)(Y,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:s=>We.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:n.onSubmit,onCancel:n.onCancel}):null,n?.kind==="renameDir"?(0,l.jsx)(Y,{title:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",description:"\u6539\u7684\u662F\u78C1\u76D8\u4E0A\u7684\u89D2\u8272\u6587\u4EF6\u5939\u540D\uFF0C\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\u3002",label:"\u89D2\u8272\u76EE\u5F55",defaultValue:n.persona.id||"",placeholder:"\u4F8B\u5982 baby",confirmText:"\u66F4\u65B0",validate:s=>We.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:n.onSubmit,onCancel:n.onCancel}):null,n?.kind==="rename"?(0,l.jsx)(Y,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:n.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:n.onSubmit,onCancel:n.onCancel}):null,n?.kind==="delete"?(0,l.jsx)(Le,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${n.persona.name||n.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:n.onOk,onCancel:n.onCancel}):null]})}var Zt=require("react"),V=require("react/jsx-runtime");function yt({size:e=16}){return(0,V.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,V.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,V.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,V.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function Je({size:e=16}){return(0,V.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,V.jsx)(yt,{size:e})})}var A=H(require("react"),1);var L=require("react/jsx-runtime");function ft(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function bt(e){return e?.session?.cwd||e?.cwd||e?.session?.workingDirectory||null}function He(e){let t=ft(e),a=bt(e),[o,r]=A.useState(null),[i,d]=A.useState(null),[u,f]=A.useState(null),[h,g]=A.useState(!0),[p,R]=A.useState(!1),[N,C]=A.useState(""),E=A.useRef(0);A.useEffect(()=>{q()},[]);let x=A.useCallback(async()=>{let y=++E.current;g(!0);try{let D=await Ee(a);if(y!==E.current)return;d(D);try{let B=await Me(a);y===E.current&&f(B)}catch{y===E.current&&f({path:"",text:""})}C("")}catch(D){y===E.current&&C(`\u8BFB\u53D6\u5931\u8D25\uFF1A${D?.message||D}`)}finally{y===E.current&&g(!1)}},[a]);A.useEffect(()=>{x()},[x]),A.useEffect(()=>{let y=!0;if(t)return(async()=>{try{let D=await ne(t);y&&r(D)}catch{}})(),()=>{y=!1}},[t]);let m=!!i?.enabled;async function n(){if(!(p||!i)){R(!0),C("");try{await De(a,!m),await x()}catch(y){C(`\u5207\u6362\u5931\u8D25\uFF1A${y?.message||y}`)}finally{R(!1)}}}let c=String(u?.text??""),S=c.trim().length>0;return(0,L.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"session-memory",children:[(0,L.jsxs)("div",{className:"dsh-mymem-head",children:[(0,L.jsx)("span",{className:"dsh-mymem-scope-name",children:o?.name||"\u672A\u7ED1\u5B9A\u89D2\u8272"}),(0,L.jsx)("span",{className:"dsh-mymem-spacer"}),(0,L.jsxs)("span",{className:"dsh-mymem-switch",children:[(0,L.jsx)("span",{className:"dsh-mymem-switch-label",children:"\u5C40\u90E8\u8BB0\u5FC6"}),(0,L.jsx)("button",{type:"button",role:"switch","aria-checked":m,"aria-label":"\u5C40\u90E8\u8BB0\u5FC6",className:"dsh-mymem-switch-track","data-on":m?"1":"0",disabled:p||h||!i,onClick:()=>void n(),children:(0,L.jsx)("span",{className:"dsh-mymem-switch-thumb"})})]})]}),N?(0,L.jsx)("div",{className:"dsh-mymem-error",children:N}):null,(0,L.jsxs)("div",{className:"dsh-mymem-local","data-off":m?"0":"1",children:[S?(0,L.jsx)("pre",{className:"dsh-mymem-raw-pre dsh-mymem-localpre",children:c}):(0,L.jsx)("div",{className:"dsh-mymem-empty",children:h?"\u8BFB\u53D6\u4E2D\u2026":m?"\u8FD8\u6CA1\u6709\u5C40\u90E8\u8BB0\u5FC6":"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}),!m&&S?(0,L.jsx)("div",{className:"dsh-mymem-localmask",children:"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}):null]}),(0,L.jsx)("div",{className:"dsh-mymem-hint",children:"\u5173\u95ED\u53EA\u662F\u4E0D\u518D\u8BB0\u5F55\uFF0C\u5DF2\u6709\u5185\u5BB9\u4E0D\u4F1A\u5220\u9664\u3002"})]})}var _=H(require("react"),1),qe=H(require("react-dom"),1);var P=require("react/jsx-runtime");function gt(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function Ke(e){let t=String(e??"").trim();if(!t)return"";let a=t.split(`
`).map(o=>o.trim()).find(Boolean)||"";return a.replace(/^[「【\[]?[^」】\]]{0,6}[」】\]]?\s*/,"").trim()||a}function xt({size:e=14}){return(0,P.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:[(0,P.jsx)("circle",{cx:"12",cy:"8.2",r:"3.4",stroke:"currentColor",strokeWidth:"1.7"}),(0,P.jsx)("path",{d:"M5.2 19.2c.9-3.3 3.6-5.2 6.8-5.2s5.9 1.9 6.8 5.2",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"})]})}function vt({size:e=12}){return(0,P.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,P.jsx)("path",{d:"M6 9.5 12 15l6-5.5",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})}function wt({sessionId:e}){let[t,a]=_.useState(null),[o,r]=_.useState(null),[i,d]=_.useState(!1),[u,f]=_.useState(null),[h,g]=_.useState(""),[p,R]=_.useState(!1),N=_.useRef(null);_.useEffect(()=>{q()},[]),_.useEffect(()=>{let m=!0;return(async()=>{try{let n=await Z();m&&a(n.items||[])}catch{m&&a([])}try{let n=await ne(e);m&&r(n)}catch{}})(),()=>{m=!1}},[e]);let C=_.useCallback(()=>{let m=N.current;if(!m)return;let n=m.getBoundingClientRect(),c=380,S=window.innerWidth||0,y=window.innerHeight||0,D=Math.max(8,Math.min(n.left,S-c-8)),B=n.bottom+6,k=B+320>y?Math.max(8,n.top-6-320):B;f({left:D,top:k,width:c})},[]);_.useEffect(()=>{if(!i)return;C();let m=S=>{N.current?.contains(S.target)||S.target?.closest?.(".dsh-mymem-heromenu")||d(!1)},n=S=>{S.key==="Escape"&&d(!1)},c=()=>C();return document.addEventListener("mousedown",m),document.addEventListener("keydown",n),window.addEventListener("resize",c),window.addEventListener("scroll",c,!0),()=>{document.removeEventListener("mousedown",m),document.removeEventListener("keydown",n),window.removeEventListener("resize",c),window.removeEventListener("scroll",c,!0)}},[i,C]);let E=o?.name||"\u9009\u62E9\u89D2\u8272";async function x(m){if(!p){if(m.id===o?.personaId){d(!1);return}R(!0),g("");try{let n=await Pe(e,m.id);r({sessionId:e,personaId:String(n?.personaId??m.id),name:String(n?.name??m.name??"")}),d(!1)}catch(n){g(`\u7ED1\u5B9A\u5931\u8D25\uFF1A${n?.message||n}`)}finally{R(!1)}}}return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsxs)("button",{ref:N,type:"button",className:"dsh-mymem-herobtn","aria-haspopup":"listbox","aria-expanded":i,onClick:()=>d(m=>!m),children:[(0,P.jsx)("span",{className:"dsh-mymem-herobtn-icon",children:(0,P.jsx)(xt,{})}),(0,P.jsx)("span",{className:"dsh-mymem-herobtn-label",children:E}),(0,P.jsx)("span",{className:"dsh-mymem-herobtn-chev",children:(0,P.jsx)(vt,{})})]}),i&&u&&typeof document<"u"?qe.createPortal((0,P.jsxs)("div",{className:"dsh-mymem-heromenu",style:{position:"fixed",left:u.left,top:u.top,width:u.width},children:[h?(0,P.jsx)("div",{className:"dsh-mymem-heromenu-err",children:h}):null,(0,P.jsxs)("div",{className:"dsh-mymem-heromenu-list",role:"listbox",children:[(t||[]).map(m=>{let n=m.id===o?.personaId;return(0,P.jsxs)("button",{type:"button",role:"option","aria-selected":n,className:"dsh-mymem-heroitem","data-active":n?"1":"0",disabled:p,onClick:()=>void x(m),children:[(0,P.jsxs)("span",{className:"dsh-mymem-heroitem-main",children:[(0,P.jsx)("span",{className:"dsh-mymem-heroitem-name",children:m.name||m.id}),Ke(m.body)?(0,P.jsx)("span",{className:"dsh-mymem-heroitem-desc",children:Ke(m.body)}):null]}),n?(0,P.jsx)("span",{className:"dsh-mymem-heroitem-check",children:"\u2713"}):null]},m.id)}),t&&t.length===0?(0,P.jsx)("div",{className:"dsh-mymem-heromenu-hint",children:"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361"}):null]})]}),document.body):null]})}function Ve(e){let t=gt(e);return t?(0,P.jsx)(wt,{sessionId:String(t)}):null}var kt="my-memory",St=["slots","layout"],Q="[my-memory]",ye="my-memory";function Rt(e){let t=globalThis.__DSH_DIRECTORY_PICKER__;return{pick:typeof t?.pick=="function"?()=>t.pick():null,close(){try{e.layout.selectPanel(null)}catch(o){console.warn(Q,"selectPanel(null) \u5931\u8D25",o)}}}}function Xe(e,t,a,o,r,i){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:o,label:r},i)),`my-memory.${t}`),console.info(Q,`\u5DF2\u6CE8\u518C ${t} \u2192 ${r()}`),!0}catch(d){return console.warn(Q,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,d),!1}}function Nt(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:ye,inject:()=>({close:t.close,pick:t.pick})},Ge),o=null;try{o=e.slots.register({name:"sidebar.panellist",id:ye,order:43,label:()=>"\u8BB0\u5FC6"},Je)}catch(r){try{a()}catch{}throw r}return()=>{try{o()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(Q,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(Q,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}function Ct(e){q(),Nt(e,Rt(e)),Xe(e,"conversation.view",ye,40,()=>"\u8BB0\u5FC6",He),Xe(e,"conversation.hero.options","my-memory-persona",10,()=>"\u89D2\u8272",Ve)}

		return module.exports;
	}
});
