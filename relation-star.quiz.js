/* ===== 问卷评测：MBTI 式 33 题 → 11 维坐标 → 直接生成星图 ===== */
/* 每维度 3 题，每题 5 档（-2..+2，负=偏左极，正=偏右极）；同维三题求和 ∈[-6,6]，映射 /6*10 → [-10,10] */
/* 设计原则：题干用生活情境，不出现维度术语；选项是具体行为而非程度形容词 */
const QUIZ_ITEMS=[
{dim:'loop',left:'强反馈·碰撞验证',right:'无反馈·抛掷随缘',q:'你做完一件事后，通常会？',opts:[
{t:'找内行核对一遍，确认没跑偏',v:-2},{t:'找熟人聊聊，听听反应',v:-1},{t:'看情况，有的会有的不会',v:0},{t:'做完就放下，很少回头看',v:1},{t:'刻意不安排反馈，让它自己走',v:2}]},
{dim:'loop',left:'强反馈·碰撞验证',right:'无反馈·抛掷随缘',q:'一个想法在你心里打转很久，你？',opts:[
{t:'必须讲出来，有人接住才算完成',v:-2},{t:'会找一两个人说说',v:-1},{t:'说不说都行',v:0},{t:'更愿意自己留着',v:1},{t:'说出去反而觉得散掉了',v:2}]},
{dim:'loop',left:'强反馈·碰撞验证',right:'无反馈·抛掷随缘',q:'表达之后，你更多处于哪种状态？',opts:[
{t:'等着回应，没回应心里空',v:-2},{t:'有期待，但不强求',v:-1},{t:'偶尔看看',v:0},{t:'发完即忘',v:1},{t:'发完就不再关注结果',v:2}]},
{dim:'name',left:'在场·名字认领',right:'匿名·消失',q:'你更想以哪种方式被记住？',opts:[
{t:'名字和作品连在一起，被点名',v:-2},{t:'名字在就行，不一定要被记住',v:-1},{t:'都行',v:0},{t:'内容被记住就好，别挂我的名',v:1},{t:'最好没人记得是谁做的',v:2}]},
{dim:'name',left:'在场·名字认领',right:'匿名·消失',q:'有人转发了你的东西但没标出处，你？',opts:[
{t:'不舒服，会去要个说法',v:-2},{t:'有点介意，但不至于计较',v:-1},{t:'无所谓',v:0},{t:'反而轻松',v:1},{t:'这正合我意，内容活着就行',v:2}]},
{dim:'name',left:'在场·名字认领',right:'匿名·消失',q:'你在意「这件事是我做的」这个标记吗？',opts:[
{t:'在意，这是我的在场证明',v:-2},{t:'有一点在意',v:-1},{t:'说不好',v:0},{t:'不太在意',v:1},{t:'完全不在意，最好没有标记',v:2}]},
{dim:'span',left:'长期经营',right:'一次性抛掷',q:'你更羡慕哪种人的活法？',opts:[
{t:'一辈子把一件事做深的人',v:-2},{t:'几年深耕一件事的人',v:-1},{t:'看领域而定',v:0},{t:'不断换新领域的人',v:1},{t:'把每件事都当一次性体验的人',v:2}]},
{dim:'span',left:'长期经营',right:'一次性抛掷',q:'开始做一件事时，你心里默认的期限是？',opts:[
{t:'以年计，奔着长期去',v:-2},{t:'至少会坚持一段时间',v:-1},{t:'没想过',v:0},{t:'做完这次就算',v:1},{t:'本来就是一次性的',v:2}]},
{dim:'span',left:'长期经营',right:'一次性抛掷',q:'你的收藏夹里，更多是？',opts:[
{t:'几个长期在跟的主题',v:-2},{t:'少数几条长期主线',v:-1},{t:'混合',v:0},{t:'大量分散的念头',v:1},{t:'随取随弃，从不回看',v:2}]},
{dim:'target',left:'特定的人',right:'未知/无对象',q:'你表达时，心里有没有一个「你」？',opts:[
{t:'有，非常具体，几乎每篇都写给 TA',v:-2},{t:'有一个模糊的小圈子',v:-1},{t:'时有时无',v:0},{t:'没有，就是想说',v:1},{t:'拒绝有任何对象，对象会绑架表达',v:2}]},
{dim:'target',left:'特定的人',right:'未知/无对象',q:'想到「谁会看到我写的」，你？',opts:[
{t:'就是在写给那几个人看',v:-2},{t:'写给认可我的那群人',v:-1},{t:'很少想',v:0},{t:'谁看都行',v:1},{t:'最好没人对号入座',v:2}]},
{dim:'target',left:'特定的人',right:'未知/无对象',q:'你做事时，会预设一个接收者吗？',opts:[
{t:'会，很具体',v:-2},{t:'会，是大概的人群',v:-1},{t:'偶尔',v:0},{t:'不会',v:1},{t:'预设接收者本身就是限制',v:2}]},
{dim:'dir',left:'向内修炼·冲刷自己',right:'向外验证·滚一圈拿反馈',q:'一段深入交流结束后，你更常回味的是？',opts:[
{t:'自己内部被搅动的东西',v:-2},{t:'对自己新的认识',v:-1},{t:'双方都留意',v:0},{t:'对方给的反馈信号',v:1},{t:'外部如何反应，这才算结果',v:2}]},
{dim:'dir',left:'向内修炼·冲刷自己',right:'向外验证·滚一圈拿反馈',q:'你更认同哪种说法？',opts:[
{t:'外部反馈是辅助，内部校准才是主',v:-2},{t:'内外结合，以内为主',v:-1},{t:'说不清',v:0},{t:'内外结合，以外为主',v:1},{t:'没有外部反馈，就不知道好坏',v:2}]},
{dim:'dir',left:'向内修炼·冲刷自己',right:'向外验证·滚一圈拿反馈',q:'你做事的主方向是？',opts:[
{t:'把自己修通',v:-2},{t:'修自己为主，顺带被看见',v:-1},{t:'平衡',v:0},{t:'做出来给世界，让世界验证',v:1},{t:'要的就是外界的反应和回声',v:2}]},
{dim:'stance',left:'玩家·下场解题',right:'观察者·在场记录',q:'一场讨论正热，你会？',opts:[
{t:'直接下场，带着立场去辩',v:-2},{t:'参与，但抽离一半',v:-1},{t:'看话题',v:0},{t:'安静听完，只在心里表态',v:1},{t:'只想记录，不想参与',v:2}]},
{dim:'stance',left:'玩家·下场解题',right:'观察者·在场记录',q:'对身边正在发生的事，你更像？',opts:[
{t:'局中人，被推着也往前',v:-2},{t:'半参与半旁观',v:-1},{t:'看事',v:0},{t:'旁观者，看得清楚',v:1},{t:'专职记录者，参与会弄脏观察',v:2}]},
{dim:'stance',left:'玩家·下场解题',right:'观察者·在场记录',q:'面对一个难题，你的第一反应是？',opts:[
{t:'上手解决，先干起来',v:-2},{t:'边做边看',v:-1},{t:'先看看',v:0},{t:'先理解清楚再说',v:1},{t:'理解它就够了，不一定要解决',v:2}]},
{dim:'util',left:'有用·资源交换',right:'无用·纯粹联结',q:'一段关系让你犹豫要不要继续时，你的判断锚点是？',opts:[
{t:'彼此有没有价值交换',v:-2},{t:'有没有共同话题和用处',v:-1},{t:'说不清',v:0},{t:'聊得来就行',v:1},{t:'纯粹联结，谈有用就俗了',v:2}]},
{dim:'util',left:'有用·资源交换',right:'无用·纯粹联结',q:'朋友送你一份礼物，你更在意？',opts:[
{t:'是否实用、用得上',v:-2},{t:'是否合心意',v:-1},{t:'都行',v:0},{t:'心意本身',v:1},{t:'任何「实用」的考量都会让我不安',v:2}]},
{dim:'util',left:'有用·资源交换',right:'无用·纯粹联结',q:'你会刻意经营「有用」的关系吗？',opts:[
{t:'会，关系就是资源',v:-2},{t:'会考虑，但不刻意',v:-1},{t:'看情况',v:0},{t:'基本不会',v:1},{t:'刻意经营会毁掉关系的意义',v:2}]},
{dim:'expr',left:'内化·脑中闭环',right:'外化·写出来做出来',q:'一个想法想清楚了，你通常？',opts:[
{t:'想清楚就够了，不一定要做出来',v:-2},{t:'会整理，但不产出',v:-1},{t:'看情况',v:0},{t:'要做出来才算数',v:1},{t:'不做出来就等于没想',v:2}]},
{dim:'expr',left:'内化·脑中闭环',right:'外化·写出来做出来',q:'你的收获更多沉淀在哪？',opts:[
{t:'脑子里',v:-2},{t:'私人笔记里',v:-1},{t:'混合',v:0},{t:'公开作品里',v:1},{t:'行动和作品里，不落地不算数',v:2}]},
{dim:'expr',left:'内化·脑中闭环',right:'外化·写出来做出来',q:'当你有个洞见，它的「完成」标志是？',opts:[
{t:'想通了',v:-2},{t:'记录下来了',v:-1},{t:'看情况',v:0},{t:'分享出去了',v:1},{t:'做成了东西',v:2}]},
{dim:'venue',left:'私·闭门纯粹',right:'公·被世界看见',q:'你更愿意在哪种地方说真话？',opts:[
{t:'一对一或小房间',v:-2},{t:'熟人小圈子',v:-1},{t:'都可以',v:0},{t:'公开场合反而更敢说',v:1},{t:'越公开越安全，人人可见才没负担',v:2}]},
{dim:'venue',left:'私·闭门纯粹',right:'公·被世界看见',q:'被很多人看见你的生活，你？',opts:[
{t:'会浑身不自在',v:-2},{t:'不太愿意',v:-1},{t:'无所谓',v:0},{t:'有点享受',v:1},{t:'这是我存在的证据之一',v:2}]},
{dim:'venue',left:'私·闭门纯粹',right:'公·被世界看见',q:'你的创作更多流向？',opts:[
{t:'只给身边几个人',v:-2},{t:'小范围传播',v:-1},{t:'看内容',v:0},{t:'公开平台',v:1},{t:'就是冲着公开发布去的',v:2}]},
{dim:'dens',left:'深而少·泡一个月',right:'广而杂·日读一本',q:'你的阅读更像？',opts:[
{t:'一本书读一个月，反复咀嚼',v:-2},{t:'慢慢读，但也会翻很多',v:-1},{t:'混合',v:0},{t:'一天好几篇，浅尝辄止',v:1},{t:'广泛扫荡，快而杂是常态',v:2}]},
{dim:'dens',left:'深而少·泡一个月',right:'广而杂·日读一本',q:'面对一个感兴趣的人，你？',opts:[
{t:'把他的作品全读透为止',v:-2},{t:'会认真读主要的',v:-1},{t:'看兴趣程度',v:0},{t:'了解个大概',v:1},{t:'快速划过，保持新鲜感',v:2}]},
{dim:'dens',left:'深而少·泡一个月',right:'广而杂·日读一本',q:'你更怕哪种状态？',opts:[
{t:'浮在表面，什么都没吃透',v:-2},{t:'浅尝太多',v:-1},{t:'说不好',v:0},{t:'陷得太深出不来',v:1},{t:'被一件事绑住，错过整个世界',v:2}]},
{dim:'chance',left:'计划·筛选布局',right:'机缘·接受变异',q:'你更放心哪种开始？',opts:[
{t:'计划好、筛选过的开始',v:-2},{t:'大致规划，留余地',v:-1},{t:'看情况',v:0},{t:'随机开始，走着看',v:1},{t:'意外的开始最好',v:2}]},
{dim:'chance',left:'计划·筛选布局',right:'机缘·接受变异',q:'计划被打乱，你？',opts:[
{t:'尽快拉回正轨',v:-2},{t:'会调整，接受新安排',v:-1},{t:'无所谓',v:0},{t:'有点高兴',v:1},{t:'这才是真正的开始',v:2}]},
{dim:'chance',left:'计划·筛选布局',right:'机缘·接受变异',q:'面对不确定的未来，你更多？',opts:[
{t:'布局，把变量列全',v:-2},{t:'做预案但不过度',v:-1},{t:'顺其自然',v:0},{t:'相信到时候会有答案',v:1},{t:'期待它带来的意外',v:2}]}
];
let qzAns=Array(QUIZ_ITEMS.length).fill(null);
let qzIdx=0;
function qzStart(){
qzAns=Array(QUIZ_ITEMS.length).fill(null);qzIdx=0;
switchView('quiz');renderQuiz();
}
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
for(const k in coords)coords[k]=Math.round(coords[k]/6*10);
state.coords=coords;state.mode='free';state.refId=null;personActive=null;
document.querySelectorAll('#modeSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='free'));
switchView('edit');
renderAll();
document.getElementById('btnReport').click();
toast('问卷完成，已生成你的星图');
}
const qzOpenEl=document.getElementById('quizOpen');
if(qzOpenEl)qzOpenEl.addEventListener('click',qzStart);
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
