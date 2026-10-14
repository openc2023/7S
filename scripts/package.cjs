const fs=require('node:fs'),path=require('node:path');
const {root,published,seriesIds}=require('./check.cjs');
const output=path.join(root,'dist');
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Invalid output');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);
const copy=(file)=>fs.cpSync(path.join(root,file),path.join(output,file),{recursive:true,filter:source=>!path.basename(source).startsWith('_')&&!path.basename(source).startsWith('.')});
for(const file of ['index.html','settings.md','pages','assets','works/index.html','works/index.md','works/wenxin','studio/index.html','contact/index.html',...seriesIds.map(id=>'works/'+id),...published.map(p=>'works/'+p.id)])copy(file);

/* Version deployed static resources from their contents. Source HTML stays a fixed shell. */
const crypto=require('node:crypto');
const revision=crypto.createHash('sha256')
  .update(['assets/css/site.css','assets/js/app.js','assets/js/load-content.js'].map(file=>fs.readFileSync(path.join(root,file))).join('|'))
  .digest('hex').slice(0,12);
const pageShells=['index.html','works/index.html','studio/index.html','contact/index.html',
  ...seriesIds.map(id=>'works/'+id+'/index.html'),...published.map(p=>'works/'+p.id+'/index.html')];
for(const file of pageShells){
  const target=path.join(output,file);
  let html=fs.readFileSync(target,'utf8');
  html=html.replace(/(href|src)="([^"]*?assets\/(?:css\/site\.css|js\/load-content\.js))(?:\?[^"]*)?"/g,
    (_,attr,url)=>attr+'="'+url+'?v='+revision+'"');
  fs.writeFileSync(target,html);
}
console.log('Static asset version: '+revision);

fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Copied fixed HTML, original MD and public media to dist/. No MD-to-HTML generation.');
