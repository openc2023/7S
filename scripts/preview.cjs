const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const types={'.md':'text/plain; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm'};
http.createServer((req,res)=>{
  try{
    // Also preview a GitHub project URL under /07s-preview/.
    let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/07s-preview(?=\/)/,'');
    if(!/^\/(?:$|index\.html$|settings\.md$|(?:assets|pages|works|studio|contact)\/)/.test(url)||url.split('/').some(p=>p.startsWith('.')||p.startsWith('_'))){res.writeHead(404);return res.end('Not found');}
    let file=path.resolve(root,'.'+url);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(5177,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:5177/07s-preview/'));

