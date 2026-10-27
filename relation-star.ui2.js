function bindEvents(){
document.getElementById('modeSwitch').addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
const m=b.dataset.mode;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode===m));
if(m==='free'){state.mode='free';state.refId=null;renderSky();renderVerdict();renderLib();toast('已切换到自由拖拽')}
else{
state.mode='ref';
if(!state.refId){switchView('ref');toast('先选一个参考形态，套用后回到编绘微调')}
else{renderSky();renderVerdict();toast('参考形态叠加显示，可继续微调')}
}
});
document.getElementById('mainTabs').addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
switchView(b.dataset.view);
if(b.dataset.view==='history')renderHistory();
if(b.dataset.view==='compare')renderCompare();
});
document.getElementById('dimList').addEventListener('input',e=>{
const r=e.target;
if(r.matches('input[type=range]')){
const id=r.dataset.dim;const v=+r.value;
state.coords[id]=v;updateDimKnob(id,v);renderSky();renderVerdict();
}
});
document.getElementById('dimList').addEventListener('click',e=>{
const h=e.target.closest('.dim-head');if(!h)return;
const id=h.dataset.dim;
state.focusDim=state.focusDim===id?null:id;
highlightDim(state.focusDim);renderSky();
});
function renderRepPicks(){
document.getElementById('repPicks').innerHTML=repLast.picks.map((p,i)=>
'<div class="rep-pick'+(i===repPickIdx?' on':'')+'" data-i="'+i+'">'+
'<div class="pk-name">'+p.name+'</div><div class="pk-img">'+p.img+'</div>'+
'<div class="pk-why">'+p.why+'</div></div>').join('');
}
function renderRepBody(){
const r=narrativeHtml(repLast,repPickIdx);
repLast.copyText=r.copyText;
document.getElementById('repBody').innerHTML=r.narrative;
document.getElementById('btnRepSave').textContent='以「'+r.mainName+'」保存';
}
function renderReport(){
repLast=buildReport(state.coords);repPickIdx=0;
document.getElementById('reportTitle').textContent='你的关系形态 · AI 报告';
document.getElementById('btnRepSave').style.display='';
document.getElementById('btnRepCopy').style.display='';
renderRepPicks();renderRepBody();
document.getElementById('reportMask').classList.add('on');
}
document.getElementById('btnReport').addEventListener('click',renderReport);
document.getElementById('btnRepClose').addEventListener('click',closeReportAndReset);
document.getElementById('repPicks').addEventListener('click',e=>{
const pk=e.target.closest('.rep-pick');if(!pk)return;
repPickIdx=+pk.dataset.i;
document.querySelectorAll('#repPicks .rep-pick').forEach(x=>x.classList.remove('on'));
pk.classList.add('on');
renderRepBody();
});
document.getElementById('btnRepCopy').addEventListener('click',()=>{
if(!repLast)return;
copyText(repLast.copyText,'报告已复制');
});
document.getElementById('btnRepSave').addEventListener('click',()=>{
const name=repLast.picks[repPickIdx].name;
document.getElementById('reportMask').classList.remove('on');
document.getElementById('saveMask').classList.add('on');
document.getElementById('saveName').value=name;
document.getElementById('saveNote').value='';
fillSaveProfSel();
setTimeout(()=>document.getElementById('saveName').focus(),100);
});
document.getElementById('btnSave').addEventListener('click',()=>{
document.getElementById('saveMask').classList.add('on');
document.getElementById('saveName').value=state.refId?(REFS.find(r=>r.id===state.refId).name+' · 我的变体'):'未命名星座';
document.getElementById('saveNote').value='';
fillSaveProfSel();
setTimeout(()=>document.getElementById('saveName').focus(),100);
});
document.getElementById('btnCancelSave').addEventListener('click',()=>{
document.getElementById('saveMask').classList.remove('on');
document.getElementById('reportMask').classList.add('on');
});
document.getElementById('btnConfirmSave').addEventListener('click',()=>{
const sel=document.getElementById('saveProfSel');
const p=state.profiles.find(pr=>pr.id===sel.value)||activeProfile();
const label=document.getElementById('saveName').value.trim()||'未命名星座';
const note=document.getElementById('saveNote').value.trim();
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
document.getElementById('cmpA').addEventListener('change',()=>{renderCmpSky();renderCmpDims();renderCmpReport()});
document.getElementById('cmpB').addEventListener('change',()=>{renderCmpSky();renderCmpDims();renderCmpReport()});
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