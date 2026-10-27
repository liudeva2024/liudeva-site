/* ===================== 参考形态库 ===================== */
function miniSky(coords,color,opts){
opts=opts||{};
const W=140,H=140,CX=70,CY=70,R=opts.R||50,ANG=360/11;
const P=DIMS.map((d,i)=>{const a=(-90+i*ANG)*Math.PI/180,t=(coords[d.id]||0)/10;
return {x:CX+Math.cos(a)*t*R,y:CY+Math.sin(a)*t*R}});
const pts=P.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
let s='<svg viewBox="0 0 140 140" role="img" aria-hidden="true">';
s+='<circle cx="70" cy="70" r="'+R+'" fill="#1b2134" stroke="#39415a" stroke-width="1"/>';
s+='<polygon points="'+pts+'" fill="'+(opts.fill||color)+'" fill-opacity=".13" stroke="'+(opts.stroke||color)+'" stroke-width="2" stroke-linejoin="round"/>';
P.forEach(p=>{s+='<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3.2" fill="#f4ecd8" stroke="'+(opts.stroke||color)+'" stroke-width="1.4"/>'});
s+='</svg>';
return s;
}
function renderLib(){
const el=document.getElementById('libGrid');if(!el)return;
el.innerHTML=REFS.map(r=>{
const locked=state.mode==='ref'&&state.refId===r.id;
return '<div class="shape-card'+(locked?' locked':'')+'" data-ref="'+r.id+'">'+
'<span class="use">套用</span>'+
'<div class="nm">'+r.name+'</div>'+
'<div class="im">'+r.img+' · '+r.desc+'</div>'+
miniSky(r.coords,r.color)+
'<div class="cv">点击卡片，把你的星图变成这个形状（仍可微调）</div>'+
'</div>';
}).join('');
}
/* ===================== 我的星史 ===================== */
let hisFilter='all'; // all | mine
function renderHistory(){
const list=document.getElementById('hisList');
const cnt=document.getElementById('hisCnt');
const empty=document.getElementById('hisEmpty');
const p=activeProfile();
if(!p)return;
const snaps=allSnapshots();
const shown=hisFilter==='mine'?snaps.filter(x=>x.p.id===p.id):snaps;
cnt.textContent='共 '+state.profiles.length+' 个档案 · '+snaps.length+' 次记录';
let html='<div class="prof-badges">'+
state.profiles.map(pr=>{
const col=profileColor(pr);
return '<button class="prof-badge'+(pr.id===p.id?' on':'')+'" data-prof="'+pr.id+'">'+
'<span class="pd" style="background:'+col+'"></span>'+esc(pr.name)+
(pr.snapshots.length?'<span style="font-size:11px;color:var(--faint)">'+pr.snapshots.length+'</span>':'')+
'</button>';
}).join('')+
'<button class="prof-badge new" id="btnNewProf">＋ 新建档案</button>'+
'</div>'+
'<div class="prof-filter">'+
'<button data-f="all"'+(hisFilter==='all'?' class="on"':'')+'>全部记录</button>'+
'<button data-f="mine"'+(hisFilter==='mine'?' class="on"':'')+'>仅「'+esc(p.name)+'」</button>'+
'</div>';
if(!shown.length){
list.innerHTML=html;
empty.style.display='block';
}else{
empty.style.display='none';
list.innerHTML=html+'<div class="his-list">'+shown.map(o=>{
const pr=o.p,s=o.s;
const col=profileColor(pr);
return '<div class="his-item" data-open="'+s.id+'">'+
'<div class="mini">'+miniSky(s.coords,col)+'</div>'+
'<div class="meta"><div class="dt"><span class="pd" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+col+';margin-right:6px"></span>'+esc(pr.name)+' · '+esc(s.ts)+'</div>'+
'<div class="nm">'+esc(s.label||'未命名星座')+'</div>'+
'<div class="note">'+(s.note?esc(s.note):'（无备注）')+'</div></div>'+
'<div class="ops-b"><button class="mini-btn primary" data-act="open" data-id="'+s.id+'">详情</button>'+
'<button class="mini-btn" data-act="load" data-id="'+s.id+'">继续编辑</button>'+
'<button class="mini-btn" data-act="del" data-id="'+s.id+'">删除</button></div>'+
'</div>';
}).join('')+'</div>';
}
list.querySelectorAll('.prof-badge[data-prof]').forEach(b=>b.addEventListener('click',()=>{
state.activeProfile=b.dataset.prof;saveStore();renderHistory();renderCompare();updateHisDot();
toast('已切换到档案「'+(state.profiles.find(x=>x.id===state.activeProfile)||{}).name+'」');
}));
list.querySelectorAll('.prof-filter button').forEach(b=>b.addEventListener('click',()=>{
hisFilter=b.dataset.f;renderHistory();
}));
document.getElementById('btnNewProf').addEventListener('click',openNewProfile);
}
function openNewProfile(){
newProfColor=nextFreeColor();
document.getElementById('newProfName').value='';
renderSwatches();
document.getElementById('newProfMask').classList.add('on');
setTimeout(()=>document.getElementById('newProfName').focus(),100);
}
function renderSwatches(){
const wrap=document.getElementById('newProfSwatches');
if(!wrap)return;
const used=usedColors();
if(!newProfColor||used.includes(newProfColor))newProfColor=nextFreeColor();
wrap.innerHTML=PROFILE_COLORS.map(c=>{
const u=used.includes(c);
return '<span class="swatch'+(c===newProfColor?' on':'')+(u?' used':'')+'" data-c="'+c+'" style="background:'+c+'" title="'+c+'"></span>';
}).join('');
}
function fillSaveProfSel(){
const sel=document.getElementById('saveProfSel');
if(!sel)return;
const p=activeProfile();
sel.innerHTML=state.profiles.map(pr=>'<option value="'+pr.id+'"'+(pr.id===p.id?' selected':'')+'>'+esc(pr.name)+'</option>').join('');
}
function updateHisDot(){
const dot=document.getElementById('hisDot');
dot.style.display=allSnapshots().length?'inline-block':'none';
}
/* ===================== 星史详情 ===================== */
let snapDetail=null,snapRep=null,snapPickIdx=0;
function openSnapDetail(p,s){
snapDetail={p:p,s:s};
switchView('snap-detail');
renderSnapDetail();
}
function renderSnapDetail(){
const d=snapDetail;if(!d)return;
const s=d.s,p=d.p;
document.getElementById('snapTitle').textContent=s.label||'未命名星座';
document.getElementById('snapSub').textContent='档案「'+p.name+'」 · '+s.ts+(s.note?' · '+s.note:'');
renderSkyInto(document.getElementById('skySnap'),s.coords,{color:p.color,grad:'bgGradSnap',readonly:true});
snapRep=buildReport(s.coords);snapPickIdx=0;
renderSnapPicks();renderSnapBody();
}
function renderSnapPicks(){
document.getElementById('snapPicks').innerHTML=snapRep.picks.map((pk,i)=>
'<div class="rep-pick'+(i===snapPickIdx?' on':'')+'" data-i="'+i+'">'+
'<div class="pk-name">'+pk.name+'</div><div class="pk-img">'+pk.img+'</div><div class="pk-why">'+pk.why+'</div></div>').join('');
}
function renderSnapBody(){
const r=narrativeHtml(snapRep,snapPickIdx);
snapRep.copyText=r.copyText;
document.getElementById('snapBody').innerHTML='<div class="hint" style="margin-bottom:10px">由当时保存的 11 个坐标现算生成——同一坐标必然得到同一份报告。保存时你给它起的名字：<b style="color:var(--gold2)">「'+esc(snapDetail.s.label||'未命名星座')+'」</b>。</div>'+r.narrative;
}
const PROFILE_COLORS=['#e0b368','#6fb8b0','#d97b6c','#9a8cc7','#8fb3d9','#7fb49a','#c98ba6','#a3b85a'];
let newProfColor='';
function usedColors(){return state.profiles.map(p=>p.color).filter(Boolean)}
function nextFreeColor(){const u=usedColors();return PROFILE_COLORS.find(c=>!u.includes(c))||PROFILE_COLORS[state.profiles.length%PROFILE_COLORS.length]}
function profileColor(p){return p.color||PROFILE_COLORS[state.profiles.indexOf(p)%PROFILE_COLORS.length]}
/* ===================== 对比 ===================== */
function compareOptions(){
const snaps=allSnapshots();
const people=peopleLib.length?peopleLib:BUILTIN_INDEX;
let h='<optgroup label="我的星史（'+snaps.length+'）">';
h+=snaps.map(o=>'<option value="snap:'+o.s.id+'">'+esc(o.p.name+' · '+(o.s.label||'未命名星座')+' · '+o.s.ts)+'</option>').join('');
h+='</optgroup><optgroup label="人物库（'+people.length+'）">';
h+=people.map(o=>'<option value="person:'+o.id+'">'+esc(o.name+(o.summary?' · '+String(o.summary).slice(0,18):''))+'</option>').join('');
h+='</optgroup>';
return h;
}
function resolveShape(v){
if(!v)return null;
if(v.indexOf('snap:')===0){
const o=allSnapshots().find(x=>x.s.id===v.slice(5));
return o?{kind:'snap',name:o.p.name+' · '+(o.s.label||'未命名星座'),color:o.p.color,coords:o.s.coords,sub:o.s.ts}:null;
}
if(v.indexOf('person:')===0){
const id=v.slice(7);
const p=BUILTIN_PEOPLE[id]||peopleLib.find(x=>x.id===id);
if(!p)return null;
return {kind:'person',name:p.name,color:p.color||'#8fb3d9',coords:p.coords||defaultCoords(),sub:''};
}
return null;
}
function renderCompare(){
const a=document.getElementById('cmpA'),b=document.getElementById('cmpB');
const optsHtml=compareOptions();
const curA=a.value,curB=b.value;
a.innerHTML=optsHtml;b.innerHTML=optsHtml;
const keep=(sel,cur)=>{let ok=false;for(const o of sel.options){if(o.value===cur){sel.value=cur;ok=true;break}}
if(!ok)sel.value=sel.options.length?sel.options[0].value:''};
keep(a,curA);keep(b,curB);
if(!a.value){
document.getElementById('skyCmp').innerHTML='';
document.getElementById('cmpReport').innerHTML='<h4>AI 对比报告</h4><div class="empty"><div class="big">还没有可对比的对象</div>先保存两段星史，或等人物库有人物。</div>';
return;
}
if(a.value===b.value){
const vals=[...a.options].map(o=>o.value);
const other=vals.find(v=>v!==a.value);
if(other)b.value=other;
}
renderCmpSky();renderCmpReport();
}
function renderCmpSky(){
const svg=document.getElementById('skyCmp');
const A=resolveShape(document.getElementById('cmpA').value),B=resolveShape(document.getElementById('cmpB').value);
if(!A||!B)return;
const P=SKY2;const W=P.W,H=P.H,CX=P.CX,CY=P.CY,R=P.R;
const mk=(coords,color,strokeW,op)=>{
const pts=DIMS.map((d,i)=>{const a=(-90+i*P.ANG)*Math.PI/180,t=(coords[d.id]||0)/10;
return {x:CX+Math.cos(a)*t*R,y:CY+Math.sin(a)*t*R}});
return {pts:pts, poly:pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' '), color:color, strokeW:strokeW, op:op};
};
const mA=mk(A.coords,A.color,2.4,.85),mB=mk(B.coords,B.color,2.4,.85);
let inner='';
inner+='<defs><radialGradient id="bgGradC" cx="50%" cy="50%" r="60%">'+
'<stop offset="0%" stop-color="#2a3150"/><stop offset="70%" stop-color="#1b2134"/><stop offset="100%" stop-color="#171c2c"/></radialGradient></defs>';
inner+='<circle cx="230" cy="230" r="'+R+'" fill="url(#bgGradC)" stroke="#39415a" stroke-width="1"/>';
DIMS.forEach((d,i)=>{const a=(-90+i*P.ANG)*Math.PI/180;
inner+='<line x1="'+(CX-Math.cos(a)*R).toFixed(1)+'" y1="'+(CY-Math.sin(a)*R).toFixed(1)+'" x2="'+(CX+Math.cos(a)*R).toFixed(1)+'" y2="'+(CY+Math.sin(a)*R).toFixed(1)+'" stroke="#313a52" stroke-width="1" opacity=".55"/>'});
inner+='<polygon points="'+mA.poly+'" fill="'+mA.color+'" fill-opacity=".10" stroke="'+mA.color+'" stroke-width="'+mA.strokeW+'" stroke-linejoin="round" stroke-dasharray="2 3"/>';
inner+='<polygon points="'+mB.poly+'" fill="'+mB.color+'" fill-opacity=".10" stroke="'+mB.color+'" stroke-width="'+mB.strokeW+'" stroke-linejoin="round"/>';
mA.pts.forEach(p=>{inner+='<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="4" fill="'+mA.color+'" opacity=".9"/>'});
mB.pts.forEach(p=>{inner+='<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="4" fill="'+mB.color+'" opacity=".9"/>'});
svg.innerHTML=inner;
}
const SKY2={W:460,H:460,CX:230,CY:230,R:178,ANG:360/11};
let cmpReportCopy='';
function buildCompareReport(s1,s2){
const c1=s1.coords,c2=s2.coords;
const diffs=DIMS.map(d=>({d,d1:c1[d.id]||0,d2:c2[d.id]||0,df:Math.abs((c1[d.id]||0)-(c2[d.id]||0))})).sort((a,b)=>b.df-a.df);
const avg1=avgOf(c1),avg2=avgOf(c2);
const common=DIMS.filter(d=>{const v1=c1[d.id]||0,v2=c2[d.id]||0;return v1*v2>0&&Math.abs(v1)>=2&&Math.abs(v2)>=2});
const polar=diffs.filter(x=>x.df>=3);
const nr1=nearestRefs(c1)[0].r,nr2=nearestRefs(c2)[0].r;
const dirTxt=avg=>avg<-1?'整体更靠左极（在场 · 经营 · 计划一侧）':(avg>1?'整体更靠右极（抛掷 · 匿名 · 机缘一侧）':'整体居中，两面都够得着');
const short=avg=>avg<-1?'更靠左极':(avg>1?'更靠右极':'居中');
let h='';
h+='<div class="cmp-sec">01 · 整体姿态</div><p><b>'+esc(s1.name)+'</b>：'+dirTxt(avg1)+'；<b>'+esc(s2.name)+'</b>：'+dirTxt(avg2)+'。'+(avg1*avg2<0?'一个向内收、一个向外张，方向相反。':'整体方向一致或都停在中间，差别在具体的棱角上。')+'</p>';
if(common.length){
h+='<div class="cmp-sec">02 · 共同的棱角</div><p>两个形状在 '+common.slice(0,4).map(d=>'<b>「'+d.name+'」</b>（都偏'+(c1[d.id]<0?'左极':'右极')+'）').join('、')+' 上站在同一侧'+(common.length>4?'，还有 '+common.length+' 处也同向':'')+'——这是它们共享的底色。</p>';
}else{
h+='<div class="cmp-sec">02 · 共同的棱角</div><p>几乎没有同向且明显的棱角——两个形状几乎不共享站姿。</p>';
}
if(polar.length){
h+='<div class="cmp-sec">03 · 分歧最大的维度</div><p>';
polar.slice(0,3).forEach(x=>{
const aTxt=x.d1<0?'偏「'+x.d.left+'」（'+fmtVal(x.d1)+'）':(x.d1>0?'偏「'+x.d.right+'」（'+fmtVal(x.d1)+'）':'居中');
const bTxt=x.d2<0?'偏「'+x.d.left+'」（'+fmtVal(x.d2)+'）':(x.d2>0?'偏「'+x.d.right+'」（'+fmtVal(x.d2)+'）':'居中');
h+='<br>· <b>'+x.d.name+'</b>：A 侧 '+aTxt+'，B 侧 '+bTxt+'。';
});
h+='</p>';
}else{
h+='<div class="cmp-sec">03 · 分歧最大的维度</div><p>各维度差异都在 3 以内，两个形状非常接近。</p>';
}
if(polar.length){
const x=diffs[0];
if(Math.abs(x.d1)+Math.abs(x.d2)>=8){
h+='<div class="cmp-sec">04 · 最深的一刀</div><p>反差最大在 <b>「'+x.d.name+'」</b>（差距 '+x.df+'）：'+(x.d1*x.d2<0?('一个'+(x.d1<0?'靠近「'+x.d.left+'」':'靠近「'+x.d.right+'」')+'，另一个正好相反。这一刀是两者最不同的性格标记。'):('两者都偏向'+(x.d1<0?'左极':'右极')+'，只是程度差得远——同一种倾向，走到了不同距离。'))+'</p>';
}
}
h+='<div class="cmp-sec">05 · 各自的原型</div><p>'+esc(s1.name)+' 最接近 <b>「'+nr1.name+' · '+nr1.img+'」</b>；'+esc(s2.name)+' 最接近 <b>「'+nr2.name+' · '+nr2.img+'」</b>'+(nr1.id===nr2.id?'——它们其实共享同一个原型家族。':'——两个不同的原型家族。')+'</p>';
const n1=s1.name.split(' · ')[0],n2=s2.name.split(' · ')[0];
if(s1.kind==='snap'&&s2.kind==='snap'){
h+='<div class="cmp-sec">06 · 时间的移动</div><p>这两张都来自「'+esc(n1)+'」。星座从第一张移到第二张，真正变化的维度，就是生活在这段时间里动过的地方。</p>';
}else if(s1.kind==='person'&&s2.kind==='person'){
h+='<div class="cmp-sec">06 · 两种活法</div><p>同一副框架下的两种活法——TA 们与世界的关系，在这里被摆成了可比的形状。别急着分高下，先看差异都长在哪里。</p>';
}else{
h+='<div class="cmp-sec">06 · 你与 TA 的对照</div><p>一边是你的星史，一边是'+esc(s2.name.split(' · ')[0])+'——借别人的形状，看见自己站在哪、不在哪。</p>';
}
const copy=['【形态对比 · AI 报告】',
'对比：'+s1.name+' ⇄ '+s2.name,
'整体姿态：'+s1.name+' '+short(avg1)+'；'+s2.name+' '+short(avg2),
common.length?'共同棱角：'+common.slice(0,4).map(d=>d.name).join('、'):'共同棱角：无',
polar.length?'分歧维度：'+polar.slice(0,3).map(x=>x.d.name+'（'+fmtVal(x.d1)+' vs '+fmtVal(x.d2)+'）').join('，'):'分歧维度：各维度差异都在 3 以内',
'各自原型：'+s1.name+' → '+nr1.name+'；'+s2.name+' → '+nr2.name
].filter(Boolean).join('\n');
return {html:h,copyText:copy};
}
function renderCmpReport(){
const el=document.getElementById('cmpReport');
const idA=document.getElementById('cmpA').value,idB=document.getElementById('cmpB').value;
const A=resolveShape(idA),B=resolveShape(idB);
if(!A||!B)return;
if(idA===idB){
el.innerHTML='<h4>AI 对比报告</h4><p>你选了同一个对象。换一个再对比：先保存一段新的星史，或从人物库挑另一个人。</p>';
return;
}
const r=buildCompareReport(A,B);
el.innerHTML='<h4>AI 对比报告 · '+esc(A.name)+' ⇄ '+esc(B.name)+'</h4>'+r.html;
cmpReportCopy=r.copyText;
}
/* ===================== 交互事件 ===================== */
function toast(msg){
const t=document.getElementById('toast');
t.textContent=msg;t.classList.add('show');
clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2400);
}
function copyText(txt,okMsg){
if(!txt)return;
if(navigator.clipboard&&navigator.clipboard.writeText){
navigator.clipboard.writeText(txt).then(()=>toast(okMsg||'已复制')).catch(()=>toast('复制失败，请长按选择复制'));
}else{
const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();
try{document.execCommand('copy');toast(okMsg||'已复制')}catch(e){toast('复制失败，请长按选择复制')}
ta.remove();
}
}
function resetToInitial(){
state.coords=defaultCoords();state.refId=null;state.focusDim=null;personActive=null;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
highlightDim(null);renderAll();
}
function closeReportAndReset(){
document.getElementById('reportMask').classList.remove('on');
document.getElementById('saveMask').classList.remove('on');
resetToInitial();
toast('星图已回到初始状态，可以开始下一张');
}
function switchView(v){
state.view=v;
const tabV=v==='ref'?'edit':v;
if(['edit','history','compare','people'].includes(tabV)){
document.querySelectorAll('#mainTabs button').forEach(b=>b.classList.toggle('on',b.dataset.view===tabV));
}
document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='view-'+v));
}