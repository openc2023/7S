// Start before Markdown requests; replay on every physical page navigation.
(()=>{
  const overlay=document.getElementById('loader');
  if(!overlay)return;
  const number=document.getElementById('ldNum'),bar=document.getElementById('ldBar');
  const started=performance.now();
  let ready=false,closed=false;
  const paint=value=>{number.textContent=String(value).padStart(3,'0');bar.style.width=value+'%';};
  const close=()=>{
    if(closed)return;
    closed=true;paint(100);
    setTimeout(()=>{overlay.classList.add('done');setTimeout(()=>overlay.remove(),1000);},200);
  };
  const step=()=>{
    if(closed||!overlay.isConnected)return;
    const elapsed=performance.now()-started;
    if(ready&&elapsed>=1500){close();return;}
    const progress=Math.min(1,elapsed/1500);
    paint(Math.min(ready?99:90,Math.round((1-Math.pow(1-progress,3))*100)));
    setTimeout(step,30);
  };
  addEventListener('07s:content-ready',()=>{ready=true;},{once:true});
  overlay.onclick=close;
  step();
})();
