
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';

// 粗体字库，用来生成 0 / 7 / S 三个立体字母
const font=await new FontLoader().loadAsync('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json');

window.HERO3D=function(el){
  let renderer;
  // Phones: no MSAA and a lower pixel ratio keep the 3D letters smooth without heating the device.
  const small=matchMedia('(max-width: 760px), (hover: none)').matches;
  try{renderer=new THREE.WebGLRenderer({antialias:!small,alpha:true,powerPreference:small?'low-power':'high-performance'})}catch(e){return()=>{}}
  renderer.setPixelRatio(Math.min(small?1.5:2,devicePixelRatio||1));renderer.setClearColor(0,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  el.prepend(renderer.domElement);

  const scene=new THREE.Scene();
  const pm=new THREE.PMREMGenerator(renderer);
  scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;
  const cam=new THREE.PerspectiveCamera(30,1,.1,100);
  const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(6,10,12);scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,.6);fill.position.set(-10,-6,4);scene.add(fill);

  // 立体字母 0 / 7 / S，每个字母各有黑、白、灰三种材质
  const geos=[...window.SITE_DATA.text.shared.heroLetters].map(ch=>{const g=new TextGeometry(ch,{font,size:2,height:.75,depth:.75,curveSegments:10,bevelEnabled:true,bevelThickness:.08,bevelSize:.05,bevelSegments:3});g.center();g.computeVertexNormals();return g});
  const mats=[
    new THREE.MeshPhysicalMaterial({color:0xededf0,roughness:.25,clearcoat:1}),
    new THREE.MeshPhysicalMaterial({color:0x08080a,roughness:.1,clearcoat:1,clearcoatRoughness:.05}),
    new THREE.MeshPhysicalMaterial({color:0x5c5d63,roughness:.45,metalness:.2})
  ];
  const N=innerWidth<700?27:45,per=Math.ceil(N/9);
  const meshes=[];
  geos.forEach(g=>mats.forEach(m=>{const im=new THREE.InstancedMesh(g,m,per);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);meshes.push(im)}));
  const R=1.2,bodies=[];
  for(let i=0;i<per*9;i++){
    bodies.push({mesh:meshes[i%9],idx:Math.floor(i/9),
      p:new THREE.Vector3((Math.random()-.5)*28,(Math.random()-.5)*10+11,(Math.random()-.5)*4),
      v:new THREE.Vector3(),q:new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random()-.5)*1.2,(Math.random()-.5)*1.6,(Math.random()-.5)*2)),
      w:new THREE.Vector3((Math.random()-.5)*.02,(Math.random()-.5)*.02,(Math.random()-.5)*.02)});
  }
  const dummy=new THREE.Object3D(),tmp=new THREE.Vector3(),dq=new THREE.Quaternion(),eu=new THREE.Euler();
  const mouse=new THREE.Vector3(1e3,1e3,0),mVel=new THREE.Vector3();let mActive=false,last=null;

  function toWorld(cx,cy){
    const r=el.getBoundingClientRect(),v=new THREE.Vector3(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1,.5).unproject(cam).sub(cam.position).normalize();
    return cam.position.clone().addScaledVector(v,-cam.position.z/v.z);
  }
  const onMove=e=>{const pt=e.touches?e.touches[0]:e,w=toWorld(pt.clientX,pt.clientY);if(last)mVel.copy(w).sub(last);last=w.clone();mouse.copy(w);mActive=true};
  const onLeave=()=>{mActive=false;last=null;mouse.set(1e3,1e3,0)};
  const onClick=e=>{const w=toWorld(e.clientX,e.clientY);bodies.forEach(b=>{tmp.copy(b.p).sub(w);const d=Math.max(1,tmp.length());b.v.addScaledVector(tmp.normalize(),9/d);b.w.addScalar((Math.random()-.5)*.15)})};
  el.addEventListener('mousemove',onMove);el.addEventListener('touchmove',onMove,{passive:true});el.addEventListener('mouseleave',onLeave);el.addEventListener('click',onClick);

  function resize(){const r=el.getBoundingClientRect();if(!r.width)return;renderer.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;
    cam.position.set(0,0,cam.aspect<1?28:19);cam.updateProjectionMatrix()}
  const ro=new ResizeObserver(resize);ro.observe(el);resize();

  // 一步物理：聚拢 + 鼠标推开 + 互相碰撞 + 旋转
  function step(t){
    const sx=Math.max(1,cam.aspect);
    for(const b of bodies){
      b.v.x-=b.p.x*.002/sx;b.v.y-=b.p.y*.0036;b.v.z-=b.p.z*.006;
      if(mActive){tmp.copy(b.p).sub(mouse);const d=tmp.length();if(d<4.2){b.v.addScaledVector(tmp.normalize(),(4.2-d)*.05).addScaledVector(mVel,.08);b.w.x+=mVel.y*.01;b.w.y-=mVel.x*.01}}
    }
    for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
      const a=bodies[i],c=bodies[j];tmp.copy(c.p).sub(a.p);const d=tmp.length(),min=R*2;
      if(d<min&&d>1e-4){tmp.divideScalar(d);const o=(min-d)*.5;a.p.addScaledVector(tmp,-o);c.p.addScaledVector(tmp,o);
        const rv=(c.v.x-a.v.x)*tmp.x+(c.v.y-a.v.y)*tmp.y+(c.v.z-a.v.z)*tmp.z;
        if(rv<0){a.v.addScaledVector(tmp,rv*.5);c.v.addScaledVector(tmp,-rv*.5);a.w.x+=rv*.01;c.w.y-=rv*.01}}
    }
    for(const b of bodies){
      b.v.multiplyScalar(.9);b.p.add(b.v);
      b.w.multiplyScalar(.97);b.w.x+=Math.sin(t+b.idx)*.00012;
      dq.setFromEuler(eu.set(b.w.x,b.w.y,b.w.z));b.q.premultiply(dq);
    }
    mVel.multiplyScalar(.8);
  }
  let raf=0,visible=true,lastT=performance.now(),t=0;
  function frame(now){
    raf=0;if(!visible)return;
    // 按真实时间补步，低帧率设备上速度也一致
    const n=Math.max(1,Math.min(4,Math.round((now-lastT)/16.7)));lastT=now;
    for(let k=0;k<n;k++){t+=.016;step(t)}
    for(const b of bodies){dummy.position.copy(b.p);dummy.quaternion.copy(b.q);dummy.updateMatrix();b.mesh.setMatrixAt(b.idx,dummy.matrix)}
    meshes.forEach(m=>m.instanceMatrix.needsUpdate=true);
    renderer.render(scene,cam);
    raf=requestAnimationFrame(frame);
  }
  // 不在视口内时暂停
  const vis=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!raf){lastT=performance.now();raf=requestAnimationFrame(frame)}});vis.observe(el);
  raf=requestAnimationFrame(frame);
  setTimeout(()=>el.classList.add('gl'),60);

  return()=>{cancelAnimationFrame(raf);visible=false;ro.disconnect();vis.disconnect();el.classList.remove('gl');
    el.removeEventListener('mousemove',onMove);el.removeEventListener('touchmove',onMove);el.removeEventListener('mouseleave',onLeave);el.removeEventListener('click',onClick);
    geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());pm.dispose();renderer.dispose();renderer.domElement.remove()};
};
dispatchEvent(new Event('hero3d-ready'));
