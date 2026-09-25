import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import * as L from './logic.js';
import {paintChunk,CH,mk} from './art2d.js';
const {S,W,TAU,hyp,clamp,WD,CHARS,CATC,RARC,LVC,PROPS,groundH}=L;

let renderer,scene,camera,sun,hemi,sky,lobbyScene,lobbyCam;
let quality='high';
const CHAR_H=1.8;
const tpl={},clips={},propTpl={};
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_v2=new THREE.Vector3(),_s=new THREE.Vector3(),_e=new THREE.Euler(),UPV=new THREE.Vector3(0,1,0),XV=new THREE.Vector3(1,0,0);
const V={chunks:[],cgroups:[],chars:new Map(),items:new Map(),drops:new Map(),barriers:new Map(),fields:new Map(),stops:new Map(),doors:[],roofs:[],fx:[],smoke:[],partList:[],bigProps:[],world:null};
export const cam={yaw:0,pitch:-.12,fov:62,scope:1,shake:0,kickAcc:0,ads:false,scoped:false,cx:0,cy:0,cz:0,fx:1,fy:0,fz:0,aimPt:null,aimHit:null,hideMe:false};
const FOG={high:[70,330],low:[50,210]};

/* ================= 초기화 ================= */
export async function initView(canvas,onProgress){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  scene=new THREE.Scene();scene.background=new THREE.Color('#bfe0f5');scene.fog=new THREE.Fog('#c6e3f5',70,330);
  sky=new THREE.Mesh(new THREE.SphereGeometry(900,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color('#3d8ee6')},hor:{value:new THREE.Color('#d2ebfa')}},
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 top;uniform vec3 hor;varying vec3 vP;void main(){float h=clamp(vP.y*1.6,0.,1.);gl_FragColor=vec4(mix(hor,top,pow(h,.7)),1.);}'}));scene.add(sky);
  camera=new THREE.PerspectiveCamera(62,1,.06,1300);
  hemi=new THREE.HemisphereLight('#e2f2ff','#6b8f4e',1.05);scene.add(hemi);
  sun=new THREE.DirectionalLight('#fff0d8',2.7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  const sc=sun.shadow.camera;sc.left=-26;sc.right=26;sc.top=26;sc.bottom=-26;sc.near=1;sc.far=260;sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;
  scene.add(sun);scene.add(sun.target);
  setupLobby();resize();addEventListener('resize',resize);
  await loadAssets(onProgress);
}
export function setQuality(q){quality=q;sun.castShadow=q==='high';renderer.shadowMap.enabled=q==='high';const f=FOG[q];scene.fog.near=f[0];scene.fog.far=f[1];
  scene.traverse(o=>{if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.needsUpdate=true)}});resize()}
let resScale=1;export function setResScale(v){v=clamp(v,.55,1);if(Math.abs(v-resScale)<.02)return;resScale=v;resize()}export function getResScale(){return resScale}
export function resize(){if(!renderer)return;const w=innerWidth,h=innerHeight;const maxW=quality==='high'?1700:1150;renderer.setPixelRatio(Math.min(devicePixelRatio||1,maxW/w)*resScale);renderer.setSize(w,h,false);
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
  const loader=new GLTFLoader();let done=0;const ANIMS=['anim_General','anim_MovementBasic','anim_MovementAdvanced','anim_CombatRanged','anim_CombatMelee','anim_Simulation'];const list=[...ANIMS,'shadow','chrono','psy','volt'];const propKeys=[...new Set(Object.values(PROPS).filter(p=>p.m).map(p=>p.m))];const total=list.length+propKeys.length;
  const tick=()=>{done++;onProgress&&onProgress(done/total)};
  const load=u=>new Promise((res,rej)=>loader.load(u,g=>{tick();res(g)},undefined,rej));
  const res=await Promise.all([...list.map(n=>load('assets/'+n+'.glb')),...propKeys.map(n=>load('assets/city/'+n+'.gltf'))]);
  for(let ai=0;ai<ANIMS.length;ai++)for(const c of res[ai].animations){const up=[],lo=[];for(const tr of c.tracks){const node=tr.name.split('.')[0];(UPRX.test(node)?up:lo).push(tr)}
    clips[c.name]={full:c,up:new THREE.AnimationClip(c.name+'_up',c.duration,up),lo:new THREE.AnimationClip(c.name+'_lo',c.duration,lo)}}
  ['shadow','chrono','psy','volt'].forEach((ch,i)=>{const sc=res[ANIMS.length+i].scene;let mat=null;
    sc.traverse(o=>{if(o.isMesh){if(!mat){mat=new THREE.MeshStandardMaterial({map:recolorTexture(o.material.map.image,CHARS[ch].hue,ch),roughness:.75,metalness:0})}o.material=mat;o.castShadow=true;o.frustumCulled=false}});
    sc.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(sc),h=box.max.y-box.min.y,k=CHAR_H/h;
    const head=sc.getObjectByName('head'),chest=sc.getObjectByName('chest');const hw=new THREE.Vector3();head.getWorldPosition(hw);
    const top=box.max.y;const helmW=new THREE.Vector3(0,hw.y+(top-hw.y)*.48,hw.z);const bagW=new THREE.Vector3();chest.getWorldPosition(bagW);bagW.z-=(top-hw.y)*.34;
    const toLocal=(bone,wp)=>{const lp=bone.worldToLocal(wp.clone());const q=new THREE.Quaternion();bone.getWorldQuaternion(q);return{pos:lp,quat:q.invert()}};
    tpl[ch]={scene:sc,mat,k,helm:toLocal(head,helmW),bag:toLocal(chest,bagW),headR:(top-hw.y)*.56}});
  propKeys.forEach((n,i)=>{const sc=res[list.length+i].scene;const box=new THREE.Box3().setFromObject(sc),c=box.getCenter(new THREE.Vector3());
    sc.position.set(-c.x,-box.min.y,-c.z);const g=new THREE.Group();g.add(sc);sc.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});propTpl[n]={g,size:box.getSize(new THREE.Vector3())}});
}

/* ================= 재료 ================= */
const MAT={};
function tex(c,rep){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}
function softTex(){const c=mk(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tex(c)}
function stripeTex(c1,c2,n){const c=mk(64,64),g=c.getContext('2d');for(let i=0;i<n;i++){g.fillStyle=i%2?c2:c1;g.fillRect(i*64/n,0,64/n,64)}return tex(c)}
function waterNormal(){const s=128,c=mk(s,s),g=c.getContext('2d'),d=g.createImageData(s,s);const h=(x,y)=>Math.sin(x*.19)*Math.cos(y*.23)+Math.sin((x+y)*.11)*.7+Math.sin(x*.41-y*.17)*.35;
  for(let y=0;y<s;y++)for(let x=0;x<s;x++){const dx=h(x+1,y)-h(x-1,y),dy=h(x,y+1)-h(x,y-1);const i=(y*s+x)*4;d.data[i]=128+dx*50;d.data[i+1]=128+dy*50;d.data[i+2]=255;d.data[i+3]=255}g.putImageData(d,0,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(300,300);return t}
function roofTileTex(){const c=mk(64,64),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,64,64);g.fillStyle='rgba(0,0,0,.16)';for(let y=0;y<64;y+=16){g.fillRect(0,y+13,64,3);for(let x=(y/16%2)*8;x<64;x+=16)g.fillRect(x,y,2,16)}return tex(c,1)}
function ribTex(){const c=mk(32,32),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,32,32);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,32,4);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(0,5,32,2);return tex(c,1)}
function crateTex(open){const c=mk(64,64),g=c.getContext('2d');g.fillStyle=open?'#6c7a8e':'#3d74d6';g.fillRect(0,0,64,64);g.fillStyle=open?'#8a8f99':'#ffd34d';g.fillRect(0,26,64,12);g.fillRect(26,0,12,64);g.strokeStyle='#1b1330';g.lineWidth=4;g.strokeRect(2,2,60,60);return tex(c)}
function zoneTex(){const c=mk(128,64),g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,0,128,64);g.globalAlpha=.5;g.fillStyle='#fff';for(let i=0;i<8;i++){g.beginPath();g.moveTo(i*16,64);g.lineTo(i*16+8,0);g.lineTo(i*16+12,0);g.lineTo(i*16+4,64);g.fill()}
  const t=tex(c,1);t.repeat.set(120,6);return t}
