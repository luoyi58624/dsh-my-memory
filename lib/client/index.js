window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Ue=Object.create;var W=Object.defineProperty;var Be=Object.getOwnPropertyDescriptor;var _e=Object.getOwnPropertyNames;var Fe=Object.getPrototypeOf,Ge=Object.prototype.hasOwnProperty;var Je=(e,a)=>{for(var s in a)W(e,s,{get:a[s],enumerable:!0})},ie=(e,a,s,n)=>{if(a&&typeof a=="object"||typeof a=="function")for(let r of _e(a))!Ge.call(e,r)&&r!==s&&W(e,r,{get:()=>a[r],enumerable:!(n=Be(a,r))||n.enumerable});return e};var B=(e,a,s)=>(s=e!=null?Ue(Fe(e)):{},ie(a||!e||!e.__esModule?W(s,"default",{value:e,enumerable:!0}):s,e)),He=e=>ie(W({},"__esModule",{value:!0}),e);var ca={};Je(ca,{apply:()=>da,inject:()=>na,name:()=>oa});module.exports=He(ca);var R=B(require("react"),1);var A=B(require("react"),1);var qe="/my-memory/api";async function _(e,a){let s=await fetch(`${qe}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),n=await s.text(),r;try{r=n?JSON.parse(n):null}catch{r={error:n.slice(0,500)}}if(!s.ok){let o=new Error(r&&(r.error||r.message)||`HTTP ${s.status}`);throw o.status=s.status,o.body=r,o}return r}function Ke(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Y(e){let a=String(e?.id??""),s=String(e?.path??""),n=String(e?.display??"")||Ke(s)||(a?`~\\${a}\\agent.md`:"");return{id:a,name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:s,display:n}}async function te(){let e=await _("/personas"),a=Array.isArray(e?.items)?e.items.map(Y):[],s=e?.activeId?String(e.activeId):a[0]?.id??null;return{items:a,activeId:s}}async function me(e){let a=String(e?.dir??"").trim(),s=await _("/personas",{method:"POST",body:JSON.stringify({dir:a,name:a})});return Y(s)}async function Z(e,a){let s=await _(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(a??{})});return Y(s)}function le(e){return _(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function de(e){return _(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function ce(e){return _(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function ue(e){let a=await _(`/personas/${encodeURIComponent(String(e))}/reload`,{method:"POST"});return Y(a)}function pe(e){return _("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??"")})})}var I=require("react/jsx-runtime"),Ve=1600;function ye({persona:e,onSaved:a}={}){let[s,n]=A.useState(String(e?.name??"")),[r,o]=A.useState(String(e?.body??"")),[d,h]=A.useState(!1),[p,S]=A.useState(""),[y,k]=A.useState(""),v=A.useRef({name:String(e?.name??""),body:String(e?.body??"")}),f=A.useRef(!1),b=A.useRef(null);A.useEffect(()=>()=>{b.current&&clearTimeout(b.current)},[]);async function E(g){if(f.current)return;let m={name:g.name!==void 0?String(g.name):s,body:g.body!==void 0?String(g.body):r};if(!(m.name===v.current.name&&m.body===v.current.body)){f.current=!0,h(!0),k("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let i={};m.name!==v.current.name&&(i.name=m.name),m.body!==v.current.body&&(i.body=m.body);let P=await Z(e.id,i),O={name:String(P?.name??m.name),body:String(P?.body??m.body)};v.current=O,n(O.name),o(O.body),a?.({...O,id:e.id,updated:Number(P?.updated)||0}),S("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),b.current&&clearTimeout(b.current),b.current=setTimeout(()=>{b.current=null,S("")},Ve)}catch(i){k(`\u4FDD\u5B58\u5931\u8D25\uFF1A${i?.message||i}`)}finally{f.current=!1,h(!1)}}}return(0,I.jsxs)(I.Fragment,{children:[(0,I.jsxs)("label",{className:"dsh-mymem-field",children:[(0,I.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,I.jsx)("input",{className:"dsh-mymem-input",value:s,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onChange:g=>n(g.target.value),onBlur:()=>void E({name:s})})]}),(0,I.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",d?" \xB7 \u4FDD\u5B58\u4E2D\u2026":p?` \xB7 ${p}`:""]}),y?(0,I.jsx)("div",{className:"dsh-mymem-error",children:y}):null,(0,I.jsxs)("label",{className:"dsh-mymem-field",children:[(0,I.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,I.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:r,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:g=>o(g.target.value),onBlur:()=>void E({body:r})})]})]})}var $=B(require("react"),1);var We="/my-memory/api";async function F(e,a){let s=await fetch(`${We}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),n=await s.text(),r;try{r=n?JSON.parse(n):null}catch{r={error:n.slice(0,500)}}if(!s.ok){let o=new Error(r&&(r.error||r.message)||`HTTP ${s.status}`);throw o.status=s.status,o.body=r,o}return r}async function he(){let e=await F("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function X(e){let a=e?.scope==="project"?"project":"global",s=new URLSearchParams({scope:a});a==="project"&&e?.project&&s.set("project",String(e.project));let n=await F(`/memory?${s.toString()}`);return{items:(Array.isArray(n?.items)?n.items:[]).map(o=>({id:String(o?.id??""),summary:String(o?.summary??o?.text??""),date:String(o?.date??""),title:o?.title?String(o.title):"",tags:Array.isArray(o?.tags)?o.tags:[]}))}}async function be(){let e=await F("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??"")}}function fe(e){return F("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function ge(e){return F(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}async function xe(){let e=await F("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??"")}}function ve(e){return F("/settings/dataDir",{method:"POST",body:JSON.stringify({path:String(e??"")})})}function we(){return F("/settings/reveal",{method:"POST"})}var N=require("react/jsx-runtime");function Ye(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Se(){let[e,a]=$.useState(null),[s,n]=$.useState(!0),[r,o]=$.useState(""),[d,h]=$.useState(""),[p,S]=$.useState(null),[y,k]=$.useState(!1),v=$.useRef(0),f=$.useRef(null);$.useEffect(()=>{f.current=p},[p]);let b=$.useCallback(async()=>{let m=++v.current;n(!0);try{let i=await be();if(m!==v.current)return;a({path:String(i?.path??""),text:String(i?.text??"")}),o("")}catch(i){if(m!==v.current)return;o(`\u8BFB\u53D6\u5931\u8D25\uFF1A${i?.message||i}`)}finally{m===v.current&&n(!1)}},[]);$.useEffect(()=>{b()},[b]);let E=p!==null;async function g(){if(!y){if(p===(e?.text??"")){S(null);return}k(!0),o("");try{await pe({scope:"global",text:p??""}),await b(),S(null),h("\u5DF2\u4FDD\u5B58"),setTimeout(()=>h(""),1600)}catch(m){o(`\u4FDD\u5B58\u5931\u8D25\uFF1A${m?.message||m}`)}finally{k(!1)}}}return(0,N.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,N.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,N.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${Ye(e.path)}`:""}),(0,N.jsx)("span",{className:"dsh-mymem-spacer"}),E?null:(0,N.jsxs)(N.Fragment,{children:[d?(0,N.jsx)("span",{className:"dsh-mymem-ok",children:d}):null,(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:s||!e,onClick:()=>{h(""),o(""),S(e?.text??"")},children:"\u7F16\u8F91"}),(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:s,onClick:()=>void b(),children:s?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]})]}),r?(0,N.jsx)("div",{className:"dsh-mymem-error",children:r}):null,E?(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:p,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C",onChange:m=>S(m.target.value)}),(0,N.jsxs)("div",{className:"dsh-mymem-raw-actions",children:[(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:y,onClick:()=>{S(null),o("")},children:"\u53D6\u6D88"}),(0,N.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:y,onClick:()=>void g(),children:y?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"})]})]}):(0,N.jsx)("pre",{className:"dsh-mymem-raw-pre",children:e?.text||(s?"":"\uFF08\u8FD9\u4E2A\u6587\u4EF6\u8FD8\u662F\u7A7A\u7684\uFF09")})]})}var j=B(require("react"),1);var U=B(require("react"),1),se=B(require("react-dom"),1),C=require("react/jsx-runtime");function ke(e,a){let s=U.useRef(null);U.useEffect(()=>{s.current=typeof document<"u"?document.activeElement:null;let n=a.current;return n&&(n.focus(),typeof n.select=="function"&&n.select()),()=>{let r=s.current;if(r&&typeof r.focus=="function"&&document.contains(r))try{r.focus()}catch{}}},[a]),U.useEffect(()=>{let n=r=>{r.key==="Escape"&&e?.()};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[e])}function H({title:e,description:a,label:s,defaultValue:n="",placeholder:r,confirmText:o="\u786E\u5B9A",validate:d,allowEmpty:h=!1,onSubmit:p,onCancel:S}){let[y,k]=U.useState(n),[v,f]=U.useState(""),[b,E]=U.useState(!1),g=U.useRef(null);ke(S,g);let m=y.trim(),i=m&&d?d(m):"",P=(h||!!m)&&!i&&!b;async function O(){if(P){if(d&&m){let w=d(m);if(w){f(w);return}}E(!0),f("");try{await p?.(m)}catch(w){f(String(w?.message||w))}finally{E(!1)}}}return typeof document>"u"?null:se.createPortal((0,C.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:w=>{w.target===w.currentTarget&&S?.()},children:(0,C.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,C.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),a?(0,C.jsx)("div",{className:"dsh-mymem-modal-message",children:a}):null,s?(0,C.jsx)("div",{className:"dsh-mymem-modal-label",children:s}):null,(0,C.jsx)("input",{ref:g,className:"dsh-mymem-input",value:y,placeholder:r||"",spellCheck:!1,onChange:w=>{k(w.target.value),f("")},onKeyDown:w=>{w.key==="Enter"&&(w.preventDefault(),O())}}),i||v?(0,C.jsx)("div",{className:"dsh-mymem-modal-error",children:v||i}):null,(0,C.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,C.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>S?.(),children:"\u53D6\u6D88"}),(0,C.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!P,onClick:()=>void O(),children:b?"\u5904\u7406\u4E2D\u2026":o})]})]})}),document.body)}function Ne({title:e,message:a,confirmText:s="\u786E\u5B9A",danger:n,onOk:r,onCancel:o}){let d=U.useRef(null);return ke(o,d),U.useEffect(()=>{let h=p=>{p.key==="Enter"&&(p.preventDefault(),r?.())};return document.addEventListener("keydown",h),()=>document.removeEventListener("keydown",h)},[r]),typeof document>"u"?null:se.createPortal((0,C.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:h=>{h.target===h.currentTarget&&o?.()},children:(0,C.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,C.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),a?(0,C.jsx)("div",{className:"dsh-mymem-modal-message",children:a}):null,(0,C.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,C.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>o?.(),children:"\u53D6\u6D88"}),(0,C.jsx)("button",{ref:d,className:`dsh-mymem-btn${n?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>r?.(),children:s})]})]})}),document.body)}var z=require("react/jsx-runtime");function Re({onChanged:e}={}){let[a,s]=j.useState(null),[n,r]=j.useState(""),[o,d]=j.useState(""),[h,p]=j.useState(""),[S,y]=j.useState(!1),[k,v]=j.useState(!1),f=j.useRef(null);j.useEffect(()=>()=>{f.current&&clearTimeout(f.current)},[]);let b=j.useCallback(async()=>{try{let i=await xe();s(i),r("")}catch(i){r(`\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A${i?.message||i}`)}},[]);j.useEffect(()=>{b()},[b]);function E(i){d(i),f.current&&clearTimeout(f.current),f.current=setTimeout(()=>{f.current=null,d("")},2600)}async function g(){r("");try{await we()}catch(i){r(`\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A${i?.message||i}`)}}async function m(i){v(!0),r("");try{let P=await ve(i);y(!1),p(String(P?.movedFrom??"")),await b(),E("\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362"),e?.()}catch(P){throw new Error(String(P?.message||P))}finally{v(!1)}}return(0,z.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,z.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,z.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5168\u5C40\u8BB0\u5FC6\u3001\u9879\u76EE\u8BB0\u5FC6\u90FD\u5B58\u5728\u8FD9\u4E2A\u76EE\u5F55\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,z.jsx)("div",{className:"dsh-mymem-settings-path",title:a?.dataDir||"",children:a?.dataDir||(a?"\uFF08\u7A7A\uFF09":"\u8BFB\u53D6\u4E2D\u2026")}),(0,z.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,z.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>void g(),children:"\u6253\u5F00\u76EE\u5F55"}),(0,z.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>{r(""),y(!0)},children:"\u66F4\u6539\u76EE\u5F55"}),o?(0,z.jsx)("span",{className:"dsh-mymem-ok",children:o}):null]}),a?.defaultDataDir?(0,z.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",a.defaultDataDir]}):null,h?(0,z.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",h,"\uFF1B\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u624B\u52A8\u590D\u5236\u8FC7\u6765\u3002"]}):null,n?(0,z.jsx)("div",{className:"dsh-mymem-error",children:n}):null,S?(0,z.jsx)(H,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:"\u586B\u4E00\u4E2A\u7EDD\u5BF9\u8DEF\u5F84\uFF1B\u7559\u7A7A\u8868\u793A\u6062\u590D\u9ED8\u8BA4\u76EE\u5F55\u3002\u5207\u6362\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u8FC1\u79FB\u3002",label:"\u6570\u636E\u76EE\u5F55",defaultValue:a?.dataDir||"",placeholder:"\u7559\u7A7A = \u9ED8\u8BA4 ~/.dsh/my-memory",confirmText:k?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:m,onCancel:()=>y(!1)}):null]})}var Ce=B(require("react"),1),De=B(require("react-dom"),1),re=require("react/jsx-runtime"),Ze=160,Xe=130;function Ee({menu:e,onClose:a}){if(Ce.useEffect(()=>{if(!e)return;let d=()=>a(),h=p=>{p.key==="Escape"&&a()};return document.addEventListener("mousedown",d),document.addEventListener("keydown",h),window.addEventListener("blur",d),()=>{document.removeEventListener("mousedown",d),document.removeEventListener("keydown",h),window.removeEventListener("blur",d)}},[e,a]),!e||typeof document>"u")return null;let s=window.innerWidth||0,n=window.innerHeight||0,r=Math.max(4,Math.min(e.x,s-Ze-6)),o=Math.max(4,Math.min(e.y,n-Xe-6));return De.createPortal((0,re.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:r,top:o,zIndex:2147483002},onMouseDown:d=>d.stopPropagation(),children:e.items.map(d=>(0,re.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:d.disabled,onClick:()=>{a(),d.onClick?.()},children:d.label},d.label))}),document.body)}function Pe(e,a){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:a}}var Me="dsh-my-memory-style",Qe=`
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
`;function J(){if(typeof document>"u"||document.getElementById(Me))return;let e=document.createElement("style");e.id=Me,e.textContent=Qe,document.head.appendChild(e)}var l=require("react/jsx-runtime"),ea=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],aa=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],ta=/^[A-Za-z0-9._-]{1,40}$/;function Te({close:e}={}){let[a,s]=R.useState("persona"),[n,r]=R.useState("role"),[o,d]=R.useState(null),[h,p]=R.useState(null),[S,y]=R.useState(""),[k,v]=R.useState(""),[f,b]=R.useState(null),[E,g]=R.useState(null),[m,i]=R.useState(null),[P,O]=R.useState(0),w=R.useRef(null);R.useEffect(()=>(J(),()=>{w.current&&clearTimeout(w.current)}),[]);let Q=R.useCallback(t=>{v(t),w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{w.current=null,v("")},1600)},[]),u=R.useCallback(async()=>{let t=await te();return d(t),p(c=>c&&t.items.some(D=>D.id===c)?c:t.activeId??t.items[0]?.id??null),t},[]);R.useEffect(()=>{let t=!0;return(async()=>{try{let c=await te();if(!t)return;d(c),p(c.activeId??c.items[0]?.id??null),X({scope:"global"}).then(D=>{t&&g(D.items.length)}).catch(()=>{})}catch(c){t&&y(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${c?.message||c}`)}})(),()=>{t=!1}},[]);async function M(t){y("");try{await t(),await u()}catch(c){y(String(c?.message||c))}}let L=R.useCallback(()=>b(null),[]);function K(){i({kind:"create",onCancel:()=>i(null),onSubmit:async t=>{y("");try{let c=await me({dir:t});i(null),await u(),c?.id&&p(c.id),r("role")}catch(c){let D=String(c?.message||c);throw y(`\u65B0\u5EFA\u5931\u8D25\uFF1A${D}`),new Error(D)}}})}function ne(t){i({kind:"rename",persona:t,onCancel:()=>i(null),onSubmit:async c=>{await Z(t.id,{name:c}),i(null),await u()}})}function je(t){i({kind:"delete",persona:t,onCancel:()=>i(null),onOk:async()=>{i(null),await M(()=>le(t.id))}})}async function Ie(t){y("");try{let c=await ue(t.id);d(D=>D&&{...D,items:D.items.map(ae=>ae.id===c.id?{...ae,...c}:ae)}),O(D=>D+1),Q("\u5DF2\u66F4\u65B0")}catch(c){y(`\u66F4\u65B0\u5931\u8D25\uFF1A${c?.message||c}`)}}function Oe(t){return[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:!!o&&o.activeId===t.id,onClick:()=>M(()=>de(t.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>M(async()=>{await ce(t.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>void Ie(t)},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>je(t)}]}async function Le(){y("");try{await u(),O(t=>t+1)}catch(t){y(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${t?.message||t}`)}}let V=o?.items.find(t=>t.id===h)||null,ee=o?.items.find(t=>t.id===o.activeId)||V,Ae=[E===null?"":`${E} \u6761\u957F\u671F\u8BB0\u5FC6`,ee?`\u5F53\u524D\u89D2\u8272 ${ee.name||ee.id}`:""].filter(Boolean).join(" \xB7 ");return(0,l.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,l.jsxs)("div",{className:"dsh-mymem-head",children:[(0,l.jsx)("div",{className:"dsh-mymem-title",children:"\u8BB0\u5FC6"}),(0,l.jsx)("div",{className:"dsh-mymem-sub",children:Ae}),(0,l.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,l.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:ea.map(t=>(0,l.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":a===t.key,"data-active":a===t.key?"1":"0",onClick:()=>s(t.key),children:t.label},t.key))}),a==="settings"?(0,l.jsx)(Re,{onChanged:Le}):(0,l.jsx)(l.Fragment,{children:(0,l.jsxs)("div",{className:"dsh-mymem-body",children:[(0,l.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,l.jsxs)("div",{className:"dsh-mymem-toolbar-left",children:[(0,l.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:K,children:"\uFF0B \u65B0\u5EFA"}),k?(0,l.jsx)("span",{className:"dsh-mymem-ok",children:k}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-toolbar-right",children:(0,l.jsx)("div",{className:"dsh-mymem-inner-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:aa.map(t=>(0,l.jsx)("button",{className:"dsh-mymem-inner-tab",type:"button",role:"tab","aria-selected":n===t.key,"data-active":n===t.key?"1":"0",onClick:()=>r(t.key),children:t.label},t.key))})})]}),S?(0,l.jsx)("div",{className:"dsh-mymem-error",children:S}):null,(0,l.jsxs)("div",{className:"dsh-mymem-split",children:[(0,l.jsx)("div",{className:"dsh-mymem-side",children:(0,l.jsx)("div",{className:"dsh-mymem-cards",children:o?o.items.map(t=>(0,l.jsxs)("div",{className:"dsh-mymem-row","data-active":t.id===h?"1":"0",onClick:()=>p(t.id),onContextMenu:c=>b(Pe(c,Oe(t))),children:[(0,l.jsx)("span",{className:"dsh-mymem-avatar",children:(t.name||t.id).slice(0,1)}),(0,l.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,l.jsxs)("div",{className:"dsh-mymem-name",title:t.name||t.id,children:[t.name||t.id,o.activeId===t.id?(0,l.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-path",title:t.path||t.display,children:t.display})]})]},t.id)):(0,l.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,l.jsx)("div",{className:"dsh-mymem-main",children:n==="memory"?(0,l.jsx)(Se,{},`raw:${P}`):V?(0,l.jsx)(ye,{persona:V,onSaved:t=>d(c=>c&&{...c,items:c.items.map(D=>D.id===t.id?{...D,...t}:D)})},`${V.id}:${P}`):(0,l.jsx)("div",{className:"dsh-mymem-hint",children:o?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})}),(0,l.jsx)(Ee,{menu:f,onClose:L}),m?.kind==="create"?(0,l.jsx)(H,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:t=>ta.test(t)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:m.onSubmit,onCancel:m.onCancel}):null,m?.kind==="rename"?(0,l.jsx)(H,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:m.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:m.onSubmit,onCancel:m.onCancel}):null,m?.kind==="delete"?(0,l.jsx)(Ne,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${m.persona.name||m.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:m.onOk,onCancel:m.onCancel}):null]})}var Ia=require("react"),G=require("react/jsx-runtime");function sa({size:e=16}){return(0,G.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,G.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,G.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,G.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function $e({size:e=16}){return(0,G.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,G.jsx)(sa,{size:e})})}var T=B(require("react"),1);var x=require("react/jsx-runtime"),ra=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function ze(){let[e,a]=T.useState("global"),[s,n]=T.useState(null),[r,o]=T.useState([]),[d,h]=T.useState(!1),[p,S]=T.useState(!1),[y,k]=T.useState(""),[v,f]=T.useState(""),[b,E]=T.useState(""),g=T.useRef(0),m=s?.projectSlug||null,i=T.useCallback(async u=>{let M=++g.current;h(!0);try{let L=await he();if(M!==g.current)return;n(L);let K=L.projectSlug;if(u==="project"&&!K){o([]),k("");return}let ne=await X({scope:u,project:K});if(M!==g.current)return;o(ne.items),k("")}catch(L){if(M!==g.current)return;k(`\u52A0\u8F7D\u5931\u8D25\uFF1A${L?.message||L}`)}finally{M===g.current&&h(!1)}},[]);T.useEffect(()=>{J()},[]),T.useEffect(()=>{i(e)},[i,e]);async function P(u){u?.preventDefault?.();let M=b.trim();if(!(!M||p)){S(!0),k(""),f("");try{await fe({scope:e,text:M,...e==="project"&&m?{project:m}:{}}),E(""),f("\u8BB0\u4F4F\u5566"),await i(e),setTimeout(()=>f(""),1500)}catch(L){k(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${L?.message||L}`)}finally{S(!1)}}}async function O(u){k("");try{await ge(u),o(M=>M.filter(L=>L.id!==u)),await i(e)}catch(M){k(`\u5220\u9664\u5931\u8D25\uFF1A${M?.message||M}`),await i(e)}}let w=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${s?.projectName||"\u5F53\u524D\u9879\u76EE"}`,Q=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":m?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,x.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,x.jsxs)("div",{className:"dsh-mymem-head",children:[(0,x.jsx)("span",{className:"dsh-mymem-scope-name",children:w}),(0,x.jsx)("span",{className:"dsh-mymem-datadir",title:s?.dataDir||"",children:s?.dataDir?`\u6570\u636E\u76EE\u5F55 ${s.dataDir}`:""}),(0,x.jsx)("span",{className:"dsh-mymem-spacer"}),(0,x.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:d,onClick:()=>void i(e),children:d?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,x.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:ra.map(u=>(0,x.jsxs)("button",{className:`dsh-mymem-seg-btn${e===u.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===u.key,onClick:()=>a(u.key),children:[u.label,s?` ${u.key==="global"?s.globalCount:s.projectCount}`:""]},u.key))}),e==="global"?(0,x.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,y?(0,x.jsx)("div",{className:"dsh-mymem-error",children:y}):null,(0,x.jsx)("div",{className:"dsh-mymem-list",children:r.length===0?(0,x.jsx)("div",{className:"dsh-mymem-empty",children:d?"\u8BFB\u53D6\u4E2D\u2026":Q}):r.map(u=>(0,x.jsxs)("div",{className:"dsh-mymem-item",children:[(0,x.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,x.jsx)("div",{className:"dsh-mymem-item-summary",title:u.summary,children:u.summary}),(0,x.jsxs)("div",{className:"dsh-mymem-item-date",children:[u.date||"\u672A\u77E5\u65E5\u671F",u.title&&u.title!==u.summary?` \xB7 ${u.title}`:""]})]}),(0,x.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void O(u.id),children:"\xD7"})]},u.id))}),(0,x.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:P,children:[(0,x.jsx)("input",{className:"dsh-mymem-input",type:"text",value:b,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:u=>E(u.target.value)}),(0,x.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:p||!b.trim(),children:p?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),v?(0,x.jsx)("span",{className:"dsh-mymem-ok",children:v}):null]})]})}var oa="my-memory",na=["slots","layout"],q="[my-memory]",oe="my-memory";function ia(e){return{close(){try{e.layout.selectPanel(null)}catch(a){console.warn(q,"selectPanel(null) \u5931\u8D25",a)}}}}function ma(e,a,s,n,r,o){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(a,()=>e.slots.register({name:a,id:s,order:n,label:r},o)),`my-memory.${a}`),console.info(q,`\u5DF2\u6CE8\u518C ${a} \u2192 ${r()}`),!0}catch(d){return console.warn(q,`\u6CE8\u518C ${a} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,d),!1}}function la(e,a){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let s=e.slots.register({name:"main",key:oe,inject:()=>({close:a.close})},Te),n=null;try{n=e.slots.register({name:"sidebar.panellist",id:oe,order:43,label:()=>"\u8BB0\u5FC6"},$e)}catch(r){try{s()}catch{}throw r}return()=>{try{n()}finally{try{s()}catch{}}}})),"my-memory.sidebar"),console.info(q,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(s){return console.warn(q,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",s),!1}}function da(e){J(),la(e,ia(e)),ma(e,"conversation.view",oe,40,()=>"\u8BB0\u5FC6",ze)}

		return module.exports;
	}
});
