const fs=require('node:fs'),path=require('node:path');
const {root,published}=require('./check.cjs');
const output=path.join(root,'dist');
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Invalid output');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);
const copy=(file)=>fs.cpSync(path.join(root,file),path.join(output,file),{recursive:true,filter:source=>!path.basename(source).startsWith('_')&&!path.basename(source).startsWith('.')});
for(const file of ['index.html','settings.md','pages','assets','works/index.html','works/index.md','works/wenxin','studio/index.html','contact/index.html',...published.map(p=>'works/'+p.id)])copy(file);
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Copied fixed HTML, original MD and public media to dist/. No MD-to-HTML generation.');
