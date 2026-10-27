/* ===================== 人物模式 ===================== */
const SIGNALS={
loop:{L:['反馈','互动','回应','验证','讨论','校准','交流','对话','复盘','迭代'],R:['不在乎','不求回应','随缘','不追','不指望','不care','接受一切']},
name:{L:['署名','真名','公开身份','实名','认领','留下名字'],R:['匿名','化名','不署名','消失','马甲','隐去','隐姓埋名']},
span:{L:['长期','深耕','十年','一辈子','持续','坚持','年复一年','终身','几十年'],R:['一次性','短期','过把瘾','当下','即时','临时','玩玩']},
target:{L:['特定','朋友','家人','至亲','某人','具体的人','身边'],R:['大众','所有人','陌生人','任何人','无对象','全世界','用户','读者']},
dir:{L:['内省','反思','自我','修炼','内心','认知','读书','想清楚','内观'],R:['改变世界','影响','验证','市场','输出','落地','成就','征服','驱动']},
stance:{L:['下场','创业','动手','执行','实践','亲自','实干','参与','投身'],R:['观察','记录','旁观','研究','田野','审视','抽离','注视']},
util:{L:['有用','变现','商业','价值','效率','回报','盈利','收益','生意'],R:['纯粹','无用','不功利','热爱','兴趣','情怀','自洽','不管不顾','燃烧']},
expr:{L:['思考','内化','琢磨','酝酿','沉淀','藏在心里','慎思'],R:['写作','发布','公开','表达','创作','分享','做出来','发声']},
venue:{L:['私下','闭门','内部','小圈子','独处','书房','只对'],R:['公开','公众','全网','舞台','大众','面向世界','发声','演播']},
dens:{L:['专注','深耕','专一','单一','聚焦','只做','一辈子一件事'],R:['广泛','多元','跨界','涉猎','多领域','什么都','杂','通才']},
chance:{L:['计划','规划','战略','布局','刻意','目标','安排','设计'],R:['偶然','随缘','随机','意外','机缘','即兴','变化','未知','不可控']}
};
const PEOPLE_BASE=[
'https://liudeva.com/people/',
'https://liudeva2024.github.io/liudeva-site/people/',
'https://cdn.jsdelivr.net/gh/liudeva2024/liudeva-site@main/people/',
'https://raw.githubusercontent.com/liudeva2024/liudeva-site/main/people/'
];
const BUILTIN_PEOPLE={
"xiang-biao":{"id":"xiang-biao","name":"项飙","alias":["项飙","项飚","Xiang Biao","Biao Xiang"],"color":"#6aa884","summary":"牛津大学社会人类学教授、德国马克斯·普朗克社会人类学研究所所长；《跨越边界的社区》《把自己作为方法》作者，提出「附近」与「把自己作为方法」","coords":{"loop":-4,"name":-8,"span":-8,"target":-8,"dir":-1,"stance":6,"util":4,"expr":4,"venue":4,"dens":-7,"chance":2},"analysis":"<p>项飙的星座像一棵<b>行走的根</b>——一个不断迁移、却始终扎进具体人群里的田野观察者。他拥有 11 维里罕见的组合：密度极左（一个田野泡六年），场域却偏右（公共发声不断）。研究对象永远是「附近」里那些具体的、被忽略的人，对话的场域却是整个公共社会。</p><p>他把「观察」推到极致：不下场干预、不产出改变世界的方案，只负责看见、记录，把底层世界的内部逻辑讲清楚——这正是他 1992 年「偶然听到」浙江村后连续六年平视记录所确立的姿态。</p><p>但他又不是冷眼旁观者：「把自己作为方法」让他把自己放进认知过程里，用自我经验冲刷对世界的理解。他的指向维度停在中间——向内（自我反思）与向外（公共言说）之间没有输赢，反而成了他认知生产力的来源。</p><p>若说他是「根须座」（田野观察者）的变体，他的根须不是长在书斋里，而是长在流动的、具体的人与人之间——这也是他与这个时代大多数「悬在空中」的人（他自己的比喻：蜂鸟）最不同的地方。</p>","profile":"项飙，1972年生于浙江温州。1990年保送北京大学社会学系，1992年因偶然听闻开始在北京南城「浙江村」进行田野调查，持续六年形成硕士论文《跨越边界的社区：北京“浙江村”的生活史》。1998年免试进入牛津大学读社会人类学博士，论文主题为全球「猎身」（Global Body Shopping）；2003年留校任教，2015年成为教授，现任德国马克斯·普朗克社会人类学研究所所长。著有《跨越边界的社区》《全球“猎身”》《把自己作为方法》（与吴琦对谈）；提出「附近」「附近的消失」「重建附近」等概念，认为重建附近不是论述，而是一种劝说。曾获2008年美国人类学协会Anthony Leeds奖、2012年William L. Holland奖。","reason":"11维打分依据公开资料：牛津大学/马克斯·普朗克研究所简历（生平与学术路径）、北大校友网专访（浙江村六年田野、蜂鸟比喻）、澎湃新闻专访（附近/重建附近、对当下年轻人的劝说）、南方医科大学图书馆/湖南大学图书馆作者简介（著作与获奖）、中国民俗学网自述（反对精英主义、展示被忽略群体的内部逻辑）。","source":"维基百科/牛津大学简历/马克斯·普朗克研究所CV/澎湃新闻专访/北大校友网","updated":"2026-10-26"}
};
const BUILTIN_INDEX=Object.keys(BUILTIN_PEOPLE).map(k=>{const p=BUILTIN_PEOPLE[k];return {id:p.id,name:p.name,summary:p.summary||'',color:p.color||'#8fb3d9',source:p.source,updated:p.updated}});
let personActive=null;   // {name, coords, ...} 人物模式上下文
let peopleLib=[];        // 人物库索引
async function fetchJson(urls,ms){
ms=ms||8000;
for(const u of urls){
const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),ms);
try{
const r=await fetch(u,{signal:ctrl.signal});
clearTimeout(t);
if(!r.ok)throw new Error('http'+r.status);
return await r.json();
}catch(e){clearTimeout(t);}
}
throw new Error('all sources failed');
}
async function loadPeopleIndex(){
const empty=document.getElementById('pEmpty');
peopleLib=BUILTIN_INDEX.slice();   // 内置索引立即渲染，秒开人物库
renderPeopleLib();
const cnt=document.getElementById('pCnt');if(cnt)cnt.textContent='共 '+peopleLib.length+' 人 · 内置版';
try{
const idx=await fetchJson(PEOPLE_BASE.map(b=>b+'index.json'),6000);
if(idx&&Array.isArray(idx.people)&&idx.people.length){
peopleLib=idx.people;          // 在线索引可达 → 静默升级
renderPeopleLib();
try{renderCompare()}catch(e){}
}
}catch(e){/* 在线不可达时保持内置版 */}
}
function renderPeopleLib(){
const el=document.getElementById('pLib');if(!el)return;
const cnt=document.getElementById('pCnt');
const empty=document.getElementById('pEmpty');
cnt.textContent='共 '+peopleLib.length+' 人';
if(!peopleLib.length){empty.style.display='block';el.innerHTML='';return}
empty.style.display='none';
el.innerHTML=peopleLib.map(p=>{
const c=p.coords||defaultCoords();
return '<div class="person-card" data-id="'+esc(p.id)+'">'+
miniSky(c,p.color||'#8fb3d9')+
'<div class="nm">'+esc(p.name)+'</div>'+
'<div class="im">'+esc(p.summary||'')+'</div>'+
'<div class="mt">'+(p.source?esc(p.source):'')+(p.updated?' · '+esc(p.updated):'')+'</div>'+
'</div>';
}).join('');
}
async function loadPerson(id){
const builtin=BUILTIN_PEOPLE[id];
if(builtin){
applyPerson(builtin);            // 内置数据秒开，不等网络
}else{
const st=document.getElementById('pStatus');
st.innerHTML='正在加载 <b>'+esc(id)+'</b> 的资料…';
}
try{
const data=await fetchJson(PEOPLE_BASE.map(b=>b+'people/'+encodeURIComponent(id)+'.json'),6000);
if(data&&data.id&&data.name&&!(builtin&&data.updated===builtin.updated)){
applyPerson(data);             // 在线版可用且与内置不同 → 静默升级
toast('已载入在线版「'+data.name+'」');
}
}catch(e){
if(!builtin)toast('在线数据加载失败，请稍后再试');
}
}
function applyPerson(data){
personActive=data;
state.coords={...defaultCoords(),...(data.coords||{})};
state.refId=null;state.mode='free';
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
switchView('person-detail');
renderPersonDetail();
toast('已载入「'+data.name+'」的星座与分析');
}
let personCopyText='';
function renderPersonDetail(opts){
opts=opts||{};
const data=personActive;if(!data)return;
document.getElementById('pDetailName').textContent=data.name;
document.getElementById('pDetailSub').textContent=data.summary||'';
renderSkyInto(document.getElementById('skyPerson'),data.coords||defaultCoords(),{color:data.color||'#8fb3d9',grad:'bgGradPerson',readonly:true});
let body,copy;
if(opts.heuristic){
const r=heuristicReport(data,opts.heuristic.hits);
body=r.html;copy=r.copyText;
}else{
body=data.analysis||'';
if(!body){const rep=buildReport(data.coords||defaultCoords());body=narrativeHtml(rep,0).narrative;}
copy=personCopyFrom(data,body);
}
document.getElementById('pDetailBody').innerHTML=body;
const meta=[];
if(data.source)meta.push('资料来源：'+data.source);
if(data.updated)meta.push('更新于：'+data.updated);
document.getElementById('pDetailMeta').innerHTML=meta.length?'<b>来源与更新</b><br>'+meta.join('<br>'):'';
const more=[];
if(data.reason)more.push('<p>'+data.reason+'</p>');
if(data.profile)more.push('<p><b>人物小传</b><br>'+data.profile+'</p>');
document.getElementById('pDetailReason').innerHTML=more.join('');
personCopyText=copy;
}
function heuristicReport(meta,hits){
const c=meta.coords||defaultCoords();
const rep=buildReport(c);
const edges=rep.d.top.filter(t=>Math.abs(t.val)>=2);
let html='<p><b style="color:var(--gold2)">'+esc(meta.name)+'</b> 的星座初筛——由资料文本的信号词自动映射'+(hits>=8?'，信号较丰富，形状参考价值较高':'，信号较少（'+hits+'/11 维有信号），仅供参考')+'。</p>';
html+='<p>'+toPersonText(rep.d.opening,meta.name)+'</p>';
if(edges.length){
html+='<p>最突出的棱角在 '+edges.slice(0,3).map(t=>'<b>「'+t.name+'」</b>').join('、')+'：'+edges.slice(0,2).map(t=>toPersonText(TXT[t.id][BAND(t.val)],meta.name)).join('')+'</p>';
}
html+='<p>'+toPersonText(rep.d.ref,meta.name)+'</p>';
html+='<p class="hint">以上是本地初筛，把每个维度当作假设——点下方「载入编绘微调」拖一拖维度，形状会告诉你 TA 站在哪。想要更准的深度分析，回人物页用「请豆包深度分析」。</p>';
const copyText='【'+meta.name+' · 关系形态初筛报告】\n主命名：'+rep.picks[0].name+'（'+rep.picks[0].img+'）\n'+
toPersonText(rep.d.opening,meta.name).replace(/<[^>]+>/g,'')+'\n'+
'最突出的棱角：'+(edges.length?edges.slice(0,3).map(t=>t.name).join('、'):'暂无')+'\n'+
toPersonText(rep.d.ref,meta.name).replace(/<[^>]+>/g,'')+'\n'+
'维度明细：'+DIMS.map(dd=>dd.name+' '+((c[dd.id]||0)<0?'偏左极':(c[dd.id]||0)>0?'偏右极':'居中')+'（'+fmtVal(c[dd.id]||0)+'）').join('，');
return {html,copyText};
}
function personCopyFrom(data,body){
const plain=String(body||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const c=data.coords||defaultCoords();
return '【'+data.name+' · 关系形态分析】\n'+(data.summary?data.summary+'\n':'')+'分析：\n'+plain+'\n维度明细：'+DIMS.map(dd=>dd.name+' '+((c[dd.id]||0)<0?'偏左极':(c[dd.id]||0)>0?'偏右极':'居中')+'（'+fmtVal(c[dd.id]||0)+'）').join('，');
}
async function wikiSummary(name){
const url='https://zh.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(name);
const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),9000);
try{
const r=await fetch(url,{signal:ctrl.signal});
clearTimeout(t);
if(!r.ok)throw new Error('http'+r.status);
return await r.json();
}catch(e){clearTimeout(t);throw e}
}
async function onSearchPerson(){
const name=document.getElementById('pName').value.trim();
const st=document.getElementById('pStatus');
if(!name){st.innerHTML='<span class="err">先输入一个名字。</span>';return}
st.innerHTML='正在检索 <b>'+esc(name)+'</b>（直连维基百科，若网络不通会提示改用粘贴）…';
try{
const j=await wikiSummary(name);
const text=((j.extract||'')+' '+(j.description||'')).trim();
if(!text)throw new Error('empty');
const {coords,hits}=heuristicMap(text);
personActive={name:j.title||name,alias:[name],summary:j.description||'',source:'维基初筛',profile:(j.extract||'').slice(0,900),coords:coords};
st.innerHTML='<span class="ok">已获取资料（维基百科 · '+esc(j.title||name)+'）</span>，已按资料本地初筛：';
st.innerHTML+='<pre>'+esc((j.extract||'').slice(0,500))+(j.extract&&j.extract.length>500?'…':'')+'</pre>';
applyHeuristic(personActive,hits);
}catch(e){
st.innerHTML='<span class="err">直连维基百科失败（国内网络通常如此）。</span>换这两条路：<br>① 展开上方「直接粘贴人物资料」，粘贴一两段简介做本地初筛；<br>② 复制「请豆包深度分析」指令，让豆包联网检索并把人物存进人物库。';
}
}
function heuristicMap(text){
const t=(text||'').slice(0,2500).toLowerCase();
const coords={};let hits=0;
for(const d of DIMS){
let s=0;
(SIGNALS[d.id].L||[]).forEach(w=>{if(t.includes(w))s-=1});
(SIGNALS[d.id].R||[]).forEach(w=>{if(t.includes(w))s+=1});
let v=Math.round(s*1.2);
v=Math.max(-8,Math.min(8,v));
coords[d.id]=v;
if(Math.abs(v)>=2)hits++;
}
return {coords,hits};
}
function onHeuristicPaste(){
const t=document.getElementById('pText').value.trim();
const st=document.getElementById('pStatus');
const name=document.getElementById('pName').value.trim()||'这位人物';
if(t.length<20){st.innerHTML='<span class="err">资料太短，至少粘贴一两段（20 字以上）。</span>';return}
const {coords,hits}=heuristicMap(t);
applyHeuristic({name:name,alias:[],summary:'粘贴资料初筛',source:'粘贴资料 · 本地初筛',profile:t.slice(0,900),coords:coords},hits);
}
function applyHeuristic(meta,hits){
personActive=meta;
state.coords={...meta.coords};state.refId=null;state.mode='free';
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
switchView('person-detail');
renderPersonDetail({heuristic:{hits:hits}});
toast('已按资料初筛出「'+meta.name+'」的星座');
}
function toPersonHtml(text,name){
return String(text||'').replace(/你的/g,name+'的').replace(/你/g,name);
}
function toPersonText(text,name){
return String(text||'').replace(/你的/g,name+'的').replace(/你/g,name);
}
function buildDoubaoPrompt(name){
return '请用「我与世界的关系 · 11 维框架」深度分析人物：'+(name||'XXX')+'。\n\n'+
'11 个维度（每个都是左极↔右极的光谱）：\n'+
DIMS.map(d=>d.name+'（'+d.left+' ↔ '+d.right+'）').join('\n')+
'\n\n请：1) 联网检索 TA 的公开资料；2) 为每个维度打分：-10~+10，0=居中，负数=偏左极（如左5=-5），正数=偏右极（如右8=+8），数字越大越极端，并给一句话理由；3) 写一段有洞察的人物分析；4) 按「形态星图」人物 JSON 格式返回（含 name / alias / color / summary / coords / analysis / profile / reason / source / updated），我好把它存进人物库。';
}
/* ===================== 初始化 ===================== */
(function init(){
loadStore();
state.coords=defaultCoords();
bindEvents();
bindSkyDrag(document.getElementById('sky'));
renderAll();
loadPeopleIndex();
})();