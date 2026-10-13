(()=>{'use strict';
const d=window.SUISHI_CONTENT,issues=window.SUISHI_ISSUES;
if(!d||!issues)return;
const $=s=>document.querySelector(s),issue2=d.entry.id==='cuicui-002';
const number=issue2?'贰':'壹',vol=issue2?'02':'01';
const nav=$('#issueSelector');
if(nav){const label=document.createElement('div');label.className='issue-selector-heading';label.innerHTML='<span>岁岁卷帙 · ISSUES</span><b>已收录两篇 / Select a story</b>';nav.append(label);
  for(const [i,v] of issues.entries()){const a=document.createElement('a');a.className='issue-item'+(d===v?' selected':'');a.href='?issue='+(i+1)+'#essay';a.setAttribute('aria-current',d===v?'page':'false');
  const no=document.createElement('span');no.textContent='卷 '+(i===0?'〇一':'〇二');
  const t=document.createElement('strong');t.textContent=v.entry.title;
  const sub=document.createElement('small');sub.textContent=v.entry.originalTitle||v.entry.subtitle;
  const arrow=document.createElement('span');arrow.textContent=d===v?'正在阅读':'阅读 ↗';
  a.append(no,t,sub,arrow);nav.append(a)}}
const text=(selector,value)=>{const el=$(selector);if(el)el.textContent=value};
const html=(selector,value)=>{const el=$(selector);if(el)el.innerHTML=value};
document.body.classList.toggle('issue-two',issue2);
document.title=(issue2?'翠翠记｜第二篇':'江皋携女记｜第一篇')+' · 岁岁文章';
text('.hero-meta span:first-child',String(issues.length).padStart(2,'0'));
if(issue2){
 text('.hero-buttons .primary-button','翻开第二篇 ↗');
 text('.hero-art .art-inscription b',d.entry.title);
 text('.hero-art .art-inscription span','翠羽斑斓 · 童心如阳');
 text('.hero-quote','以家常事，写岁月诗。让一声鸟鸣，也有文言可记。');
 text('.side-kicker','第〇二卷 / JOURNAL 002');
 text('.reading-sidebar .side-link', '壹 · '+d.entry.title);
 text('.vertical-chinese','岁岁文章 · 卷之二');
 text('.section-number','VOL. 02 — '+d.entry.theme.join(' / '));
 text('.reading-title',d.entry.title);
 const sub=$('.reading-sub');if(sub){sub.textContent=d.entry.subtitle;const span=document.createElement('span');span.textContent=d.entry.lead;sub.append(span)}
 text('.paper-vertical','岁岁 · 卷二');
 text('.essay-sign','岁岁文章 · 第二篇 · 文言改写');
 text('.note-card p',d.entry.note);
 const article=$('#essayPaper');if(article)article.setAttribute('aria-label',d.entry.title+'文言改写正文');
 const source=$('#sourceEssay');if(source){source.hidden=false;text('#sourceEssayTitle','查看原作《'+d.entry.originalTitle+'》（校订展示稿）');text('#sourceEssayNote',d.entry.sourceNotice);
 const body=$('#sourceEssayBody');if(body){body.innerHTML='';d.entry.sourceParagraphs.forEach(p=>{const x=document.createElement('p');x.textContent=p;body.append(x)})}}
 text('#study .section-heading>p','读准字音，理解虚词，在翠翠的故事里体会文言怎样记下日常。');
 text('#allusions .section-heading h2','诗句有源，情意可参。');
 text('#allusions .section-heading>p','本篇不强行嵌入典故，以《诗经》鸟鸣诗句作延伸对读。');
 const classic=d.classic;
 text('.classics-intro>p',classic.intro);
 text('#toggleClassic','展开'+classic.title+' ↓');
 text('.classics-intro blockquote','“'+classic.quote+'”');
 text('.classics-source',classic.author+' · '+classic.source);
 text('.classic-cover>span','先秦 · '+classic.author);
 html('.classic-cover .cover-center strong','伐<br>木');
 text('.classic-cover em','鸟鸣嘤嘤 · 求其友声');
 text('.classic-heading h3',classic.title+' · 原文节选');
 text('.classic-heading span','原文选自《诗经·小雅》；与本篇仅作比较阅读');
 text('.classic-comparison p',classic.compare);
 const box=$('.wiki-links');if(box){box.innerHTML='';const mark=document.createElement('span');mark.className='wiki-heading';mark.textContent='维基延伸阅读 · WIKI REFERENCE';box.append(mark);
   for(const l of classic.wiki){const a=document.createElement('a');a.href=l.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=l.label+' ↗';box.append(a)}
   const small=document.createElement('small');small.textContent='延伸阅读用于比较原文及解释，不表示原作文直接引用了古诗。';box.append(small)}
 text('#practice .practice-quote>span',d.practice.heading);
 text('#practice .practice-quote>p',d.entry.memorize);
 const tasks=document.querySelectorAll('.practice-task');d.practice.questions.forEach((q,i)=>{const task=tasks[i];if(task){const h=task.querySelector('h3'),p=task.querySelector('p');if(h)h.textContent=q.title;if(p)p.textContent=q.note}});
 text('#galleryHeading','翠羽留影，为小太阳存照。');
 text('#gallery .section-heading>p','本期影像相册 · 《翠翠记》——照片独立归档，不与第一篇混放。');
 text('.album-label','卷之二 · 影像簿');
 text('.album-intro h3','翠翠的日子，值得留一帧。');
 const topic=$('#topicInput');if(topic)topic.value=d.entry.formTitle;
}
const tabs=document.querySelectorAll('.tab');for(const tab of tabs){const n=tab.querySelector('span');if(n){const prop=tab.dataset.tab==='glossary'?'glossary':tab.dataset.tab==='grammar'?'grammar':'patterns';n.textContent=String(d[prop].length).padStart(2,'0')}}
})();