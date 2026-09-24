import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import * as L from './logic.js';
import {paintChunk,CH,iconCanvas,mk,ICON3D} from './art2d.js';
const {S,W,TAU,hyp,clamp,WD,CHARS,CATC,RARC,LVC,PROPS}=L;

let renderer,scene,camera,sun,hemi,lobbyScene,lobbyCam,clock;
let quality='high';
const CHAR_H=20,WALL_H=13;
const tpl={},clips={},propTpl={};
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_s=new THREE.Vector3(),_e=new THREE.Euler(),UPV=new THREE.Vector3(0,1,0);
const V={chunks:[],chars:new Map(),items:new Map(),drops:new Map(),barriers:new Map(),decoys:new Map(),roofs:[],fx:[],parts:null,smoke:[],bulletsMesh:null,flameMesh:null,trees:null,canopy:null,canopyPool:[],hiddenTrees:[],zoneWall:null,zoneRing:null,plane:null,world:null,bigProps:[]};
export const cam={x:W/2,y:W/2,dist:1,shake:0};

/* ================= 초기화 ================= */
export async function initView(canvas,onProgress){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.background=new THREE.Color('#2f9fd6');
  camera=new THREE.PerspectiveCamera(34,1,5,4000);
  hemi=new THREE.HemisphereLight('#d8efff','#5a7f3a',.95);scene.add(hemi);
  sun=new THREE.DirectionalLight('#fff1d6',2.9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=-170;sc.right=170;sc.top=170;sc.bottom=-170;sc.near=10;sc.far=700;sun.shadow.bias=-.0006;sun.shadow.normalBias=.6;
  scene.add(sun);scene.add(sun.target);
  clock=new THREE.Clock();
  setupLobby();resize();addEventListener('resize',resize);
  await loadAssets(onProgress);
}
export function setQuality(q){quality=q;if(V.grass)for(const g of V.grass)g.visible=q==='high';renderer.setPixelRatio(Math.min(devicePixelRatio||1,q==='high'?2:1.25));renderer.shadowMap.enabled=q==='high';sun.castShadow=q==='high';
  scene.traverse(o=>{if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.needsUpdate=true)}});resize()}
export function resize(){if(!renderer)return;const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='high'?2:1.25));renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.updateProjectionMatrix();if(lobbyCam){lobbyCam.aspect=w/h;lobbyCam.updateProjectionMatrix()}}

function recolorTexture(img,hue,mode){const c=mk(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height),a=d.data;
  const sets={shadow:[[90,200]],chrono:[[90,200]],psy:[[230,345]],volt:[[190,250]]}[mode];
  for(let i=0;i<a.length;i+=4){let r=a[i]/255,gg=a[i+1]/255,b=a[i+2]/255;const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,dd=mx-mn;if(dd<.06)continue;
    const s=dd/(1-Math.abs(2*l-1));let h=mx===r?((gg-b)/dd)%6:mx===gg?(b-r)/dd+2:(r-gg)/dd+4;h*=60;if(h<0)h+=360;
    if(!sets.some(([a1,a2])=>h>=a1&&h<=a2))continue;
    let s2=mode==='volt'?Math.min(1,s*1.8+.25):Math.min(1,s*1.1),l2=mode==='volt'?Math.min(.62,l*1.25):mode==='chrono'?Math.min(.7,l*1.15):l;
    const C=(1-Math.abs(2*l2-1))*s2,X=C*(1-Math.abs((hue/60)%2-1)),m=l2-C/2;let rr,g2,bb;const hh=hue/60;
    if(hh<1)[rr,g2,bb]=[C,X,0];else if(hh<2)[rr,g2,bb]=[X,C,0];else if(hh<3)[rr,g2,bb]=[0,C,X];else if(hh<4)[rr,g2,bb]=[0,X,C];else if(hh<5)[rr,g2,bb]=[X,0,C];else[rr,g2,bb]=[C,0,X];
    a[i]=(rr+m)*255;a[i+1]=(g2+m)*255;a[i+2]=(bb+m)*255}
  g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;return t}

const UPRX=/^(spine|chest|head|upperarm|lowerarm|wrist|hand|handslot|elbowIK|handIK)/;
async function loadAssets(onProgress){
  const loader=new GLTFLoader();let done=0;const list=['anims','shadow','chrono','psy','volt'];const propKeys=[...new Set(Object.values(PROPS).filter(p=>p.m).map(p=>p.m))];const total=list.length+propKeys.length;
  const tick=()=>{done++;onProgress&&onProgress(done/total)};
  const load=u=>new Promise((res,rej)=>loader.load(u,g=>{tick();res(g)},undefined,rej));
  const res=await Promise.all([...list.map(n=>load('assets/'+n+'.glb')),...propKeys.map(n=>load('assets/city/'+n+'.gltf'))]);
  const anim=res[0];
  for(const c of anim.animations){const up=[],lo=[];for(const tr of c.tracks){const node=tr.name.split('.')[0];(UPRX.test(node)?up:lo).push(tr)}
    clips[c.name]={full:c,up:new THREE.AnimationClip(c.name+'_up',c.duration,up),lo:new THREE.AnimationClip(c.name+'_lo',c.duration,lo)}}
  ['shadow','chrono','psy','volt'].forEach((ch,i)=>{const g=res[i+1],sc=g.scene;let tex=null,mat=null;
    sc.traverse(o=>{if(o.isMesh){if(!mat){const m0=o.material;tex=recolorTexture(m0.map.image,CHARS[ch].hue,ch);mat=new THREE.MeshStandardMaterial({map:tex,roughness:.75,metalness:0})}o.material=mat;o.castShadow=true;o.frustumCulled=false}});
    sc.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(sc),h=box.max.y-box.min.y;const k=CHAR_H/h;
    // 헬멧/가방 부착 오프셋 계산 (바인드 포즈 기준)
    const head=sc.getObjectByName('head'),chest=sc.getObjectByName('chest');const hw=new THREE.Vector3();head.getWorldPosition(hw);
    const top=box.max.y;const helmW=new THREE.Vector3(0,hw.y+(top-hw.y)*.48,hw.z);const bagW=new THREE.Vector3();chest.getWorldPosition(bagW);bagW.z-=(top-hw.y)*.42;
    const toLocal=(bone,wp)=>{const lp=bone.worldToLocal(wp.clone());const q=new THREE.Quaternion();bone.getWorldQuaternion(q);return{pos:lp,quat:q.invert()}};
    tpl[ch]={scene:sc,mat,k,helm:toLocal(head,helmW),bag:toLocal(chest,bagW),headR:(top-hw.y)*.62}});
  propKeys.forEach((n,i)=>{const sc=res[list.length+i].scene;const box=new THREE.Box3().setFromObject(sc),c=box.getCenter(new THREE.Vector3());
    sc.position.set(-c.x,-box.min.y,-c.z);const g=new THREE.Group();g.add(sc);sc.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});propTpl[n]={g,size:box.getSize(new THREE.Vector3())}});
}

