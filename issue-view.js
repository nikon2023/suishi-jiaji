(()=>{'use strict';
const d=window.SUISHI_CONTENT, issues=window.SUISHI_ISSUES;
if(!d||!issues)return;
const $=s=>document.querySelector(s);
const index=issues.findIndex(v=>v.entry.id===d.entry.id);
const selected=Math.max(index,0);
const nums=['一','二','三','四','五','六','七','八','九'];
const chinese=['〇一','〇二','〇三','〇四','〇五'];
const volumeNo=String(selected+1).padStart(2,'0');
const volumeChinese=chinese[selected]||String(selected+1);
const formalNo=['壹','贰','叁','肆','伍'][selected]||String(selected+1);
const write=(selector,value)=>{const x=$(selector);if(x)x.textContent=value};
const markup=(selector,value)=>{const x=$(selector);if(x)x.innerHTML=value};
const nav=$('#issueSelector');
if(nav){
  const head=document.createElement('div');
  head.className='issue-selector-heading';
  head.innerHTML='<span>岁岁卷帙 · ISSUES</span><b>已收录'+(['零','一','两','三','四','五'][issues.length]||issues.length)+'篇 / Select a story</b>';
  nav.append(head);
  for(const [i,v] of issues.entries()){
    const a=document.createElement('a');
    a.className='issue-item'+(v.entry.id===d.entry.id?' selected':'');
    a.href='?issue='+(i+1)+'#essay';
    a.setAttribute('aria-current',v.entry.id===d.entry.id?'page':'false');
    const num=document.createElement('span');num.textContent='卷 '+(chinese[i]||i+1);
    const title=document.createElement('strong');title.textContent=v.entry.title;
    const subtitle=document.createElement('small');subtitle.textContent=v.entry.originalTitle||v.entry.subtitle;
    const arrow=document.createElement('span');arrow.textContent=v.entry.id===d.entry.id?'正在阅读':'阅读 ↗';
    a.append(num,title,subtitle,arrow);
    nav.append(a);
  }
}
document.body.classList.toggle('issue-two',selected===1);
document.body.classList.toggle('issue-three',selected===2);
document.title=d.entry.title+'｜第'+nums[selected]+'篇 · 岁岁文章';
write('.hero-meta span:first-child',String(issues.length).padStart(2,'0'));
if(selected>0){
  const e=d.entry,c=d.classic;
  write('.hero-buttons .primary-button','翻开第'+nums[selected]+'篇 ↗');
  write('.hero-art .art-inscription b',e.title);
  write('.hero-art .art-inscription span',e.subtitle);
  write('.hero-quote',e.subtitle+' '+(e.lead||''));
  write('.hero-art .art-corner-1',selected===2?'一笔一改 · 一语一暖':'翠羽斑斓 · 童心如阳');
  write('.side-kicker','第'+volumeChinese+'卷 / JOURNAL '+volumeNo);
  write('.reading-sidebar .side-link','壹 · '+e.title);
  write('.vertical-chinese','岁岁文章 · 卷之'+nums[selected]);
  write('.section-number','VOL. '+volumeNo+' — '+e.theme.join(' / '));
  write('.reading-title',e.title);
  const intro=$('.reading-sub');
  if(intro){intro.textContent=e.subtitle;const more=document.createElement('span');more.textContent=e.lead||'';intro.append(more)}
  write('.paper-vertical','岁岁 · 卷'+nums[selected]);
  write('.essay-sign','岁岁文章 · 第'+nums[selected]+'篇 · 文言改写');
  write('.note-card p',e.note);
  const body=$('#essayPaper');
  if(body)body.setAttribute('aria-label',e.title+'文言改写正文');
  const original=$('#sourceEssay');
  if(original){
    original.hidden=false;
    write('#sourceEssayTitle','查看原作《'+e.originalTitle+'》（'+(selected===2?'原稿存档':'校订展示稿')+'）');
    write('#sourceEssayNote',e.sourceNotice);
    const source=$('#sourceEssayBody');if(source){source.innerHTML='';for(const p of e.sourceParagraphs){const paragraph=document.createElement('p');paragraph.textContent=p;source.append(paragraph)}}
  }
  write('#study .section-heading>p',selected===2?'识得字音，辨析虚词，读懂一位老师的严与暖。':'读准字音，理解虚词，在翠翠的故事里体会文言怎样记下日常。');
  write('#allusions .section-heading h2',selected===2?'师道有源，春风有意。':'诗句有源，情意可参。');
  write('#allusions .section-heading>p',selected===2?'追溯“循循善诱”的经典出处，并区分原句与后世意象。':'本篇不强行嵌入典故，以《诗经》鸟鸣诗句作延伸对读。');
  write('.classics-intro>p',c.intro);
  write('#toggleClassic','展开'+c.title+' ↓');
  write('.classics-intro blockquote','“'+c.quote+'”');
  write('.classics-source',c.author+' · '+c.source);
  write('.classic-cover>span',(c.coverPeriod||'先秦')+' · '+c.author);
  markup('.classic-cover .cover-center strong',c.coverTitle||'伐<br>木');
  write('.classic-cover em',selected===2?'循循善诱 · 教学相长':'鸟鸣嘤嘤 · 求其友声');
  write('.classic-heading h3',c.title+' · 原文节选');
  write('.classic-heading span',selected===2?'《论语·子罕》《论语·述而》节选；由生活细节进入教学之道':'原文选自《诗经·小雅》；与本篇仅作比较阅读');
  write('.classic-comparison p',c.compare);
  const links=$('.wiki-links');
  if(links){
    links.innerHTML='';
    const mark=document.createElement('span');mark.className='wiki-heading';mark.textContent='维基延伸阅读 · WIKI REFERENCE';links.append(mark);
    for(const l of c.wiki){const a=document.createElement('a');a.href=l.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=l.label+' ↗';links.append(a)}
    const note=document.createElement('small');
    note.textContent='请结合原文语境比较；勿将延伸引用误认为儿童原作文的逐字引文。';links.append(note);
  }
  write('#practice .practice-quote>span',d.practice.heading);
  write('#practice .practice-quote>p',e.memorize);
  const tasks=[...document.querySelectorAll('.practice-task')];
  d.practice.questions.forEach((q,i)=>{const task=tasks[i];if(!task)return;const h=task.querySelector('h3'),p=task.querySelector('p');if(h)h.textContent=q.title;if(p)p.textContent=q.note});
  write('#galleryHeading',selected===2?'墨痕留影，记下老师的温暖。':'翠羽留影，为小太阳存照。');
  write('#gallery .section-heading>p','本期影像相册 · 《'+e.title+'》——与其他篇章独立归档。');
  write('.album-label','卷之'+nums[selected]+' · 影像簿');
  write('.album-intro h3',selected===2?'那些鼓励的话，值得留一帧。':'翠翠的日子，值得留一帧。');
  const topic=$('#topicInput');if(topic)topic.value=e.formTitle;
}
for(const tab of document.querySelectorAll('.tab')){const n=tab.querySelector('span');if(!n)continue;const key=tab.dataset.tab==='glossary'?'glossary':tab.dataset.tab==='grammar'?'grammar':'patterns';n.textContent=String(d[key].length).padStart(2,'0')}
})();