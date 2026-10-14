const fs=require('node:fs');
const path=require('node:path');
const markdown=require('markdown-it')({html:true,linkify:true});

const root=path.resolve(__dirname, '..');
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
const text={};
for(const [scope,fields] of Object.entries(require('./text-schema.json'))){
  const file=`pages/${scope}.md`;
  const values=settings(file,['text']).text;
  for(const [key,rule] of Object.entries(fields)){
    const value=values[key];
    if(rule.type==='array'?!Array.isArray(value)||value.some(x=>typeof x!=='string'):typeof value!==rule.type)throw Error(`${file}: invalid or missing ${key}`);
    if(rule.type==='number'&&(!Number.isSafeInteger(value)||value<0))throw Error(`${file}: ${key} must be a non-negative integer`);
    for(const placeholder of rule.placeholders)if(!value.includes(`{${placeholder}}`))throw Error(`${file}: ${key} must keep {${placeholder}}`);
  }
  for(const key of Object.keys(values))if(!Object.hasOwn(fields,key))throw Error(`${file}: unknown field ${key}`);
  text[scope]=values;
}
new Intl.DateTimeFormat('en-GB',{timeZone:text.shared.clockTimezone});
if(!/^[A-Za-z0-9]{3}$/.test(text.shared.heroLetters))throw Error('pages/shared.md: heroLetters needs exactly 3 English letters or digits');
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
const worksConfig=settings('works/index.md',['works']).works;
const catalog=worksConfig.projectIds;
const seriesIds=worksConfig.seriesIds||[];
if(!Array.isArray(seriesIds)||new Set(seriesIds).size!==seriesIds.length||seriesIds.some(id=>typeof id!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)))throw Error('works/index.md: invalid seriesIds');
if(seriesIds.some(id=>catalog.includes(id)))throw Error('works/index.md: series IDs cannot also be project IDs');
for(const id of seriesIds){
  const index='works/'+id+'/index.md';
  const info=settings(index,[id])[id];
  if(typeof info.title!=='string'||!info.title.trim())throw Error(index+': missing title');

  // Series planned-card image covers are real media assets, not CSS-generated art.
  // Validate all Markdown references before copying a release.
  if(info.planned!==undefined){
    if(!Array.isArray(info.planned))throw Error(index+': planned must be an array');
    const knownChapters=new Set((info.chapters||[]).map(c=>c.id));
    const titles=new Set(),covers=new Set();
    for(const [n,planned] of info.planned.entries()){
      if(!planned||typeof planned.title!=='string'||!planned.title.trim()||titles.has(planned.title))
        throw Error(index+': invalid or duplicate planned card title #'+(n+1));
      titles.add(planned.title);
      if(!knownChapters.has(planned.chapter)||!['image','video'].includes(planned.type))
        throw Error(index+': invalid chapter/type on planned card '+planned.title);
      const cover=planned.cover;
      if(typeof cover!=='string'||!/^media\/[a-z0-9_./-]+\.(?:svg|png|jpe?g|webp)$/i.test(cover)||cover.split('/').includes('..')||covers.has(cover))
        throw Error(index+': use a unique local media cover for '+planned.title);
      covers.add(cover);
      if(!fs.existsSync(path.join(root,'works',id,cover))||!fs.statSync(path.join(root,'works',id,cover)).isFile())
        throw Error(index+': missing placeholder image '+cover+' for '+planned.title);
    }
  }
  if(!fs.existsSync(path.join(root,'works',id,'index.html')))throw Error('Missing series HTML shell: works/'+id+'/index.html');
}
if(!Array.isArray(catalog)||new Set(catalog).size!==catalog.length)throw Error('works/index.md: projectIds must be a unique array');
function asset(slug,file){
  if(typeof file!=='string'||!file||file.includes('\\')||file.startsWith('/')||file.split('/').includes('..')||/^[a-z]+:/i.test(file)) throw Error(`${slug}: use a relative local media path: ${file}`);
  if(!fs.statSync(path.join(root,'works',slug,file)).isFile())throw Error(`${slug}: missing media ${file}`);
  return 'works/'+slug+'/'+file;
}
// Validate source files before the publisher copies anything to dist/.
const projects=fs.readdirSync(path.join(root,'works'),{withFileTypes:true}).filter(x=>x.isDirectory()&&!x.name.startsWith('.')&&!seriesIds.includes(x.name)).map(entry=>{
  const slug=entry.name;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error(`Use lowercase English letters, numbers and hyphens for work folder names: ${slug}`);
  const settingsFile=`works/${slug}/settings.md`;
  const p=settings(settingsFile,['project']).project;
  for(const key of ['title','category','year','description','cover'])if(typeof p[key]!=='string'||!p[key].trim())throw Error(`${slug}: missing text field ${key}`);
  if(!['publish','draft'].includes(p.status))throw Error(`${slug}: status must be publish or draft`);
  if(!Number.isFinite(p.order)||!Array.isArray(p.gallery))throw Error(`${slug}: invalid order or gallery`);
  const created=Date.parse(p.added);
  if(!Number.isFinite(created))throw Error(`${slug}: added must be an ISO date`);
  if(p.video&&!/^https?:\/\//i.test(p.video))throw Error(`${slug}: video must be an http(s) link; use content.md for local video`);
  const markdownFile=`works/${slug}/content.md`;
  // Match the browser parser: ignore editor comments and validate visible media.
  const content=markdown.render(read(markdownFile).replace(/<!--[\s\S]*?-->/g,''));
  for(const m of content.matchAll(/\b(?:src|poster)\s*=\s*["']([^"']+)["']/gi)){
    if(!/^https?:\/\//i.test(m[1]))asset(slug,decodeURIComponent(markdown.utils.unescapeAll(m[1])));
  }
  asset(slug,p.cover);
  p.gallery.forEach(file=>asset(slug,file));
  return {...p,id:slug};
}).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
for(const id of catalog)if(!projects.some(p=>p.id===id&&p.status==='publish'))throw Error(`works/index.md: ${id} must exist and have status publish`);
for(const p of projects)if(p.status==='publish'&&!catalog.includes(p.id))throw Error(`works/index.md: add published work ${p.id} to projectIds`);
const published=projects.filter(p=>catalog.includes(p.id));
for(const id of selected.projectIds){
  const p=published.find(p=>p.id===id);
  if(!p)throw Error(`settings.md (home): selected work "${id}" does not exist or is a draft; update projectIds or publish the work`);
}

for(const file of ['index.html','works/index.html','studio/index.html','contact/index.html',...published.map(p=>`works/${p.id}/index.html`)])if(!fs.existsSync(path.join(root,file)))throw Error(`Missing fixed shell: ${file}; copy templates/work/index.html for new works`);
module.exports={root,published,seriesIds};
console.log(`Checked MD settings, media and fixed HTML shells (${published.length} published works). No HTML generated.`);
