// HTML is a fixed shell. Read the original Markdown on each page visit.
(async()=>{
  const loaderUrl=new URL(document.currentScript.src);
  const root=new URL('../../',loaderUrl);
  const assetVersion=loaderUrl.searchParams.get('v')||window.SITE_ASSET_VERSION||'';
  const md=window.markdownit({html:true,linkify:true});
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
  if(page==='project')document.body.dataset.project=decodeURIComponent(location.pathname.replace(/\/index\.html$/,'/').replace(/\/$/,'').split('/').pop());
  const scopes=['shared','home','works','studio','contact','project'];
  const [settings,catalog,...pages]=await Promise.all(['settings.md','works/index.md',...scopes.map(s=>`pages/${s}.md`)].map(read));
  const site=parse(settings,'site','settings.md'),home=parse(settings,'home','settings.md');
  const text=Object.fromEntries(scopes.map((s,i)=>[s,parse(pages[i],'text',`pages/${s}.md`)]));
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
    return {...info,id,cat:info.category,desc:info.description,image:base+info.cover,gallery:info.gallery.map(p=>base+p),content,created:Date.parse(info.added),featured:selected.has(id)};
  }))).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
  const categories=new Map(site.categories.map(c=>[c.name,c.enabled]));
  const used=new Set(projects.map(p=>p.cat));
  for(const name of used)if(!categories.has(name))categories.set(name,true);
  const series=await Promise.all(seriesIds.map(async id=>{
    const file=`works/${id}/index.md`;
    const info=parse(await read(file),id,file);
    return {id,title:info.title,subtitle:info.subtitle,info};
  }));
  const wenxin=page==='wenxin'?series.find(s=>s.id==='wenxin')?.info:null;
  if(page==='wenxin'&&!wenxin)throw Error('works/index.md: missing wenxin seriesId');
  window.SITE_DATA={site,home,text,projects,series:series.map(({id,title,subtitle})=>({id,title,subtitle})),wenxin,categories:[...categories].filter(([name,on])=>on&&(!site.hideEmptyCategories||used.has(name))).map(([name])=>name)};
  // A copied work shell derives its identity from its folder, with no HTML edits.
  const current=projects.find(p=>p.id===document.body.dataset.project);
  if(page==='project'&&!current)throw Error('This project is not published.');
  document.title=page==='home'?site.title:page==='project'?current.title+text.project.titleSuffix:page==='wenxin'?wenxin.title+' — 07S':text[page].browserTitle;
  document.querySelector('meta[name="description"]').content=page==='project'?current.desc:page==='wenxin'?wenxin.description:page==='contact'?text.contact.metaDescription:site.description;
  const set=(selector,value)=>{document.querySelector(selector).textContent=value;};
  set('.logo .seven',text.shared.brand);set('.logo sup',text.shared.brandSuffix);
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
  const app=document.querySelector('#app');if(app.querySelector('#wenxinStaticFallback')){console.warn('Showing Wenxin static fallback after content error:',error);return;}app.replaceChildren();
  const message=document.createElement('p');message.setAttribute('role','alert');
  message.textContent='Unable to load page content. '+error.message;app.append(message);
});
