window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Z=Object.create;var P=Object.defineProperty;var ee=Object.getOwnPropertyDescriptor;var ae=Object.getOwnPropertyNames;var te=Object.getPrototypeOf,se=Object.prototype.hasOwnProperty;var re=(e,t)=>{for(var a in t)P(e,a,{get:t[a],enumerable:!0})},O=(e,t,a,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of ae(t))!se.call(e,o)&&o!==a&&P(e,o,{get:()=>t[o],enumerable:!(s=ee(t,o))||s.enumerable});return e};var I=(e,t,a)=>(a=e!=null?Z(te(e)):{},O(t||!e||!e.__esModule?P(a,"default",{value:e,enumerable:!0}):a,e)),oe=e=>O(P({},"__esModule",{value:!0}),e);var ge={};re(ge,{apply:()=>fe,inject:()=>ye,name:()=>pe});module.exports=oe(ge);var A=I(require("react"),1);var p=I(require("react"),1);var me="/my-memory/api";async function j(e,t){let a=await fetch(`${me}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),s=await a.text(),o;try{o=s?JSON.parse(s):null}catch{o={error:s.slice(0,500)}}if(!a.ok){let n=new Error(o&&(o.error||o.message)||`HTTP ${a.status}`);throw n.status=a.status,n.body=o,n}return o}function _(){return j("/persona")}function J(e){return j("/persona",{method:"PUT",body:JSON.stringify({name:e?.name??"",body:e?.body??""})})}async function U(){let e=await j("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function q(e){let t=e?.scope==="project"?"project":"global",a=new URLSearchParams({scope:t});t==="project"&&e?.project&&a.set("project",String(e.project));let s=await j(`/memory?${a.toString()}`);return{items:(Array.isArray(s?.items)?s.items:[]).map(n=>({id:String(n?.id??""),summary:String(n?.summary??n?.text??""),date:String(n?.date??""),title:n?.title?String(n.title):"",tags:Array.isArray(n?.tags)?n.tags:[]}))}}function F(e){return j("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function H(e){return j(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}var W="dsh-my-memory-style",ne=`
/* \u9762\u677F\u6839\u5BB9\u5668\u3002
   height:100% + position:relative \u662F\u786C\u6027\u8981\u6C42\uFF1A
   **\u4E0D\u8981** position:absolute \u2014\u2014 \u5916\u58F3\u7ED9\u7684\u5BB9\u5668\u672C\u8EAB\u4E0D\u662F\u5B9A\u4F4D\u5143\u7D20\u65F6\uFF0Cabsolute \u4F1A\u4E00\u8DEF\u627E\u5230\u89C6\u53E3\uFF0C
   \u628A\u6574\u4E2A\u7A97\u53E3\u90FD\u76D6\u4F4F\uFF08\u65E7\u63D2\u4EF6\u8E29\u8FC7\u8FD9\u4E2A\u5751\uFF09\u3002position:relative \u53EA\u4E3A\u8BA9\u5185\u90E8\u7EDD\u5BF9\u5B9A\u4F4D\u951A\u5728\u8FD9\u91CC\u3002 */
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

/* ---------- \u901A\u7528\u5C0F\u4EF6 ---------- */

.dsh-mymem-btn {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12.5px;
  white-space: nowrap;
  cursor: pointer;
  color: #fff;
  background: var(--dsw-alias-button-primary-fill, #3b6fe0);
  transition: background .12s ease, box-shadow .12s ease, opacity .12s ease;
}
.dsh-mymem-btn:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover, #4a7ff0); }
.dsh-mymem-btn:disabled { opacity: .5; cursor: default; }
/* \u6709\u672A\u4FDD\u5B58\u6539\u52A8\u65F6\u7ED9\u6309\u94AE\u52A0\u4E00\u5708\u5149\uFF1A\u4E0D\u7528\u6587\u5B57\u63D0\u793A\u4E5F\u80FD\u4E00\u773C\u770B\u51FA\u300C\u8FD8\u6CA1\u5B58\u300D */
.dsh-mymem-btn--dirty { box-shadow: 0 0 0 3px var(--dsw-alias-interactive-bg-active, rgba(90,140,255,.28)); }

.dsh-mymem-btn--ghost {
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  background: transparent;
  border-color: var(--dsw-alias-border-l1, rgba(150,170,210,.16));
}
.dsh-mymem-btn--ghost:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}

.dsh-mymem-input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  outline: none;
  transition: border-color .12s ease;
}
.dsh-mymem-input:focus { border-color: var(--dsw-alias-border-l2, rgba(150,190,255,.5)); }
.dsh-mymem-input::placeholder { color: var(--dsw-alias-label-tertiary, #6d7686); }

/* \u9519\u8BEF\u4E00\u884C\u7EA2\u5B57\uFF1A\u4EFB\u4F55 fetch \u5931\u8D25\u90FD\u843D\u5230\u8FD9\u91CC\uFF0C\u7EDD\u4E0D\u8BA9\u754C\u9762\u767D\u5C4F */
.dsh-mymem-error {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #f0596b);
  word-break: break-word;
}
.dsh-mymem-ok {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--dsw-alias-state-done-primary, #3ecf8e);
}
.dsh-mymem-hint {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary, #6d7686);
}

/* ---------- \u4FA7\u8FB9\u680F\u5165\u53E3\u70B9\u5F00\u7684\u4E3B\u9762\u677F ---------- */

.dsh-mymem-panel {
  background: var(--dsw-alias-bg-base, #16181d);
}
.dsh-mymem-panel-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 0;
}
.dsh-mymem-panel-title { font-size: 13px; font-weight: 600; }
.dsh-mymem-panel-close {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #6d7686);
  background: transparent;
  cursor: pointer;
  transition: background .12s ease, color .12s ease;
}
.dsh-mymem-panel-close:hover {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}
.dsh-mymem-panel-tabs {
  flex: 0 0 auto;
  display: flex;
  padding: 10px 16px 0;
}
/* min-height:0 \u5FC5\u987B\u7ED9\uFF1A\u5426\u5219\u5B50\u7EC4\u4EF6\u91CC\u7684\u957F\u5217\u8868\u4F1A\u628A\u9762\u677F\u9876\u51FA\u53EF\u89C6\u533A\uFF0C\u6EDA\u52A8\u6761\u53CD\u800C\u6D88\u5931 */
.dsh-mymem-panel-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.dsh-mymem-panel-body > * { min-height: 0; }

/* ---------- \u89D2\u8272\u5361\uFF08\u9762\u677F\u7B2C\u4E00\u9875\uFF1B\u540C\u4E00\u4E2A\u7EC4\u4EF6\u4E5F\u653E\u8FC7\u8BBE\u7F6E\u9875\uFF09 ---------- */

.dsh-mymem-page {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 28px;
}
.dsh-mymem-title { font-size: 15px; font-weight: 600; }
.dsh-mymem-field { display: flex; flex-direction: column; gap: 6px; }
.dsh-mymem-label { font-size: 12px; color: var(--dsw-alias-label-secondary, #9aa3b2); }

/* \u89D2\u8272\u8BBE\u5B9A\uFF1A\u539F\u751F textarea\u3002\u5916\u58F3\u7EC4\u4EF6\u5E93\u6CA1\u6709\u591A\u884C\u8F93\u5165\u6846\uFF0C\u8FD9\u91CC\u53EA\u80FD\u81EA\u5DF1\u6765 */
.dsh-mymem-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 250px;          /* 13px x 1.6 x 12 \u884C \u2248 250px */
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  outline: none;
  resize: vertical;           /* \u53EA\u5141\u8BB8\u5782\u76F4\u62C9\u4F38\uFF0C\u6A2A\u5411\u62C9\u4F38\u4F1A\u628A\u5E03\u5C40\u6491\u70C2 */
  transition: border-color .12s ease;
}
.dsh-mymem-textarea:focus { border-color: var(--dsw-alias-border-l2, rgba(150,190,255,.5)); }

.dsh-mymem-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dsh-mymem-spacer { flex: 1 1 auto; }

/* ---------- B. \u4F1A\u8BDD\u6807\u7B7E\u680F\u300C\u8BB0\u5FC6\u300D ---------- */

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

/* \u5206\u6BB5\u63A7\u4EF6\uFF1A\u5168\u5C40 / \u9879\u76EE */
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
  transition: background .12s ease, color .12s ease;
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

/* \u5220\u9664\u6309\u94AE\u5E73\u65F6\u51E0\u4E4E\u4E0D\u53EF\u89C1\uFF0Chover \u5230\u6761\u76EE\u4E0A\u624D\u663E\u5F62\uFF1A\u5217\u8868\u8981\u80FD\u626B\u8BFB\uFF0C\u4E0D\u80FD\u88AB\u4E00\u6392\u53C9\u53F7\u5360\u6EE1 */
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
  opacity: 0;
  transition: opacity .12s ease, background .12s ease, color .12s ease;
}
.dsh-mymem-item:hover .dsh-mymem-del,
.dsh-mymem-del:focus-visible { opacity: 1; }
.dsh-mymem-del:hover {
  color: #fff;
  background: var(--dsw-alias-state-error-primary, #f0596b);
}

.dsh-mymem-empty {
  padding: 30px 18px;
  text-align: center;
  font-size: 12px;
  line-height: 1.8;
  color: var(--dsw-alias-label-tertiary, #6d7686);
}

.dsh-mymem-compose { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
.dsh-mymem-compose .dsh-mymem-input { flex: 1 1 auto; }
`;function x(){if(typeof document>"u"||document.getElementById(W))return;let e=document.createElement("style");e.id=W,e.textContent=ne,document.head.appendChild(e)}var i=require("react/jsx-runtime"),ie=1800;function G(){let[e,t]=p.useState(""),[a,s]=p.useState(""),[o,n]=p.useState(!1),[b,C]=p.useState(!1),[w,z]=p.useState(""),[$,h]=p.useState(""),S=p.useRef({name:"",body:""}),f=p.useRef(null);p.useEffect(()=>(x(),()=>{f.current&&clearTimeout(f.current)}),[]);let R=p.useCallback(async()=>{try{let d=await _(),c=String(d?.name??""),N=String(d?.body??"");S.current={name:c,body:N},t(c),s(N),h("")}catch(d){h(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${d?.message||d}`)}finally{n(!0)}},[]);p.useEffect(()=>{R()},[R]);let E=e!==S.current.name||a!==S.current.body;async function k(d){if(d?.preventDefault?.(),!b){C(!0),h("");try{let c=await J({name:e,body:a}),N=String(c?.name??e),T=String(c?.body??a);S.current={name:N,body:T},t(N),s(T),z("\u5DF2\u4FDD\u5B58"),f.current&&clearTimeout(f.current),f.current=setTimeout(()=>{f.current=null,z("")},ie)}catch(c){h(`\u4FDD\u5B58\u5931\u8D25\uFF1A${c?.message||c}`)}finally{C(!1)}}}return(0,i.jsx)("div",{className:"dsh-mymem-root","data-dsh-plugin":"my-memory","data-dsh-part":"persona",children:(0,i.jsxs)("form",{className:"dsh-mymem-page",onSubmit:k,children:[(0,i.jsx)("div",{className:"dsh-mymem-title",children:"\u89D2\u8272\u5361"}),(0,i.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u8BBE\u5B9A\u4F1A\u539F\u6837\u6CE8\u5165\u5230\u5BF9\u8BDD\u4E0A\u4E0B\u6587\uFF0C\u5199\u4EC0\u4E48\u5C31\u662F\u4EC0\u4E48\u2014\u2014\u4E0D\u4F1A\u88AB\u6539\u5199\u3001\u4E0D\u4F1A\u88AB\u603B\u7ED3\u3001\u4E5F\u4E0D\u4F1A\u88AB\u6A21\u578B\u89E3\u91CA\u3002"}),(0,i.jsxs)("label",{className:"dsh-mymem-field",children:[(0,i.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,i.jsx)("input",{className:"dsh-mymem-input",type:"text",value:e,placeholder:"\u5979\u600E\u4E48\u79F0\u547C\u81EA\u5DF1",spellCheck:!1,onChange:d=>t(d.target.value)})]}),(0,i.jsxs)("label",{className:"dsh-mymem-field",children:[(0,i.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u8BBE\u5B9A"}),(0,i.jsx)("textarea",{className:"dsh-mymem-textarea",value:a,placeholder:`\u6211\u662F\u8C01\u3001\u8BF4\u8BDD\u4EC0\u4E48\u8C03\u5B50\u3001\u5728\u610F\u4EC0\u4E48\u3001\u4E0D\u8981\u505A\u4EC0\u4E48\u2026\u2026
\u5199\u5728\u8FD9\u91CC\u7684\u6BCF\u4E00\u53E5\u90FD\u4F1A\u51FA\u73B0\u5728\u7CFB\u7EDF\u63D0\u793A\u91CC\u3002`,spellCheck:!1,onChange:d=>s(d.target.value)})]}),$?(0,i.jsx)("div",{className:"dsh-mymem-error",children:$}):null,(0,i.jsxs)("div",{className:"dsh-mymem-actions",children:[(0,i.jsx)("button",{className:`dsh-mymem-btn${E&&!b?" dsh-mymem-btn--dirty":""}`,type:"submit",disabled:b||!o,children:b?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"}),w?(0,i.jsx)("span",{className:"dsh-mymem-ok",children:w}):null,!w&&E?(0,i.jsx)("span",{className:"dsh-mymem-hint",children:"\u6709\u6539\u52A8\u672A\u4FDD\u5B58"}):null,(0,i.jsx)("span",{className:"dsh-mymem-spacer"}),(0,i.jsx)("span",{className:"dsh-mymem-hint",children:"\u6539\u52A8\u4E0D\u4F1A\u81EA\u52A8\u4FDD\u5B58"})]})]})})}var l=I(require("react"),1);var m=require("react/jsx-runtime"),le=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function D(){let[e,t]=l.useState("global"),[a,s]=l.useState(null),[o,n]=l.useState([]),[b,C]=l.useState(!1),[w,z]=l.useState(!1),[$,h]=l.useState(""),[S,f]=l.useState(""),[R,E]=l.useState(""),k=l.useRef(0),d=a?.projectSlug||null,c=l.useCallback(async r=>{let u=++k.current;C(!0);try{let g=await U();if(u!==k.current)return;s(g);let L=g.projectSlug;if(r==="project"&&!L){n([]),h("");return}let X=await q({scope:r,project:L});if(u!==k.current)return;n(X.items),h("")}catch(g){if(u!==k.current)return;h(`\u52A0\u8F7D\u5931\u8D25\uFF1A${g?.message||g}`)}finally{u===k.current&&C(!1)}},[]);l.useEffect(()=>{x()},[]),l.useEffect(()=>{c(e)},[c,e]);async function N(r){r?.preventDefault?.();let u=R.trim();if(!(!u||w)){z(!0),h(""),f("");try{await F({scope:e,text:u,...e==="project"&&d?{project:d}:{}}),E(""),f("\u8BB0\u4F4F\u5566"),await c(e),setTimeout(()=>f(""),1500)}catch(g){h(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${g?.message||g}`)}finally{z(!1)}}}async function T(r){h("");try{await H(r),n(u=>u.filter(g=>g.id!==r)),await c(e)}catch(u){h(`\u5220\u9664\u5931\u8D25\uFF1A${u?.message||u}`),await c(e)}}let K=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${a?.projectName||"\u5F53\u524D\u9879\u76EE"}`,Q=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":d?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,m.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,m.jsxs)("div",{className:"dsh-mymem-head",children:[(0,m.jsx)("span",{className:"dsh-mymem-scope-name",children:K}),(0,m.jsx)("span",{className:"dsh-mymem-datadir",title:a?.dataDir||"",children:a?.dataDir?`\u6570\u636E\u76EE\u5F55 ${a.dataDir}`:""}),(0,m.jsx)("span",{className:"dsh-mymem-spacer"}),(0,m.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:b,onClick:()=>void c(e),children:b?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,m.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:le.map(r=>(0,m.jsxs)("button",{className:`dsh-mymem-seg-btn${e===r.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===r.key,onClick:()=>t(r.key),children:[r.label,a?` ${r.key==="global"?a.globalCount:a.projectCount}`:""]},r.key))}),e==="global"?(0,m.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,$?(0,m.jsx)("div",{className:"dsh-mymem-error",children:$}):null,(0,m.jsx)("div",{className:"dsh-mymem-list",children:o.length===0?(0,m.jsx)("div",{className:"dsh-mymem-empty",children:b?"\u8BFB\u53D6\u4E2D\u2026":Q}):o.map(r=>(0,m.jsxs)("div",{className:"dsh-mymem-item",children:[(0,m.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,m.jsx)("div",{className:"dsh-mymem-item-summary",title:r.summary,children:r.summary}),(0,m.jsxs)("div",{className:"dsh-mymem-item-date",children:[r.date||"\u672A\u77E5\u65E5\u671F",r.title&&r.title!==r.summary?` \xB7 ${r.title}`:""]})]}),(0,m.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void T(r.id),children:"\xD7"})]},r.id))}),(0,m.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:N,children:[(0,m.jsx)("input",{className:"dsh-mymem-input",type:"text",value:R,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:r=>E(r.target.value)}),(0,m.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:w||!R.trim(),children:w?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),S?(0,m.jsx)("span",{className:"dsh-mymem-ok",children:S}):null]})]})}var y=require("react/jsx-runtime"),de=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"memory",label:"\u5168\u5C40 / \u9879\u76EE\u8BB0\u5FC6"}];function V({close:e}={}){let[t,a]=A.useState("persona");return A.useEffect(()=>{x()},[]),(0,y.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,y.jsxs)("div",{className:"dsh-mymem-panel-head",children:[(0,y.jsx)("span",{className:"dsh-mymem-panel-title",children:"\u8BB0\u5FC6"}),(0,y.jsx)("span",{className:"dsh-mymem-spacer"}),typeof e=="function"?(0,y.jsx)("button",{className:"dsh-mymem-panel-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),(0,y.jsx)("div",{className:"dsh-mymem-panel-tabs",children:(0,y.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u9762\u677F\u5206\u9875",children:de.map(s=>(0,y.jsx)("button",{className:`dsh-mymem-seg-btn${t===s.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":t===s.key,onClick:()=>a(s.key),children:s.label},s.key))})}),(0,y.jsx)("div",{className:"dsh-mymem-panel-body",children:t==="persona"?(0,y.jsx)(G,{}):(0,y.jsx)(D,{})})]})}var Te=require("react"),v=require("react/jsx-runtime");function ce({size:e=16}){return(0,v.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,v.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,v.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,v.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function Y({size:e=16}){return(0,v.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,v.jsx)(ce,{size:e})})}var pe="my-memory",ye=["slots","layout"],M="[my-memory]",B="my-memory";function he(e){return{close(){try{e.layout.selectPanel(null)}catch(t){console.warn(M,"selectPanel(null) \u5931\u8D25",t)}}}}function ue(e,t,a,s,o,n){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:s,label:o},n)),`my-memory.${t}`),console.info(M,`\u5DF2\u6CE8\u518C ${t} \u2192 ${o()}`),!0}catch(b){return console.warn(M,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,b),!1}}function be(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:B,inject:()=>({close:t.close})},V),s=null;try{s=e.slots.register({name:"sidebar.panellist",id:B,order:43,label:()=>"\u8BB0\u5FC6"},Y)}catch(o){try{a()}catch{}throw o}return()=>{try{s()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(M,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(M,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}function fe(e){x(),be(e,he(e)),ue(e,"conversation.view",B,40,()=>"\u8BB0\u5FC6",D)}

		return module.exports;
	}
});