function hexTex(){const c=mk(64,64),g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,64,64);g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2;
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){const cx=x*22+(y%2)*11,cy=y*19;g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;i?g.lineTo(cx+Math.cos(a)*10,cy+Math.sin(a)*10):g.moveTo(cx+Math.cos(a)*10,cy+Math.sin(a)*10)}g.closePath();g.stroke()}return tex(c,1)}
function initMats(){if(MAT.soft)return;MAT.soft=softTex();
  MAT.trunk=new THREE.MeshStandardMaterial({color:'#7a4e2a',roughness:1});MAT.leaf=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.85,flatShading:true});
  MAT.rock=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.9,flatShading:true});MAT.bush=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.9,flatShading:true});
  MAT.gunDark=new THREE.MeshStandardMaterial({color:'#2a2f3a',roughness:.55,metalness:.2});MAT.gunMid=new THREE.MeshStandardMaterial({color:'#6b7280',roughness:.5,metalness:.4});
  MAT.wood=new THREE.MeshStandardMaterial({color:'#a66a36',roughness:.8});MAT.glowC=new THREE.MeshStandardMaterial({color:'#4ff0ff',emissive:'#4ff0ff',emissiveIntensity:1.5});
  MAT.glowO=new THREE.MeshStandardMaterial({color:'#ff8a3d',emissive:'#ff6a1d',emissiveIntensity:1.2});MAT.red=new THREE.MeshStandardMaterial({color:'#c0392b',roughness:.6});
  MAT.bullet=new THREE.MeshBasicMaterial({color:'#fff2a8',fog:false});MAT.flame=new THREE.MeshBasicMaterial({color:'#ff9a3c',transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
  MAT.crate=new THREE.MeshStandardMaterial({map:crateTex(false),roughness:.6});MAT.crateO=new THREE.MeshStandardMaterial({map:crateTex(true),roughness:.7});
  MAT.chute=new THREE.MeshStandardMaterial({map:stripeTex('#ff4a4a','#ffffff',8),side:THREE.DoubleSide,roughness:.8});
  MAT.zone=new THREE.MeshBasicMaterial({map:zoneTex(),color:'#5f8dff',transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false,fog:false});
  MAT.plane=new THREE.MeshStandardMaterial({color:'#e8edf5',roughness:.5,metalness:.2});MAT.planeA=new THREE.MeshStandardMaterial({color:'#ff9a3c',roughness:.5});
  MAT.time={value:0};MAT.waterN=waterNormal();MAT.water=new THREE.MeshStandardMaterial({color:'#2fa9e0',roughness:.1,metalness:.2,normalMap:MAT.waterN,normalScale:new THREE.Vector2(.8,.8),transparent:true,opacity:.86});
  MAT.tileTex=roofTileTex();MAT.ribTex=ribTex();MAT.hexB=hexTex();MAT.hexF=hexTex();MAT.hexS=hexTex();MAT.hexB.repeat.set(3,2);MAT.hexF.repeat.set(3,3);MAT.hexS.repeat.set(6,3);
  MAT.door=new THREE.MeshStandardMaterial({color:'#9a6333',roughness:.7});MAT.metal=new THREE.MeshStandardMaterial({color:'#8c96a3',roughness:.5,metalness:.4});
  MAT.vc=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
}
export function outlineMat(t,xray){const m=new THREE.MeshBasicMaterial({color:xray?'#ff3b3b':'#1b1330',side:THREE.BackSide,depthTest:!xray,transparent:!!xray});m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed += normalize(normal)*'+t.toFixed(4)+';')};m.customProgramCacheKey=()=>'ol'+t.toFixed(4)+(xray?'x':'');return m}

/* ================= 총 모델 (손잡이 원점, +Z 총구) ================= */
const GUNS={};
function box(g,mat,sx,sy,sz,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function cyl(g,mat,r,l,x,y,z,seg=8){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,seg),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function gunModel(k){initMats();const g=new THREE.Group(),D=MAT.gunDark,M=MAT.gunMid,Wd=MAT.wood;let tip=.6;
  if(k==='pistol'){box(g,D,.12,.16,.42,0,.08,.14);box(g,D,.1,.26,.12,0,-.06,0);tip=.36}
  else if(k==='smg'){box(g,D,.14,.18,.6,0,.08,.2);box(g,D,.1,.3,.1,0,-.1,.12);cyl(g,M,.035,.2,0,.1,.58);box(g,M,.08,.08,.22,0,.06,-.18);tip=.68}
  else if(k==='shotgun'){box(g,Wd,.12,.16,.35,0,.02,-.25);box(g,D,.12,.14,.7,0,.08,.3);cyl(g,M,.045,.55,0,.12,.55);box(g,Wd,.13,.1,.25,0,0,.45);tip=.83}
  else if(k==='ar'){box(g,D,.12,.2,.35,0,.06,-.22);box(g,D,.14,.2,.62,0,.1,.22);box(g,D,.1,.28,.12,0,-.1,.25);cyl(g,M,.04,.4,0,.12,.7);box(g,M,.06,.08,.2,0,.24,.1);tip=.9}
  else if(k==='dmr'){box(g,Wd,.12,.18,.38,0,.04,-.25);box(g,D,.13,.16,.8,0,.1,.3);cyl(g,M,.05,.3,0,.26,.18);cyl(g,M,.035,.35,0,.1,.85);tip=1.02}
  else if(k==='sniper'){box(g,Wd,.12,.2,.42,0,.04,-.28);box(g,D,.12,.14,.95,0,.1,.38);cyl(g,M,.055,.4,0,.28,.2);cyl(g,M,.03,.5,0,.1,1.05);tip=1.3}
  else if(k==='flame'){cyl(g,MAT.red,.14,.5,0,.12,-.15,10);box(g,D,.14,.16,.55,0,.08,.25);cyl(g,M,.06,.4,0,.1,.7);cyl(g,MAT.glowO,.05,.06,0,.1,.92);tip=.95}
  else if(k==='minigun'){box(g,D,.26,.26,.4,0,.08,0);for(let i=0;i<6;i++){const a=i/6*TAU;cyl(g,M,.035,.8,Math.cos(a)*.09,.1+Math.sin(a)*.09,.55,6)}box(g,D,.08,.3,.1,0,-.12,-.05);g.userData.spin=true;tip=.95}
  else if(k==='rail'){box(g,D,.14,.2,.4,0,.05,-.25);box(g,new THREE.MeshStandardMaterial({color:'#3b4a66',roughness:.4,metalness:.5}),.18,.22,.9,0,.1,.35);box(g,MAT.glowC,.05,.05,.85,0,.23,.35);box(g,MAT.glowC,.2,.03,.03,0,.1,.82);tip=.85}
  const mz=new THREE.Object3D();mz.name='muzzle';mz.position.set(0,.1,tip);g.add(mz);return g}
function getGun(k){if(!GUNS[k])GUNS[k]=gunModel(k);return GUNS[k].clone()}

/* ================= 아이템 3D 모델 ================= */
const IGEO={};
function mm(c,o={}){return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55},o))}
function part(g,geo,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;g.add(m);return m}
function itemModel(key){const g=new THREE.Group();
  if(key.startsWith('w_')){const gun=gunModel(key.slice(2));gun.scale.setScalar(10);gun.rotation.y=Math.PI/2;g.add(gun);g.userData.gun=true;return g}
  if(key.startsWith('a_')){const c=L.AMMO[key.slice(2)].c;part(g,new THREE.BoxGeometry(8,4.5,5.5),mm('#6b6a3a'),0,2.25,0);part(g,new THREE.BoxGeometry(8.2,1.2,5.7),mm(c),0,3,0);
    for(let i=-1;i<=1;i++){part(g,new THREE.CylinderGeometry(.7,.7,3.2,10),mm('#e0b44a',{metalness:.6,roughness:.3}),i*2.2,6.1,0);part(g,new THREE.ConeGeometry(.7,1.4,10),mm(c,{metalness:.5,roughness:.3}),i*2.2,8.4,0)}return g}
  if(key==='h_bandage'){part(g,new THREE.CylinderGeometry(2.6,2.6,5,16),mm('#f6eedb'),0,2.6,0,0,0,Math.PI/2);part(g,new THREE.CylinderGeometry(1,1,5.2,12),mm('#d8c8a0'),0,2.6,0,0,0,Math.PI/2);return g}
  if(key==='h_medkit'){part(g,new THREE.BoxGeometry(8,5.5,5.5),mm('#ffffff'),0,2.75,0);part(g,new THREE.BoxGeometry(1.6,.4,4.4),mm('#ff4a4a'),0,5.6,0);part(g,new THREE.BoxGeometry(4.4,.4,1.6),mm('#ff4a4a'),0,5.6,0);
    part(g,new THREE.BoxGeometry(1.4,4.4,.3),mm('#ff4a4a'),0,2.75,2.8);part(g,new THREE.BoxGeometry(4.4,1.4,.3),mm('#ff4a4a'),0,2.75,2.8);return g}
  if(key==='h_drink'){part(g,new THREE.CylinderGeometry(2,2,6.5,16),mm('#3d8bff',{metalness:.5,roughness:.3}),0,3.25,0);part(g,new THREE.CylinderGeometry(2.05,2.05,2.2,16),mm('#ffd34d'),0,3.4,0);part(g,new THREE.CylinderGeometry(1.7,2,.6,16),mm('#cfd5de',{metalness:.7}),0,6.8,0);return g}
  if(key.startsWith('ar_helm')){const lv=+key.slice(-1),m=mm(LVC[lv],{metalness:.3,roughness:.45});part(g,new THREE.SphereGeometry(4,18,10,0,TAU,0,Math.PI/2),m,0,1,0);part(g,new THREE.CylinderGeometry(4.4,4.5,.8,20),m,0,1,0);if(lv===3)part(g,new THREE.BoxGeometry(5,1.2,1),mm('#60e0ff',{emissive:'#30b0ff',emissiveIntensity:.8}),0,2.4,3.6);return g}
  if(key.startsWith('ar_vest')){const lv=+key.slice(-1),m=mm(LVC[lv],{roughness:.7});part(g,new THREE.BoxGeometry(7,8,3),m,0,4.5,0);part(g,new THREE.BoxGeometry(5.6,5,.6),mm(lv===3?'#2a2440':'#5a6070',{metalness:.4}),0,4.8,1.7);
    part(g,new THREE.BoxGeometry(1.6,2,3.2),m,-2.6,9,0);part(g,new THREE.BoxGeometry(1.6,2,3.2),m,2.6,9,0);return g}
  if(key.startsWith('bag')){const lv=+key.slice(-1),c=['','#b07a45','#4f8a5a','#3a3350'][lv],m=mm(c,{roughness:.8});part(g,new THREE.BoxGeometry(6,7+lv*.6,4),m,0,4,0);part(g,new THREE.BoxGeometry(6.2,2.6,4.3),mm(c,{roughness:.6}),0,7+lv*.3,0);part(g,new THREE.BoxGeometry(4,3,1.2),m,0,3,2.4);return g}
  if(key.startsWith('mod')){const lv=+key.slice(-1);part(g,new THREE.CylinderGeometry(4,4,1.8,6),mm('#7a4fe0',{metalness:.5,roughness:.3}),0,4,0,Math.PI/2);part(g,new THREE.CylinderGeometry(2.4,2.4,2.2,6),mm('#c9a8ff',{emissive:'#a070ff',emissiveIntensity:1.2}),0,4,0,Math.PI/2);
    for(let i=0;i<lv;i++)part(g,new THREE.SphereGeometry(.55,8,6),mm('#ffd34d',{emissive:'#ffb000',emissiveIntensity:1}),(i-(lv-1)/2)*1.6,.9,1.2);return g}
  part(g,new THREE.BoxGeometry(5,5,5),mm('#fff'),0,2.5,0);return g}
function getItemModel(key){if(!IGEO[key])IGEO[key]=itemModel(key);return IGEO[key].clone()}
const ALLKEYS=()=>[...Object.keys(WD).map(k=>'w_'+k),...Object.keys(L.AMMO).map(k=>'a_'+k),'h_bandage','h_medkit','h_drink',...[1,2,3].flatMap(l=>['ar_helm'+l,'ar_vest'+l,'bag'+l,'mod'+l])];
export function makeIcons(target){initMats();let r2;try{const c=mk(160,160);r2=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,preserveDrawingBuffer:true});r2.setSize(160,160,false);r2.outputColorSpace=THREE.SRGBColorSpace;r2.toneMapping=THREE.ACESFilmicToneMapping;
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#6a5a9a',1.6));const d=new THREE.DirectionalLight('#fff',2.4);d.position.set(3,6,5);sc.add(d);const cm=new THREE.PerspectiveCamera(28,1,.1,500);const ol=outlineMat(.18);
    for(const k of ALLKEYS()){const m=itemModel(k);m.rotation.y=m.userData.gun?0:-.55;const grp=new THREE.Group();grp.add(m);m.traverse(o=>{if(o.isMesh&&!o.userData.ol){const e=new THREE.Mesh(o.geometry,ol);e.userData.ol=1;o.add(e)}});
      sc.add(grp);grp.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(grp),ctr=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());const rad=Math.max(sz.x,sz.y,sz.z)*.62;
      const dir=m.userData.gun?new THREE.Vector3(0,.35,1):new THREE.Vector3(.2,.75,1);cm.position.copy(ctr).add(dir.normalize().multiplyScalar(rad/Math.tan(14*Math.PI/180)));cm.lookAt(ctr);
      r2.setClearColor(0,0);r2.render(sc,cm);target[k]=c.toDataURL();sc.remove(grp)}
  }catch(e){console.warn('icon render failed',e)}finally{if(r2){r2.dispose();r2.forceContextLoss&&r2.forceContextLoss()}}}

