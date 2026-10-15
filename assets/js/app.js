
/* ================= 数据 ================= */
const svg=(a,b,c)=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="680"><defs><linearGradient id="g"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><pattern id="p" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><rect width="160" height="160" fill="url(#g)"/><text x="-7" y="110" fill="${c}" font-size="86" font-family="Arial" font-weight="900">${esc(copy.shared.brand)}</text></pattern></defs><rect width="900" height="680" fill="url(#p)"/><circle cx="675" cy="310" r="190" fill="none" stroke="${c}" stroke-width="32" opacity=".4"/></svg>`);

const siteRoot=new URL('../../',document.currentScript.src);
const siteUrl=path=>new URL(path,siteRoot).href;
const projectUrl=id=>siteUrl('works/'+encodeURIComponent(id)+'/');
const copy=window.SITE_DATA.text;
const raw=(scope,key,values={})=>String(copy[scope][key]).replace(/\{(\w+)\}/g,(match,name)=>Object.prototype.hasOwnProperty.call(values,name)?values[name]:match);
const txt=(scope,key,values)=>esc(raw(scope,key,values));
const titleLines=(scope,key)=>copy[scope][key].map(line=>`<span class="ln"><span>${esc(line)}</span></span>`).join('');
const cats=window.SITE_DATA.categories;
const projects=window.SITE_DATA.projects.map(p=>({...p,image:siteUrl(p.image),gallery:p.gallery.map(siteUrl)}));
const seriesTypes=window.SITE_DATA.seriesTypes||[];
const seriesList=(window.SITE_DATA.series||[]).map(s=>({...s,cover:s.cover?siteUrl(s.cover):'',planned:s.planned.map(p=>({...p,cover:siteUrl(p.cover)}))}));
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
  t.innerHTML=esc(msg)+(undo?`<button>${txt('shared','undo')}</button>`:'');
  if(undo)t.querySelector('button').onclick=()=>{undo();t.classList.remove('on')};
  t.classList.add('on');toastTimer=setTimeout(()=>t.classList.remove('on'),undo?5000:2600);
}
const head=(a,b,c)=>`<div class="eyebrow"><span>${txt('shared','prefix')}${a}</span><span>${esc(window.SITE_DATA.site.period)}</span></div><h1 class="pageTitle">${b}</h1><p class="lead">${c}</p>`;

/* ================= 卡片 ================= */
function workCard(p,i=0,q=''){
  return `<a href="${projectUrl(p.id)}" class="work" style="--i:${i}" data-project="${esc(p.id)}" tabindex="0">
    <div class="cover"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">${p.featured?`<span class="badge">${txt('shared','featured')}</span>`:''}<span class="view">${txt('shared','viewProject')}</span></div>
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
  const words=copy.home.marquee;
  app.innerHTML=`<section class="panel">
    <div class="eyebrow"><span>${txt('shared','prefix')}${txt('home','eyebrow')}</span><span>${txt('home','disciplines')}</span></div>
    <h1 class="heroTitle">${titleLines('home','heroLines')}</h1>
    <p class="lead">${txt('home','intro')}</p>
    <div class="heroArt" data-brand="${txt('shared','brand')}" id="heroArt"><i></i><span class="hint">${txt('home','artHint')}</span></div>
    <div class="foot"><span>${txt('home','artFoot')}</span><a href="${siteUrl('works/')}" class="ulink">${txt('home','explore')}</a></div>
    <div class="marquee"><div>${[...words,...words].map(w=>`<span>${esc(w)}</span>`).join('')}</div></div>
    <div class="sectiontop reveal"><div><div class="small muted">${esc(selected.eyebrow)}</div><h2>${esc(selected.title)}</h2></div><a href="${siteUrl('works/')}" class="small ulink">${esc(selected.linkLabel)} (${pub().length}) ↗</a></div>
    <div class="workGrid">${featured.map((p,i)=>workCard(p,i)).join('')||`<p class="muted">${txt('shared','emptySelected')}</p>`}</div>
    <div class="line"></div>
    <div class="reveal"><div class="small muted">${txt('home','aboutLabel')}</div><p class="editorial">${txt('home','aboutText')}</p></div>
    <div class="pillrow reveal">${cats.map(c=>`<a class="pill" href="${siteUrl('works/')}" data-gocat="${esc(c)}">${esc(c)} <span class="n">${pub().filter(p=>p.cat===c).length}</span></a>`).join('')}</div>
    <div class="line"></div>
    <div class="reveal"><div class="small muted">${txt('home','collaborateLabel')}</div><h2 class="pageTitle">${txt('home','collaborateTitle')}</h2><a href="${siteUrl('contact/')}" class="action primary">${txt('home','collaborateLink')} <span class="arr">↗</span></a></div>
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
  manual:[raw('works','sortManual'),(a,b)=>a.order-b.order],
  new:[raw('works','sortNew'),(a,b)=>b.year-a.year||a.order-b.order],
  old:[raw('works','sortOld'),(a,b)=>a.year-b.year||a.order-b.order],
  az:[raw('works','sortAZ'),(a,b)=>a.title.localeCompare(b.title)],
  za:[raw('works','sortZA'),(a,b)=>b.title.localeCompare(a.title)],
  recent:[raw('works','sortRecent'),(a,b)=>b.created-a.created]
};
let ws={filter:'All',year:'All',sort:'manual',view:'grid',search:'',seriesType:'All',...(()=>{try{return JSON.parse(sessionStorage.getItem('07sWorks-en'))||{}}catch(e){return{}}})()};
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
  app.innerHTML=`<section class="panel">${head(txt('works','eyebrow'),txt('works','title'),txt('works','intro'))}
    <div class="pillrow" id="catPills"></div>
    <div class="tools">
      <div class="searchBox" id="sbox"><input class="field" id="find" placeholder="${txt('works','search')}" value="${esc(ws.search)}" autocomplete="off"><kbd>/</kbd><button class="clear" id="clr" title="${txt('works','clear')}">×</button></div>
      <select class="select" id="yearSel" title="${txt('works','year')}"><option value="All">${txt('works','allYears')}</option>${years.map(y=>`<option ${ws.year===y?'selected':''}>${y}</option>`).join('')}</select>
      <select class="select" id="sortSel" title="${txt('works','sort')}">${Object.entries(SORTS).map(([k,[n]])=>`<option value="${k}" ${ws.sort===k?'selected':''}>${esc(n)}</option>`).join('')}</select>
      <div class="seg" role="group" aria-label="${txt('works','view')}"><button data-view="grid" title="${txt('works','twoColumns')}">▦</button><button class="c3" data-view="cols3" title="${txt('works','threeColumns')}">▩</button><button data-view="list" title="${txt('works','list')}">☰</button></div>
    </div>
    <div class="activeFilters" id="chips"></div>
    <div class="workGrid" id="grid"></div>
    <div class="foot"><span id="count"></span><span>${txt('works','signature')}</span></div>
    ${seriesList.length?`<div class="line"></div>
    <div class="sectiontop reveal"><div><div class="small muted">${txt('works','seriesEyebrow')}</div><h2>${txt('works','seriesTitle')}</h2></div></div>
    <div class="pillrow" id="seriesPills"></div>
    <div class="workGrid" id="seriesGrid"></div>`:''}
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
  if(seriesList.length)renderSeriesSection();
}
// Series / exhibitions share the WORKS card markup, so motion and hover stay identical.
function seriesCard(s,i){
  const n=seriesItems(s).length;
  return `<a href="${projectUrl(s.id)}" class="work seriesCard" style="--i:${i}" data-series-card="${esc(s.id)}">
    <div class="cover"><img src="${esc(s.cover||svg('#111','#2a2a2a','#555'))}" alt="${esc(s.title)}" loading="lazy"><span class="view">${txt('works','viewSeries')}</span></div>
    <span class="idx">${pad(i+1)}</span>
    <div class="workName"><span>${esc(s.title)}</span><span class="arr">↗</span></div>
    <div class="workMeta"><span class="ct">${esc(s.type)}</span><span class="loc">${esc([s.dates,s.venue].filter(Boolean).join(' · '))}</span><span class="yr">${txt('works','seriesWorks',{count:n})}</span></div>
  </a>`;
}
function renderSeriesSection(){
  if(ws.seriesType!=='All'&&!seriesTypes.includes(ws.seriesType))ws.seriesType='All';
  $('#seriesPills').innerHTML=['All',...seriesTypes].map(t=>`<button class="pill ${ws.seriesType===t?'active':''}" data-series-type="${esc(t)}">${t==='All'?txt('works','seriesAll'):esc(t)} <span class="n">${t==='All'?seriesList.length:seriesList.filter(s=>s.type===t).length}</span></button>`).join('');
  $$('[data-series-type]').forEach(b=>b.onclick=()=>{ws.seriesType=b.dataset.seriesType;saveWs();renderSeriesSection()});
  const grid=$('#seriesGrid');
  grid.innerHTML=seriesList.filter(s=>ws.seriesType==='All'||s.type===ws.seriesType).map(seriesCard).join('');
  observe(grid);
}
function renderWorks(){
  saveWs();
  const q=ws.search.trim();
  const base=pub().filter(p=>!q||`${p.title} ${p.cat} ${p.desc} ${p.technology} ${p.location}`.toLowerCase().includes(q.toLowerCase()));
  $('#catPills').innerHTML=['All',...cats].map(c=>`<button class="pill ${ws.filter===c?'active':''}" data-cat="${esc(c)}">${c==='All'?txt('works','all'):esc(c)} <span class="n">${c==='All'?base.length:base.filter(p=>p.cat===c).length}</span></button>`).join('');
  $$('[data-cat]').forEach(b=>b.onclick=()=>{ws.filter=b.dataset.cat;renderWorks()});
  $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===ws.view));
  const list=queryWorks(),grid=$('#grid');
  grid.className='workGrid '+(ws.view==='grid'?'':ws.view);
  grid.innerHTML=list.length?list.map((p,i)=>workCard(p,i,q)).join(''):`<div class="empty" style="grid-column:1/-1"><b>${txt('works','noResults')}</b>${txt('works','noMatches')}<br><br><button class="pill" id="resetF">${txt('works','reset')}</button></div>`;
  const chips=[];
  if(ws.filter!=='All')chips.push(['filter',ws.filter]);
  if(ws.year!=='All')chips.push(['year',ws.year]);
  if(q)chips.push(['search','“'+q+'”']);
  $('#chips').innerHTML=chips.length?txt('works','filters')+chips.map(([k,v])=>`<button class="chip" data-chip="${k}">${esc(v)} <b>×</b></button>`).join('')+(chips.length>1?`<button class="chip" data-chip="all">${txt('works','clearAll')}</button>`:''):'';
  $$('[data-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.chip;if(k==='filter'||k==='all')ws.filter='All';if(k==='year'||k==='all'){ws.year='All';$('#yearSel').value='All'}if(k==='search'||k==='all'){ws.search='';$('#find').value='';$('#sbox').classList.remove('has')}renderWorks()});
  const r=$('#resetF');if(r)r.onclick=()=>{ws={...ws,filter:'All',year:'All',search:''};works()};
  $('#count').textContent=raw('works','count',{shown:list.length,total:pub().length,sort:SORTS[ws.sort][0]});
  bindCards(grid);observe(grid);
}


