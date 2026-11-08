window.__ModuleLoader__.load({
	id: "@local/dsh-my-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var yt=Object.create;var fe=Object.defineProperty;var bt=Object.getOwnPropertyDescriptor;var gt=Object.getOwnPropertyNames;var vt=Object.getPrototypeOf,xt=Object.prototype.hasOwnProperty;var wt=(e,t)=>{for(var a in t)fe(e,a,{get:t[a],enumerable:!0})},De=(e,t,a,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of gt(t))!xt.call(e,r)&&r!==a&&fe(e,r,{get:()=>t[r],enumerable:!(s=bt(t,r))||s.enumerable});return e};var Q=(e,t,a)=>(a=e!=null?yt(vt(e)):{},De(t||!e||!e.__esModule?fe(a,"default",{value:e,enumerable:!0}):a,e)),kt=e=>De(fe({},"__esModule",{value:!0}),e);var Kt={};wt(Kt,{apply:()=>Ht,inject:()=>Ft,name:()=>Bt,setTabLabelName:()=>ut});module.exports=kt(Kt);var C=Q(require("react"),1);var aa=require("react");var St="/my-memory/api";async function te(e,t){let a=await fetch(`${St}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),s=await a.text(),r;try{r=s?JSON.parse(s):null}catch{r={error:s.slice(0,500)}}if(!a.ok){let i=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=r,i}return r}function Nt(e){return e?String(e).replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~"):""}function ue(e){let t=String(e?.id??""),a=typeof e?.path=="string"?e.path:"",s=String(e?.display??"")||Nt(a)||(t?`~\\${t}\\agent.md`:"");return{id:t,name:typeof e?.name=="string"?e.name:void 0,body:typeof e?.body=="string"?e.body:void 0,created:Number(e?.created)||0,updated:Number(e?.updated)||0,path:a,display:s,virtual:e?.virtual===!0,rev:typeof e?.rev=="string"?e.rev:""}}async function pe(){let e=await te("/personas"),t=Array.isArray(e?.items)?e.items.map(ue):[],a=e?.activeId?String(e.activeId):t.find(s=>!s.virtual)?.id??null;return{items:t,activeId:a}}async function Me(e){let t=String(e?.dir??"").trim(),a=await te("/personas",{method:"POST",body:JSON.stringify({dir:t,name:t})});return ue(a)}async function Ie(e){return ue(await te("/personas/"+encodeURIComponent(String(e))))}async function he(e,t){let a=await te(`/personas/${encodeURIComponent(String(e))}`,{method:"PUT",body:JSON.stringify(t??{})});return ue(a)}function ze(e){return te(`/personas/${encodeURIComponent(String(e))}`,{method:"DELETE"})}function Te(e){return te(`/personas/${encodeURIComponent(String(e))}/default`,{method:"POST"})}function Oe(e){return te(`/personas/${encodeURIComponent(String(e))}/reveal`,{method:"POST"})}async function je(e,t){let a=await te(`/personas/${encodeURIComponent(String(e))}/rename`,{method:"POST",body:JSON.stringify({dir:String(t??"").trim()})});return ue(a)}var ee=Q(require("react"),1);function Le({fields:e=["text"],read:t,write:a,onSaved:s}={}){let r=[...e],i=y=>Object.fromEntries(r.map(I=>[I,String(y?.[I]??"")])),o=(y,I)=>r.every(M=>y[M]===I[M]),l=i(null),c=i(null),u=null,x=!1,v=!1,O=!1,R="",S=null,w=!1,U=0,g=0,d=!1,m=null,b=new Set,p=()=>!o(l,c),E=y=>String(y?.message||y),B=y=>{if(!y||typeof y.path!="string"||!y.path||typeof y.rev!="string"||!y.rev)throw new Error("\u65E0\u6CD5\u786E\u8BA4\u6587\u4EF6\u8DEF\u5F84\u6216\u7248\u672C\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u8BD5");if(r.some(I=>typeof y[I]!="string"))throw new Error("\u6587\u4EF6\u6B63\u6587\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u8BD5");return y},$=()=>({draft:{...l},baseline:{...c},document:u,loaded:x,loading:v,saving:O,dirty:p(),error:R,conflict:S,moved:w,savedAt:U}),j=()=>{if(d)return;let y=$();for(let I of b)I(y)},W=y=>{u=u?.path===y.path?{...u,...y}:y,c=i(y),l={...c},x=!0,S=null,w=!1,R=""},Z=y=>{w=!0,S=null,R=y||"\u6587\u4EF6\u4F4D\u7F6E\u5DF2\u7ECF\u53D8\u5316\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF1B\u8BF7\u91CD\u65B0\u8BFB\u53D6\u6587\u4EF6\u540E\u518D\u7F16\u8F91\u3002"};function H(){d=!1}function Y(y){return b.add(y),()=>b.delete(y)}function P(y){if(!(d||!x)){for(let I of r)Object.prototype.hasOwnProperty.call(y,I)&&(l[I]=String(y[I]??""));j()}}async function _({discard:y=!1}={}){if(d||(m&&await m,d))return!1;let I=++g;v=!0,R="",j();try{let M=B(await t());return d||I!==g?!1:(y||!x?W(M):M.path!==u.path?Z():p()?M.rev!==u.rev&&(S={kind:"remote",document:M}):W(M),!w&&!S)}catch(M){return!d&&I===g&&(R="\u8BFB\u53D6\u5931\u8D25\uFF1A"+E(M)),!1}finally{!d&&I===g&&(v=!1,j())}}function ne({force:y=!1}={}){return d?Promise.resolve(!1):m||(!x||w||S&&!y?Promise.resolve(!1):!p()&&!y?Promise.resolve(!0):(++g,v=!1,O=!0,R="",j(),m=Promise.resolve().then(async()=>{let I=y;try{do{let M={...l},q=u.path,ce=await a({...M,baseRev:u.rev,expectedPath:q,...I?{force:!0}:{}});if(d)return!1;let oe=B(ce);if(oe.path!==q)return Z(),!1;let n=i(oe);for(let h of r)l[h]===M[h]&&(l[h]=n[h]);c=n,u={...u,...oe},S=null,w=!1,U=Date.now(),I=!1,typeof s=="function"&&s(oe),j()}while(!d&&p());return!d}catch(M){return d||(M?.status===409&&M?.body?.code==="DOCUMENT_MOVED"?Z(E(M)):M?.status===409&&M?.body?.conflict?(S={kind:"conflict",document:{...M.body,path:M.body.path||u.path}},R=""):R="\u4FDD\u5B58\u5931\u8D25\uFF1A"+E(M)),!1}}).finally(()=>{m=null,O=!1,j()}),m))}function ve(){return m||(p()?ne():Promise.resolve(!0))}function xe(){return d||O?!1:(++g,v=!1,l={...c},S=null,j(),!0)}function Ee(){if(d||O||w||!S?.document)return!1;let y=S.document;if(y.path!==u.path)return Z(),j(),!1;try{return W(B(y)),j(),!0}catch(I){return R=E(I),j(),!1}}function we(){d=!0,++g,b.clear()}return{getState:$,subscribe:Y,change:P,refresh:_,save:ne,flush:ve,discard:xe,useDisk:Ee,activate:H,dispose:we}}function $e(e,t){let a=String(e??"").split(`
`),s=String(t??"").split(`
`);if(a.length>1500||s.length>1500)return[...a.map(x=>({kind:"del",text:x})),...s.map(x=>({kind:"add",text:x}))];let r=a.length,i=s.length,o=Array.from({length:r+1},()=>new Uint16Array(i+1));for(let x=r-1;x>=0;x-=1)for(let v=i-1;v>=0;v-=1)o[x][v]=a[x]===s[v]?o[x+1][v+1]+1:Math.max(o[x+1][v],o[x][v+1]);let l=[],c=0,u=0;for(;c<r&&u<i;)a[c]===s[u]?(l.push({kind:"same",text:a[c]}),c+=1,u+=1):o[c+1][u]>=o[c][u+1]?(l.push({kind:"del",text:a[c]}),c+=1):(l.push({kind:"add",text:s[u]}),u+=1);for(;c<r;)l.push({kind:"del",text:a[c]}),c+=1;for(;u<i;)l.push({kind:"add",text:s[u]}),u+=1;return l}function Ae(e){let t=0,a=0;for(let s of e||[])s.kind==="add"?t+=1:s.kind==="del"&&(a+=1);return{added:t,removed:a}}var N=require("react/jsx-runtime");function ie({documentKey:e,read:t,write:a,fields:s,onSaved:r,registerEditor:i}){let o=ee.useMemo(()=>Le({read:t,write:a,fields:s,onSaved:r}),[e]),[l,c]=ee.useState(()=>({editor:o,state:o.getState()})),u=l.editor===o?l.state:o.getState();return ee.useEffect(()=>{o.activate();let x=o.subscribe(v=>c({editor:o,state:v}));return c({editor:o,state:o.getState()}),o.refresh(),()=>{x(),o.dispose()}},[o]),ee.useEffect(()=>i?.(o),[o,i]),{editor:o,state:u}}function Ue(e,t){return t.length===1?String(e?.[t[0]]??""):"\u540D\u5B57\uFF1A"+String(e?.name??"")+`

`+String(e?.body??"")}function de({editor:e,state:t,fields:a=["text"]}){let[s,r]=ee.useState(!1);ee.useEffect(()=>{r(t.conflict?.kind==="conflict")},[t.conflict]);let i=s&&t.conflict?$e(Ue(t.conflict.document,a),Ue(t.draft,a)):[],o=Ae(i);return(0,N.jsxs)(N.Fragment,{children:[t.error?(0,N.jsx)("div",{className:"dsh-mymem-error",children:t.error}):null,t.moved?(0,N.jsxs)("div",{className:"dsh-mymem-remotebar",children:[(0,N.jsx)("span",{children:"\u6587\u4EF6\u4F4D\u7F6E\u5DF2\u7ECF\u53D8\u5316\uFF0C\u672A\u4FDD\u5B58\u5185\u5BB9\u4ECD\u4FDD\u7559\u5728\u4E0A\u9762\u3002"}),(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t.loading||t.saving,onClick:()=>{e.refresh({discard:!0})},children:"\u653E\u5F03\u8349\u7A3F\u5E76\u91CD\u65B0\u8BFB\u53D6"})]}):null,t.conflict&&!s?(0,N.jsxs)("div",{className:"dsh-mymem-remotebar",children:[(0,N.jsx)("span",{children:"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u66F4\u65B0\uFF0C\u5F53\u524D\u6539\u52A8\u5C1A\u672A\u4FDD\u5B58"}),(0,N.jsx)("span",{className:"dsh-mymem-raw-grow"}),(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>r(!0),children:"\u5BF9\u6BD4"})]}):null,t.conflict&&s?(0,N.jsxs)("div",{className:"dsh-mymem-diff","data-kind":"conflict",children:[(0,N.jsxs)("div",{className:"dsh-mymem-diff-head",children:[(0,N.jsx)("span",{className:"dsh-mymem-diff-title",children:"\u78C1\u76D8\u4E0A\u7684\u5185\u5BB9\u5DF2\u7ECF\u88AB\u6539\u8FC7"}),(0,N.jsxs)("span",{className:"dsh-mymem-diff-count",children:["\u65B0\u589E ",o.added," \u884C \xB7 \u5220\u9664 ",o.removed," \u884C"]})]}),(0,N.jsx)("div",{className:"dsh-mymem-diff-body",children:i.map((l,c)=>(0,N.jsxs)("div",{className:"dsh-mymem-diffline","data-kind":l.kind,children:[(0,N.jsx)("span",{className:"dsh-mymem-diffmark",children:l.kind==="add"?"+":l.kind==="del"?"\u2212":" "}),(0,N.jsx)("span",{className:"dsh-mymem-difftext",children:l.text||" "})]},c))}),(0,N.jsxs)("div",{className:"dsh-mymem-diff-actions",children:[(0,N.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:t.saving||t.loading,onClick:()=>{e.save({force:!0})},children:"\u7528\u6211\u7684\u8986\u76D6"}),(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t.saving||t.loading,onClick:()=>e.useDisk(),children:"\u7528\u78C1\u76D8\u7684"}),(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>r(!1),children:"\u53D6\u6D88"})]})]}):null,(0,N.jsxs)("div",{className:"dsh-mymem-raw-status",children:[t.saving?"\u4FDD\u5B58\u4E2D\u2026":t.loaded?t.dirty?"\u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8":t.savedAt?"\u5DF2\u4FDD\u5B58":"":"\u5C1A\u672A\u8F7D\u5165\u6587\u4EF6",t.dirty?(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t.saving,onClick:()=>e.discard(),children:"\u653E\u5F03\u672A\u4FDD\u5B58\u6539\u52A8"}):null,t.error&&t.dirty&&!t.conflict&&!t.moved?(0,N.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:t.saving,onClick:()=>{e.save()},children:"\u91CD\u8BD5\u4FDD\u5B58"}):null]})]})}var J=require("react/jsx-runtime"),_e=["name","body"];function Be({persona:e,onSaved:t,registerEditor:a}={}){let s=String(e?.id??""),{editor:r,state:i}=ie({documentKey:"persona:"+s,fields:_e,read:()=>Ie(s),write:o=>he(s,o),onSaved:t,registerEditor:a});return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{className:"dsh-mymem-field",children:[(0,J.jsx)("span",{className:"dsh-mymem-label",children:"\u540D\u5B57"}),(0,J.jsx)("input",{className:"dsh-mymem-input",value:i.draft.name,disabled:!i.loaded,placeholder:"\u5C55\u793A\u7528\u7684\u89D2\u8272\u540D\uFF08\u4E0D\u6539\u76EE\u5F55\u540D\uFF09",spellCheck:!1,onFocus:()=>{r.refresh()},onChange:o=>r.change({name:o.target.value}),onBlur:()=>{r.save()}})]}),(0,J.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,J.jsx)("span",{className:"dsh-mymem-hint",children:"\u6539\u52A8\u4F1A\u81EA\u52A8\u4FDD\u5B58"}),(0,J.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:i.loading||i.saving,onClick:()=>{r.refresh()},children:i.loading?"\u8BFB\u53D6\u4E2D\u2026":"\u5237\u65B0"})]}),(0,J.jsxs)("label",{className:"dsh-mymem-field",children:[(0,J.jsx)("span",{className:"dsh-mymem-label",children:"\u89D2\u8272\u4FE1\u606F"}),(0,J.jsx)("textarea",{className:"dsh-mymem-textarea",rows:16,value:i.draft.body,disabled:!i.loaded,placeholder:"\u968F\u4FBF\u5199\uFF1A\u5979\u662F\u8C01\u3001\u600E\u4E48\u8BF4\u8BDD\u3001\u600E\u4E48\u79F0\u547C\u4F60\u2026\u2026\u5931\u7126\u81EA\u52A8\u4FDD\u5B58",spellCheck:!1,onFocus:()=>{r.refresh()},onChange:o=>r.change({body:o.target.value}),onBlur:()=>{r.save()}})]}),(0,J.jsx)(de,{editor:r,state:i,fields:_e})]})}var ia=require("react");var Rt="/my-memory/api";async function K(e,t){let a=await fetch(`${Rt}${e}`,{credentials:"same-origin",...t,headers:{"content-type":"application/json",...t&&t.headers}}),s=await a.text(),r;try{r=s?JSON.parse(s):null}catch{r={error:s.slice(0,500)}}if(!a.ok){let i=new Error(r&&(r.error||r.message)||`HTTP ${a.status}`);throw i.status=a.status,i.body=r,i}return r}async function Fe(){let e=await K("/settings");return{dataDir:String(e?.dataDir??""),defaultDataDir:String(e?.defaultDataDir??""),folderName:String(e?.folderName??"dsh-my-memory")}}function Je(e){return K("/settings/dataDir",{method:"POST",body:JSON.stringify({parent:String(e??"")})})}function Ge(){return K("/settings/reveal",{method:"POST"})}async function ye(e){let t=await K(`/session/persona?session=${encodeURIComponent(String(e))}`);return{sessionId:String(t?.sessionId??e),personaId:t?.personaId?String(t.personaId):null,name:String(t?.name??""),locked:!!t?.locked}}function We(e,t){return K("/session/persona",{method:"POST",body:JSON.stringify({session:String(e),personaId:String(t)})})}async function qe(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await K(`/project/state${t}`);return{cwd:String(a?.cwd??""),memoryPath:String(a?.memoryPath??""),exists:!!a?.exists,enabled:!!a?.enabled,hasLegacy:!!a?.hasLegacy}}function He(e,t){return K("/project/state",{method:"POST",body:JSON.stringify({...e?{cwd:String(e)}:{},enabled:!!t})})}async function Ke(e){let t=e?`?cwd=${encodeURIComponent(String(e))}`:"",a=await K(`/project/raw${t}`);return{path:String(a?.path??""),text:String(a?.text??"")}}async function be(e){let t=await K(`/persona/memory?id=${encodeURIComponent(String(e??""))}`);return{personaId:String(t?.personaId??e??""),path:t?.path,text:t?.text,exists:!!t?.exists,rev:t?.rev}}function Ve(e){return K("/persona/memory",{method:"PUT",body:JSON.stringify({personaId:String(e?.personaId??""),text:String(e?.text??""),baseRev:String(e?.baseRev??""),expectedPath:String(e?.expectedPath??""),...e?.force?{force:!0}:{}})})}async function Xe(){let e=await K("/settings/prompt");return{...e,path:e?.path,text:e?.text,defaultText:String(e?.defaultText??""),exists:!!e?.exists,rev:e?.rev}}async function Ye(e){let t=await K("/settings/prompt",{method:"PUT",body:JSON.stringify({text:String(e?.text??""),baseRev:String(e?.baseRev??""),expectedPath:String(e?.expectedPath??""),...e?.force?{force:!0}:{}})});return{...t,path:t?.path,text:t?.text,rev:t?.rev}}var V=require("react/jsx-runtime");function Pt(e){return String(e||"").replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~")}function Ct({persona:e,onSaved:t,registerEditor:a}){let s=String(e.id),{editor:r,state:i}=ie({documentKey:"memory:"+s,read:()=>be(s),write:l=>Ve({...l,personaId:s}),onSaved:l=>t?.(l.text,s),registerEditor:a}),o=i.document?.path||"";return(0,V.jsxs)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"persona-memory",children:[(0,V.jsxs)("div",{className:"dsh-mymem-raw-head",children:[(0,V.jsx)("span",{className:"dsh-mymem-hint",title:o,children:o?"\u6587\u4EF6\uFF1A"+Pt(o):(e.name||s)+" \u7684\u957F\u671F\u8BB0\u5FC6"}),(0,V.jsx)("span",{className:"dsh-mymem-spacer"}),(0,V.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:i.loading||i.saving,onClick:()=>{r.refresh()},children:i.loading?"\u5237\u65B0\u4E2D\u2026":"\u5237\u65B0"})]}),(0,V.jsx)("textarea",{className:"dsh-mymem-raw-edit",value:i.draft.text,disabled:!i.loaded,spellCheck:!1,placeholder:i.loaded?"\u8FD9\u4E2A\u89D2\u8272\u7684 MEMORY.md \u539F\u6587\uFF1B\u76F4\u63A5\u4FEE\u6539\uFF0C\u5931\u7126\u81EA\u52A8\u4FDD\u5B58":"\u6B63\u5728\u8BFB\u53D6\u89D2\u8272\u7684\u957F\u671F\u8BB0\u5FC6\u2026",onFocus:()=>{r.refresh()},onBlur:()=>{r.save()},onChange:l=>r.change({text:l.target.value})}),(0,V.jsx)(de,{editor:r,state:i})]})}function Ze({persona:e,onSaved:t,registerEditor:a}={}){return!e?.id||e.virtual?(0,V.jsx)("div",{className:"dsh-mymem-raw","data-dsh-plugin":"my-memory","data-dsh-part":"persona-memory",children:(0,V.jsx)("div",{className:"dsh-mymem-empty",children:e?.virtual?"\u7A7A\u767D\u5361\u6CA1\u6709\u957F\u671F\u8BB0\u5FC6\uFF0C\u4E5F\u6CA1\u6709\u5BF9\u5E94\u7684\u89D2\u8272\u76EE\u5F55\u3002":"\u5148\u5728\u5DE6\u8FB9\u9009\u4E00\u5F20\u89D2\u8272\u5361"})}):(0,V.jsx)(Ct,{persona:e,onSaved:t,registerEditor:a},e.id)}var T=Q(require("react"),1);var X=Q(require("react"),1),ke=Q(require("react-dom"),1),L=require("react/jsx-runtime");function Qe(e,t){let a=X.useRef(null);X.useEffect(()=>{a.current=typeof document<"u"?document.activeElement:null;let s=t.current;return s&&(s.focus(),typeof s.select=="function"&&s.select()),()=>{let r=a.current;if(r&&typeof r.focus=="function"&&document.contains(r))try{r.focus()}catch{}}},[t]),X.useEffect(()=>{let s=r=>{r.key==="Escape"&&e?.()};return document.addEventListener("keydown",s),()=>document.removeEventListener("keydown",s)},[e])}function me({title:e,description:t,label:a,defaultValue:s="",placeholder:r,confirmText:i="\u786E\u5B9A",validate:o,allowEmpty:l=!1,onSubmit:c,onCancel:u}){let[x,v]=X.useState(s),[O,R]=X.useState(""),[S,w]=X.useState(!1),U=X.useRef(null);Qe(u,U);let g=x.trim(),d=g&&o?o(g):"",m=(l||!!g)&&!d&&!S;async function b(){if(m){if(o&&g){let p=o(g);if(p){R(p);return}}w(!0),R("");try{await c?.(g)}catch(p){R(String(p?.message||p))}finally{w(!1)}}}return typeof document>"u"?null:ke.createPortal((0,L.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:p=>{p.target===p.currentTarget&&u?.()},children:(0,L.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,L.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,L.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,a?(0,L.jsx)("div",{className:"dsh-mymem-modal-label",children:a}):null,(0,L.jsx)("input",{ref:U,className:"dsh-mymem-input",value:x,placeholder:r||"",spellCheck:!1,onChange:p=>{v(p.target.value),R("")},onKeyDown:p=>{p.key==="Enter"&&(p.preventDefault(),b())}}),d||O?(0,L.jsx)("div",{className:"dsh-mymem-modal-error",children:O||d}):null,(0,L.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,L.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>u?.(),children:"\u53D6\u6D88"}),(0,L.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!m,onClick:()=>{b()},children:S?"\u5904\u7406\u4E2D\u2026":i})]})]})}),document.body)}function et({title:e,message:t,confirmText:a="\u786E\u5B9A",danger:s,onOk:r,onCancel:i}){let o=X.useRef(null);return Qe(i,o),X.useEffect(()=>{let l=c=>{c.key==="Enter"&&(c.preventDefault(),r?.())};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[r]),typeof document>"u"?null:ke.createPortal((0,L.jsx)("div",{className:"dsh-mymem-modal-mask",onMouseDown:l=>{l.target===l.currentTarget&&i?.()},children:(0,L.jsxs)("div",{className:"dsh-mymem-modal",role:"dialog","aria-modal":"true",children:[(0,L.jsx)("div",{className:"dsh-mymem-modal-title",children:e}),t?(0,L.jsx)("div",{className:"dsh-mymem-modal-message",children:t}):null,(0,L.jsxs)("div",{className:"dsh-mymem-modal-actions",children:[(0,L.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",onClick:()=>i?.(),children:"\u53D6\u6D88"}),(0,L.jsx)("button",{ref:o,className:`dsh-mymem-btn${s?" dsh-mymem-btn--danger":""}`,type:"button",onClick:()=>r?.(),children:a})]})]})}),document.body)}var k=require("react/jsx-runtime");function ge(e){return String(e||"").replace(/^[A-Za-z]:\\Users\\[^\\]+/i,"~")}function Et({dataDir:e,registerEditor:t,onSaved:a,blocked:s}){let{editor:r,state:i}=ie({documentKey:"agent:"+e,read:Xe,write:Ye,onSaved:a,registerEditor:t});return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u5168\u5C40\u63D0\u793A\u8BCD"}),(0,k.jsxs)("div",{className:"dsh-mymem-hint",children:["\u5BF9\u6240\u6709\u89D2\u8272\u751F\u6548\uFF0C\u6B63\u6587\u4FDD\u5B58\u5728\u6570\u636E\u6839\u4E0B\u7684 ",(0,k.jsx)("code",{children:"AGENT.md"}),"\u3002\u53EF\u4EE5\u76F4\u63A5\u4FEE\u6539\u6587\u4EF6\uFF1B\u7559\u7A7A\u8868\u793A\u4E0D\u6CE8\u5165\u3002"]}),(0,k.jsx)("textarea",{className:"dsh-mymem-textarea dsh-mymem-settings-textarea",value:i.draft.text,disabled:!i.loaded||s,spellCheck:!1,placeholder:i.loaded?"\u7559\u7A7A = \u4E0D\u6CE8\u5165\u8FD9\u6BB5\u8981\u6C42":"\u8BFB\u53D6\u4E2D\u2026",onFocus:()=>{r.refresh()},onBlur:()=>{r.save()},onChange:o=>r.change({text:o.target.value})}),(0,k.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,k.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!i.loaded||i.saving||i.moved||s,onClick:()=>{r.save()},children:i.saving?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58"}),(0,k.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:!i.loaded||s,onClick:()=>r.change({text:String(i.document?.defaultText??"")}),children:"\u6062\u590D\u9ED8\u8BA4"}),(0,k.jsx)("button",{className:"dsh-mymem-btn dsh-mymem-btn--ghost",type:"button",disabled:i.loading||i.saving||s,onClick:()=>{r.refresh()},children:i.loading?"\u8BFB\u53D6\u4E2D\u2026":"\u5237\u65B0"}),i.document?.path?(0,k.jsx)("span",{className:"dsh-mymem-hint",title:i.document.path,children:ge(i.document.path)}):null]}),(0,k.jsx)(de,{editor:r,state:i})]})}function tt({onChanged:e,pick:t,registerEditor:a}={}){let[s,r]=T.useState(null),[i,o]=T.useState(""),[l,c]=T.useState(""),[u,x]=T.useState(""),[v,O]=T.useState(!1),[R,S]=T.useState(!1),[w,U]=T.useState(!1),g=T.useRef(null),d=T.useRef(null),m=T.useRef(null),b=T.useRef(!0),p=T.useRef(0),E=T.useCallback(P=>(g.current=P,()=>{g.current===P&&(g.current=null)}),[]),B=T.useMemo(()=>({async flush(){if(d.current)try{await d.current}catch{return!1}return g.current?g.current.flush():!0}}),[]);T.useEffect(()=>a?.(B),[B,a]);let $=T.useCallback(async()=>{let P=++p.current,_=await Fe();return b.current&&P===p.current&&r(_),_},[]);T.useEffect(()=>(b.current=!0,$().catch(P=>{b.current&&o("\u8BFB\u53D6\u8BBE\u7F6E\u5931\u8D25\uFF1A"+String(P?.message||P))}),()=>{b.current=!1,++p.current,m.current&&clearTimeout(m.current)}),[$]);function j(P){b.current&&(c(P),m.current&&clearTimeout(m.current),m.current=setTimeout(()=>{m.current=null,b.current&&c("")},2600))}function W(P){return d.current||(U(!0),o(""),d.current=Promise.resolve().then(async()=>{if(g.current&&!await g.current.flush())throw new Error("\u5168\u5C40\u63D0\u793A\u8BCD\u5C1A\u672A\u4FDD\u5B58\uFF0C\u8BF7\u5148\u5904\u7406\u5F53\u524D\u7684\u9519\u8BEF\u6216\u51B2\u7A81\u3002");if(!b.current)return;let _=await Je(P);b.current&&(r(null),O(!1),x(String(_?.movedFrom??"")),await $(),b.current&&(await e?.(),j("\u6570\u636E\u76EE\u5F55\u5DF2\u5207\u6362\uFF1A"+ge(_?.dataDir))))}).catch(_=>{throw b.current&&o("\u5207\u6362\u76EE\u5F55\u5931\u8D25\uFF1A"+String(_?.message||_)),_}).finally(()=>{d.current=null,b.current&&U(!1)})),d.current}async function Z(){if(o(""),typeof t!="function"){O(!0);return}S(!0);try{let P=await t();if(!P||!b.current)return;await W(P)}catch(P){b.current&&o("\u5207\u6362\u76EE\u5F55\u5931\u8D25\uFF1A"+String(P?.message||P))}finally{b.current&&S(!1)}}async function H(){o("");try{await Ge()}catch(P){b.current&&o("\u6253\u5F00\u76EE\u5F55\u5931\u8D25\uFF1A"+String(P?.message||P))}}let Y=s?.folderName||"dsh-my-memory";return(0,k.jsxs)("div",{className:"dsh-mymem-settings","data-dsh-plugin":"my-memory","data-dsh-part":"settings",children:[(0,k.jsx)("div",{className:"dsh-mymem-settings-title",children:"\u6570\u636E\u76EE\u5F55"}),(0,k.jsx)("div",{className:"dsh-mymem-hint",children:"\u89D2\u8272\u5361\u3001\u5404\u89D2\u8272\u7684\u957F\u671F\u8BB0\u5FC6\u548C\u5168\u5C40\u63D0\u793A\u8BCD\u4FDD\u5B58\u5728\u8FD9\u91CC\u3002\u6362\u76EE\u5F55\u540E\u65E7\u6570\u636E\u4E0D\u4F1A\u81EA\u52A8\u642C\u8FC7\u53BB\u3002"}),(0,k.jsx)("div",{className:"dsh-mymem-settings-path",title:s?.dataDir||"",children:s?.dataDir||"\u8BFB\u53D6\u4E2D\u2026"}),(0,k.jsxs)("div",{className:"dsh-mymem-settings-row",children:[(0,k.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!s||w,onClick:()=>{H()},children:"\u6253\u5F00\u76EE\u5F55"}),(0,k.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:!s||R||w,onClick:()=>{Z()},children:R?"\u9009\u62E9\u4E2D\u2026":w?"\u5207\u6362\u4E2D\u2026":"\u66F4\u6539\u76EE\u5F55"}),!s&&i?(0,k.jsx)("button",{className:"dsh-mymem-btn",type:"button",onClick:()=>{$().catch(P=>o(String(P?.message||P)))},children:"\u91CD\u65B0\u8BFB\u53D6"}):null,l?(0,k.jsx)("span",{className:"dsh-mymem-ok",children:l}):null]}),(0,k.jsxs)("div",{className:"dsh-mymem-hint",children:["\u66F4\u6539\u76EE\u5F55\u65F6\u9009\u7684\u662F\u7236\u76EE\u5F55\uFF0C\u6570\u636E\u56FA\u5B9A\u653E\u5728\u5176\u4E2D\u7684 ",(0,k.jsx)("code",{children:Y})," \u5B50\u76EE\u5F55\u91CC\u3002"]}),s?.defaultDataDir?(0,k.jsxs)("div",{className:"dsh-mymem-hint",children:["\u9ED8\u8BA4\u76EE\u5F55\uFF1A",ge(s.defaultDataDir)]}):null,u?(0,k.jsxs)("div",{className:"dsh-mymem-hint",children:["\u65E7\u6570\u636E\u6CA1\u6709\u8FC1\u79FB\uFF0C\u4ECD\u7136\u7559\u5728 ",ge(u),"\u3002"]}):null,i?(0,k.jsx)("div",{className:"dsh-mymem-error",children:i}):null,s?(0,k.jsx)(Et,{dataDir:s.dataDir,registerEditor:E,blocked:w,onSaved:()=>j("\u5168\u5C40\u63D0\u793A\u8BCD\u5DF2\u4FDD\u5B58\uFF0C\u4E0B\u4E00\u8F6E\u5BF9\u8BDD\u751F\u6548")},s.dataDir):null,v?(0,k.jsx)(me,{title:"\u66F4\u6539\u6570\u636E\u76EE\u5F55",description:"\u9009\u4E00\u4E2A\u7236\u76EE\u5F55\uFF08\u7559\u7A7A = \u4F7F\u7528\u9ED8\u8BA4\u76EE\u5F55\uFF09\uFF0C\u6570\u636E\u653E\u5728\u5B83\u7684 "+Y+" \u5B50\u76EE\u5F55\u91CC\u3002",label:"\u7236\u76EE\u5F55",defaultValue:"",placeholder:"\u7236\u76EE\u5F55\u8DEF\u5F84\uFF0C\u4F8B\u5982 D:\\projects",confirmText:w?"\u5207\u6362\u4E2D\u2026":"\u5207\u6362",allowEmpty:!0,onSubmit:W,onCancel:()=>O(!1)}):null]})}var at=Q(require("react"),1),rt=Q(require("react-dom"),1),Se=require("react/jsx-runtime"),Dt=160,Mt=130;function st({menu:e,onClose:t}){if(at.useEffect(()=>{if(!e)return;let o=()=>t(),l=c=>{c.key==="Escape"&&t()};return document.addEventListener("mousedown",o),document.addEventListener("keydown",l),window.addEventListener("blur",o),()=>{document.removeEventListener("mousedown",o),document.removeEventListener("keydown",l),window.removeEventListener("blur",o)}},[e,t]),!e||typeof document>"u")return null;let a=window.innerWidth||0,s=window.innerHeight||0,r=Math.max(4,Math.min(e.x,a-Dt-6)),i=Math.max(4,Math.min(e.y,s-Mt-6));return rt.createPortal((0,Se.jsx)("div",{className:"dsh-mymem-ctxmenu",style:{position:"fixed",left:r,top:i,zIndex:2147483002},onMouseDown:o=>o.stopPropagation(),children:e.items.map(o=>(0,Se.jsx)("button",{type:"button",className:"dsh-mymem-ctxitem",disabled:o.disabled,onClick:()=>{t(),o.onClick?.()},children:o.label},o.label))}),document.body)}function nt(e,t){return e.preventDefault(),e.stopPropagation(),{x:e.clientX,y:e.clientY,items:t}}var ot="dsh-my-memory-style",It=`
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

`;function ae(){if(typeof document>"u"||document.getElementById(ot))return;let e=document.createElement("style");e.id=ot,e.textContent=It,document.head.appendChild(e)}var f=require("react/jsx-runtime"),zt=[{key:"persona",label:"\u89D2\u8272\u5361"},{key:"settings",label:"\u5168\u5C40\u8BBE\u7F6E"}],Tt=[{key:"role",label:"\u89D2\u8272\u8BBE\u5B9A"},{key:"memory",label:"\u957F\u671F\u8BB0\u5FC6"}],it=/^[A-Za-z0-9._-]{1,40}$/;function dt({close:e,pick:t}={}){let[a,s]=C.useState("persona"),[r,i]=C.useState("role"),[o,l]=C.useState(null),[c,u]=C.useState(null),[x,v]=C.useState(""),[O,R]=C.useState(""),[S,w]=C.useState(null),[U,g]=C.useState(null),[d,m]=C.useState(null),[b,p]=C.useState(0),E=C.useRef(null),B=C.useRef(!1),[$,j]=C.useState(!1),W=C.useRef(c);W.current=c;let Z=C.useCallback(n=>(E.current=n,()=>{E.current===n&&(E.current=null)}),[]),H=C.useCallback(async n=>{if(B.current)return!1;B.current=!0,j(!0),v("");try{return E.current&&!await E.current.flush()?(v("\u5F53\u524D\u5185\u5BB9\u5C1A\u672A\u4FDD\u5B58\uFF0C\u8BF7\u5148\u5904\u7406\u7F16\u8F91\u533A\u7684\u9519\u8BEF\u6216\u51B2\u7A81\u3002"),!1):(await n(),!0)}catch(h){return v(String(h?.message||h)),!1}finally{B.current=!1,j(!1)}},[]),Y=C.useRef(null);C.useEffect(()=>(ae(),()=>{Y.current&&clearTimeout(Y.current)}),[]);let P=C.useCallback(n=>{R(n),Y.current&&clearTimeout(Y.current),Y.current=setTimeout(()=>{Y.current=null,R("")},1600)},[]),_=C.useCallback(async()=>{let n=await pe();return l(n),u(h=>h&&n.items.some(z=>z.id===h)?h:n.activeId??n.items.find(z=>!z.virtual)?.id??null),n},[]);C.useEffect(()=>{let n=!0;return(async()=>{try{let h=await pe();if(!n)return;l(h),u(h.activeId??h.items.find(z=>!z.virtual)?.id??null)}catch(h){n&&v(`\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${h?.message||h}`)}})(),()=>{n=!1}},[]);async function ne(n){return H(async()=>{await n(),await _()})}let ve=C.useCallback(()=>w(null),[]);function xe(){m({kind:"create",onCancel:()=>m(null),onSubmit:async n=>{v("");try{let h=await Me({dir:n});m(null),await _(),h?.id&&u(h.id),i("role")}catch(h){let z=String(h?.message||h);throw v(`\u65B0\u5EFA\u5931\u8D25\uFF1A${z}`),new Error(z)}}})}function Ee(n){m({kind:"rename",persona:n,onCancel:()=>m(null),onSubmit:async h=>{await he(n.id,{name:h}),m(null),await _()}})}function we(n){m({kind:"delete",persona:n,onCancel:()=>m(null),onOk:async()=>{m(null),await ne(()=>ze(n.id))}})}function y(n){m({kind:"renameDir",persona:n,onCancel:()=>m(null),onSubmit:async h=>{v("");try{let z=await je(n.id,h);m(null),await _(),z?.id&&u(z.id),P("\u76EE\u5F55\u5DF2\u66F4\u65B0")}catch(z){throw v(`\u66F4\u65B0\u76EE\u5F55\u5931\u8D25\uFF1A${String(z?.message||z)}`),new Error(String(z?.message||z))}}})}function I(n){let h=!!o&&o.activeId===n.id,z=[{label:"\u8BBE\u4E3A\u9ED8\u8BA4",disabled:h,onClick:()=>ne(()=>Te(n.id))},{label:"\u6253\u5F00\u89D2\u8272\u76EE\u5F55",onClick:()=>ne(async()=>{await Oe(n.id)})},{label:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",onClick:()=>{H(()=>y(n))}},{label:"\u5220\u9664\u89D2\u8272",onClick:()=>{H(()=>we(n))}}];return n.virtual?z.map((ft,ht)=>({...ft,disabled:ht===0?h:!0})):z}async function M(){v("");try{await _(),p(n=>n+1)}catch(n){v(`\u91CD\u65B0\u8BFB\u53D6\u89D2\u8272\u5361\u5931\u8D25\uFF1A${n?.message||n}`)}}let q=o?.items.find(n=>n.id===c)||null;C.useEffect(()=>{let n=!0;return!c||q?.virtual?(g(null),()=>{n=!1}):(g(null),be(c).then(h=>{n&&g(String(h?.text??"").trim().length)}).catch(()=>{n&&g(null)}),()=>{n=!1})},[c,q?.virtual,b]);let ce=o?.items.find(n=>n.id===o.activeId)||q,oe=[U===null?"":`${U} \u5B57\u957F\u671F\u8BB0\u5FC6`,ce?`\u5F53\u524D\u89D2\u8272 ${ce.name||ce.id}`:""].filter(Boolean).join(" \xB7 ");return(0,f.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-panel","data-dsh-plugin":"my-memory","data-dsh-part":"panel",children:[(0,f.jsxs)("div",{className:"dsh-mymem-head",children:[(0,f.jsx)("div",{className:"dsh-mymem-title",children:"\u8BB0\u5FC6"}),(0,f.jsx)("div",{className:"dsh-mymem-sub",children:oe}),(0,f.jsx)("span",{className:"dsh-mymem-tabs-spacer"}),typeof e=="function"?(0,f.jsx)("button",{className:"dsh-mymem-close",type:"button",title:"\u5173\u95ED\u9762\u677F","aria-label":"\u5173\u95ED\u9762\u677F",disabled:$,onClick:()=>{H(()=>e())},children:"\xD7"}):null]}),(0,f.jsx)("div",{className:"dsh-mymem-toptabs",role:"tablist","aria-label":"\u9762\u677F\u5206\u533A",children:zt.map(n=>(0,f.jsx)("button",{className:"dsh-mymem-toptab",type:"button",role:"tab","aria-selected":a===n.key,"data-active":a===n.key?"1":"0",disabled:$,onClick:()=>{H(()=>s(n.key))},children:n.label},n.key))}),a==="settings"?(0,f.jsx)(tt,{onChanged:M,pick:t,registerEditor:Z}):(0,f.jsx)(f.Fragment,{children:(0,f.jsxs)("div",{className:"dsh-mymem-body",children:[(0,f.jsxs)("div",{className:"dsh-mymem-toolbar",children:[(0,f.jsxs)("div",{className:"dsh-mymem-toolbar-left",children:[(0,f.jsx)("button",{className:"dsh-mymem-btn",type:"button",disabled:$,onClick:()=>{H(xe)},children:"\uFF0B \u65B0\u5EFA"}),O?(0,f.jsx)("span",{className:"dsh-mymem-ok",children:O}):null]}),(0,f.jsx)("div",{className:"dsh-mymem-toolbar-right",children:(0,f.jsx)("div",{className:"dsh-mymem-inner-tabs",role:"tablist","aria-label":"\u89D2\u8272\u5361\u5206\u9875",children:Tt.map(n=>(0,f.jsx)("button",{className:"dsh-mymem-inner-tab",type:"button",role:"tab","aria-selected":r===n.key,"data-active":r===n.key?"1":"0",disabled:$,onClick:()=>{H(()=>i(n.key))},children:n.label},n.key))})})]}),x?(0,f.jsx)("div",{className:"dsh-mymem-error",children:x}):null,(0,f.jsxs)("div",{className:"dsh-mymem-split",children:[(0,f.jsx)("div",{className:"dsh-mymem-side",children:(0,f.jsx)("div",{className:"dsh-mymem-cards",children:o?o.items.map(n=>(0,f.jsxs)("div",{className:"dsh-mymem-row","data-active":n.id===c?"1":"0","aria-disabled":$,onClick:()=>{H(()=>u(n.id))},onContextMenu:h=>w(nt(h,I(n))),children:[(0,f.jsx)("span",{className:"dsh-mymem-avatar",children:(n.name||n.id).slice(0,1)}),(0,f.jsxs)("div",{className:"dsh-mymem-rowmain",children:[(0,f.jsxs)("div",{className:"dsh-mymem-name",title:n.name||n.id,children:[n.name||n.id,n.virtual?(0,f.jsx)("span",{className:"dsh-mymem-badge dsh-mymem-badge-none",children:"\u4E0D\u6CE8\u5165"}):null,o.activeId===n.id?(0,f.jsx)("span",{className:"dsh-mymem-badge",children:"\u9ED8\u8BA4"}):null]}),(0,f.jsx)("div",{className:"dsh-mymem-path",title:n.path||n.display,children:n.display})]})]},n.id)):(0,f.jsx)("div",{className:"dsh-mymem-hint",children:"\u8BFB\u53D6\u4E2D\u2026"})})}),(0,f.jsx)("div",{className:"dsh-mymem-main",children:r==="memory"?(0,f.jsx)(Ze,{persona:q,registerEditor:Z,onSaved:(n,h)=>{W.current===h&&g(String(n??"").trim().length)}},`mem:${q?.id??""}:${b}`):q&&!q.virtual?(0,f.jsx)(Be,{persona:q,registerEditor:Z,onSaved:n=>l(h=>h&&{...h,items:h.items.map(z=>z.id===n.id?{...z,...n}:z)})},`${q.id}:${b}`):q?null:(0,f.jsx)("div",{className:"dsh-mymem-hint",children:o?"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361\uFF0C\u70B9\u5DE6\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\u5EFA\u4E00\u5F20":"\u8BFB\u53D6\u4E2D\u2026"})})]})]})}),(0,f.jsx)(st,{menu:S,onClose:ve}),d?.kind==="create"?(0,f.jsx)(me,{title:"\u65B0\u5EFA\u89D2\u8272",description:"\u8F93\u5165\u89D2\u8272\u76EE\u5F55\u540D\u3002\u5B83\u540C\u65F6\u662F\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u5939\u540D\uFF0C\u5EFA\u597D\u540E\u53EF\u4EE5\u518D\u6539\u663E\u793A\u540D\u3002",label:"\u89D2\u8272\u76EE\u5F55\uFF08\u53EA\u80FD\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF09",placeholder:"\u4F8B\u5982 baby",confirmText:"\u521B\u5EFA",validate:n=>it.test(n)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:d.onSubmit,onCancel:d.onCancel}):null,d?.kind==="renameDir"?(0,f.jsx)(me,{title:"\u66F4\u65B0\u89D2\u8272\u76EE\u5F55",description:"\u6539\u7684\u662F\u78C1\u76D8\u4E0A\u7684\u89D2\u8272\u6587\u4EF6\u5939\u540D\uFF0C\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\u3002",label:"\u89D2\u8272\u76EE\u5F55",defaultValue:d.persona.id||"",placeholder:"\u4F8B\u5982 baby",confirmText:"\u66F4\u65B0",validate:n=>it.test(n)?"":"\u53EA\u80FD\u7528\u82F1\u6587\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u77ED\u6A2A\u7EBF\uFF0C1~40 \u4E2A\u5B57\u7B26",onSubmit:d.onSubmit,onCancel:d.onCancel}):null,d?.kind==="rename"?(0,f.jsx)(me,{title:"\u91CD\u547D\u540D\u89D2\u8272\u5361",description:"\u53EA\u6539\u663E\u793A\u540D\uFF0C\u76EE\u5F55\u540D\u4E0D\u53D8\u3002",label:"\u540D\u5B57",defaultValue:d.persona.name||"",confirmText:"\u4FDD\u5B58",onSubmit:d.onSubmit,onCancel:d.onCancel}):null,d?.kind==="delete"?(0,f.jsx)(et,{title:"\u5220\u9664\u89D2\u8272\u5361",message:`\u786E\u5B9A\u5220\u9664\u300C${d.persona.name||d.persona.id}\u300D\uFF1F\u8FD9\u5F20\u5361\u7684\u8BBE\u5B9A\u4F1A\u4E00\u8D77\u6D88\u5931\u3002`,confirmText:"\u5220\u9664",danger:!0,onOk:d.onOk,onCancel:d.onCancel}):null]})}var Ca=require("react"),re=require("react/jsx-runtime");function Ot({size:e=16}){return(0,re.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[(0,re.jsx)("rect",{x:"3.2",y:"4.6",width:"17.6",height:"14.8",rx:"3",stroke:"currentColor",strokeWidth:"1.6"}),(0,re.jsx)("path",{d:"M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),(0,re.jsx)("circle",{cx:"17.3",cy:"9.4",r:"1.05",fill:"currentColor"})]})}function mt({size:e=16}){return(0,re.jsx)("span",{"data-dsh-plugin":"my-memory","data-dsh-part":"sidebar-icon",style:{display:"inline-flex",alignItems:"center",justifyContent:"center"},children:(0,re.jsx)(Ot,{size:e})})}var G=Q(require("react"),1);var F=require("react/jsx-runtime");function jt(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function Lt(e){return e?.session?.cwd||e?.cwd||e?.session?.workingDirectory||null}function Ne(e){let t=jt(e),a=Lt(e),[s,r]=G.useState(null),[i,o]=G.useState(null),[l,c]=G.useState(null),[u,x]=G.useState(!0),[v,O]=G.useState(!1),[R,S]=G.useState(""),w=G.useRef(0);G.useEffect(()=>{ae()},[]);let U=G.useCallback(async()=>{let p=++w.current;x(!0);try{let E=await qe(a);if(p!==w.current)return;o(E);try{let B=await Ke(a);p===w.current&&c(B)}catch{p===w.current&&c({path:"",text:""})}S("")}catch(E){p===w.current&&S(`\u8BFB\u53D6\u5931\u8D25\uFF1A${E?.message||E}`)}finally{p===w.current&&x(!1)}},[a]);G.useEffect(()=>{U()},[U]),G.useEffect(()=>{let p=!0;if(t)return(async()=>{try{let E=await ye(t);p&&(r(E),E?.name&&e.onPersonaName?.(E.name))}catch{}})(),()=>{p=!1}},[t]);let g=!!i?.enabled;async function d(){if(!(v||!i)){O(!0),S("");try{await He(a,!g),await U()}catch(p){S(`\u5207\u6362\u5931\u8D25\uFF1A${p?.message||p}`)}finally{O(!1)}}}let m=String(l?.text??""),b=m.trim().length>0;return(0,F.jsxs)("div",{className:"dsh-mymem-root dsh-mymem-pane","data-dsh-plugin":"my-memory","data-dsh-part":"session-memory",children:[(0,F.jsxs)("div",{className:"dsh-mymem-head",children:[(0,F.jsx)("span",{className:"dsh-mymem-scope-name",children:s?.name||"\u672A\u7ED1\u5B9A\u89D2\u8272"}),(0,F.jsx)("span",{className:"dsh-mymem-spacer"}),(0,F.jsxs)("span",{className:"dsh-mymem-switch",children:[(0,F.jsx)("span",{className:"dsh-mymem-switch-label",children:"\u5C40\u90E8\u8BB0\u5FC6"}),(0,F.jsx)("button",{type:"button",role:"switch","aria-checked":g,"aria-label":"\u5C40\u90E8\u8BB0\u5FC6",className:"dsh-mymem-switch-track","data-on":g?"1":"0",disabled:v||u||!i,onClick:()=>{d()},children:(0,F.jsx)("span",{className:"dsh-mymem-switch-thumb"})})]})]}),R?(0,F.jsx)("div",{className:"dsh-mymem-error",children:R}):null,(0,F.jsxs)("div",{className:"dsh-mymem-local","data-off":g?"0":"1",children:[b?(0,F.jsx)("pre",{className:"dsh-mymem-raw-pre dsh-mymem-localpre",children:m}):(0,F.jsx)("div",{className:"dsh-mymem-empty",children:u?"\u8BFB\u53D6\u4E2D\u2026":g?"\u8FD8\u6CA1\u6709\u5C40\u90E8\u8BB0\u5FC6":"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}),!g&&b?(0,F.jsx)("div",{className:"dsh-mymem-localmask",children:"\u5C40\u90E8\u8BB0\u5FC6\u5DF2\u5173\u95ED"}):null]}),(0,F.jsx)("div",{className:"dsh-mymem-hint",children:"\u5173\u95ED\u53EA\u662F\u4E0D\u518D\u8BB0\u5F55\uFF0C\u5DF2\u6709\u5185\u5BB9\u4E0D\u4F1A\u5220\u9664\u3002"})]})}var A=Q(require("react"),1),lt=Q(require("react-dom"),1);var D=require("react/jsx-runtime");function $t(e){return e?.session?.id||e?.sessionId||e?.session?.sessionId||e?.session?.session_id||null}function At({size:e=14}){return(0,D.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:[(0,D.jsx)("circle",{cx:"12",cy:"8.2",r:"3.4",stroke:"currentColor",strokeWidth:"1.7"}),(0,D.jsx)("path",{d:"M5.2 19.2c.9-3.3 3.6-5.2 6.8-5.2s5.9 1.9 6.8 5.2",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"})]})}function Ut({size:e=12}){return(0,D.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:(0,D.jsx)("path",{d:"M6 9.5 12 15l6-5.5",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})}function _t({sessionId:e}){let[t,a]=A.useState(null),[s,r]=A.useState(null),[i,o]=A.useState(!1),[l,c]=A.useState(null),[u,x]=A.useState(""),[v,O]=A.useState(!1),R=A.useRef(null),S=A.useRef(null);A.useEffect(()=>{ae()},[]),A.useEffect(()=>{let d=!0;return(async()=>{try{let m=await pe();d&&a(m.items||[])}catch{d&&a([])}try{let m=await ye(e);d&&r(m)}catch{}})(),()=>{d=!1}},[e]);let w=A.useCallback(()=>{let d=R.current;if(!d)return;let m=d.getBoundingClientRect(),b=window.innerWidth||0,p=window.innerHeight||0,E=S.current?.offsetWidth||0,B=S.current?.offsetHeight||0,$=m.left;E&&$+E>b-8&&($=Math.max(8,b-8-E));let j=m.bottom+6;B&&j+B>p-8&&(j=Math.max(8,m.top-6-B)),c(W=>W&&W.left===$&&W.top===j?W:{left:$,top:j})},[]);A.useLayoutEffect(()=>{i&&w()},[i,l?.left,l?.top,w]),A.useEffect(()=>{if(!i)return;w();let d=p=>{R.current?.contains(p.target)||p.target?.closest?.(".dsh-mymem-heromenu")||o(!1)},m=p=>{p.key==="Escape"&&o(!1)},b=()=>w();return document.addEventListener("mousedown",d),document.addEventListener("keydown",m),window.addEventListener("resize",b),window.addEventListener("scroll",b,!0),()=>{document.removeEventListener("mousedown",d),document.removeEventListener("keydown",m),window.removeEventListener("resize",b),window.removeEventListener("scroll",b,!0)}},[i,w]);let U=s?.name||"\u9009\u62E9\u89D2\u8272";async function g(d){if(!v){if(d.id===s?.personaId){o(!1);return}O(!0),x("");try{let m=await We(e,d.id);r({sessionId:e,personaId:String(m?.personaId??d.id),name:String(m?.name??d.name??"")}),o(!1)}catch(m){x(`\u7ED1\u5B9A\u5931\u8D25\uFF1A${m?.message||m}`)}finally{O(!1)}}}return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsxs)("button",{ref:R,type:"button",className:"dsh-mymem-herobtn","aria-haspopup":"listbox","aria-expanded":i,onClick:()=>o(d=>!d),children:[(0,D.jsx)("span",{className:"dsh-mymem-herobtn-icon",children:(0,D.jsx)(At,{})}),(0,D.jsx)("span",{className:"dsh-mymem-herobtn-label",children:U}),(0,D.jsx)("span",{className:"dsh-mymem-herobtn-chev",children:(0,D.jsx)(Ut,{})})]}),i&&l&&typeof document<"u"?lt.createPortal((0,D.jsxs)("div",{ref:S,className:"dsh-mymem-heromenu",style:{position:"fixed",left:l.left,top:l.top},children:[u?(0,D.jsx)("div",{className:"dsh-mymem-heromenu-err",children:u}):null,(0,D.jsxs)("div",{className:"dsh-mymem-heromenu-list",role:"listbox",children:[(t||[]).map(d=>{let m=d.id===s?.personaId;return(0,D.jsxs)("button",{type:"button",role:"option","aria-selected":m,className:"dsh-mymem-heroitem","data-active":m?"1":"0",disabled:v,onClick:()=>{g(d)},children:[(0,D.jsx)("span",{className:"dsh-mymem-heroitem-main",children:(0,D.jsx)("span",{className:"dsh-mymem-heroitem-name",children:d.name||d.id})}),m?(0,D.jsx)("span",{className:"dsh-mymem-heroitem-check",children:"\u2713"}):null]},d.id)}),t&&t.length===0?(0,D.jsx)("div",{className:"dsh-mymem-heromenu-hint",children:"\u8FD8\u6CA1\u6709\u89D2\u8272\u5361"}):null]})]}),document.body):null]})}function ct(e){let t=$t(e);return t?(0,D.jsx)(_t,{sessionId:String(t)}):null}var Bt="my-memory",Ft=["slots","layout"],se="[my-memory]",Re="my-memory";function Jt(e){let t=globalThis.__DSH_DIRECTORY_PICKER__;return{pick:typeof t?.pick=="function"?()=>t.pick():null,close(){try{e.layout.selectPanel(null)}catch(s){console.warn(se,"selectPanel(null) \u5931\u8D25",s)}}}}function Gt(e,t,a,s,r,i){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject(t,()=>e.slots.register({name:t,id:a,order:s,label:r},i)),`my-memory.${t}`),console.info(se,`\u5DF2\u6CE8\u518C ${t} \u2192 ${r()}`),!0}catch(o){return console.warn(se,`\u6CE8\u518C ${t} \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09`,o),!1}}function Wt(e,t){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return e.effect(()=>e.slots.inject("main",()=>e.slots.inject("sidebar.panellist",()=>{let a=e.slots.register({name:"main",key:Re,inject:()=>({close:t.close,pick:t.pick})},dt),s=null;try{s=e.slots.register({name:"sidebar.panellist",id:Re,order:43,label:()=>"\u8BB0\u5FC6"},mt)}catch(r){try{a()}catch{}throw r}return()=>{try{s()}finally{try{a()}catch{}}}})),"my-memory.sidebar"),console.info(se,"\u5DF2\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3\u4E0E\u8BB0\u5FC6\u9762\u677F"),!0}catch(a){return console.warn(se,"\u6CE8\u518C\u4FA7\u8FB9\u680F\u5165\u53E3/\u4E3B\u9762\u677F\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F1A\u8BDD\u5185\u300C\u8BB0\u5FC6\u300D\u9875\uFF09",a),!1}}var Pe="\u8BB0\u5FC6",Ce=null,le=null;function ut(e){let t=String(e||"").trim();if(!(!t||t===Pe)&&(Pe=t,!(!Ce||typeof le!="function"))){try{le()}catch{}try{le=Ce.slots.register(pt(),Ne)}catch(a){console.warn(se,"\u91CD\u65B0\u6CE8\u518C\u4F1A\u8BDD\u9875\u5931\u8D25",a)}}}function pt(){return{name:"conversation.view",id:Re,order:40,label:()=>Pe,inject:()=>({onPersonaName:ut})}}function qt(e){try{if(!e.slots||typeof e.slots.inject!="function")throw new Error("ctx.slots \u4E0D\u53EF\u7528");return Ce=e,e.effect(()=>e.slots.inject("conversation.view",()=>(le=e.slots.register(pt(),Ne),()=>{try{le()}catch{}le=null})),"my-memory.conversation.view"),console.info(se,"\u5DF2\u6CE8\u518C\u4F1A\u8BDD\u9875\uFF08\u6807\u7B7E\u540D\u968F\u540E\u8DDF\u7740\u89D2\u8272\u540D\u8D70\uFF09"),!0}catch(t){return console.warn(se,"\u6CE8\u518C conversation.view \u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u5176\u5B83\u5165\u53E3\uFF09",t),!1}}function Ht(e){ae(),Wt(e,Jt(e)),qt(e),Gt(e,"conversation.hero.options","my-memory-persona",10,()=>"\u89D2\u8272",ct)}

		return module.exports;
	}
});
