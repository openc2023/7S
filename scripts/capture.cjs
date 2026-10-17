// Live covers: open each published work that has "link" + "capture" in its settings.md in headless Chrome
// and save just the artwork (capture.selector) as works/<id>/media/live.png. Runs before every deploy and
// once a day, so covers follow the live interactive pages. A failed capture keeps the previous cover.
// Usage: node scripts/capture.cjs [work-id ...]   (CHROME_BIN overrides the browser path)
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const markdown=require('markdown-it')();
const root=path.resolve(__dirname,'..');

const settingsOf=id=>{
  const token=markdown.parse(fs.readFileSync(path.join(root,'works',id,'settings.md'),'utf8'),{}).find(t=>t.type==='fence'&&t.info.trim()==='json project');
  return token?JSON.parse(token.content):null;
};
const catalog=JSON.parse(markdown.parse(fs.readFileSync(path.join(root,'works/index.md'),'utf8'),{}).find(t=>t.type==='fence'&&t.info.trim()==='json works').content).projectIds;
const only=process.argv.slice(2);
const jobs=catalog.filter(id=>!only.length||only.includes(id)).map(id=>({id,p:settingsOf(id)})).filter(({p})=>p&&p.link&&p.capture);
if(!jobs.length){console.log('No works with link + capture.');process.exit(0);}

const chrome=[process.env.CHROME_BIN,'C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p=>p&&fs.existsSync(p));
if(!chrome){console.warn('Chrome not found; keeping existing covers.');process.exit(0);}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'07s-capture-'));
  const proc=spawn(chrome,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1200,900','--hide-scrollbars',
    '--no-first-run','--no-default-browser-check','--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','about:blank'],{stdio:['ignore','ignore','pipe']});
  const wsUrl=await new Promise((resolve,reject)=>{
    let buf='';const t=setTimeout(()=>reject(Error('Chrome did not start')),30000);
    proc.stderr.on('data',d=>{buf+=d;const m=buf.match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(t);resolve(m[1]);}});
  });
  const ws=new WebSocket(wsUrl);
  await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
  let seq=0;const waiting=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&waiting.has(m.id)){const {resolve,reject}=waiting.get(m.id);waiting.delete(m.id);m.error?reject(Error(m.error.message)):resolve(m.result);}};
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}));});

  let ok=0;
  for(const {id,p} of jobs){
    const c=p.capture,out=path.join(root,'works',id,'media','live.png');
    let targetId;
    try{
      ({targetId}=await send('Target.createTarget',{url:'about:blank'}));
      const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
      const run=(expression)=>send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId).then(r=>r.result.value);
      await send('Page.enable',{},sessionId);
      await send('Emulation.setDeviceMetricsOverride',{width:1200,height:900,deviceScaleFactor:1,mobile:false},sessionId);
      await send('Page.navigate',{url:p.link},sessionId);
      // Wait for the artwork element, then let it animate for capture.wait ms.
      const deadline=Date.now()+(c.timeout||60000);
      // capture.ready: optional JS expression that is true once the work has finished loading (e.g. a game engine).
      const ready=`!!document.querySelector(${JSON.stringify(c.selector||'body')})`+(c.ready?`&&(${c.ready})`:'');
      while(Date.now()<deadline&&!(await run(ready).catch(()=>false)))await sleep(1000);
      await sleep(c.wait||4000);
      if(c.hide&&c.hide.length)await run(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(c.hide.join(',')+'{visibility:hidden!important}')};document.head.append(s);return true})()`);
      await sleep(300);
      const rect=await run(`(()=>{const e=document.querySelector(${JSON.stringify(c.selector||'body')});if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`);
      if(!rect||rect.width<50||rect.height<50)throw Error('artwork element not found: '+c.selector);
      const shot=await send('Page.captureScreenshot',{format:'png',clip:{...rect,scale:1},captureBeyondViewport:true},sessionId);
      fs.writeFileSync(out,Buffer.from(shot.data,'base64'));
      console.log(`captured ${id} (${Math.round(rect.width)}×${Math.round(rect.height)})`);ok++;
    }catch(error){console.warn(`kept previous cover for ${id}: ${error.message}`);}
    finally{if(targetId)await send('Target.closeTarget',{targetId}).catch(()=>{});}
  }
  ws.close();proc.kill();
  try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
  console.log(`Live covers: ${ok}/${jobs.length} updated.`);
}
main().catch(error=>{console.warn('Capture skipped: '+error.message);process.exit(0);});
