// HTML is a fixed shell. Read the original Markdown on each page visit.
(async()=>{
  const loaderUrl=new URL(document.currentScript.src);
  const root=new URL('../../',loaderUrl);
  const assetVersion=loaderUrl.searchParams.get('v')||window.SITE_ASSET_VERSION||'';
  const md=window.markdownit({html:true,linkify:true});
  // Background character field starts right away, independent of the Markdown content.
  const bg=document.createElement('script');const bgUrl=new URL('assets/js/bgfield.js',root);
  if(assetVersion)bgUrl.searchParams.set('v',assetVersion);bg.src=bgUrl.href;document.body.append(bg);
  async function read(file){
    const response=await fetch(new URL(file,root),{cache:'no-store'});
    if(!response.ok)throw Error(`${file}: HTTP ${response.status}`);
    return response.text();
  }
  function parse(source,section,file){
    const tokens=md.parse(source,{}).filter(t=>t.type==='fence'&&t.info.trim()==='json '+section);
    if(tokens.length!==1)throw Error(`${file}: expected one json ${section} block`);
    try{return JSON.parse(tokens[0].content);}catch{throw Error(`${file}: invalid JSON in ${section}`);}
  }
  const page=document.body.dataset.page;
  const folder=decodeURIComponent(location.pathname.replace(/\/index\.html$/,'/').replace(/\/$/,'').split('/').pop());
  if(page==='project')document.body.dataset.project=folder;
  if(page==='series')document.body.dataset.series=folder;
  const scopes=['shared','home','works','studio','contact','project'];
  const [settings,catalog,...pages]=await Promise.all(['settings.md','works/index.md',...scopes.map(s=>`pages/${s}.md`)].map(read));
  const site=parse(settings,'site','settings.md'),home=parse(settings,'home','settings.md');
  // Language: English unless the visitor picked 中 / 한 in the switch; zh / ko blocks override English per field.
  const LANGS=['en','zh','ko'];
  let lang='en';try{lang=localStorage.getItem('07s-lang')||'en'}catch(e){}
  if(!LANGS.includes(lang))lang='en';
  document.documentElement.lang=lang==='zh'?'zh-CN':lang;
  const translated=(source,file)=>{
    const tokens=md.parse(source,{}).filter(t=>t.type==='fence'&&t.info.trim()==='json text-'+lang);
    if(lang==='en'||!tokens.length)return {};
    try{return JSON.parse(tokens[0].content);}catch{throw Error(`${file}: invalid JSON in text-${lang}`);}
  };
  const text=Object.fromEntries(scopes.map((s,i)=>[s,{...parse(pages[i],'text',`pages/${s}.md`),...translated(pages[i],`pages/${s}.md`)}]));
  const worksConfig=parse(catalog,'works','works/index.md');
  const ids=worksConfig.projectIds;
  const seriesIds=worksConfig.seriesIds||[];
  if(!Array.isArray(seriesIds)||new Set(seriesIds).size!==seriesIds.length||seriesIds.some(id=>!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)))throw Error('works/index.md: invalid seriesIds');
  if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)))throw Error('works/index.md: invalid projectIds');
  const selected=new Set(home.selectedWorks.projectIds);
  const projects=(await Promise.all(ids.map(async id=>{
    const base=`works/${id}/`;
    const info=parse(await read(base+'settings.md'),'project',base+'settings.md');
    if(info.status!=='publish')throw Error(`${base}settings.md: listed work must have status publish`);
    const content=page==='project'&&document.body.dataset.project===id?md.render((await read(base+'content.md')).replace(/<!--[\s\S]*?-->/g,'')):'';
    return {...info,id,cat:info.category,desc:info.description,image:base+info.cover,gallery:info.gallery.map(p=>base+p),content,series:info.series||[],created:Date.parse(info.added),featured:selected.has(id)};
  }))).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
  const categories=new Map(site.categories.map(c=>[c.name,c.enabled]));
  const used=new Set(projects.map(p=>p.cat));
  for(const name of used)if(!categories.has(name))categories.set(name,true);
  // Every series uses the same json series block; media paths are relative to its folder.
  const series=await Promise.all(seriesIds.map(async id=>{
    const base=`works/${id}/`;
    const info=parse(await read(base+'index.md'),'series',base+'index.md');
    return {...info,id,subtitle:info.subtitle||'',dates:info.dates||'',venue:info.venue||'',cover:info.cover?base+info.cover:'',chapters:info.chapters||[],
      planned:(info.planned||[]).map(p=>({...p,cover:base+p.cover}))};
  }));
  const seriesTypes=new Map((site.seriesTypes||[]).map(t=>[t.name,t.enabled]));
  const usedTypes=new Set(series.map(s=>s.type));
  for(const name of usedTypes)if(!seriesTypes.has(name))seriesTypes.set(name,true);
  const currentSeries=series.find(s=>s.id===document.body.dataset.series);
  if(page==='series'&&!currentSeries)throw Error('works/index.md: add this series folder to seriesIds');
  window.SITE_DATA={site,home,text,lang,projects,series,
    seriesTypes:[...seriesTypes].filter(([name,on])=>on&&(!site.hideEmptyCategories||usedTypes.has(name))).map(([name])=>name),
    categories:[...categories].filter(([name,on])=>on&&(!site.hideEmptyCategories||used.has(name))).map(([name])=>name)};
  // A copied work shell derives its identity from its folder, with no HTML edits.
  const current=projects.find(p=>p.id===document.body.dataset.project);
  if(page==='project'&&!current)throw Error('This project is not published.');
  document.title=page==='home'?site.title:page==='project'?current.title+text.project.titleSuffix:page==='series'?currentSeries.title+text.project.titleSuffix:text[page].browserTitle;
  document.querySelector('meta[name="description"]').content=page==='project'?current.desc:page==='series'?currentSeries.description:page==='contact'?text.contact.metaDescription:site.description;
  const set=(selector,value)=>{document.querySelector(selector).textContent=value;};
  set('.logo .seven',text.shared.brand);set('.logo sup',text.shared.brandSuffix);
  // Studio 7 split-circle mark (7slogo concept C); colours come from site.css.
  window.SITE_LOGO_MARK='<svg class="logoMark" viewBox="104 104 816 816" aria-hidden="true" focusable="false"><path class="seg" d="M161.001,304C234.469,180.024,367.89,104,512,104s277.531,76.024,350.999,200H161.001z"/><path class="seg" d="M111.92,432H585L301.519,861.517C154.021,772.693,78.16,600.836,111.92,432z"/><path class="seg" d="M744,432h168.08c26.899,134.521-15.606,273.554-113.127,370.038s-237.001,137.5-371.226,109.164L744,432z"/><path class="mark7" d="M161.001,304h701.997c23.463,39.593,40.057,82.87,49.081,128H744L427.727,911.202c-44.547-9.404-87.205-26.198-126.208-49.685L585,432H111.92C120.944,386.87,137.539,343.593,161.001,304z"/></svg>';
  document.querySelector('.logo').insertAdjacentHTML('afterbegin',window.SITE_LOGO_MARK);
  for(const name of ['home','works','studio','contact'])set(`[data-nav="${name}"]`,text.shared['nav'+name[0].toUpperCase()+name.slice(1)]);
  const footer=document.querySelector('footer');
  footer.firstElementChild.prepend(document.createTextNode(text.shared.footerCopyright+' '));
  footer.lastElementChild.textContent=text.shared.footerSlogan;
  set('#weatherCredit',text.shared.weatherCredit);set('#weather',text.shared.weatherPlaceholder);
  document.querySelector('#weather').title=text.shared.weatherUseLocation;
  document.querySelector('#toTop').title=text.shared.backTop;
  const script=(file,type)=>new Promise((resolve,reject)=>{
    const node=document.createElement('script');const url=new URL('assets/js/'+file,root);
    if(assetVersion)url.searchParams.set('v',assetVersion);
    node.src=url.href;if(type)node.type=type;
    node.onload=resolve;node.onerror=()=>reject(Error('Could not load '+file));document.body.append(node);
  });
  await script('app.js');
  dispatchEvent(new Event('07s:content-ready'));
  await script('weather.js');
  if(page==='home')await script('hero.js','module');
})().catch(error=>{
  console.error(error);
  document.querySelector('#loader')?.remove();
  const app=document.querySelector('#app');app.textContent='';
  const message=document.createElement('p');message.setAttribute('role','alert');
  message.textContent='Unable to load page content. '+error.message;app.append(message);
});