/* ================= 캐릭터 뷰 ================= */
class CharView{
  constructor(ch){initMats();const T=tpl[ch];this.ch=ch;this.root=new THREE.Group();this.model=SkeletonUtils.clone(T.scene);this.model.scale.setScalar(T.k);this.root.add(this.model);
    this.mats=[];this.model.traverse(o=>{if(o.isMesh){const m=T.mat.clone();o.material=m;this.mats.push(m);o.castShadow=true}});
    this.mixer=new THREE.AnimationMixer(this.model);this.cur={up:null,lo:null,full:null};
    this.hand=this.model.getObjectByName('handslotr');this.head=this.model.getObjectByName('head');this.chest=this.model.getObjectByName('chest');this.spine=this.model.getObjectByName('spine');
    this.hats=[];this.model.traverse(o=>{if(/Hat|Cape/.test(o.name))this.hats.push(o)});
    this.gunKey=null;this.gun=null;this.muzzle=null;this.helmLv=0;this.helm=null;this.bagLv=0;this.bagM=null;this.flashT=0;this.opacity=1;this.dead=false;this.xray=false;
    this.outlines=[];this.olm=outlineMat(.045);this.olx=outlineMat(.06,true);const sk=[];this.model.traverse(o=>{if(o.isSkinnedMesh)sk.push(o)});
    for(const o of sk){const e=new THREE.SkinnedMesh(o.geometry,this.olm);e.bind(o.skeleton,o.bindMatrix);e.frustumCulled=false;o.parent.add(e);this.outlines.push(e)}
    this.aura=new THREE.Mesh(new THREE.RingGeometry(.55,.72,40),new THREE.MeshBasicMaterial({color:CHARS[ch].c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));this.aura.rotation.x=-Math.PI/2;this.aura.position.y=.05;this.root.add(this.aura);
    this.stars=new THREE.Group();for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.OctahedronGeometry(.1),new THREE.MeshBasicMaterial({color:'#ffe14d'}));s.position.set(Math.cos(i/3*TAU)*.35,0,Math.sin(i/3*TAU)*.35);this.stars.add(s)}this.stars.position.y=CHAR_H+.25;this.stars.visible=false;this.root.add(this.stars);
    this.slowR=new THREE.Mesh(new THREE.TorusGeometry(.45,.035,6,24),new THREE.MeshBasicMaterial({color:'#6fd0ff'}));this.slowR.rotation.x=Math.PI/2;this.slowR.position.y=.35;this.slowR.visible=false;this.root.add(this.slowR);
    this.hitAT=0;this.dodgeT=0;this.chute=null;this.hp=null;this.hpVal=-1}
  play(part,name,o={}){const c=clips[name];if(!c)return;const clip=part==='full'?c.full:c[part];const key=name+(o.pauseAt!=null?'@p':'');if(this.cur[part]===key&&!o.restart)return;
    const prevName=this.cur[part]?this.cur[part].replace('@p',''):null;const prev=prevName?this.mixer.existingAction(part==='full'?clips[prevName].full:clips[prevName][part]):null;
    const a=this.mixer.clipAction(clip);a.reset();a.paused=false;a.setLoop(o.once?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=!!o.once;a.timeScale=o.speed||1;a.enabled=true;a.setEffectiveWeight(1);a.fadeIn(o.fade??.15).play();
    if(o.pauseAt!=null){a.time=o.pauseAt;a.paused=true}
    if(prev&&prev!==a)prev.fadeOut(o.fade??.15);this.cur[part]=key;
    if(part==='full'){for(const p of['up','lo'])if(this.cur[p]){const n=this.cur[p].replace('@p','');this.mixer.existingAction(clips[n][p])?.fadeOut(.15);this.cur[p]=null}}
    else if(this.cur.full){this.mixer.existingAction(clips[this.cur.full.replace('@p','')].full)?.fadeOut(.15);this.cur.full=null}}
  setGun(k){if(k===this.gunKey)return;this.gunKey=k;if(this.gun){this.hand.remove(this.gun);this.gun=null;this.muzzle=null}if(k){this.gun=getGun(k);this.hand.add(this.gun);this.muzzle=this.gun.getObjectByName('muzzle')}}
  setHelm(lv){if(lv===this.helmLv)return;this.helmLv=lv;if(this.helm){this.head.remove(this.helm);this.helm=null}for(const h of this.hats)if(/Hat/.test(h.name))h.visible=!lv;
    if(lv){const T=tpl[this.ch],r=T.headR,g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:LVC[lv],roughness:.55,metalness:.2});
      const d=new THREE.Mesh(new THREE.SphereGeometry(r,16,10,0,TAU,0,Math.PI/2),m);d.castShadow=true;g.add(d);g.add(new THREE.Mesh(new THREE.CylinderGeometry(r*1.08,r*1.1,r*.12,18),m));
      g.position.copy(T.helm.pos);g.quaternion.copy(T.helm.quat);this.helm=g;this.head.add(g)}}
  setBag(lv){if(lv===this.bagLv)return;this.bagLv=lv;if(this.bagM){this.chest.remove(this.bagM);this.bagM=null}
    if(lv){const T=tpl[this.ch],s=T.headR,g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:['','#b07a45','#4f8a5a','#3a3350'][lv],roughness:.8});
      const b=new THREE.Mesh(new THREE.BoxGeometry(s*.95,s*(.95+lv*.12),s*.45),m);b.castShadow=true;g.add(b);g.position.copy(T.bag.pos);g.quaternion.copy(T.bag.quat);this.bagM=g;this.chest.add(g)}}
  setChute(on){if(on&&!this.chute){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.SphereGeometry(2.3,18,8,0,TAU,0,Math.PI/2.4),MAT.chute);c.position.y=4.3;c.scale.y=.55;c.castShadow=true;g.add(c);
      const pts=[];for(let i=0;i<8;i++){const a=i/8*TAU;pts.push(new THREE.Vector3(Math.cos(a)*2,4.3,Math.sin(a)*2),new THREE.Vector3(0,1.5,0))}g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#333'})));this.chute=g;this.root.add(g)}
    if(this.chute)this.chute.visible=on}
  setSpeed(part,v){const n=this.cur[part];if(!n)return;const c=clips[n.replace('@p','')];if(!c)return;const a=this.mixer.existingAction(part==='full'?c.full:c[part]);if(a)a.timeScale=v}
  setFlash(t){this.flashT=t}
  setOpacity(o){if(Math.abs(o-this.opacity)<.01)return;this.opacity=o;for(const m of this.mats){m.transparent=o<.99;m.opacity=o;m.depthWrite=o>.99}for(const e of this.outlines)e.visible=o>.99||this.xray}
  setXray(on){if(on===this.xray)return;this.xray=on;for(const e of this.outlines){e.material=on?this.olx:this.olm;e.renderOrder=on?20:0;e.visible=on||this.opacity>.99}}
  update(dt,pitch){this.mixer.update(dt);
    if(pitch&&this.spine){_q.setFromAxisAngle(XV,-pitch*.75);this.spine.quaternion.multiply(_q)}
    if(this.flashT>0){this.flashT-=dt;const v=Math.max(0,this.flashT)*8;for(const m of this.mats)m.emissive.setRGB(v,v*.3,v*.3)}else if(this.flashT>-1){this.flashT=-2;for(const m of this.mats)m.emissive.setRGB(0,0,0)}
    if(this.gun&&this.gun.userData.spin&&this.spin)this.gun.rotation.z+=dt*this.spin*30}
  dispose(){this.root.parent&&this.root.parent.remove(this.root);this.mixer.stopAllAction()}}
function hpSprite(){const c=mk(64,12);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,fog:false}));s.scale.set(.8,.15,1);s.renderOrder=10;s.userData={c,t};return s}
function drawHp(s,hp){const{c,t}=s.userData,g=c.getContext('2d');g.clearRect(0,0,64,12);g.fillStyle='#1b1330';g.beginPath();g.roundRect(0,0,64,12,5);g.fill();g.fillStyle=hp>40?'#58e06b':'#ff5b5b';g.beginPath();g.roundRect(2,2,Math.max(2,60*hp/100),8,4);g.fill();t.needsUpdate=true}

/* ================= 월드 구축 ================= */
function disposeObj(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose()})}
export function clearWorld(){if(V.world){scene.remove(V.world);disposeObj(V.world)}for(const c of V.chunks){if(c.tex)c.tex.dispose();if(c.low)c.low.dispose()}
  for(const cv of V.chars.values())cv.dispose();V.chars.clear();V.items.clear();V.drops.clear();V.barriers.clear();V.fields.clear();V.stops.clear();
  V.chunks=[];V.cgroups=[];V.treeByC=[];V.roofs=[];V.fx=[];V.bigProps=[];V.smoke=[];V.doors=[];V.partList=[]}
function colGeo(geo,c){geo=geo.index?geo.toNonIndexed():geo;const col=new THREE.Color(c),n=geo.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b}geo.setAttribute('color',new THREE.BufferAttribute(a,3));if(geo.getAttribute('uv'))geo.deleteAttribute('uv');return geo}
function bx(w,h,d,x,y,z,c,ry){const g=new THREE.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);return colGeo(g,c)}
function cy_(r1,r2,h,x,y,z,c,seg=12){const g=new THREE.CylinderGeometry(r1,r2,h,seg);g.translate(x,y,z);return colGeo(g,c)}
const merge=p=>mergeGeometries(p);
const PROC_GEO={
  container:()=>{const P=[bx(2.4,2.6,6.1,0,1.3,0,'#ffffff')];for(let z=-2.8;z<=2.8;z+=.55)P.push(bx(2.5,2.45,.12,0,1.3,z,'#d9d9d9'));P.push(bx(2.45,.12,6.15,0,2.6,0,'#cfcfcf'));return merge(P)},
  crate:()=>{const P=[bx(1.1,1.1,1.1,0,.55,0,'#c98b4a')];for(const[x,z]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])P.push(bx(.16,1.12,.16,x,.55,z,'#8a5a2a'));P.push(bx(1.14,.16,1.14,0,1.05,0,'#8a5a2a'));P.push(bx(1.14,.16,1.14,0,.08,0,'#8a5a2a'));return merge(P)},
  hay:()=>merge([cy_(.75,.75,1.2,0,.6,0,'#e6c24a',16),cy_(.64,.64,.05,0,1.21,0,'#f2d77a',16),cy_(.76,.76,.14,0,.4,0,'#c9a032',16),cy_(.76,.76,.14,0,.85,0,'#c9a032',16)]),
  sandbag:()=>{const P=[];for(let r=0;r<3;r++)for(let i=0;i<5;i++){const x=-1.2+i*.6+(r%2?.3:0);if(x>1.3)continue;const g=new THREE.CapsuleGeometry(.22,.3,3,8);g.rotateZ(Math.PI/2);g.scale(1,.7,1.3);g.translate(x,.16+r*.27,0);P.push(colGeo(g,r%2?'#cdb57f':'#bfa56c'))}return merge(P)},
  barrel:()=>merge([cy_(.4,.4,1.1,0,.55,0,'#ffffff',14),cy_(.42,.42,.09,0,.18,0,'#bbbbbb',14),cy_(.42,.42,.09,0,.92,0,'#bbbbbb',14)]),
  fence:()=>merge([bx(.14,1,.14,-1.9,.5,0,'#8a5a2a'),bx(.14,1,.14,0,.5,0,'#8a5a2a'),bx(.14,1,.14,1.9,.5,0,'#8a5a2a'),bx(4,.14,.08,0,.78,0,'#b07a45'),bx(4,.14,.08,0,.38,0,'#b07a45')]),
  tent:()=>{const sh=new THREE.Shape();sh.moveTo(-1.6,0);sh.lineTo(0,1.8);sh.lineTo(1.6,0);sh.lineTo(-1.6,0);const g=new THREE.ExtrudeGeometry(sh,{depth:2.4,bevelEnabled:false});g.translate(0,0,-1.2);const g2=new THREE.PlaneGeometry(.8,1.2);g2.translate(0,.6,1.21);return merge([colGeo(g,'#ffffff'),colGeo(g2,'#3a2a1a')])},
};
const PROC_COL={container:['#d64545','#3d74d6','#3fa35a','#e08a2e','#8a5ad6'],barrel:['#d64545','#3d74d6','#3fa35a','#e0b42e'],tent:['#5f8f4a','#d68a3d','#3d7fd6']};
function roundTreeGeo(){const R=(s)=>new THREE.IcosahedronGeometry(s,0);const a=R(2.2);a.scale(1,.85,1);a.translate(0,3.7,0);const b=R(1.5);b.translate(1.1,4.4,-.6);const c=R(1.4);c.translate(-1.1,4.2,.7);const d=R(1.2);d.translate(.2,5.2,.2);
  const g=mergeGeometries([a,b,c,d].map(x=>x.index?x.toNonIndexed():x));g.computeVertexNormals();return g}
