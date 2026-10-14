// Browser-level smoke test: verify the published Markdown-driven HTML actually renders.
// Uses Chrome already installed on GitHub's ubuntu-latest runner.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
for(const file of ['works/wenxin/index.html','works/wenxin/index.md','assets/js/app.js'])
  if(!fs.existsSync(path.join(dist,file)))throw Error('Missing packaged asset: '+file);
const sourceShell=fs.readFileSync(path.join(root,'works/wenxin/index.html'),'utf8');
if(!/<main id="app"><\/main>/.test(sourceShell)||sourceShell.includes('wenxinStaticFallback')||sourceShell.includes('我相'))
  throw Error('Wenxin HTML must be an empty shell. Keep artwork data only in Markdown.');
const publishedShell=fs.readFileSync(path.join(dist,'works/wenxin/index.html'),'utf8');
if(!/site\.css\?v=[a-f0-9]{12}/.test(publishedShell)||!/load-content\.js\?v=[a-f0-9]{12}/.test(publishedShell))
  throw Error('Packaged shell must have content-hashed CSS and JS');

const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>p&&fs.existsSync(p));
if(!chrome)throw Error('Chrome not found. Set CHROME_BIN to an installed browser.');

function browserChecks(){
  window.addEventListener('07s:content-ready',()=>{
    const errors=[];
    const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
    try{
      const page=document.body.dataset.page;
      assert(document.querySelectorAll('.worksDropdown a').length>=2,'desktop-series-nav');
      assert(document.querySelectorAll('.mobileSeriesLink').length>=1,'mobile-series-nav');
      if(innerWidth>760){
        const worksTopLink=document.querySelector('[data-nav="works"]');
        worksTopLink.focus();
        assert(worksTopLink.closest('.worksNavGroup').matches(':focus-within'),'works-dropdown-keyboard-focus');
        assert(getComputedStyle(document.querySelector('.worksDropdown')).position==='absolute','works-dropdown-position');
        worksTopLink.blur();
      }else{
        const toggle=document.querySelector('.mobileMenuToggle');
        assert(!!toggle,'mobile-toggle');
        toggle.click();
        assert(document.body.classList.contains('mobileNavOpen'),'drawer-open');
        const drawer=document.querySelector('.mobileNavPanel');
        const drawerStyle=getComputedStyle(drawer);
        assert(drawerStyle.position==='fixed'&&drawerStyle.right==='0px','drawer-fixed-to-right');
        assert(drawer.offsetWidth<=innerWidth,'drawer-width');
        assert(drawer.offsetWidth>=innerWidth*.65,'drawer-not-too-narrow');
        const veil=document.querySelector('.mobileNavBackdrop');
        assert(Number(drawerStyle.zIndex)>Number(getComputedStyle(veil).zIndex),'drawer-above-backdrop');
        assert(drawer.querySelector('.mobileNavItem.is-active')!==null,'drawer-active-section');
        drawer.querySelector('.mobileNavClose').click();
        assert(!document.body.classList.contains('mobileNavOpen'),'drawer-close');
      }
      if(page==='wenxin'){
        const count=()=>document.querySelectorAll('#wenxinGrid .wenxinPlaceholder').length;
        assert(count()===8,'eight-MD-placeholder-cards:'+count());
        assert(document.querySelectorAll('[data-wenxin-tab]').length===5,'five-chapter-tabs');
        document.querySelector('[data-wenxin-tab="seven-aspects"]').click();
        assert(count()===8,'seven-aspects-filter');
        document.querySelector('[data-wenxin-tab="six-roots"]').click();
        assert(count()===0,'six-roots-empty-filter');
        document.querySelector('[data-wenxin-tab="all"]').click();
        const field=document.querySelector('#wenxinSearch');
        field.value='我相';field.dispatchEvent(new Event('input',{bubbles:true}));
        assert(count()===1,'search-filter');
        field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));
        assert(count()===8,'search-reset');
        document.querySelector('[data-wenxin-view="list"]').click();
        assert(document.querySelector('#wenxinGrid').classList.contains('list'),'list-view');
        document.querySelector('[data-wenxin-view="grid"]').click();
        assert(!document.querySelector('#wenxinGrid').classList.contains('list'),'grid-view');
      }
      if(page==='works'){
        assert(document.querySelectorAll('#catPills [data-cat]').length>=2,'works-original-categories');
        assert(document.querySelectorAll('#grid .work').length>=7,'works-original-projects');
        const category=document.querySelector('#catPills [data-cat="New Media Art"]');
        assert(!!category,'works-category-present');
        if(category){category.click();assert(document.querySelectorAll('#grid .work').length===2,'works-category-filter');
          document.querySelector('#catPills [data-cat="All"]').click();
          assert(document.querySelectorAll('#grid .work').length>=7,'works-category-reset');}

      }
    }catch(e){errors.push(String(e))}
    document.body.dataset.browserSmoke=errors.length?'fail:'+errors.join('|'):'ok';
  },{once:true});
}
const checks='<script>('+browserChecks.toString()+')();</script>';
const types={'.html':'text/html; charset=utf-8','.md':'text/markdown; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  try{
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.endsWith('/'))pathname+='index.html';
    const file=path.resolve(dist,'.'+pathname);
    if(!file.startsWith(dist+path.sep)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return}
    let output=fs.readFileSync(file);
    if(pathname==='/works/wenxin/index.html'||pathname==='/works/index.html')
      output=Buffer.from(output.toString('utf8').replace('</body>',checks+'</body>'));
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(output);
  }catch(error){res.writeHead(404);res.end('Not found: '+error.message)}
});
async function run(url,width=390){
  return new Promise((resolve,reject)=>{
    const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--window-size='+width+',844','--virtual-time-budget=7000','--dump-dom',url];
    const child=spawn(chrome,args,{stdio:['ignore','pipe','pipe']});
    let out='',err='',finished=false;
    const timeout=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Chrome timed out: '+url+'\n'+err.slice(-3000)))},50000);
    child.stdout.on('data',d=>out+=d.toString());
    child.stderr.on('data',d=>err+=d.toString());
    child.on('error',e=>{clearTimeout(timeout);reject(e)});
    child.on('close',code=>{
      if(finished)return;finished=true;clearTimeout(timeout);
      const value=(out.match(/data-browser-smoke="([^"]*)"/)||[])[1];
      const diagnostics='main='+out.slice(out.indexOf('<main'),out.indexOf('</main>')+7).slice(0,1800)+'; app='+out.includes('id="wenxinGrid"')+'; script='+out.includes('assets/js/app.js');
      if(code!==0||value!=='ok')
        reject(Error('Browser smoke failed '+url+' (code='+code+', state='+value+')\n'+diagnostics+'\n'+out.slice(-5000)+'\nChrome: '+err.slice(-1500)));
      else resolve(value);
    });
  });
}
server.listen(0,'127.0.0.1',async()=>{
  const base='http://127.0.0.1:'+server.address().port;
  try{
    for(const page of ['/works/wenxin/','/works/']){
      const outcome=await run(base+page);
      console.log('PASS: '+page+' (MD content, original filters, eight placeholders, right drawer) '+outcome);
    }
    await run(base+'/works/',1280);
    console.log('PASS: desktop WORKS hover/focus dropdown and original category filters');
    process.exitCode=0;
  }catch(error){console.error(error.stack||error);process.exitCode=1}
  finally{server.close()}
});
