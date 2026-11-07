window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var re=Object.create;var I=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var oe=Object.getOwnPropertyNames;var ie=Object.getPrototypeOf,me=Object.prototype.hasOwnProperty;var ne=(e,t)=>{for(var a in t)I(e,a,{get:t[a],enumerable:!0})},G=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of oe(t))!me.call(e,r)&&r!==a&&I(e,r,{get:()=>t[r],enumerable:!(o=se(t,r))||o.enumerable});return e};var D=(e,t,a)=>(a=e!=null?re(ie(e)):{},G(t||!e||!e.__esModule?I(a,"default",{value:e,enumerable:!0}):a,e)),le=e=>G(I({},"__esModule",{value:!0}),e);var Ee={};ne(Ee,{apply:()=>je,inject:()=>Se,name:()=>we});module.exports=le(Ee);var T=D(require("react"),1);var g=D(require("react"),1);var de="/my-memory/api";async function C(e,t){let a=await fetch(`${de}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!a.ok){let s=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw s.status=a.status,s.body=r,s}return r}function O(){return C("/persona")}function B(e){return C("/persona",{method:"PUT",body:JSON.stringify({name:e?.name??"",body:e?.body??""})})}async function W(){let e=await C("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function Y(e){let t=e?.scope==="project"?"project":"global",a=new URLSearchParams({scope:t});t==="project"&&e?.project&&a.set("project",String(e.project));let o=await C(`/memory?${a.toString()}`);return{items:(Array.isArray(o?.items)?o.items:[]).map(s=>({id:String(s?.id??""),summary:String(s?.summary??s?.text??""),date:String(s?.date??""),title:s?.title?String(s.title):"",tags:Array.isArray(s?.tags)?s.tags:[]}))}}async function U(){let e=await C("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??"")}}function q(e){return C("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function F(e){return C(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}var c=require("react/jsx-runtime"),ce={display:"flex",alignItems:"center",gap:10,minHeight:34},pe={flex:"0 0 72px",minWidth:0,fontSize:12.5,fontWeight:600,color:"var(--dsw-alias-label-primary, #e8ecf7)"},ye={flex:"1 1 auto",minWidth:0,display:"flex",alignItems:"center",gap:8},he={display:"flex",flexDirection:"column",justifyContent:"center",minWidth:0},ue=1600;function H({persona:e,onSaved:t}={}){let[a,o]=g.useState(String(e?.name??"")),[r,s]=g.useState(String(e?.body??"")),[p,u]=g.useState(!1),[l,y]=g.useState(""),[x,v]=g.useState(""),M=g.useRef({name:String(e?.name??""),body:String(e?.body??"")}),E=g.useRef(!1),w=g.useRef(null);g.useEffect(()=>()=>{w.current&&clearTimeout(w.current)},[]);async function $(h){if(E.current)return;let k={name:h.name!==void 0?String(h.name):a,body:h.body!==void 0?String(h.body):r};if(!(k.name===M.current.name&&k.body===M.current.body)){E.current=!0,u(!0),v("");try{let f=await B(k),z={name:String(f?.name??k.name),body:String(f?.body??k.body)};M.current=z,o(z.name),s(z.body),t?.({...z,updated:Number(f?.updated)||0}),y("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{w.current=null,y("")},ue)}catch(f){v(`\u4FDD\u5B58\u5931\u8D25\uFF1A${f?.message||f}`)}finally{E.current=!1,u(!1)}}}return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)("div",{style:he,children:(0,c.jsxs)("div",{style:ce,children:[(0,c.jsx)("span",{style:pe,title:"\u4FDD\u5B58\u540E\u663E\u793A\u5728\u5BF9\u8BDD\u9876\u90E8",children:"\u540D\u5B57"}),(0,c.jsx)("div",{style:ye,children:(0,c.jsx)("input",{className:"dsh-mymem-input",style:{width:"100%"},value:a,placeholder:"\u89D2\u8272\u540D",spellCheck:!1,onChange:h=>o(h.target.value),onBlur:()=>void $({name:a})})})]})}),(0,c.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",p?" \xB7 \u4FDD\u5B58\u4E2D\u2026":l?` \xB7 ${l}`:""]}),x?(0,c.jsx)("div",{className:"dsh-mymem-error",children:x}):null,(0,c.jsxs)("label",{className:"dsh-mymem-field",children:[(0,c.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,c.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:r,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:h=>s(h.target.value),onBlur:()=>void $({body:r})})]})]})}var N=D(require("react"),1);var R=require("react/jsx-runtime");function fe(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function J(){let[e,t]=N.useState(null),[a,o]=N.useState(!0),[r,s]=N.useState(""),p=N.useRef(0),u=N.useCallback(async()=>{let y=++p.current;o(!0);try{let x=await U();if(y!==p.current)return;t({path:String(x?.path??""),text:String(x?.text??"")}),s("")}catch(x){if(y!==p.current)return;s(`\u8BFB\u53D6\u5931\u8D25\uFF1A${x?.message||x}`)}finally{y===p.current&&o(!1)}},[]);N.useEffect(()=>{u()},[u]);let l=e?.text??"";return(0,R.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,R.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,R.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${fe(e.path)}`:""}),(0,R.jsx)("span",{className:"dsh-mymem-spacer"}),(0,R.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:a,onClick:()=>void u(),children:a?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),r?(0,R.jsx)("div",{className:"dsh-mymem-error",children:r}):null,(0,R.jsx)("pre",{className:"dsh-mymem-raw-pre",children:l||(a?"":"\uFF08\u8FD9\u4E2A\u6587\u4EF6\u8FD8\u662F\u7A7A\u7684\uFF09")})]})}var V="dsh-my-memory-style",be=`
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
`;function P(){if(typeof document>"u"||document.getElementById(V))return;let e=document.createElement("style");e.id=V,e.textContent=be,document.head.appendChild(e)}var n=require("react/jsx-runtime"),ge=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u5168\u5C40\u8BB0\u5FC6"}];function Z({close:e}={}){let[t,a]=T.useState("role"),[o,r]=T.useState(null),[s,p]=T.useState("");T.useEffect(()=>{P()},[]),T.useEffect(()=>{let l=!0;return(async()=>{try{let y=await O();l&&r(y)}catch(y){l&&p(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${y?.message||y}`)}})(),()=>{l=!1}},[]);let u=o?.name||"\u672A\u547D\u540D";return(0,n.jsx)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:(0,n.jsxs)("div",{className:"dsh-mymem-split",children:[(0,n.jsx)("div",{className:"dsh-mymem-side",children:(0,n.jsx)("div",{className:"dsh-mymem-cards",children:(0,n.jsxs)("div",{className:"dsh-mymem-row","data-active":"1",children:[(0,n.jsx)("span",{className:"dsh-mymem-avatar",children:u.slice(0,1)}),(0,n.jsx)("div",{className:"dsh-mymem-rowmain",children:(0,n.jsxs)("div",{className:"dsh-mymem-name",title:u,children:[u,(0,n.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"})]})})]})})}),(0,n.jsxs)("div",{className:"dsh-mymem-main",children:[(0,n.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,n.jsx)("div",{className:"dsh-mymem-chips",role:"tablist","aria-label":"\u9762\u677F\u5206\u9875",children:ge.map(l=>(0,n.jsx)("button",{className:"dsh-mymem-chip",type:"button",role:"tab","aria-selected":t===l.key,"data-active":t===l.key?"1":"0",onClick:()=>a(l.key),children:l.label},l.key))}),(0,n.jsx)("span",{className:"dsh-mymem-spacer"}),typeof e=="function"?(0,n.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),t==="memory"?(0,n.jsx)(J,{}):s?(0,n.jsx)("div",{className:"dsh-mymem-error",children:s}):o?(0,n.jsx)(H,{persona:o,onSaved:r}):(0,n.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})]})]})})}var Oe=require("react"),j=require("react/jsx-runtime");function xe({size:e=16}){return(0,j.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,j.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,j.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,j.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function K({size:e=16}){return(0,j.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,j.jsx)(xe,{size:e})})}var d=D(require("react"),1);var m=require("react/jsx-runtime"),ve=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function Q(){let[e,t]=d.useState("global"),[a,o]=d.useState(null),[r,s]=d.useState([]),[p,u]=d.useState(!1),[l,y]=d.useState(!1),[x,v]=d.useState(""),[M,E]=d.useState(""),[w,$]=d.useState(""),h=d.useRef(0),k=a?.projectSlug||null,f=d.useCallback(async i=>{let b=++h.current;u(!0);try{let S=await W();if(b!==h.current)return;o(S);let A=S.projectSlug;if(i==="project"&&!A){s([]),v("");return}let te=await Y({scope:i,project:A});if(b!==h.current)return;s(te.items),v("")}catch(S){if(b!==h.current)return;v(`\u52A0\u8F7D\u5931\u8D25\uFF1A${S?.message||S}`)}finally{b===h.current&&u(!1)}},[]);d.useEffect(()=>{P()},[]),d.useEffect(()=>{f(e)},[f,e]);async function z(i){i?.preventDefault?.();let b=w.trim();if(!(!b||l)){y(!0),v(""),E("");try{await q({scope:e,text:b,...e==="project"&&k?{project:k}:{}}),$(""),E("\u8BB0\u4F4F\u5566"),await f(e),setTimeout(()=>E(""),1500)}catch(S){v(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${S?.message||S}`)}finally{y(!1)}}}async function X(i){v("");try{await F(i),s(b=>b.filter(S=>S.id!==i)),await f(e)}catch(b){v(`\u5220\u9664\u5931\u8D25\uFF1A${b?.message||b}`),await f(e)}}let ee=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${a?.projectName||"\u5F53\u524D\u9879\u76EE"}`,ae=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":k?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,m.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,m.jsxs)("div",{className:"dsh-mymem-head",children:[(0,m.jsx)("span",{className:"dsh-mymem-scope-name",children:ee}),(0,m.jsx)("span",{className:"dsh-mymem-datadir",title:a?.dataDir||"",children:a?.dataDir?`\u6570\u636E\u76EE\u5F55 ${a.dataDir}`:""}),(0,m.jsx)("span",{className:"dsh-mymem-spacer"}),(0,m.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:p,onClick:()=>void f(e),children:p?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,m.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:ve.map(i=>(0,m.jsxs)("button",{className:`dsh-mymem-seg-btn${e===i.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===i.key,onClick:()=>t(i.key),children:[i.label,a?` ${i.key==="global"?a.globalCount:a.projectCount}`:""]},i.key))}),e==="global"?(0,m.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,x?(0,m.jsx)("div",{className:"dsh-mymem-error",children:x}):null,(0,m.jsx)("div",{className:"dsh-mymem-list",children:r.length===0?(0,m.jsx)("div",{className:"dsh-mymem-empty",children:p?"\u8BFB\u53D6\u4E2D\u2026":ae}):r.map(i=>(0,m.jsxs)("div",{className:"dsh-mymem-item",children:[(0,m.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,m.jsx)("div",{className:"dsh-mymem-item-summary",title:i.summary,children:i.summary}),(0,m.jsxs)("div",{className:"dsh-mymem-item-date",children:[i.date||"\u672A\u77E5\u65E5\u671F",i.title&&i.title!==i.summary?` \xB7 ${i.title}`:""]})]}),(0,m.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void X(i.id),children:"\xD7"})]},i.id))}),(0,m.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:z,children:[(0,m.jsx)("input",{className:"dsh-mymem-input",type:"text",value:w,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:i=>$(i.target.value)}),(0,m.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:l||!w.trim(),children:l?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),M?(0,m.jsx)("span",{className:"dsh-mymem-ok",children:M}):null]})]})}var we="my-memory",Se=["slots","layout"],L="[my-memory]",_="my-memory";function Ne(e){return{close(){try{e.layout.selectPanel(null)}catch(t){console.warn(L,"selectPanel(null) \u5931\u8D25",t)}}}}function ke(e,t,a,o,r,s){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:o,label:r},s)),`my-memory.${t}`),console.info(L,`\u5DF2\u6CE8\u518C ${t} \u2192 ${r()}`),!0}catch(p){return console.warn(L,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,p),!1}}function Re(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:_,inject:()=>({close:t.close})},Z),o=null;try{o=e.slots.register({name:"sidebar.panellist",id:_,order:43,label:()=>"\u8BB0\u5FC6"},K)}catch(r){try{a()}catch{}throw r}return()=>{try{o()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(L,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(L,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}function je(e){P(),Re(e,Ne(e)),ke(e,"conversation.view",_,40,()=>"\u8BB0\u5FC6",Q)}

		return module.exports;
	}
});