function pineGeo(){const parts=[[2.2,2.4,2.8],[1.7,2.1,4.1],[1.2,1.8,5.3]].map(([r,h,y])=>{const c=new THREE.ConeGeometry(r,h,7);c.translate(0,y,0);return c.toNonIndexed()});const g=mergeGeometries(parts);g.computeVertexNormals();return g}
export async function buildWorld(onProg){const yieldT=async(f)=>{onProg&&onProg(f);await new Promise(r=>setTimeout(r,0))};initMats();clearWorld();const world=new THREE.Group();V.world=world;scene.add(world);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(W*3,W*3),MAT.water);water.rotation.x=-Math.PI/2;water.position.set(W/2,0,W/2);water.receiveShadow=true;world.add(water);
  const n=W/CH,seg=40;V.cgroups=[];
  for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){const g=new THREE.PlaneGeometry(CH,CH,seg,seg);g.rotateX(-Math.PI/2);const p=g.getAttribute('position');
    for(let i=0;i<p.count;i++){const x=p.getX(i)+ix*CH+CH/2,z=p.getZ(i)+iy*CH+CH/2;p.setXYZ(i,x,groundH(x,z),z)}g.computeVertexNormals();g.computeBoundingSphere();
    const low=new THREE.CanvasTexture(paintChunk(ix,iy,128));low.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:low,roughness:.95}));m.receiveShadow=true;world.add(m);V.chunks.push({ix,iy,m,tex:null,low});
    const cg=new THREE.Group();cg.userData={cx:ix*CH+CH/2,cy:iy*CH+CH/2};world.add(cg);V.cgroups.push(cg);if(ix===n-1)await yieldT(.05+.35*(iy+1)/n)}
  const cgAt=(x,y)=>V.cgroups[clamp(Math.floor(y/CH),0,n-1)*n+clamp(Math.floor(x/CH),0,n-1)];
  // 벽 (창문 구멍)
  const wg=[],trim=[];
  for(const o of S.obs){if(!o.wall)continue;const b=o.b,hh=o.hh,z0=o.z0,hz=o.w>o.h,Ln=hz?o.w:o.h,th=hz?o.h:o.w,c=b.wc;
    const put=(a0,a1,y0,y1,col,ex=0)=>{const len=a1-a0;if(len<=.01||y1-y0<=.01)return;const cx=hz?o.x+(a0+a1)/2:o.x+o.w/2,cz=hz?o.y+o.h/2:o.y+(a0+a1)/2;wg.push(bx(hz?len:th+ex,y1-y0,hz?th+ex:len,cx,z0+(y0+y1)/2,cz,col))};
    const wins=(o.win||[]).slice().sort((a,b2)=>a[0]-b2[0]);let a=0;
    for(const w of wins){put(a,w[0],0,hh,c);put(w[0],w[1],0,1,c);put(w[0],w[1],2.1,hh,c);put(w[0]-.06,w[1]+.06,.94,1.02,'#ffffff',.12);put(w[0]-.06,w[1]+.06,2.08,2.16,'#ffffff',.12);a=w[1]}
    put(a,Ln,0,hh,c);put(0,Ln,0,.22,b.kind==='warehouse'?'#8b94a0':'#b89a78',.04);
    trim.push(bx(hz?Ln+.06:th+.12,.12,hz?th+.12:Ln+.06,o.x+o.w/2,z0+hh+.06,o.y+o.h/2,b.kind==='warehouse'?'#6b7280':'#8a5a3c'))}
  if(wg.length){const wm=new THREE.Mesh(merge(wg),MAT.vc);wm.castShadow=wm.receiveShadow=true;world.add(wm);const tm=new THREE.Mesh(merge(trim),MAT.vc);tm.castShadow=true;world.add(tm)}
  const fl=[];for(const b of S.buildings)fl.push(bx(b.w,.06,b.h,b.x+b.w/2,b.z+.03,b.y+b.h/2,b.kind==='warehouse'?'#9aa0a8':'#c8a174'));if(fl.length){const fm=new THREE.Mesh(merge(fl),MAT.vc);fm.receiveShadow=true;world.add(fm)}
  // 문
  for(const d of S.doors){if(d.b.kind==='warehouse')continue;const piv=new THREE.Group();const dm=new THREE.Mesh(new THREE.BoxGeometry(d.hz?d.dw:.07,2.15,d.hz?.07:d.dw),MAT.door);dm.castShadow=true;
    const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),MAT.metal);
    if(d.hz){piv.position.set(d.x,d.z0,d.cy);dm.position.set(d.dw/2,1.075,0);kn.position.set(d.dw-.15,1,.07)}else{piv.position.set(d.cx,d.z0,d.y);dm.position.set(0,1.075,d.dw/2);kn.position.set(.07,1,d.dw-.15)}
    piv.add(dm);piv.add(kn);world.add(piv);V.doors.push({d,piv,r:0})}
  // 지붕
  for(const b of S.buildings){const m=new THREE.MeshStandardMaterial({color:b.roof,roughness:.7,flatShading:true,transparent:true,opacity:1,map:b.kind==='warehouse'?MAT.ribTex:MAT.tileTex});const g=b.kind==='warehouse'?flatRoof(b):roofGeo(b);const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;world.add(mesh);V.roofs.push({b,mesh,m})}
  for(const t of S.towers)world.add(towerModel(t));
  // 절차 소품
  const mt=new THREE.Matrix4(),q=new THREE.Quaternion(),col=new THREE.Color(),one=new THREE.Vector3(1,1,1);
  const byKey={};for(const p of S.props)if(PROPS[p.key].proc)(byKey[p.key]=byKey[p.key]||[]).push(p);
  for(const k in byKey){const L2=byKey[k],im=new THREE.InstancedMesh(PROC_GEO[k](),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,flatShading:k==='tent'}),L2.length);im.castShadow=im.receiveShadow=true;
    L2.forEach((p,i)=>{q.setFromAxisAngle(UPV,p.rot*Math.PI/2);mt.compose(new THREE.Vector3(p.x,p.z,p.y),q,one);im.setMatrixAt(i,mt);const pal=PROC_COL[k];col.set(pal?pal[p.v%pal.length]:'#ffffff');im.setColorAt(i,col)});im.computeBoundingSphere();world.add(im)}
  // KayKit 소품
  for(const p of S.props){const P=PROPS[p.key];if(P.proc)continue;const T=propTpl[P.m];if(!T)continue;const o=T.g.clone();o.scale.set(P.w/T.size.x,P.h/T.size.y,P.d/T.size.z);o.rotation.y=p.rot*Math.PI/2;o.position.set(p.x,p.z,p.y);
    if(!p.big)o.traverse(c=>{if(c.isMesh)c.castShadow=P.h>1});cgAt(p.x,p.y).add(o);if(p.big)V.bigProps.push({p,o})}
  // 청크별 인스턴스: 나무, 수풀, 바위, 풀
  const byC=Array.from({length:n*n},()=>({round:[],pine:[],bush:[],rock:[]}));const ci=(x,y)=>clamp(Math.floor(y/CH),0,n-1)*n+clamp(Math.floor(x/CH),0,n-1);
  for(const t of S.trees)byC[ci(t.x,t.y)][t.pine?'pine':'round'].push(t);for(const b of S.bushes)byC[ci(b.x,b.y)].bush.push(b);for(const o of S.obs)if(o.rock)byC[ci(o.x,o.y)].rock.push(o);
  const trunkG=new THREE.CylinderGeometry(.16,.24,2.8,6);trunkG.translate(0,1.4,0);const rG=roundTreeGeo(),pG=pineGeo(),bG=new THREE.IcosahedronGeometry(1,1);bG.translate(0,.3,0);const rkG=new THREE.DodecahedronGeometry(1,0);
  const olT=outlineMat(.07),olB=outlineMat(.06),olR=outlineMat(.05);
  const grassG=grassGeo(),grassM=grassMat();const R=L.mulberry32(S.seed+77);
  for(let i=0;i<byC.length;i++){const C=byC[i];if(i%10===9)await yieldT(.45+.45*i/byC.length);const cg=V.cgroups[i];const inst=(geo,mat,list,fn,colFn,ol)=>{if(!list.length)return null;const im=new THREE.InstancedMesh(geo,mat,list.length);im.castShadow=true;im.receiveShadow=true;
      list.forEach((o,k)=>{fn(o);im.setMatrixAt(k,mt);if(colFn){colFn(o,k);im.setColorAt(k,col)}});im.computeBoundingSphere();cg.add(im);if(ol){const e=new THREE.InstancedMesh(geo,ol,list.length);e.instanceMatrix=im.instanceMatrix;e.boundingSphere=im.boundingSphere.clone();cg.add(e)}return im};
    const trees=[...C.round,...C.pine];
    inst(trunkG,MAT.trunk,trees,t=>{q.setFromAxisAngle(UPV,t.rot);mt.compose(_v.set(t.x,t.z,t.y),q,_s.set(t.s,t.s,t.s))});
    const imR=inst(rG,MAT.leaf,C.round,t=>{q.setFromAxisAngle(UPV,t.rot);mt.compose(_v.set(t.x,t.z,t.y),q,_s.set(t.s,t.s,t.s))},(t,k)=>col.setHSL(.27+(k%7)*.013,.62,.27+(k%5)*.025),olT);
    const imP=inst(pG,MAT.leaf,C.pine,t=>{q.setFromAxisAngle(UPV,t.rot);mt.compose(_v.set(t.x,t.z,t.y),q,_s.set(t.s,t.s,t.s))},(t,k)=>col.setHSL(.36+(k%5)*.01,.5,.2+(k%4)*.02),olT);
    C.round.forEach((t,k)=>{t.im=imR;t.ki=k});C.pine.forEach((t,k)=>{t.im=imP;t.ki=k});V.treeByC[i]=[...C.round,...C.pine];
    inst(bG,MAT.bush,C.bush,b=>{q.setFromAxisAngle(UPV,b.rot);mt.compose(_v.set(b.x,b.z,b.y),q,_s.set(b.r,b.r*.75,b.r))},(b,k)=>col.setHSL(.3+(k%6)*.012,.62,.22+(k%4)*.025),olB);
    inst(rkG,MAT.rock,C.rock,o=>{q.setFromEuler(_e.set(o.v*.1,o.v*.37,o.v*.05));mt.compose(_v.set(o.x,o.z0+o.r*.3,o.y),q,_s.set(o.r*1.05,o.r*.8,o.r*1.05))},(o,k)=>col.setHSL(.1,.06,.55+(o.v%5)*.04),olR);
    const ox=(i%n)*CH,oy=Math.floor(i/n)*CH,pts=[];for(let k=0;k<2200;k++){const x=ox+R()*CH,y=oy+R()*CH,t=L.tileAt(x,y);if(t!==L.G&&t!==L.DG&&t!==L.FA)continue;if(L.solidAt(x,y))continue;pts.push([x,y,R()])}
    if(pts.length){const im=new THREE.InstancedMesh(grassG,grassM,pts.length);pts.forEach((p,k)=>{q.setFromAxisAngle(UPV,p[2]*6.28);const s=.7+p[2]*.7;mt.compose(_v.set(p[0],groundH(p[0],p[1]),p[1]),q,_s.set(s,s,s));im.setMatrixAt(k,mt)});im.computeBoundingSphere();cg.add(im);cg.userData.grass=im}}
  V.bulletsMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),MAT.bullet,500);V.bulletsMesh.frustumCulled=false;world.add(V.bulletsMesh);
  V.flameMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),MAT.flame,300);V.flameMesh.frustumCulled=false;world.add(V.flameMesh);
  V.parts=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:'#ffffff'}),500);V.parts.frustumCulled=false;V.parts.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(1500),3);world.add(V.parts);
  V.zoneWall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,320,160,1,true),MAT.zone);V.zoneWall.renderOrder=5;world.add(V.zoneWall);
  V.plane=planeModel();world.add(V.plane);
  V.flashLight=new THREE.PointLight('#ffcc66',0,9,2);world.add(V.flashLight);
  setQuality(quality);await yieldT(.95)}
