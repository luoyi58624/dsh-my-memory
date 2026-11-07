window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Je=Object.create;var te=Object.defineProperty;var He=Object.getOwnPropertyDescriptor;var Ve=Object.getOwnPropertyNames;var We=Object.getPrototypeOf,Ke=Object.prototype.hasOwnProperty;var Xe=(e,a)=>{for(var t in a)te(e,t,{get:a[t],enumerable:!0})},ye=(e,a,t,o)=>{if(a&&typeof a=="object"||typeof a=="function")for(let r of Ve(a))!Ke.call(e,r)&&r!==t&&te(e,r,{get:()=>a[r],enumerable:!(o=He(a,r))||o.enumerable});return e};var J=(e,a,t)=>(t=e!=null?Je(We(e)):{},ye(a||!e||!e.__esModule?te(t,"default",{value:e,enumerable:!0}):t,e)),Ye=e=>ye(te({},"__esModule",{value:!0}),e);var ft={};Xe(ft,{apply:()=>yt,inject:()=>lt,name:()=>dt});module.exports=Ye(ft);var T=J(require("react"),1);var F=J(require("react"),1);var Ze="/my-memory/api";async function W(e,a){let t=await fetch(`${Ze}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),o=await t.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!t.ok){let n=new Error(r&&(r.error||r.message)||`HTTP ${t.status}`);throw n.status=t.status,n.body=r,n}return r}function qe(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function ae(e){let a=String(e?.id??""),t=String(e?.path??""),o=String(e?.display??"")||qe(t)||(a?`~\\${a}\\agent.md`:"");return{id:a,name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:t,display:o}}async function ie(){let e=await W("/personas"),a=Array.isArray(e?.items)?e.items.map(ae):[],t=e?.activeId?String(e.activeId):a[0]?.id??null;return{items:a,activeId:t}}async function fe(e){let a=String(e?.dir??"").trim(),t=await W("/personas",{method:"POST",body:JSON.stringify({dir:a,name:a})});return ae(t)}async function se(e,a){let t=await W(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(a??{})});return ae(t)}function he(e){return W(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function be(e){return W(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function ge(e){return W(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function xe(e,a){let t=await W(`/personas/${encodeURIComponent(String(e))}/rename`,{method:"POST",body:JSON.stringify({dir:String(a??"").trim()})});return ae(t)}var _=require("react/jsx-runtime"),Qe=1600;function ve({persona:e,onSaved:a}={}){let[t,o]=F.useState(String(e?.name??"")),[r,n]=F.useState(String(e?.body??"")),[i,p]=F.useState(!1),[f,y]=F.useState(""),[k,l]=F.useState(""),N=F.useRef({name:String(e?.name??""),body:String(e?.body??"")}),R=F.useRef(!1),E=F.useRef(null);F.useEffect(()=>()=>{E.current&&clearTimeout(E.current)},[]);async function I(x){if(R.current)return;let b={name:x.name!==void 0?String(x.name):t,body:x.body!==void 0?String(x.body):r};if(!(b.name===N.current.name&&b.body===N.current.body)){R.current=!0,p(!0),l("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let m={};b.name!==N.current.name&&(m.name=b.name),b.body!==N.current.body&&(m.body=b.body);let g=await se(e.id,m),$={name:String(g?.name??b.name),body:String(g?.body??b.body)};N.current=$,o($.name),n($.body),a?.({...$,id:e.id,updated:Number(g?.updated)||0}),y("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),E.current&&clearTimeout(E.current),E.current=setTimeout(()=>{E.current=null,y("")},Qe)}catch(m){l(`\u4FDD\u5B58\u5931\u8D25\uFF1A${m?.message||m}`)}finally{R.current=!1,p(!1)}}}return(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)("label",{className:"dsh-mymem-field",children:[(0,_.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,_.jsx)("input",{className:"dsh-mymem-input",value:t,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onChange:x=>o(x.target.value),onBlur:()=>void I({name:t})})]}),(0,_.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",i?" \xB7 \u4FDD\u5B58\u4E2D\u2026":f?` \xB7 ${f}`:""]}),k?(0,_.jsx)("div",{className:"dsh-mymem-error",children:k}):null,(0,_.jsxs)("label",{className:"dsh-mymem-field",children:[(0,_.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,_.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:r,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:x=>n(x.target.value),onBlur:()=>void I({body:r})})]})]})}var P=J(require("react"),1);var et="/my-memory/api";async function H(e,a){let t=await fetch(`${et}${e}`,{credentials:"same-origin",...a,headers:{"content-type":"application/json",...a&&a.headers}}),o=await t.text(),r;try{r=o?JSON.parse(o):null}catch{r={error:o.slice(0,500)}}if(!t.ok){let n=new Error(r&&(r.error||r.message)||`HTTP ${t.status}`);throw n.status=t.status,n.body=r,n}return r}async function we(){let e=await H("/status");return{dataDir:String(e?.dataDir??""),globalCount:Number(e?.globalCount)||0,projectCount:Number(e?.projectCount)||0,projectSlug:e?.slug??e?.projectSlug??null,projectName:String(e?.project??e?.projectName??""),projectRoot:e?.root??e?.projectRoot??null}}async function re(e){let a=e?.scope==="project"?"project":"global",t=new URLSearchParams({scope:a});a==="project"&&e?.project&&t.set("project",String(e.project));let o=await H(`/memory?${t.toString()}`);return{items:(Array.isArray(o?.items)?o.items:[]).map(n=>({id:String(n?.id??""),summary:String(n?.summary??n?.text??""),date:String(n?.date??""),title:n?.title?String(n.title):"",tags:Array.isArray(n?.tags)?n.tags:[]}))}}async function me(){let e=await H("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??""),rev:String(e?.rev??"")}}function de(e){return H("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??""),baseRev:String(e?.baseRev??""),...e?.force?{force:!0}:{}})})}function ke(e){return H("/memory",{method:"POST",body:JSON.stringify({scope:e?.scope,text:e?.text,...e?.title?{title:e.title}:{},...e?.project?{project:e.project}:{}})})}function Se(e){return H(`/memory/${encodeURIComponent(String(e))}`,{method:"DELETE"})}async function Ne(){let e=await H("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??""),folderName:String(e?.folderName??"dsh-my-memory")}}function Re(e){return H("/settings/dataDir",{method:"POST",body:JSON.stringify({parent:String(e??"")})})}function Ce(){return H("/settings/reveal",{method:"POST"})}function De(e,a){let t=String(e??"").split(`
`),o=String(a??"").split(`
`);if(t.length>1500||o.length>1500)return[...t.map(k=>({kind:"del",text:k})),...o.map(k=>({kind:"add",text:k}))];let r=t.length,n=o.length,i=Array.from({length:r+1},()=>new Uint16Array(n+1));for(let k=r-1;k>=0;k-=1)for(let l=n-1;l>=0;l-=1)i[k][l]=t[k]===o[l]?i[k+1][l+1]+1:Math.max(i[k+1][l],i[k][l+1]);let p=[],f=0,y=0;for(;f<r&&y<n;)t[f]===o[y]?(p.push({kind:"same",text:t[f]}),f+=1,y+=1):i[f+1][y]>=i[f][y+1]?(p.push({kind:"del",text:t[f]}),f+=1):(p.push({kind:"add",text:o[y]}),y+=1);for(;f<r;)p.push({kind:"del",text:t[f]}),f+=1;for(;y<n;)p.push({kind:"add",text:o[y]}),y+=1;return p}function Ee(e){let a=0,t=0;for(let o of e||[])o.kind==="add"?a+=1:o.kind==="del"&&(t+=1);return{added:a,removed:t}}var h=require("react/jsx-runtime");function tt(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Me(){let e=new Date,a=t=>String(t).padStart(2,"0");return`${a(e.getHours())}:${a(e.getMinutes())}`}function Pe(){let[e,a]=P.useState(null),[t,o]=P.useState(!0),[r,n]=P.useState(""),[i,p]=P.useState(""),[f,y]=P.useState(""),[k,l]=P.useState(""),[N,R]=P.useState(!1),[E,I]=P.useState(""),[x,b]=P.useState(null),[m,g]=P.useState(null),$=i!==f,S=P.useRef(i),U=P.useRef($),u=P.useRef(k);P.useEffect(()=>{S.current=i,U.current=$,u.current=k},[i,$,k]);let c=P.useCallback(async()=>{o(!0);try{let v=await me(),M=String(v?.text??"");a({path:String(v?.path??"")}),p(M),y(M),l(String(v?.rev??"")),b(null),n("")}catch(v){n(`\u8BFB\u53D6\u5931\u8D25\uFF1A${v?.message||v}`)}finally{o(!1)}},[]);P.useEffect(()=>{c()},[c]);async function D(){try{let v=await me(),M=String(v?.text??""),B=String(v?.rev??"");if(!U.current){p(M),y(M),l(B),b(null),n("");return}B&&B!==u.current&&b({text:M,rev:B})}catch{}}async function K(){if(!U.current||N)return;let v=S.current;R(!0),n("");try{let M=await de({scope:"global",text:v,baseRev:u.current});l(String(M?.rev??"")),y(String(M?.text??v)),b(null),I(Me())}catch(M){if(M?.status===409){let B=M.body||{};g({mode:"conflict",diskText:String(B.text??""),diskRev:String(B.rev??""),baseRev:String(B.baseRev??u.current)})}else n(`\u4FDD\u5B58\u5931\u8D25\uFF1A${M?.message||M}`)}finally{R(!1)}}async function Z(){R(!0),n("");try{let v=await de({scope:"global",text:S.current,baseRev:u.current,force:!0});l(String(v?.rev??"")),y(String(v?.text??S.current)),b(null),g(null),I(Me())}catch(v){n(`\u8986\u76D6\u5931\u8D25\uFF1A${v?.message||v}`)}finally{R(!1)}}function oe(v,M){p(v),y(v),M&&l(M),b(null),g(null)}let Q=m?De(m.mode==="conflict"?m.diskText:m.text,i):[],ee=Ee(Q);return(0,h.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,h.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,h.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${tt(e.path)}`:""}),(0,h.jsx)("span",{className:"dsh-mymem-spacer"}),(0,h.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t||N,onClick:()=>void c(),children:t?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),x&&!m?(0,h.jsxs)("div",{className:"dsh-mymem-remotebar",children:[(0,h.jsx)("span",{children:"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u66F4\u65B0"}),(0,h.jsx)("span",{className:"dsh-mymem-raw-grow"}),(0,h.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>g({mode:"compare",text:x.text,rev:x.rev}),children:"\u5BF9\u6BD4"})]}):null,r?(0,h.jsx)("div",{className:"dsh-mymem-error",children:r}):null,(0,h.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:i,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C\uFF1B\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",onFocus:()=>void D(),onBlur:()=>void K(),onChange:v=>p(v.target.value)}),m?(0,h.jsxs)("div",{className:"dsh-mymem-diff","data-kind":m.mode,children:[(0,h.jsxs)("div",{className:"dsh-mymem-diff-head",children:[(0,h.jsx)("span",{className:"dsh-mymem-diff-title",children:m.mode==="conflict"?"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u7ECF\u88AB\u6539\u8FC7":"\u548C\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5BF9\u6BD4"}),(0,h.jsxs)("span",{className:"dsh-mymem-diff-count",children:["\u65B0\u589E ",ee.added," \u884C \xB7 \u5220\u9664 ",ee.removed," \u884C"]})]}),(0,h.jsx)("div",{className:"dsh-mymem-diff-body",children:Q.map((v,M)=>(0,h.jsxs)("div",{className:"dsh-mymem-diffline","data-kind":v.kind,children:[(0,h.jsx)("span",{className:"dsh-mymem-diffmark",children:v.kind==="add"?"+":v.kind==="del"?"\u2212":" "}),(0,h.jsx)("span",{className:"dsh-mymem-difftext",children:v.text||" "})]},M))}),(0,h.jsx)("div",{className:"dsh-mymem-diff-actions",children:m.mode==="conflict"?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:N,onClick:()=>void Z(),children:"\u7528\u6211\u7684\u8986\u76D6"}),(0,h.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>oe(m.diskText,m.diskRev),children:"\u7528\u78C1\u76D8\u7684"}),(0,h.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>g(null),children:"\u53D6\u6D88"})]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>oe(m.text,m.rev),children:"\u7528\u78C1\u76D8\u7684"}),(0,h.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>g(null),children:"\u5173\u95ED"})]})})]}):null,(0,h.jsxs)("div",{className:"dsh-mymem-raw-status",children:[N?"\u4FDD\u5B58\u4E2D\u2026":E?`\u5DF2\u4FDD\u5B58 \xB7 ${E}`:"\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",$&&!N?" \xB7 \u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8":""]})]})}var L=J(require("react"),1);var G=J(require("react"),1),le=J(require("react-dom"),1),z=require("react/jsx-runtime");function Te(e,a){let t=G.useRef(null);G.useEffect(()=>{t.current=typeof document<"u"?document.activeElement:null;let o=a.current;return o&&(o.focus(),typeof o.select=="function"&&o.select()),()=>{let r=t.current;if(r&&typeof r.focus=="function"&&document.contains(r))try{r.focus()}catch{}}},[a]),G.useEffect(()=>{let o=r=>{r.key==="Escape"&&e?.()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[e])}function X({title:e,description:a,label:t,defaultValue:o="",placeholder:r,confirmText:n="\u786E\u5B9A",validate:i,allowEmpty:p=!1,onSubmit:f,onCancel:y}){let[k,l]=G.useState(o),[N,R]=G.useState(""),[E,I]=G.useState(!1),x=G.useRef(null);Te(y,x);let b=k.trim(),m=b&&i?i(b):"",g=(p||!!b)&&!m&&!E;async function $(){if(g){if(i&&b){let S=i(b);if(S){R(S);return}}I(!0),R("");try{await f?.(b)}catch(S){R(String(S?.message||S))}finally{I(!1)}}}return typeof document>"u"?null:le.createPortal((0,z.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:S=>{S.target===S.currentTarget&&y?.()},children:(0,z.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,z.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),a?(0,z.jsx)("div",{className:"dsh-mymem-modal-message",children:a}):null,t?(0,z.jsx)("div",{className:"dsh-mymem-modal-label",children:t}):null,(0,z.jsx)("input",{ref:x,className:"dsh-mymem-input",value:k,placeholder:r||"",spellCheck:!1,onChange:S=>{l(S.target.value),R("")},onKeyDown:S=>{S.key==="Enter"&&(S.preventDefault(),$())}}),m||N?(0,z.jsx)("div",{className:"dsh-mymem-modal-error",children:N||m}):null,(0,z.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,z.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>y?.(),children:"\u53D6\u6D88"}),(0,z.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!g,onClick:()=>void $(),children:E?"\u5904\u7406\u4E2D\u2026":n})]})]})}),document.body)}function $e({title:e,message:a,confirmText:t="\u786E\u5B9A",danger:o,onOk:r,onCancel:n}){let i=G.useRef(null);return Te(n,i),G.useEffect(()=>{let p=f=>{f.key==="Enter"&&(f.preventDefault(),r?.())};return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[r]),typeof document>"u"?null:le.createPortal((0,z.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:p=>{p.target===p.currentTarget&&n?.()},children:(0,z.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,z.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),a?(0,z.jsx)("div",{className:"dsh-mymem-modal-message",children:a}):null,(0,z.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,z.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>n?.(),children:"\u53D6\u6D88"}),(0,z.jsx)("button",{ref:i,className:`dsh-mymem-btn${o?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>r?.(),children:t})]})]})}),document.body)}var O=require("react/jsx-runtime");function ce(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function ze({onChanged:e,pick:a}={}){let[t,o]=L.useState(null),[r,n]=L.useState(""),[i,p]=L.useState(""),[f,y]=L.useState(""),[k,l]=L.useState(!1),[N,R]=L.useState(!1),[E,I]=L.useState(!1),x=L.useRef(null);L.useEffect(()=>()=>{x.current&&clearTimeout(x.current)},[]);let b=L.useCallback(async()=>{try{let c=await Ne();o(c),n("")}catch(c){n(`\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A${c?.message||c}`)}},[]);L.useEffect(()=>{b()},[b]);function m(c){p(c),x.current&&clearTimeout(x.current),x.current=setTimeout(()=>{x.current=null,p("")},2600)}let g=t?.folderName||"dsh-my-memory",$=typeof a=="function";async function S(c){I(!0),n("");try{let D=await Re(c);l(!1),y(String(D?.movedFrom??"")),await b(),m(`\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362\uFF1A${ce(String(D?.dataDir??""))}`),e?.()}catch(D){throw new Error(String(D?.message||D))}finally{I(!1)}}async function U(){if(n(""),!$){l(!0);return}R(!0);try{let c=await a();if(!c)return;await S(c)}catch(c){n(`\u9009\u62E9\u76EE\u5F55\u5931\u8D25\uFF1A${c?.message||c}`)}finally{R(!1)}}async function u(){n("");try{await Ce()}catch(c){n(`\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A${c?.message||c}`)}}return(0,O.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,O.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,O.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5168\u5C40\u8BB0\u5FC6\u3001\u9879\u76EE\u8BB0\u5FC6\u90FD\u5B58\u5728\u8FD9\u4E2A\u76EE\u5F55\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,O.jsx)("div",{className:"dsh-mymem-settings-path",title:t?.dataDir||"",children:t?.dataDir||(t?"\uFF08\u7A7A\uFF09":"\u8BFB\u53D6\u4E2D\u2026")}),(0,O.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,O.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!t,onClick:()=>void u(),children:"\u6253\u5F00\u76EE\u5F55"}),(0,O.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!t||N||E,onClick:()=>void U(),children:N?"\u9009\u62E9\u4E2D\u2026":"\u66F4\u6539\u76EE\u5F55"}),i?(0,O.jsx)("span",{className:"dsh-mymem-ok",children:i}):null]}),(0,O.jsxs)("div",{className:"dsh-mymem-hint",children:["\u66F4\u6539\u76EE\u5F55\u65F6\u9009\u7684\u662F\u7236\u76EE\u5F55\uFF0C\u6570\u636E\u56FA\u5B9A\u653E\u5728 ",(0,O.jsx)("code",{children:g})," \u5B50\u76EE\u5F55\u91CC\uFF1A\u4F8B\u5982\u9009\u4E86 D:\\projects\uFF0C\u5B9E\u9645\u4F4D\u7F6E\u662F D:\\projects\\"+g+"\u3002"]}),t?.defaultDataDir?(0,O.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",ce(t.defaultDataDir),"\uFF08\u4E0D\u9009 = \u4F7F\u7528\u9ED8\u8BA4\uFF09"]}):null,f?(0,O.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",ce(f),"\uFF1B\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u624B\u52A8\u590D\u5236\u8FC7\u6765\u3002"]}):null,r?(0,O.jsx)("div",{className:"dsh-mymem-error",children:r}):null,k?(0,O.jsx)(X,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:`\u9009\u4E00\u4E2A\u7236\u76EE\u5F55\uFF08\u7559\u7A7A = \u4F7F\u7528\u9ED8\u8BA4\u76EE\u5F55\uFF09\u3002\u6570\u636E\u4F1A\u653E\u5728\u6240\u9009\u76EE\u5F55\u4E0B\u7684 ${g} \u91CC\u3002`,label:"\u7236\u76EE\u5F55",defaultValue:"",placeholder:"\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u4F8B\u5982 D:\\projects",confirmText:E?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:S,onCancel:()=>l(!1)}):null]})}var je=J(require("react"),1),Ie=J(require("react-dom"),1),ue=require("react/jsx-runtime"),at=160,st=130;function Oe({menu:e,onClose:a}){if(je.useEffect(()=>{if(!e)return;let i=()=>a(),p=f=>{f.key==="Escape"&&a()};return document.addEventListener("mousedown",i),document.addEventListener("keydown",p),window.addEventListener("blur",i),()=>{document.removeEventListener("mousedown",i),document.removeEventListener("keydown",p),window.removeEventListener("blur",i)}},[e,a]),!e||typeof document>"u")return null;let t=window.innerWidth||0,o=window.innerHeight||0,r=Math.max(4,Math.min(e.x,t-at-6)),n=Math.max(4,Math.min(e.y,o-st-6));return Ie.createPortal((0,ue.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:r,top:n,zIndex:2147483002},onMouseDown:i=>i.stopPropagation(),children:e.items.map(i=>(0,ue.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:i.disabled,onClick:()=>{a(),i.onClick?.()},children:i.label},i.label))}),document.body)}function Ae(e,a){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:a}}var Le="dsh-my-memory-style",rt=`
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
`;function Y(){if(typeof document>"u"||document.getElementById(Le))return;let e=document.createElement("style");e.id=Le,e.textContent=rt,document.head.appendChild(e)}var d=require("react/jsx-runtime"),ot=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],nt=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],Ue=/^[A-Za-z0-9._-]{1,40}$/;function Be({close:e,pick:a}={}){let[t,o]=T.useState("persona"),[r,n]=T.useState("role"),[i,p]=T.useState(null),[f,y]=T.useState(null),[k,l]=T.useState(""),[N,R]=T.useState(""),[E,I]=T.useState(null),[x,b]=T.useState(null),[m,g]=T.useState(null),[$,S]=T.useState(0),U=T.useRef(null);T.useEffect(()=>(Y(),()=>{U.current&&clearTimeout(U.current)}),[]);let u=T.useCallback(s=>{R(s),U.current&&clearTimeout(U.current),U.current=setTimeout(()=>{U.current=null,R("")},1600)},[]),c=T.useCallback(async()=>{let s=await ie();return p(s),y(w=>w&&s.items.some(j=>j.id===w)?w:s.activeId??s.items[0]?.id??null),s},[]);T.useEffect(()=>{let s=!0;return(async()=>{try{let w=await ie();if(!s)return;p(w),y(w.activeId??w.items[0]?.id??null),re({scope:"global"}).then(j=>{s&&b(j.items.length)}).catch(()=>{})}catch(w){s&&l(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${w?.message||w}`)}})(),()=>{s=!1}},[]);async function D(s){l("");try{await s(),await c()}catch(w){l(String(w?.message||w))}}let K=T.useCallback(()=>I(null),[]);function Z(){g({kind:"create",onCancel:()=>g(null),onSubmit:async s=>{l("");try{let w=await fe({dir:s});g(null),await c(),w?.id&&y(w.id),n("role")}catch(w){let j=String(w?.message||w);throw l(`\u65B0\u5EFA\u5931\u8D25\uFF1A${j}`),new Error(j)}}})}function oe(s){g({kind:"rename",persona:s,onCancel:()=>g(null),onSubmit:async w=>{await se(s.id,{name:w}),g(null),await c()}})}function Q(s){g({kind:"delete",persona:s,onCancel:()=>g(null),onOk:async()=>{g(null),await D(()=>he(s.id))}})}function ee(s){g({kind:"renameDir",persona:s,onCancel:()=>g(null),onSubmit:async w=>{l("");try{let j=await xe(s.id,w);g(null),await c(),j?.id&&y(j.id),u("\u76EE\u5F55\u5DF2\u66F4\u65B0")}catch(j){throw l(`\u66F4\u65B0\u76EE\u5F55\u5931\u8D25\uFF1A${String(j?.message||j)}`),new Error(String(j?.message||j))}}})}function v(s){return[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:!!i&&i.activeId===s.id,onClick:()=>D(()=>be(s.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>D(async()=>{await ge(s.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>ee(s)},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>Q(s)}]}async function M(){l("");try{await c(),S(s=>s+1)}catch(s){l(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${s?.message||s}`)}}let B=i?.items.find(s=>s.id===f)||null,ne=i?.items.find(s=>s.id===i.activeId)||B,Ge=[x===null?"":`${x} \u6761\u957F\u671F\u8BB0\u5FC6`,ne?`\u5F53\u524D\u89D2\u8272 ${ne.name||ne.id}`:""].filter(Boolean).join(" \xB7 ");return(0,d.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,d.jsxs)("div",{className:"dsh-mymem-head",children:[(0,d.jsx)("div",{className:"dsh-mymem-title",children:"\u8BB0\u5FC6"}),(0,d.jsx)("div",{className:"dsh-mymem-sub",children:Ge}),(0,d.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,d.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),(0,d.jsx)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:ot.map(s=>(0,d.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":t===s.key,"data-active":t===s.key?"1":"0",onClick:()=>o(s.key),children:s.label},s.key))}),t==="settings"?(0,d.jsx)(ze,{onChanged:M,pick:a}):(0,d.jsx)(d.Fragment,{children:(0,d.jsxs)("div",{className:"dsh-mymem-body",children:[(0,d.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,d.jsxs)("div",{className:"dsh-mymem-toolbar-left",children:[(0,d.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:Z,children:"\uFF0B \u65B0\u5EFA"}),N?(0,d.jsx)("span",{className:"dsh-mymem-ok",children:N}):null]}),(0,d.jsx)("div",{className:"dsh-mymem-toolbar-right",children:(0,d.jsx)("div",{className:"dsh-mymem-inner-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:nt.map(s=>(0,d.jsx)("button",{className:"dsh-mymem-inner-tab",type:"button",role:"tab","aria-selected":r===s.key,"data-active":r===s.key?"1":"0",onClick:()=>n(s.key),children:s.label},s.key))})})]}),k?(0,d.jsx)("div",{className:"dsh-mymem-error",children:k}):null,(0,d.jsxs)("div",{className:"dsh-mymem-split",children:[(0,d.jsx)("div",{className:"dsh-mymem-side",children:(0,d.jsx)("div",{className:"dsh-mymem-cards",children:i?i.items.map(s=>(0,d.jsxs)("div",{className:"dsh-mymem-row","data-active":s.id===f?"1":"0",onClick:()=>y(s.id),onContextMenu:w=>I(Ae(w,v(s))),children:[(0,d.jsx)("span",{className:"dsh-mymem-avatar",children:(s.name||s.id).slice(0,1)}),(0,d.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,d.jsxs)("div",{className:"dsh-mymem-name",title:s.name||s.id,children:[s.name||s.id,i.activeId===s.id?(0,d.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,d.jsx)("div",{className:"dsh-mymem-path",title:s.path||s.display,children:s.display})]})]},s.id)):(0,d.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,d.jsx)("div",{className:"dsh-mymem-main",children:r==="memory"?(0,d.jsx)(Pe,{},`raw:${$}`):B?(0,d.jsx)(ve,{persona:B,onSaved:s=>p(w=>w&&{...w,items:w.items.map(j=>j.id===s.id?{...j,...s}:j)})},`${B.id}:${$}`):(0,d.jsx)("div",{className:"dsh-mymem-hint",children:i?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})}),(0,d.jsx)(Oe,{menu:E,onClose:K}),m?.kind==="create"?(0,d.jsx)(X,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:s=>Ue.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:m.onSubmit,onCancel:m.onCancel}):null,m?.kind==="renameDir"?(0,d.jsx)(X,{title:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",description:"\u6539\u7684\u662F\u78C1\u76D8\u4E0A\u7684\u89D2\u8272\u6587\u4EF6\u5939\u540D\uFF0C\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\u3002",label:"\u89D2\u8272\u76EE\u5F55",defaultValue:m.persona.id||"",placeholder:"\u4F8B\u5982 baby",confirmText:"\u66F4\u65B0",validate:s=>Ue.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:m.onSubmit,onCancel:m.onCancel}):null,m?.kind==="rename"?(0,d.jsx)(X,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:m.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:m.onSubmit,onCancel:m.onCancel}):null,m?.kind==="delete"?(0,d.jsx)($e,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${m.persona.name||m.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:m.onOk,onCancel:m.onCancel}):null]})}var Bt=require("react"),V=require("react/jsx-runtime");function it({size:e=16}){return(0,V.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,V.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,V.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,V.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function _e({size:e=16}){return(0,V.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,V.jsx)(it,{size:e})})}var A=J(require("react"),1);var C=require("react/jsx-runtime"),mt=[{key:"global",label:"\u5168\u5C40"},{key:"project",label:"\u9879\u76EE"}];function Fe(){let[e,a]=A.useState("global"),[t,o]=A.useState(null),[r,n]=A.useState([]),[i,p]=A.useState(!1),[f,y]=A.useState(!1),[k,l]=A.useState(""),[N,R]=A.useState(""),[E,I]=A.useState(""),x=A.useRef(0),b=t?.projectSlug||null,m=A.useCallback(async u=>{let c=++x.current;p(!0);try{let D=await we();if(c!==x.current)return;o(D);let K=D.projectSlug;if(u==="project"&&!K){n([]),l("");return}let Z=await re({scope:u,project:K});if(c!==x.current)return;n(Z.items),l("")}catch(D){if(c!==x.current)return;l(`\u52A0\u8F7D\u5931\u8D25\uFF1A${D?.message||D}`)}finally{c===x.current&&p(!1)}},[]);A.useEffect(()=>{Y()},[]),A.useEffect(()=>{m(e)},[m,e]);async function g(u){u?.preventDefault?.();let c=E.trim();if(!(!c||f)){y(!0),l(""),R("");try{await ke({scope:e,text:c,...e==="project"&&b?{project:b}:{}}),I(""),R("\u8BB0\u4F4F\u5566"),await m(e),setTimeout(()=>R(""),1500)}catch(D){l(`\u8BB0\u4E0B\u5931\u8D25\uFF1A${D?.message||D}`)}finally{y(!1)}}}async function $(u){l("");try{await Se(u),n(c=>c.filter(D=>D.id!==u)),await m(e)}catch(c){l(`\u5220\u9664\u5931\u8D25\uFF1A${c?.message||c}`),await m(e)}}let S=e==="global"?"\u5168\u5C40\u8BB0\u5FC6":`\u9879\u76EE\u8BB0\u5FC6 \xB7 ${t?.projectName||"\u5F53\u524D\u9879\u76EE"}`,U=e==="global"?"\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u8BA9\u5979\u8BB0\u4F4F\u70B9\u4EC0\u4E48\u5427\uFF5E":b?"\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u8BB0\u5FC6\u3002\u6280\u672F\u7EC6\u8282\u3001\u5751\u3001\u7EA6\u5B9A\u90FD\u53EF\u4EE5\u8BB0\u5728\u8FD9\u513F\uFF5E":"\u5F53\u524D\u76EE\u5F55\u4E0D\u5728 git \u4ED3\u5E93\u91CC\uFF0C\u6CA1\u6709\u9879\u76EE\u8BB0\u5FC6\u3002";return(0,C.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"memory-tab",children:[(0,C.jsxs)("div",{className:"dsh-mymem-head",children:[(0,C.jsx)("span",{className:"dsh-mymem-scope-name",children:S}),(0,C.jsx)("span",{className:"dsh-mymem-datadir",title:t?.dataDir||"",children:t?.dataDir?`\u6570\u636E\u76EE\u5F55 ${t.dataDir}`:""}),(0,C.jsx)("span",{className:"dsh-mymem-spacer"}),(0,C.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:i,onClick:()=>void m(e),children:i?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,C.jsx)("div",{className:"dsh-mymem-seg",role:"tablist","aria-label":"\u8BB0\u5FC6\u8303\u56F4",children:mt.map(u=>(0,C.jsxs)("button",{className:`dsh-mymem-seg-btn${e===u.key?" dsh-mymem-seg-btn--on":""}`,type:"button",role:"tab","aria-selected":e===u.key,onClick:()=>a(u.key),children:[u.label,t?` ${u.key==="global"?t.globalCount:t.projectCount}`:""]},u.key))}),e==="global"?(0,C.jsx)("div",{className:"dsh-mymem-hint",children:"\u5168\u5C40\u8BB0\u5FC6\u53EA\u653E\u300C\u4EBA\u76F8\u5173\u3001\u901A\u7528\u3001\u548C\u6280\u672F\u65E0\u5173\u300D\u7684\u5185\u5BB9\u3002"}):null,k?(0,C.jsx)("div",{className:"dsh-mymem-error",children:k}):null,(0,C.jsx)("div",{className:"dsh-mymem-list",children:r.length===0?(0,C.jsx)("div",{className:"dsh-mymem-empty",children:i?"\u8BFB\u53D6\u4E2D\u2026":U}):r.map(u=>(0,C.jsxs)("div",{className:"dsh-mymem-item",children:[(0,C.jsxs)("div",{className:"dsh-mymem-item-main",children:[(0,C.jsx)("div",{className:"dsh-mymem-item-summary",title:u.summary,children:u.summary}),(0,C.jsxs)("div",{className:"dsh-mymem-item-date",children:[u.date||"\u672A\u77E5\u65E5\u671F",u.title&&u.title!==u.summary?` \xB7 ${u.title}`:""]})]}),(0,C.jsx)("button",{className:"dsh-mymem-del",type:"button",title:"\u5220\u6389\u8FD9\u6761","aria-label":"\u5220\u6389\u8FD9\u6761",onClick:()=>void $(u.id),children:"\xD7"})]},u.id))}),(0,C.jsxs)("form",{className:"dsh-mymem-compose",onSubmit:g,children:[(0,C.jsx)("input",{className:"dsh-mymem-input",type:"text",value:E,placeholder:e==="global"?"\u8BB0\u4E00\u6761\u5173\u4E8E\u5979\u7684\uFF08\u504F\u597D\u3001\u79F0\u547C\u3001\u5FCC\u8BB3\u2026\uFF09":"\u8BB0\u4E00\u6761\u8FD9\u4E2A\u9879\u76EE\u7684\uFF08\u7EA6\u5B9A\u3001\u5751\u3001\u547D\u4EE4\u2026\uFF09",onChange:u=>I(u.target.value)}),(0,C.jsx)("button",{className:"dsh-mymem-btn",type:"submit",disabled:f||!E.trim(),children:f?"\u8BB0\u7740\u2026":"\u8BB0\u4E00\u6761"}),N?(0,C.jsx)("span",{className:"dsh-mymem-ok",children:N}):null]})]})}var dt="my-memory",lt=["slots","layout"],q="[my-memory]",pe="my-memory";function ct(e){let a=e?.remote?.directoryPicker;return{pick:typeof a?.pick=="function"?o=>a.pick(o):null,close(){try{e.layout.selectPanel(null)}catch(o){console.warn(q,"selectPanel(null) \u5931\u8D25",o)}}}}function ut(e,a,t,o,r,n){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(a,()=>e.slots.register({name:a,id:t,order:o,label:r},n)),`my-memory.${a}`),console.info(q,`\u5DF2\u6CE8\u518C ${a} \u2192 ${r()}`),!0}catch(i){return console.warn(q,`\u6CE8\u518C ${a} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,i),!1}}function pt(e,a){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let t=e.slots.register({name:"main",key:pe,inject:()=>({close:a.close,pick:a.pick})},Be),o=null;try{o=e.slots.register({name:"sidebar.panellist",id:pe,order:43,label:()=>"\u8BB0\u5FC6"},_e)}catch(r){try{t()}catch{}throw r}return()=>{try{o()}finally{try{t()}catch{}}}})),"my-memory.sidebar"),console.info(q,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(t){return console.warn(q,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",t),!1}}function yt(e){Y(),pt(e,ct(e)),ut(e,"conversation.view",pe,40,()=>"\u8BB0\u5FC6",Fe)}

		return module.exports;
	}
});
