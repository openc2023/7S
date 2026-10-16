// Start before Markdown requests; replay on every physical page navigation.
// ASCII loader: a character bar in the middle and a big 000–100 counter drawn in 5×7 character pixels.
(()=>{
  const overlay=document.getElementById('loader');
  if(!overlay)return;
  const number=document.getElementById('ldNum'),bar=document.getElementById('ldBar').parentNode;
  overlay.classList.add('ascii');
  const DIGITS={
    0:['01110','10001','10011','10101','11001','10001','01110'],
    1:['00100','01100','00100','00100','00100','00100','01110'],
    2:['01110','10001','00001','00010','00100','01000','11111'],
    3:['11110','00001','00001','01110','00001','00001','11110'],
    4:['00010','00110','01010','10010','11111','00010','00010'],
    5:['11111','10000','11110','00001','00001','10001','01110'],
    6:['00110','01000','10000','11110','10001','10001','01110'],
    7:['11111','00001','00010','00100','01000','01000','01000'],
    8:['01110','10001','10001','01110','10001','10001','01110'],
    9:['01110','10001','10001','01111','00001','00010','01100']
  };
  const INK='07S#@%';
  const SPIN='|/-\\';
  const SLOTS=24;
  const started=performance.now();
  let ready=false,closed=false,tick=0;
  // Each lit pixel is two characters wide so the digits look square in a monospace font.
  const bigNumber=text=>DIGITS[0].map((_,row)=>[...text].map(d=>DIGITS[d][row].split('').map((on,col)=>on==='1'
    ?INK[(row*7+col*3+tick+Number(d))%INK.length].repeat(2):'  ').join('')).join('  ')).join('\n');
  const paint=value=>{
    tick++;
    const text=String(value).padStart(3,'0'),filled=Math.round(value/100*SLOTS);
    number.textContent=bigNumber(text);
    number.setAttribute('aria-label',text+'%');
    bar.textContent=(value>=100?'*':SPIN[tick%4])+' ['+'#'.repeat(filled)+'·'.repeat(SLOTS-filled)+'] '+text+'%';
  };
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
