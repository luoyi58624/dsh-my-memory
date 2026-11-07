window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Y=Object.create;var E=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var Q=Object.getOwnPropertyNames;var W=Object.getPrototypeOf,X=Object.prototype.hasOwnProperty;var Z=(e,a)=>{for(var t in a)E(e,t,{get:a[t],enumerable:!0})},D=(e,a,t,i)=>{if(a&&typeof a=="object"||typeof a=="function")for(let o of Q(a))!X.call(e,o)&&o!==t&&E(e,o,{get:()=>a[o],enumerable:!(i=K(a,o))||i.enumerable});return e};var P=(e,a,t)=>(t=e!=null?Y(W(e)):{},D(a||!e||!e.__esModule?E(t,"default",{value:e,enumerable:!0}):t,e)),ee=e=>D(E({},"__esModule",{value:!0}),e);var ie={};Z(ie,{apply:()=>ne,inject:()=>me,name:()=>oe});module.exports=ee(ie);var p=P(require("react"),1);var te="/my-memory/api";async function N(e,a){let t=await fetch(`${te}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),i=await t.text(),o;try{o=i?JSON.parse(i):null}catch{o={error:i.slice(0,500)}}if(!t.ok){let m=new Error(o&&(o.error||o.message)||`HTTP ${t.status}`);throw m.status=t.status,m.body=o,m}return o}function A(){return N("/persona")}function M(e){return N("/persona",{method:"PUT",body:JSON.stringify({name:e?.name??"",body:e?.body??""})})}async function B(){let e=await N("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function L(e){let a=e?.scope==="project"?"project":"global",t=new URLSearchParams({scope:a});a==="project"&&e?.project&&t.set("project",String(e.project));let i=await N(`/memory?${t.toString()}`);return{items:(Array.isArray(i?.items)?i.items:[]).map(m=>({id:String(m?.id??""),summary:String(m?.summary??m?.text??""),date:String(m?.date??""),title:m?.title?String(m.title):"",tags:Array.isArray(m?.tags)?m.tags:[]}))}}function O(e){return N("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function I(e){return N(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}var J="dsh-my-memory-style",ae=`
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

/* ---------- A. \u8BBE\u7F6E\u9875\u300C\u89D2\u8272\u5361\u300D ---------- */

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
`;function k(){if(typeof document>"u"||document.getElementById(J))return;let e=document.createElement("style");e.id=J,e.textContent=ae,document.head.appendChild(e)}var n=require("react/jsx-runtime"),se=1800;function U(){let[e,a]=p.useState(""),[t,i]=p.useState(""),[o,m]=p.useState(!1),[f,R]=p.useState(!1),[g,j]=p.useState(""),[z,y]=p.useState(""),x=p.useRef({name:"",body:""}),h=p.useRef(null);p.useEffect(()=>(k(),()=>{h.current&&clearTimeout(h.current)}),[]);let S=p.useCallback(async()=>{try{let d=await A(),c=String(d?.name??""),w=String(d?.body??"");x.current={name:c,body:w},a(c),i(w),y("")}catch(d){y(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${d?.message||d}`)}finally{m(!0)}},[]);p.useEffect(()=>{S()},[S]);let C=e!==x.current.name||t!==x.current.body;async function v(d){if(d?.preventDefault?.(),!f){R(!0),y("");try{let c=await M({name:e,body:t}),w=String(c?.name??e),$=String(c?.body??t);x.current={name:w,body:$},a(w),i($),j("\u5DF2\u4FDD\u5B58"),h.current&&clearTimeout(h.current),h.current=setTimeout(()=>{h.current=null,j("")},se)}catch(c){y(`\u4FDD\u5B58\u5931\u8D25\uFF1A${c?.message||c}`)}finally{R(!1)}}}return(0,n.jsx)("div",{className:"dsh-mymem-root","data-dsh-plugin":"my-memory","data-dsh-part":"persona",children:(0,n.jsxs)("form",{className:"dsh-mymem-page",onSubmit:v,children:[(0,n.jsx)("div",{className:"dsh-mymem-title",children:"\u89D2\u8272\u5361"}),(0,n.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u8BBE\u5B9A\u4F1A\u539F\u6837\u6CE8\u5165\u5230\u5BF9\u8BDD\u4E0A\u4E0B\u6587\uFF0C\u5199\u4EC0\u4E48\u5C31\u662F\u4EC0\u4E48\u2014\u2014\u4E0D\u4F1A\u88AB\u6539\u5199\u3001\u4E0D\u4F1A\u88AB\u603B\u7ED3\u3001\u4E5F\u4E0D\u4F1A\u88AB\u6A21\u578B\u89E3\u91CA\u3002"}),(0,n.jsxs)("label",{className:"dsh-mymem-field",children:[(0,n.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,n.jsx)("input",{className:"dsh-mymem-input",type:"text",value:e,placeholder:"\u5979\u600E\u4E48\u79F0\u547C\u81EA\u5DF1",spellCheck:!1,onChange:d=>a(d.target.value)})]}),(0,n.jsxs)("label",{className:"dsh-mymem-field",children:[(0,n.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u8BBE\u5B9A"}),(0,n.jsx)("textarea",{className:"dsh-mymem-textarea",value:t,placeholder:`\u6211\u662F\u8C01\u3001\u8BF4\u8BDD\u4EC0\u4E48\u8C03\u5B50\u3001\u5728\u610F\u4EC0\u4E48\u3001\u4E0D\u8981\u505A\u4EC0\u4E48\u2026\u2026
\u5199\u5728\u8FD9\u91CC\u7684\u6BCF\u4E00\u53E5\u90FD\u4F1A\u51FA\u73B0\u5728\u7CFB\u7EDF\u63D0\u793A\u91CC\u3002`,spellCheck:!1,onChange:d=>i(d.target.value)})]}),z?(0,n.jsx)("div",{className:"dsh-mymem-error",children:z}):null,(0,n.jsxs)("div",{className:"dsh-mymem-actions",children:[(0,n.jsx)("button",{className:`dsh-mymem-btn${C&&!f?" dsh-mymem-btn--dirty":""}`,type:"submit",disabled:f||!o,children:f?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"}),g?(0,n.jsx)("span",{className:"dsh-mymem-ok",children:g}):null,!g&&C?(0,n.jsx)("span",{className:"dsh-mymem-hint",children:"\u6709\u6539\u52A8\u672A\u4FDD\u5B58"}):null,(0,n.jsx)("span",{className:"dsh-mymem-spacer"}),(0,n.jsx)("span",{className:"dsh-mymem-hint",children:"\u6539\u52A8\u4E0D\u4F1A\u81EA\u52A8\u4FDD\u5B58"})]})]})})}var l=P(require("react"),1);var r=require("react/jsx-runtime"),re=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function _(){let[e,a]=l.useState("global"),[t,i]=l.useState(null),[o,m]=l.useState([]),[f,R]=l.useState(!1),[g,j]=l.useState(!1),[z,y]=l.useState(""),[x,h]=l.useState(""),[S,C]=l.useState(""),v=l.useRef(0),d=t?.projectSlug||null,c=l.useCallback(async s=>{let u=++v.current;R(!0);try{let b=await B();if(u!==v.current)return;i(b);let T=b.projectSlug;if(s==="project"&&!T){m([]),y("");return}let V=await L({scope:s,project:T});if(u!==v.current)return;m(V.items),y("")}catch(b){if(u!==v.current)return;y(`\u52A0\u8F7D\u5931\u8D25\uFF1A${b?.message||b}`)}finally{u===v.current&&R(!1)}},[]);l.useEffect(()=>{k()},[]),l.useEffect(()=>{c(e)},[c,e]);async function w(s){s?.preventDefault?.();let u=S.trim();if(!(!u||g)){j(!0),y(""),h("");try{await O({scope:e,text:u,...e==="project"&&d?{project:d}:{}}),C(""),h("\u8BB0\u4F4F\u5566"),await c(e),setTimeout(()=>h(""),1500)}catch(b){y(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${b?.message||b}`)}finally{j(!1)}}}async function $(s){y("");try{await I(s),m(u=>u.filter(b=>b.id!==s)),await c(e)}catch(u){y(`\u5220\u9664\u5931\u8D25\uFF1A${u?.message||u}`),await c(e)}}let H=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${t?.projectName||"\u5F53\u524D\u9879\u76EE"}`,G=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":d?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,r.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,r.jsxs)("div",{className:"dsh-mymem-head",children:[(0,r.jsx)("span",{className:"dsh-mymem-scope-name",children:H}),(0,r.jsx)("span",{className:"dsh-mymem-datadir",title:t?.dataDir||"",children:t?.dataDir?`\u6570\u636E\u76EE\u5F55 ${t.dataDir}`:""}),(0,r.jsx)("span",{className:"dsh-mymem-spacer"}),(0,r.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:f,onClick:()=>void c(e),children:f?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,r.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:re.map(s=>(0,r.jsxs)("button",{className:`dsh-mymem-seg-btn${e===s.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===s.key,onClick:()=>a(s.key),children:[s.label,t?` ${s.key==="global"?t.globalCount:t.projectCount}`:""]},s.key))}),e==="global"?(0,r.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,z?(0,r.jsx)("div",{className:"dsh-mymem-error",children:z}):null,(0,r.jsx)("div",{className:"dsh-mymem-list",children:o.length===0?(0,r.jsx)("div",{className:"dsh-mymem-empty",children:f?"\u8BFB\u53D6\u4E2D\u2026":G}):o.map(s=>(0,r.jsxs)("div",{className:"dsh-mymem-item",children:[(0,r.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,r.jsx)("div",{className:"dsh-mymem-item-summary",title:s.summary,children:s.summary}),(0,r.jsxs)("div",{className:"dsh-mymem-item-date",children:[s.date||"\u672A\u77E5\u65E5\u671F",s.title&&s.title!==s.summary?` \xB7 ${s.title}`:""]})]}),(0,r.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void $(s.id),children:"\xD7"})]},s.id))}),(0,r.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:w,children:[(0,r.jsx)("input",{className:"dsh-mymem-input",type:"text",value:S,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:s=>C(s.target.value)}),(0,r.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:g||!S.trim(),children:g?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),x?(0,r.jsx)("span",{className:"dsh-mymem-ok",children:x}):null]})]})}var oe="my-memory",me=["slots"],q="[my-memory]";function F(e,a,t,i,o){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(a,()=>e.slots.register({name:a,id:"my-memory",order:t,label:i},o)),`my-memory.${a}`),console.info(q,`\u5DF2\u6CE8\u518C ${a} \u2192 ${i()}`),!0}catch(m){return console.warn(q,`\u6CE8\u518C ${a} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,m),!1}}function ne(e){k(),F(e,"settings.section",60,()=>"\u89D2\u8272\u5361",U),F(e,"conversation.view",40,()=>"\u8BB0\u5FC6",_)}

		return module.exports;
	}
});
