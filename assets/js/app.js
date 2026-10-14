
/* ================= 数据 ================= */
const svg=(a,b,c)=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="680"><defs><linearGradient id="g"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><pattern id="p" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><rect width="160" height="160" fill="url(#g)"/><text x="-7" y="110" fill="${c}" font-size="86" font-family="Arial" font-weight="900">07S</text></pattern></defs><rect width="900" height="680" fill="url(#p)"/><circle cx="675" cy="310" r="190" fill="none" stroke="${c}" stroke-width="32" opacity=".4"/></svg>`);

const siteRoot=new URL('../../',document.currentScript.src);
const siteUrl=path=>new URL(path,siteRoot).href;
const projectUrl=id=>siteUrl('works/'+encodeURIComponent(id)+'/');
const cats=window.SITE_DATA.categories;
const projects=window.SITE_DATA.projects.map(p=>({...p,image:siteUrl(p.image),gallery:p.gallery.map(siteUrl)}));
/* ================= 工具 ================= */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const hl=(text,q)=>{const t=esc(text);if(!q)return t;const re=new RegExp('('+esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');return t.replace(re,'<mark>$1</mark>')};
const pad=n=>String(n).padStart(2,'0');
const pub=()=>projects.filter(p=>p.status==='publish');
let toastTimer;
function toast(msg,undo){
  const t=$('#toast');clearTimeout(toastTimer);
  t.innerHTML=esc(msg)+(undo?'<button>Undo</button>':'');
  if(undo)t.querySelector('button').onclick=()=>{undo();t.classList.remove('on')};
  t.classList.add('on');toastTimer=setTimeout(()=>t.classList.remove('on'),undo?5000:2600);
}
const head=(a,b,c)=>`<div class="eyebrow"><span>07S / ${a}</span><span>${esc(window.SITE_DATA.site.period)}</span></div><h1 class="pageTitle">${b}</h1><p class="lead">${c}</p>`;

/* ================= 卡片 ================= */
function workCard(p,i=0,q=''){
  return `<a href="${projectUrl(p.id)}" class="work" style="--i:${i}" data-project="${esc(p.id)}" tabindex="0">
    <div class="cover"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">${p.featured?'<span class="badge">★ FEATURED</span>':''}<span class="view">VIEW PROJECT ↗</span></div>
    <span class="idx">${pad(i+1)}</span>
    <div class="workName"><span>${hl(p.title,q)}</span><span class="arr">↗</span></div>
    <div class="workMeta"><span class="ct">${hl(p.cat,q)}</span><span class="loc">${hl(p.location||'',q)}</span><span class="yr">${esc(p.year)}</span></div>
  </a>`;
}
function bindCards(root=app){
  // Cards are native links: keyboard, middle-click and opening a new tab work normally.
}

/* ================= 首页 ================= */
function home(){
  const selected=window.SITE_DATA.home.selectedWorks;
  const featured=selected.projectIds.map(id=>pub().find(p=>p.id===id)).filter(Boolean);
  const words=['ART DIRECTION','✦','VISUAL DESIGN','✦','MOVING IMAGE','✦','INTERACTIVE EXPERIENCE','✦','SPATIAL','✦'];
  app.innerHTML=`<section class="panel">
    <div class="eyebrow"><span>07S / INDEPENDENT CREATIVE STUDIO</span><span>ART · DESIGN · IMAGE · DIGITAL</span></div>
    <h1 class="heroTitle"><span class="ln"><span>SEVEN IS</span></span><span class="ln"><span>MORE THAN</span></span><span class="ln"><span>A NUMBER.</span></span></h1>
    <p class="lead">Art, Design, Moving Image & Digital Experiences.</p>
    <div class="heroArt" id="heroArt"><i></i><span class="hint">MOVE · CLICK</span></div>
    <div class="foot"><span>INFINITE IDEAS. NEW PERSPECTIVES.</span><a href="${siteUrl('works/')}" class="ulink">EXPLORE WORKS ↗</a></div>
    <div class="marquee"><div>${[...words,...words].map(w=>`<span>${w}</span>`).join('')}</div></div>
    <div class="sectiontop reveal"><div><div class="small muted">${esc(selected.eyebrow)}</div><h2>${esc(selected.title)}</h2></div><a href="${siteUrl('works/')}" class="small ulink">${esc(selected.linkLabel)} (${pub().length}) ↗</a></div>
    <div class="workGrid">${featured.map((p,i)=>workCard(p,i)).join('')||'<p class="muted">No selected works yet.</p>'}</div>
    <div class="line"></div>
    <div class="reveal"><div class="small muted">02 / ABOUT & EXPERTISE</div><p class="editorial">We create visual experiences where art, design and technology meet.</p></div>
    <div class="pillrow reveal">${cats.map(c=>`<a class="pill" href="${siteUrl('works/')}" data-gocat="${esc(c)}">${esc(c)} <span class="n">${pub().filter(p=>p.cat===c).length}</span></a>`).join('')}</div>
    <div class="line"></div>
    <div class="reveal"><div class="small muted">03 / COLLABORATE</div><h2 class="pageTitle">HAVE AN IDEA?</h2><a href="${siteUrl('contact/')}" class="action primary">LET’S TALK <span class="arr">↗</span></a></div>
  </section>`;
  bindCards();
  $$('[data-gocat]').forEach(a=>a.onclick=()=>{ws.filter=a.dataset.gocat;saveWs()});
  cleanups.push(mountHero($('#heroArt')));
}

// 3D 模块异步加载，加载好后挂载；WebGL 不可用时保留原来的条纹图
function mountHero(el){
  let dead=false,stop=null;
  const go=()=>{if(!dead&&el.isConnected&&window.HERO3D)stop=window.HERO3D(el)};
  window.HERO3D?go():addEventListener('hero3d-ready',go,{once:true});
  return()=>{dead=true;stop&&stop()};
}

/* ================= Works: categories, year, sorting and search ================= */
const SORTS={
  manual:['Recommended',(a,b)=>a.order-b.order],
  new:['Year · Newest first',(a,b)=>b.year-a.year||a.order-b.order],
  old:['Year · Oldest first',(a,b)=>a.year-b.year||a.order-b.order],
  az:['Title · A–Z',(a,b)=>a.title.localeCompare(b.title)],
  za:['Title · Z–A',(a,b)=>b.title.localeCompare(a.title)],
  recent:['Recently added',(a,b)=>b.created-a.created]
};
let ws={filter:'All',year:'All',sort:'manual',view:'grid',search:'',...(()=>{try{return JSON.parse(sessionStorage.getItem('07sWorks-en'))||{}}catch(e){return{}}})()};
const saveWs=()=>{try{sessionStorage.setItem('07sWorks-en',JSON.stringify(ws))}catch(e){}};

function queryWorks(){
  const q=ws.search.trim().toLowerCase();
  return pub().filter(p=>(ws.filter==='All'||p.cat===ws.filter)&&(ws.year==='All'||String(p.year)===ws.year)&&(!q||`${p.title} ${p.cat} ${p.desc} ${p.technology} ${p.location}`.toLowerCase().includes(q)))
    .sort((SORTS[ws.sort]||SORTS.manual)[1]);
}
function works(){
  if(ws.filter!=='All'&&!cats.includes(ws.filter))ws.filter='All';
  const years=[...new Set(pub().map(p=>String(p.year)))].sort((a,b)=>b-a);
  if(!years.includes(ws.year))ws.year='All';
  app.innerHTML=`<section class="panel">${head('SELECTED WORKS','WORKS','Exploring the boundaries of art, technology and storytelling.')}
    <div class="pillrow" id="catPills"></div>
    <div class="tools">
      <div class="searchBox" id="sbox"><input class="field" id="find" placeholder="Search titles, technologies, locations…" value="${esc(ws.search)}" autocomplete="off"><kbd>/</kbd><button class="clear" id="clr" title="Clear">×</button></div>
      <select class="select" id="yearSel" title="Year"><option value="All">All years</option>${years.map(y=>`<option ${ws.year===y?'selected':''}>${y}</option>`).join('')}</select>
      <select class="select" id="sortSel" title="Sort">${Object.entries(SORTS).map(([k,[n]])=>`<option value="${k}" ${ws.sort===k?'selected':''}>${n}</option>`).join('')}</select>
      <div class="seg" role="group" aria-label="View"><button data-view="grid" title="Two columns">▦</button><button class="c3" data-view="cols3" title="Three columns">▩</button><button data-view="list" title="List">☰</button></div>
    </div>
    <div class="activeFilters" id="chips"></div>
    <div class="workGrid" id="grid"></div>
    <div class="foot"><span id="count"></span><span>07S STUDIO</span></div>
  </section>`;
  const find=$('#find');
  let t;find.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{ws.search=find.value;renderWorks()},120);$('#sbox').classList.toggle('has',!!find.value)};
  find.onkeydown=e=>{if(e.key==='Escape'){find.value='';find.oninput();find.blur()}};
  $('#clr').onclick=()=>{find.value='';find.oninput();find.focus()};
  $('#sbox').classList.toggle('has',!!ws.search);
  $('#yearSel').onchange=e=>{ws.year=e.target.value;renderWorks()};
  $('#sortSel').onchange=e=>{ws.sort=e.target.value;renderWorks()};
  $$('[data-view]').forEach(b=>b.onclick=()=>{ws.view=b.dataset.view;renderWorks()});
  renderWorks();
}
function renderWorks(){
  saveWs();
  const q=ws.search.trim();
  const base=pub().filter(p=>!q||`${p.title} ${p.cat} ${p.desc} ${p.technology} ${p.location}`.toLowerCase().includes(q.toLowerCase()));
  $('#catPills').innerHTML=['All',...cats].map(c=>`<button class="pill ${ws.filter===c?'active':''}" data-cat="${esc(c)}">${esc(c)} <span class="n">${c==='All'?base.length:base.filter(p=>p.cat===c).length}</span></button>`).join('');
  $$('[data-cat]').forEach(b=>b.onclick=()=>{ws.filter=b.dataset.cat;renderWorks()});
  $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===ws.view));
  const list=queryWorks(),grid=$('#grid');
  grid.className='workGrid '+(ws.view==='grid'?'':ws.view);
  grid.innerHTML=list.length?list.map((p,i)=>workCard(p,i,q)).join(''):`<div class="empty" style="grid-column:1/-1"><b>NO RESULTS</b>No matching projects.<br><br><button class="pill" id="resetF">Reset filters</button></div>`;
  const chips=[];
  if(ws.filter!=='All')chips.push(['filter',ws.filter]);
  if(ws.year!=='All')chips.push(['year',ws.year]);
  if(q)chips.push(['search','“'+q+'”']);
  $('#chips').innerHTML=chips.length?'Filters: '+chips.map(([k,v])=>`<button class="chip" data-chip="${k}">${esc(v)} <b>×</b></button>`).join('')+(chips.length>1?`<button class="chip" data-chip="all">Clear all</button>`:''):'';
  $$('[data-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.chip;if(k==='filter'||k==='all')ws.filter='All';if(k==='year'||k==='all'){ws.year='All';$('#yearSel').value='All'}if(k==='search'||k==='all'){ws.search='';$('#find').value='';$('#sbox').classList.remove('has')}renderWorks()});
  const r=$('#resetF');if(r)r.onclick=()=>{ws={...ws,filter:'All',year:'All',search:''};works()};
  $('#count').textContent=`SHOWING ${list.length} / ${pub().length} PROJECTS · ${SORTS[ws.sort][0]}`;
  bindCards(grid);observe(grid);
}

/* ================= 详情 + 灯箱 ================= */
function detail(id){
  const p=pub().find(x=>x.id===id);if(!p){location.href=siteUrl('works/');return}
  const arr=pub().sort(SORTS.manual[1]),i=arr.findIndex(x=>x.id===id),next=arr[(i+1)%arr.length],prev=arr[(i-1+arr.length)%arr.length];
  const imgs=[p.image,...(p.gallery||[])];
  const related=arr.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,2);
  app.innerHTML=`<section class="panel">
    <div class="eyebrow"><span><a class="ulink" href="${siteUrl('works/')}">← WORKS</a> / ${esc(p.cat)}</span><span>${pad(i+1)} / ${pad(arr.length)}</span></div>
    <h1 class="pageTitle">${esc(p.title)}</h1><p class="lead">${esc(p.cat)} / ${esc(p.technology||'Creative Studio')}</p>
    <div class="feature" style="margin:35px 0" data-lb="0"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>
    <div class="cols"><div class="reveal"><div class="small muted">PROJECT OVERVIEW</div><p class="editorial" style="font-size:24px">${esc(p.desc)}</p>
      <div class="actions"><button class="pill" id="share">Copy link ⧉</button>${p.video?`<a class="pill" href="${esc(safeUrl(p.video))}" target="_blank" rel="noopener noreferrer">WATCH VIDEO ↗</a>`:''}</div></div>
      <div class="reveal"><div class="small muted">PROJECT DETAILS</div>${[['YEAR',p.year],['CATEGORY',p.cat],['LOCATION',p.location||'—'],['TECHNOLOGY',p.technology||'—']].map(([a,b])=>`<div class="projectMeta"><span class="muted">${a}</span><span>${esc(b)}</span></div>`).join('')}</div></div>
    <div class="projectContent">${p.content||''}</div>
    ${embedUrl(p.video)?`<div class="line"></div><div class="small muted">FILM</div><div class="video"><iframe src="${esc(embedUrl(p.video))}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="${esc(p.title)} video"></iframe></div>`:''}
    <div class="line"></div><div class="small muted">PROJECT GALLERY · ${imgs.length}</div>
    <div class="gallery" style="margin-top:17px">${imgs.map((im,k)=>`<div data-lb="${k}"><img src="${esc(im)}" alt="Gallery image ${k+1}" loading="lazy"></div>`).join('')}</div>
    ${related.length?`<div class="line"></div><div class="sectiontop"><div><div class="small muted">MORE IN ${esc(p.cat)}</div><h2>RELATED</h2></div></div><div class="workGrid">${related.map((r,k)=>workCard(r,k)).join('')}</div>`:''}
    <div class="line"></div>
    <div class="foot"><a href="${projectUrl(prev.id)}" class="ulink">← ${esc(prev.title)}</a><span class="muted">← → Use arrow keys to navigate</span><a href="${projectUrl(next.id)}" class="ulink">${esc(next.title)} →</a></div>
  </section>`;
  bindCards();
  $$('[data-lb]').forEach(el=>el.onclick=()=>lightbox(imgs,+el.dataset.lb));
  $('#share').onclick=()=>copyText(location.href,'Link copied');
  pageKeys=e=>{if(document.querySelector('.lightbox,.modal')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')location.href=projectUrl(next.id);if(e.key==='ArrowLeft')location.href=projectUrl(prev.id)};
}
function lightbox(imgs,i){
  const lb=document.createElement('div');lb.className='lightbox';
  const draw=()=>{lb.innerHTML=`<img src="${esc(imgs[i])}" alt=""><button class="close">ESC ×</button>${imgs.length>1?`<button class="lbBtn prev">←</button><button class="lbBtn next">→</button>`:''}<span class="count">${i+1} / ${imgs.length}</span>`};
  const go=d=>{i=(i+d+imgs.length)%imgs.length;draw()};
  const close=()=>{lb.remove();document.removeEventListener('keydown',key);lenis?.start()};
  const key=e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)};
  lb.onclick=e=>{if(e.target.closest('.next'))go(1);else if(e.target.closest('.prev'))go(-1);else if(e.target.tagName!=='IMG')close()};
  let sx;lb.ontouchstart=e=>sx=e.touches[0].clientX;lb.ontouchend=e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)go(dx<0?1:-1)};
  draw();document.body.append(lb);document.addEventListener('keydown',key);lenis?.stop();
}

/* ================= Studio / Contact ================= */
function studio(){
  const n=pub().length,yrs=new Set(pub().map(p=>p.year)).size;
  app.innerHTML=`<section class="panel">${head('ABOUT US','STUDIO','Independent Creative Studio.')}<div class="line"></div>
    <h2 class="heroTitle" style="font-size:clamp(42px,7vw,86px)"><span class="ln"><span>SEVEN IS</span></span><span class="ln"><span>MORE THAN</span></span><span class="ln"><span>A NUMBER.</span></span></h2>
    <p class="editorial reveal">07S is a multidisciplinary creative studio exploring the intersection of art, design, moving images and emerging technologies.</p>
    <div class="stats reveal"><div class="stat"><b data-count="${n}">0</b><span>PROJECTS</span></div><div class="stat"><b data-count="${cats.length}">0</b><span>DISCIPLINES</span></div><div class="stat"><b data-count="${yrs}">0</b><span>YEARS ACTIVE</span></div><div class="stat"><b data-count="7">0</b><span>LUCKY NUMBER</span></div></div>
    <div class="heroArt" id="heroArt" style="height:290px"><i></i></div>
    <div class="small muted">WHAT WE DO</div>${['CREATIVE & VISUAL DESIGN','ART & INSTALLATION','FILM & MOTION','DIGITAL & INTERACTIVE'].map((s,i)=>`<div class="service reveal"><span>${pad(i+1)} &nbsp; ${s}</span><span class="arr">↗</span></div>`).join('')}
    <div class="line"></div><a class="action primary" href="${siteUrl('contact/')}">START A CONVERSATION <span class="arr">↗</span></a></section>`;
}
async function copyText(value,message){
  try{await navigator.clipboard.writeText(value);toast(message)}catch{toast('Copy unavailable. Please copy from the page or address bar.')}
}
function contact(){
  const s=window.SITE_DATA.site;
  app.innerHTML=`<section class="panel">${head('GET IN TOUCH','CONTACT',"Have a project in mind? Let's make it happen.")}<div class="line"></div><div class="cols"><div><h2 class="pageTitle">LET'S<br>TALK.</h2><div class="small muted">GENERAL INQUIRIES</div><p><a class="action primary" href="mailto:${esc(s.email)}">${esc(s.email)} ↗</a></p><button class="pill" id="copyMail">Copy email ⧉</button></div><div><div class="small muted">SOCIAL</div><p>${s.socials.filter(x=>safeUrl(x.url)).map(x=>`<a class="ulink" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener noreferrer">${esc(x.name)} ↗</a>`).join('<br>')||'Social links coming soon.'}</p><p class="lead">${esc(s.contactNote)}</p></div></div></section>`;
  $('#copyMail').onclick=()=>copyText(s.email,'Email copied');
}