/* ================= 공용 재료 ================= */
const MAT={};
function softTex(){const c=mk(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function stripeTex(c1,c2,n){const c=mk(64,64),g=c.getContext('2d');for(let i=0;i<n;i++){g.fillStyle=i%2?c2:c1;g.fillRect(i*64/n,0,64/n,64)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function initMats(){if(MAT.soft)return;MAT.soft=softTex();
  MAT.wall=new THREE.MeshStandardMaterial({color:'#f2e6cc',roughness:.9});MAT.wallTop=new THREE.MeshStandardMaterial({color:'#8a5a3c',roughness:.8});
  MAT.trunk=new THREE.MeshStandardMaterial({color:'#7a4e2a',roughness:1});MAT.leaf=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.85,flatShading:true});
  MAT.rock=new THREE.MeshStandardMaterial({color:'#a9aeb8',roughness:.9,flatShading:true});
  MAT.gunDark=new THREE.MeshStandardMaterial({color:'#2a2f3a',roughness:.55,metalness:.2});MAT.gunMid=new THREE.MeshStandardMaterial({color:'#6b7280',roughness:.5,metalness:.4});
  MAT.wood=new THREE.MeshStandardMaterial({color:'#a66a36',roughness:.8});MAT.glowC=new THREE.MeshStandardMaterial({color:'#4ff0ff',emissive:'#4ff0ff',emissiveIntensity:1.5});
  MAT.glowO=new THREE.MeshStandardMaterial({color:'#ff8a3d',emissive:'#ff6a1d',emissiveIntensity:1.2});MAT.red=new THREE.MeshStandardMaterial({color:'#c0392b',roughness:.6});
  MAT.bullet=new THREE.MeshBasicMaterial({color:'#fff2a8'});MAT.flame=new THREE.MeshBasicMaterial({color:'#ff9a3c',transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
  MAT.crate=new THREE.MeshStandardMaterial({map:crateTex(false),roughness:.6});MAT.crateO=new THREE.MeshStandardMaterial({map:crateTex(true),roughness:.7});
  MAT.chute=new THREE.MeshStandardMaterial({map:stripeTex('#ff4a4a','#ffffff',8),side:THREE.DoubleSide,roughness:.8});
  MAT.zone=new THREE.MeshBasicMaterial({map:zoneTex(),color:'#6f9bff',transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
  MAT.ringW=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.85,depthWrite:false});
  MAT.plane=new THREE.MeshStandardMaterial({color:'#e8edf5',roughness:.5,metalness:.2});
  MAT.time={value:0};MAT.waterN=waterNormal();MAT.water=new THREE.MeshStandardMaterial({color:'#2fb4ea',roughness:.12,metalness:.15,normalMap:MAT.waterN,normalScale:new THREE.Vector2(.9,.9),transparent:true,opacity:.92});
  MAT.bush=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.9,flatShading:true});MAT.tileTex=roofTileTex();MAT.ribTex=ribTex();MAT.planeA=new THREE.MeshStandardMaterial({color:'#ff9a3c',roughness:.5});
}
function waterNormal(){const s=128,c=mk(s,s),g=c.getContext('2d'),d=g.createImageData(s,s);const h=(x,y)=>Math.sin(x*.19)*Math.cos(y*.23)+Math.sin((x+y)*.11)*.7+Math.sin(x*.41-y*.17)*.35;
  for(let y=0;y<s;y++)for(let x=0;x<s;x++){const dx=h(x+1,y)-h(x-1,y),dy=h(x,y+1)-h(x,y-1);const i=(y*s+x)*4;d.data[i]=128+dx*50;d.data[i+1]=128+dy*50;d.data[i+2]=255;d.data[i+3]=255}g.putImageData(d,0,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(160,160);return t}
function roofTileTex(){const c=mk(64,64),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,64,64);g.fillStyle='rgba(0,0,0,.16)';for(let y=0;y<64;y+=16){g.fillRect(0,y+13,64,3);for(let x=(y/16%2)*8;x<64;x+=16)g.fillRect(x,y,2,16)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
function ribTex(){const c=mk(32,32),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,32,32);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,32,4);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(0,5,32,2);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
function crateTex(open){const c=mk(64,64),g=c.getContext('2d');g.fillStyle=open?'#6c7a8e':'#3d74d6';g.fillRect(0,0,64,64);g.fillStyle=open?'#8a8f99':'#ffd34d';g.fillRect(0,26,64,12);g.fillRect(26,0,12,64);g.strokeStyle='#1b1330';g.lineWidth=4;g.strokeRect(2,2,60,60);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function zoneTex(){const c=mk(128,64),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.7,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=gr;g.fillRect(0,0,128,64);
  g.globalAlpha=.35;g.fillStyle='#fff';for(let i=0;i<8;i++){g.beginPath();g.moveTo(i*16,64);g.lineTo(i*16+8,0);g.lineTo(i*16+12,0);g.lineTo(i*16+4,64);g.fill()}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(40,1);t.colorSpace=THREE.SRGBColorSpace;return t}

/* ================= 총 모델 ================= */
const GUNS={};
function box(g,mat,sx,sy,sz,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function cyl(g,mat,r,l,x,y,z,seg=8){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,seg),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function gunModel(k){ // +Z 방향이 총구, 손잡이가 원점 (모델 단위)
  const g=new THREE.Group(),D=MAT.gunDark,M=MAT.gunMid,Wd=MAT.wood;
  if(k==='pistol'){box(g,D,.12,.16,.42,0,.08,.14);box(g,D,.1,.26,.12,0,-.06,0)}
  else if(k==='smg'){box(g,D,.14,.18,.6,0,.08,.2);box(g,D,.1,.3,.1,0,-.1,.12);cyl(g,M,.035,.2,0,.1,.58);box(g,M,.08,.08,.22,0,.06,-.18)}
  else if(k==='shotgun'){box(g,Wd,.12,.16,.35,0,.02,-.25);box(g,D,.12,.14,.7,0,.08,.3);cyl(g,M,.045,.55,0,.12,.55);box(g,Wd,.13,.1,.25,0,0,.45)}
  else if(k==='ar'){box(g,D,.12,.2,.35,0,.06,-.22);box(g,D,.14,.2,.62,0,.1,.22);box(g,D,.1,.28,.12,0,-.1,.25);cyl(g,M,.04,.4,0,.12,.7);box(g,M,.06,.08,.2,0,.24,.1)}
  else if(k==='dmr'){box(g,Wd,.12,.18,.38,0,.04,-.25);box(g,D,.13,.16,.8,0,.1,.3);cyl(g,M,.05,.3,0,.26,.18);cyl(g,M,.035,.35,0,.1,.85)}
  else if(k==='sniper'){box(g,Wd,.12,.2,.42,0,.04,-.28);box(g,D,.12,.14,.95,0,.1,.38);cyl(g,M,.055,.4,0,.28,.2);cyl(g,M,.03,.5,0,.1,1.05)}
  else if(k==='flame'){cyl(g,MAT.red,.14,.5,0,.12,-.15,10);box(g,D,.14,.16,.55,0,.08,.25);cyl(g,M,.06,.4,0,.1,.7);const t=cyl(g,MAT.glowO,.05,.06,0,.1,.92)}
  else if(k==='minigun'){box(g,D,.26,.26,.4,0,.08,0);for(let i=0;i<6;i++){const a=i/6*TAU;cyl(g,M,.035,.8,Math.cos(a)*.09,.1+Math.sin(a)*.09,.55,6)}box(g,D,.08,.3,.1,0,-.12,-.05);g.userData.spin=true}
  else if(k==='rail'){box(g,D,.14,.2,.4,0,.05,-.25);box(g,new THREE.MeshStandardMaterial({color:'#3b4a66',roughness:.4,metalness:.5}),.18,.22,.9,0,.1,.35);box(g,MAT.glowC,.05,.05,.85,0,.23,.35);box(g,MAT.glowC,.2,.03,.03,0,.1,.82)}
  return g}
function getGun(k){if(!GUNS[k])GUNS[k]=gunModel(k);return GUNS[k].clone()}

/* ================= 아이템 3D 모델 ================= */
const IGEO={};
function mm(c,o={}){return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55},o))}
function part(g,geo,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;g.add(m);return m}
function itemModel(key){const g=new THREE.Group();
  if(key.startsWith('w_')){const gun=gunModel(key.slice(2));gun.scale.setScalar(10);gun.rotation.y=Math.PI/2;g.add(gun);g.userData.gun=true;return g}
  if(key.startsWith('a_')){const c=L.AMMO[key.slice(2)].c;part(g,new THREE.BoxGeometry(8,4.5,5.5),mm('#6b6a3a'),0,2.25,0);part(g,new THREE.BoxGeometry(8.2,1.2,5.7),mm(c),0,3,0);
    for(let i=-1;i<=1;i++){part(g,new THREE.CylinderGeometry(.7,.7,3.2,10),mm('#e0b44a',{metalness:.6,roughness:.3}),i*2.2,6.1,0);part(g,new THREE.ConeGeometry(.7,1.4,10),mm(c,{metalness:.5,roughness:.3}),i*2.2,8.4,0)}return g}
  if(key==='h_bandage'){part(g,new THREE.CylinderGeometry(2.6,2.6,5,16),mm('#f6eedb'),0,2.6,0,0,0,Math.PI/2);part(g,new THREE.CylinderGeometry(1,1,5.2,12),mm('#d8c8a0'),0,2.6,0,0,0,Math.PI/2);part(g,new THREE.BoxGeometry(3,.3,2.4),mm('#f6eedb'),0,.15,2.5);return g}
  if(key==='h_medkit'){part(g,new THREE.BoxGeometry(8,5.5,5.5),mm('#ffffff'),0,2.75,0);part(g,new THREE.BoxGeometry(1.6,.4,4.4),mm('#ff4a4a'),0,5.6,0);part(g,new THREE.BoxGeometry(4.4,.4,1.6),mm('#ff4a4a'),0,5.6,0);
    part(g,new THREE.BoxGeometry(1.4,4.4,.3),mm('#ff4a4a'),0,2.75,2.8);part(g,new THREE.BoxGeometry(4.4,1.4,.3),mm('#ff4a4a'),0,2.75,2.8);part(g,new THREE.TorusGeometry(1.4,.35,6,12,Math.PI),mm('#555'),0,5.6,0);return g}
  if(key==='h_drink'){part(g,new THREE.CylinderGeometry(2,2,6.5,16),mm('#3d8bff',{metalness:.5,roughness:.3}),0,3.25,0);part(g,new THREE.CylinderGeometry(2.05,2.05,2.2,16),mm('#ffd34d'),0,3.4,0);part(g,new THREE.CylinderGeometry(1.7,2,.6,16),mm('#cfd5de',{metalness:.7}),0,6.8,0);return g}
  if(key.startsWith('ar_helm')){const lv=+key.slice(-1),m=mm(L.LVC[lv],{metalness:.3,roughness:.45});part(g,new THREE.SphereGeometry(4,18,10,0,TAU,0,Math.PI/2),m,0,1,0);part(g,new THREE.CylinderGeometry(4.4,4.5,.8,20),m,0,1,0);if(lv===3)part(g,new THREE.BoxGeometry(5,1.2,1),mm('#60e0ff',{emissive:'#30b0ff',emissiveIntensity:.8}),0,2.4,3.6);return g}
  if(key.startsWith('ar_vest')){const lv=+key.slice(-1),m=mm(L.LVC[lv],{roughness:.7});part(g,new THREE.BoxGeometry(7,8,3),m,0,4.5,0);part(g,new THREE.BoxGeometry(5.6,5,.6),mm(lv===3?'#2a2440':'#5a6070',{metalness:.4}),0,4.8,1.7);
    part(g,new THREE.BoxGeometry(1.6,2,3.2),m,-2.6,9,0);part(g,new THREE.BoxGeometry(1.6,2,3.2),m,2.6,9,0);for(let i=-1;i<=1;i++)part(g,new THREE.BoxGeometry(1.6,1.8,.8),mm('#3b3f4a'),i*2,2.4,1.8);return g}
  if(key.startsWith('bag')){const lv=+key.slice(-1),c=['','#b07a45','#4f8a5a','#3a3350'][lv],m=mm(c,{roughness:.8});part(g,new THREE.BoxGeometry(6,7+lv*.6,4),m,0,4,0);part(g,new THREE.BoxGeometry(6.2,2.6,4.3),mm(c,{roughness:.6}),0,7+lv*.3,0);
    part(g,new THREE.BoxGeometry(4,3,1.2),m,0,3,2.4);part(g,new THREE.TorusGeometry(1.4,.35,6,12,Math.PI),mm('#333'),0,8.3+lv*.3,0);return g}
  if(key.startsWith('mod')){const lv=+key.slice(-1);part(g,new THREE.CylinderGeometry(4,4,1.8,6),mm('#7a4fe0',{metalness:.5,roughness:.3}),0,4,0,Math.PI/2);part(g,new THREE.CylinderGeometry(2.4,2.4,2.2,6),mm('#c9a8ff',{emissive:'#a070ff',emissiveIntensity:1.2}),0,4,0,Math.PI/2);
    for(let i=0;i<lv;i++)part(g,new THREE.SphereGeometry(.55,8,6),mm('#ffd34d',{emissive:'#ffb000',emissiveIntensity:1}),(i-(lv-1)/2)*1.6,.9,1.2);return g}
  part(g,new THREE.BoxGeometry(5,5,5),mm('#fff'),0,2.5,0);return g}
function getItemModel(key){if(!IGEO[key])IGEO[key]=itemModel(key);return IGEO[key].clone()}
const ALLKEYS=()=>[...Object.keys(WD).map(k=>'w_'+k),...Object.keys(L.AMMO).map(k=>'a_'+k),'h_bandage','h_medkit','h_drink',...[1,2,3].flatMap(l=>['ar_helm'+l,'ar_vest'+l,'bag'+l,'mod'+l])];
export function makeIcons(target){initMats();let r2;try{const c=mk(160,160);r2=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,preserveDrawingBuffer:true});r2.setSize(160,160,false);r2.outputColorSpace=THREE.SRGBColorSpace;r2.toneMapping=THREE.ACESFilmicToneMapping;
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#6a5a9a',1.6));const d=new THREE.DirectionalLight('#fff',2.4);d.position.set(3,6,5);sc.add(d);const cam=new THREE.PerspectiveCamera(28,1,.1,500);
    const ol=outlineMat(.18);
    for(const k of ALLKEYS()){const m=itemModel(k);if(m.userData.gun){m.rotation.y=0}else m.rotation.y=-.55;const grp=new THREE.Group();grp.add(m);
      m.traverse(o=>{if(o.isMesh){const e=new THREE.Mesh(o.geometry,ol);o.add(e)}});
      sc.add(grp);grp.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(grp),ctr=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());const rad=Math.max(sz.x,sz.y,sz.z)*.62;
      const dir=m.userData.gun?new THREE.Vector3(0,.35,1):new THREE.Vector3(.2,.75,1);cam.position.copy(ctr).add(dir.normalize().multiplyScalar(rad/Math.tan(14*Math.PI/180)));cam.lookAt(ctr);
      r2.setClearColor(0,0);r2.render(sc,cam);target[k]=c.toDataURL();sc.remove(grp)}
  }catch(e){console.warn('icon render failed',e)}finally{if(r2){r2.dispose();r2.forceContextLoss&&r2.forceContextLoss()}}}