// 경기 시작 전: 25명 캐릭터를 미리 만들어 두고 셰이더를 미리 준비 (게임 중 멈칫 방지)
export function prepareMatch(){for(const p of S.players){if(!V.chars.has(p.id)){const cv=new CharView(p.ch);cv.root.visible=false;V.world.add(cv.root);V.chars.set(p.id,cv);cv.hp=hpSprite();cv.hp.position.y=2.15;cv.root.add(cv.hp);cv.dead=false}}
  for(const k of Object.keys(WD))getGun(k);try{renderer.compile(scene,camera)}catch(e){}}
function grassGeo(){const bl=[];for(let i=0;i<3;i++){const a=i/3*Math.PI;const g=new THREE.BufferGeometry();const w=.09,h=.38;
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-w*Math.cos(a),0,-w*Math.sin(a),w*Math.cos(a),0,w*Math.sin(a),0,h,0]),3));
    g.setAttribute('color',new THREE.BufferAttribute(new Float32Array([.14,.36,.07,.14,.36,.07,.3,.6,.15]),3));bl.push(g)}return mergeGeometries(bl)}
function grassMat(){const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});m.onBeforeCompile=sh=>{sh.uniforms.uTime=MAT.time;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vec4 wp0=instanceMatrix*vec4(0.,0.,0.,1.); float sw=sin(uTime*2.2+wp0.x*.4+wp0.z*.5)*.5+sin(uTime*3.7+wp0.x*1.1)*.2; transformed.x+=sw*position.y*.3; transformed.z+=sw*position.y*.2;')};m.customProgramCacheKey=()=>'grass';return m}
function flatRoof(b){const y=b.z+4.5+.1,g=new THREE.BoxGeometry(b.w+.6,.25,b.h+.6);g.translate(b.x+b.w/2,y+.12,b.y+b.h/2);const pos=g.getAttribute('position'),u=new Float32Array(pos.count*2);for(let i=0;i<pos.count;i++){u[i*2]=pos.getX(i)/1.2;u[i*2+1]=pos.getZ(i)/1.2}g.setAttribute('uv',new THREE.BufferAttribute(u,2));return g}
function roofGeo(b){const e=.45,x0=b.x-e,x1=b.x+b.w+e,z0=b.y-e,z1=b.y+b.h+e,y=b.z+L.WALL_H+.12,rise=Math.min(b.w,b.h)*.3;const alongX=b.w>=b.h;const v=[],uv=[];
  const P=(x,yy,z)=>{v.push(x,yy,z);uv.push(alongX?x/1.5:z/1.5,(alongX?Math.abs(z-(z0+z1)/2):Math.abs(x-(x0+x1)/2))+yy)};const tri=(a,b2,c)=>{P(...a);P(...b2);P(...c)};
  if(alongX){const zm=(z0+z1)/2,A=[x0,y,z0],B=[x1,y,z0],C=[x1,y,z1],D=[x0,y,z1],E=[x0,y+rise,zm],F=[x1,y+rise,zm];tri(A,E,F);tri(A,F,B);tri(D,C,F);tri(D,F,E);tri(A,D,E);tri(B,F,C)}
  else{const xm=(x0+x1)/2,A=[x0,y,z0],B=[x1,y,z0],C=[x1,y,z1],D=[x0,y,z1],E=[xm,y+rise,z0],F=[xm,y+rise,z1];tri(A,D,F);tri(A,F,E);tri(B,E,F);tri(B,F,C);tri(A,E,B);tri(D,C,F)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g}
function towerModel(t){const P=[],wd='#8a5a2a',wl='#b07a45';
  for(const[dx,dy]of[[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]])P.push(bx(.3,t.top-t.z+2.6,.3,t.x+dx,t.z+(t.top-t.z+2.6)/2,t.y+dy,wd));
  P.push(bx(4.9,.22,4.9,t.x,t.top-.11,t.y,wl));
  for(const s of[-1,1]){P.push(bx(4.8,.1,.1,t.x,t.top+1,t.y+s*2.35,wd));P.push(bx(4.8,.08,.08,t.x,t.top+.5,t.y+s*2.35,wd))}
  P.push(bx(.1,.1,4.8,t.x-2.35,t.top+1,t.y,wd));P.push(bx(.1,.1,1.6,t.x+2.35,t.top+1,t.y-1.6,wd));P.push(bx(.1,.1,1.6,t.x+2.35,t.top+1,t.y+1.6,wd));
  P.push(bx(5.4,.2,5.4,t.x,t.top+2.7,t.y,'#6b3f22'));P.push(bx(4.2,.4,4.2,t.x,t.top+2.95,t.y,'#7a4a28'));
  const r=t.ramp,len=r.x1-r.x0,hgt=t.top-t.z,sl=Math.hypot(len,hgt),ang=Math.atan2(hgt,len);const g=new THREE.BoxGeometry(sl,.18,1.3);g.rotateZ(-ang);g.translate((r.x0+r.x1)/2,t.z+hgt/2,t.y);P.push(colGeo(g,wl));
  const nSt=12;for(let i=0;i<nSt;i++){const k=(i+.5)/nSt;P.push(bx(len/nSt*.5,.06,1.3,r.x1-k*len,t.z+k*hgt+.12,t.y,wd))}
  for(const s of[-1,1]){const rg=new THREE.BoxGeometry(sl,.08,.08);rg.rotateZ(-ang);rg.translate((r.x0+r.x1)/2,t.z+hgt/2+.9,t.y+s*.65);P.push(colGeo(rg,wd))}
  const m=new THREE.Mesh(merge(P),MAT.vc);m.castShadow=m.receiveShadow=true;return m}
function planeModel(){const g=new THREE.Group();const f=new THREE.Mesh(new THREE.CapsuleGeometry(2.1,14,6,12),MAT.plane);f.rotation.z=Math.PI/2;g.add(f);
  const w=new THREE.Mesh(new THREE.BoxGeometry(4.2,.5,24),MAT.plane);g.add(w);const t=new THREE.Mesh(new THREE.BoxGeometry(2.8,4.2,.5),MAT.planeA);t.position.set(-7.7,2.4,0);g.add(t);
  const t2=new THREE.Mesh(new THREE.BoxGeometry(2.8,.4,9),MAT.plane);t2.position.set(-7.7,.7,0);g.add(t2);
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.CylinderGeometry(1,1,3.5,10),MAT.planeA);e.rotation.z=Math.PI/2;e.position.set(1.4,-.7,s*6.3);g.add(e);const pr=new THREE.Mesh(new THREE.BoxGeometry(.2,5,.5),MAT.gunDark);pr.position.set(3.3,-.7,s*6.3);pr.userData.prop=1;g.add(pr)}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}

/* ================= 청크 텍스처 스트리밍 ================= */
let streamT=0;
function streamChunks(cx,cy,force){const px=quality==='high'?768:384,rad=quality==='high'?160:110;let made=0;if(!force){streamT-=1/60;if(streamT>0)return;streamT=.3}
  for(const c of V.chunks){const mx=c.ix*CH+CH/2,my=c.iy*CH+CH/2,d=Math.max(Math.abs(mx-cx),Math.abs(my-cy));
    if(d<rad){if(!c.tex&&made<1){const t=new THREE.CanvasTexture(paintChunk(c.ix,c.iy,px));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());c.tex=t;c.m.material.map=t;c.m.material.needsUpdate=true;made++}}
    else if(c.tex&&d>rad+120){c.m.material.map=c.low;c.m.material.needsUpdate=true;c.tex.dispose();c.tex=null}}}
export function prewarm(x,y){for(let i=0;i<9;i++)streamChunks(x,y,true)}