// YouTube / Vimeo 链接转为可嵌入播放器地址
function embedUrl(v){const u=safeUrl(v||'');if(!u)return '';let m=u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);if(m)return 'https://www.youtube-nocookie.com/embed/'+m[1];m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/);if(m)return 'https://player.vimeo.com/video/'+m[1];return ''}
function safeUrl(s){try{let u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}

/* ================= 全局交互 ================= */
let pageKeys=null,cleanups=[];
// 外链图片失效时显示占位图
document.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&t.src&&!t.dataset.fb&&!t.closest('#peek')){t.dataset.fb=1;t.src=svg('#111','#2a2a2a','#555')}},true);
// 平滑惯性滚动（Lenis）
let lenis=null;
if(window.Lenis){lenis=new Lenis({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now())}
const toTopNow=()=>lenis?lenis.scrollTo(0,{immediate:true,force:true}):scrollTo(0,0);
// 加载画面：000→100，然后整块上滑（每个会话一次）
(function loader(){
  const L=$('#loader');let seen=false;try{seen=sessionStorage.getItem('07sLoaded')}catch(e){}
  if(seen){L.remove();return}
  const t0=performance.now();
  const end=()=>{if(!L.isConnected)return;L.classList.add('done');setTimeout(()=>L.remove(),1000);try{sessionStorage.setItem('07sLoaded',1)}catch(e){}};
  L.onclick=end;
  const step=()=>{const k=Math.min(1,(performance.now()-t0)/1500),v=Math.round((1-Math.pow(1-k,3))*100);$('#ldNum').textContent=String(v).padStart(3,'0');$('#ldBar').style.width=v+'%';k<1?setTimeout(step,30):setTimeout(end,200)};
  step();
})();
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){const f=$('#find');if(f){e.preventDefault();f.focus()}}
  pageKeys&&pageKeys(e);
});
// 滚动：顶栏、进度条、回顶
let lastY=0;
const onScroll=()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight,top=$('#top');top.classList.toggle('scrolled',y>20);top.classList.toggle('hide',y>lastY&&y>300);lastY=y;$('#progress').style.width=(h>0?y/h*100:0)+'%';$('#toTop').classList.toggle('on',y>600)};
addEventListener('scroll',onScroll,{passive:true});
$('#toTop').onclick=()=>lenis?lenis.scrollTo(0):scrollTo({top:0,behavior:'smooth'});
// 进入视口动画 + 数字滚动
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');$$('[data-count]',e.target).forEach(countUp);io.unobserve(e.target)}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
// 标题拆成逐词上浮（只处理纯文本/带 <br> 的标题）
function splitWords(el){
  if(el.classList.contains('sw')||[...el.children].some(c=>c.tagName!=='BR'))return;
  let d=0;el.innerHTML=el.innerHTML.split(/<br\s*\/?>/).map(line=>line.trim().split(/\s+/).map(w=>`<span class="w"><span style="--d:${d++}">${w}</span></span>`).join(' ')).join('<br>');
  el.classList.add('sw');
}
const observe=(root=app)=>{
  $$('.pageTitle,.sectiontop h2,.editorial',root).forEach(splitWords);
  $$('.reveal,.sw,.work',root).forEach(el=>io.observe(el));
};
function countUp(el){const to=+el.dataset.count,t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
// List模式预览图
const peek=$('#peek');let mx=0,my=0,cx=0,cy=0;
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
  const w=e.target.closest('.workGrid.list .work');
  if(w){const img=w.querySelector('.cover img');if(peek.firstChild.src!==img.src)peek.firstChild.src=img.src;peek.classList.add('on')}else peek.classList.remove('on');
},{passive:true});
(function loop(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;peek.style.left=(cx+150)+'px';peek.style.top=cy+'px';requestAnimationFrame(loop)})();
// 时钟
const tick=()=>$('#clock').textContent='SEOUL '+new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'});tick();setInterval(tick,30000);

/* Physical static pages: every work has its own shareable URL. */
const name=document.body.dataset.page||'home';
$$('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===(name==='project'?'works':name)));
({home,works,studio,contact,project:()=>detail(document.body.dataset.project)})[name]?.();
observe();onScroll();
