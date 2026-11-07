window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Ie=Object.create;var W=Object.defineProperty;var Oe=Object.getOwnPropertyDescriptor;var Le=Object.getOwnPropertyNames;var Ae=Object.getPrototypeOf,Ue=Object.prototype.hasOwnProperty;var Be=(e,a)=>{for(var t in a)W(e,t,{get:a[t],enumerable:!0})},oe=(e,a,t,n)=>{if(a&&typeof a=="object"||typeof a=="function")for(let s of Le(a))!Ue.call(e,s)&&s!==t&&W(e,s,{get:()=>a[s],enumerable:!(n=Oe(a,s))||n.enumerable});return e};var B=(e,a,t)=>(t=e!=null?Ie(Ae(e)):{},oe(a||!e||!e.__esModule?W(t,"default",{value:e,enumerable:!0}):t,e)),_e=e=>oe(W({},"__esModule",{value:!0}),e);var ia={};Be(ia,{apply:()=>na,inject:()=>ta,name:()=>aa});module.exports=_e(ia);var E=B(require("react"),1);var O=B(require("react"),1);var Fe="/my-memory/api";async function _(e,a){let t=await fetch(`${Fe}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),n=await t.text(),s;try{s=n?JSON.parse(n):null}catch{s={error:n.slice(0,500)}}if(!t.ok){let o=new Error(s&&(s.error||s.message)||`HTTP ${t.status}`);throw o.status=t.status,o.body=s,o}return s}function Ge(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Y(e){let a=String(e?.id??""),t=String(e?.path??""),n=String(e?.display??"")||Ge(t)||(a?`~\\${a}\\agent.md`:"");return{id:a,name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:t,display:n}}async function ae(){let e=await _("/personas"),a=Array.isArray(e?.items)?e.items.map(Y):[],t=e?.activeId?String(e.activeId):a[0]?.id??null;return{items:a,activeId:t}}async function ne(e){let a=String(e?.dir??"").trim(),t=await _("/personas",{method:"POST",body:JSON.stringify({dir:a,name:a})});return Y(t)}async function Z(e,a){let t=await _(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(a??{})});return Y(t)}function ie(e){return _(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function me(e){return _(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function le(e){return _(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function de(e){let a=await _(`/personas/${encodeURIComponent(String(e))}/reload`,{method:"POST"});return Y(a)}function ce(e){return _("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??"")})})}var I=require("react/jsx-runtime"),Je=1600;function ue({persona:e,onSaved:a}={}){let[t,n]=O.useState(String(e?.name??"")),[s,o]=O.useState(String(e?.body??"")),[i,h]=O.useState(!1),[y,S]=O.useState(""),[b,k]=O.useState(""),w=O.useRef({name:String(e?.name??""),body:String(e?.body??"")}),x=O.useRef(!1),g=O.useRef(null);O.useEffect(()=>()=>{g.current&&clearTimeout(g.current)},[]);async function f(u){if(x.current)return;let c={name:u.name!==void 0?String(u.name):t,body:u.body!==void 0?String(u.body):s};if(!(c.name===w.current.name&&c.body===w.current.body)){x.current=!0,h(!0),k("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let m={};c.name!==w.current.name&&(m.name=c.name),c.body!==w.current.body&&(m.body=c.body);let N=await Z(e.id,m),A={name:String(N?.name??c.name),body:String(N?.body??c.body)};w.current=A,n(A.name),o(A.body),a?.({...A,id:e.id,updated:Number(N?.updated)||0}),S("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),g.current&&clearTimeout(g.current),g.current=setTimeout(()=>{g.current=null,S("")},Je)}catch(m){k(`\u4FDD\u5B58\u5931\u8D25\uFF1A${m?.message||m}`)}finally{x.current=!1,h(!1)}}}return(0,I.jsxs)(I.Fragment,{children:[(0,I.jsxs)("label",{className:"dsh-mymem-field",children:[(0,I.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,I.jsx)("input",{className:"dsh-mymem-input",value:t,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onChange:u=>n(u.target.value),onBlur:()=>void f({name:t})})]}),(0,I.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",i?" \xB7 \u4FDD\u5B58\u4E2D\u2026":y?` \xB7 ${y}`:""]}),b?(0,I.jsx)("div",{className:"dsh-mymem-error",children:b}):null,(0,I.jsxs)("label",{className:"dsh-mymem-field",children:[(0,I.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,I.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:s,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:u=>o(u.target.value),onBlur:()=>void f({body:s})})]})]})}var T=B(require("react"),1);var He="/my-memory/api";async function F(e,a){let t=await fetch(`${He}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),n=await t.text(),s;try{s=n?JSON.parse(n):null}catch{s={error:n.slice(0,500)}}if(!t.ok){let o=new Error(s&&(s.error||s.message)||`HTTP ${t.status}`);throw o.status=t.status,o.body=s,o}return s}async function pe(){let e=await F("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function ye(e){let a=e?.scope==="project"?"project":"global",t=new URLSearchParams({scope:a});a==="project"&&e?.project&&t.set("project",String(e.project));let n=await F(`/memory?${t.toString()}`);return{items:(Array.isArray(n?.items)?n.items:[]).map(o=>({id:String(o?.id??""),summary:String(o?.summary??o?.text??""),date:String(o?.date??""),title:o?.title?String(o.title):"",tags:Array.isArray(o?.tags)?o.tags:[]}))}}async function be(){let e=await F("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??"")}}function he(e){return F("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function fe(e){return F(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}async function ge(){let e=await F("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??"")}}function xe(e){return F("/settings/dataDir",{method:"POST",body:JSON.stringify({path:String(e??"")})})}function ve(){return F("/settings/reveal",{method:"POST"})}var C=require("react/jsx-runtime");function qe(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function we(){let[e,a]=T.useState(null),[t,n]=T.useState(!0),[s,o]=T.useState(""),[i,h]=T.useState(""),[y,S]=T.useState(null),[b,k]=T.useState(!1),w=T.useRef(0),x=T.useRef(null);T.useEffect(()=>{x.current=y},[y]);let g=T.useCallback(async()=>{let c=++w.current;n(!0);try{let m=await be();if(c!==w.current)return;a({path:String(m?.path??""),text:String(m?.text??"")}),o("")}catch(m){if(c!==w.current)return;o(`\u8BFB\u53D6\u5931\u8D25\uFF1A${m?.message||m}`)}finally{c===w.current&&n(!1)}},[]);T.useEffect(()=>{g()},[g]);let f=y!==null;async function u(){if(!b){if(y===(e?.text??"")){S(null);return}k(!0),o("");try{await ce({scope:"global",text:y??""}),await g(),S(null),h("\u5DF2\u4FDD\u5B58"),setTimeout(()=>h(""),1600)}catch(c){o(`\u4FDD\u5B58\u5931\u8D25\uFF1A${c?.message||c}`)}finally{k(!1)}}}return(0,C.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,C.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,C.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${qe(e.path)}`:""}),(0,C.jsx)("span",{className:"dsh-mymem-spacer"}),f?null:(0,C.jsxs)(C.Fragment,{children:[i?(0,C.jsx)("span",{className:"dsh-mymem-ok",children:i}):null,(0,C.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t||!e,onClick:()=>{h(""),o(""),S(e?.text??"")},children:"\u7F16\u8F91"}),(0,C.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t,onClick:()=>void g(),children:t?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]})]}),s?(0,C.jsx)("div",{className:"dsh-mymem-error",children:s}):null,f?(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:y,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C",onChange:c=>S(c.target.value)}),(0,C.jsxs)("div",{className:"dsh-mymem-raw-actions",children:[(0,C.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:b,onClick:()=>{S(null),o("")},children:"\u53D6\u6D88"}),(0,C.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:b,onClick:()=>void u(),children:b?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"})]})]}):(0,C.jsx)("pre",{className:"dsh-mymem-raw-pre",children:e?.text||(t?"":"\uFF08\u8FD9\u4E2A\u6587\u4EF6\u8FD8\u662F\u7A7A\u7684\uFF09")})]})}var j=B(require("react"),1);var L=B(require("react"),1),te=B(require("react-dom"),1),D=require("react/jsx-runtime");function Se(e,a){let t=L.useRef(null);L.useEffect(()=>{t.current=typeof document<"u"?document.activeElement:null;let n=a.current;return n&&(n.focus(),typeof n.select=="function"&&n.select()),()=>{let s=t.current;if(s&&typeof s.focus=="function"&&document.contains(s))try{s.focus()}catch{}}},[a]),L.useEffect(()=>{let n=s=>{s.key==="Escape"&&e?.()};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[e])}function q({title:e,description:a,label:t,defaultValue:n="",placeholder:s,confirmText:o="\u786E\u5B9A",validate:i,allowEmpty:h=!1,onSubmit:y,onCancel:S}){let[b,k]=L.useState(n),[w,x]=L.useState(""),[g,f]=L.useState(!1),u=L.useRef(null);Se(S,u);let c=b.trim(),m=c&&i?i(c):"",N=(h||!!c)&&!m&&!g;async function A(){if(N){if(i&&c){let R=i(c);if(R){x(R);return}}f(!0),x("");try{await y?.(c)}catch(R){x(String(R?.message||R))}finally{f(!1)}}}return typeof document>"u"?null:te.createPortal((0,D.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:R=>{R.target===R.currentTarget&&S?.()},children:(0,D.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,D.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),a?(0,D.jsx)("div",{className:"dsh-mymem-modal-message",children:a}):null,t?(0,D.jsx)("div",{className:"dsh-mymem-modal-label",children:t}):null,(0,D.jsx)("input",{ref:u,className:"dsh-mymem-input",value:b,placeholder:s||"",spellCheck:!1,onChange:R=>{k(R.target.value),x("")},onKeyDown:R=>{R.key==="Enter"&&(R.preventDefault(),A())}}),m||w?(0,D.jsx)("div",{className:"dsh-mymem-modal-error",children:w||m}):null,(0,D.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,D.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>S?.(),children:"\u53D6\u6D88"}),(0,D.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!N,onClick:()=>void A(),children:g?"\u5904\u7406\u4E2D\u2026":o})]})]})}),document.body)}function ke({title:e,message:a,confirmText:t="\u786E\u5B9A",danger:n,onOk:s,onCancel:o}){let i=L.useRef(null);return Se(o,i),L.useEffect(()=>{let h=y=>{y.key==="Enter"&&(y.preventDefault(),s?.())};return document.addEventListener("keydown",h),()=>document.removeEventListener("keydown",h)},[s]),typeof document>"u"?null:te.createPortal((0,D.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:h=>{h.target===h.currentTarget&&o?.()},children:(0,D.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,D.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),a?(0,D.jsx)("div",{className:"dsh-mymem-modal-message",children:a}):null,(0,D.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,D.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>o?.(),children:"\u53D6\u6D88"}),(0,D.jsx)("button",{ref:i,className:`dsh-mymem-btn${n?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>s?.(),children:t})]})]})}),document.body)}var $=require("react/jsx-runtime");function Ne({onChanged:e}={}){let[a,t]=j.useState(null),[n,s]=j.useState(""),[o,i]=j.useState(""),[h,y]=j.useState(""),[S,b]=j.useState(!1),[k,w]=j.useState(!1),x=j.useRef(null);j.useEffect(()=>()=>{x.current&&clearTimeout(x.current)},[]);let g=j.useCallback(async()=>{try{let m=await ge();t(m),s("")}catch(m){s(`\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A${m?.message||m}`)}},[]);j.useEffect(()=>{g()},[g]);function f(m){i(m),x.current&&clearTimeout(x.current),x.current=setTimeout(()=>{x.current=null,i("")},2600)}async function u(){s("");try{await ve()}catch(m){s(`\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A${m?.message||m}`)}}async function c(m){w(!0),s("");try{let N=await xe(m);b(!1),y(String(N?.movedFrom??"")),await g(),f("\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362"),e?.()}catch(N){throw new Error(String(N?.message||N))}finally{w(!1)}}return(0,$.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,$.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,$.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5168\u5C40\u8BB0\u5FC6\u3001\u9879\u76EE\u8BB0\u5FC6\u90FD\u5B58\u5728\u8FD9\u4E2A\u76EE\u5F55\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,$.jsx)("div",{className:"dsh-mymem-settings-path",title:a?.dataDir||"",children:a?.dataDir||(a?"\uFF08\u7A7A\uFF09":"\u8BFB\u53D6\u4E2D\u2026")}),(0,$.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,$.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>void u(),children:"\u6253\u5F00\u76EE\u5F55"}),(0,$.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>{s(""),b(!0)},children:"\u66F4\u6539\u76EE\u5F55"}),o?(0,$.jsx)("span",{className:"dsh-mymem-ok",children:o}):null]}),a?.defaultDataDir?(0,$.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",a.defaultDataDir]}):null,h?(0,$.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",h,"\uFF1B\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u624B\u52A8\u590D\u5236\u8FC7\u6765\u3002"]}):null,n?(0,$.jsx)("div",{className:"dsh-mymem-error",children:n}):null,S?(0,$.jsx)(q,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:"\u586B\u4E00\u4E2A\u7EDD\u5BF9\u8DEF\u5F84\uFF1B\u7559\u7A7A\u8868\u793A\u6062\u590D\u9ED8\u8BA4\u76EE\u5F55\u3002\u5207\u6362\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u8FC1\u79FB\u3002",label:"\u6570\u636E\u76EE\u5F55",defaultValue:a?.dataDir||"",placeholder:"\u7559\u7A7A = \u9ED8\u8BA4 ~/.dsh/my-memory",confirmText:k?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:c,onCancel:()=>b(!1)}):null]})}var Re=B(require("react"),1),Ce=B(require("react-dom"),1),re=require("react/jsx-runtime"),Ke=160,Ve=130;function De({menu:e,onClose:a}){if(Re.useEffect(()=>{if(!e)return;let i=()=>a(),h=y=>{y.key==="Escape"&&a()};return document.addEventListener("mousedown",i),document.addEventListener("keydown",h),window.addEventListener("blur",i),()=>{document.removeEventListener("mousedown",i),document.removeEventListener("keydown",h),window.removeEventListener("blur",i)}},[e,a]),!e||typeof document>"u")return null;let t=window.innerWidth||0,n=window.innerHeight||0,s=Math.max(4,Math.min(e.x,t-Ke-6)),o=Math.max(4,Math.min(e.y,n-Ve-6));return Ce.createPortal((0,re.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:s,top:o,zIndex:2147483002},onMouseDown:i=>i.stopPropagation(),children:e.items.map(i=>(0,re.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:i.disabled,onClick:()=>{a(),i.onClick?.()},children:i.label},i.label))}),document.body)}function Ee(e,a){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:a}}var Pe="dsh-my-memory-style",We=`
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

/* \u9876\u5C42\uFF1A\u5927\u5B57 + \u4E0B\u5212\u7EBF\uFF08\u7BA1\u300C\u89D2\u8272\u5361 / \u5168\u5C40\u8BBE\u7F6E\u300D\u8FD9\u79CD\u5927\u5757\uFF09 */
.dsh-mymem-toptabs {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 6px 8px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}
.dsh-mymem-toptab {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  padding: 8px 14px 10px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
}
.dsh-mymem-toptab:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-toptab[data-active="1"] {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-2, #24272f);
}
.dsh-mymem-toptab[data-active="1"]::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 3px;
  border-radius: 2px 2px 0 0;
  background: var(--dsw-alias-label-primary, #e8ecf7);
}

/* \u5185\u9875\uFF1A\u8FDE\u6210\u4E00\u6392\u7684\u4E0B\u5212\u7EBF\u9009\u9879\u5361\uFF08\u539F\u63D2\u4EF6 .dsh-memory-tabs/.dsh-memory-tab\uFF0C\u4EC5\u6362\u524D\u7F00\uFF09 */
.dsh-mymem-tabs {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 10px 16px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  flex: 0 0 auto;
}
.dsh-mymem-tab {
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
.dsh-mymem-tab:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-tabs-spacer { flex: 1 1 auto; }
.dsh-mymem-tab[data-active="1"] {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-tab[data-active="1"]::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--dsw-alias-button-primary-fill, #3b6ef0);
}
/* \u5DE5\u5177\u884C\u5DE6\u4FA7\uFF08\u65B0\u5EFA\u6309\u94AE\uFF09\uFF1A\u5F80\u4E0B\u538B\u4E00\u70B9\uFF0C\u8DDF\u9760\u5E95\u5BF9\u9F50\u7684 tab \u89C6\u89C9\u5C45\u4E2D\u5BF9\u9F50 */
.dsh-mymem-tabs-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 7px;
}

/* \u89D2\u8272\u5361\u9875\u7684\u5185\u5BB9\u5BB9\u5668\uFF1A\u7ED9\u4E0A\u4E0B\u7559\u767D\uFF0C\u5E76\u8BA9\u5206\u680F\u5403\u6389\u5269\u4F59\u9AD8\u5EA6 */
.dsh-mymem-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 16px 12px;
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
  color: var(--dsw-alias-label-tertiary, #8d95a5);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
`;function J(){if(typeof document>"u"||document.getElementById(Pe))return;let e=document.createElement("style");e.id=Pe,e.textContent=We,document.head.appendChild(e)}var l=require("react/jsx-runtime"),Ye=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],Ze=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],Xe=/^[A-Za-z0-9._-]{1,40}$/;function Me({close:e}={}){let[a,t]=E.useState("persona"),[n,s]=E.useState("role"),[o,i]=E.useState(null),[h,y]=E.useState(null),[S,b]=E.useState(""),[k,w]=E.useState(""),[x,g]=E.useState(null),[f,u]=E.useState(null),[c,m]=E.useState(0),N=E.useRef(null);E.useEffect(()=>(J(),()=>{N.current&&clearTimeout(N.current)}),[]);let A=E.useCallback(r=>{w(r),N.current&&clearTimeout(N.current),N.current=setTimeout(()=>{N.current=null,w("")},1600)},[]),R=E.useCallback(async()=>{let r=await ae();return i(r),y(d=>d&&r.items.some(M=>M.id===d)?d:r.activeId??r.items[0]?.id??null),r},[]);E.useEffect(()=>{let r=!0;return(async()=>{try{let d=await ae();if(!r)return;i(d),y(d.activeId??d.items[0]?.id??null)}catch(d){r&&b(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${d?.message||d}`)}})(),()=>{r=!1}},[]);async function H(r){b("");try{await r(),await R()}catch(d){b(String(d?.message||d))}}let p=E.useCallback(()=>g(null),[]);function z(){u({kind:"create",onCancel:()=>u(null),onSubmit:async r=>{b("");try{let d=await ne({dir:r});u(null),await R(),d?.id&&y(d.id),s("role")}catch(d){let M=String(d?.message||d);throw b(`\u65B0\u5EFA\u5931\u8D25\uFF1A${M}`),new Error(M)}}})}function U(r){u({kind:"rename",persona:r,onCancel:()=>u(null),onSubmit:async d=>{await Z(r.id,{name:d}),u(null),await R()}})}function V(r){u({kind:"delete",persona:r,onCancel:()=>u(null),onOk:async()=>{u(null),await H(()=>ie(r.id))}})}async function X(r){b("");try{let d=await de(r.id);i(M=>M&&{...M,items:M.items.map(ee=>ee.id===d.id?{...ee,...d}:ee)}),m(M=>M+1),A("\u5DF2\u66F4\u65B0")}catch(d){b(`\u66F4\u65B0\u5931\u8D25\uFF1A${d?.message||d}`)}}function $e(r){return[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:!!o&&o.activeId===r.id,onClick:()=>H(()=>me(r.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>H(async()=>{await le(r.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>void X(r)},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>V(r)}]}async function je(){b("");try{await R(),m(r=>r+1)}catch(r){b(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${r?.message||r}`)}}let Q=o?.items.find(r=>r.id===h)||null;return(0,l.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,l.jsxs)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:[Ye.map(r=>(0,l.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":a===r.key,"data-active":a===r.key?"1":"0",onClick:()=>t(r.key),children:r.label},r.key)),(0,l.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,l.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),a==="settings"?(0,l.jsx)(Ne,{onChanged:je}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)("div",{className:"dsh-mymem-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:[(0,l.jsxs)("div",{className:"dsh-mymem-tabs-actions",children:[(0,l.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:z,children:"\uFF0B \u65B0\u5EFA"}),k?(0,l.jsx)("span",{className:"dsh-mymem-ok",children:k}):null]}),(0,l.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),Ze.map(r=>(0,l.jsx)("button",{className:"dsh-mymem-tab",type:"button",role:"tab","aria-selected":n===r.key,"data-active":n===r.key?"1":"0",onClick:()=>s(r.key),children:r.label},r.key))]}),(0,l.jsxs)("div",{className:"dsh-mymem-body",children:[S?(0,l.jsx)("div",{className:"dsh-mymem-error",children:S}):null,(0,l.jsxs)("div",{className:"dsh-mymem-split",children:[(0,l.jsx)("div",{className:"dsh-mymem-side",children:(0,l.jsx)("div",{className:"dsh-mymem-cards",children:o?o.items.map(r=>(0,l.jsxs)("div",{className:"dsh-mymem-row","data-active":r.id===h?"1":"0",onClick:()=>y(r.id),onContextMenu:d=>g(Ee(d,$e(r))),children:[(0,l.jsx)("span",{className:"dsh-mymem-avatar",children:(r.name||r.id).slice(0,1)}),(0,l.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,l.jsxs)("div",{className:"dsh-mymem-name",title:r.name||r.id,children:[r.name||r.id,o.activeId===r.id?(0,l.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,l.jsx)("div",{className:"dsh-mymem-path",title:r.path||r.display,children:r.display})]})]},r.id)):(0,l.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,l.jsx)("div",{className:"dsh-mymem-main",children:n==="memory"?(0,l.jsx)(we,{},`raw:${c}`):Q?(0,l.jsx)(ue,{persona:Q,onSaved:r=>i(d=>d&&{...d,items:d.items.map(M=>M.id===r.id?{...M,...r}:M)})},`${Q.id}:${c}`):(0,l.jsx)("div",{className:"dsh-mymem-hint",children:o?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})]}),(0,l.jsx)(De,{menu:x,onClose:p}),f?.kind==="create"?(0,l.jsx)(q,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:r=>Xe.test(r)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:f.onSubmit,onCancel:f.onCancel}):null,f?.kind==="rename"?(0,l.jsx)(q,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:f.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:f.onSubmit,onCancel:f.onCancel}):null,f?.kind==="delete"?(0,l.jsx)(ke,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${f.persona.name||f.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:f.onOk,onCancel:f.onCancel}):null]})}var Ma=require("react"),G=require("react/jsx-runtime");function Qe({size:e=16}){return(0,G.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,G.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,G.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,G.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function Te({size:e=16}){return(0,G.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,G.jsx)(Qe,{size:e})})}var P=B(require("react"),1);var v=require("react/jsx-runtime"),ea=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function ze(){let[e,a]=P.useState("global"),[t,n]=P.useState(null),[s,o]=P.useState([]),[i,h]=P.useState(!1),[y,S]=P.useState(!1),[b,k]=P.useState(""),[w,x]=P.useState(""),[g,f]=P.useState(""),u=P.useRef(0),c=t?.projectSlug||null,m=P.useCallback(async p=>{let z=++u.current;h(!0);try{let U=await pe();if(z!==u.current)return;n(U);let V=U.projectSlug;if(p==="project"&&!V){o([]),k("");return}let X=await ye({scope:p,project:V});if(z!==u.current)return;o(X.items),k("")}catch(U){if(z!==u.current)return;k(`\u52A0\u8F7D\u5931\u8D25\uFF1A${U?.message||U}`)}finally{z===u.current&&h(!1)}},[]);P.useEffect(()=>{J()},[]),P.useEffect(()=>{m(e)},[m,e]);async function N(p){p?.preventDefault?.();let z=g.trim();if(!(!z||y)){S(!0),k(""),x("");try{await he({scope:e,text:z,...e==="project"&&c?{project:c}:{}}),f(""),x("\u8BB0\u4F4F\u5566"),await m(e),setTimeout(()=>x(""),1500)}catch(U){k(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${U?.message||U}`)}finally{S(!1)}}}async function A(p){k("");try{await fe(p),o(z=>z.filter(U=>U.id!==p)),await m(e)}catch(z){k(`\u5220\u9664\u5931\u8D25\uFF1A${z?.message||z}`),await m(e)}}let R=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${t?.projectName||"\u5F53\u524D\u9879\u76EE"}`,H=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":c?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,v.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,v.jsxs)("div",{className:"dsh-mymem-head",children:[(0,v.jsx)("span",{className:"dsh-mymem-scope-name",children:R}),(0,v.jsx)("span",{className:"dsh-mymem-datadir",title:t?.dataDir||"",children:t?.dataDir?`\u6570\u636E\u76EE\u5F55 ${t.dataDir}`:""}),(0,v.jsx)("span",{className:"dsh-mymem-spacer"}),(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:i,onClick:()=>void m(e),children:i?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,v.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:ea.map(p=>(0,v.jsxs)("button",{className:`dsh-mymem-seg-btn${e===p.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===p.key,onClick:()=>a(p.key),children:[p.label,t?` ${p.key==="global"?t.globalCount:t.projectCount}`:""]},p.key))}),e==="global"?(0,v.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,b?(0,v.jsx)("div",{className:"dsh-mymem-error",children:b}):null,(0,v.jsx)("div",{className:"dsh-mymem-list",children:s.length===0?(0,v.jsx)("div",{className:"dsh-mymem-empty",children:i?"\u8BFB\u53D6\u4E2D\u2026":H}):s.map(p=>(0,v.jsxs)("div",{className:"dsh-mymem-item",children:[(0,v.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,v.jsx)("div",{className:"dsh-mymem-item-summary",title:p.summary,children:p.summary}),(0,v.jsxs)("div",{className:"dsh-mymem-item-date",children:[p.date||"\u672A\u77E5\u65E5\u671F",p.title&&p.title!==p.summary?` \xB7 ${p.title}`:""]})]}),(0,v.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void A(p.id),children:"\xD7"})]},p.id))}),(0,v.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:N,children:[(0,v.jsx)("input",{className:"dsh-mymem-input",type:"text",value:g,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:p=>f(p.target.value)}),(0,v.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:y||!g.trim(),children:y?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),w?(0,v.jsx)("span",{className:"dsh-mymem-ok",children:w}):null]})]})}var aa="my-memory",ta=["slots","layout"],K="[my-memory]",se="my-memory";function ra(e){return{close(){try{e.layout.selectPanel(null)}catch(a){console.warn(K,"selectPanel(null) \u5931\u8D25",a)}}}}function sa(e,a,t,n,s,o){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(a,()=>e.slots.register({name:a,id:t,order:n,label:s},o)),`my-memory.${a}`),console.info(K,`\u5DF2\u6CE8\u518C ${a} \u2192 ${s()}`),!0}catch(i){return console.warn(K,`\u6CE8\u518C ${a} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,i),!1}}function oa(e,a){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let t=e.slots.register({name:"main",key:se,inject:()=>({close:a.close})},Me),n=null;try{n=e.slots.register({name:"sidebar.panellist",id:se,order:43,label:()=>"\u8BB0\u5FC6"},Te)}catch(s){try{t()}catch{}throw s}return()=>{try{n()}finally{try{t()}catch{}}}})),"my-memory.sidebar"),console.info(K,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(t){return console.warn(K,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",t),!1}}function na(e){J(),oa(e,ra(e)),sa(e,"conversation.view",se,40,()=>"\u8BB0\u5FC6",ze)}

		return module.exports;
	}
});