/* ================= 캐릭터 뷰 ================= */
class CharView{
  constructor(ch,opt={}){const T=tpl[ch];this.ch=ch;this.root=new THREE.Group();this.model=SkeletonUtils.clone(T.scene);this.model.scale.setScalar(T.k);this.root.add(this.model);
    this.mats=[];this.model.traverse(o=>{if(o.isMesh){const m=T.mat.clone();if(opt.ghost){m.transparent=true;m.opacity=.45;m.color.set('#bfefff');m.emissive=new THREE.Color('#3fb8ff');m.emissiveIntensity=.6}o.material=m;this.mats.push(m);o.castShadow=!opt.ghost}});
    this.mixer=new THREE.AnimationMixer(this.model);this.cur={up:null,lo:null,full:null};
    this.hand=this.model.getObjectByName('handslotr');this.head=this.model.getObjectByName('head');this.chest=this.model.getObjectByName('chest');
    this.hats=[];this.model.traverse(o=>{if(/Hat|Cape/.test(o.name))this.hats.push(o)});
    this.gunKey=null;this.gun=null;this.helmLv=0;this.helm=null;this.bagLv=0;this.bagM=null;this.flashT=0;this.opacity=1;this.dead=false;
    if(!opt.noRing){this.ring=new THREE.Mesh(new THREE.RingGeometry(6.2,7.4,32),new THREE.MeshBasicMaterial({color:'#5dff7a',transparent:true,opacity:.85,depthWrite:false}));this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.3;this.root.add(this.ring)}
    this.chute=null;this.hp=null;this.hpVal=-1;
    this.outlines=[];if(!opt.ghost){const olm=outlineMat(.045);this.model.traverse(o=>{if(o.isSkinnedMesh&&!o.userData.ol){const e=new THREE.SkinnedMesh(o.geometry,olm);e.userData.ol=1;e.bind(o.skeleton,o.bindMatrix);e.frustumCulled=false;o.parent.add(e);this.outlines.push(e)}})}
    if(!opt.noRing){this.aura=new THREE.Mesh(new THREE.RingGeometry(8,10.5,40),new THREE.MeshBasicMaterial({color:CHARS[ch].c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));this.aura.rotation.x=-Math.PI/2;this.aura.position.y=.5;this.root.add(this.aura);
      this.stars=new THREE.Group();for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.OctahedronGeometry(2.2),new THREE.MeshBasicMaterial({color:'#ffe14d'}));s.position.set(Math.cos(i/3*TAU)*5,0,Math.sin(i/3*TAU)*5);this.stars.add(s)}this.stars.position.y=CHAR_H+3;this.stars.visible=false;this.root.add(this.stars)}}
  play(part,name,o={}){const c=clips[name];if(!c)return;const clip=part==='full'?c.full:c[part];if(this.cur[part]===name&&!o.restart)return;
    const prev=this.cur[part]?this.mixer.existingAction(part==='full'?clips[this.cur[part]].full:clips[this.cur[part]][part]):null;
    const a=this.mixer.clipAction(clip);a.reset();a.setLoop(o.once?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=!!o.once;a.timeScale=o.speed||1;a.enabled=true;a.setEffectiveWeight(1);a.fadeIn(o.fade??.15).play();
    if(prev&&prev!==a)prev.fadeOut(o.fade??.15);this.cur[part]=name;
    if(part==='full'){for(const p of['up','lo'])if(this.cur[p]){this.mixer.existingAction(clips[this.cur[p]][p])?.fadeOut(.15);this.cur[p]=null}}
    else if(this.cur.full){this.mixer.existingAction(clips[this.cur.full].full)?.fadeOut(.15);this.cur.full=null}}
  setGun(k){if(k===this.gunKey)return;this.gunKey=k;if(this.gun){this.hand.remove(this.gun);this.gun=null}if(k){this.gun=getGun(k);this.hand.add(this.gun)}}
  setHelm(lv){if(lv===this.helmLv)return;this.helmLv=lv;if(this.helm){this.head.remove(this.helm);this.helm=null}for(const h of this.hats)if(/Hat/.test(h.name))h.visible=!lv;
    if(lv){const T=tpl[this.ch],r=T.headR,g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:LVC[lv],roughness:.55,metalness:.2});
      const d=new THREE.Mesh(new THREE.SphereGeometry(r,16,10,0,TAU,0,Math.PI/2),m);d.castShadow=true;g.add(d);const b=new THREE.Mesh(new THREE.CylinderGeometry(r*1.08,r*1.1,r*.12,18),m);g.add(b);
      g.position.copy(T.helm.pos);g.quaternion.copy(T.helm.quat);this.helm=g;this.head.add(g)}}
  setBag(lv){if(lv===this.bagLv)return;this.bagLv=lv;if(this.bagM){this.chest.remove(this.bagM);this.bagM=null}
    if(lv){const T=tpl[this.ch],s=T.headR,g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:['','#b07a45','#4f8a5a','#3a3350'][lv],roughness:.8});
      const b=new THREE.Mesh(new THREE.BoxGeometry(s*1.4,s*(1.3+lv*.2),s*.7),m);b.castShadow=true;g.add(b);g.position.copy(T.bag.pos);g.quaternion.copy(T.bag.quat);this.bagM=g;this.chest.add(g)}}
  setChute(on,color){if(on&&!this.chute){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.SphereGeometry(16,18,8,0,TAU,0,Math.PI/2.4),MAT.chute);c.position.y=30;c.scale.y=.55;c.castShadow=true;g.add(c);
      const lm=new THREE.LineBasicMaterial({color:'#333'});const pts=[];for(let i=0;i<6;i++){const a=i/6*TAU;pts.push(new THREE.Vector3(Math.cos(a)*14,30,Math.sin(a)*14),new THREE.Vector3(0,12,0))}
      g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),lm));this.chute=g;this.root.add(g)}
    if(this.chute)this.chute.visible=on}
  setFlash(t){this.flashT=t}
  setOpacity(o){if(Math.abs(o-this.opacity)<.01)return;this.opacity=o;for(const m of this.mats){m.transparent=o<.99;m.opacity=o;m.depthWrite=o>.99}for(const e of this.outlines)e.visible=o>.99}
  update(dt){this.mixer.update(dt);if(this.flashT>0){this.flashT-=dt;const v=Math.max(0,this.flashT)*8;for(const m of this.mats){m.emissive.setRGB(v,v,v)}}else if(this.flashT>-1){this.flashT=-2;for(const m of this.mats)m.emissive.setRGB(0,0,0)}
    if(this.gun&&this.gun.userData.spin&&this.spin)this.gun.children.forEach((c,i)=>{if(i>0&&i<7){const a=(i-1)/6*TAU+performance.now()/1000*this.spin*30;c.position.x=Math.cos(a)*.09;c.position.y=.1+Math.sin(a)*.09}})}
  dispose(){this.root.parent&&this.root.parent.remove(this.root);this.mixer.stopAllAction()}}