/* ================= 효과 ================= */
function addPart(x,y,z,c,n,sp=1,life=.45,size=.08,grav=9){for(let i=0;i<n;i++){if(V.partList.length>=500)V.partList.shift();const a=Math.random()*TAU,v=(1+Math.random()*3)*sp;V.partList.push({x,y,z,vx:Math.cos(a)*v,vy:(1+Math.random()*3)*sp,vz:Math.sin(a)*v,life:life*(.6+Math.random()*.6),c:new THREE.Color(c),s:size,g:grav})}}
function addSmoke(x,y,z,c,life,size,vy=1.4){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:MAT.soft,color:c,transparent:true,depthWrite:false,opacity:.7}));sp.position.set(x,y,z);sp.scale.setScalar(size);V.world.add(sp);V.smoke.push({sp,life,max:life,size,vy,vx:(Math.random()-.5)*.6,vz:(Math.random()-.5)*.6})}
function addRing(x,y,z,r,c){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,z+.08,y);V.world.add(m);V.fx.push({o:m,t:'ring',r,life:.55,max:.55})}
function addBeam3(a,b,c,w,life){const d=a.distanceTo(b);if(d<.01)return;const m=new THREE.Mesh(new THREE.CylinderGeometry(w,w,d,6),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UPV,_v.copy(b).sub(a).normalize());V.world.add(m);V.fx.push({o:m,t:'fade',life,max:life})}
const P3=(x,y,z)=>new THREE.Vector3(x,z,y);
function addBolt(a,b,c){let p=a.clone();for(let i=1;i<=7;i++){const t=i/7,n=a.clone().lerp(b,t);if(i<7)n.add(_v2.set((Math.random()-.5)*.8,(Math.random()-.5)*.8,(Math.random()-.5)*.8));addBeam3(p,n,c,.05,.35);p=n}}
function muzzleWorld(p){const cv=V.chars.get(p.id);if(cv&&cv.muzzle&&cv.root.visible){cv.muzzle.getWorldPosition(_v);return _v.clone()}const[x,y,z]=L.muzzle(p);return P3(x,y,z)}
export function handleEvents(evs){const me=S.me;if(!V.world)return;
  for(const e of evs){switch(e.t){
    case 'shot':{const p=e.p;if(!p||!p.alive||e.k==='fist')break;if(hyp(p.x-cam.cx,p.y-cam.cz)>200)break;const mz=muzzleWorld(p);
      if(e.k!=='flame'){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:MAT.soft,color:e.k==='rail'?'#7ff6ff':'#ffd27a',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.position.copy(mz);s.scale.setScalar(e.k==='rail'?1:.45+Math.random()*.2);V.world.add(s);V.fx.push({o:s,t:'fade',life:.05,max:.05})}
      if(hyp(p.x-me.x,p.y-me.y)<40){V.flashLight.position.copy(mz);V.flashLight.intensity=e.k==='flame'?4:8}
      if(e.k==='rail'){const b=S.bullets[S.bullets.length-1];if(b&&b.own===p){const end=P3(b.x+b.vx/1500*120,b.y+b.vy/1500*120,b.z+b.vz/1500*120);addBeam3(mz,end,'#6ff4ff',.06,.35)}}
      if(p===me){const k=(e.rec||.01)*(me.ads?.75:1.1)*(.8+Math.random()*.4);cam.pitch+=k;cam.kickAcc+=k*.55;cam.yaw+=(Math.random()-.5)*k*.5}break}
    case 'hit':addPart(e.x,e.y,e.z,'#ff4a4a',e.head?9:5,.8,.4,.06);{const cv=V.chars.get(e.p.id);if(cv){cv.setFlash(.12);if(cv.hitAT<-.4)cv.hitAT=.28}}break;
    case 'spark':addPart(e.x,e.y,e.z,e.m==='dirt'?'#9b7b4a':e.c,e.m==='dirt'?5:3,.6,.3,.05);if(e.m==='dirt')addSmoke(e.x,e.z,e.y,'#b8a27a',.5,.3,.3);break;
    case 'ring':addRing(e.x,e.y,e.z||groundH(e.x,e.y),e.r,e.c);break;
    case 'trail':addBeam3(P3(e.x1,e.y1,(e.z1||0)+1),P3(e.x2,e.y2,(e.z2||0)+1),e.c,.18,.6);addRing(e.x2,e.y2,e.z2||0,2,e.c);for(let i=0;i<6;i++)addSmoke(e.x1+(Math.random()-.5),(e.z1||0)+1,e.y1+(Math.random()-.5),e.c,.6,.8,.5);break;
    case 'pull':addBeam3(P3(e.x1,e.y1,(e.z1||0)+1.1),P3(e.x2,e.y2,(e.z2||0)+1.1),e.c,.1,.5);break;
    case 'bolt':{const z1=e.z1??e.z??0,z2=e.z2??e.z??0;addBolt(P3(e.x1,e.y1,z1+1),P3(e.x2,e.y2,z2+1),e.c);addPart(e.x2,e.y2,z2+1,e.c,10,1,.4,.07);break}
    case 'die':addPart(e.p.x,e.p.y,e.p.z+1,CHARS[e.p.ch].c,20,1.3,.7,.1);addRing(e.p.x,e.p.y,e.p.z,2,'#ffffff');break;
    case 'dust':for(let i=0;i<8;i++)addSmoke(e.x+(Math.random()-.5)*3,(e.z||0)+.3,e.y+(Math.random()-.5)*3,'#e8dcc0',1.2,1.6,.4);break;
    case 'land':for(let i=0;i<5;i++)addSmoke(me.x+(Math.random()-.5)*1.4,me.z+.2,me.y+(Math.random()-.5)*1.4,'#e8dcc0',.9,1,.3);break;
    case 'hurt':if(!e.zone)cam.shake=Math.max(cam.shake,.25);break;
    case 'stun':addPart(e.p.x,e.p.y,e.p.z+1.9,'#ffe14d',8,.6,.5,.06);break;
    case 'skill':{const p=e.p;if(p.ch==='volt'){const cv=V.chars.get(p.id);if(cv)cv.dodgeT=.35}addRing(p.x,p.y,p.z,2.4,CHARS[p.ch].c);addPart(p.x,p.y,p.z+1,CHARS[p.ch].c,16,1,.6,.08,2);
      if(p.ch==='shadow'&&e.f!=='far')for(let i=0;i<8;i++)addSmoke(p.x+(Math.random()-.5)*.8,p.z+.4+Math.random()*1.2,p.y+(Math.random()-.5)*.8,'#4b2a86',.9,.9,.4);break}
    case 'uncloak':for(let i=0;i<6;i++)addSmoke(e.p.x+(Math.random()-.5)*.6,e.p.z+.5+Math.random(),e.p.y+(Math.random()-.5)*.6,'#6a4aa6',.6,.7,.3);break;
  }}}

/* ================= 카메라 ================= */
function camBlocked(x,y,z){if(z<groundH(x,y)+.15)return true;const o=L.solidAt3(x,y,z);return !!(o&&!o.trunk)}
function placeCamera(dt){const me=S.me;
  if(cam.kickAcc>0){const d=Math.min(cam.kickAcc,dt*.35);cam.pitch-=d;cam.kickAcc-=d}
  cam.pitch=clamp(cam.pitch,-1.35,1.2);
  const fx=Math.cos(cam.pitch)*Math.cos(cam.yaw),fy=Math.sin(cam.pitch),fz=Math.cos(cam.pitch)*Math.sin(cam.yaw);cam.fx=fx;cam.fy=fy;cam.fz=fz;
  let px,py,pz,dist,side=0,fov=62,scope=1;const w=L.curW(me);cam.scoped=false;
  if(me.ph==='plane'){px=S.plane.x;pz=S.plane.y;py=L.ALT+4;dist=26}
  else if(me.ph==='fall'||me.ph==='chute'){px=me.x;pz=me.y;py=me.z+1.2;dist=me.ph==='fall'?5.5:7}
  else if(!me.alive){px=me.x;pz=me.y;py=me.z+1.2;dist=5;cam.yaw+=dt*.25}
  else{const h=(me.crouch?1.25:1.7)+me.jz;const k=Math.min(1,dt*16);if(cam.sx==null||hyp(cam.sx-me.x,cam.sz-me.y)>4){cam.sx=me.x;cam.sz=me.y;cam.sy=me.z+h}cam.sx+=(me.x-cam.sx)*k;cam.sz+=(me.y-cam.sz)*k;cam.sy+=(me.z+h-cam.sy)*Math.min(1,dt*10);px=cam.sx;pz=cam.sz;py=cam.sy;side=.62;dist=4.3;
    if(cam.ads&&w){if(WD[w.k].scope){cam.scoped=true;dist=0;side=0;py+=.05;scope=WD[w.k].scope;fov=62/scope}else{dist=1.7;side=.5;fov=46}}}
  cam.fov=cam.fov+(fov-cam.fov)*Math.min(1,dt*14);if(cam.scoped)cam.fov=fov;cam.scope=scope;
  const rx=-Math.sin(cam.yaw),rz=Math.cos(cam.yaw);let sx=px+rx*side,sz=pz+rz*side;if(side&&camBlocked(sx,sz,py)){sx=px;sz=pz}
  let d=dist;for(let t=.2;t<=dist;t+=.15){if(camBlocked(sx-fx*t,sz-fz*t,py-fy*t)){d=Math.max(.2,t-.25);break}}
  const cx=sx-fx*d,cz=sz-fz*d,cy=py-fy*d;let shx=0,shy=0;if(cam.shake>0){cam.shake-=dt;shx=(Math.random()-.5)*cam.shake*.25;shy=(Math.random()-.5)*cam.shake*.25}
  cam.cx=cx;cam.cy=cy;cam.cz=cz;camera.position.set(cx+shx,cy+shy,cz);camera.lookAt(cx+fx*10,cy+fy*10,cz+fz*10);camera.fov=cam.fov;camera.updateProjectionMatrix();cam.hideMe=cam.scoped||d<.5}
export function aimInfo(){const me=S.me,w=L.curW(me),rng=w?WD[w.k].rng:3;const ox=cam.cx,oy=cam.cz,oz=cam.cy,dx=cam.fx,dy=cam.fz,dz=cam.fy;
  let best=null,bt=1e9;const hh=dx*dx+dy*dy;
  for(const p of S.players){if(p===me||!p.alive||p.ph!=='ground')continue;if(L.invisible(p)&&hyp(p.x-me.x,p.y-me.y)>6)continue;const t=((p.x-ox)*dx+(p.y-oy)*dy)/(hh||1e-6);if(t<0||t>rng+10)continue;
    const qx=ox+dx*t,qy=oy+dy*t,qd=hyp(qx-p.x,qy-p.y);if(qd>p.r+.12)continue;const z=oz+dz*t,top=p.z+(p.crouch?L.PH_C:L.PH_H)+p.jz;if(z<p.z+p.jz-.05||z>top+.08)continue;if(t<bt){bt=t;best=p}}
  let bl=rng+30;const startT=Math.max(.3,hyp(me.x-ox,me.y-oy)+.3);
  for(let t=startT,st=.4;t<rng+30;t+=st,st=t<25?.4:t<120?1.2:3){const x=ox+dx*t,y=oy+dy*t,z=oz+dz*t;if(z<groundH(x,y)||L.solidAt3(x,y,z)){bl=t;break}}
  if(best&&bt<bl){const t=bt;return{pt:[ox+dx*t,oy+dy*t,oz+dz*t],target:best,dist:t}}
  const t=Math.min(bl,rng+30);return{pt:[ox+dx*t,oy+dy*t,oz+dz*t],target:null,dist:t}}
export function assistTarget(maxAng,rng){const me=S.me;let best=null,ba=maxAng;
  for(const p of S.players){if(p===me||!p.alive||p.ph!=='ground'||L.invisible(p))continue;const dx=p.x-cam.cx,dy=p.y-cam.cz,dz=p.z+(p.crouch?.85:1.15)-cam.cy,d=hyp(dx,dy,dz);if(d>rng)continue;
    const dot=(dx*cam.fx+dy*cam.fz+dz*cam.fy)/d;const a=Math.acos(clamp(dot,-1,1));if(a<ba&&L.losClear(cam.cx,cam.cz,cam.cy,p.x,p.y,p.z+1.1)){ba=a;best={p,yaw:Math.atan2(dy,dx),pitch:Math.asin(clamp(dz/d,-1,1)),a}}}return best}
export function screenPos(x,y,z){_v.set(x,z,y).project(camera);return[(_v.x+1)/2*innerWidth,(1-_v.y)/2*innerHeight,_v.z<1&&_v.z>-1]}

