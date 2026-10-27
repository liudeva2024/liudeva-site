/* ===================== 参考形态库 ===================== */
function miniSky(coords,color){
const svg='<svg viewBox="0 0 460 460" style="width:100%;height:auto">'+
'<defs><radialGradient id="mg'+(Math.random()*1e6|0)+'" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="#2a3150"/><stop offset="100%" stop-color="#171c2c"/></radialGradient></defs>'+
'<circle cx="230" cy="230" r="168" fill="url(#mg'+(Math.random()*1e6|0)+')" stroke="#39415a"/>'+
DIMS.map((d,i)=>{const u=axisUV(i),t=(coords[d.id]||0)/10,p={x:230+u.x*t*168,y:230+u.y*t*168};return '<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="5" fill="'+(color||'#e0b368')+'"/>'}).join('')+
'</svg>';
return svg;
}
function renderLib(){
const el=document.getElementById('libGrid');
const act=state.mode==='ref'?state.refId:null;
el.innerHTML=REFS.map(r=>'<div class="shape-card'+(act===r.id?' on':'')+'" data-ref="'+r.id+'">'+
'<div class="sh">'+miniSky(r.coords,r.color)+'</div>'+
'<div class="sn">'+r.name+'</div><div class="si">'+r.img+'</div>'+
'</div>').join('');
}
function renderHistory(){
const el=document.getElementById('hisList');
const f=document.getElementById('hisFilter');
const pid=f?f.value:'all';
const all=allSnapshots();
const list=(pid==='all')?all:all.filter(x=>x.p.id===pid);
const cnt=document.getElementById('hisCnt');
if(cnt)cnt.textContent=list.length?('共 '+list.length+' 条'+(pid==='all'&&state.profiles.length>1?' · '+state.profiles.length+' 个档案':'')):'还没有记录';
el.innerHTML=list.length?list.map(x=>{
const s=x.s,p=x.p;
return '<div class="his-item" data-open="'+s.id+'">'+
'<span class="prof-dot" style="background:'+p.color+'"></span>'+
'<div class="hi-main"><div class="hi-l">'+esc(s.label||'未命名星座')+'</div>'+
'<div class="hi-m">'+esc(p.name)+' · '+esc(s.ts)+'</div></div>'+
'<div class="hi-acts">'+
'<button data-act="open" data-id="'+s.id+'">详情</button>'+
'<button data-act="load" data-id="'+s.id+'">载入</button>'+
'<button data-act="del" data-id="'+s.id+'">删</button>'+
'</div></div>';
}).join(''):'<div class="empty">还没有星史。画一张星图，点击「生成 AI 报告」并存进这里。</div>';
}
function updateHisDot(){
const n=allSnapshots().length;
const b=document.getElementById('navHis');
if(b)b.querySelector('.dot').textContent=n;
}
/* 星史详情 */
let snapDetail=null,snapRep=null,snapPickIdx=0;
function openSnapDetail(p,s){
snapDetail={p,s};
const rep=buildReport(s.coords);
snapRep=rep;
snapPickIdx=0;
const m=document.getElementById('snapMask');
m.classList.add('on');
document.getElementById('snapName').textContent=s.label||'未命名星座';
document.getElementById('snapMeta').textContent=p.name+' · '+s.ts+(s.note?' · '+s.note:'');
renderSkyInto(document.getElementById('skySnap'),s.coords,{color:p.color,grad:'bgGradSnap',readonly:true,ref:s.refId?REFS.find(r=>r.id===s.refId):null});
document.getElementById('snapPicks').innerHTML=rep.picks.map((x,i)=>'<div class="rep-pick'+(i===0?' on':'')+'" data-i="'+i+'"><b>'+x.name+'</b><span>'+x.img+'</span></div>').join('');
renderSnapBody();
}
function renderSnapBody(){
const m=document.getElementById('snapBody');
if(!snapRep)return;
m.innerHTML=narrativeHtml(snapRep,snapPickIdx).narrative;
}
function renderCompare(){
const el=document.getElementById('cmpBox');
const selA=document.getElementById('cmpA');
const selB=document.getElementById('cmpB');
const opts=[{id:'',name:'（不选）'}].concat(allSnapshots().map(x=>({id:x.s.id,name:x.p.name+' · '+(x.s.label||'未命名')+' · '+x.s.ts})));
const curA=selA.value,curB=selB.value;
selA.innerHTML=opts.map(o=>'<option value="'+o.id+'">'+esc(o.name)+'</option>').join('');
selB.innerHTML=opts.map(o=>'<option value="'+o.id+'">'+esc(o.name)+'</option>').join('');
selA.value=curA;selB.value=curB;
const a=opts.find(o=>o.id===selA.value),b=opts.find(o=>o.id===selB.value);
if(!a||!b||!a.id||!b.id){el.innerHTML='<div class="cmp-empty">从两边各选一条星史（或两个不同的人），对比两张星座。</div>';cmpReportCopy='';return}
const ha=allSnapshots().find(x=>x.s.id===a.id);
const hb=allSnapshots().find(x=>x.s.id===b.id);
if(!ha||!hb)return;
const ca=ha.s.coords,cb=hb.s.coords;
document.getElementById('cmpSkyA').innerHTML=miniSky(ca,ha.p.color);
document.getElementById('cmpSkyB').innerHTML=miniSky(cb,hb.p.color);
document.getElementById('cmpNameA').textContent=ha.p.name+' · '+(ha.s.label||'未命名');
document.getElementById('cmpNameB').textContent=hb.p.name+' · '+(hb.s.label||'未命名');
document.getElementById('cmpReport').innerHTML=buildCompareReport(ca,cb,ha,hb);
}
function buildCompareReport(ca,cb,ha,hb){
const da=describe(ca),db=describe(cb);
let html='<p><b style="color:'+ha.p.color+'">'+esc(ha.p.name)+'</b> 的形状（'+(ha.s.label||'未命名')+'）：'+da.opening+'</p>';
html+='<p><b style="color:'+hb.p.color+'">'+esc(hb.p.name)+'</b> 的形状（'+(hb.s.label||'未命名')+'）：'+db.opening+'</p>';
const diff=DIMS.map(d=>({d,v:(cb[d.id]||0)-(ca[d.id]||0)})).filter(x=>Math.abs(x.v)>=4).sort((x,y)=>Math.abs(y.v)-Math.abs(x.v));
if(diff.length){
html+='<p>最不一样的是：'+diff.slice(0,3).map(x=>'「'+x.d.name+'」'+(x.v<0?'你（'+esc(ha.p.name)+'）更偏'+x.d.left+'，TA 更偏'+x.d.right:'你（'+esc(ha.p.name)+'）更偏'+x.d.right+'，TA 更偏'+x.d.left)+'（相差 '+Math.abs(x.v)+' 档）').join('；')+'</p>';
}else{html+='<p>两人的形状在 11 维上都很接近，彼此是同一个星座的两种画法。</p>'}
const ra=nearestRefs(ca)[0],rb=nearestRefs(cb)[0];
if(ra.r.name===rb.r.name)html+='<p>两人最接近的参考形态都是「'+ra.r.name+' · '+ra.r.img+'」——同族，但落点不同。</p>';
else html+='<p>'+esc(ha.p.name)+'最接近「'+ra.r.name+'」，'+esc(hb.p.name)+'最接近「'+rb.r.name+'」——两座不同的星座。</p>';
const sca=spreadOf(ca),scb=spreadOf(cb);
html+='<p>形状的锐度：'+esc(ha.p.name)+' '+sca.toFixed(0)+' 档，'+esc(hb.p.name)+' '+scb.toFixed(0)+' 档'+(sca>scb?'——你棱角更分明。':'——TA 棱角更分明。')+'</p>';
cmpReportCopy=html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
return html;
}
let cmpReportCopy='';
/* ===================== 交互事件 ===================== */
function toast(msg){
const el=document.getElementById('toast');
el.textContent=msg;el.classList.add('show');
clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2200);
}
function copyText(txt,hint){
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>toast(hint||'已复制'),()=>{fallbackCopy(txt);toast(hint||'已复制')})}
else{fallbackCopy(txt);toast(hint||'已复制')}
}
function fallbackCopy(txt){
const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();
}
function switchView(name){
state.view=name;
document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
document.getElementById('view-'+name).classList.add('on');
document.querySelectorAll('#navBar button').forEach(b=>b.classList.toggle('on',b.dataset.view===name));
if(name==='history')renderHistory();
if(name==='compare')renderCompare();
}
function closeReportAndReset(){
const m=document.getElementById('repMask');
m.classList.remove('on');
state.coords=defaultCoords();state.refId=null;personActive=null;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
highlightDim(null);renderDims();renderSky();renderVerdict();renderLib();
}
let snapPickIdx0=0;
const PROFILE_COLORS=['#e0b368','#6fb8b0','#8fb3d9','#9a8cc7','#d97b6c','#7fb49a','#c78fa6','#b0a48a'];
function usedColors(){
const used={};
state.profiles.forEach(p=>{if(p.color)used[p.color]=1});
return used;
}
function nextFreeColor(){
for(const c of PROFILE_COLORS){if(!usedColors()[c])return c}
return PROFILE_COLORS[state.profiles.length%PROFILE_COLORS.length];
}
function profileColor(id){
const p=state.profiles.find(x=>x.id===id);
return p?p.color:'#e0b368';
}
function openNewProfile(){
newProfColor=null;
renderSwatches();
document.getElementById('newProfName').value='';
document.getElementById('newProfMask').classList.add('on');
setTimeout(()=>document.getElementById('newProfName').focus(),50);
}
function renderSwatches(){
const el=document.getElementById('newProfSwatches');
const used=usedColors();
el.innerHTML=PROFILE_COLORS.map(c=>'<div class="swatch'+(used[c]?' used':'')+'" data-c="'+c+'" style="background:'+c+'"></div>').join('');
}
let newProfColor=null;
function fillSaveProfSel(){
const sel=document.getElementById('saveProfSel');
const cur=state.activeProfile;
sel.innerHTML=state.profiles.map(p=>'<option value="'+p.id+'"'+(p.id===cur?' selected':'')+'>'+esc(p.name)+'</option>').join('');
}
function bindEvents(){
document.getElementById('dimList').addEventListener('input',e=>{
const t=e.target;if(!t.dataset.dim)return;
const i=DIMS.findIndex(d=>d.id===t.dataset.dim);
if(i<0)return;
setVal(i,+t.value);
});
document.getElementById('dimList').addEventListener('click',e=>{
const h=e.target.closest('.dim-head');
if(!h)return;
const i=DIMS.findIndex(d=>d.id===h.dataset.dim);
if(i<0)return;
state.focusDim=h.dataset.dim;highlightDim(h.dataset.dim);renderSky();
});
document.getElementById('btnReport').addEventListener('click',()=>{
const rep=aiReport(state.coords);
repLast=rep;repPickIdx=0;
const m=document.getElementById('repMask');
const nm=document.getElementById('repName');
nm.textContent='「'+rep.picks[0].name+'」 · 形态解读';
document.getElementById('repPicks').innerHTML=rep.picks.map((x,i)=>'<div class="rep-pick'+(i===0?' on':'')+'" data-i="'+i+'"><b>'+x.name+'</b><span>'+x.img+'</span></div>').join('');
document.getElementById('repBody').innerHTML=rep.narrative;
document.getElementById('repCopy').value=rep.copyText;
m.classList.add('on');
});
document.getElementById('repPicks').addEventListener('click',e=>{
const pk=e.target.closest('.rep-pick');if(!pk||!repLast)return;
repPickIdx=+pk.dataset.i;
document.querySelectorAll('#repPicks .rep-pick').forEach(x=>x.classList.remove('on'));
pk.classList.add('on');
document.getElementById('repName').textContent='「'+repLast.picks[repPickIdx].name+'」 · 形态解读';
document.getElementById('repBody').innerHTML=narrativeHtml(repLast,repPickIdx).narrative;
document.getElementById('repCopy').value=narrativeHtml(repLast,repPickIdx).copyText;
});
document.getElementById('btnRepCopy').addEventListener('click',()=>{
if(repLast)copyText(narrativeHtml(repLast,repPickIdx).copyText,'报告已复制');
});
document.getElementById('btnRepClose').addEventListener('click',closeReportAndReset);
document.getElementById('btnSaveSnap').addEventListener('click',()=>{
const p=activeProfile();if(!p)return;
fillSaveProfSel();
document.getElementById('saveLabel').value=repLast?repLast.picks[repPickIdx].name:'';
document.getElementById('saveMask').classList.add('on');
});
document.getElementById('saveMask').addEventListener('click',e=>{if(e.target===e.currentTarget)document.getElementById('saveMask').classList.remove('on')});
document.getElementById('btnSaveCancel').addEventListener('click',()=>document.getElementById('saveMask').classList.remove('on'));
document.getElementById('btnConfirmSave').addEventListener('click',()=>{
const label=document.getElementById('saveLabel').value.trim();
const note=document.getElementById('saveNote').value.trim();
const pid=document.getElementById('saveProfSel').value;
const p=state.profiles.find(x=>x.id===pid)||activeProfile();
p.snapshots.push({id:uid(),ts:nowStr(),label,note,coords:{...state.coords},refId:state.refId});
saveStore();
closeReportAndReset();
toast('已保存到「'+p.name+'」的星史，星图已重置');
});
document.getElementById('btnReset').addEventListener('click',()=>{
state.coords=defaultCoords();state.refId=null;state.focusDim=null;personActive=null;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
highlightDim(null);renderDims();renderSky();renderVerdict();renderLib();toast('已重置为中间态');
});
document.getElementById('btnExport').addEventListener('click',()=>{
const data={app:'world-relation-shapes',version:1,profiles:state.profiles,activeProfile:state.activeProfile};
const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);
a.download='我与世界的关系-星史.json';document.body.appendChild(a);a.click();a.remove();
setTimeout(()=>URL.revokeObjectURL(a.href),500);
toast('已导出星史 JSON');
});
document.getElementById('btnImport').addEventListener('click',()=>document.getElementById('fileImport').click());
document.getElementById('fileImport').addEventListener('change',e=>{
const f=e.target.files[0];if(!f)return;
const reader=new FileReader();
reader.onload=()=>{
try{
const d=JSON.parse(reader.result);
if(!d.profiles||!Array.isArray(d.profiles))throw new Error('bad');
let added=0;
d.profiles.forEach(p=>{
(p.snapshots||[]).forEach(s=>{
if(s.coords&&Object.keys(s.coords).some(k=>Math.abs(s.coords[k]||0)>10)){
for(const k in s.coords)s.coords[k]=migrateV(s.coords[k]);
}
});
if(!state.profiles.some(x=>x.id===p.id)){state.profiles.push({id:p.id||uid(),name:p.name||'导入档案',color:PROFILE_COLORS[state.profiles.length%PROFILE_COLORS.length],snapshots:p.snapshots||[]});added++}
else{const t=state.profiles.find(x=>x.id===p.id);(p.snapshots||[]).forEach(s=>{if(!t.snapshots.some(y=>y.id===s.id)){t.snapshots.push(s);added++}})}
});
saveStore();renderAll();toast('导入完成：新增 '+added+' 条记录');
}catch(err){toast('导入失败：文件格式不对')}
e.target.value='';
};
reader.readAsText(f);
});
document.getElementById('libGrid').addEventListener('click',e=>{
const card=e.target.closest('.shape-card');if(!card)return;
const r=REFS.find(x=>x.id===card.dataset.ref);if(!r)return;
state.mode='ref';state.refId=r.id;state.coords={...r.coords};personActive=null;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='ref'));
switchView('edit');renderAll();toast('已套用「'+r.name+' · '+r.img+'」，可继续微调');
});
document.getElementById('hisList').addEventListener('click',e=>{
const b=e.target.closest('button[data-act]');
const findHolder=id=>state.profiles.find(pr=>pr.snapshots.some(s=>s.id===id));
if(b){
const holder=findHolder(b.dataset.id);if(!holder)return;
const snap=holder.snapshots.find(s=>s.id===b.dataset.id);
if(b.dataset.act==='open'){openSnapDetail(holder,snap);}
else if(b.dataset.act==='load'){
state.coords={...snap.coords};state.refId=snap.refId||null;personActive=null;
state.mode=state.refId?'ref':'free';
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode===state.mode));
switchView('edit');renderDims();renderSky();renderVerdict();renderLib();toast('已载入「'+(snap.label||'未命名星座')+'」到编绘页');
}else if(b.dataset.act==='del'){
if(window.confirm('删除这条记录？')){holder.snapshots=holder.snapshots.filter(s=>s.id!==snap.id);saveStore();renderHistory();renderCompare();updateHisDot();toast('已删除')}
}
return;
}
const item=e.target.closest('.his-item[data-open]');
if(item){const holder=findHolder(item.dataset.open);if(holder){const s=holder.snapshots.find(x=>x.id===item.dataset.open);if(s)openSnapDetail(holder,s)}}
});
document.getElementById('newProfSwatches').addEventListener('click',e=>{
const w=e.target.closest('.swatch');if(!w)return;
if(w.classList.contains('used'))return;
newProfColor=w.dataset.c;
document.querySelectorAll('#newProfSwatches .swatch').forEach(x=>x.classList.toggle('on',x===w));
});
document.getElementById('newProfName').addEventListener('keydown',e=>{if(e.key==='Enter')confirmNewProfile()});
document.getElementById('btnConfirmNewProf').addEventListener('click',confirmNewProfile);
document.getElementById('btnCancelNewProf').addEventListener('click',()=>document.getElementById('newProfMask').classList.remove('on'));
function confirmNewProfile(){
const nm=document.getElementById('newProfName').value.trim();
if(!nm){toast('先给档案起个名字');return}
if(state.profiles.some(p=>p.name===nm)){toast('已有同名档案，换个名字');return}
const col=newProfColor||nextFreeColor();
state.profiles.push({id:uid(),name:nm,color:col,snapshots:[]});
state.activeProfile=state.profiles[state.profiles.length-1].id;saveStore();
document.getElementById('newProfMask').classList.remove('on');
renderHistory();renderCompare();updateHisDot();
toast('已创建档案「'+nm+'」· 星史里用它的专属色区分');
}
document.getElementById('btnSnapBack').addEventListener('click',()=>{switchView('history');renderHistory()});
document.getElementById('btnSnapEdit').addEventListener('click',()=>{
if(!snapDetail)return;
const s=snapDetail.s;
state.coords={...s.coords};state.refId=s.refId||null;personActive=null;
state.mode=state.refId?'ref':'free';
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode===state.mode));
switchView('edit');renderDims();renderSky();renderVerdict();renderLib();toast('已载入「'+(s.label||'未命名星座')+'」到编绘页');
});
document.getElementById('snapPicks').addEventListener('click',e=>{
const pk=e.target.closest('.rep-pick');if(!pk||!snapRep)return;
snapPickIdx=+pk.dataset.i;
document.querySelectorAll('#snapPicks .rep-pick').forEach(x=>x.classList.remove('on'));
pk.classList.add('on');
renderSnapBody();
});
document.getElementById('btnSnapCopy').addEventListener('click',()=>{
if(!snapRep||!snapRep.copyText)return;
copyText(snapRep.copyText,'报告已复制');
});
document.getElementById('cmpA').addEventListener('change',()=>{renderCmpSky();renderCmpReport()});
document.getElementById('cmpB').addEventListener('change',()=>{renderCmpSky();renderCmpReport()});
document.getElementById('btnCmpCopy').addEventListener('click',()=>{
if(cmpReportCopy)copyText(cmpReportCopy,'对比报告已复制');
});
document.getElementById('pSearch').addEventListener('click',onSearchPerson);
document.getElementById('pName').addEventListener('keydown',e=>{if(e.key==='Enter')onSearchPerson()});
document.getElementById('pHeuristic').addEventListener('click',onHeuristicPaste);
document.getElementById('pCopyPrompt').addEventListener('click',()=>{
const name=document.getElementById('pName').value.trim();
copyText(buildDoubaoPrompt(name),'指令已复制，去对话里发给豆包');
});
document.getElementById('pLib').addEventListener('click',e=>{
const c=e.target.closest('.person-card');if(!c)return;
loadPerson(c.dataset.id);
});
document.getElementById('btnPersonBack').addEventListener('click',()=>{switchView('people')});
document.getElementById('btnPersonEdit').addEventListener('click',()=>{
if(!personActive)return;
state.coords={...defaultCoords(),...(personActive.coords||{})};
state.refId=null;personActive=null;state.mode='free';
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
switchView('edit');renderDims();renderSky();renderVerdict();
toast('已载入编绘页，可微调后再生成报告');
});
document.getElementById('btnPersonCopy').addEventListener('click',()=>{
if(personCopyText)copyText(personCopyText,'分析已复制');
});
}