function hpSprite(){const c=mk(64,12);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(18,3.4,1);s.renderOrder=10;s.userData={c,t};return s}
function drawHp(s,hp){const{c,t}=s.userData,g=c.getContext('2d');g.clearRect(0,0,64,12);g.fillStyle='#1b1330';g.beginPath();g.roundRect(0,0,64,12,5);g.fill();g.fillStyle=hp>40?'#58e06b':'#ff5b5b';g.beginPath();g.roundRect(2,2,Math.max(2,60*hp/100),8,4);g.fill();t.needsUpdate=true}

/* ================= 월드 구축 ================= */
function disposeObj(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose()})}
export function clearWorld(){if(V.world){scene.remove(V.world);disposeObj(V.world)}for(const c of V.chunks){if(c.tex)c.tex.dispose();if(c.low)c.low.dispose()}
  for(const cv of V.chars.values())cv.dispose();V.chars.clear();V.items.clear();V.drops.clear();V.barriers.clear();for(const d of V.decoys.values())d.dispose();V.decoys.clear();V.chunks=[];V.roofs=[];V.fx=[];V.bigProps=[];V.hiddenTrees=[];V.smoke=[];V.grass=[]}
export function outlineMat(t){const m=new THREE.MeshBasicMaterial({color:'#1b1330',side:THREE.BackSide});m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed += normalize(normal)*'+t.toFixed(4)+';')};m.customProgramCacheKey=()=>'ol'+t.toFixed(4);return m}
function colGeo(geo,c){geo=geo.index?geo.toNonIndexed():geo;const col=new THREE.Color(c),n=geo.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b}geo.setAttribute('color',new THREE.BufferAttribute(a,3));if(geo.getAttribute('uv'))geo.deleteAttribute('uv');return geo}
function bx(w,h,d,x,y,z,c,ry){const g=new THREE.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);return colGeo(g,c)}
function cy_(r1,r2,h,x,y,z,c,seg=12,rx=0){const g=new THREE.CylinderGeometry(r1,r2,h,seg);if(rx)g.rotateX(rx);g.translate(x,y,z);return colGeo(g,c)}
function merge(parts){return mergeGeometries(parts)}
const PROC_GEO={
  container:()=>{const P=[bx(14,15,34,0,7.5,0,'#ffffff')];for(let z=-15;z<=15;z+=3){P.push(bx(14.8,14,.8,0,7.5,z,'#d9d9d9'))}P.push(bx(14.6,.8,34.6,0,15,0,'#cfcfcf'));return merge(P)},
  crate:()=>{const P=[bx(8,8,8,0,4,0,'#c98b4a')];for(const[x,z]of[[-3.6,-3.6],[3.6,-3.6],[-3.6,3.6],[3.6,3.6]])P.push(bx(1.2,8.2,1.2,x,4,z,'#8a5a2a'));P.push(bx(8.3,1.2,8.3,0,7.6,0,'#8a5a2a'));P.push(bx(8.3,1.2,8.3,0,.6,0,'#8a5a2a'));return merge(P)},
  hay:()=>merge([cy_(5,5,7,0,3.5,0,'#e6c24a',16),cy_(4.2,4.2,.4,0,7.1,0,'#f2d77a',16),cy_(5.05,5.05,1,0,2.5,0,'#c9a032',16),cy_(5.05,5.05,1,0,5,0,'#c9a032',16)]),
  sandbag:()=>{const P=[];for(let r=0;r<3;r++)for(let i=0;i<5;i++){const x=-9.6+i*4.8+(r%2?2.4:0);if(x>10)continue;const g=new THREE.CapsuleGeometry(1.8,2.4,3,8);g.rotateZ(Math.PI/2);g.scale(1,.75,1.3);g.translate(x,1.4+r*2.2,0);P.push(colGeo(g,r%2?'#cdb57f':'#bfa56c'))}return merge(P)},
  barrel:()=>merge([cy_(3,3,8,0,4,0,'#ffffff',14),cy_(3.15,3.15,.7,0,1.2,0,'#bbbbbb',14),cy_(3.15,3.15,.7,0,6.8,0,'#bbbbbb',14),cy_(2.4,2.4,.3,0,8.1,0,'#999999',14)]),
  fence:()=>merge([bx(1.4,6,1.4,-13,3,0,'#8a5a2a'),bx(1.4,6,1.4,0,3,0,'#8a5a2a'),bx(1.4,6,1.4,13,3,0,'#8a5a2a'),bx(28,1,.8,0,4.6,0,'#b07a45'),bx(28,1,.8,0,2.2,0,'#b07a45')]),
  tent:()=>{const sh=new THREE.Shape();sh.moveTo(-11,0);sh.lineTo(0,11);sh.lineTo(11,0);sh.lineTo(-11,0);const g=new THREE.ExtrudeGeometry(sh,{depth:16,bevelEnabled:false});g.translate(0,0,-8);const g2=new THREE.PlaneGeometry(5,8);g2.translate(0,4,8.05);return merge([colGeo(g,'#ffffff'),colGeo(g2,'#3a2a1a')])},
};
const PROC_COL={container:['#d64545','#3d74d6','#3fa35a','#e08a2e','#8a5ad6'],barrel:['#d64545','#3d74d6','#3fa35a','#e0b42e'],tent:['#5f8f4a','#d68a3d','#3d7fd6']};
export function buildWorld(){initMats();clearWorld();const world=new THREE.Group();V.world=world;scene.add(world);
  // 물
  const water=new THREE.Mesh(new THREE.PlaneGeometry(W*4,W*4),MAT.water);water.rotation.x=-Math.PI/2;water.position.set(W/2,-1.2,W/2);water.receiveShadow=true;world.add(water);
  const bed=new THREE.Mesh(new THREE.PlaneGeometry(W,W),new THREE.MeshBasicMaterial({color:'#1e7fb8'}));bed.rotation.x=-Math.PI/2;bed.position.set(W/2,-3,W/2);world.add(bed);
  // 지면 청크 (저해상도 미리 생성)
  const n=W/CH,geo=new THREE.PlaneGeometry(CH,CH);
  for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){const low=new THREE.CanvasTexture(paintChunk(ix,iy,96));low.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:low,roughness:.95,alphaTest:.5}));m.rotation.x=-Math.PI/2;m.position.set(ix*CH+CH/2,0,iy*CH+CH/2);m.receiveShadow=true;world.add(m);V.chunks.push({ix,iy,m,tex:null,low,u:0})}
  // 벽 (건물마다 색) + 창문
  const wg=[],tg=[],win=[],frm=[];
  for(const o of S.obs)if(o.wall){const b=o.b,wh=b.kind==='warehouse'?17:WALL_H;wg.push(bx(o.w,wh,o.h,o.x+o.w/2,wh/2,o.y+o.h/2,b.wc));tg.push(bx(o.w+.6,1.2,o.h+.6,o.x+o.w/2,wh+.6,o.y+o.h/2,b.kind==='warehouse'?'#6b7280':'#8a5a3c'));
    wg.push(bx(o.w+.3,2,o.h+.3,o.x+o.w/2,1,o.y+o.h/2,b.kind==='warehouse'?'#8b94a0':'#b89a78'));
    const L=Math.max(o.w,o.h),hz=o.w>o.h;if(b.kind!=='warehouse'&&L>=18){const nW=Math.floor((L-6)/15);for(let i=0;i<nW;i++){const t=(i+.5)/nW*L-L/2,cx=o.x+o.w/2+(hz?t:0),cz=o.y+o.h/2+(hz?0:t);
        frm.push(bx(hz?7.6:o.w+.7,6,hz?o.h+.7:7.6,cx,7.4,cz,'#ffffff'));win.push(bx(hz?6:o.w+1,4.4,hz?o.h+1:6,cx,7.4,cz,'#5d8fc9'))}}
    if(b.kind==='warehouse'&&o.w>o.h){for(let x=o.x+4;x<o.x+o.w-2;x+=6)wg.push(bx(.8,16,o.h+.8,x,8,o.y+o.h/2,'#a5afbb'))}
    if(b.kind==='warehouse'&&o.h>o.w){for(let z=o.y+4;z<o.y+o.h-2;z+=6)wg.push(bx(o.w+.8,16,.8,o.x+o.w/2,8,z,'#a5afbb'))}}
  const vm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
  if(wg.length){const wm=new THREE.Mesh(merge(wg),vm);wm.castShadow=wm.receiveShadow=true;world.add(wm);const tm=new THREE.Mesh(merge(tg),vm);tm.castShadow=true;world.add(tm)}
  if(win.length){world.add(new THREE.Mesh(merge(frm),vm));world.add(new THREE.Mesh(merge(win),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.15,metalness:.4,emissive:'#1d3a66',emissiveIntensity:.35})))}
  // 지붕
  for(const b of S.buildings){const m=new THREE.MeshStandardMaterial({color:b.roof,roughness:.7,flatShading:true,transparent:true,opacity:1,map:b.kind==='warehouse'?MAT.ribTex:MAT.tileTex});const g=b.kind==='warehouse'?flatRoof(b):roofGeo(b);const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;world.add(mesh);V.roofs.push({b,mesh,m})}
  // 절차 소품 (인스턴스)
  const mt=new THREE.Matrix4(),q=new THREE.Quaternion(),col=new THREE.Color(),one=new THREE.Vector3(1,1,1);
  const byKey={};for(const p of S.props)if(PROPS[p.key].proc)(byKey[p.key]=byKey[p.key]||[]).push(p);
  for(const k in byKey){const L2=byKey[k],im=new THREE.InstancedMesh(PROC_GEO[k](),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,flatShading:k==='tent'}),L2.length);im.castShadow=im.receiveShadow=true;
    L2.forEach((p,i)=>{q.setFromAxisAngle(UPV,p.rot*Math.PI/2);mt.compose(new THREE.Vector3(p.x,0,p.y),q,one);im.setMatrixAt(i,mt);const pal=PROC_COL[k];col.set(pal?pal[p.v%pal.length]:'#ffffff');im.setColorAt(i,col)});world.add(im)}
  // 나무: 둥근 나무 + 침엽수, 외곽선
  const trunkG=new THREE.CylinderGeometry(1.3,1.9,9,7);trunkG.translate(0,4.5,0);
  const kinds={round:{geo:canopyGeo(),list:[]},pine:{geo:pineGeo(),list:[]}};S.trees.forEach((t,i)=>{t.kind=t.pine?'pine':'round';t.ki=kinds[t.kind].list.length;kinds[t.kind].list.push(t)});
  const trunks=new THREE.InstancedMesh(trunkG,MAT.trunk,S.trees.length);trunks.castShadow=true;
  S.trees.forEach((t,i)=>{const s=t.r/12;q.setFromAxisAngle(UPV,t.rot);mt.compose(new THREE.Vector3(t.x,0,t.y),q,new THREE.Vector3(s,s,s));trunks.setMatrixAt(i,mt)});world.add(trunks);
  V.trees={};for(const k in kinds){const K=kinds[k],can=new THREE.InstancedMesh(K.geo,MAT.leaf,K.list.length);can.castShadow=true;can.receiveShadow=true;
    K.list.forEach((t,i)=>{const s=t.r/12;q.setFromAxisAngle(UPV,t.rot);mt.compose(new THREE.Vector3(t.x,0,t.y),q,new THREE.Vector3(s,s,s));can.setMatrixAt(i,mt);
      if(k==='pine')col.setHSL(.36+(i%5)*.01,.5,.2+(i%4)*.02);else col.setHSL(.27+(i%7)*.013,.62,.27+(i%5)*.025);can.setColorAt(i,col)});
    world.add(can);const ol=new THREE.InstancedMesh(K.geo,outlineMat(.45),K.list.length);ol.instanceMatrix=can.instanceMatrix;world.add(ol);V.trees[k]={can,ol,geo:K.geo}}
  V.canopyPool=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(kinds.round.geo,new THREE.MeshStandardMaterial({color:'#3f8a33',transparent:true,opacity:.35,flatShading:true,depthWrite:false}));m.visible=false;world.add(m);V.canopyPool.push(m)}
  // 수풀
  if(S.bushes.length){const bg=new THREE.IcosahedronGeometry(1,1);bg.translate(0,.35,0);const bm=new THREE.InstancedMesh(bg,MAT.bush,S.bushes.length);bm.castShadow=true;bm.receiveShadow=true;
    S.bushes.forEach((b,i)=>{q.setFromAxisAngle(UPV,b.rot);mt.compose(new THREE.Vector3(b.x,0,b.y),q,new THREE.Vector3(b.r,b.r*.75,b.r));bm.setMatrixAt(i,mt);col.setHSL(.3+(i%6)*.012,.62,.22+(i%4)*.025);bm.setColorAt(i,col)});
    world.add(bm);const ol=new THREE.InstancedMesh(bg,outlineMat(.07),S.bushes.length);ol.instanceMatrix=bm.instanceMatrix;world.add(ol)}
  // 바위
  const rocks=S.obs.filter(o=>o.rock);const rg=new THREE.DodecahedronGeometry(1,0);const rm=new THREE.InstancedMesh(rg,MAT.rock,rocks.length);rm.castShadow=rm.receiveShadow=true;
  rocks.forEach((o,i)=>{q.setFromEuler(new THREE.Euler(o.v*.1,o.v*.37,o.v*.05));mt.compose(new THREE.Vector3(o.x,o.r*.35,o.y),q,new THREE.Vector3(o.r*1.05,o.r*.8,o.r*1.05));rm.setMatrixAt(i,mt);col.setHSL(.1,.06,.55+(o.v%5)*.04);rm.setColorAt(i,col)});world.add(rm);
  const rol=new THREE.InstancedMesh(rg,outlineMat(.07),rocks.length);rol.instanceMatrix=rm.instanceMatrix;world.add(rol);
  // 풀잎 (그래픽 높음에서만)
  buildGrass(world);
  // 도시 소품 (KayKit)
  for(const p of S.props){const P=PROPS[p.key];if(P.proc)continue;const T=propTpl[P.m];if(!T)continue;const o=T.g.clone();const sx=P.w/T.size.x,sz=P.d/T.size.z,sy=P.h/T.size.y;o.scale.set(sx,sy,sz);o.rotation.y=p.rot*Math.PI/2;o.position.set(p.x,0,p.y);
    if(!p.big)o.traverse(c=>{if(c.isMesh)c.castShadow=P.h>8});world.add(o);if(p.big)V.bigProps.push({p,o,mats:null,f:1})}
  // 총알/불꽃/파티클
  V.bulletsMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),MAT.bullet,400);V.bulletsMesh.frustumCulled=false;world.add(V.bulletsMesh);
  V.flameMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),MAT.flame,300);V.flameMesh.frustumCulled=false;world.add(V.flameMesh);
  V.parts=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:'#ffffff'}),400);V.parts.frustumCulled=false;V.parts.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(1200),3);world.add(V.parts);V.partList=[];
  // 자기장
  V.zoneWall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,90,128,1,true),MAT.zone);V.zoneWall.position.y=45;V.zoneWall.renderOrder=5;world.add(V.zoneWall);
  V.zoneRing=new THREE.Mesh(new THREE.RingGeometry(.985,1,128),MAT.ringW);V.zoneRing.rotation.x=-Math.PI/2;V.zoneRing.position.y=.6;world.add(V.zoneRing);
  V.plane=planeModel();world.add(V.plane);
  V.flashLight=new THREE.PointLight('#ffcc66',0,60,2);world.add(V.flashLight);
  setQuality(quality);
}
function buildGrass(world){V.grass=[];const blade=[];for(let i=0;i<3;i++){const a=i/3*Math.PI;const g=new THREE.BufferGeometry();const w=.9,h=3.2;
    const v=new Float32Array([-w*Math.cos(a),0,-w*Math.sin(a), w*Math.cos(a),0,w*Math.sin(a), 0,h,0]);g.setAttribute('position',new THREE.BufferAttribute(v,3));
    g.setAttribute('color',new THREE.BufferAttribute(new Float32Array([.16,.42,.08,.16,.42,.08,.42,.78,.2]),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array([0,1,0,0,1,0,0,1,0]),3));blade.push(g)}
  const geo=merge(blade);const mat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});mat.customProgramCacheKey=()=>'grass';
  mat.onBeforeCompile=sh=>{sh.uniforms.uTime=MAT.time;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vec4 wp0=instanceMatrix*vec4(0.,0.,0.,1.); float sw=sin(uTime*2.2+wp0.x*.05+wp0.z*.07)*.5+sin(uTime*3.7+wp0.x*.13)*.2; transformed.x+=sw*position.y*.35; transformed.z+=sw*position.y*.2;')};
  const RG=6,RS=W/RG,mt=new THREE.Matrix4(),q=new THREE.Quaternion(),R=L.mulberry32(S.seed+77);
  for(let gy=0;gy<RG;gy++)for(let gx=0;gx<RG;gx++){const pts=[];for(let i=0;i<1400;i++){const x=gx*RS+R()*RS,y=gy*RS+R()*RS,t=L.tileAt(x,y);if(t!==L.G&&t!==L.DG&&t!==L.FA)continue;if(L.solidAt(x,y))continue;pts.push([x,y,R()])}
    if(!pts.length)continue;const im=new THREE.InstancedMesh(geo,mat,pts.length);pts.forEach((p,i)=>{q.setFromAxisAngle(UPV,p[2]*6.28);const s=.7+p[2]*.8;mt.compose(new THREE.Vector3(p[0],0,p[1]),q,new THREE.Vector3(s,s,s));im.setMatrixAt(i,mt)});
    im.computeBoundingSphere();world.add(im);V.grass.push(im)}}