/* ================= 게임 렌더 ================= */
let gtimeV=0;
export function renderGame(dt){gtimeV+=dt;const me=S.me;if(!me||!V.world)return;
  placeCamera(dt);
  if(me.alive&&me.ph==='ground'){const ai=aimInfo();cam.aimPt=ai.pt;cam.aimHit=ai.target}else{cam.aimPt=null;cam.aimHit=null}
  sky.position.copy(camera.position);
  const tx=me.ph==='plane'?S.plane.x:me.x,ty=me.ph==='plane'?S.plane.y:me.y,tz=me.ph==='plane'?L.ALT:me.z;
  sun.position.set(tx-60,tz+120,ty+45);sun.target.position.set(tx,tz,ty);
  streamChunks(tx,ty);
  const far=scene.fog.far+40;for(const g of V.cgroups){const d=hyp(g.userData.cx-cam.cx,g.userData.cy-cam.cz);g.visible=d<far+CH*.7;if(g.userData.grass)g.userData.grass.visible=quality==='high'&&d<75}
  const pl=S.plane;V.plane.visible=!pl.done;if(!pl.done){V.plane.position.set(pl.x,L.ALT+6,pl.y);V.plane.rotation.y=-pl.ang;V.plane.children.forEach(c=>{if(c.userData.prop)c.rotation.x+=dt*40})}
  const inB=me.ph==='ground'?L.bldAt(me.x,me.y):null,camB=L.bldAt(cam.cx,cam.cz);
  for(const r of V.roofs){const hide=(r.b===inB&&me.z<r.b.z+3)||(r.b===camB&&cam.cy<r.b.z+L.WALL_H+2);const tgt=hide?0:1;r.m.opacity+=(tgt-r.m.opacity)*Math.min(1,dt*10);r.mesh.visible=r.m.opacity>.03;r.m.depthWrite=r.m.opacity>.95}
  for(const d of V.doors){const tg=d.d.open?(d.d.hz?-Math.PI/2:Math.PI/2):0;d.r+=(tg-d.r)*Math.min(1,dt*10);d.piv.rotation.y=d.r}
  MAT.time.value=gtimeV;MAT.waterN.offset.set(gtimeV*.01,gtimeV*.007);
  fadeCanopies();
  syncChars(dt);syncItems();syncDrops(dt);syncSkills(dt);syncBullets();
  const z=S.zone;V.zoneWall.scale.set(Math.max(z.r,1),1,Math.max(z.r,1));V.zoneWall.position.set(z.cx,120,z.cy);MAT.zone.map.offset.x=gtimeV*.01;MAT.zone.map.offset.y=-gtimeV*.05;
  const P=V.parts;let n=0;for(let i=V.partList.length-1;i>=0;i--){const q=V.partList[i];q.life-=dt;if(q.life<=0){V.partList.splice(i,1);continue}q.vy-=q.g*dt;q.x+=q.vx*dt;q.z=Math.max(groundH(q.x,q.y)+.02,q.z+q.vy*dt);q.y+=q.vz*dt;q.vx*=.96;q.vz*=.96;
    _m.compose(_v.set(q.x,q.z,q.y),_q.identity(),_s.setScalar(q.s*Math.min(1,q.life*4)));P.setMatrixAt(n,_m);P.setColorAt(n,q.c);n++}P.count=n;P.instanceMatrix.needsUpdate=true;if(P.instanceColor)P.instanceColor.needsUpdate=true;
  for(let i=V.smoke.length-1;i>=0;i--){const s=V.smoke[i];s.life-=dt;const k=1-s.life/s.max;if(s.life<=0){V.world.remove(s.sp);s.sp.material.dispose();V.smoke.splice(i,1);continue}s.sp.position.y+=s.vy*dt;s.sp.position.x+=s.vx*dt;s.sp.position.z+=s.vz*dt;s.sp.scale.setScalar(s.size*(1+k*1.4));s.sp.material.opacity=.7*(1-k)}
  for(let i=V.fx.length-1;i>=0;i--){const f=V.fx[i];f.life-=dt;const k=Math.max(0,f.life/f.max);if(f.life<=0){V.world.remove(f.o);if(!f.o.isSprite)f.o.geometry.dispose();f.o.material.dispose();V.fx.splice(i,1);continue}
    if(f.t==='ring'){const r=f.r*(1.25-k*.5);f.o.scale.set(r,r,r);f.o.material.opacity=k}else f.o.material.opacity=k}
  V.flashLight.intensity*=Math.pow(.001,dt*8);
  renderer.render(scene,camera)}

let hidT=[];
function fadeCanopies(){const me=S.me;for(const t of hidT){const s=t.s;_q.setFromAxisAngle(UPV,t.rot);_m.compose(_v.set(t.x,t.z,t.y),_q,_s.set(s,s,s));t.im.setMatrixAt(t.ki,_m);t.im.instanceMatrix.needsUpdate=true}hidT=[];
  if(me.ph!=='ground')return;const hx=me.x,hy=me.y,cx=cam.cx,cy=cam.cz,sx=hx-cx,sy=hy-cy,sl=sx*sx+sy*sy||1;
  const nC=W/CH,ix0=clamp(Math.floor(cx/CH),0,nC-1),iy0=clamp(Math.floor(cy/CH),0,nC-1),near=[];for(let j=iy0-1;j<=iy0+1;j++)for(let i=ix0-1;i<=ix0+1;i++)if(i>=0&&j>=0&&i<nC&&j<nC&&V.treeByC[j*nC+i])near.push(...V.treeByC[j*nC+i]);
  for(const t of near){const dx=t.x-cx,dy=t.y-cy;if(dx*dx+dy*dy>64)continue;if(!t.im)continue;const u=clamp((dx*sx+dy*sy)/sl,0,1),qx=cx+sx*u-t.x,qy=cy+sy*u-t.y;const R=2.4*t.s;
    if(qx*qx+qy*qy<R*R&&cam.cy>t.z+1.8*t.s&&cam.cy<t.z+6.8*t.s){_m.makeScale(0,0,0);t.im.setMatrixAt(t.ki,_m);t.im.instanceMatrix.needsUpdate=true;hidT.push(t)}}}
function syncChars(dt){const me=S.me,alive=new Set();const xray=me.buff&&me.buff.xray>0;
  for(const p of S.players){alive.add(p.id);let cv=V.chars.get(p.id);
    if(p.ph==='plane'||p.gone||(!p.alive&&S.gtime-p.deathT>5&&!p.dummy)){if(cv)cv.root.visible=false;continue}
    const dCam=hyp(p.x-cam.cx,p.y-cam.cz);
    if(dCam>(p.ph==='ground'?scene.fog.far:420)&&p!==me){if(cv)cv.root.visible=false;continue}
    if(!cv){cv=new CharView(p.ch);V.world.add(cv.root);V.chars.set(p.id,cv);cv.hp=hpSprite();cv.hp.position.y=2.15;cv.root.add(cv.hp)}
    if(p.alive&&cv.dead){cv.dead=false;cv.cur={up:null,lo:null,full:null};cv.mixer.stopAllAction()}
    cv.root.visible=!(p===me&&cam.hideMe);
    cv.root.position.set(p.x,p.z+(p.jz||0),p.y);
    // 몸 방향: 조준 방향으로 부드럽게 (총이 없으면 이동 방향)
    const w=L.curW(p);let fa=p.ang;if(!w&&p.moving&&p.ph==='ground'&&p.shotT<=0)fa=Math.atan2(p.mdy,p.mdx);
    const face=Math.atan2(Math.cos(fa),Math.sin(fa));let dy=face-cv.root.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));cv.root.rotation.y+=dy*Math.min(1,dt*(p===me?(w?22:12):10));
    cv.setGun(p.alive&&p.ph==='ground'?(w?w.k:null):null);cv.setHelm(p.helm);cv.setBag(p.bag);cv.spin=p.spin;cv.setChute(p.ph==='chute');
    const B=p.buff,act=p.alive&&p.ph==='ground'&&(B.steady>0||B.ambush>0||B.xray>0||B.dash>0||(B.haste>0&&p.ch==='chrono'));cv.aura.material.opacity=act?.55+.3*Math.sin(gtimeV*10):0;
    cv.stars.visible=p.alive&&p.stunT>0;if(cv.stars.visible)cv.stars.rotation.y+=dt*8;
    cv.slowR.visible=p.alive&&p.slowT>0&&p.ph==='ground';if(cv.slowR.visible)cv.slowR.rotation.z+=dt*3;
    let op=1;if(p!==me&&p.alive){if(L.invisible(p)){op=hyp(p.x-me.x,p.y-me.y)<6?.14+.08*Math.sin(gtimeV*20):0}else if(L.stealthed(p)&&hyp(p.x-me.x,p.y-me.y)>12)op=.35}else if(p===me&&L.invisible(me))op=.28;
    cv.setOpacity(op);if(op<=0)cv.root.visible=false;cv.setXray(!!(xray&&p!==me&&p.alive&&p.ph==='ground'&&hyp(p.x-me.x,p.y-me.y)<120));
    if(p.flash>0&&cv.flashT<=0)cv.setFlash(.1);
    const showHp=p!==me&&p.alive&&p.hitT>0&&p.ph==='ground'&&op>.5;cv.hp.visible=showHp;if(showHp&&Math.round(p.hp)!==cv.hpVal){cv.hpVal=Math.round(p.hp);drawHp(cv.hp,p.hp)}
    let pitch=0;cv.hitAT-=dt;cv.dodgeT-=dt;
    if(!p.alive){if(!cv.dead){cv.dead=true;cv.play('full',Math.random()<.5?'Death_A':'Death_B',{once:true,fade:.12})}}
    else if(p.ph==='fall'){cv.play('full','Jump_Idle');cv.model.rotation.x=.7}
    else if(p.ph==='chute'){cv.play('full','Jump_Idle',{speed:.6});cv.model.rotation.x=0}
    else if(p.stunT>0){cv.model.rotation.x=0;cv.play('full','Hit_B',{speed:.5})}
    else{cv.model.rotation.x=0;pitch=p===me?cam.pitch:(p.pitch||0);
      if(cv.dodgeT>0)cv.play('full','Dodge_Forward',{once:true,fade:.08});
      else if(p.landT>.2)cv.play('full','Jump_Land',{once:true,fade:.1});
      else if(p.jz>.05)cv.play('full',p.jv>0?'Jump_Start':'Jump_Idle',{once:p.jv>0,fade:.1});
      else{const gun=!!w,one=w&&WD[w.k].one,sp=p.curSp||0,busy=p.shotT>0||p.charge>0||p.ads||p.rl>0||p.healT>0||p.opening||p.skillT>0||p.punch>0||cv.hitAT>0;
        // 하체
        let lo,loSp=1;
        if(!p.moving){lo=p.crouch?'Crouching':(gun?'Idle_A':'Melee_Unarmed_Idle')}
        else{const rel=angDiff2(Math.atan2(p.mdy,p.mdx),p.ang),ar=Math.abs(rel);
          if(p.crouch){lo='Sneaking';loSp=clamp(sp/2.2,.6,1.4)}
          else if(ar<.8){lo=sp>5.5?'Running_B':sp<3.5?'Walking_A':'Running_A';loSp=clamp(sp/(sp>5.5?6.3:sp<3.5?2.8:4.7),.6,1.35)}
          else if(ar>2.3){lo='Walking_Backwards';loSp=clamp(sp/2.6,.7,1.5)}
          else{lo=rel>0?'Running_Strafe_Right':'Running_Strafe_Left';loSp=clamp(sp/4.2,.6,1.3)}}
        // 상체
        let up;if(cv.hitAT>0)up='Hit_A';else if(p.opening)up='Interact';else if(p.healT>0)up='Use_Item';else if(p.skillT>0)up='Ranged_Magic_Raise';else if(p.punch>0)up='Melee_Unarmed_Attack_Punch_A';
        else if(p.rl>0)up=one?'Ranged_1H_Reload':'Ranged_2H_Reload';else if(gun)up=p.shotT>0||p.charge>0?(one?'Ranged_1H_Shooting':'Ranged_2H_Shooting'):(one?'Ranged_1H_Aiming':'Ranged_2H_Aiming');
        else up=p.moving?lo:'Melee_Unarmed_Idle';
        // 소총 들고 앞으로 달릴 땐 전신 동작 (가장 자연스러움)
        if(gun&&!one&&p.moving&&!p.crouch&&!busy&&(lo==='Running_A'||lo==='Running_B')){cv.play('full','Running_HoldingRifle',{speed:clamp(sp/5,.7,1.35),fade:.2});cv.setSpeed('full',clamp(sp/5,.7,1.35));pitch*=.4}
        else if(!gun&&!busy){cv.play('full',p.moving?lo:(p.crouch?'Crouching':'Melee_Unarmed_Idle'),{speed:loSp,fade:.2});cv.setSpeed('full',loSp);pitch=0}
        else{cv.play('lo',lo,{speed:loSp,fade:.18});cv.setSpeed('lo',loSp);cv.play('up',up,{once:up==='Melee_Unarmed_Attack_Punch_A'||up==='Ranged_Magic_Raise'||up==='Hit_A',fade:up==='Hit_A'?.06:.14});if(!gun)pitch=0}}}
    cv.update(dt,pitch)}
  for(const[id,cv]of V.chars)if(!alive.has(id)){cv.dispose();V.chars.delete(id)}}
