/* 全站背景字符场（参考 web-media 的 bgfield.js，改成黑白灰）。
   固定在视口后面：平时是稀疏、缓慢漂移的点阵，偶尔浮现「07S」；
   光标附近像手电筒一样照出字符，其中夹着 0 / 7 / S；滚动时按视差移动，滚得越快越亮。
   触屏没有光标，只保留漂移和滚动效果。页面切到后台时暂停。 */
(function(){
  'use strict';
  const RAMP='.·:-=+*xo%#@';
  const BRAND='07S';
  const GLITCH='07S#%/\\<>=+*';
  const COLORS={dot:'#f7f7f8',char:'#8d8e97',brand:'#f7f7f8'};

  const hash=(x,y)=>{const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)};
  const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  function noise(x,y){
    const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);
    const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);
    return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;
  }

  const canvas=document.createElement('canvas');
  canvas.className='bgField';
  canvas.setAttribute('aria-hidden','true');
  document.body.prepend(canvas);
  const ctx=canvas.getContext('2d');
  let W=0,H=0,cell=16,fs=11,last=0,lastY=scrollY,vel=0,light=0;
  const pointer={x:-999,y:-999,on:false};
  const touch=matchMedia('(hover: none)').matches;

  function resize(){
    W=innerWidth;H=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    cell=W<640?18:16;fs=W<640?10:11;
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  addEventListener('resize',resize);
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX;pointer.y=e.clientY;pointer.on=true},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.on=false});

  function frame(now){
    requestAnimationFrame(frame);
    if(document.hidden||now-last<32)return;   // 约 30fps 就够了
    last=now;
    const t=now/1000,sy=scrollY;
    vel+=((sy-lastY)-vel)*.25;lastY=sy;
    const speed=Math.min(1,Math.abs(vel)/45);
    light+=((pointer.on&&!touch?1:0)-light)*.08;
    ctx.clearRect(0,0,W,H);

    const par=sy*.35;                          // 视差：背景比正文慢
    const rowShift=Math.floor(par/cell),off=par-rowShift*cell;
    const cols=Math.ceil(W/cell)+1,rows=Math.ceil(H/cell)+2,R=190;
    const dots=[],chars=[];
    for(let r=0;r<rows;r++){
      const gy=r+rowShift,py=r*cell-off;
      for(let c=0;c<cols;c++){
        const px=c*cell;
        let v=(noise(c*.07+t*.04,gy*.07-t*.03)-.56)*2.6;
        if(speed>.02)v+=speed*.55*hash(c,gy+Math.floor(t*8));
        let f=0;
        if(light>.01){
          f=smooth(1-Math.hypot(px+cell/2-pointer.x,py+cell/2-pointer.y)/R)*light;
          v+=f*(.55+.45*hash(c*3.1,gy*1.7));
        }
        if(v<.06)continue;
        if(f>.12)chars.push(px,py,Math.min(1,v),f);
        else if(v>.42)chars.push(px,py,Math.min(1,v),.3+(v-.42)*.4);
        else dots.push(px+cell/2-1,py+cell/2-1,Math.min(1,v));
      }
    }

    ctx.fillStyle=COLORS.dot;
    for(let i=0;i<dots.length;i+=3){ctx.globalAlpha=.1+dots[i+2]*.32;ctx.fillRect(dots[i],dots[i+1],2,2)}
    ctx.font='400 '+fs+'px ui-monospace,"SFMono-Regular",Consolas,monospace';
    ctx.textBaseline='top';
    const lastIdx=RAMP.length-1,slot=Math.floor(t*1.5),marks=[];
    ctx.fillStyle=COLORS.char;
    for(let j=0;j<chars.length;j+=4){
      const cx=chars[j],cy=chars[j+1],k=hash(cx*.119+slot*3.7,(cy+par)*.143);
      if(k>.74){marks.push(cx,cy,chars[j+3],BRAND.charAt(Math.floor(k*1000)%3));continue}
      ctx.globalAlpha=Math.min(.5,chars[j+3]*.62);
      ctx.fillText(RAMP.charAt(Math.floor(chars[j+2]*lastIdx)),cx+cell*.2,cy+cell*.12);
    }
    ctx.fillStyle=COLORS.brand;
    for(let q=0;q<marks.length;q+=4){ctx.globalAlpha=Math.min(.75,marks[q+2]);ctx.fillText(marks[q+3],marks[q]+cell*.2,marks[q+1]+cell*.12)}

    // 散落的「07S」：随机位置浮现，先乱码再收敛成 07S，然后淡出
    for(let wr=0;wr<rows;wr++){
      const wy=wr+rowShift;
      for(let wc=0;wc+2<cols;wc+=3){
        const life=t/5+hash(wc*.31,wy*.57)*9,gen=Math.floor(life);
        if(hash(wc*1.7+gen*5.3,wy*2.9)<.986)continue;
        const ph=life-gen,a=Math.sin(ph*Math.PI),wx=wc*cell,wpy=wr*cell-off;
        const near=light>.01?smooth(1-Math.hypot(wx+cell*1.5-pointer.x,wpy+cell/2-pointer.y)/260)*light:0;
        ctx.globalAlpha=Math.min(.8,a*.45+near*.35);
        for(let w=0;w<3;w++){
          const ch=ph>.18+w*.06?BRAND.charAt(w):GLITCH.charAt(Math.floor(hash(wc+w,wy+Math.floor(t*12))*GLITCH.length));
          ctx.fillText(ch,wx+w*cell+cell*.2,wpy+cell*.12);
        }
      }
    }
    ctx.globalAlpha=1;
  }
  requestAnimationFrame(frame);
})();