function flatRoof(b){const e=2,y=17+1.2,parts=[bx(b.w+e*2,1.6,b.h+e*2,b.x+b.w/2,y+.8,b.y+b.h/2,'#ffffff')];const g=merge(parts);g.deleteAttribute('color');
  const uv=g.getAttribute('uv');if(!uv){const n=g.getAttribute('position').count;g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2),2))}
  const pos=g.getAttribute('position'),u=new Float32Array(pos.count*2);for(let i=0;i<pos.count;i++){u[i*2]=pos.getX(i)/8;u[i*2+1]=pos.getZ(i)/8}g.setAttribute('uv',new THREE.BufferAttribute(u,2));return g}
function roofGeo(b){const e=3,x0=b.x-e,x1=b.x+b.w+e,z0=b.y-e,z1=b.y+b.h+e,y=WALL_H+1.2,rise=Math.min(b.w,b.h)*.28;const alongX=b.w>=b.h;const v=[],uv=[];
  const P=(x,yy,z)=>{v.push(x,yy,z);uv.push(alongX?x/10:z/10,(alongX?Math.abs(z-(z0+z1)/2):Math.abs(x-(x0+x1)/2))/6+yy/6)};const tri=(a,b2,c)=>{P(...a);P(...b2);P(...c)};
  if(alongX){const zm=(z0+z1)/2,A=[x0,y,z0],B=[x1,y,z0],C=[x1,y,z1],D=[x0,y,z1],E=[x0,y+rise,zm],F=[x1,y+rise,zm];
    tri(A,E,F);tri(A,F,B);tri(D,C,F);tri(D,F,E);tri(A,D,E);tri(B,F,C)}
  else{const xm=(x0+x1)/2,A=[x0,y,z0],B=[x1,y,z0],C=[x1,y,z1],D=[x0,y,z1],E=[xm,y+rise,z0],F=[xm,y+rise,z1];
    tri(A,D,F);tri(A,F,E);tri(B,E,F);tri(B,F,C);tri(A,E,B);tri(D,C,F)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g}
function canopyGeo(){const parts=[];const R=(s)=>new THREE.IcosahedronGeometry(s,1);
  const a=R(10);a.translate(0,16,0);a.scale(1,.85,1);parts.push(a);const b=R(7);b.translate(5,19,-3);parts.push(b);const c=R(6.5);c.translate(-5,18.5,3);parts.push(c);const d=R(5.5);d.translate(1,23,1);parts.push(d);
  const g=mergeGeometries(parts);g.computeVertexNormals();return g}
function pineGeo(){const parts=[];[[10,9,11],[8,8,17],[5.5,7,22.5]].forEach(([r,h,y])=>{const c=new THREE.ConeGeometry(r,h,8);c.translate(0,y,0);parts.push(c.toNonIndexed())});const g=mergeGeometries(parts);g.computeVertexNormals();return g}
function planeModel(){const g=new THREE.Group();const f=new THREE.Mesh(new THREE.CapsuleGeometry(6,40,6,12),MAT.plane);f.rotation.z=Math.PI/2;g.add(f);
  const w=new THREE.Mesh(new THREE.BoxGeometry(12,1.5,70),MAT.plane);g.add(w);const t=new THREE.Mesh(new THREE.BoxGeometry(8,12,1.5),MAT.planeA);t.position.set(-22,7,0);g.add(t);
  const t2=new THREE.Mesh(new THREE.BoxGeometry(8,1.2,26),MAT.plane);t2.position.set(-22,2,0);g.add(t2);
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.CylinderGeometry(3,3,10,10),MAT.planeA);e.rotation.z=Math.PI/2;e.position.set(4,-2,s*18);g.add(e);const pr=new THREE.Mesh(new THREE.BoxGeometry(.6,14,1.4),MAT.gunDark);pr.position.set(9.5,-2,s*18);pr.userData.prop=1;g.add(pr)}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}