const angDiff2=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
const ringGeo=new THREE.RingGeometry(.4,.47,28),discGeo=new THREE.CircleGeometry(.42,24),beamGeo=new THREE.CylinderGeometry(.07,.07,5,8,1,true);
function syncItems(){const seen=new Set();
  for(const it of S.items){if(hyp(it.x-cam.cx,it.y-cam.cz)>70)continue;seen.add(it.id);let o=V.items.get(it.id);const key=L.iconKey(it),rar=L.rarity(it);
    if(!o||o.key!==key){if(o)V.world.remove(o.g);const g=new THREE.Group();const c=RARC[rar];
      const disc=new THREE.Mesh(discGeo,new THREE.MeshBasicMaterial({color:rar?c:CATC[it.k],transparent:true,opacity:.3,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.y=.03;g.add(disc);
      const rg=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:rar?c:'#ffffff',transparent:true,opacity:.95,depthWrite:false}));rg.rotation.x=-Math.PI/2;rg.position.y=.035;g.add(rg);
      const m=getItemModel(key);m.scale.multiplyScalar(key.startsWith('w_')?.072:.06);const holder=new THREE.Group();holder.add(m);g.add(holder);
      if(rar>=2){const b=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:rar===3?.4:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));b.position.y=2.5;b.scale.set(rar===3?1.8:1,1,rar===3?1.8:1);g.add(b)}
      V.world.add(g);o={g,holder,disc,key,ph:Math.random()*6};V.items.set(it.id,o)}
    o.g.position.set(it.x,it.z,it.y);o.holder.rotation.y+=.016;o.holder.position.y=.2+Math.sin(gtimeV*2.5+o.ph)*.06;o.disc.material.opacity=.22+.12*Math.sin(gtimeV*4+o.ph)}
  for(const[id,o]of V.items)if(!seen.has(id)){V.world.remove(o.g);V.items.delete(id)}}
function syncDrops(dt){for(const d of S.drops){let o=V.drops.get(d.id);
    if(!o){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.4,1.6),MAT.crate);b.position.y=.7;b.castShadow=b.receiveShadow=true;g.add(b);
      const ch=new THREE.Group();const c=new THREE.Mesh(new THREE.SphereGeometry(2.6,18,8,0,TAU,0,Math.PI/2.4),MAT.chute);c.position.y=5;c.scale.y=.6;c.castShadow=true;ch.add(c);
      const pts=[];for(let i=0;i<8;i++){const a=i/8*TAU;pts.push(new THREE.Vector3(Math.cos(a)*2.2,4.8,Math.sin(a)*2.2),new THREE.Vector3(0,1.4,0))}ch.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#333'})));g.add(ch);
      V.world.add(g);o={g,b,ch,smokeT:0};V.drops.set(d.id,o)}
    o.g.position.set(d.x,d.gz+d.z*140,d.y);o.ch.visible=!d.landed;o.g.rotation.z=d.landed?0:Math.sin(gtimeV*1.5)*.08;
    if(d.opened&&o.b.material!==MAT.crateO)o.b.material=MAT.crateO;
    if(d.landed&&!d.opened){o.smokeT-=dt;if(o.smokeT<=0&&hyp(d.x-cam.cx,d.y-cam.cz)<250){o.smokeT=.12;addSmoke(d.x+(Math.random()-.5)*.4,d.gz+1.6,d.y+(Math.random()-.5)*.4,'#ff4a4a',4,1.2,2.4)}}}}
function syncSkills(dt){
  const seen=new Set();for(const b of S.barriers){seen.add(b.id);let o=V.barriers.get(b.id);
    if(!o){const m=new THREE.Mesh(new THREE.BoxGeometry(b.len,2.6,.08),new THREE.MeshStandardMaterial({color:'#ff8ccb',emissive:'#f06aa8',emissiveIntensity:1,transparent:true,opacity:.5,depthWrite:false,map:MAT.hexB,side:THREE.DoubleSide}));
      const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:'#ffe0f0'}));m.add(e);V.world.add(m);o={m};V.barriers.set(b.id,o)}
    o.m.position.set(b.x,b.z+1.3,b.y);o.m.rotation.y=Math.atan2(-b.nx,-b.ny);o.m.material.opacity=.5*Math.min(1,b.t/.3)*(.85+.15*Math.sin(gtimeV*12))}
  for(const[id,o]of V.barriers)if(!seen.has(id)){V.world.remove(o.m);o.m.geometry.dispose();V.barriers.delete(id)}
  const sf=new Set();for(const f of S.fields2){sf.add(f.id);let o=V.fields.get(f.id);
    if(!o){const m=new THREE.Mesh(new THREE.CircleGeometry(f.r,40),new THREE.MeshBasicMaterial({color:'#ffe14d',map:MAT.hexF,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(f.x,f.z+.06,f.y);V.world.add(m);o={m,t:0};V.fields.set(f.id,o)}
    o.m.material.opacity=.35+.2*Math.sin(gtimeV*18);o.t-=dt;if(o.t<=0){o.t=.12;const a=Math.random()*TAU,r=Math.random()*f.r;const p1=P3(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,f.z+.05);addBolt(p1,p1.clone().add(_v2.set((Math.random()-.5)*1.5,.8+Math.random(),(Math.random()-.5)*1.5)),'#ffe14d')}}
  for(const[id,o]of V.fields)if(!sf.has(id)){V.world.remove(o.m);V.fields.delete(id)}
  const ss=new Set();for(const s of S.stops){ss.add(s.id);let o=V.stops.get(s.id);
    if(!o){const m=new THREE.Mesh(new THREE.SphereGeometry(s.r,32,16),new THREE.MeshBasicMaterial({color:'#7fe7ff',map:MAT.hexS,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(s.x,s.z+.5,s.y);V.world.add(m);o={m};V.stops.set(s.id,o)}
    o.m.rotation.y+=dt*.6;o.m.material.opacity=.18+.08*Math.sin(gtimeV*6);o.m.scale.setScalar(s.t<.4?s.t/.4:1)}
  for(const[id,o]of V.stops)if(!ss.has(id)){V.world.remove(o.m);V.stops.delete(id)}}
function syncBullets(){const B=V.bulletsMesh,F=V.flameMesh;let n=0,f=0;
  for(const b of S.bullets){if(b.dead)continue;if(hyp(b.x-cam.cx,b.y-cam.cz)>220)continue;
    if(b.flame){if(f>=300)continue;const k=1-b.left/b.max;_m.compose(_v.set(b.x,b.z+k*.4,b.y),_q.setFromEuler(_e.set(k*3,k*5,0)),_s.setScalar(.15+k*.55));F.setMatrixAt(f++,_m);continue}
    if(n>=500)continue;const sp=hyp(b.vx,b.vy,b.vz)||1,len=b.frozen?.25:Math.min(3.5,sp*.006),w=b.k==='rail'?.08:b.frozen?.06:.025;_q.setFromUnitVectors(_v.set(0,0,1),_s.set(b.vx/sp,b.vz/sp,b.vy/sp));
    _m.compose(_v.set(b.x-b.vx/sp*len/2,b.z-b.vz/sp*len/2,b.y-b.vy/sp*len/2),_q,_s.set(w,w,len));B.setMatrixAt(n++,_m)}
  B.count=n;B.instanceMatrix.needsUpdate=true;F.count=f;F.instanceMatrix.needsUpdate=true}

/* ================= 로비 ================= */
let lobbyChar=null,lobbyKey=null,lobbyT=0;
function setupLobby(){lobbyScene=new THREE.Scene();lobbyScene.background=new THREE.Color('#3b6fe0');
  lobbyCam=new THREE.PerspectiveCamera(30,1,.1,100);
  lobbyScene.add(new THREE.HemisphereLight('#ffffff','#5a4a9a',1.6));const d=new THREE.DirectionalLight('#fff1d6',2.6);d.position.set(2,4,3);d.castShadow=true;d.shadow.mapSize.set(1024,1024);lobbyScene.add(d);
  const rim=new THREE.DirectionalLight('#9fd8ff',1.6);rim.position.set(-3,2,-3);lobbyScene.add(rim);
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.7,.28,48),new THREE.MeshStandardMaterial({color:'#ffd34d',roughness:.6}));plat.position.y=-.14;plat.receiveShadow=true;lobbyScene.add(plat);
  const plat2=new THREE.Mesh(new THREE.CylinderGeometry(1.9,2.1,.2,48),new THREE.MeshStandardMaterial({color:'#2a1f55',roughness:.8}));plat2.position.y=-.34;lobbyScene.add(plat2);
  const rg=new THREE.Mesh(new THREE.TorusGeometry(1.8,.04,8,64),new THREE.MeshBasicMaterial({color:'#ffffff'}));rg.rotation.x=Math.PI/2;rg.position.y=-.24;lobbyScene.add(rg)}
export function renderLobby(dt,ch,gunKey,xOff){if(!tpl[ch])return;if(lobbyKey!==ch){if(lobbyChar)lobbyChar.dispose();lobbyChar=new CharView(ch);lobbyChar.aura.visible=false;lobbyChar.setGun(gunKey);lobbyScene.add(lobbyChar.root);lobbyKey=ch;lobbyChar.play('full','Cheering',{once:true});lobbyT=2.2}
  lobbyT-=dt;if(lobbyT<=0&&!lobbyChar.cur.lo){lobbyChar.play('lo','Idle_A');lobbyChar.play('up','Ranged_2H_Aiming')}
  lobbyChar.root.rotation.y=Math.sin(performance.now()/2600)*.5+.25;lobbyChar.update(dt,0);
  lobbyCam.position.set(-(xOff||0),1.3,7.2);lobbyCam.lookAt(-(xOff||0),.95,0);renderer.render(lobbyScene,lobbyCam)}
