window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var nt=Object.create;var me=Object.defineProperty;var ot=Object.getOwnPropertyDescriptor;var it=Object.getOwnPropertyNames;var mt=Object.getPrototypeOf,dt=Object.prototype.hasOwnProperty;var lt=(e,t)=>{for(var a in t)me(e,a,{get:t[a],enumerable:!0})},Se=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of it(t))!dt.call(e,n)&&n!==a&&me(e,n,{get:()=>t[n],enumerable:!(o=ot(t,n))||o.enumerable});return e};var V=(e,t,a)=>(a=e!=null?nt(mt(e)):{},Se(t||!e||!e.__esModule?me(a,"default",{value:e,enumerable:!0}):a,e)),ct=e=>Se(me({},"__esModule",{value:!0}),e);var Lt={};lt(Lt,{apply:()=>jt,inject:()=>Mt,name:()=>Dt,setTabLabelName:()=>at});module.exports=ct(Lt);var I=V(require("react"),1);var J=V(require("react"),1);var ut="/my-memory/api";async function se(e,t){let a=await fetch(`${ut}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),n;try{n=o?JSON.parse(o):null}catch{n={error:o.slice(0,500)}}if(!a.ok){let i=new Error(n&&(n.error||n.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=n,i}return n}function pt(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function de(e){let t=String(e?.id??""),a=String(e?.path??""),o=String(e?.display??"")||pt(a)||(t?`~\\${t}\\agent.md`:"");return{id:t,name:String(e?.name??""),body:String(e?.body??""),created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:a,display:o,virtual:e?.virtual===!0}}async function ie(){let e=await se("/personas"),t=Array.isArray(e?.items)?e.items.map(de):[],a=e?.activeId?String(e.activeId):t.find(o=>!o.virtual)?.id??null;return{items:t,activeId:a}}async function ke(e){let t=String(e?.dir??"").trim(),a=await se("/personas",{method:"POST",body:JSON.stringify({dir:t,name:t})});return de(a)}async function le(e,t){let a=await se(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(t??{})});return de(a)}function Re(e){return se(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function Ne(e){return se(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function Pe(e){return se(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function Ce(e,t){let a=await se(`/personas/${encodeURIComponent(String(e))}/rename`,{method:"POST",body:JSON.stringify({dir:String(t??"").trim()})});return de(a)}var G=require("react/jsx-runtime"),ht=1600;function Ee({persona:e,onSaved:t}={}){let[a,o]=J.useState(String(e?.name??"")),[n,i]=J.useState(String(e?.body??"")),[d,p]=J.useState(!1),[g,y]=J.useState(""),[w,h]=J.useState(""),P=J.useRef({name:String(e?.name??""),body:String(e?.body??"")}),C=J.useRef(!1),E=J.useRef(null);J.useEffect(()=>()=>{E.current&&clearTimeout(E.current)},[]);async function R(N){if(C.current)return;let f={name:N.name!==void 0?String(N.name):a,body:N.body!==void 0?String(N.body):n};if(!(f.name===P.current.name&&f.body===P.current.body)){C.current=!0,p(!0),h("");try{if(!e?.id)throw new Error("\u6CA1\u6709\u9009\u4E2D\u89D2\u8272\u5361");let r={};f.name!==P.current.name&&(r.name=f.name),f.body!==P.current.body&&(r.body=f.body);let l=await le(e.id,r),S={name:String(l?.name??f.name),body:String(l?.body??f.body)};P.current=S,o(S.name),i(S.body),t?.({...S,id:e.id,updated:Number(l?.updated)||0}),y("\u5DF2\u81EA\u52A8\u4FDD\u5B58"),E.current&&clearTimeout(E.current),E.current=setTimeout(()=>{E.current=null,y("")},ht)}catch(r){h(`\u4FDD\u5B58\u5931\u8D25\uFF1A${r?.message||r}`)}finally{C.current=!1,p(!1)}}}return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)("label",{className:"dsh-mymem-field",children:[(0,G.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,G.jsx)("input",{className:"dsh-mymem-input",value:a,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onChange:N=>o(N.target.value),onBlur:()=>void R({name:a})})]}),(0,G.jsxs)("div",{className:"dsh-mymem-hint",children:["\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",d?" \xB7 \u4FDD\u5B58\u4E2D\u2026":g?` \xB7 ${g}`:""]}),w?(0,G.jsx)("div",{className:"dsh-mymem-error",children:w}):null,(0,G.jsxs)("label",{className:"dsh-mymem-field",children:[(0,G.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,G.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:n,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onChange:N=>i(N.target.value),onBlur:()=>void R({body:n})})]})]})}var $=V(require("react"),1);var ft="/my-memory/api";async function W(e,t){let a=await fetch(`${ft}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),o=await a.text(),n;try{n=o?JSON.parse(o):null}catch{n={error:o.slice(0,500)}}if(!a.ok){let i=new Error(n&&(n.error||n.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=n,i}return n}async function De(e){let t=e?.scope==="project"?"project":"global",a=new URLSearchParams({scope:t});t==="project"&&e?.project&&a.set("project",String(e.project));let o=await W(`/memory?${a.toString()}`);return{items:(Array.isArray(o?.items)?o.items:[]).map(i=>({id:String(i?.id??""),summary:String(i?.summary??i?.text??""),date:String(i?.date??""),title:i?.title?String(i.title):"",tags:Array.isArray(i?.tags)?i.tags:[]}))}}async function he(){let e=await W("/memory/raw?scope=global");return{scope:String(e?.scope??"global"),path:String(e?.path??""),text:String(e?.text??""),rev:String(e?.rev??"")}}function fe(e){return W("/memory/raw",{method:"PUT",body:JSON.stringify({scope:e?.scope||"global",text:String(e?.text??""),baseRev:String(e?.baseRev??""),...e?.force?{force:!0}:{}})})}async function Me(){let e=await W("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??""),folderName:String(e?.folderName??"dsh-my-memory")}}function Te(e){return W("/settings/dataDir",{method:"POST",body:JSON.stringify({parent:String(e??"")})})}function ze(){return W("/settings/reveal",{method:"POST"})}async function ce(e){let t=await W(`/session/persona?session=${encodeURIComponent(String(e))}`);return{sessionId:String(t?.sessionId??e),personaId:t?.personaId?String(t.personaId):null,name:String(t?.name??""),locked:!!t?.locked}}function $e(e,t){return W("/session/persona",{method:"POST",body:JSON.stringify({session:String(e),personaId:String(t)})})}async function Ie(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await W(`/project/state${t}`);return{cwd:String(a?.cwd??""),memoryPath:String(a?.memoryPath??""),exists:!!a?.exists,enabled:!!a?.enabled,hasLegacy:!!a?.hasLegacy}}function je(e,t){return W("/project/state",{method:"POST",body:JSON.stringify({...e?{cwd:String(e)}:{},enabled:!!t})})}async function Le(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await W(`/project/raw${t}`);return{path:String(a?.path??""),text:String(a?.text??"")}}async function Oe(){let e=await W("/settings/prompt");return{path:String(e?.path??""),text:String(e?.text??""),defaultText:String(e?.defaultText??""),exists:!!e?.exists}}async function Ae(e){let t=await W("/settings/prompt",{method:"PUT",body:JSON.stringify({text:String(e??"")})});return{ok:t?.ok!==!1,path:String(t?.path??""),text:String(t?.text??"")}}function _e(e,t){let a=String(e??"").split(`
`),o=String(t??"").split(`
`);if(a.length>1500||o.length>1500)return[...a.map(w=>({kind:"del",text:w})),...o.map(w=>({kind:"add",text:w}))];let n=a.length,i=o.length,d=Array.from({length:n+1},()=>new Uint16Array(i+1));for(let w=n-1;w>=0;w-=1)for(let h=i-1;h>=0;h-=1)d[w][h]=a[w]===o[h]?d[w+1][h+1]+1:Math.max(d[w+1][h],d[w][h+1]);let p=[],g=0,y=0;for(;g<n&&y<i;)a[g]===o[y]?(p.push({kind:"same",text:a[g]}),g+=1,y+=1):d[g+1][y]>=d[g][y+1]?(p.push({kind:"del",text:a[g]}),g+=1):(p.push({kind:"add",text:o[y]}),y+=1);for(;g<n;)p.push({kind:"del",text:a[g]}),g+=1;for(;y<i;)p.push({kind:"add",text:o[y]}),y+=1;return p}function Be(e){let t=0,a=0;for(let o of e||[])o.kind==="add"?t+=1:o.kind==="del"&&(a+=1);return{added:t,removed:a}}var v=require("react/jsx-runtime");function yt(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Ue(){let e=new Date,t=a=>String(a).padStart(2,"0");return`${t(e.getHours())}:${t(e.getMinutes())}`}function Fe(){let[e,t]=$.useState(null),[a,o]=$.useState(!0),[n,i]=$.useState(""),[d,p]=$.useState(""),[g,y]=$.useState(""),[w,h]=$.useState(""),[P,C]=$.useState(!1),[E,R]=$.useState(""),[N,f]=$.useState(null),[r,l]=$.useState(null),S=d!==g,u=$.useRef(d),k=$.useRef(S),B=$.useRef(w);$.useEffect(()=>{u.current=d,k.current=S,B.current=w},[d,S,w]);let j=$.useCallback(async()=>{o(!0);try{let x=await he(),D=String(x?.text??"");t({path:String(x?.path??"")}),p(D),y(D),h(String(x?.rev??"")),f(null),i("")}catch(x){i(`\u8BFB\u53D6\u5931\u8D25\uFF1A${x?.message||x}`)}finally{o(!1)}},[]);$.useEffect(()=>{j()},[j]);async function F(){try{let x=await he(),D=String(x?.text??""),A=String(x?.rev??"");if(!k.current){p(D),y(D),h(A),f(null),i("");return}A&&A!==B.current&&f({text:D,rev:A})}catch{}}async function K(){if(!k.current||P)return;let x=u.current;C(!0),i("");try{let D=await fe({scope:"global",text:x,baseRev:B.current});h(String(D?.rev??"")),y(String(D?.text??x)),f(null),R(Ue())}catch(D){if(D?.status===409){let A=D.body||{};l({mode:"conflict",diskText:String(A.text??""),diskRev:String(A.rev??""),baseRev:String(A.baseRev??B.current)})}else i(`\u4FDD\u5B58\u5931\u8D25\uFF1A${D?.message||D}`)}finally{C(!1)}}async function ee(){C(!0),i("");try{let x=await fe({scope:"global",text:u.current,baseRev:B.current,force:!0});h(String(x?.rev??"")),y(String(x?.text??u.current)),f(null),l(null),R(Ue())}catch(x){i(`\u8986\u76D6\u5931\u8D25\uFF1A${x?.message||x}`)}finally{C(!1)}}function q(x,D){p(x),y(x),D&&h(D),f(null),l(null)}let X=r?_e(r.mode==="conflict"?r.diskText:r.text,d):[],te=Be(X);return(0,v.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"global-memory",children:[(0,v.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,v.jsx)("span",{className:"dsh-mymem-hint",title:e?.path||"",children:e?.path?`\u6587\u4EF6\uFF1A${yt(e.path)}`:""}),(0,v.jsx)("span",{className:"dsh-mymem-spacer"}),(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:a||P,onClick:()=>void j(),children:a?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),N&&!r?(0,v.jsxs)("div",{className:"dsh-mymem-remotebar",children:[(0,v.jsx)("span",{children:"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u66F4\u65B0"}),(0,v.jsx)("span",{className:"dsh-mymem-raw-grow"}),(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>l({mode:"compare",text:N.text,rev:N.rev}),children:"\u5BF9\u6BD4"})]}):null,n?(0,v.jsx)("div",{className:"dsh-mymem-error",children:n}):null,(0,v.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:d,spellCheck:!1,placeholder:"\u8FD9\u91CC\u662F MEMORY.md \u7684\u539F\u6587\uFF0C\u76F4\u63A5\u6539\u5C31\u884C\uFF1B\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",onFocus:()=>void F(),onBlur:()=>void K(),onChange:x=>p(x.target.value)}),r?(0,v.jsxs)("div",{className:"dsh-mymem-diff","data-kind":r.mode,children:[(0,v.jsxs)("div",{className:"dsh-mymem-diff-head",children:[(0,v.jsx)("span",{className:"dsh-mymem-diff-title",children:r.mode==="conflict"?"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u7ECF\u88AB\u6539\u8FC7":"\u548C\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5BF9\u6BD4"}),(0,v.jsxs)("span",{className:"dsh-mymem-diff-count",children:["\u65B0\u589E ",te.added," \u884C \xB7 \u5220\u9664 ",te.removed," \u884C"]})]}),(0,v.jsx)("div",{className:"dsh-mymem-diff-body",children:X.map((x,D)=>(0,v.jsxs)("div",{className:"dsh-mymem-diffline","data-kind":x.kind,children:[(0,v.jsx)("span",{className:"dsh-mymem-diffmark",children:x.kind==="add"?"+":x.kind==="del"?"\u2212":" "}),(0,v.jsx)("span",{className:"dsh-mymem-difftext",children:x.text||" "})]},D))}),(0,v.jsx)("div",{className:"dsh-mymem-diff-actions",children:r.mode==="conflict"?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:P,onClick:()=>void ee(),children:"\u7528\u6211\u7684\u8986\u76D6"}),(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>q(r.diskText,r.diskRev),children:"\u7528\u78C1\u76D8\u7684"}),(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>l(null),children:"\u53D6\u6D88"})]}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>q(r.text,r.rev),children:"\u7528\u78C1\u76D8\u7684"}),(0,v.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>l(null),children:"\u5173\u95ED"})]})})]}):null,(0,v.jsxs)("div",{className:"dsh-mymem-raw-status",children:[P?"\u4FDD\u5B58\u4E2D\u2026":E?`\u5DF2\u4FDD\u5B58 \xB7 ${E}`:"\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58",S&&!P?" \xB7 \u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8":""]})]})}var z=V(require("react"),1);var H=V(require("react"),1),ye=V(require("react-dom"),1),L=require("react/jsx-runtime");function Ge(e,t){let a=H.useRef(null);H.useEffect(()=>{a.current=typeof document<"u"?document.activeElement:null;let o=t.current;return o&&(o.focus(),typeof o.select=="function"&&o.select()),()=>{let n=a.current;if(n&&typeof n.focus=="function"&&document.contains(n))try{n.focus()}catch{}}},[t]),H.useEffect(()=>{let o=n=>{n.key==="Escape"&&e?.()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[e])}function ne({title:e,description:t,label:a,defaultValue:o="",placeholder:n,confirmText:i="\u786E\u5B9A",validate:d,allowEmpty:p=!1,onSubmit:g,onCancel:y}){let[w,h]=H.useState(o),[P,C]=H.useState(""),[E,R]=H.useState(!1),N=H.useRef(null);Ge(y,N);let f=w.trim(),r=f&&d?d(f):"",l=(p||!!f)&&!r&&!E;async function S(){if(l){if(d&&f){let u=d(f);if(u){C(u);return}}R(!0),C("");try{await g?.(f)}catch(u){C(String(u?.message||u))}finally{R(!1)}}}return typeof document>"u"?null:ye.createPortal((0,L.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:u=>{u.target===u.currentTarget&&y?.()},children:(0,L.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,L.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,L.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,a?(0,L.jsx)("div",{className:"dsh-mymem-modal-label",children:a}):null,(0,L.jsx)("input",{ref:N,className:"dsh-mymem-input",value:w,placeholder:n||"",spellCheck:!1,onChange:u=>{h(u.target.value),C("")},onKeyDown:u=>{u.key==="Enter"&&(u.preventDefault(),S())}}),r||P?(0,L.jsx)("div",{className:"dsh-mymem-modal-error",children:P||r}):null,(0,L.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,L.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>y?.(),children:"\u53D6\u6D88"}),(0,L.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!l,onClick:()=>void S(),children:E?"\u5904\u7406\u4E2D\u2026":i})]})]})}),document.body)}function We({title:e,message:t,confirmText:a="\u786E\u5B9A",danger:o,onOk:n,onCancel:i}){let d=H.useRef(null);return Ge(i,d),H.useEffect(()=>{let p=g=>{g.key==="Enter"&&(g.preventDefault(),n?.())};return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[n]),typeof document>"u"?null:ye.createPortal((0,L.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:p=>{p.target===p.currentTarget&&i?.()},children:(0,L.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,L.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,L.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,(0,L.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,L.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>i?.(),children:"\u53D6\u6D88"}),(0,L.jsx)("button",{ref:d,className:`dsh-mymem-btn${o?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>n?.(),children:a})]})]})}),document.body)}var M=require("react/jsx-runtime");function ue(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function Je({onChanged:e,pick:t}={}){let[a,o]=z.useState(null),[n,i]=z.useState(""),[d,p]=z.useState(""),[g,y]=z.useState(""),[w,h]=z.useState(!1),[P,C]=z.useState(!1),[E,R]=z.useState(!1),[N,f]=z.useState(""),[r,l]=z.useState(""),[S,u]=z.useState(""),[k,B]=z.useState(!1),[j,F]=z.useState(!1),[K,ee]=z.useState(""),q=z.useRef(null);z.useEffect(()=>()=>{q.current&&clearTimeout(q.current)},[]);let X=z.useCallback(async()=>{try{let m=await Me();o(m),m?.promptPath&&l(String(m.promptPath)),i("")}catch(m){i(`\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A${m?.message||m}`)}},[]),te=z.useCallback(async()=>{try{let m=await Oe();f(String(m.text??"").replace(/\s+$/,"")),u(m.defaultText),m.path&&l(m.path),B(!0)}catch(m){ee(`\u8BFB\u53D6\u5168\u5C40\u63D0\u793A\u8BCD\u5931\u8D25\uFF1A${m?.message||m}`)}},[]);z.useEffect(()=>{X(),te()},[X,te]);function x(m){p(m),q.current&&clearTimeout(q.current),q.current=setTimeout(()=>{q.current=null,p("")},2600)}let D=a?.folderName||"dsh-my-memory",A=typeof t=="function";async function re(m){R(!0),i("");try{let ae=await Te(m);h(!1),y(String(ae?.movedFrom??"")),await X(),x(`\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362\uFF1A${ue(String(ae?.dataDir??""))}`),e?.()}catch(ae){throw new Error(String(ae?.message||ae))}finally{R(!1)}}async function pe(){if(i(""),!A){h(!0);return}C(!0);try{let m=await t();if(!m)return;await re(m)}catch(m){i(`\u9009\u62E9\u76EE\u5F55\u5931\u8D25\uFF1A${m?.message||m}`)}finally{C(!1)}}async function s(){F(!0),ee("");try{let m=await Ae(N);f(String(m.text??"").replace(/\s+$/,"")),x("\u5168\u5C40\u63D0\u793A\u8BCD\u5DF2\u4FDD\u5B58\uFF0C\u4E0B\u4E00\u8F6E\u5BF9\u8BDD\u751F\u6548")}catch(m){ee(`\u4FDD\u5B58\u5168\u5C40\u63D0\u793A\u8BCD\u5931\u8D25\uFF1A${m?.message||m}`)}finally{F(!1)}}async function b(){i("");try{await ze()}catch(m){i(`\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A${m?.message||m}`)}}return(0,M.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,M.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,M.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5168\u5C40\u8BB0\u5FC6\u3001\u9879\u76EE\u8BB0\u5FC6\u90FD\u5B58\u5728\u8FD9\u4E2A\u76EE\u5F55\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,M.jsx)("div",{className:"dsh-mymem-settings-path",title:a?.dataDir||"",children:a?.dataDir||(a?"\uFF08\u7A7A\uFF09":"\u8BFB\u53D6\u4E2D\u2026")}),(0,M.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,M.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a,onClick:()=>void b(),children:"\u6253\u5F00\u76EE\u5F55"}),(0,M.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!a||P||E,onClick:()=>void pe(),children:P?"\u9009\u62E9\u4E2D\u2026":"\u66F4\u6539\u76EE\u5F55"}),d?(0,M.jsx)("span",{className:"dsh-mymem-ok",children:d}):null]}),(0,M.jsxs)("div",{className:"dsh-mymem-hint",children:["\u66F4\u6539\u76EE\u5F55\u65F6\u9009\u7684\u662F\u7236\u76EE\u5F55\uFF0C\u6570\u636E\u56FA\u5B9A\u653E\u5728 ",(0,M.jsx)("code",{children:D})," \u5B50\u76EE\u5F55\u91CC\uFF1A\u4F8B\u5982\u9009\u4E86 D:\\projects\uFF0C\u5B9E\u9645\u4F4D\u7F6E\u662F D:\\projects\\"+D+"\u3002"]}),a?.defaultDataDir?(0,M.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",ue(a.defaultDataDir),"\uFF08\u4E0D\u9009 = \u4F7F\u7528\u9ED8\u8BA4\uFF09"]}):null,g?(0,M.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",ue(g),"\uFF1B\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u624B\u52A8\u590D\u5236\u8FC7\u6765\u3002"]}):null,n?(0,M.jsx)("div",{className:"dsh-mymem-error",children:n}):null,(0,M.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u5168\u5C40\u63D0\u793A\u8BCD"}),(0,M.jsxs)("div",{className:"dsh-mymem-hint",children:["\u5BF9\u6240\u6709\u89D2\u8272\u751F\u6548\u3002\u63D2\u4EF6\u628A\u5B83\u5B58\u6210\u6570\u636E\u6839\u4E0B\u7684 ",(0,M.jsx)("code",{children:"AGENT.md"}),"\uFF0C\u4F60\u4E5F\u53EF\u4EE5\u76F4\u63A5\u6539\u8FD9\u4E2A\u6587\u4EF6\uFF0C\u4E0B\u4E00\u8F6E\u5BF9\u8BDD\u751F\u6548\uFF1B\u7559\u7A7A = \u4E0D\u6CE8\u5165\u8FD9\u6BB5\u8981\u6C42\u3002"]}),(0,M.jsx)("textarea",{className:"dsh-mymem-textarea dsh-mymem-settings-textarea",value:N,disabled:!k||j,spellCheck:!1,placeholder:k?"\u7559\u7A7A = \u4E0D\u6CE8\u5165\u8FD9\u6BB5\u8981\u6C42":"\u8BFB\u53D6\u4E2D\u2026",onChange:m=>f(m.target.value)}),(0,M.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,M.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!k||j,onClick:()=>void s(),children:j?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"}),(0,M.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:!k||j,onClick:()=>f(S),children:"\u6062\u590D\u9ED8\u8BA4"}),r?(0,M.jsx)("span",{className:"dsh-mymem-hint",title:r,children:ue(r)}):null]}),K?(0,M.jsx)("div",{className:"dsh-mymem-error",children:K}):null,w?(0,M.jsx)(ne,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:`\u9009\u4E00\u4E2A\u7236\u76EE\u5F55\uFF08\u7559\u7A7A = \u4F7F\u7528\u9ED8\u8BA4\u76EE\u5F55\uFF09\u3002\u6570\u636E\u4F1A\u653E\u5728\u6240\u9009\u76EE\u5F55\u4E0B\u7684 ${D} \u91CC\u3002`,label:"\u7236\u76EE\u5F55",defaultValue:"",placeholder:"\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u4F8B\u5982 D:\\projects",confirmText:E?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:re,onCancel:()=>h(!1)}):null]})}var He=V(require("react"),1),Ke=V(require("react-dom"),1),be=require("react/jsx-runtime"),bt=160,gt=130;function Ve({menu:e,onClose:t}){if(He.useEffect(()=>{if(!e)return;let d=()=>t(),p=g=>{g.key==="Escape"&&t()};return document.addEventListener("mousedown",d),document.addEventListener("keydown",p),window.addEventListener("blur",d),()=>{document.removeEventListener("mousedown",d),document.removeEventListener("keydown",p),window.removeEventListener("blur",d)}},[e,t]),!e||typeof document>"u")return null;let a=window.innerWidth||0,o=window.innerHeight||0,n=Math.max(4,Math.min(e.x,a-bt-6)),i=Math.max(4,Math.min(e.y,o-gt-6));return Ke.createPortal((0,be.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:n,top:i,zIndex:2147483002},onMouseDown:d=>d.stopPropagation(),children:e.items.map(d=>(0,be.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:d.disabled,onClick:()=>{t(),d.onClick?.()},children:d.label},d.label))}),document.body)}function qe(e,t){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:t}}var Xe="dsh-my-memory-style",xt=`
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
/* \u300C\u7A7A\u767D\u300D\u865A\u62DF\u5361\u7684\u300C\u4E0D\u6CE8\u5165\u300D\u5FBD\u7AE0\uFF1A\u6BD4\u300C\u9ED8\u8BA4\u300D\u66F4\u6DE1\uFF0C\u4E00\u773C\u770B\u51FA\u5B83\u4E0D\u662F\u4E00\u5F20\u771F\u6B63\u7684\u5361 */
.dsh-mymem-badge-none {
  opacity: 0.65;
  border-style: dashed;
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
/* \u5168\u5C40\u63D0\u793A\u8BCD\u8F93\u5165\u6846\uFF1A\u6BD4\u666E\u901A textarea \u77EE\u4E00\u70B9\uFF0C\u514D\u5F97\u628A\u4E0B\u9762\u7684\u6309\u94AE/\u5F39\u7A97\u6324\u51FA\u89C6\u91CE */
.dsh-mymem-settings-textarea { min-height: 88px; max-height: 240px; }


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
  /* \u5BBD\u5EA6\u8DDF\u7740\u5185\u5BB9\u8D70\uFF1A\u83DC\u5355\u91CC\u53EA\u6709\u89D2\u8272\u540D\uFF0C\u5199\u6B7B\u5BBD\u5EA6\u4F1A\u62D6\u51FA\u4E00\u5927\u7247\u7A7A\u767D */
  width: max-content;
  /* \u6709\u70B9\u6700\u5C0F\u5BBD\u5EA6\uFF0C\u52FE\u624D\u5BF9\u5F97\u9F50\u53F3\u8FB9\u7F18\uFF1B\u540C\u65F6\u4E0D\u81F3\u4E8E\u7A7A\u4E00\u5927\u7247 */
  min-width: 188px;
  max-width: 280px;
  padding: 6px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-overlay, #2b2f38));
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}
.dsh-mymem-heromenu-list { min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 1px; }
.dsh-mymem-heroitem {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-mymem-heroitem:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12)); }
.dsh-mymem-heroitem:disabled { cursor: default; }
.dsh-mymem-heroitem[data-active="1"] .dsh-mymem-heroitem-name { font-weight: 600; }
.dsh-mymem-heroitem-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dsh-mymem-heroitem-name { font-size: 13px; font-weight: 600; }
.dsh-mymem-heroitem-check {
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 12px;
  line-height: 1;
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

`;function Y(){if(typeof document>"u"||document.getElementById(Xe))return;let e=document.createElement("style");e.id=Xe,e.textContent=xt,document.head.appendChild(e)}var c=require("react/jsx-runtime"),vt=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],wt=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],Ye=/^[A-Za-z0-9._-]{1,40}$/;function Ze({close:e,pick:t}={}){let[a,o]=I.useState("persona"),[n,i]=I.useState("role"),[d,p]=I.useState(null),[g,y]=I.useState(null),[w,h]=I.useState(""),[P,C]=I.useState(""),[E,R]=I.useState(null),[N,f]=I.useState(null),[r,l]=I.useState(null),[S,u]=I.useState(0),k=I.useRef(null);I.useEffect(()=>(Y(),()=>{k.current&&clearTimeout(k.current)}),[]);let B=I.useCallback(s=>{C(s),k.current&&clearTimeout(k.current),k.current=setTimeout(()=>{k.current=null,C("")},1600)},[]),j=I.useCallback(async()=>{let s=await ie();return p(s),y(b=>b&&s.items.some(m=>m.id===b)?b:s.activeId??s.items.find(m=>!m.virtual)?.id??null),s},[]);I.useEffect(()=>{let s=!0;return(async()=>{try{let b=await ie();if(!s)return;p(b),y(b.activeId??b.items.find(m=>!m.virtual)?.id??null),De({scope:"global"}).then(m=>{s&&f(m.items.length)}).catch(()=>{})}catch(b){s&&h(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${b?.message||b}`)}})(),()=>{s=!1}},[]);async function F(s){h("");try{await s(),await j()}catch(b){h(String(b?.message||b))}}let K=I.useCallback(()=>R(null),[]);function ee(){l({kind:"create",onCancel:()=>l(null),onSubmit:async s=>{h("");try{let b=await ke({dir:s});l(null),await j(),b?.id&&y(b.id),i("role")}catch(b){let m=String(b?.message||b);throw h(`\u65B0\u5EFA\u5931\u8D25\uFF1A${m}`),new Error(m)}}})}function q(s){l({kind:"rename",persona:s,onCancel:()=>l(null),onSubmit:async b=>{await le(s.id,{name:b}),l(null),await j()}})}function X(s){l({kind:"delete",persona:s,onCancel:()=>l(null),onOk:async()=>{l(null),await F(()=>Re(s.id))}})}function te(s){l({kind:"renameDir",persona:s,onCancel:()=>l(null),onSubmit:async b=>{h("");try{let m=await Ce(s.id,b);l(null),await j(),m?.id&&y(m.id),B("\u76EE\u5F55\u5DF2\u66F4\u65B0")}catch(m){throw h(`\u66F4\u65B0\u76EE\u5F55\u5931\u8D25\uFF1A${String(m?.message||m)}`),new Error(String(m?.message||m))}}})}function x(s){let b=!!d&&d.activeId===s.id,m=[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:b,onClick:()=>F(()=>Ne(s.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>F(async()=>{await Pe(s.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>te(s)},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>X(s)}];return s.virtual?m.map((ae,rt)=>({...ae,disabled:rt===0?b:!0})):m}async function D(){h("");try{await j(),u(s=>s+1)}catch(s){h(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${s?.message||s}`)}}let A=d?.items.find(s=>s.id===g)||null,re=d?.items.find(s=>s.id===d.activeId)||A,pe=[N===null?"":`${N} \u6761\u957F\u671F\u8BB0\u5FC6`,re?`\u5F53\u524D\u89D2\u8272 ${re.name||re.id}`:""].filter(Boolean).join(" \xB7 ");return(0,c.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,c.jsxs)("div",{className:"dsh-mymem-head",children:[(0,c.jsx)("div",{className:"dsh-mymem-title",children:"\u8BB0\u5FC6"}),(0,c.jsx)("div",{className:"dsh-mymem-sub",children:pe}),(0,c.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,c.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",onClick:()=>e(),children:"\xD7"}):null]}),(0,c.jsx)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:vt.map(s=>(0,c.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":a===s.key,"data-active":a===s.key?"1":"0",onClick:()=>o(s.key),children:s.label},s.key))}),a==="settings"?(0,c.jsx)(Je,{onChanged:D,pick:t}):(0,c.jsx)(c.Fragment,{children:(0,c.jsxs)("div",{className:"dsh-mymem-body",children:[(0,c.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,c.jsxs)("div",{className:"dsh-mymem-toolbar-left",children:[(0,c.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:ee,children:"\uFF0B \u65B0\u5EFA"}),P?(0,c.jsx)("span",{className:"dsh-mymem-ok",children:P}):null]}),(0,c.jsx)("div",{className:"dsh-mymem-toolbar-right",children:(0,c.jsx)("div",{className:"dsh-mymem-inner-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:wt.map(s=>(0,c.jsx)("button",{className:"dsh-mymem-inner-tab",type:"button",role:"tab","aria-selected":n===s.key,"data-active":n===s.key?"1":"0",onClick:()=>i(s.key),children:s.label},s.key))})})]}),w?(0,c.jsx)("div",{className:"dsh-mymem-error",children:w}):null,(0,c.jsxs)("div",{className:"dsh-mymem-split",children:[(0,c.jsx)("div",{className:"dsh-mymem-side",children:(0,c.jsx)("div",{className:"dsh-mymem-cards",children:d?d.items.map(s=>(0,c.jsxs)("div",{className:"dsh-mymem-row","data-active":s.id===g?"1":"0",onClick:()=>y(s.id),onContextMenu:b=>R(qe(b,x(s))),children:[(0,c.jsx)("span",{className:"dsh-mymem-avatar",children:(s.name||s.id).slice(0,1)}),(0,c.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,c.jsxs)("div",{className:"dsh-mymem-name",title:s.name||s.id,children:[s.name||s.id,s.virtual?(0,c.jsx)("span",{className:"dsh-mymem-badge dsh-mymem-badge-none",children:"\u4E0D\u6CE8\u5165"}):null,d.activeId===s.id?(0,c.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,c.jsx)("div",{className:"dsh-mymem-path",title:s.path||s.display,children:s.display})]})]},s.id)):(0,c.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,c.jsx)("div",{className:"dsh-mymem-main",children:n==="memory"?(0,c.jsx)(Fe,{},`raw:${S}`):A&&!A.virtual?(0,c.jsx)(Ee,{persona:A,onSaved:s=>p(b=>b&&{...b,items:b.items.map(m=>m.id===s.id?{...m,...s}:m)})},`${A.id}:${S}`):A?null:(0,c.jsx)("div",{className:"dsh-mymem-hint",children:d?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})}),(0,c.jsx)(Ve,{menu:E,onClose:K}),r?.kind==="create"?(0,c.jsx)(ne,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:s=>Ye.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:r.onSubmit,onCancel:r.onCancel}):null,r?.kind==="renameDir"?(0,c.jsx)(ne,{title:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",description:"\u6539\u7684\u662F\u78C1\u76D8\u4E0A\u7684\u89D2\u8272\u6587\u4EF6\u5939\u540D\uFF0C\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\u3002",label:"\u89D2\u8272\u76EE\u5F55",defaultValue:r.persona.id||"",placeholder:"\u4F8B\u5982 baby",confirmText:"\u66F4\u65B0",validate:s=>Ye.test(s)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:r.onSubmit,onCancel:r.onCancel}):null,r?.kind==="rename"?(0,c.jsx)(ne,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:r.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:r.onSubmit,onCancel:r.onCancel}):null,r?.kind==="delete"?(0,c.jsx)(We,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${r.persona.name||r.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:r.onOk,onCancel:r.onCancel}):null]})}var ia=require("react"),Z=require("react/jsx-runtime");function St({size:e=16}){return(0,Z.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,Z.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,Z.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,Z.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function Qe({size:e=16}){return(0,Z.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,Z.jsx)(St,{size:e})})}var U=V(require("react"),1);var _=require("react/jsx-runtime");function kt(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function Rt(e){return e?.session?.cwd||e?.cwd||e?.session?.workingDirectory||null}function ge(e){let t=kt(e),a=Rt(e),[o,n]=U.useState(null),[i,d]=U.useState(null),[p,g]=U.useState(null),[y,w]=U.useState(!0),[h,P]=U.useState(!1),[C,E]=U.useState(""),R=U.useRef(0);U.useEffect(()=>{Y()},[]);let N=U.useCallback(async()=>{let u=++R.current;w(!0);try{let k=await Ie(a);if(u!==R.current)return;d(k);try{let B=await Le(a);u===R.current&&g(B)}catch{u===R.current&&g({path:"",text:""})}E("")}catch(k){u===R.current&&E(`\u8BFB\u53D6\u5931\u8D25\uFF1A${k?.message||k}`)}finally{u===R.current&&w(!1)}},[a]);U.useEffect(()=>{N()},[N]),U.useEffect(()=>{let u=!0;if(t)return(async()=>{try{let k=await ce(t);u&&(n(k),k?.name&&e.onPersonaName?.(k.name))}catch{}})(),()=>{u=!1}},[t]);let f=!!i?.enabled;async function r(){if(!(h||!i)){P(!0),E("");try{await je(a,!f),await N()}catch(u){E(`\u5207\u6362\u5931\u8D25\uFF1A${u?.message||u}`)}finally{P(!1)}}}let l=String(p?.text??""),S=l.trim().length>0;return(0,_.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"session-memory",children:[(0,_.jsxs)("div",{className:"dsh-mymem-head",children:[(0,_.jsx)("span",{className:"dsh-mymem-scope-name",children:o?.name||"\u672A\u7ED1\u5B9A\u89D2\u8272"}),(0,_.jsx)("span",{className:"dsh-mymem-spacer"}),(0,_.jsxs)("span",{className:"dsh-mymem-switch",children:[(0,_.jsx)("span",{className:"dsh-mymem-switch-label",children:"\u5C40\u90E8\u8BB0\u5FC6"}),(0,_.jsx)("button",{type:"button",role:"switch","aria-checked":f,"aria-label":"\u5C40\u90E8\u8BB0\u5FC6",className:"dsh-mymem-switch-track","data-on":f?"1":"0",disabled:h||y||!i,onClick:()=>void r(),children:(0,_.jsx)("span",{className:"dsh-mymem-switch-thumb"})})]})]}),C?(0,_.jsx)("div",{className:"dsh-mymem-error",children:C}):null,(0,_.jsxs)("div",{className:"dsh-mymem-local","data-off":f?"0":"1",children:[S?(0,_.jsx)("pre",{className:"dsh-mymem-raw-pre dsh-mymem-localpre",children:l}):(0,_.jsx)("div",{className:"dsh-mymem-empty",children:y?"\u8BFB\u53D6\u4E2D\u2026":f?"\u8FD8\u6CA1\u6709\u5C40\u90E8\u8BB0\u5FC6":"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}),!f&&S?(0,_.jsx)("div",{className:"dsh-mymem-localmask",children:"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}):null]}),(0,_.jsx)("div",{className:"dsh-mymem-hint",children:"\u5173\u95ED\u53EA\u662F\u4E0D\u518D\u8BB0\u5F55\uFF0C\u5DF2\u6709\u5185\u5BB9\u4E0D\u4F1A\u5220\u9664\u3002"})]})}var O=V(require("react"),1),et=V(require("react-dom"),1);var T=require("react/jsx-runtime");function Nt(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function Pt({size:e=14}){return(0,T.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:[(0,T.jsx)("circle",{cx:"12",cy:"8.2",r:"3.4",stroke:"currentColor",strokeWidth:"1.7"}),(0,T.jsx)("path",{d:"M5.2 19.2c.9-3.3 3.6-5.2 6.8-5.2s5.9 1.9 6.8 5.2",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"})]})}function Ct({size:e=12}){return(0,T.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,T.jsx)("path",{d:"M6 9.5 12 15l6-5.5",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})}function Et({sessionId:e}){let[t,a]=O.useState(null),[o,n]=O.useState(null),[i,d]=O.useState(!1),[p,g]=O.useState(null),[y,w]=O.useState(""),[h,P]=O.useState(!1),C=O.useRef(null),E=O.useRef(null);O.useEffect(()=>{Y()},[]),O.useEffect(()=>{let r=!0;return(async()=>{try{let l=await ie();r&&a(l.items||[])}catch{r&&a([])}try{let l=await ce(e);r&&n(l)}catch{}})(),()=>{r=!1}},[e]);let R=O.useCallback(()=>{let r=C.current;if(!r)return;let l=r.getBoundingClientRect(),S=window.innerWidth||0,u=window.innerHeight||0,k=E.current?.offsetWidth||0,B=E.current?.offsetHeight||0,j=l.left;k&&j+k>S-8&&(j=Math.max(8,S-8-k));let F=l.bottom+6;B&&F+B>u-8&&(F=Math.max(8,l.top-6-B)),g(K=>K&&K.left===j&&K.top===F?K:{left:j,top:F})},[]);O.useLayoutEffect(()=>{i&&R()},[i,p?.left,p?.top,R]),O.useEffect(()=>{if(!i)return;R();let r=u=>{C.current?.contains(u.target)||u.target?.closest?.(".dsh-mymem-heromenu")||d(!1)},l=u=>{u.key==="Escape"&&d(!1)},S=()=>R();return document.addEventListener("mousedown",r),document.addEventListener("keydown",l),window.addEventListener("resize",S),window.addEventListener("scroll",S,!0),()=>{document.removeEventListener("mousedown",r),document.removeEventListener("keydown",l),window.removeEventListener("resize",S),window.removeEventListener("scroll",S,!0)}},[i,R]);let N=o?.name||"\u9009\u62E9\u89D2\u8272";async function f(r){if(!h){if(r.id===o?.personaId){d(!1);return}P(!0),w("");try{let l=await $e(e,r.id);n({sessionId:e,personaId:String(l?.personaId??r.id),name:String(l?.name??r.name??"")}),d(!1)}catch(l){w(`\u7ED1\u5B9A\u5931\u8D25\uFF1A${l?.message||l}`)}finally{P(!1)}}}return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)("button",{ref:C,type:"button",className:"dsh-mymem-herobtn","aria-haspopup":"listbox","aria-expanded":i,onClick:()=>d(r=>!r),children:[(0,T.jsx)("span",{className:"dsh-mymem-herobtn-icon",children:(0,T.jsx)(Pt,{})}),(0,T.jsx)("span",{className:"dsh-mymem-herobtn-label",children:N}),(0,T.jsx)("span",{className:"dsh-mymem-herobtn-chev",children:(0,T.jsx)(Ct,{})})]}),i&&p&&typeof document<"u"?et.createPortal((0,T.jsxs)("div",{ref:E,className:"dsh-mymem-heromenu",style:{position:"fixed",left:p.left,top:p.top},children:[y?(0,T.jsx)("div",{className:"dsh-mymem-heromenu-err",children:y}):null,(0,T.jsxs)("div",{className:"dsh-mymem-heromenu-list",role:"listbox",children:[(t||[]).map(r=>{let l=r.id===o?.personaId;return(0,T.jsxs)("button",{type:"button",role:"option","aria-selected":l,className:"dsh-mymem-heroitem","data-active":l?"1":"0",disabled:h,onClick:()=>void f(r),children:[(0,T.jsx)("span",{className:"dsh-mymem-heroitem-main",children:(0,T.jsx)("span",{className:"dsh-mymem-heroitem-name",children:r.name||r.id})}),l?(0,T.jsx)("span",{className:"dsh-mymem-heroitem-check",children:"\u2713"}):null]},r.id)}),t&&t.length===0?(0,T.jsx)("div",{className:"dsh-mymem-heromenu-hint",children:"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361"}):null]})]}),document.body):null]})}function tt(e){let t=Nt(e);return t?(0,T.jsx)(Et,{sessionId:String(t)}):null}var Dt="my-memory",Mt=["slots","layout"],Q="[my-memory]",xe="my-memory";function Tt(e){let t=globalThis.__DSH_DIRECTORY_PICKER__;return{pick:typeof t?.pick=="function"?()=>t.pick():null,close(){try{e.layout.selectPanel(null)}catch(o){console.warn(Q,"selectPanel(null) \u5931\u8D25",o)}}}}function zt(e,t,a,o,n,i){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:o,label:n},i)),`my-memory.${t}`),console.info(Q,`\u5DF2\u6CE8\u518C ${t} \u2192 ${n()}`),!0}catch(d){return console.warn(Q,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,d),!1}}function $t(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:xe,inject:()=>({close:t.close,pick:t.pick})},Ze),o=null;try{o=e.slots.register({name:"sidebar.panellist",id:xe,order:43,label:()=>"\u8BB0\u5FC6"},Qe)}catch(n){try{a()}catch{}throw n}return()=>{try{o()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(Q,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(Q,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}var ve="\u8BB0\u5FC6",we=null,oe=null;function at(e){let t=String(e||"").trim();if(!(!t||t===ve)&&(ve=t,!(!we||typeof oe!="function"))){try{oe()}catch{}try{oe=we.slots.register(st(),ge)}catch(a){console.warn(Q,"\u91CD\u65B0\u6CE8\u518C\u4F1A\u8BDD\u9875\u5931\u8D25",a)}}}function st(){return{name:"conversation.view",id:xe,order:40,label:()=>ve,inject:()=>({onPersonaName:at})}}function It(e){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return we=e,e.effect(()=>e.slots.inject("conversation.view",()=>(oe=e.slots.register(st(),ge),()=>{try{oe()}catch{}oe=null})),"my-memory.conversation.view"),console.info(Q,"\u5DF2\u6CE8\u518C\u4F1A\u8BDD\u9875\uFF08\u6807\u7B7E\u540D\u968F\u540E\u8DDF\u7740\u89D2\u8272\u540D\u8D70\uFF09"),!0}catch(t){return console.warn(Q,"\u6CE8\u518C conversation.view \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09",t),!1}}function jt(e){Y(),$t(e,Tt(e)),It(e),zt(e,"conversation.hero.options","my-memory-persona",10,()=>"\u89D2\u8272",tt)}

		return module.exports;
	}
});