/* ================= 청크 텍스처 스트리밍 ================= */
function streamChunks(cx,cy,rad){const px=quality==='high'?768:512;let made=0;
  for(const c of V.chunks){const mx=c.ix*CH+CH/2,my=c.iy*CH+CH/2,d=Math.max(Math.abs(mx-cx),Math.abs(my-cy));
    if(d<rad){c.u=performance.now();if(!c.tex&&made<2){const cv=paintChunk(c.ix,c.iy,px);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());c.tex=t;c.m.material.map=t;c.m.material.needsUpdate=true;made++}}
    else if(c.tex&&d>rad+500){c.m.material.map=c.low;c.m.material.needsUpdate=true;c.tex.dispose();c.tex=null}}}
export function prewarm(x,y){for(let i=0;i<20;i++)streamChunks(x,y,320)}

/* ================= 효과 ================= */
function addPart(x,y,z,c,n,sp=1,life=.45,size=1.1,grav=60){for(let i=0;i<n;i++){if(V.partList.length>=400)V.partList.shift();const a=Math.random()*TAU,v=(20+Math.random()*50)*sp;V.partList.push({x,y,z,vx:Math.cos(a)*v,vy:(20+Math.random()*40)*sp,vz:Math.sin(a)*v,life:life*(.6+Math.random()*.6),c:new THREE.Color(c),s:size,g:grav})}}
function addSmoke(x,y,z,c,life,size,vy=14){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:MAT.soft,color:c,transparent:true,depthWrite:false,opacity:.7}));sp.position.set(x,y,z);sp.scale.setScalar(size);V.world.add(sp);V.smoke.push({sp,life,max:life,size,vy,vx:(Math.random()-.5)*6,vz:(Math.random()-.5)*6})}
function addRing(x,y,r,c){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,1,y);V.world.add(m);V.fx.push({o:m,t:'ring',r,life:.5,max:.5})}
function addBeam(x1,y1,x2,y2,c,w,life,h=9){const d=hyp(x2-x1,y2-y1);const m=new THREE.Mesh(new THREE.CylinderGeometry(w,w,d,6),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.position.set((x1+x2)/2,h,(y1+y2)/2);m.quaternion.setFromUnitVectors(UPV,_v.set(x2-x1,0,y2-y1).normalize());V.world.add(m);V.fx.push({o:m,t:'fade',life,max:life})}
function addBolt(x1,y1,x2,y2,c){let px=x1,py=y1;for(let i=1;i<=6;i++){const t=i/6,nx=x1+(x2-x1)*t+(i<6?(Math.random()-.5)*14:0),ny=y1+(y2-y1)*t+(i<6?(Math.random()-.5)*14:0);addBeam(px,py,nx,ny,c,.7,.35,8);px=nx;py=ny}}
export function handleEvents(evs,sfx){const me=S.me;
  for(const e of evs){switch(e.t){
    case 'shot':{const p=e.p;if(p&&p.alive){const d=WD[e.k];if(d){const[mx,my]=L.muzzle(p,d);if(e.k!=='flame'){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:MAT.soft,color:e.k==='rail'?'#7ff6ff':'#ffd27a',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.set(mx,9,my);s.scale.setScalar(e.k==='rail'?14:7);V.world.add(s);V.fx.push({o:s,t:'fade',life:.06,max:.06})}
          if(p===me||hyp(p.x-me.x,p.y-me.y)<140){V.flashLight.position.set(mx,10,my);V.flashLight.intensity=e.k==='flame'?30:60}
          if(e.k==='rail'){const[ex,ey]=[p.x+Math.cos(p.ang)*d.rng,p.y+Math.sin(p.ang)*d.rng];addBeam(mx,my,ex,ey,'#6ff4ff',1.2,.35)}
          if(p===me&&(e.k==='sniper'||e.k==='rail'||e.k==='shotgun'))cam.shake=Math.max(cam.shake,e.k==='shotgun'?.35:.5)}}break}
    case 'hit':addPart(e.x,9,e.y,'#ff5a5a',5,1,.4,1.1);{const cv=V.chars.get(e.p.id);cv&&cv.setFlash(.12)}break;
    case 'spark':addPart(e.x,8,e.y,e.c,3,.8,.3,.8);break;
    case 'ring':addRing(e.x,e.y,e.r,e.c);break;
    case 'trail':addBeam(e.x1,e.y1,e.x2,e.y2,e.c,2.2,.5,6);break;
    case 'beam':addBeam(e.x1,e.y1,e.x2,e.y2,e.c,1.3,.4);break;
    case 'bolt':addBolt(e.x1,e.y1,e.x2,e.y2,e.c);break;
    case 'die':addPart(e.p.x,8,e.p.y,CHARS[e.p.ch].c,16,1.3,.7,1.4);addRing(e.p.x,e.p.y,18,'#ffffff');break;
    case 'dust':for(let i=0;i<8;i++)addSmoke(e.x+(Math.random()-.5)*20,3,e.y+(Math.random()-.5)*20,'#e8dcc0',1.2,14,4);break;
    case 'land':for(let i=0;i<5;i++)addSmoke(me.x+(Math.random()-.5)*12,2,me.y+(Math.random()-.5)*12,'#e8dcc0',.9,10,3);break;
    case 'hurt':if(!e.zone)cam.shake=Math.max(cam.shake,.35);break;
    case 'stun':addPart(e.p.x,12,e.p.y,'#ffe14d',8,1,.5,1);break;
    case 'skill':{const p=e.p;addRing(p.x,p.y,24,CHARS[p.ch].c);addPart(p.x,10,p.y,CHARS[p.ch].c,14,1.2,.6,1.3,20);break}
  }}}

/* ================= 게임 렌더 ================= */
let gtimeV=0;
export function renderGame(dt){gtimeV+=dt;const me=S.me;if(!me||!V.world)return;
  // 카메라
  let tx=me.x,ty=me.y,dist=1,th=0;const w=L.curW(me);
  if(me.ph==='plane'){tx=S.plane.x;ty=S.plane.y;dist=2.6;th=L.ALT}else if(me.ph==='fall'||me.ph==='chute'){dist=1.35+me.z/L.ALT*1.1;th=me.z*.6}else if(w&&WD[w.k].scope&&me.alive)dist=WD[w.k].scope;
  if(!me.alive){dist=1.15}
  cam.x+=(tx-cam.x)*Math.min(1,dt*6);cam.y+=(ty-cam.y)*Math.min(1,dt*6);cam.dist+=(dist-cam.dist)*Math.min(1,dt*3);cam.th=(cam.th||0)+(th-(cam.th||0))*Math.min(1,dt*4);
  const D=188*cam.dist,ang=56*Math.PI/180;let sx=0,sz=0;if(cam.shake>0){cam.shake-=dt;sx=(Math.random()-.5)*cam.shake*6;sz=(Math.random()-.5)*cam.shake*6}
  camera.position.set(cam.x+sx,cam.th+D*Math.sin(ang),cam.y+D*Math.cos(ang)+sz);camera.lookAt(cam.x+sx,cam.th,cam.y+sz);
  sun.position.set(cam.x-120,320,cam.y+160);sun.target.position.set(cam.x,0,cam.y);
  streamChunks(cam.x,cam.y,quality==='high'?450:360);
  // 비행기
  const pl=S.plane;V.plane.visible=!pl.done;if(!pl.done){V.plane.position.set(pl.x,L.ALT+22,pl.y);V.plane.rotation.y=-pl.ang;V.plane.children.forEach(c=>{if(c.userData.prop)c.rotation.x+=dt*40})}
  // 지붕/큰 건물 페이드
  const inB=me.ph==='ground'?L.bldAt(me.x,me.y):null;
  for(const r of V.roofs){const tgt=r.b===inB?0:1;r.m.opacity+=(tgt-r.m.opacity)*Math.min(1,dt*8);r.mesh.visible=r.m.opacity>.03;r.m.depthWrite=r.m.opacity>.95}
  for(const bp of V.bigProps){const p=bp.p,occl=me.ph==='ground'&&p.y>me.y-4&&p.y-me.y<90&&Math.abs(p.x-me.x)<p.sw/2+14;const tgt=occl?.28:1;
    if(Math.abs(bp.f-tgt)>.01||bp.mats){if(!bp.mats){bp.mats=[];bp.o.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.material.transparent=true;bp.mats.push(c.material)}})}bp.f+=(tgt-bp.f)*Math.min(1,dt*6);for(const m of bp.mats){m.opacity=bp.f;m.depthWrite=bp.f>.95}}}
  // 나무 캐노피 페이드
  for(const h of V.hiddenTrees){const t=S.trees[h],s=t.r/12,T=V.trees[t.kind];_q.setFromAxisAngle(UPV,t.rot);_m.compose(_v.set(t.x,0,t.y),_q,_s.set(s,s,s));T.can.setMatrixAt(t.ki,_m);T.can.instanceMatrix.needsUpdate=true}V.hiddenTrees=[];
  let pi=0;if(me.ph==='ground')for(let i=0;i<S.trees.length&&pi<V.canopyPool.length;i++){const t=S.trees[i];const dx=t.x-me.x,dy=t.y-me.y;if(dx*dx+dy*dy<(t.r+10)*(t.r+10)||(dy>0&&dy<26&&Math.abs(dx)<t.r+4)){
      const T=V.trees[t.kind];_m.makeScale(0,0,0);T.can.setMatrixAt(t.ki,_m);T.can.instanceMatrix.needsUpdate=true;V.hiddenTrees.push(i);const m=V.canopyPool[pi++];m.geometry=T.geo;m.visible=true;const s=t.r/12;m.position.set(t.x,0,t.y);m.rotation.y=t.rot;m.scale.setScalar(s)}}
  for(;pi<V.canopyPool.length;pi++)V.canopyPool[pi].visible=false;
  MAT.time.value=gtimeV;MAT.waterN.offset.set(gtimeV*.012,gtimeV*.008);
  syncChars(dt);syncItems();syncDrops(dt);syncBarriers();syncDecoys(dt);syncBullets();
  // 자기장
  const z=S.zone;V.zoneWall.scale.set(Math.max(z.r,1),1,Math.max(z.r,1));V.zoneWall.position.set(z.cx,45,z.cy);MAT.zone.map.offset.x=gtimeV*.02;
  V.zoneRing.visible=z.state!=='done'&&z.tr>1;V.zoneRing.scale.set(z.tr,z.tr,1);V.zoneRing.position.set(z.tx,.6,z.ty);
  // 파티클
  const P=V.parts;let n=0;for(let i=V.partList.length-1;i>=0;i--){const q=V.partList[i];q.life-=dt;if(q.life<=0){V.partList.splice(i,1);continue}q.vy-=q.g*dt;q.x+=q.vx*dt;q.y=Math.max(.3,q.y+q.vy*dt);q.z+=q.vz*dt;q.vx*=.96;q.vz*=.96;
    _m.compose(_v.set(q.x,q.y,q.z),_q.identity(),_s.setScalar(q.s*Math.min(1,q.life*4)));P.setMatrixAt(n,_m);P.setColorAt(n,q.c);n++}P.count=n;P.instanceMatrix.needsUpdate=true;if(P.instanceColor)P.instanceColor.needsUpdate=true;
  for(let i=V.smoke.length-1;i>=0;i--){const s=V.smoke[i];s.life-=dt;const k=1-s.life/s.max;if(s.life<=0){V.world.remove(s.sp);s.sp.material.dispose();V.smoke.splice(i,1);continue}s.sp.position.y+=s.vy*dt;s.sp.position.x+=s.vx*dt;s.sp.position.z+=s.vz*dt;s.sp.scale.setScalar(s.size*(1+k*1.4));s.sp.material.opacity=.7*(1-k)}
  for(let i=V.fx.length-1;i>=0;i--){const f=V.fx[i];f.life-=dt;const k=Math.max(0,f.life/f.max);if(f.life<=0){V.world.remove(f.o);f.o.geometry&&f.o.geometry.dispose&&f.o.geometry!==undefined&&!(f.o.isSprite)&&f.o.geometry.dispose();f.o.material.dispose();V.fx.splice(i,1);continue}
    if(f.t==='ring'){const r=f.r*(1.25-k*.5);f.o.scale.set(r,r,r);f.o.material.opacity=k}else f.o.material.opacity=k}
  V.flashLight.intensity*=Math.pow(.001,dt*6);
  renderer.render(scene,camera)}

