const fs=require('node:fs');
const path=require('node:path');
const markdown=require('markdown-it')({html:true,linkify:true});


const root=path.resolve(__dirname, '..');
const output=path.join(root,'dist');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function settings(file, sections){
  const result={};
  for(const token of markdown.parse(read(file),{})){
    if(token.type!=='fence'||!token.info.trim().startsWith('json '))continue;
    const key=token.info.trim().slice(5).trim();
    if(!sections.includes(key))throw Error(`${file}: unknown settings block ${key}`);
    if(Object.hasOwn(result,key))throw Error(`${file}: duplicate settings block ${key}`);
    try{result[key]=JSON.parse(token.content);}catch(error){throw Error(`${file} (${key}): ${error.message}`);}
    if(!result[key]||typeof result[key]!=='object'||Array.isArray(result[key]))throw Error(`${file} (${key}): settings must be an object`);
  }
  for(const key of sections)if(!Object.hasOwn(result,key))throw Error(`${file}: missing json ${key} block`);
  return result;
}
const {site,home}=settings('settings.md',['site','home']);
const selected=home.selectedWorks;
if(site.weather){
  const w=site.weather;
  if(typeof w.enabled!=='boolean'||(w.enabled&&(!Number.isFinite(w.latitude)||Math.abs(w.latitude)>90||!Number.isFinite(w.longitude)||Math.abs(w.longitude)>180||typeof w.defaultLabel!=='string'||!Number.isFinite(w.refreshMinutes)||w.refreshMinutes<5)))throw Error('settings.md (site): weather needs valid coordinates, a defaultLabel and refreshMinutes >= 5');
}
if(typeof site.hideEmptyCategories!=='boolean'||!Array.isArray(site.categories))throw Error('settings.md (site): categories must be an array and hideEmptyCategories must be true or false');
const categorySettings=new Map();
for(const c of site.categories){
  if(!c||typeof c.name!=='string'||!c.name.trim()||c.name!==c.name.trim()||c.name==='All'||typeof c.enabled!=='boolean'||categorySettings.has(c.name))throw Error('settings.md (site): categories need a unique name (not All) and enabled: true or false');
  categorySettings.set(c.name,c.enabled);
}
for(const key of ['eyebrow','title','linkLabel'])if(typeof selected?.[key]!=='string')throw Error(`settings.md (home): ${key} must be text`);
if(!Array.isArray(selected.projectIds)||selected.projectIds.some(id=>typeof id!=='string')||new Set(selected.projectIds).size!==selected.projectIds.length)throw Error('settings.md (home): projectIds must contain unique work folder names');
const template=read('templates/site.html');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function asset(slug,file){
  if(typeof file!=='string'||!file||file.includes('\\')||file.startsWith('/')||file.split('/').includes('..')||/^[a-z]+:/i.test(file)) throw Error(`${slug}: use a relative local media path: ${file}`);
  if(!fs.statSync(path.join(root,'works',slug,file)).isFile())throw Error(`${slug}: missing media ${file}`);
  return 'works/'+slug+'/'+file;
}
// Read and validate everything before replacing any generated output.
const projects=fs.readdirSync(path.join(root,'works'),{withFileTypes:true}).filter(x=>x.isDirectory()&&!x.name.startsWith('.')).map(entry=>{
  const slug=entry.name;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error(`Use lowercase English letters, numbers and hyphens for work folder names: ${slug}`);
  const settingsFile=`works/${slug}/settings.md`;
  const p=fs.existsSync(path.join(root,settingsFile))?settings(settingsFile,['project']).project:JSON.parse(read(`works/${slug}/project.json`));
  for(const key of ['title','category','year','description','cover'])if(typeof p[key]!=='string'||!p[key].trim())throw Error(`${slug}: missing text field ${key}`);
  if(!['publish','draft'].includes(p.status))throw Error(`${slug}: status must be publish or draft`);
  if(!Number.isFinite(p.order)||!Array.isArray(p.gallery))throw Error(`${slug}: invalid order or gallery`);
  const created=Date.parse(p.added);
  if(!Number.isFinite(created))throw Error(`${slug}: added must be an ISO date`);
  if(p.video&&!/^https?:\/\//i.test(p.video))throw Error(`${slug}: video must be an http(s) link; use content.md for local video`);
  const markdownFile=`works/${slug}/content.md`;
  const source=fs.existsSync(path.join(root,markdownFile))?markdown.render(read(markdownFile)):read(`works/${slug}/content.html`);
  // Editor comments stay out of generated pages and browser data, including disabled examples.
  const content=source.replace(/<!--[\s\S]*?-->/g,'');
  for(const m of content.replace(/<!--[\s\S]*?-->/g,'').matchAll(/\b(?:src|poster)\s*=\s*["']([^"']+)["']/gi)){
    if(!/^https?:\/\//i.test(m[1]))asset(slug,decodeURIComponent(markdown.utils.unescapeAll(m[1])));
  }
  return {...p,id:slug,cat:p.category,desc:p.description,image:asset(slug,p.cover),gallery:p.gallery.map(x=>asset(slug,x)),content,created};
}).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
const selectedIds=new Set(selected.projectIds);
const published=projects.filter(p=>p.status==='publish').map(p=>({...p,featured:selectedIds.has(p.id)}));
const featured=selected.projectIds.map(id=>{
  const p=published.find(p=>p.id===id);
  if(!p)throw Error(`settings.md (home): selected work "${id}" does not exist or is a draft; update projectIds or publish the work`);
  return p;
});
const usedCategories=new Set(published.map(p=>p.cat));
// New work categories appear automatically; explicit disabled categories stay hidden.
for(const name of usedCategories)if(!categorySettings.has(name))categorySettings.set(name,true);
const categories=[...categorySettings].filter(([name,enabled])=>enabled&&(!site.hideEmptyCategories||usedCategories.has(name))).map(([name])=>name);

if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Output must stay inside this project.');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
function write(file,text){const dest=path.join(output,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);}
write('.nojekyll','');
// Draft data and draft media are never copied into the public site.
write('assets/js/data.js','window.SITE_DATA='+JSON.stringify({site,home,categories,projects:published}).replaceAll('<','\\u003c')+';\n');
const card=(p,base)=>`<a class="work" href="${base}works/${p.id}/"><div class="cover"><img src="${base}${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">${p.featured?'<span class="badge">★ FEATURED</span>':''}</div><div class="workName">${esc(p.title)} ↗</div><div class="workMeta">${esc(p.cat)} / ${esc(p.year)}</div></a>`;
function page(file,name,id,title,description,content){
  const depth=file.split('/').length-1,base='../'.repeat(depth)||'./';
  const hero=name==='home'?`<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script><script type="module" src="${base}assets/js/hero.js"></script>`:'';
  const values={base,page:name,project:esc(id),title:esc(title),description:esc(description),content:content(base),hero};
  write(file,template.replace(/\{\{(\w+)\}\}/g,(_,key)=>values[key]));
}
page('index.html','home','',site.title,site.description,base=>`<section class="panel"><div class="eyebrow">07S / INDEPENDENT CREATIVE STUDIO</div><h1 class="heroTitle">SEVEN IS<br>MORE THAN<br>A NUMBER.</h1><p class="lead">${esc(site.description)}</p><div class="heroArt"><i></i></div><div class="sectiontop"><div><div class="small muted">${esc(selected.eyebrow)}</div><h2>${esc(selected.title)}</h2></div><a class="small ulink" href="${base}works/">${esc(selected.linkLabel)} (${published.length}) ↗</a></div><div class="workGrid">${featured.map(p=>card(p,base)).join('')||'<p class="muted">No selected works yet.</p>'}</div></section>`);
page('works/index.html','works','','WORKS — 07S',site.description,base=>`<section class="panel"><h1 class="pageTitle">WORKS</h1><div class="workGrid">${published.map(p=>card(p,base)).join('')}</div></section>`);
page('studio/index.html','studio','','STUDIO — 07S',site.description,()=>`<section class="panel"><h1 class="pageTitle">STUDIO</h1><p class="editorial">07S is a multidisciplinary creative studio exploring the intersection of art, design, moving images and emerging technologies.</p></section>`);
page('contact/index.html','contact','','CONTACT — 07S','Contact 07S Studio',()=>`<section class="panel"><h1 class="pageTitle">CONTACT</h1><a class="action" href="mailto:${esc(site.email)}">${esc(site.email)}</a><p>${esc(site.contactNote)}</p></section>`);
for(const p of published){
  // Work content and media sit together in the generated folder, too.
  const workOutput=path.join(output,'works',p.id);
  fs.mkdirSync(workOutput,{recursive:true});
  for(const entry of fs.readdirSync(path.join(root,'works',p.id),{withFileTypes:true})){
    if(['settings.md','project.json','content.html','content.md','index.html'].includes(entry.name)||entry.name.startsWith('.'))continue;
    fs.cpSync(path.join(root,'works',p.id,entry.name),path.join(workOutput,entry.name),{recursive:true});
  }
  page(`works/${p.id}/index.html`,'project',p.id,`${p.title} — 07S`,p.desc,base=>`<section class="panel"><a href="${base}works/">← WORKS</a><h1 class="pageTitle">${esc(p.title)}</h1><p class="lead">${esc(p.cat)} / ${esc(p.year)} / ${esc(p.location)}</p><div class="feature"><img src="${base}${esc(p.image)}" alt="${esc(p.title)}"></div><p class="editorial">${esc(p.desc)}</p><div class="projectContent">${p.content}</div><div class="gallery">${p.gallery.map(im=>`<div><img src="${base}${esc(im)}" alt="${esc(p.title)}" loading="lazy"></div>`).join('')}</div></section>`);
}
console.log(`Built ${published.length} published work pages and 4 site pages in dist/ (${projects.length-published.length} drafts excluded).`);

