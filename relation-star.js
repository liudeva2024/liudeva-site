/* ===================== 数据模型 ===================== */
const DIMS = [
{id:'loop',   name:'回路强度', left:'强反馈 · 碰撞验证', right:'无反馈 · 抛掷随缘'},
{id:'name',   name:'署名',     left:'在场 · 名字认领',   right:'匿名 · 消失'},
{id:'span',   name:'持续性',   left:'长期经营',          right:'一次性抛掷'},
{id:'target', name:'对象',     left:'特定的人',          right:'未知 / 无对象'},
{id:'dir',    name:'指向',     left:'向内修炼 · 冲刷自己', right:'向外验证 · 滚一圈拿反馈'},
{id:'stance', name:'投入姿态', left:'玩家 · 下场解题',   right:'观察者 · 在场记录'},
{id:'util',   name:'功能取向', left:'有用 · 资源交换',   right:'无用 · 纯粹联结'},
{id:'expr',   name:'显化程度', left:'内化 · 脑中闭环',   right:'外化 · 写出来做出来'},
{id:'venue',  name:'场域开合', left:'私 · 闭门纯粹',     right:'公 · 被世界看见'},
{id:'dens',   name:'密度',     left:'深而少 · 泡一个月', right:'广而杂 · 日读一本'},
{id:'chance', name:'随机性',   left:'计划 · 筛选布局',   right:'机缘 · 接受变异'}
];
const REFS = [
{id:'connector', name:'连通者', img:'天桥座', color:'#6fb8b0',
desc:'把世界拉近，让它回应你。习惯碰撞、验证、在回声中校准自己。',
coords:{loop:-8,name:-6,span:-8,target:-7,dir:4,stance:-6,util:-2,expr:6,venue:-4,dens:-4,chance:-6}},
{id:'thrower', name:'抛掷者', img:'流星座', color:'#d97b6c',
desc:'灵感到了就丢出去，像顽童往水里扔石子，涟漪随缘。不追反馈，也成立。',
coords:{loop:9,name:8,span:9,target:8,dir:4,stance:2,util:8,expr:-2,venue:4,dens:4,chance:8}},
{id:'field', name:'田野观察者', img:'根须座', color:'#7fb49a',
desc:'扎根、在场、记录。不急着干预世界，先把它看清，把自己作为方法。',
coords:{loop:2,name:-5,span:-6,target:-2,dir:-4,stance:7,util:6,expr:-6,venue:-1,dens:-5,chance:-4}},
{id:'both', name:'双栖者', img:'太极座', color:'#9a8cc7',
desc:'在两端之间游走，两边都有家，也两边都不完全属于。平衡是你的生存姿态。',
coords:{loop:0,name:0,span:0,target:0,dir:0,stance:0,util:0,expr:0,venue:0,dens:0,chance:0}},
{id:'keeper', name:'守望者', img:'灯塔座', color:'#e0b368',
desc:'安静地发自己的光，不追人、不解释。世界来不来，光都在。',
coords:{loop:7,name:2,span:0,target:5,dir:5,stance:6,util:4,expr:3,venue:-6,dens:-4,chance:-2}},
{id:'player', name:'玩家', img:'骰子座', color:'#8fb3d9',
desc:'把世界当游乐场，下场解题、开一局有限游戏。输了重来，赢了换关。',
coords:{loop:-7,name:-4,span:-4,target:-3,dir:6,stance:-8,util:0,expr:-3,venue:2,dens:2,chance:2}}
];
/* ===================== 状态 ===================== */
const STORE_KEY = 'world-relation-shapes-v1';
let state = {
mode: 'free',            // free | ref
view: 'edit',            // edit | ref | history | compare
coords: {},              // 当前 11 维坐标
refId: null,             // 当前套用的参考形态
profiles: [],            // 档案
activeProfile: null,
activeSnap: null         // 历史回放时载入的快照 id
};
let skyDirty = false;      // 星图拖拽标记
/* ===================== 工具函数 ===================== */
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function nowStr(){const d=new Date();const p=n=>String(n).padStart(2,'0');
return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())}
function dist(a,b){let s=0;for(const k of Object.keys(a)){const d=(a[k]||0)-(b[k]||0);s+=d*d}return Math.sqrt(s)}
function nearestRefs(coords){return REFS.map(r=>({r,d:dist(coords,r.coords)})).sort((x,y)=>x.d-y.d)}
function fmtVal(v){return v<0?'左'+(-v):(v>0?'右'+v:'0')}
function migrateV(v){return Math.round((v-50)/5)}
/* ===================== 存储 ===================== */
function loadStore(){
try{const raw=localStorage.getItem(STORE_KEY);if(raw){const d=JSON.parse(raw);
state.profiles=d.profiles||[];state.activeProfile=d.activeProfile||(state.profiles[0]&&state.profiles[0].id)||null}
}catch(e){}
state.profiles.forEach(p=>(p.snapshots||[]).forEach(s=>{
if(s.coords&&Object.keys(s.coords).some(k=>Math.abs(s.coords[k]||0)>10)){
for(const k in s.coords)s.coords[k]=migrateV(s.coords[k]);
}
}));
state.profiles.forEach((p,i)=>{if(!p.color)p.color=PROFILE_COLORS[i%PROFILE_COLORS.length]});
if(!state.profiles.length){const p={id:uid(),name:'我自己',color:'#e0b368',snapshots:[]};
state.profiles=[p];state.activeProfile=p.id}
if(!state.profiles.find(p=>p.id===state.activeProfile))state.activeProfile=state.profiles[0].id;
}
function saveStore(){try{localStorage.setItem(STORE_KEY,JSON.stringify({profiles:state.profiles,activeProfile:state.activeProfile}))}catch(e){}}
function activeProfile(){return state.profiles.find(p=>p.id===state.activeProfile)||state.profiles[0]}
function allSnapshots(){const out=[];state.profiles.forEach(p=>p.snapshots.forEach(s=>out.push({p,s})));return out.sort((a,b)=>b.s.ts-a.s.ts)}
/* ===================== 维度光谱列表 ===================== */
function dimHtml(d,v){
const kp=(v+10)*5; // 0→0% 居中→50% 10→100%
return '<div class="dim" id="dim-'+d.id+'" data-dim="'+d.id+'">'+
'<div class="dim-head" data-act="focus" data-dim="'+d.id+'">'+
'<span class="dim-name">'+d.name+'</span>'+
'<span class="dim-count">'+fmtVal(v)+'</span>'+
'</div>'+
'<div class="dim-poles"><span>'+d.left+'</span><span class="p-right">'+d.right+'</span></div>'+
'<div class="track">'+
'<div class="fill" style="left:'+Math.min(50,kp)+'%;width:'+Math.abs(kp-50)+'%"></div>'+
'<input type="range" min="-10" max="10" step="1" value="'+v+'" aria-label="'+d.name+'" data-dim="'+d.id+'">'+
'<div class="knob" style="left:'+kp+'%"><span class="glow"></span></div>'+
'</div>'+
'</div>';
}
function renderDims(){
const el=document.getElementById('dimList');
el.innerHTML=DIMS.map(d=>dimHtml(d,state.coords[d.id]||0)).join('');
}
function updateDimKnob(id,v){
const row=document.getElementById('dim-'+id);if(!row)return;
const kp=(v+10)*5;
row.querySelector('.knob').style.left=kp+'%';
const f=row.querySelector('.fill');
f.style.left=Math.min(50,kp)+'%';
f.style.width=Math.abs(kp-50)+'%';
row.querySelector('.dim-count').textContent=fmtVal(v);
}
function highlightDim(id){
document.querySelectorAll('.dim').forEach(d=>d.classList.remove('active'));
if(id)document.getElementById('dim-'+id).classList.add('active');
}
/* ===================== 星图 ===================== */
const SKY={W:460,H:460,CX:230,CY:230,R:168,LR:200,ANG:360/11};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
const SHORT={
loop:['强反馈','无反馈'],name:['在场','匿名'],span:['长期','抛掷'],target:['特定人','无对象'],
dir:['向内','向外'],stance:['玩家','观察'],util:['有用','无用'],expr:['内化','外化'],
venue:['私','公'],dens:['深而少','广而杂'],chance:['计划','机缘']
};
function axisUV(i){const a=(-90+i*SKY.ANG)*Math.PI/180;return {x:Math.cos(a),y:Math.sin(a)}}
function coordsToPoint(v,i){
const u=axisUV(i),t=v/10; // -10→左端(-1) 0→中心(0) 10→右端(1)
return {x:SKY.CX+u.x*t*SKY.R, y:SKY.CY+u.y*t*SKY.R};
}
function polyPoints(c){return DIMS.map((d,i)=>coordsToPoint(c[d.id]||0,i))}
function renderSkyInto(svg, coords, opts){
opts=opts||{};
const mainColor=opts.color||'#e0b368';
const stroke=opts.stroke||'#f3cf8f';
const grad=opts.grad||'bgGrad';
const focusDim=opts.focusDim||null;
const readonly=!!opts.readonly;
const ref=opts.ref||null;
const pts=polyPoints(coords);
const P=pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
let inner='';
inner+='<defs>'+
'<radialGradient id="'+grad+'" cx="50%" cy="50%" r="60%">'+
'<stop offset="0%" stop-color="#2a3150"/><stop offset="70%" stop-color="#1b2134"/><stop offset="100%" stop-color="#171c2c"/>'+
'</radialGradient>'+
'</defs>';
inner+='<circle cx="230" cy="230" r="'+SKY.R+'" fill="url(#'+grad+')" stroke="#39415a" stroke-width="1"/>';
inner+='<circle cx="230" cy="230" r="'+(SKY.R/2)+'" fill="none" stroke="#2a3145" stroke-width="1" stroke-dasharray="3 5"/>';
inner+='<circle cx="230" cy="230" r="4" fill="#6b7288"/>';
if(ref){
const rp=ref.coords;
const refPts=polyPoints(rp);
const RP=refPts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
inner+='<polygon points="'+RP+'" fill="'+ref.color+'" fill-opacity=".10" stroke="'+ref.color+'" stroke-width="1.5" stroke-dasharray="5 4"/>';
}
DIMS.forEach((d,i)=>{
const u=axisUV(i);
const x1=SKY.CX-u.x*SKY.R,y1=SKY.CY-u.y*SKY.R,x2=SKY.CX+u.x*SKY.R,y2=SKY.CY+u.y*SKY.R;
const on=!readonly&&focusDim===d.id;
inner+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" '+
'stroke="'+(on?'#e0b368':'#313a52')+'" stroke-width="'+(on?'2':'1')+'" opacity="'+(on?'.9':'.7')+'"/>';
const narrow=window.innerWidth<820;
if(!narrow||i%2===0){
const sh=SHORT[d.id]||['',''];
inner+='<text x="'+(SKY.CX-u.x*SKY.LR).toFixed(1)+'" y="'+(SKY.CY-u.y*SKY.LR+3.5).toFixed(1)+'" text-anchor="middle" font-size="10.5" fill="#66708a" pointer-events="none">'+esc(sh[0])+'</text>';
inner+='<text x="'+(SKY.CX+u.x*SKY.LR).toFixed(1)+'" y="'+(SKY.CY+u.y*SKY.LR+3.5).toFixed(1)+'" text-anchor="middle" font-size="10.5" fill="#66708a" pointer-events="none">'+esc(sh[1])+'</text>';
}
});
inner+='<polygon points="'+P+'" fill="'+mainColor+'" fill-opacity=".13" stroke="'+stroke+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
pts.forEach((p,i)=>{
inner+='<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="6" fill="#f4ecd8" stroke="'+mainColor+'" stroke-width="2" data-i="'+i+'"'+(readonly?'':' class="star-pt"')+'/>';
});
svg.innerHTML=inner;
}
function renderSky(){
const ref=(state.mode==='ref'&&state.refId)?REFS.find(r=>r.id===state.refId):null;
renderSkyInto(document.getElementById('sky'), state.coords, {ref:ref, focusDim:state.focusDim});
}
/* 星图拖拽：指针→最近轴投影 */
function bindSkyDrag(svg){
const W=SKY.W,H=SKY.H;
let active=-1;
function posFrom(e){
const rect=svg.getBoundingClientRect();
const sx=(e.clientX-rect.left)/rect.width*W;
const sy=(e.clientY-rect.top)/rect.height*H;
return {x:sx-SKY.CX,y:sy-SKY.CY};
}
function nearestAxis(p){
const ang=Math.atan2(p.y,p.x)*180/Math.PI;
let best=-1,bd=1e9;
DIMS.forEach((d,i)=>{const a=(-90+i*SKY.ANG)%360;let da=Math.abs(((ang-a)%360+540)%360-180);if(da<bd){bd=da;best=i}});
return bd<=SKY.ANG/2+6?best:-1;
}
function project(i,p){
const u=axisUV(i);
const t=(p.x*u.x+p.y*u.y)/SKY.R;
const clamped=Math.max(-1,Math.min(1,t));
return Math.round(clamped*10); // -10(极左)…0(居中)…+10(极右)
}
function onDown(e){
if(state.mode==='ref'){ /* 参考模式下也允许微调，视为自由微调 */ }
const p=posFrom(e);
const i=nearestAxis(p);
if(i>=0){active=i;state.focusDim=DIMS[i].id;highlightDim(state.focusDim);setVal(i,project(i,p));
svg.setPointerCapture(e.pointerId);renderSky();}
}
function onMove(e){
if(active<0)return;
const p=posFrom(e);setVal(active,project(active,p));
const pts=polyPoints(state.coords);
const pt=pts[active];
const c=svg.querySelector('circle[data-i="'+active+'"]');
if(c){c.setAttribute('cx',pt.x.toFixed(1));c.setAttribute('cy',pt.y.toFixed(1))}
const poly=svg.querySelector('polygon');let P=pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
if(poly&&poly.getAttribute('stroke')==='#f3cf8f')poly.setAttribute('points',P);
renderVerdict();
}
function onUp(){if(active>=0){active=-1;state.focusDim=null;highlightDim(null);renderSky()}}
svg.addEventListener('pointerdown',onDown);
svg.addEventListener('pointermove',onMove);
svg.addEventListener('pointerup',onUp);
svg.addEventListener('pointercancel',onUp);
}
/* 设置某维坐标：滑块与星图联动 */
function setVal(i,v){
personActive=null;
const d=DIMS[i];
state.coords[d.id]=v;
updateDimKnob(d.id,v);
renderVerdict();
}
/* ===================== 视图与描述 ===================== */
function renderVerdict(){
const el=document.getElementById('verdict');
const d=describe(state.coords);
let html='<div class="shape-name">'+(state.refId?'':'未命名星座')+'</div>';
if(state.refId){const r=REFS.find(x=>x.id===state.refId);html='<div class="shape-name">'+r.name+' · '+r.img+'</div><div class="shape-img">参考形态 · 可在下方微调</div>'}
html+='<div class="body">'+d.body+'</div>';
html+='<div class="tension">张力 · '+d.tension+'</div>';
html+='<div class="ref">参照 · '+d.ref+'</div>';
html+='<div class="ref" style="margin-top:6px">'+d.end+'</div>';
el.innerHTML=html;
}
function renderAll(){
renderDims();renderSky();renderVerdict();renderLib();renderHistory();renderCompare();updateHisDot();
}
/* ===================== 描述引擎（对话感） ===================== */
const BAND=(v)=>v<=-2?'L':(v>=2?'R':'M');
const TXT={
loop:{L:'你在关系里是接得住回应的：把它丢出去，就是要它弹回来，弹回来的声音帮你校准下一次。',
M:'你对反馈既不追也不躲——有回应当然好，没有也能继续。',
R:'你不指望世界回应你。丢出去就丢出去，涟漪有没有、溅到谁，你都接受。'},
name:{L:'你愿意署名、认领自己的言行——在场，意味着你为它负责。',
M:'你时而留下名字，时而隐去，看场合、也看心情。',
R:'你更想消失——不被知道是谁，动作本身就够了。'},
span:{L:'你是长期主义者：一个场、一段关系、一份耕耘，你愿意慢慢养。',
M:'你的经营时长随对象而定，有的值得长跑，有的点到为止。',
R:'你偏爱一次性：灵感到了就抛，不背长期包袱。'},
target:{L:'你的动作有明确对象——特定的那些人，你为他们而在场。',
M:'你的对象有时是具体的人，有时是恰好路过的人。',
R:'你没有预设对象。石子落向水面，谁接住都行，没人接也行。'},
dir:{L:'你更多把关系用在自己身上——读书、记录、冲刷神经元，养自己的内部。',
M:'你一半时间向内修炼，一半时间向外验证。',
R:'你习惯把思考滚进世界里，让生产力转一圈、拿回反馈。'},
stance:{L:'你下场。解题、开一局、亲手把它玩起来——是玩家的姿态。',
M:'你有时下场，有时退到一旁看，视局面而定。',
R:'你在场而不下场：观察、记录、让事情自行展开。你更信任看清，而非干预。'},
util:{L:'你倾向有用的联结——关系带着资源交换的实感。',
M:'你既在意关系有没有用，也在意它够不够纯粹。',
R:'你追求无用的联结——不为交换什么，纯粹因为气味相投、聊得来。'},
expr:{L:'你的很多关系发生在脑内闭环——想清楚了，不一定要做出来。',
M:'你一部分想法留在脑中，一部分落成文字、图、系统。',
R:'你高度外化：写下来、画出来、做出来。白板是你的思想画布。'},
venue:{L:'你偏好私密的场：闭门、纯粹，不为被看见。',
M:'你在私密和公开之间切换，看你此刻想要什么。',
R:'你不介意被世界看见——公开发声、留下痕迹，也是你与世界关系的一部分。'},
dens:{L:'你深而少：一个主题泡一个月，几个人深耕到底。',
M:'你有时深潜、有时广览，看手里的时间怎么分。',
R:'你广而杂：日读一本、多方涉猎，宁可摊开也不错过。'},
chance:{L:'你偏好计划：筛选、布局，世界按你的脚本走。',
M:'你一面列计划，一面给机缘留了一道门缝。',
R:'你欢迎机缘：随机变异是你的灵感来源，计划常常让位于偶然。'}
};
const DIM_CN={loop:'回路强度',name:'署名',span:'持续性',target:'对象',dir:'指向',stance:'投入姿态',util:'功能取向',expr:'显化程度',venue:'场域开合',dens:'密度',chance:'随机性'};
function describe(coords,opts){
opts=opts||{};
const vals=DIMS.map(d=>coords[d.id]||0);
const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
const sorted=DIMS.map(d=>({d,v:coords[d.id]||0})).sort((a,b)=>Math.abs(b.v||0)-Math.abs(a.v||0));
const top=sorted.slice(0,3);
let opening;
if(avg<-2)opening='你的星座整体向内收——大多数维度你靠向左极，站在在场、经营、计划这一侧。';
else if(avg>2)opening='你的星座整体向外张——大多数维度你靠向右极，站在抛掷、匿名、机缘这一侧。';
else opening='你的星座舒展在圆盘两侧，没有哪一边绝对占上风。';
const detail=[],mid=[];
top.forEach(t=>{
if(Math.abs(t.v)>=4)detail.push('在「'+t.d.name+'」上，'+TXT[t.d.id][BAND(t.v)]);
else mid.push('「'+t.d.name+'」');
});
const midLine=mid.length?'其余维度你大多停在中间附近，'+(mid.slice(0,2).join('、'))+(mid.length>2?'等':'')+'的姿态还没定死。':'';
let body='<p>'+opening+'</p>';
if(detail.length){body+='<p>最明显的是：</p>';detail.forEach(s=>{body+='<p>'+s+'</p>'})}
if(midLine)body+='<p>'+midLine+'</p>';
const edges=top.filter(t=>Math.abs(t.v)>=2);
let tension;
if(edges.length){
tension='你形状上最尖的棱角在 '+edges.map(t=>'「'+t.d.name+'」（偏'+(t.v<0?'左极':'右极')+'）').join('、')+'——这些地方你的姿态最不含糊，也是你与他人的形状最不一样的地方。';
}else{
tension='你目前几乎停在中间态，棱角还没长出来——拖一拖维度，形状会告诉你你站在哪。';
}
const nr=nearestRefs(coords);
const refA=nr[0].r,refB=nr[1].r;
let ref;
if(nr[0].d<4){
ref='你和「'+refA.name+' · '+refA.img+'」几乎重合——你的形状和它是一个星座的。';
}else{
const diffDims=DIMS.map(d=>({d,df:Math.abs((coords[d.id]||0)-(refA.coords[d.id]||0))})).sort((a,b)=>b.df-a.df);
const dd=diffDims[0].d;
const dirTxt=(coords[dd.id]||0)<(refA.coords[dd.id]||0)?'更偏「'+dd.left+'」这一端':'更偏「'+dd.right+'」这一端';
ref='你的形状最接近「'+refA.name+' · '+refA.img+'」，其次接近「'+refB.name+'」。和它相比，你在「'+dd.name+'」上'+dirTxt+'。';
}
const end='这张星图是会变的。隔段时间再画一次，对比看看你的星座往哪儿移动了——那往往就是生活本身在移动。';
return {
opening, body, tension, ref, end,
avg,
top: top.map(t=>({id:t.d.id,name:t.d.name,val:t.v})),
nearest: refA
};
}
/* ===================== AI 报告引擎（本地生成：命名候选 + 叙述解读） ===================== */
const avgOf=c=>DIMS.reduce((s,d)=>s+(c[d.id]||0),0)/DIMS.length;
const spreadOf=c=>DIMS.reduce((s,d)=>s+Math.abs(c[d.id]||0),0); // 总偏离
const conflictScore=c=>{
let n=0;
const pairs=[['loop','chance'],['stance','expr'],['dir','util'],['venue','dens'],['span','chance']];
pairs.forEach(([a,b])=>{
const va=(c[a]||0),vb=(c[b]||0);
if(Math.abs(va)>=4&&Math.abs(vb)>=4&&va*vb<0)n++;
});
return n*20;
};
const CANDIDATES=[
{name:'根须座',img:'向下扎根 · 向内深耕',
score:c=>-avgOf(c)*1.2-(c.span||0)*0.6-(c.dens||0)*0.6,
why:'整体向内收、偏好长期深耕——像根系扎进土壤，不与浮土争风，慢慢把土养肥。'},
{name:'流星座',img:'划过即走 · 涟漪随缘',
score:c=>avgOf(c)*1.2+(c.loop||0)*0.6+(c.target||0)*0.5,
why:'整体向外张，不追反馈、不预设对象——像流星划过夜空，涟漪有没有都不影响它划过。'},
{name:'天桥座',img:'连接两岸 · 以回应校准',
score:c=>-(c.loop||0)*0.8+(c.dir||0)*0.8,
why:'既要强反馈、又倾向向外验证——你在两岸之间架桥，用弹回来的声音校准自己。'},
{name:'太极座',img:'两端之间 · 舒展平衡',
score:c=>12-spreadOf(c),
why:'你的形状舒展在两端之间，不把任何一极占死——平衡本身就是你的姿态。'},
{name:'灯塔座',img:'安静发光 · 不追人',
score:c=>(c.stance||0)*0.7-(c.venue||0)*0.7-(c.dir||0)*0.4,
why:'你观察多过下场、偏好私密的场——像灯塔，安静发光，不追人、不解释。'},
{name:'骰子座',img:'下场开局 · 输赢随缘',
score:c=>(c.chance||0)*0.7-(c.stance||0)*0.7+(c.dir||0)*0.3,
why:'你欢迎机缘、习惯下场解题——像掷骰子的人，开局就要玩，结果随缘。'},
{name:'棱镜座',img:'把内在折射出来',
score:c=>(c.expr||0)*0.8+(c.dir||0)*0.6,
why:'你高度外化、倾向向外验证——像棱镜，把内在的光折射给世界看。'},
{name:'水纹座',img:'丢出即走 · 不追回声',
score:c=>(c.loop||0)*0.8+(c.target||0)*0.5,
why:'你不指望回应、也不预设对象——像往水里丢石子，涟漪有没有都不影响这个动作本身。'},
{name:'树冠座',img:'长期经营 · 枝叶舒展',
score:c=>-(c.span||0)*0.8-(c.dens||0)*0.5-(c.target||0)*0.4,
why:'你愿意长期养一段关系、深而少地投入——像一棵树，把时间一点点长进年轮里。'},
{name:'漩涡座',img:'内在拉扯 · 张力即动能',
score:c=>conflictScore(c),
why:'你的形状里有相互拉扯的维度——像漩涡，表面矛盾，其实是动能的来源。'},
{name:'琥珀座',img:'内化沉淀 · 不急于外放',
score:c=>-(c.expr||0)*0.8-(c.dir||0)*0.5-(c.chance||0)*0.4,
why:'你多在内化、少向外放——像琥珀，把想清楚的东西沉淀封存，等它自己变珍贵。'},
{name:'候鸟座',img:'广纳迁移 · 不占一隅',
score:c=>(c.dens||0)*0.6+(c.chance||0)*0.4+(c.venue||0)*0.4,
why:'你广而杂、随机缘、不介意被看见——像候鸟，逐季迁移，不把任何一处当唯一的家。'}
];
function buildReport(coords){
const c={...coords};
const scored=CANDIDATES.map(x=>({...x,s:x.score(c)})).sort((a,b)=>b.s-a.s);
const top2=scored.slice(0,2);
const swirl=scored.find(x=>x.name==='漩涡座');
const third=(swirl&&swirl.s>=12&&!top2.some(x=>x.name==='漩涡座'))?swirl:scored[2];
const picks=[top2[0],top2[1],third].filter((x,i,a)=>x&&a.findIndex(y=>y.name===x.name)===i).slice(0,3);
return {picks, coords:c, d:describe(c)};
}
function narrativeHtml(rep, idx){
const c=rep.coords, picks=rep.picks, main=picks[idx]||picks[0];
const d=rep.d;
const edges=d.top.filter(t=>Math.abs(t.val)>=2);
const P1='你的形状最像一座<b class="pk-tag">'+main.name+'</b>'+main.img+'。'+d.opening;
let P2='';
if(edges.length){
P2='最突出的棱角在<b>'+edges.slice(0,3).map(t=>'「'+t.name+'」').join('、')+'</b>：'+edges.slice(0,2).map(t=>TXT[t.id][BAND(t.val)]).join('');
}else{
P2='你目前几乎停在中间态——所有维度都在观望，形状还没长出棱角。';
}
let P3='';
if(conflictScore(c)>=12){
const pairs=[['loop','chance','你一边想要无反馈的松弛，一边想要计划的掌控'],['stance','expr','你一边想退到旁边观察，一边忍不住把事情做出来'],['dir','util','你一边想向内养自己，一边又在意关系有没有用']];
const hit=pairs.find(([a,b])=>Math.abs(c[a]||0)>=4&&Math.abs(c[b]||0)>=4&&((c[a]||0)*(c[b]||0)<0));
P3=hit?('你身上有组不太安分的拉扯：'+hit[2]+'。这不是毛病——漩涡的动能，往往就是从这种拉扯里来的。'):'';
}else if(Math.abs(avgOf(c))<2){
P3='你目前两面都够得着，但也因此还没把姿态定死——这可以是自由，也可以是等待。';
}
const P4=d.ref;
const others=picks.filter((_,j)=>j!==idx);
const P5=others.length?('命名说明：如果「'+main.name+'」不太像你，试试<b>「'+others[0].name+'」</b>——'+others[0].why):'';
const P6='这份报告来自你的 11 个坐标。隔段时间重画一次，对比看看星座往哪儿移动——那往往就是生活本身在移动。';
const narrative='<p>'+P1+'</p>'+(P2?'<p>'+P2+'</p>':'')+(P3?'<p>'+P3+'</p>':'')+'<p>'+P4+'</p>'+(P5?'<p>'+P5+'</p>':'')+'<p>'+P6+'</p>';
const copyText=['【我与世界的关系 · AI 报告】',
'主命名：'+main.name+'（'+main.img+'）',
'你的形状最像一座「'+main.name+'」。'+d.opening.replace(/<[^>]+>/g,''),
'最突出的棱角：'+(edges.length?edges.slice(0,3).map(t=>t.name+'（偏'+(t.val<0?'左极':'右极')+'）').join('、'):'暂无，停在中间态'),
d.ref.replace(/<[^>]+>/g,''),
others.length?'备选命名：'+others.map(x=>x.name+'（'+x.img+'）').join('、'):'',
'维度明细：'+DIMS.map(dd=>dd.name+' '+((c[dd.id]||0)<0?'偏左极':(c[dd.id]||0)>0?'偏右极':'居中')+'（'+fmtVal(c[dd.id]||0)+'）').join('，')
].filter(Boolean).join('\n');
return {narrative, copyText, mainName:main.name};
}
function aiReport(coords){
const rep=buildReport(coords);
return Object.assign({picks:rep.picks}, narrativeHtml(rep,0));
}
let repPickIdx=0, repLast=null;
/* ===================== 默认坐标（起步形：中间附近的微扰，让星图先有形） ===================== */
function defaultCoords(){return {loop:-2,name:-2,span:-2,target:-1,dir:0,stance:-1,util:-1,expr:-3,venue:-2,dens:-2,chance:-1}}