function syncChars(dt){const me=S.me,alive=new Set();
  for(const p of S.players){if(p.ph==='plane'){continue}
    if(!p.alive&&S.gtime-p.deathT>4){continue}
    alive.add(p.id);let cv=V.chars.get(p.id);
    if(!cv){cv=new CharView(p.ch);V.world.add(cv.root);V.chars.set(p.id,cv);cv.ring.material.color.set(p===me?'#5dff7a':'#ff5a5a');cv.hp=hpSprite();cv.hp.position.y=24;cv.root.add(cv.hp)}
    const near=hyp(p.x-cam.x,p.y-cam.y)<(p.ph==='ground'?360:900);cv.root.visible=near;if(!near)continue;
    cv.root.position.set(p.x,p.z||0,p.y);
    const face=Math.atan2(Math.cos(p.ang),Math.sin(p.ang));let dy=face-cv.root.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));cv.root.rotation.y+=dy*Math.min(1,dt*18);
    const w=L.curW(p);cv.setGun(p.alive&&p.ph==='ground'?(w?w.k:null):null);cv.setHelm(p.helm);cv.setBag(p.bag);cv.spin=p.spin;
    cv.ring.visible=p.alive&&p.ph==='ground';cv.setChute(p.ph==='chute');
    {const B=p.buff,act=p.alive&&p.ph==='ground'&&((B.tight>0)||(B.steady>0)||(B.sure>0)||(B.over>0)||(B.haste>0&&p.ch==='chrono'));cv.aura.material.opacity=act?.55+.3*Math.sin(gtimeV*10):0;if(act){const sc=1+.08*Math.sin(gtimeV*6);cv.aura.scale.set(sc,sc,sc)}
     cv.stars.visible=p.alive&&p.stunT>0;if(cv.stars.visible)cv.stars.rotation.y+=dt*8}
    // 투명도
    let op=1;if(p!==me&&p.alive&&L.stealthed(p)&&hyp(p.x-me.x,p.y-me.y)>40)op=.3;else if(p===me&&L.stealthed(me))op=.6;cv.setOpacity(op);
    if(p.flash>0&&cv.flashT<=0)cv.setFlash(.1);
    // hp
    const showHp=p!==me&&p.alive&&p.hitT>0&&p.ph==='ground';cv.hp.visible=showHp;if(showHp&&Math.round(p.hp)!==cv.hpVal){cv.hpVal=Math.round(p.hp);drawHp(cv.hp,p.hp)}
    // 애니메이션
    if(!p.alive){if(!cv.dead){cv.dead=true;cv.play('full','Death_A',{once:true,fade:.1})}}
    else if(p.ph==='fall'){cv.play('full','Jump_Idle');cv.model.rotation.x=.5}
    else if(p.ph==='chute'){cv.play('full','Jump_Idle');cv.model.rotation.x=0}
    else{cv.model.rotation.x=0;
      if(p.landT>.3)cv.play('full','Jump_Land',{once:true});
      else{const gun=!!w,one=w&&(w.k==='pistol');
        let lo='Idle';if(p.moving){const rel=angDiff2(Math.atan2(p.mdy,p.mdx),p.ang);if(Math.abs(rel)<.8)lo='Running_A';else if(Math.abs(rel)>2.3)lo='Walking_Backwards';else lo=rel>0?'Running_Strafe_Right':'Running_Strafe_Left'}
        let up;if(p.opening)up='Interact';else if(p.healT>0)up='Use_Item';else if(p.skillT>0)up='Spellcast_Raise';else if(p.punch>0)up='Unarmed_Melee_Attack_Punch_A';
        else if(p.rl>0)up=one?'1H_Ranged_Reload':'2H_Ranged_Reload';else if(gun)up=p.shotT>0||p.charge>0?(one?'1H_Ranged_Shooting':'2H_Ranged_Shooting'):(one?'1H_Ranged_Aiming':'2H_Ranged_Aiming');
        else up=p.moving?'Running_A':'Unarmed_Idle';
        if(!gun&&!p.moving&&lo==='Idle')lo='Unarmed_Idle';
        cv.play('lo',lo);cv.play('up',up,{once:up==='Unarmed_Melee_Attack_Punch_A'||up==='Spellcast_Raise'})}}
    cv.update(dt)}
  for(const[id,cv]of V.chars)if(!alive.has(id)){cv.dispose();V.chars.delete(id)}}
