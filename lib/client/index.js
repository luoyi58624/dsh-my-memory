window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var ve=Object.create;var B=Object.defineProperty;var we=Object.getOwnPropertyDescriptor;var Se=Object.getOwnPropertyNames;var ke=Object.getPrototypeOf,Ne=Object.prototype.hasOwnProperty;var Re=(e,t)=>{for(var a in t)B(e,a,{get:t[a],enumerable:!0})},K=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Se(t))!Ne.call(e,r)&&r!==a&&B(e,r,{get:()=>t[r],enumerable:!(o=we(t,r))||o.enumerable});return e};var I=(e,t,a)=>(a=e!=null?ve(ke(e)):{},K(t||!e||!e.__esModule?B(a,"default",{value:e,enumerable:!0}):a,e)),Ee=e=>K(B({},"__esModule",{value:!0}),e);var Fe={};Re(Fe,{apply:()=>He,inject:()=>Be,name:()=>Ue});module.exports=Ee(Fe);var C=I(require("react"),1);var P=I(require("react"),1);var Ce="/my-memory/api";async function A(e,t){let a=await fetch(`${Ce}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!a.ok){let n=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw n.status=a.status,n.body=r,n}return r}function Y(e){return{id:String(e?.id??""),name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0}}async function J(){let e=await A("/personas"),t=Array.isArray(e?.items)?e.items.map(Y):[],a=e?.activeId?String(e.activeId):t[0]?.id??null;return{items:t,activeId:a}}async function X(e){let t=await A("/personas",{method:"POST",body:JSON.stringify({name:String(e?.name??"")})});return Y(t)}async function W(e,t){let a=await A(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(t??{})});return Y(a)}function Z(e){return A(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function Q(e){return A(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function ee(e){return A("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??"")})})}var R=require("react/jsx-runtime"),Me={display:"flex",alignItems:"center",gap:10,minHeight:34},Te={flex:"0 0 72px",minWidth:0,fontSize:12.5,fontWeight:600,color:"var(--dsw-alias-label-primary, #e8ecf7)"},Pe={flex:"1 1 auto",minWidth:0,display:"flex",alignItems:"center",gap:8},je={display:"flex",flexDirection:"column",justifyContent:"center",minWidth:0},De=1600;function te({persona:e,onSaved:t}={}){let[a,o]=P.useState(String(e?.name??"")),[r,n]=P.useState(String(e?.body??"")),[m,p]=P.useState(!1),[u,S]=P.useState(""),[k,i]=P.useState(""),h=P.useRef({name:String(e?.name??""),body:String(e?.body??"")}),M=P.useRef(!1),x=P.useRef(null);P.useEffect(()=>()=>{x.current&&clearTimeout(x.current)},[]);async function j(v){if(M.current)return;let y={name:v.name!==void 0?String(v.name):a,body:v.body!==void 0?String(v.body):r};if(!(y.name===h.current.name&&y.body===h.current.body)){M.current=!0,p(!0),i("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let b={};y.name!==h.current.name&&(b.name=y.name),y.body!==h.current.body&&(b.body=y.body);let O=await W(e.id,b),D={name:String(O?.name??y.name),body:String(O?.body??y.body)};h.current=D,o(D.name),n(D.body),t?.({...D,id:e.id,updated:Number(O?.updated)||0}),S("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),x.current&&clearTimeout(x.current),x.current=setTimeout(()=>{x.current=null,S("")},De)}catch(b){i(`\u4FDD\u5B58\u5931\u8D25\uFF1A${b?.message||b}`)}finally{M.current=!1,p(!1)}}}return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)("div",{style:je,children:(0,R.jsxs)("div",{style:Me,children:[(0,R.jsx)("span",{style:Te,title:"\u4FDD\u5B58\u540E\u663E\u793A\u5728\u5BF9\u8BDD\u9876\u90E8",children:"\u540D\u5B57"}),(0,R.jsx)("div",{style:Pe,children:(0,R.jsx)("input",{className:"dsh-mymem-input",style:{width:"100%"},value:a,placeholder:"\u89D2\u8272\u540D",spellCheck:!1,onChange:v=>o(v.target.value),onBlur:()=>void j({name:a})})})]})}),(0,R.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",m?" \xB7 \u4FDD\u5B58\u4E2D\u2026":u?` \xB7 ${u}`:""]}),k?(0,R.jsx)("div",{className:"dsh-mymem-error",children:k}):null,(0,R.jsxs)("label",{className:"dsh-mymem-field",children:[(0,R.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,R.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:r,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:v=>n(v.target.value),onBlur:()=>void j({body:r})})]})]})}var E=I(require("react"),1);var ze="/my-memory/api";async function G(e,t){let a=await fetch(`${ze}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!a.ok){let n=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw n.status=a.status,n.body=r,n}return r}async function ae(){let e=await G("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function re(e){let t=e?.scope==="project"?"project":"global",a=new URLSearchParams({scope:t});t==="project"&&e?.project&&a.set("project",String(e.project));let o=await G(`/memory?${a.toString()}`);return{items:(Array.isArray(o?.items)?o.items:[]).map(n=>({id:String(n?.id??""),summary:String(n?.summary??n?.text??""),date:String(n?.date??""),title:n?.title?String(n.title):"",tags:Array.isArray(n?.tags)?n.tags:[]}))}}async function se(){let e=await G("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??"")}}function oe(e){return G("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function ne(e){return G(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}var g=require("react/jsx-runtime");function $e(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function ie(){let[e,t]=E.useState(null),[a,o]=E.useState(!0),[r,n]=E.useState(""),[m,p]=E.useState(""),[u,S]=E.useState(null),[k,i]=E.useState(!1),h=E.useRef(0),M=E.useRef(null);E.useEffect(()=>{M.current=u},[u]);let x=E.useCallback(async()=>{let y=++h.current;o(!0);try{let b=await se();if(y!==h.current)return;t({path:String(b?.path??""),text:String(b?.text??"")}),n("")}catch(b){if(y!==h.current)return;n(`\u8BFB\u53D6\u5931\u8D25\uFF1A${b?.message||b}`)}finally{y===h.current&&o(!1)}},[]);E.useEffect(()=>{x()},[x]);let j=u!==null;async function v(){if(!k){if(u===(e?.text??"")){S(null);return}i(!0),n("");try{await ee({scope:"global",text:u??""}),await x(),S(null),p("\u5DF2\u4FDD\u5B58"),setTimeout(()=>p(""),1600)}catch(y){n(`\u4FDD\u5B58\u5931\u8D25\uFF1A${y?.message||y}`)}finally{i(!1)}}}return(0,g.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,g.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,g.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${$e(e.path)}`:""}),(0,g.jsx)("span",{className:"dsh-mymem-spacer"}),j?null:(0,g.jsxs)(g.Fragment,{children:[m?(0,g.jsx)("span",{className:"dsh-mymem-ok",children:m}):null,(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:a||!e,onClick:()=>{p(""),n(""),S(e?.text??"")},children:"\u7F16\u8F91"}),(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:a,onClick:()=>void x(),children:a?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]})]}),r?(0,g.jsx)("div",{className:"dsh-mymem-error",children:r}):null,j?(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:u,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C",onChange:y=>S(y.target.value)}),(0,g.jsxs)("div",{className:"dsh-mymem-raw-actions",children:[(0,g.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:k,onClick:()=>{S(null),n("")},children:"\u53D6\u6D88"}),(0,g.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:k,onClick:()=>void v(),children:k?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"})]})]}):(0,g.jsx)("pre",{className:"dsh-mymem-raw-pre",children:e?.text||(a?"":"\uFF08\u8FD9\u4E2A\u6587\u4EF6\u8FD8\u662F\u7A7A\u7684\uFF09")})]})}var me=I(require("react"),1),le=I(require("react-dom"),1),H=require("react/jsx-runtime"),Ie=160,Le=130;function de({menu:e,onClose:t}){if(me.useEffect(()=>{if(!e)return;let m=()=>t(),p=u=>{u.key==="Escape"&&t()};return document.addEventListener("mousedown",m),document.addEventListener("keydown",p),window.addEventListener("blur",m),()=>{document.removeEventListener("mousedown",m),document.removeEventListener("keydown",p),window.removeEventListener("blur",m)}},[e,t]),!e||typeof document>"u")return null;let a=window.innerWidth||0,o=window.innerHeight||0,r=Math.max(4,Math.min(e.x,a-Ie-6)),n=Math.max(4,Math.min(e.y,o-Le-6));return le.createPortal((0,H.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:r,top:n,zIndex:2147483002},onMouseDown:m=>m.stopPropagation(),children:e.items.map(m=>(0,H.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:m.disabled,onClick:()=>{t(),m.onClick?.()},children:m.label},m.label))}),document.body)}function ce(e,t){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:t}}var $=I(require("react"),1),F=I(require("react-dom"),1),w=require("react/jsx-runtime");function ue(e,t){let a=$.useRef(null);$.useEffect(()=>{a.current=typeof document<"u"?document.activeElement:null;let o=t.current;return o&&(o.focus(),typeof o.select=="function"&&o.select()),()=>{let r=a.current;if(r&&typeof r.focus=="function"&&document.contains(r))try{r.focus()}catch{}}},[t]),$.useEffect(()=>{let o=r=>{r.key==="Escape"&&e?.()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[e])}function pe({title:e,label:t,defaultValue:a="",placeholder:o,confirmText:r="\u786E\u5B9A",onOk:n,onCancel:m}){let[p,u]=$.useState(a),S=$.useRef(null);ue(m,S);let k=()=>{let i=p.trim();i&&n?.(i)};return typeof document>"u"?null:F.createPortal((0,w.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:i=>{i.target===i.currentTarget&&m?.()},children:(0,w.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,w.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,w.jsx)("div",{className:"dsh-mymem-modal-label",children:t}):null,(0,w.jsx)("input",{ref:S,className:"dsh-mymem-input",value:p,placeholder:o||"",spellCheck:!1,onChange:i=>u(i.target.value),onKeyDown:i=>{i.key==="Enter"&&(i.preventDefault(),k())}}),(0,w.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,w.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>m?.(),children:"\u53D6\u6D88"}),(0,w.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!p.trim(),onClick:k,children:r})]})]})}),document.body)}function ye({title:e,message:t,confirmText:a="\u786E\u5B9A",danger:o,onOk:r,onCancel:n}){let m=$.useRef(null);return ue(n,m),$.useEffect(()=>{let p=u=>{u.key==="Enter"&&(u.preventDefault(),r?.())};return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[r]),typeof document>"u"?null:F.createPortal((0,w.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:p=>{p.target===p.currentTarget&&n?.()},children:(0,w.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,w.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,w.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,(0,w.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,w.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>n?.(),children:"\u53D6\u6D88"}),(0,w.jsx)("button",{ref:m,className:`dsh-mymem-btn${o?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>r?.(),children:a})]})]})}),document.body)}var fe="dsh-my-memory-style",Oe=`
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
  line-height: 1.5;
}

/* ---------- \u9762\u677F\uFF1A\u5DE6\u53F3\u5206\u680F\uFF08\u7167\u6284\u539F\u63D2\u4EF6 .dsh-memory-split\uFF09 ---------- */

.dsh-mymem-panel {
  background: var(--dsw-alias-bg-base, #16181d);
  padding: 12px 14px;
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
.dsh-mymem-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 10.5px;
  font-weight: 400;
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

/* \u5185\u9875 tab \u884C */
.dsh-mymem-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 0 0 auto;
}
.dsh-mymem-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.dsh-mymem-chip {
  appearance: none;
  font: inherit;
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.2));
}
.dsh-mymem-chip:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-chip[data-active="1"] {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  border-color: var(--dsw-alias-brand-primary, #4f7dff);
  background: var(--dsw-alias-bg-layer-2, #24272f);
}
.dsh-mymem-spacer { flex: 1 1 auto; }

/* \u5173\u95ED\u6309\u94AE\uFF1A\u539F\u63D2\u4EF6\u9762\u677F\u6CA1\u6709\uFF08\u5B83\u7684\u5173\u95ED\u5728\u5916\u58F3\u5C42\uFF09\uFF0C\u4F46\u6211\u4EEC\u8981\u80FD\u9000\u56DE\u4F1A\u8BDD */
.dsh-mymem-close {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
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
  min-height: 220px;
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

/* ---------- \u5DE6\u5217\u9876\u90E8\u300C\uFF0B \u65B0\u5EFA\u300D ---------- */

.dsh-mymem-side-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

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
`;function _(){if(typeof document>"u"||document.getElementById(fe))return;let e=document.createElement("style");e.id=fe,e.textContent=Oe,document.head.appendChild(e)}var c=require("react/jsx-runtime"),Ae=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u5168\u5C40\u8BB0\u5FC6"}];function he({close:e}={}){let[t,a]=C.useState("role"),[o,r]=C.useState(null),[n,m]=C.useState(null),[p,u]=C.useState(""),[S,k]=C.useState(null),[i,h]=C.useState(null);C.useEffect(()=>{_()},[]);let M=C.useCallback(async()=>{let s=await J();return r(s),m(d=>d&&s.items.some(l=>l.id===d)?d:s.activeId??s.items[0]?.id??null),s},[]);C.useEffect(()=>{let s=!0;return(async()=>{try{let d=await J();if(!s)return;r(d),m(d.activeId??d.items[0]?.id??null)}catch(d){s&&u(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${d?.message||d}`)}})(),()=>{s=!1}},[]);async function x(s){u("");try{await s(),await M()}catch(d){u(String(d?.message||d))}}let j=C.useCallback(()=>k(null),[]);function v(){h({kind:"prompt",title:"\u65B0\u5EFA\u89D2\u8272",label:"\u540D\u5B57",placeholder:"\u7ED9\u8FD9\u5F20\u5361\u8D77\u4E2A\u540D\u5B57",confirmText:"\u521B\u5EFA",onOk:async s=>{h(null),u("");try{let d=await X({name:s});await M(),d?.id&&m(d.id),a("role")}catch(d){u(`\u65B0\u5EFA\u5931\u8D25\uFF1A${d?.message||d}`)}}})}function y(s){h({kind:"prompt",title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",label:"\u540D\u5B57",defaultValue:s.name||"",confirmText:"\u4FDD\u5B58",onOk:async d=>{h(null),await x(()=>W(s.id,{name:d}))}})}function b(s){h({kind:"confirm",title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${s.name||s.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:async()=>{h(null),await x(()=>Z(s.id))}})}function O(s){return[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:!!o&&o.activeId===s.id,onClick:()=>x(()=>Q(s.id))},{label:"\u91CD\u547D\u540D",onClick:()=>y(s)},{label:"\u5220\u9664",onClick:()=>b(s)}]}let D=o?.items.find(s=>s.id===n)||null;return(0,c.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,c.jsxs)("div",{className:"dsh-mymem-split",children:[(0,c.jsxs)("div",{className:"dsh-mymem-side",children:[(0,c.jsx)("div",{className:"dsh-mymem-side-head",children:(0,c.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:v,children:"\uFF0B \u65B0\u5EFA"})}),(0,c.jsx)("div",{className:"dsh-mymem-cards",children:o?o.items.map(s=>(0,c.jsxs)("div",{className:"dsh-mymem-row","data-active":s.id===n?"1":"0",onClick:()=>m(s.id),onContextMenu:d=>k(ce(d,O(s))),children:[(0,c.jsx)("span",{className:"dsh-mymem-avatar",children:(s.name||s.id).slice(0,1)}),(0,c.jsx)("div",{className:"dsh-mymem-rowmain",children:(0,c.jsxs)("div",{className:"dsh-mymem-name",title:s.name||s.id,children:[s.name||s.id,o.activeId===s.id?(0,c.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]})})]},s.id)):(0,c.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})]}),(0,c.jsxs)("div",{className:"dsh-mymem-main",children:[(0,c.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,c.jsx)("div",{className:"dsh-mymem-chips",role:"tablist","aria-label":"\u9762\u677F\u5206\u9875",children:Ae.map(s=>(0,c.jsx)("button",{className:"dsh-mymem-chip",type:"button",role:"tab","aria-selected":t===s.key,"data-active":t===s.key?"1":"0",onClick:()=>a(s.key),children:s.label},s.key))}),(0,c.jsx)("span",{className:"dsh-mymem-spacer"}),typeof e=="function"?(0,c.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),p?(0,c.jsx)("div",{className:"dsh-mymem-error",children:p}):null,t==="memory"?(0,c.jsx)(ie,{}):D?(0,c.jsx)(te,{persona:D,onSaved:s=>r(d=>d&&{...d,items:d.items.map(l=>l.id===s.id?{...l,...s}:l)})},D.id):(0,c.jsx)("div",{className:"dsh-mymem-hint",children:o?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})]})]}),(0,c.jsx)(de,{menu:S,onClose:j}),i?.kind==="prompt"?(0,c.jsx)(pe,{title:i.title,label:i.label,defaultValue:i.defaultValue,placeholder:i.placeholder,confirmText:i.confirmText,onOk:i.onOk,onCancel:()=>h(null)}):null,i?.kind==="confirm"?(0,c.jsx)(ye,{title:i.title,message:i.message,confirmText:i.confirmText,danger:i.danger,onOk:i.onOk,onCancel:()=>h(null)}):null]})}var ut=require("react"),L=require("react/jsx-runtime");function _e({size:e=16}){return(0,L.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,L.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,L.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,L.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function be({size:e=16}){return(0,L.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,L.jsx)(_e,{size:e})})}var N=I(require("react"),1);var f=require("react/jsx-runtime"),Ge=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function ge(){let[e,t]=N.useState("global"),[a,o]=N.useState(null),[r,n]=N.useState([]),[m,p]=N.useState(!1),[u,S]=N.useState(!1),[k,i]=N.useState(""),[h,M]=N.useState(""),[x,j]=N.useState(""),v=N.useRef(0),y=a?.projectSlug||null,b=N.useCallback(async l=>{let T=++v.current;p(!0);try{let z=await ae();if(T!==v.current)return;o(z);let q=z.projectSlug;if(l==="project"&&!q){n([]),i("");return}let xe=await re({scope:l,project:q});if(T!==v.current)return;n(xe.items),i("")}catch(z){if(T!==v.current)return;i(`\u52A0\u8F7D\u5931\u8D25\uFF1A${z?.message||z}`)}finally{T===v.current&&p(!1)}},[]);N.useEffect(()=>{_()},[]),N.useEffect(()=>{b(e)},[b,e]);async function O(l){l?.preventDefault?.();let T=x.trim();if(!(!T||u)){S(!0),i(""),M("");try{await oe({scope:e,text:T,...e==="project"&&y?{project:y}:{}}),j(""),M("\u8BB0\u4F4F\u5566"),await b(e),setTimeout(()=>M(""),1500)}catch(z){i(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${z?.message||z}`)}finally{S(!1)}}}async function D(l){i("");try{await ne(l),n(T=>T.filter(z=>z.id!==l)),await b(e)}catch(T){i(`\u5220\u9664\u5931\u8D25\uFF1A${T?.message||T}`),await b(e)}}let s=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${a?.projectName||"\u5F53\u524D\u9879\u76EE"}`,d=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":y?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,f.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,f.jsxs)("div",{className:"dsh-mymem-head",children:[(0,f.jsx)("span",{className:"dsh-mymem-scope-name",children:s}),(0,f.jsx)("span",{className:"dsh-mymem-datadir",title:a?.dataDir||"",children:a?.dataDir?`\u6570\u636E\u76EE\u5F55 ${a.dataDir}`:""}),(0,f.jsx)("span",{className:"dsh-mymem-spacer"}),(0,f.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:m,onClick:()=>void b(e),children:m?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,f.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:Ge.map(l=>(0,f.jsxs)("button",{className:`dsh-mymem-seg-btn${e===l.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===l.key,onClick:()=>t(l.key),children:[l.label,a?` ${l.key==="global"?a.globalCount:a.projectCount}`:""]},l.key))}),e==="global"?(0,f.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,k?(0,f.jsx)("div",{className:"dsh-mymem-error",children:k}):null,(0,f.jsx)("div",{className:"dsh-mymem-list",children:r.length===0?(0,f.jsx)("div",{className:"dsh-mymem-empty",children:m?"\u8BFB\u53D6\u4E2D\u2026":d}):r.map(l=>(0,f.jsxs)("div",{className:"dsh-mymem-item",children:[(0,f.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,f.jsx)("div",{className:"dsh-mymem-item-summary",title:l.summary,children:l.summary}),(0,f.jsxs)("div",{className:"dsh-mymem-item-date",children:[l.date||"\u672A\u77E5\u65E5\u671F",l.title&&l.title!==l.summary?` \xB7 ${l.title}`:""]})]}),(0,f.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void D(l.id),children:"\xD7"})]},l.id))}),(0,f.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:O,children:[(0,f.jsx)("input",{className:"dsh-mymem-input",type:"text",value:x,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:l=>j(l.target.value)}),(0,f.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:u||!x.trim(),children:u?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),h?(0,f.jsx)("span",{className:"dsh-mymem-ok",children:h}):null]})]})}var Ue="my-memory",Be=["slots","layout"],U="[my-memory]",V="my-memory";function We(e){return{close(){try{e.layout.selectPanel(null)}catch(t){console.warn(U,"selectPanel(null) \u5931\u8D25",t)}}}}function Ye(e,t,a,o,r,n){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:o,label:r},n)),`my-memory.${t}`),console.info(U,`\u5DF2\u6CE8\u518C ${t} \u2192 ${r()}`),!0}catch(m){return console.warn(U,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,m),!1}}function Je(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:V,inject:()=>({close:t.close})},he),o=null;try{o=e.slots.register({name:"sidebar.panellist",id:V,order:43,label:()=>"\u8BB0\u5FC6"},be)}catch(r){try{a()}catch{}throw r}return()=>{try{o()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(U,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(U,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}function He(e){_(),Je(e,We(e)),Ye(e,"conversation.view",V,40,()=>"\u8BB0\u5FC6",ge)}

		return module.exports;
	}
});
