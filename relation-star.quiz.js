/* ===== 问卷评测：MBTI 式 22 题 → 11 维坐标 → 直接生成星图 ===== */
/* 每维度 2 题，每题 5 档（-2..+2，负=偏左极，正=偏右极）；同维两题求和 ∈[-4,4]，映射 /4*10 → [-10,10] */
const QUIZ_ITEMS=[
{dim:'loop',left:'强反馈·碰撞验证',right:'无反馈·抛掷随缘',q:'做完一件事，你更常是哪种状态？',opts:[
{t:'必须找懂行的人碰撞验证，确认对错',v:-2},{t:'会找人聊聊，但没那么必须',v:-1},{t:'说不清，看情况',v:0},{t:'做完就放下，不太追反馈',v:1},{t:'刻意不给它反馈回路，让它自己漂',v:2}]},
{dim:'loop',left:'强反馈·碰撞验证',right:'无反馈·抛掷随缘',q:'对「无人回应的表达」，你的真实感受是？',opts:[
{t:'没人回应等于没做，会难受',v:-2},{t:'期待回应，但也能接受',v:-1},{t:'无所谓',v:0},{t:'反而轻松，回应是负担',v:1},{t:'这才是理想状态，抛出去就不管了',v:2}]},
{dim:'name',left:'在场·名字认领',right:'匿名·消失',q:'你更享受哪种创作或表达状态？',opts:[
{t:'署名发表，被认出是我做的',v:-2},{t:'会署名，但不太在意名气',v:-1},{t:'都可以',v:0},{t:'匿名表达更自在',v:1},{t:'最好没人知道是我，做完就消失',v:2}]},
{dim:'name',left:'在场·名字认领',right:'匿名·消失',q:'面对「留下名字」这件事，你更接近？',opts:[
{t:'名字是我的在场证明，要认领',v:-2},{t:'会留名，顺其自然',v:-1},{t:'看场合',v:0},{t:'倾向隐去姓名',v:1},{t:'名字是负担，消失才自由',v:2}]},
{dim:'span',left:'长期经营',right:'一次性抛掷',q:'你更倾向哪种做事节奏？',opts:[
{t:'选一件事，泡很多年',v:-2},{t:'会坚持，但也会调整',v:-1},{t:'看事情性质',v:0},{t:'大多做一阵子就换',v:1},{t:'一次性抛掷，做完就走',v:2}]},
{dim:'span',left:'长期经营',right:'一次性抛掷',q:'看到一个人十年做同一件事，你？',opts:[
{t:'深以为然，这是我最佩服的形态',v:-2},{t:'佩服，但我做不到',v:-1},{t:'各有各的好',v:0},{t:'有点可惜，世界那么大',v:1},{t:'不理解，为什么要绑住自己',v:2}]},
{dim:'target',left:'特定的人',right:'未知/无对象',q:'你的表达和行动，更多是？',opts:[
{t:'为了某个具体的人（家人/朋友/读者）',v:-2},{t:'为了明确的一小群人',v:-1},{t:'有时有对象，有时没有',v:0},{t:'说不清对象，就是想说',v:1},{t:'没有对象，向虚空抛出',v:2}]},
{dim:'target',left:'特定的人',right:'未知/无对象',q:'「写给谁看、做给谁用」这个问题，你？',opts:[
{t:'心里一直有个具体的「你」',v:-2},{t:'有大概的受众画像',v:-1},{t:'不太想这个问题',v:0},{t:'随缘，谁看谁看',v:1},{t:'拒绝预设对象，对象会限制我',v:2}]},
{dim:'dir',left:'向内修炼·冲刷自己',right:'向外验证·滚一圈拿反馈',q:'一次碰撞或交流之后，你更在意？',opts:[
{t:'它冲刷了我自己什么',v:-2},{t:'更认识自己了',v:-1},{t:'都留意',v:0},{t:'拿到外界反馈，知道好不好',v:1},{t:'外面怎么反应，这才算数',v:2}]},
{dim:'dir',left:'向内修炼·冲刷自己',right:'向外验证·滚一圈拿反馈',q:'你做事的主指向更接近？',opts:[
{t:'把自己修炼好，向内用功',v:-2},{t:'主要是自我成长',v:-1},{t:'平衡',v:0},{t:'主要是做出来给世界看',v:1},{t:'拿出去滚一圈，让世界给我反馈',v:2}]},
{dim:'stance',left:'玩家·下场解题',right:'观察者·在场记录',q:'遇到一个很深的议题，你的本能是？',opts:[
{t:'下场，亲自解决它',v:-2},{t:'参与，但保持一份清醒',v:-1},{t:'看情况',v:0},{t:'站在旁边看，记录它',v:1},{t:'只做观察者，不搅进去',v:2}]},
{dim:'stance',left:'玩家·下场解题',right:'观察者·在场记录',q:'别人在激烈争论时，你通常？',opts:[
{t:'忍不住加入，有自己的立场要争',v:-2},{t:'会表态，但不会缠斗',v:-1},{t:'听',v:0},{t:'安静记录，不站队',v:1},{t:'观察本身就是我的参与方式',v:2}]},
{dim:'util',left:'有用·资源交换',right:'无用·纯粹联结',q:'在一段关系里，你更看重？',opts:[
{t:'彼此有用，能交换价值',v:-2},{t:'有用和投缘都要',v:-1},{t:'看关系类型',v:0},{t:'有没有用不重要，聊得来就行',v:1},{t:'纯粹联结，任何「有用」都会玷污它',v:2}]},
{dim:'util',left:'有用·资源交换',right:'无用·纯粹联结',q:'「这件事有什么用？」这个问题，你？',opts:[
{t:'我常问，有用是硬标准',v:-2},{t:'会考虑，但不是唯一',v:-1},{t:'偶尔问',v:0},{t:'几乎不问',v:1},{t:'问了就俗了，无用才有意思',v:2}]},
{dim:'expr',left:'内化·脑中闭环',right:'外化·写出来做出来',q:'你的想法通常？',opts:[
{t:'脑子里闭环就够了',v:-2},{t:'会整理，但不一定要产出',v:-1},{t:'看情况',v:0},{t:'要写出来、做出来才完整',v:1},{t:'不落地等于没想',v:2}]},
{dim:'expr',left:'内化·脑中闭环',right:'外化·写出来做出来',q:'面对一个想清楚的念头，你更可能？',opts:[
{t:'自己留着，越想越透',v:-2},{t:'偶尔跟人说说',v:-1},{t:'视情况',v:0},{t:'写下来、做出来',v:1},{t:'必须外化成作品或行动才算数',v:2}]},
{dim:'venue',left:'私·闭门纯粹',right:'公·被世界看见',q:'你更愿意在哪种场域里深入？',opts:[
{t:'私密小圈子，闭门聊',v:-2},{t:'半公开，熟人间',v:-1},{t:'都可以',v:0},{t:'公开场域，面向陌生人',v:1},{t:'越公开越好，被世界看见',v:2}]},
{dim:'venue',left:'私·闭门纯粹',right:'公·被世界看见',q:'「被很多人看见」这件事，你？',opts:[
{t:'会打扰我，我只要小圈子',v:-2},{t:'不太想被看见',v:-1},{t:'无所谓',v:0},{t:'有点期待',v:1},{t:'是我做事的动力之一',v:2}]},
{dim:'dens',left:'深而少·泡一个月',right:'广而杂·日读一本',q:'你更接近哪种输入方式？',opts:[
{t:'一个月只泡一本书或一个人',v:-2},{t:'深，但也会穿插浅的',v:-1},{t:'看状态',v:0},{t:'每天读很多，广撒网',v:1},{t:'越快越杂越好，广度就是养分',v:2}]},
{dim:'dens',left:'深而少·泡一个月',right:'广而杂·日读一本',q:'面对「深而少 vs 广而杂」，你站哪边？',opts:[
{t:'深而少，把一件事泡透',v:-2},{t:'偏深，偶尔广',v:-1},{t:'都行',v:0},{t:'偏广，什么都知道点',v:1},{t:'广而杂，我享受走马观花',v:2}]},
{dim:'chance',left:'计划·筛选布局',right:'机缘·接受变异',q:'你更信任哪种路径？',opts:[
{t:'计划好、筛选过、有布局',v:-2},{t:'大方向计划，留一点随机',v:-1},{t:'看情况',v:0},{t:'随缘，撞到什么算什么',v:1},{t:'机缘最大，我主动迎接意外',v:2}]},
{dim:'chance',left:'计划·筛选布局',right:'机缘·接受变异',q:'计划外的意外插曲，你的反应是？',opts:[
{t:'会修正回来，按计划走',v:-2},{t:'有点不适，但能接受',v:-1},{t:'无所谓',v:0},{t:'反而喜欢',v:1},{t:'这才是生活的正菜，计划才是插曲',v:2}]}
];
let qzAns=Array(QUIZ_ITEMS.length).fill(null);
let qzIdx=0;
function renderQuiz(){
const it=QUIZ_ITEMS[qzIdx];
document.getElementById('quizProg').style.width=((qzIdx+1)/QUIZ_ITEMS.length*100)+'%';
document.getElementById('quizPos').textContent='第 '+(qzIdx+1)+' / '+QUIZ_ITEMS.length+' 题';
document.getElementById('quizQ').textContent=it.q;
document.getElementById('quizLeft').textContent='← '+it.left;
document.getElementById('quizRight').textContent=it.right+' →';
document.getElementById('quizOpts').innerHTML=it.opts.map((o,i)=>
'<button class="quiz-opt'+(qzAns[qzIdx]===o.v?' on':'')+'" data-i="'+i+'">'+
'<span class="tag">'+'ABCDE'[i]+'</span><span>'+o.t+'</span></button>').join('');
const next=document.getElementById('quizNext');
next.disabled=qzAns[qzIdx]===null;
next.textContent=qzIdx===QUIZ_ITEMS.length-1?'生成星图':'下一题';
document.getElementById('quizPrev').disabled=qzIdx===0;
}
function finishQuiz(){
const coords={};
QUIZ_ITEMS.forEach((it,i)=>{
coords[it.dim]=(coords[it.dim]||0)+(qzAns[i]===null?0:qzAns[i]);
});
for(const k in coords)coords[k]=Math.round(coords[k]/4*10);
state.coords=coords;state.mode='free';state.refId=null;personActive=null;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
switchView('edit');
renderAll();
document.getElementById('btnReport').click();
toast('问卷完成，已生成你的星图');
}
document.getElementById('quizOpen').addEventListener('click',()=>{
qzAns=Array(QUIZ_ITEMS.length).fill(null);qzIdx=0;
switchView('quiz');renderQuiz();
});
document.getElementById('quizQuit').addEventListener('click',()=>switchView('edit'));
document.getElementById('quizOpts').addEventListener('click',e=>{
const b=e.target.closest('.quiz-opt');if(!b)return;
qzAns[qzIdx]=QUIZ_ITEMS[qzIdx].opts[+b.dataset.i].v;
renderQuiz();
});
document.getElementById('quizNext').addEventListener('click',()=>{
if(qzIdx<QUIZ_ITEMS.length-1){qzIdx++;renderQuiz();}
else finishQuiz();
});
document.getElementById('quizPrev').addEventListener('click',()=>{
if(qzIdx>0){qzIdx--;renderQuiz();}
});