const angDiff2=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};

const ringGeo=new THREE.RingGeometry(6.5,7.8,28),discGeo=new THREE.CircleGeometry(7,24),beamGeo=new THREE.CylinderGeometry(1.4,1.4,60,10,1,true);
function syncItems(){const seen=new Set(),me=S.me,inB=me?L.bldAt(me.x,me.y):null;
  for(const it of S.items){if(hyp(it.x-cam.x,it.y-cam.y)>330)continue;seen.add(it.id);let o=V.items.get(it.id);
    const key=L.iconKey(it),rar=L.rarity(it);
    if(!o||o.key!==key){if(o)V.world.remove(o.g);const g=new THREE.Group();const c=RARC[rar];
      const disc=new THREE.Mesh(discGeo,new THREE.MeshBasicMaterial({color:rar?c:CATC[it.k],transparent:true,opacity:.3,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.y=.35;g.add(disc);
      const rg=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:rar?c:'#ffffff',transparent:true,opacity:.95,depthWrite:false}));rg.rotation.x=-Math.PI/2;rg.position.y=.4;g.add(rg);
      const m=getItemModel(key);m.scale.multiplyScalar(1.25);const holder=new THREE.Group();holder.add(m);holder.position.y=2.5;g.add(holder);
      if(rar>=2){const b=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:rar===3?.35:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));b.position.y=30;b.scale.set(rar===3?1.6:1,1,rar===3?1.6:1);g.add(b)}
      V.world.add(g);o={g,holder,disc,key,ph:Math.random()*6};V.items.set(it.id,o)}
    o.g.position.set(it.x,0,it.y);o.holder.rotation.y+=.016;o.holder.position.y=3+Math.sin(gtimeV*2.5+o.ph)*1;o.disc.material.opacity=.22+.12*Math.sin(gtimeV*4+o.ph);
    const ib=L.bldAt(it.x,it.y);o.g.visible=!(ib&&ib!==inB)}
  for(const[id,o]of V.items)if(!seen.has(id)){V.world.remove(o.g);V.items.delete(id)}}
function syncDrops(dt){for(const d of S.drops){let o=V.drops.get(d.id);
    if(!o){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(16,14,16),MAT.crate);b.position.y=7;b.castShadow=b.receiveShadow=true;g.add(b);
      const ch=new THREE.Group();const c=new THREE.Mesh(new THREE.SphereGeometry(20,18,8,0,TAU,0,Math.PI/2.4),MAT.chute);c.position.y=44;c.scale.y=.6;c.castShadow=true;ch.add(c);
      const pts=[];for(let i=0;i<8;i++){const a=i/8*TAU;pts.push(new THREE.Vector3(Math.cos(a)*17,42,Math.sin(a)*17),new THREE.Vector3(0,14,0))}ch.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#333'})));g.add(ch);
      V.world.add(g);o={g,b,ch,smokeT:0};V.drops.set(d.id,o)}
    o.g.position.set(d.x,d.z*180,d.y);o.ch.visible=!d.landed;o.g.rotation.z=d.landed?0:Math.sin(gtimeV*1.5)*.08;
    if(d.opened&&o.b.material!==MAT.crateO)o.b.material=MAT.crateO;
    if(d.landed&&!d.opened){o.smokeT-=dt;if(o.smokeT<=0&&hyp(d.x-cam.x,d.y-cam.y)<500){o.smokeT=.14;addSmoke(d.x+(Math.random()-.5)*4,14,d.y+(Math.random()-.5)*4,'#ff4a4a',3.2,9,22)}}}}
function syncBarriers(){const seen=new Set();for(const b of S.barriers){seen.add(b.id);let o=V.barriers.get(b.id);
    if(!o){const m=new THREE.Mesh(new THREE.BoxGeometry(b.len,18,1.6),new THREE.MeshStandardMaterial({color:'#ff8ccb',emissive:'#f06aa8',emissiveIntensity:.9,transparent:true,opacity:.45,depthWrite:false}));
      const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:'#ffe0f0'}));m.add(e);V.world.add(m);o={m};V.barriers.set(b.id,o)}
    o.m.position.set(b.x,9,b.y);o.m.rotation.y=Math.atan2(b.nx,b.ny)+Math.PI/2+Math.PI/2;o.m.rotation.y=-Math.atan2(b.ny,b.nx)+Math.PI/2;o.m.material.opacity=.45*Math.min(1,b.t/.3)}
  for(const[id,o]of V.barriers)if(!seen.has(id)){V.world.remove(o.m);o.m.geometry.dispose();V.barriers.delete(id)}}
function syncDecoys(dt){const seen=new Set();for(const d of S.decoys){if(!d.alive)continue;seen.add(d.id);let cv=V.decoys.get(d.id);
    if(!cv){cv=new CharView(d.ch,{ghost:true,noRing:true});cv.setGun(d.w);cv.setHelm(d.helm);cv.play('lo','Idle');cv.play('up','2H_Ranged_Aiming');V.world.add(cv.root);V.decoys.set(d.id,cv)}
    cv.root.position.set(d.x,0,d.y);cv.root.rotation.y=Math.atan2(Math.cos(d.ang),Math.sin(d.ang));cv.update(dt)}
  for(const[id,cv]of V.decoys)if(!seen.has(id)){cv.dispose();V.decoys.delete(id)}}
function syncBullets(){const B=V.bulletsMesh,F=V.flameMesh;let n=0,f=0;
  for(const b of S.bullets){if(hyp(b.x-cam.x,b.y-cam.y)>400)continue;
    if(b.flame){if(f>=300)continue;const k=1-b.left/b.max;_m.compose(_v.set(b.x,8+k*4,b.y),_q.setFromEuler(_e.set(k*3,k*5,0)),_s.setScalar(1.5+k*4.5));F.setMatrixAt(f++,_m);continue}
    if(n>=400)continue;const sp=hyp(b.vx,b.vy),len=Math.min(14,sp*.018);_q.setFromUnitVectors(_v.set(0,0,1),_s.set(b.vx/sp,0,b.vy/sp));
    _m.compose(_v.set(b.x-b.vx/sp*len/2,9,b.y-b.vy/sp*len/2),_q,_s.set(b.k==='rail'?1.6:.8,b.k==='rail'?1.6:.8,len));B.setMatrixAt(n++,_m)}
  B.count=n;B.instanceMatrix.needsUpdate=true;F.count=f;F.instanceMatrix.needsUpdate=true;F.material.opacity=.8}

export function screenPos(x,y,h){_v.set(x,h,y).project(camera);return[(_v.x+1)/2*innerWidth,(1-_v.y)/2*innerHeight,_v.z<1]}

/* ================= 로비 ================= */
let lobbyChar=null,lobbyKey=null,lobbyT=0;
function setupLobby(){lobbyScene=new THREE.Scene();lobbyScene.background=new THREE.Color('#3b6fe0');
  lobbyCam=new THREE.PerspectiveCamera(30,1,1,500);lobbyCam.position.set(0,13,62);lobbyCam.lookAt(0,9,0);
  lobbyScene.add(new THREE.HemisphereLight('#ffffff','#5a4a9a',1.6));const d=new THREE.DirectionalLight('#fff1d6',2.6);d.position.set(20,40,30);d.castShadow=true;d.shadow.mapSize.set(1024,1024);lobbyScene.add(d);
  const rim=new THREE.DirectionalLight('#9fd8ff',1.6);rim.position.set(-30,20,-30);lobbyScene.add(rim);
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(16,18,3,48),new THREE.MeshStandardMaterial({color:'#ffd34d',roughness:.6}));plat.position.y=-1.5;plat.receiveShadow=true;lobbyScene.add(plat);
  const plat2=new THREE.Mesh(new THREE.CylinderGeometry(20,22,2,48),new THREE.MeshStandardMaterial({color:'#2a1f55',roughness:.8}));plat2.position.y=-3.5;lobbyScene.add(plat2);
  const rg=new THREE.Mesh(new THREE.TorusGeometry(19,.4,8,64),new THREE.MeshBasicMaterial({color:'#ffffff'}));rg.rotation.x=Math.PI/2;rg.position.y=-2.4;lobbyScene.add(rg)}
export function renderLobby(dt,ch,gunKey,xOff){if(!tpl[ch])return;if(lobbyKey!==ch){if(lobbyChar)lobbyChar.dispose();lobbyChar=new CharView(ch,{noRing:true});lobbyChar.setGun(gunKey);lobbyScene.add(lobbyChar.root);lobbyKey=ch;lobbyChar.play('full','Cheer',{once:true});lobbyT=2.2}
  lobbyT-=dt;if(lobbyT<=0&&lobbyChar.cur.full!=='Idle'){lobbyChar.play('lo','Idle');lobbyChar.play('up','2H_Ranged_Aiming')}
  lobbyChar.root.rotation.y=Math.sin(performance.now()/2600)*.5+.25;lobbyChar.update(dt);
  lobbyCam.position.set(-(xOff||0),14,78);lobbyCam.lookAt(-(xOff||0),10,0);
  const sc=renderer.shadowMap.enabled;renderer.render(lobbyScene,lobbyCam)}
export function renderBlank(){renderer.render(lobbyScene,lobbyCam)}
