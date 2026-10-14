const fs=require('node:fs');
const path=require('node:path');


const root=path.resolve(__dirname, '..');
const output=path.join(root,'dist');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const site=JSON.parse(read('site.config.json'));
const home=JSON.parse(read('home.config.json'));
const selected=home.selectedWorks;
for(const key of ['eyebrow','title','linkLabel'])if(typeof selected?.[key]!=='string')throw Error(`home.config.json: ${key} must be text`);
if(!Array.isArray(selected.projectIds)||selected.projectIds.some(id=>typeof id!=='string')||new Set(selected.projectIds).size!==selected.projectIds.length)throw Error('home.config.json: projectIds must contain unique work folder names');
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
  const p=JSON.parse(read(`works/${slug}/project.json`));
  for(const key of ['title','category','year','description','cover'])if(typeof p[key]!=='string'||!p[key].trim())throw Error(`${slug}: missing text field ${key}`);
  if(!['publish','draft'].includes(p.status))throw Error(`${slug}: status must be publish or draft`);
  if(!Number.isFinite(p.order)||typeof p.featured!=='boolean'||!Array.isArray(p.gallery))throw Error(`${slug}: invalid order, featured or gallery`);
  const created=Date.parse(p.added);
  if(!Number.isFinite(created))throw Error(`${slug}: added must be an ISO date`);
  if(p.video&&!/^https?:\/\//i.test(p.video))throw Error(`${slug}: video must be an http(s) link; use content.html for local video`);
  const content=read(`works/${slug}/content.html`);
  for(const m of content.replace(/<!--[\s\S]*?-->/g,'').matchAll(/\b(?:src|poster)\s*=\s*["']([^"']+)["']/gi)){
    if(!/^https?:\/\//i.test(m[1]))asset(slug,m[1]);
  }
  return {...p,id:slug,cat:p.category,desc:p.description,image:asset(slug,p.cover),gallery:p.gallery.map(x=>asset(slug,x)),content,created};
}).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
const published=projects.filter(p=>p.status==='publish');
const featured=selected.projectIds.map(id=>{
  const p=published.find(p=>p.id===id);
  if(!p)throw Error(`home.config.json: selected work "${id}" does not exist or is a draft; update projectIds or publish the work`);
  return p;
});
const categories=[...new Set([...site.categories,...published.map(p=>p.cat)])];

if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Output must stay inside this project.');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
function write(file,text){const dest=path.join(output,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);}
write('.nojekyll','');
// Draft data and draft media are never copied into the public site.
write('assets/js/data.js','window.SITE_DATA='+JSON.stringify({site,home,categories,projects:published}).replaceAll('<','\\u003c')+';\n');
const card=(p,base)=>`<a class="work" href="${base}works/${p.id}/"><div class="cover"><img src="${base}${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div><div class="workName">${esc(p.title)} ↗</div><div class="workMeta">${esc(p.cat)} / ${esc(p.year)}</div></a>`;
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
    if(['project.json','content.html','index.html'].includes(entry.name)||entry.name.startsWith('.'))continue;
    fs.cpSync(path.join(root,'works',p.id,entry.name),path.join(workOutput,entry.name),{recursive:true});
  }
  page(`works/${p.id}/index.html`,'project',p.id,`${p.title} — 07S`,p.desc,base=>`<section class="panel"><a href="${base}works/">← WORKS</a><h1 class="pageTitle">${esc(p.title)}</h1><p class="lead">${esc(p.cat)} / ${esc(p.year)} / ${esc(p.location)}</p><div class="feature"><img src="${base}${esc(p.image)}" alt="${esc(p.title)}"></div><p class="editorial">${esc(p.desc)}</p><div class="projectContent">${p.content}</div><div class="gallery">${p.gallery.map(im=>`<div><img src="${base}${esc(im)}" alt="${esc(p.title)}" loading="lazy"></div>`).join('')}</div></section>`);
}
console.log(`Built ${published.length} published work pages and 4 site pages in dist/ (${projects.length-published.length} drafts excluded).`);