/* ================= Series / exhibition page ================= */
// Published works that list this series, plus planned placeholders not yet replaced by a real work.
function seriesItems(s){
  const published=pub().filter(p=>p.series.includes(s.id)).sort(SORTS.manual[1]);
  return [...published,...s.planned.filter(p=>!published.some(real=>real.title===p.title&&real.chapter===p.chapter)).map(p=>({...p,planned:true}))];
}
function plannedCard(p,i,q,total,chapters){
  const isVideo=p.type==='video';
  const pending=raw('works',isVideo?'videoPending':'imagePending');
  const chapter=chapters.find(c=>c.id===p.chapter)?.name||'';
  return `<article class="work plannedWork" style="--i:${i}" aria-label="${esc(p.title)} — ${esc(pending)}">
    <div class="cover">
      <img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy">
      ${isVideo?'<span class="plannedVideo" aria-hidden="true">▶</span>':''}
      <span class="plannedIndex">${pad(i+1)} / ${pad(total)}</span>
      <span class="plannedPending">${esc(pending)}</span>
      <span class="view">${txt('works','previewPending')}</span>
    </div>
    <span class="idx">${pad(i+1)}</span>
    <div class="workName"><span>${hl(p.title,q)}</span><span class="arr" aria-hidden="true">↗</span></div>
    <div class="workMeta"><span class="ct">${esc(chapter)}</span><span class="loc">${txt('works','planned')}</span><span class="yr">${isVideo?'VIDEO':'IMAGE'}</span></div>
  </article>`;
}
function seriesPage(id){
  const k=seriesList.findIndex(x=>x.id===id),s=seriesList[k];
  const prev=seriesList[(k-1+seriesList.length)%seriesList.length],next=seriesList[(k+1)%seriesList.length];
  const items=seriesItems(s),chapters=s.chapters;
  const meta=[s.type,s.dates,s.venue,raw('works','seriesWorks',{count:items.length})].filter(Boolean);
  let filter='all',search='',sort='manual',view='grid';
  app.innerHTML=`<section class="panel seriesPanel">
    <div class="eyebrow"><span><a class="ulink" href="${siteUrl('works/')}">${txt('project','backWorks')}</a> / ${txt('works','seriesLabel')}</span><span>${pad(k+1)} / ${pad(seriesList.length)}</span></div>
    <h1 class="pageTitle">${esc(s.title)}</h1>
    ${s.subtitle?`<p class="lead">${esc(s.subtitle)}</p>`:''}
    <div class="seriesMeta">${meta.map(m=>`<span>${esc(m)}</span>`).join('')}</div>
    ${s.cover?`<div class="feature" style="margin:35px 0" data-lb="0"><img src="${esc(s.cover)}" alt="${esc(s.title)}"></div>`:''}
    ${s.description?`<div class="cols reveal"><div class="small muted">${txt('works','aboutSeries')}</div><p class="editorial seriesAbout">${esc(s.description)}</p></div>`:''}
    <div class="line"></div>
    <div class="sectiontop"><div><div class="small muted">${txt('works','inThisSeries')}</div><h2>${txt('works','seriesWorksTitle')}</h2></div></div>
    ${chapters.length?'<div class="pillrow" id="seriesTabs"></div>':''}
    <div class="tools seriesTools">
      <div class="searchBox" id="seriesSearchBox"><input class="field" id="seriesSearch" type="search" placeholder="${txt('works','seriesSearch')}" autocomplete="off"><kbd>/</kbd></div>
      <select class="select" id="seriesSort" title="${txt('works','sort')}"><option value="manual">${txt('works','sortManual')}</option><option value="az">${txt('works','sortAZ')}</option><option value="za">${txt('works','sortZA')}</option></select>
      <div class="seg" role="group" aria-label="${txt('works','view')}"><button data-series-view="grid" class="active" title="${txt('works','twoColumns')}">▦</button><button data-series-view="list" title="${txt('works','list')}">☰</button></div>
    </div>
    <div class="workGrid" id="seriesGrid"></div>
    <div class="foot"><span id="seriesCount"></span><span>${txt('works','signature')}</span></div>
    ${seriesList.length>1?`<div class="line"></div>
    <div class="foot"><a href="${projectUrl(prev.id)}" class="ulink">← ${esc(prev.title)}</a><a href="${siteUrl('works/')}" class="ulink muted">${txt('works','allWorks')}</a><a href="${projectUrl(next.id)}" class="ulink">${esc(next.title)} →</a></div>`:''}
  </section>`;
  const tabs=$('#seriesTabs'),grid=$('#seriesGrid');
  function render(){
    const filtered=items.filter(p=>(filter==='all'||p.chapter===filter)&&(!search||[p.title,p.cat,p.type,p.chapter].join(' ').toLowerCase().includes(search)));
    if(sort==='az')filtered.sort((a,b)=>a.title.localeCompare(b.title));
    if(sort==='za')filtered.sort((a,b)=>b.title.localeCompare(a.title));
    if(tabs){
      tabs.innerHTML=[{id:'all',name:raw('works','seriesAll')},...chapters].map(t=>`<button type="button" class="pill ${filter===t.id?'active':''}" data-series-tab="${esc(t.id)}" aria-pressed="${filter===t.id}">${esc(t.name)} <span class="n">${t.id==='all'?items.length:items.filter(p=>p.chapter===t.id).length}</span></button>`).join('');
      $$('[data-series-tab]',tabs).forEach(btn=>btn.onclick=()=>{filter=btn.dataset.seriesTab;render()});
    }
    $$('[data-series-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.seriesView===view));
    grid.className='workGrid '+(view==='list'?'list':'');
    grid.innerHTML=filtered.map((p,i)=>p.planned?plannedCard(p,i,search,filtered.length,chapters):workCard(p,i,search)).join('')||`<div class="empty" style="grid-column:1/-1">${txt('works','seriesEmpty')}</div>`;
    $('#seriesCount').textContent=raw('works','seriesSummary',{shown:filtered.length,published:filtered.filter(p=>!p.planned).length,planned:filtered.filter(p=>p.planned).length});
    observe(grid);
  }
  $('#seriesSearch').oninput=e=>{search=e.target.value.trim().toLowerCase();render()};
  $('#seriesSort').onchange=e=>{sort=e.target.value;render()};
  $$('[data-series-view]').forEach(btn=>btn.onclick=()=>{view=btn.dataset.seriesView;render()});
  $$('[data-lb]').forEach(el=>el.onclick=()=>lightbox([s.cover],0));
  render();
}

/* ================= 详情 + 灯箱 ================= */
function detail(id){
  const p=pub().find(x=>x.id===id);if(!p){location.href=siteUrl('works/');return}
  const arr=pub().sort(SORTS.manual[1]),i=arr.findIndex(x=>x.id===id),next=arr[(i+1)%arr.length],prev=arr[(i-1+arr.length)%arr.length];
  const imgs=[p.image,...(p.gallery||[])];
  const related=arr.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,2);
  app.innerHTML=`<section class="panel">
    <div class="eyebrow"><span><a class="ulink" href="${siteUrl('works/')}">${txt('project','backWorks')}</a> / ${esc(p.cat)}</span><span>${pad(i+1)} / ${pad(arr.length)}</span></div>
    <h1 class="pageTitle">${esc(p.title)}</h1><p class="lead">${esc(p.cat)} / ${esc(p.technology||raw('project','technologyFallback'))}</p>
    <div class="feature" style="margin:35px 0" data-lb="0"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>
    <div class="cols"><div class="reveal"><div class="small muted">${txt('project','overview')}</div><p class="editorial" style="font-size:24px">${esc(p.desc)}</p>
      <div class="actions"><button class="pill" id="share">${txt('project','copyLink')}</button>${p.video?`<a class="pill" href="${esc(safeUrl(p.video))}" target="_blank" rel="noopener noreferrer">${txt('project','watchVideo')}</a>`:''}</div></div>
      <div class="reveal"><div class="small muted">${txt('project','details')}</div>${[[raw('project','year'),p.year],[raw('project','category'),p.cat],[raw('project','location'),p.location||'—'],[raw('project','technology'),p.technology||'—']].map(([a,b])=>`<div class="projectMeta"><span class="muted">${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}${p.series.length?`<div class="projectMeta"><span class="muted">${txt('project','series')}</span><span>${seriesList.filter(x=>p.series.includes(x.id)).map(x=>`<a class="ulink" href="${projectUrl(x.id)}">${esc(x.title)} ↗</a>`).join(', ')}</span></div>`:''}</div></div>
    <div class="projectContent">${p.content||''}</div>
    ${embedUrl(p.video)?`<div class="line"></div><div class="small muted">${txt('project','film')}</div><div class="video"><iframe src="${esc(embedUrl(p.video))}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="${txt('project','videoTitle',{title:p.title})}"></iframe></div>`:''}
    <div class="line"></div><div class="small muted">${txt('project','gallery',{count:imgs.length})}</div>
    <div class="gallery" style="margin-top:17px">${imgs.map((im,k)=>`<div data-lb="${k}"><img src="${esc(im)}" alt="${txt('project','galleryAlt',{number:k+1})}" loading="lazy"></div>`).join('')}</div>
    ${related.length?`<div class="line"></div><div class="sectiontop"><div><div class="small muted">${txt('project','moreIn',{category:p.cat})}</div><h2>${txt('project','related')}</h2></div></div><div class="workGrid">${related.map((r,k)=>workCard(r,k)).join('')}</div>`:''}
    <div class="line"></div>
    <div class="foot"><a href="${projectUrl(prev.id)}" class="ulink">← ${esc(prev.title)}</a><span class="muted">${txt('project','keyboardHint')}</span><a href="${projectUrl(next.id)}" class="ulink">${esc(next.title)} →</a></div>
  </section>`;
  bindCards();
  $$('[data-lb]').forEach(el=>el.onclick=()=>lightbox(imgs,+el.dataset.lb));
  $('#share').onclick=()=>copyText(location.href,raw('project','linkCopied'));
  pageKeys=e=>{if(document.querySelector('.lightbox,.modal')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')location.href=projectUrl(next.id);if(e.key==='ArrowLeft')location.href=projectUrl(prev.id)};
}
function lightbox(imgs,i){
  const lb=document.createElement('div');lb.className='lightbox';
  const draw=()=>{lb.innerHTML=`<img src="${esc(imgs[i])}" alt=""><button class="close">${txt('project','lightboxClose')}</button>${imgs.length>1?`<button class="lbBtn prev">←</button><button class="lbBtn next">→</button>`:''}<span class="count">${i+1} / ${imgs.length}</span>`};
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
  app.innerHTML=`<section class="panel">${head(txt('studio','eyebrow'),txt('studio','title'),txt('studio','intro'))}<div class="line"></div>
    <h2 class="heroTitle" style="font-size:clamp(42px,7vw,86px)">${titleLines('studio','heroLines')}</h2>
    <p class="editorial reveal">${txt('studio','body')}</p>
    <div class="stats reveal"><div class="stat"><b data-count="${n}">0</b><span>${txt('studio','projects')}</span></div><div class="stat"><b data-count="${cats.length}">0</b><span>${txt('studio','disciplines')}</span></div><div class="stat"><b data-count="${yrs}">0</b><span>${txt('studio','years')}</span></div><div class="stat"><b data-count="${Number(copy.studio.luckyNumber)}">0</b><span>${txt('studio','luckyLabel')}</span></div></div>
    <div class="heroArt" data-brand="${txt('shared','brand')}" id="heroArt" style="height:290px"><i></i></div>
    <div class="small muted">${txt('studio','servicesLabel')}</div>${copy.studio.services.map((s,i)=>`<div class="service reveal"><span>${pad(i+1)} &nbsp; ${esc(s)}</span><span class="arr">↗</span></div>`).join('')}
    <div class="line"></div><a class="action primary" href="${siteUrl('contact/')}">${txt('studio','contactLink')} <span class="arr">↗</span></a></section>`;
}
async function copyText(value,message){
  try{await navigator.clipboard.writeText(value);toast(message)}catch{toast(raw('shared','copyFailed'))}
}
function contact(){
  const s=window.SITE_DATA.site;
  app.innerHTML=`<section class="panel">${head(txt('contact','eyebrow'),txt('contact','title'),txt('contact','intro'))}<div class="line"></div><div class="cols"><div><h2 class="pageTitle">${copy.contact.headingLines.map(esc).join('<br>')}</h2><div class="small muted">${txt('contact','inquiries')}</div><p><a class="action primary" href="mailto:${esc(s.email)}">${esc(s.email)} ↗</a></p><button class="pill" id="copyMail">${txt('contact','copyEmail')}</button></div><div><div class="small muted">${txt('contact','social')}</div><p>${s.socials.filter(x=>safeUrl(x.url)).map(x=>`<a class="ulink" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener noreferrer">${esc(x.name)} ↗</a>`).join('<br>')||txt('contact','socialEmpty')}</p><p class="lead">${esc(s.contactNote)}</p></div></div></section>`;
  $('#copyMail').onclick=()=>copyText(s.email,raw('contact','emailCopied'));
}

// YouTube / Vimeo 链接转为可嵌入播放器地址
function embedUrl(v){const u=safeUrl(v||'');if(!u)return '';let m=u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);if(m)return 'https://www.youtube-nocookie.com/embed/'+m[1];m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/);if(m)return 'https://player.vimeo.com/video/'+m[1];return ''}
function safeUrl(s){try{let u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}

/* WORKS series navigation: sourced from works/index.md and each series index.md. */
const series=seriesList;
const nav=$('.nav');
const worksLink=$('[data-nav="works"]',nav);
const worksMenu=document.createElement('div');
worksMenu.className='worksNavGroup';
worksLink.parentNode.insertBefore(worksMenu,worksLink);
worksMenu.append(worksLink);
worksLink.setAttribute('aria-haspopup','true');
const seriesMenu=document.createElement('div');
seriesMenu.className='worksDropdown';
seriesMenu.innerHTML='<span class="dropdownEyebrow">'+esc(raw('shared','menuSeries'))+'</span>'+
  '<a class="dropdownAll" href="'+siteUrl('works/')+'">' + esc(raw('shared','menuWorksAll')) + ' <span>↗</span></a>'+
  series.map((item,i)=>'<a href="'+siteUrl('works/'+encodeURIComponent(item.id)+'/')+'"><span class="dropdownNumber">'+pad(i+1)+'</span><span>'+esc(item.title)+' <small>'+esc(item.subtitle||item.type||'')+'</small></span><span>↗</span></a>').join('');
worksMenu.append(seriesMenu);

const menuToggle=document.createElement('button');
menuToggle.type='button';
menuToggle.className='mobileMenuToggle';
menuToggle.setAttribute('aria-label',raw('shared','menuOpen'));
menuToggle.setAttribute('aria-expanded','false');
menuToggle.setAttribute('aria-controls','mobileNavPanel');
menuToggle.innerHTML='<span></span><span></span>';
const mobileNav=document.createElement('aside');
mobileNav.id='mobileNavPanel';
mobileNav.className='mobileNavPanel';
mobileNav.setAttribute('aria-label',raw('shared','menuIndex'))
mobileNav.setAttribute('aria-hidden','true');
mobileNav.inert=true;
const navLinks=$$('[data-nav]',nav);
const seriesNavItems=series.map((item,i)=>'<a class="mobileSeriesLink" href="'+siteUrl('works/'+encodeURIComponent(item.id)+'/')+'"><span class="mobileSeriesNumber">'+pad(i+1)+'</span><span>'+esc(item.title)+'<small>'+esc(item.subtitle||item.type||'')+'</small></span><span class="mobileSeriesArrow">↗</span></a>').join('');
mobileNav.innerHTML='<div class="mobileNavHeader"><div class="mobileNavBrand">'+esc(copy.shared.brand)+'<sup>'+esc(copy.shared.brandSuffix)+'</sup><span>'+esc(raw('shared','menuIndex'))+' / '+esc(copy.shared.brand)+'</span></div><button type="button" class="mobileNavClose" aria-label="'+esc(raw('shared','menuClose'))+'">×</button></div>'+
  '<div class="mobileNavBody">'+
  navLinks.map((a,i)=>'<div class="mobileNavItem"><a class="mobileNavPrimary" href="'+esc(a.href)+'"><span class="mobileNavIndex">'+pad(i+1)+'</span>'+esc(a.textContent)+'<span class="mobileNavArrow">↗</span></a>'+
    (a.dataset.nav==='works'&&series.length?'<div class="mobileNavSeries"><div class="mobileNavSeriesCaption">'+esc(raw('shared','menuSeries'))+' <span>'+pad(series.length)+'</span></div>'+seriesNavItems+'</div>':'')+
    '</div>').join('')+
  '</div><div class="mobileNavFooter">'+esc(raw('shared','footerSlogan'))+'</div>';
const mobileBackdrop=document.createElement('button');
mobileBackdrop.type='button';
mobileBackdrop.className='mobileNavBackdrop';
mobileBackdrop.setAttribute('aria-label',raw('shared','menuClose'))
const setMobileNav=open=>{
  document.body.classList.toggle('mobileNavOpen',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',raw('shared',open?'menuClose':'menuOpen'));
  mobileNav.setAttribute('aria-hidden',String(!open));
  mobileNav.inert=!open;
  if(open)mobileNav.querySelector('.mobileNavClose').focus({preventScroll:true});
  else if(mobileNav.contains(document.activeElement))menuToggle.focus({preventScroll:true});
};
menuToggle.onclick=()=>setMobileNav(!document.body.classList.contains('mobileNavOpen'));
// The active section and nested project series stay visible and distinct.
const activeRoute=document.body.dataset.page;
const activeNavSection=activeRoute==='series'||activeRoute==='project'?'works':activeRoute;
navLinks.forEach((link,i)=>{
  if(link.dataset.nav===activeNavSection){
    const item=mobileNav.querySelectorAll('.mobileNavItem')[i];
    if(item){item.classList.add('is-active');if(activeRoute!=='series')item.querySelector('.mobileNavPrimary').setAttribute('aria-current','page');}
  }
});
series.forEach((item,i)=>{
  if(location.pathname===new URL('works/'+item.id+'/',siteRoot).pathname){
    const target=mobileNav.querySelectorAll('.mobileSeriesLink')[i];
    if(target){target.classList.add('is-active');target.setAttribute('aria-current','page')}
  }
});
mobileNav.querySelector('.mobileNavClose').onclick=()=>setMobileNav(false);
mobileNav.querySelectorAll('a').forEach(a=>a.onclick=()=>setMobileNav(false));
mobileBackdrop.onclick=()=>setMobileNav(false);
document.querySelector('.top').append(menuToggle);
document.body.append(mobileBackdrop,mobileNav);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMobileNav(false)});

/* ================= 全局交互 ================= */
let pageKeys=null,cleanups=[];
// 外链图片失效时显示占位图
document.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&t.src&&!t.dataset.fb&&!t.closest('#peek')){t.dataset.fb=1;t.src=svg('#111','#2a2a2a','#555')}},true);
// 平滑惯性滚动（Lenis）
let lenis=null;
if(window.Lenis){lenis=new Lenis({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now())}
const toTopNow=()=>lenis?lenis.scrollTo(0,{immediate:true,force:true}):scrollTo(0,0);
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
  if(w){const source=w.querySelector('.cover img')?.src||w.dataset.preview;if(source){if(peek.firstChild.src!==source)peek.firstChild.src=source;peek.classList.add('on')}else peek.classList.remove('on')}else peek.classList.remove('on');
},{passive:true});
(function loop(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;peek.style.left=(cx+150)+'px';peek.style.top=cy+'px';requestAnimationFrame(loop)})();
// 时钟
let clockTimezone=raw('shared','clockTimezone');
const tick=()=>$('#clock').textContent=new Date().toLocaleTimeString('en-GB',{timeZone:clockTimezone,hour:'2-digit',minute:'2-digit'});
addEventListener('07s:timezone',event=>{
  try{new Intl.DateTimeFormat('en-GB',{timeZone:event.detail});clockTimezone=event.detail;tick();}catch{}
});
tick();setInterval(tick,30000);

/* Physical static pages: every work has its own shareable URL. */
const name=document.body.dataset.page||'home';
$$('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===(name==='project'||name==='series'?'works':name)));
({home,works,studio,contact,series:()=>seriesPage(document.body.dataset.series),project:()=>detail(document.body.dataset.project)})[name]?.();
observe();onScroll();
