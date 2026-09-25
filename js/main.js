// 도트 로얄 v5 — 화면·조작·HUD·사운드
import * as L from './logic.js';
import * as V from './view.js';
import {iconURL,buildMapBg,drawMini,drawBigMap,ICON3D} from './art2d.js';
const {S,CHARS,CHK,WD,FAM,FAMN,AMMO,HEAL,MODCD,HELM,VEST,BAGCAP,hyp,clamp,angDiff,TAU}=L;
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
let state='loading',myChar=load('dr-char','shadow'),quality=load('dr-q','high'),muted=load('dr-mute',false),sens=load('dr-sens',1),assist=load('dr-assist',true),autoFire=load('dr-af',true),gyro=load('dr-gyro',false),vib=load('dr-vib',true),showFps=load('dr-fps',true);
if(!CHARS[myChar])myChar='shadow';
window.__DR={S,L,V};

/* ================= 로딩 ================= */
(async()=>{
  try{await V.initView($('#c3d'),p=>{$('#lbar i').style.width=Math.round(p*100)+'%'})}
  catch(e){$('#ltxt').textContent='불러오기에 실패했습니다. 새로고침해 주세요';console.error(e);return}
  $('#ltxt').textContent='아이콘과 소리 준비 중';await new Promise(r=>setTimeout(r,30));
  V.setQuality(quality);V.makeIcons(ICON3D);Snd.preload();applyLayout();buildLobby();showLobby();requestAnimationFrame(loop);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
async function goLandscape(){try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)await d.requestFullscreen({navigationUI:'hide'});if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}}
addEventListener('pointerdown',()=>{Snd.resume();if(!document.fullscreenElement&&matchMedia('(pointer:coarse)').matches)goLandscape()},{capture:true});

/* ================= 화면 전환 ================= */
function fade(fn){const f=$('#fade');f.classList.add('on');setTimeout(()=>{try{fn()}finally{requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')))}},260)}
const buzz=(ms)=>{if(vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};
/* ================= 로비 ================= */
function buildLobby(){const box=$('#chars');box.innerHTML='';
  for(const k of CHK){const C=CHARS[k],b=document.createElement('button');b.className='cbtn o';b.dataset.ch=k;b.style.background=C.c2;b.textContent=C.n;
    b.addEventListener('click',()=>{myChar=k;save('dr-char',k);renderDetail();Snd.ui()});box.appendChild(b)}renderDetail()}
function renderDetail(){for(const b of $$('.cbtn'))b.classList.toggle('on',b.dataset.ch===myChar);const C=CHARS[myChar];
  $('#detail').innerHTML=`<h2 class="o hd" style="color:${C.c}">${C.n}</h2><span class="ds" style="font-size:13px;color:var(--dim)">${C.tag}</span>
   <div class="sk"><span class="lb">패시브</span><span class="nm2">${C.pas.n}</span><span class="ds">${C.pas.d}</span></div>
   <div class="sk"><span class="lb">액티브 (무기에 따라 변화)</span><span class="nm2">${C.act.n}</span><span class="ds">${C.act.d}</span>
   <div class="var">${['near','mid','far'].map(f=>`<b>${FAMN[f]} · ${C.act[f].n}</b><span>${C.act[f].d}</span>`).join('')}</div></div>`;
  const b=load('dr-best',null);$('#best').textContent=b?`최고 ${b.rank}위 · 최다 처치 ${b.kills}`:''}
function showLobby(){state='lobby';for(const s of['#loading','#match','#over','#hud','#settings','#big','#bExit'])$(s).hidden=true;$('#lobby').hidden=false;$('#tint').style.opacity=0;$('#scope').style.display='none';Snd.stopLoops();renderDetail();document.exitPointerLock&&document.exitPointerLock()}
$('#bPlay').addEventListener('click',()=>{Snd.ui();goLandscape();fade(startMatching)});
$('#bTrain').addEventListener('click',()=>{Snd.ui();goLandscape();fade(startTrainingFlow)});
$('#bExit').addEventListener('click',()=>{Snd.ui();fade(showLobby)});
$('#bSettings').addEventListener('click',()=>{$('#settings').hidden=false;syncSettings()});
$('#setClose').addEventListener('click',()=>$('#settings').hidden=true);
function syncSettings(){$$('#settings [data-q]').forEach(b=>b.classList.toggle('on',b.dataset.q===quality));$$('#settings [data-s]').forEach(b=>b.classList.toggle('on',(b.dataset.s==='off')===muted));
  $$('#settings [data-a]').forEach(b=>b.classList.toggle('on',(b.dataset.a==='on')===assist));
  for(const[k,v]of[['af',autoFire],['gy',gyro],['vb',vib],['fp',showFps]])$$('#settings [data-'+k+']').forEach(b=>b.classList.toggle('on',(b.dataset[k]==='on')===v));$('#sens').value=sens;$('#sensV').textContent=(+sens).toFixed(2)}
$$('#settings [data-q]').forEach(b=>b.addEventListener('click',()=>{quality=b.dataset.q;save('dr-q',quality);V.setQuality(quality);syncSettings()}));
$$('#settings [data-s]').forEach(b=>b.addEventListener('click',()=>{muted=b.dataset.s==='off';save('dr-mute',muted);Snd.setMute(muted);syncSettings()}));
$$('#settings [data-a]').forEach(b=>b.addEventListener('click',()=>{assist=b.dataset.a==='on';save('dr-assist',assist);syncSettings()}));
$$('#settings [data-af]').forEach(b=>b.addEventListener('click',()=>{autoFire=b.dataset.af==='on';save('dr-af',autoFire);syncSettings()}));
$$('#settings [data-gy]').forEach(b=>b.addEventListener('click',()=>{gyro=b.dataset.gy==='on';save('dr-gyro',gyro);syncSettings();if(gyro&&typeof DeviceMotionEvent!=='undefined'&&DeviceMotionEvent.requestPermission)DeviceMotionEvent.requestPermission().catch(()=>{})}));
$$('#settings [data-vb]').forEach(b=>b.addEventListener('click',()=>{vib=b.dataset.vb==='on';save('dr-vib',vib);syncSettings();buzz(30)}));
$$('#settings [data-fp]').forEach(b=>b.addEventListener('click',()=>{showFps=b.dataset.fp==='on';save('dr-fps',showFps);syncSettings()}));
$('#sens').addEventListener('input',e=>{sens=+e.target.value;save('dr-sens',sens);$('#sensV').textContent=sens.toFixed(2)});
$('#bEdit').addEventListener('click',()=>{$('#settings').hidden=true;startEdit()});

/* ================= 매칭 ================= */
let matchTimer=null;
function startMatching(){state='match';$('#match').hidden=false;$('#lobby').hidden=true;const box=$('#mNames');box.innerHTML='';
  let n=1;$('#mCount').textContent='1 / 25';const names=[...L.BOTN].sort(()=>Math.random()-.5);let built=false;
  $('#mProg i').style.width='0%';setTimeout(async()=>{L.genWorld((Math.random()*1e9)|0);buildMapBg();await V.buildWorld(f=>{$('#mProg i').style.width=Math.round(f*100)+'%'});$('#mProg i').style.width='100%';built=true},60);
  const tick=()=>{if(state!=='match')return;if(n<25){n++;$('#mCount').textContent=n+' / 25';const s=document.createElement('span');s.textContent=names[n-2];box.appendChild(s);Snd.tick(n)}
    if(n>=25&&built){$('#match h2').textContent='비행기 탑승';matchTimer=setTimeout(()=>fade(beginGame),500)}else matchTimer=setTimeout(tick,60+Math.random()*160)};
  $('#match h2').textContent='매칭 중';matchTimer=setTimeout(tick,500)}
$('#mCancel').addEventListener('click',()=>{clearTimeout(matchTimer);showLobby()});
function beginGame(){L.startMatch(myChar);V.prepareMatch();V.cam.yaw=S.plane.ang+Math.PI/2;V.cam.pitch=-.35;V.cam.sx=null;V.prewarm(S.plane.x,S.plane.y);
  state='play';$('#match').hidden=true;$('#bExit').hidden=true;$('#hud').hidden=false;$('#inv').hidden=true;$('#who').textContent=CHARS[myChar].n;$('#who').style.background=CHARS[myChar].c;feedDirty=true;
  toast('원하는 곳 위에서 뛰어내리기를 누르세요');Snd.loop('plane',.35)}

/* ================= 입력 ================= */
const ctl={L:{id:null,ox:0,oy:0,x:0,y:0},look:{id:null,x:0,y:0},F:{id:null,x:0,y:0},F2:{id:null,x:0,y:0},dx:0,dy:0,keys:{},mdown:false,rdown:false,locked:false,ads:false,pend:{},mouse:false};
const STICK=55,touchEl=$('#touch'),sL=$('#sL');
function stickHome(){const r=sL.getBoundingClientRect();return[innerWidth*.14+ (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sl'))||0),innerHeight*.66]}
function vec(s,R=STICK){let dx=s.x-s.ox,dy=s.y-s.oy;const m=hyp(dx,dy);return[dx/R,dy/R,m/R]}
function drawStick(){const s=ctl.L;let ox,oy,vx=0,vy=0,run=false;if(s.id!==null){ox=s.ox;oy=s.oy;const[a,b,m]=vec(s);const k=m>1?1/m:1;vx=a*k;vy=b*k;run=runState()}else[ox,oy]=stickHome();
  sL.style.left=ox+'px';sL.style.top=oy+'px';sL.querySelector('i').style.transform=`translate(${vx*STICK}px,${vy*STICK}px)`;sL.classList.toggle('run',run)}
function runState(){const s=ctl.L;if(s.id===null)return false;const[a,b,m]=vec(s);return m>1.15&&b<-.75*m}
touchEl.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){ctl.mouse=true;if(state==='play'&&!ctl.locked&&touchEl.requestPointerLock)touchEl.requestPointerLock();if(e.button===0)ctl.mdown=true;if(e.button===2)ctl.rdown=true;return}
  e.preventDefault();ctl.mouse=false;touchEl.setPointerCapture(e.pointerId);
  if(e.clientX<innerWidth*.42&&ctl.L.id===null){const s=ctl.L;s.id=e.pointerId;s.ox=s.x=e.clientX;s.oy=s.y=e.clientY}
  else if(ctl.look.id===null){ctl.look.id=e.pointerId;ctl.look.x=e.clientX;ctl.look.y=e.clientY}});
touchEl.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){if(ctl.locked){ctl.dx+=e.movementX*.6;ctl.dy+=e.movementY*.6}return}
  if(ctl.L.id===e.pointerId){ctl.L.x=e.clientX;ctl.L.y=e.clientY}
  if(ctl.look.id===e.pointerId){ctl.dx+=e.clientX-ctl.look.x;ctl.dy+=e.clientY-ctl.look.y;ctl.look.x=e.clientX;ctl.look.y=e.clientY}});
const tEnd=e=>{if(e.pointerType==='mouse'){if(e.button===0)ctl.mdown=false;if(e.button===2)ctl.rdown=false;return}if(ctl.L.id===e.pointerId)ctl.L.id=null;if(ctl.look.id===e.pointerId)ctl.look.id=null};
touchEl.addEventListener('pointerup',tEnd);touchEl.addEventListener('pointercancel',tEnd);touchEl.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>{ctl.locked=document.pointerLockElement===touchEl});
addEventListener('mouseup',e=>{if(e.button===0)ctl.mdown=false;if(e.button===2)ctl.rdown=false});
// 사격 버튼: 누르면 사격, 누른 채로 끌면 시점 이동
function fireBtn(el,key){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(editing)return;el.setPointerCapture(e.pointerId);const F=ctl[key];F.id=e.pointerId;F.x=e.clientX;F.y=e.clientY;el.classList.add('on')});
  el.addEventListener('pointermove',e=>{const F=ctl[key];if(F.id!==e.pointerId)return;ctl.dx+=e.clientX-F.x;ctl.dy+=e.clientY-F.y;F.x=e.clientX;F.y=e.clientY});
  const up=e=>{const F=ctl[key];if(F.id!==e.pointerId)return;F.id=null;el.classList.remove('on')};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
fireBtn($('#bFire'),'F');fireBtn($('#bFireL'),'F2');
const on=(el,fn)=>el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(editing)return;fn(e)});
on($('#bAds'),()=>{ctl.ads=!ctl.ads;Snd.ui()});on($('#bCrouch'),()=>ctl.pend.crouchT=true);on($('#bJump'),()=>ctl.pend.jump=true);on($('#bReload'),()=>ctl.pend.reload=true);
on($('#bSkill'),()=>ctl.pend.skill=true);on($('#bCtx'),()=>ctl.pend.ctx=true);on($('#bBag'),()=>toggleInv());on($('#invClose'),()=>toggleInv(false));on($('#mini'),()=>toggleBig());
$$('.qb[data-h]').forEach(b=>on(b,()=>ctl.pend.use=b.dataset.h));$$('.slot').forEach(b=>on(b,()=>{ctl.pend.sw=+b.dataset.s}));
$('#big').addEventListener('pointerdown',e=>{e.preventDefault();toggleBig(false)});
$('#autoPick').addEventListener('change',e=>{S.autoPick=e.target.checked});
$('#inv').addEventListener('pointerdown',e=>{e.stopPropagation();const b=e.target.closest('button[data-a]');if(!b)return;e.preventDefault();invAction(b.dataset.a);invSig=''});
$('#loot').addEventListener('pointerdown',e=>{e.stopPropagation();const b=e.target.closest('[data-id]');if(!b)return;e.preventDefault();const it=S.items.find(i=>i.id===+b.dataset.id);if(it){L.pickItem(S.me,it,true);handleEvents(S.events.splice(0));lootSig=''}});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();ctl.keys[k]=true;if(state!=='play')return;const P=ctl.pend;
  if(k==='tab'||k==='i'||k==='e'){e.preventDefault();toggleInv()}if(k==='r')P.reload=true;if(k==='f')P.ctx=true;if(k===' '){e.preventDefault();P.jump=true}if(k==='c'||k==='control')P.crouchT=true;if(k==='q')P.skill=true;
  if(k==='1')P.sw=0;if(k==='2')P.sw=1;if(k==='3')P.sw=2;if(k==='4')P.use='bandage';if(k==='5')P.use='medkit';if(k==='6')P.use='drink';if(k==='m')toggleBig();if(k==='escape'){toggleInv(false);toggleBig(false)}});
addEventListener('keyup',e=>{ctl.keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{ctl.keys={};ctl.mdown=false;ctl.rdown=false});

/* ---------- 버튼 배치 편집 ---------- */
let editing=false,drag=null;const LAYOUT_IDS=['bFire','bFireL','bAds','bCrouch','bJump','bReload','bSkill','bBag','heals'];
function applyLayout(){const lay=load('dr-layout',{});for(const id of LAYOUT_IDS){const el=$('#'+id);if(!el)continue;const p=lay[id];
  if(p){el.style.left=p.x+'%';el.style.top=p.y+'%';el.style.right='auto';el.style.bottom='auto';el.style.transform='translate(-50%,-50%)'}else{el.style.left=el.style.top=el.style.right=el.style.bottom=el.style.transform=''}}}
function startEdit(){editing=true;document.body.classList.add('edit');$('#editBar').hidden=false;$('#hud').hidden=false;$('#lobby').hidden=true;$('#hud').style.pointerEvents='auto'}
function endEdit(){editing=false;document.body.classList.remove('edit');$('#editBar').hidden=true;$('#hud').style.pointerEvents='';if(state!=='play'){$('#hud').hidden=true;$('#lobby').hidden=false}}
$('#edDone').addEventListener('click',endEdit);$('#edReset').addEventListener('click',()=>{save('dr-layout',{});applyLayout()});
document.addEventListener('pointerdown',e=>{if(!editing)return;const el=e.target.closest(LAYOUT_IDS.map(i=>'#'+i).join(','));if(!el)return;e.preventDefault();drag={el,id:el.dataset.id||el.id,pid:e.pointerId}},true);
document.addEventListener('pointermove',e=>{if(!drag||drag.pid!==e.pointerId)return;const x=clamp(e.clientX/innerWidth*100,3,97),y=clamp(e.clientY/innerHeight*100,5,95);const el=drag.el;el.style.left=x+'%';el.style.top=y+'%';el.style.right='auto';el.style.bottom='auto';el.style.transform='translate(-50%,-50%)'},true);
document.addEventListener('pointerup',e=>{if(!drag||drag.pid!==e.pointerId)return;const lay=load('dr-layout',{});lay[drag.id]={x:parseFloat(drag.el.style.left),y:parseFloat(drag.el.style.top)};save('dr-layout',lay);drag=null},true);

/* ---------- 자이로 조준 ---------- */
const gyroAcc={y:0,p:0};
addEventListener('devicemotion',e=>{if(!gyro||state!=='play')return;const r=e.rotationRate;if(!r)return;const ang=(screen.orientation&&screen.orientation.angle)||window.orientation||90,sg=ang===270||ang===-90?-1:1,dt=(e.interval>1?e.interval/1000:e.interval)||.016;
  gyroAcc.y+=-(r.beta||0)*sg*dt*Math.PI/180;gyroAcc.p+=(r.gamma||0)*sg*dt*Math.PI/180});
/* ---------- 한 프레임 입력 ---------- */
function humanInput(dt){
  const p=S.me,P=ctl.pend,cam=V.cam,k=ctl.keys;
  // 시점
  const kf=.0042*sens*(cam.fov/62);cam.yaw+=ctl.dx*kf;cam.pitch-=ctl.dy*kf;ctl.dx=ctl.dy=0;
  if(gyro){const g=1.1*sens*(cam.fov/62);cam.yaw+=gyroAcc.y*g;cam.pitch+=gyroAcc.p*g}gyroAcc.y=gyroAcc.p=0;
  // 이동 (카메라 기준)
  let fwd=0,side=0,mag=0;const s=ctl.L;
  if(s.id!==null){const[a,b,m]=vec(s);const kk=m>1?1/m:1;side=a*kk;fwd=-b*kk;mag=Math.min(1,m)}
  const kx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0),ky=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0);if(kx||ky){side=kx;fwd=ky;mag=1}
  const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);let mx=cy*fwd-sy*side,my=sy*fwd+cy*side;if(hyp(mx,my)<.12){mx=my=0}
  let fire=ctl.F.id!==null||ctl.F2.id!==null||(ctl.locked&&ctl.mdown);
  {const w=L.curW(p);if(autoFire&&!ctl.mouse&&!fire&&w&&p.ph==='ground'&&cam.aimHit&&cam.aimHit.alive&&w.mag>0&&p.rl<=0&&!L.invisible(p)&&w.k!=='rail'){fire=true;$('#xh').classList.add('auto')}else $('#xh').classList.remove('auto')}
  const ads=(ctl.ads||(ctl.locked&&ctl.rdown))&&!!L.curW(p)&&p.ph==='ground';cam.ads=ads;
  if(assist&&!ctl.mouse&&p.ph==='ground'&&(fire||ads)){const w=L.curW(p);const t=V.assistTarget(ads?.06:.1,w?WD[w.k].rng:20);if(t){const kk=Math.min(1,dt*(fire?3.2:2));cam.yaw+=angDiff(t.yaw,cam.yaw)*kk*.35;cam.pitch+=(t.pitch-cam.pitch)*kk*.3}}
  const inp={mx,my,aim:cam.yaw,pitch:cam.pitch,aimPt:cam.aimPt,fire,ads,sprint:runState()||k.shift,crouchT:P.crouchT,jump:P.jump,reload:P.reload,skill:P.skill,use:P.use,sw:P.sw,open:false,door:false,jumpPlane:false};
  if(p.ph==='plane'&&P.jump)inp.jumpPlane=true;
  if(P.ctx){if(p.ph==='plane')inp.jumpPlane=true;else if(L.nearDrop(p))inp.open=true;else if(L.nearDoor(p))inp.door=true}
  drawStick();ctl.pend={};return inp}

async function startTrainingFlow(){state='match';$('#lobby').hidden=true;$('#match').hidden=false;$('#match h2').textContent='훈련장 준비 중';$('#mCount').textContent='';$('#mNames').innerHTML='';$('#mProg i').style.width='0%';
  L.genWorld((Math.random()*1e9)|0);buildMapBg();await V.buildWorld(f=>{$('#mProg i').style.width=Math.round(f*100)+'%'});
  fade(()=>{L.startTraining(myChar);V.prepareMatch();V.cam.yaw=-Math.PI/2;V.cam.pitch=-.05;V.cam.sx=null;V.prewarm(S.me.x,S.me.y);
    state='play';$('#match').hidden=true;$('#hud').hidden=false;$('#inv').hidden=true;$('#bExit').hidden=false;$('#who').textContent=CHARS[myChar].n;$('#who').style.background=CHARS[myChar].c;feedDirty=true;
    toast('훈련장: 과녁에 총과 스킬을 시험해 보세요 (스킬 쿨타임 4초)')})}
/* ================= 루프 ================= */
let last=performance.now(),hurtFade=0,skillFxT=0,hitmT=0;
let fpsAcc=0,fpsN=0,fpsT=0,fpsV=60,lowT=0;
function loop(now){const rdt=(now-last)/1000;const dt=Math.min(.05,rdt);last=now;
  if(state==='play'){fpsAcc+=rdt;fpsN++;fpsT+=rdt;if(fpsT>=1){fpsV=fpsN/fpsAcc;fpsAcc=fpsN=0;fpsT=0;const el=$('#fps');el.hidden=!showFps;el.textContent=Math.round(fpsV)+' FPS · '+Math.round(V.getResScale()*100)+'%';el.classList.toggle('bad',fpsV<45);
    if(fpsV<50){lowT++;if(lowT>=2){V.setResScale(V.getResScale()-.08);lowT=0}}else{lowT=0;if(fpsV>58&&V.getResScale()<1)V.setResScale(V.getResScale()+.04)}}}else $('#fps').hidden=true;
  if(state==='play'||state==='over'){if(S.me){const inp=state==='play'&&S.me.alive&&!editing?humanInput(dt):{mx:0,my:0,aim:S.me.ang,fire:false};L.step(dt,inp);
      const evs=S.events.splice(0);V.handleEvents(evs);handleEvents(evs);V.renderGame(dt);Snd.update(dt);if(state==='play'){updHud(dt);updNums(dt);updDirs(dt);updBuffs()}}}
  else if(state==='lobby'||state==='match'){V.renderLobby(dt,myChar,{shadow:'sniper',chrono:'smg',psy:'ar',volt:'shotgun'}[myChar],innerWidth>700?1.05:0)}
  requestAnimationFrame(loop)}
let bannerT={};function showBanner(id,t,d,c){const el=$(id);el.querySelector('b').textContent=t;const sm=el.querySelector('small');if(sm)sm.textContent=d||'';el.style.setProperty('--c',c);el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(bannerT[id]);bannerT[id]=setTimeout(()=>el.classList.remove('show'),1600)}
const BUFFN={invis:'투명',xray:'사냥꾼의 눈',steady:'안정',dash:'질주',ambush:'기습 준비',haste:'잔상',nofire:'사격 불가'};
function updBuffs(){const me=S.me;if(!me)return;const L2=[];for(const k in BUFFN)if(me.buff[k]>0)L2.push([BUFFN[k],me.buff[k],CHARS[me.ch].c]);if(me.stunT>0)L2.push(['기절',me.stunT,'#ffcf3d']);if(me.slowT>0)L2.push(['둔화',me.slowT,'#6fd0ff']);
  const h=L2.map(b=>`<span style="--c:${b[2]}">${b[0]} <b>${b[1].toFixed(1)}</b></span>`).join('');const el=$('#buffs');if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}}
function handleEvents(evs){const me=S.me;for(const e of evs){switch(e.t){
  case 'toast':toast(e.s);break;case 'feed':feedDirty=true;break;
  case 'hurt':if(!e.zone)buzz(40);$('#hurt').style.opacity=e.zone?.35:.7;hurtFade=.25;if(e.src&&e.src!==me)addDmgDir(e.src);if(!e.zone)Snd.play('hit_body'+(Math.random()<.5?0:1),.5);break;
  case 'num':addNum(e.x,e.y,e.z,e.v,e.head);buzz(e.head?25:12);showHitm(e.head);Snd.play(e.head?'hit_helm':'hit_body0',e.head?.8:.45,e.head?1.2:1.3);break;
  case 'shot':Snd.gun(e.k,e.p,e.x,e.y,e.z);if(e.p!==me&&e.k!=='fist')addSndDir(e.x,e.y,'gun',1.2);break;
  case 'skill':Snd.skill(e.p);if(e.p===me){const f=e.f;showBanner('#skillBanner',CHARS[me.ch].act[f].n,CHARS[me.ch].act[f].d,CHARS[me.ch].c);buzz(35);$('#skillFx').style.boxShadow='inset 0 0 90px 22px '+CHARS[me.ch].c;$('#skillFx').style.opacity=1;skillFxT=.5}break;
  case 'stun':if(e.p===me){toast('기절!');buzz(80)}break;
  case 'uncloak':if(e.p===me)Snd.play('cloak',.5,1.4);break;
  case 'step':Snd.step(e.p,e.land);if(e.p!==me&&hyp(e.p.x-me.x,e.p.y-me.y)<28&&e.p.alive)addSndDir(e.p.x,e.p.y,'step',.7);break;
  case 'hop':if(e.p===me)Snd.play('cloth1',.4);break;
  case 'door':Snd.at(e.d.open?'door_open':'door_close',e.d.cx,e.d.cy,.8);break;
  case 'jump':Snd.stopLoops();Snd.loop('wind',.25);Snd.play('cloth2',.6);break;
  case 'chute':Snd.play('cloth1',.8,.7);Snd.loopVol('wind',.12);break;
  case 'land':Snd.stopLoops();Snd.play('land',.8);Snd.play('v_go',.7);break;
  case 'zoneMove':toast('자기장이 줄어들기 시작합니다');Snd.play('v_hurry',.6);break;
  case 'kill':if(e.n>=2)Snd.play('v_multi',.7);showBanner('#killBanner',e.n>=2?e.n+'연속 처치!':'처치!','','#ff5b5b');buzz(60);break;
  case 'die':if(e.p===me){Snd.play('v_over',.7);$('#inv').hidden=true;V.cam.ads=false;ctl.ads=false}else Snd.at('crunch',e.p.x,e.p.y,.3);break;
  case 'dust':Snd.at('boom',e.x,e.y,.8);break;
  case 'sfx':{const m={drop:['crunch',.4],open:['rl_latch',.7],equip:['equip',.6],pick:['pick',.7],heal:['cloth2',.6],charge:['zap',.6],dry:['rl_click',.7]}[e.k];
    if(e.k==='reload'){if(e.p===me){Snd.play('rl_click',.7);setTimeout(()=>Snd.play('rl_latch',.7),600)}else Snd.at('rl_click',e.x,e.y,.5)}else if(m){if(e.p&&e.p!==me)Snd.at(m[0],e.x,e.y,m[1]);else Snd.play(m[0],m[1])}break}
  case 'end':endGame(e.win);break}}}

/* ================= HUD ================= */
let feedDirty=true,hudT=0,toastT=0,invSig='',lootSig='';const cache=new Map();
function setT(el,s){if(cache.get(el)!==s){cache.set(el,s);el.textContent=s}}
function setSrc(img,key){if(img.dataset.k!==key){img.dataset.k=key;img.src=key?iconURL(key):'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}}
function toast(s){const t=$('#toast');t.textContent=s;t.style.opacity=1;toastT=1.8}
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const hpI=$('#hp i'),boI=$('#boost i'),prog=$('#prog'),slotEls=[...$$('.slot')],qbEls=[...$$('.qb[data-h]')],skillEl=$('#bSkill'),ctxEl=$('#bCtx'),xh=$('#xh'),xhI=[...$$('#xh i')];
function showHitm(head){const h=$('#hitm');h.classList.toggle('head',!!head);h.style.opacity=1;hitmT=.18}
function updHud(dt){const me=S.me,z=S.zone,cam=V.cam;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('#toast').style.opacity=0}
  if(hurtFade>0){hurtFade-=dt;if(hurtFade<=0)$('#hurt').style.opacity=0}
  if(hitmT>0){hitmT-=dt;if(hitmT<=0)$('#hitm').style.opacity=0}
  {const B=me.buff,act=Math.max(B.invis||0,B.steady||0,B.xray||0,me.ch==='chrono'?B.haste||0:0);if(skillFxT>0)skillFxT-=dt;$('#skillFx').style.opacity=skillFxT>0?1:act>0?.5:0;if(act>0&&skillFxT<=0)$('#skillFx').style.boxShadow='inset 0 0 70px 14px '+CHARS[me.ch].c}
  const outside=me.alive&&me.ph==='ground'&&hyp(me.x-z.cx,me.y-z.cy)>z.r;$('#tint').style.opacity=outside?1:0;
  // 조준점
  const ground=me.ph==='ground'&&me.alive,w=L.curW(me),scoped=cam.scope>1.5;$('#scope').style.display=scoped&&ground?'block':'none';
  xh.style.display=ground&&!scoped?'block':'none';
  if(ground){const d=w?WD[w.k]:null;const spr=d?(d.spr*(me.moving?1.6:1)*(cam.ads?.45:1)*(me.crouch?.75:1)+me.recoil):.02;const gap=4+spr*innerHeight*(62/cam.fov)*.9;
    xhI[0].style.top=(-gap-8)+'px';xhI[1].style.top=gap+'px';xhI[2].style.left=(-gap-8)+'px';xhI[3].style.left=gap+'px';xh.classList.toggle('on',!!cam.aimHit)}
  hpI.style.width=Math.max(0,me.hp)+'%';hpI.style.background=me.hp>35?'#f2f2f2':'var(--red)';boI.style.width=me.boost+'%';
  const C=CHARS[me.ch],f=L.famOf(me),pct=me.skillCD>0?me.skillCD/MODCD[me.mod]*100:0;
  skillEl.querySelector('.cd').style.background=pct>0?`conic-gradient(rgba(27,19,48,.75) ${pct}%, transparent 0)`:'none';
  drawCompass();drawMini($('#mini').getContext('2d'),236,S.gtime,cam.yaw);
  hudT-=dt;if(hudT>0)return;hudT=.1;
  const air=me.ph!=='ground';
  for(const el of['#bFire','#bFireL','#bAds','#bCrouch','#bJump','#bReload','#bSkill','#slots','#heals','#bBag','#loot'])$(el).style.visibility=air||!me.alive?'hidden':'visible';
  $('#bAds').classList.toggle('on',cam.ads);$('#bCrouch').classList.toggle('on',me.crouch);
  setT($('#hpTxt'),String(Math.ceil(Math.max(0,me.hp))));setT($('#alive'),String(S.aliveN));setT($('#kills'),String(me.kills));
  const zi=$('#zoneInfo');let zt=z.state==='wait'?'자기장 축소까지 '+fmt(z.t):z.state==='shrink'?'자기장 축소 중 '+fmt(z.t):'최종 자기장';if(outside)zt='자기장 밖! 안으로 이동 ('+Math.round(hyp(me.x-z.cx,me.y-z.cy)-z.r)+'m)';zi.classList.toggle('warn',outside);setT(zi,zt);
  skillEl.style.background=C.c+'aa';skillEl.classList.toggle('lock',!f);setT(skillEl.querySelector('span'),f?C.act[f].n:C.act.n);
  {const B=me.buff,act=Math.max(B.invis||0,B.steady||0,B.xray||0);setT(skillEl.querySelector('small'),!f?'무기 필요':act>0?'발동 '+act.toFixed(1):me.skillCD>0?Math.ceil(me.skillCD)+'초':'준비');skillEl.classList.toggle('ready',!!f&&me.skillCD<=0)}
  for(const el of slotEls){const s=+el.dataset.s,nm=el.querySelector('.nm'),am=el.querySelector('.am'),img=el.querySelector('img');el.classList.toggle('on',me.cur===s);
    if(s===2){setT(nm,'주먹');setT(am,'');setSrc(img,'');continue}
    const ww=me.w[s];el.classList.toggle('empty',!ww);if(ww){setT(nm,WD[ww.k].n);setT(am,WD[ww.k].special?String(ww.mag):ww.mag+'/'+me.ammo[WD[ww.k].ak]);setSrc(img,'w_'+ww.k)}else{setT(nm,'빈 슬롯');setT(am,'');setSrc(img,'')}}
  for(const el of qbEls){const k=el.dataset.h;setT(el.querySelector('b'),String(me.heal[k]));setSrc(el.querySelector('img'),'h_'+k);el.classList.toggle('off',me.heal[k]===0)}
  setSrc($('#bBag img'),'bag'+Math.max(1,me.bag));setT($('#bagPct'),Math.round(L.weight(me)/L.capOf(me)*100)+'%');
  const gear=[];if(me.helm)gear.push('ar_helm'+me.helm);if(me.vest)gear.push('ar_vest'+me.vest);if(me.mod)gear.push('mod'+me.mod);const gs=gear.join();
  if(cache.get('gear')!==gs){cache.set('gear',gs);$('#gear').innerHTML=gear.map(k=>`<img alt="" src="${iconURL(k)}">`).join('')}
  // 상황 버튼
  ctxEl.classList.remove('jump');let ct=null;
  if(me.ph==='plane'){ct='뛰어내리기';ctxEl.classList.add('jump')}
  else if(!air&&me.alive){const d=L.nearDrop(me),dr=L.nearDoor(me);if(d&&!me.opening)ct='보급상자 열기 (3초)';else if(dr)ct=dr.open?'문 닫기':'문 열기'}
  ctxEl.hidden=!ct;if(ct)setT(ctxEl.querySelector('span'),ct);
  // 진행 막대
  let pr=null;if(me.opening)pr=['보급상자 여는 중',3,me.openT];else if(me.healT>0)pr=[HEAL[me.healK].n+' 사용 중',HEAL[me.healK].t,me.healT];else if(me.rl>0&&w)pr=['장전 중',WD[w.k].rl,me.rl];else if(me.charge>0)pr=['레일건 충전',1,me.charge];
  else if(air&&me.ph!=='plane')pr=[(me.ph==='fall'?'자유낙하 ':'낙하산 ')+Math.round(me.z-L.groundH(me.x,me.y))+'m',L.ALT,me.z];
  if(pr){prog.hidden=false;setT(prog.querySelector('span'),air?pr[0]:pr[0]+' '+pr[2].toFixed(1)+'초');prog.querySelector('i').style.width=(100*(1-pr[2]/pr[1]))+'%'}else prog.hidden=true;
  if(feedDirty){feedDirty=false;$('#feed').innerHTML=S.feed.map(f=>`<div class="${f.me?'me':''}">${esc(f.txt)}</div>`).join('')}
  renderLoot();if(!$('#inv').hidden)renderInv()}
// 나침반
const compass=$('#compass'),cg=compass.getContext('2d');
function drawCompass(){const W2=compass.width,H2=compass.height,cam=V.cam,me=S.me;cg.clearRect(0,0,W2,H2);cg.fillStyle='rgba(20,14,40,.45)';cg.fillRect(0,0,W2,H2);
  const head=((cam.yaw*180/Math.PI+90)%360+360)%360,span=120,ppd=W2/span;cg.textAlign='center';cg.textBaseline='middle';
  for(let d=Math.floor(head-span/2);d<=head+span/2;d++){if(d%5)continue;const x=W2/2+(d-head)*ppd,dd=((d%360)+360)%360;cg.fillStyle='#fff';
    if(dd%45===0){const lab={0:'북',45:'북동',90:'동',135:'남동',180:'남',225:'남서',270:'서',315:'북서'}[dd];cg.font='bold 26px Jua,sans-serif';cg.fillStyle=dd%90===0?'#ffd34d':'#fff';cg.fillText(lab,x,40);cg.fillRect(x-1,4,3,14)}
    else if(dd%15===0){cg.font='18px Jua,sans-serif';cg.globalAlpha=.8;cg.fillText(String(dd),x,42);cg.globalAlpha=1;cg.fillRect(x-1,4,2,10)}else{cg.globalAlpha=.6;cg.fillRect(x-1,4,2,6);cg.globalAlpha=1}}
  cg.fillStyle='#ffd34d';cg.beginPath();cg.moveTo(W2/2-8,H2);cg.lineTo(W2/2+8,H2);cg.lineTo(W2/2,H2-10);cg.fill();
  const z=S.zone;if(me&&z&&me.ph==='ground'){const out=hyp(me.x-z.tx,me.y-z.ty)>z.tr;if(out){const b=((Math.atan2(z.ty-me.y,z.tx-me.x)*180/Math.PI+90)%360+360)%360;let dd=b-head;dd=((dd+540)%360)-180;const x=clamp(W2/2+dd*ppd,10,W2-10);cg.fillStyle='#6f9bff';cg.beginPath();cg.moveTo(x-9,2);cg.lineTo(x+9,2);cg.lineTo(x,16);cg.fill()}}}
// 방향 표시 (피격, 소리)
const dirs=[];function addDmgDir(src){const el=document.createElement('div');el.className='dmgdir';$('#dirs').appendChild(el);dirs.push({el,x:src.x,y:src.y,t:1.2,max:1.2,kind:'dmg'})}
function addSndDir(x,y,kind,life){if(dirs.filter(d=>d.kind!=='dmg').length>10)return;const el=document.createElement('div');el.className='snd'+(kind==='gun'?' gun':'');$('#dirs').appendChild(el);dirs.push({el,x,y,t:life,max:life,kind})}
function updDirs(dt){const me=S.me,yaw=V.cam.yaw;for(let i=dirs.length-1;i>=0;i--){const d=dirs[i];d.t-=dt;if(d.t<=0){d.el.remove();dirs.splice(i,1);continue}
  const a=Math.atan2(d.y-me.y,d.x-me.x)-yaw;const deg=a*180/Math.PI+90;
  if(d.kind==='dmg'){d.el.style.transform=`rotate(${deg}deg)`;d.el.style.opacity=d.t/d.max}
  else{const R=Math.min(innerHeight*.3,140),x=Math.cos(a-Math.PI/2)*R,y=Math.sin(a-Math.PI/2)*R;d.el.style.left=x+'px';d.el.style.top=y+'px';d.el.style.transform=`rotate(${deg}deg)`;d.el.style.opacity=Math.min(1,d.t/d.max*2)}}}
// 데미지 숫자
const nums=[];function addNum(x,y,z,v,head){const el=document.createElement('div');el.className='o'+(head?' head':'');el.textContent=v;$('#nums').appendChild(el);nums.push({el,x:x+(Math.random()-.5)*.4,y,z,t:.8})}
function updNums(dt){for(let i=nums.length-1;i>=0;i--){const n=nums[i];n.t-=dt;n.z+=dt*.8;if(n.t<=0){n.el.remove();nums.splice(i,1);continue}const[sx,sy,vis]=V.screenPos(n.x,n.y,n.z);n.el.style.display=vis?'block':'none';n.el.style.left=sx+'px';n.el.style.top=sy+'px';n.el.style.opacity=Math.min(1,n.t*3)}}
function toggleBig(v){const b=$('#big');const show=v===undefined?b.hidden:v;b.hidden=!show;if(show)drawBigMap($('#bigc').getContext('2d'),700,S.gtime)}
// 주변 아이템 목록
function renderLoot(){const me=S.me;const near=me.alive&&me.ph==='ground'?L.nearItems(me,1.4).slice(0,8):[];const sig=near.map(i=>i.id+':'+i.n+i.s).join();if(sig===lootSig)return;lootSig=sig;
  $('#loot').innerHTML=near.map(it=>`<button class="li o r${L.rarity(it)}" data-id="${it.id}"><img alt="" src="${iconURL(L.iconKey(it))}"><span>${esc(L.itemName(it))}</span><small>${it.k==='a'||it.k==='h'?'×'+it.n:''}</small></button>`).join('')}
/* ================= 가방 ================= */
function toggleInv(v){const el=$('#inv');const show=v===undefined?el.hidden:v;el.hidden=!show;invSig='';if(show){renderInv();document.exitPointerLock&&document.exitPointerLock()}}
function row(key,name,sub,btns){return `<div class="it"><img alt="" src="${iconURL(key)}"><span class="nm">${esc(name)}${sub?`<small>${esc(sub)}</small>`:''}</span>${btns.map(b=>`<button class="o" data-a="${b[1]}">${b[0]}</button>`).join('')}</div>`}
function renderInv(){const me=S.me;const near=L.nearItems(me,2.5).slice(0,14);
  const sig=JSON.stringify([me.ammo,me.heal,me.w,me.helm,me.vest,me.bag,me.mod,near.map(i=>i.id+':'+i.n+i.s)]);if(sig===invSig)return;invSig=sig;
  const wt=L.weight(me),cap=L.capOf(me);$('#wbar i').style.width=Math.min(100,wt/cap*100)+'%';setT($('#wtxt'),Math.round(wt)+' / '+cap);
  $('#lNear').innerHTML=near.length?near.map(it=>row(L.iconKey(it),L.itemName(it),it.k==='a'||it.k==='h'?'×'+it.n:it.k==='w'?(it.mag?'탄 '+it.mag:''):'',[['줍기','pick:'+it.id]])).join(''):'<div class="empty-note">주변에 아이템이 없습니다</div>';
  let bag='';for(const k in me.ammo)if(me.ammo[k]>0)bag+=row('a_'+k,AMMO[k].n,'×'+me.ammo[k]+' · 무게 '+(me.ammo[k]*AMMO[k].w).toFixed(0),[['10 버림','drop:a:'+k+':10'],['전부','drop:a:'+k+':999']]);
  for(const k in me.heal)if(me.heal[k]>0)bag+=row('h_'+k,HEAL[k].n,'×'+me.heal[k]+' · 무게 '+(me.heal[k]*HEAL[k].w),[['사용','use:'+k],['버림','drop:h:'+k+':1']]);
  $('#lBag').innerHTML=bag||'<div class="empty-note">가방이 비어 있습니다</div>';
  let eq='';for(let i=0;i<2;i++){const w=me.w[i];if(w)eq+=row('w_'+w.k,WD[w.k].n,FAMN[FAM[w.k]]+' · '+w.mag+'/'+WD[w.k].mag,[['버림','drop:w:'+i]])}
  if(me.helm)eq+=row('ar_helm'+me.helm,'헬멧 Lv'+me.helm,'머리 피해 '+Math.round(HELM[me.helm]*100)+'% 감소',[['버림','drop:ar:helm']]);
  if(me.vest)eq+=row('ar_vest'+me.vest,'조끼 Lv'+me.vest,'몸 피해 '+Math.round(VEST[me.vest]*100)+'% 감소',[['버림','drop:ar:vest']]);
  if(me.bag)eq+=row('bag'+me.bag,'가방 Lv'+me.bag,'용량 '+BAGCAP[me.bag],[['버림','drop:bag:']]);
  if(me.mod)eq+=row('mod'+me.mod,'전술 모듈 Lv'+me.mod,'스킬 쿨타임 '+MODCD[me.mod]+'초',[['버림','drop:mod:']]);
  $('#lEq').innerHTML=eq||'<div class="empty-note">장착한 장비가 없습니다</div>'}
function invAction(a){const p=a.split(':'),me=S.me;
  if(p[0]==='pick'){const it=S.items.find(i=>i.id===+p[1]);if(it)L.pickItem(me,it,true)}
  else if(p[0]==='use')ctl.pend.use=p[1];
  else if(p[0]==='drop'){if(p[1]==='a'||p[1]==='h')L.dropStuff(me,p[1],p[2],+p[3]);else if(p[1]==='w')L.dropStuff(me,'w',+p[2]);else L.dropStuff(me,p[1],p[2])}
  handleEvents(S.events.splice(0))}
/* ================= 결과 ================= */
function endGame(win){state='over';const me=S.me,rank=win?1:S.aliveN+1;
  $('#oTitle').textContent=win?'최후의 1인!':'탈락';$('#oRank').textContent=`${CHARS[me.ch].n}  ${S.players.length}명 중 ${rank}위`;
  $('#oStats').innerHTML=`처치 ${me.kills}<br>생존 시간 ${fmt(win?S.gtime:me.deathT)}`;
  const b=load('dr-best',{rank:99,kills:0});save('dr-best',{rank:Math.min(b.rank,rank),kills:Math.max(b.kills,me.kills)});
  $('#over').hidden=false;$('#hud').hidden=true;$('#inv').hidden=true;$('#big').hidden=true;$('#tint').style.opacity=0;$('#scope').style.display='none';ctl.L.id=ctl.look.id=ctl.F.id=ctl.F2.id=null;ctl.ads=false;
  for(const n of nums)n.el.remove();nums.length=0;for(const d of dirs)d.el.remove();dirs.length=0;document.exitPointerLock&&document.exitPointerLock();if(win)Snd.play('v_winner',.8)}
$('#bAgain').addEventListener('click',showLobby);

/* ================= 사운드 ================= */
const Snd=(()=>{let AC=null,master=null,verb=null,noise=null,muteV=muted;const raw={},buf={},loops={};
  const NAMES=['step_grass_000','step_grass_001','step_grass_002','step_grass_003','step_concrete_000','step_concrete_001','step_concrete_002','step_concrete_003','step_wood_000','step_wood_001','step_wood_002','step_wood_003',
    'hit_body0','hit_body1','hit_helm','imp_metal','imp_wood','imp_stone','imp_glass','imp_soft','punch','land','rl_click','rl_latch','cloth1','cloth2','door_open','door_close','equip','pick','creak',
    'rail','forcefield','crunch','boom','plane','wind','zap','rewind','cloak','ui_click','ui_switch','ui_roll','v_go','v_hurry','v_win','v_over','v_reload','v_multi','v_winner','v_power',
    'gun_ar','gun_smg','gun_pistol','gun_shotgun','gun_dmr','gun_sniper','gun_minigun','gun_far'];
  function preload(){for(const n of NAMES)fetch('assets/sfx/'+n+'.ogg').then(r=>r.ok?r.arrayBuffer():null).then(b=>{if(b){raw[n]=b;if(AC)decode(n)}}).catch(()=>{})}
  function decode(n){if(buf[n]||!raw[n])return;const b=raw[n];raw[n]=null;AC.decodeAudioData(b).then(d=>buf[n]=d).catch(()=>{})}
  function resume(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=muteV?0:.9;master.connect(AC.destination);
      const len=AC.sampleRate*1.6|0,ir=AC.createBuffer(2,len,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
      verb=AC.createConvolver();verb.buffer=ir;const vg=AC.createGain();vg.gain.value=.5;verb.connect(vg);vg.connect(master);
      const nl=AC.sampleRate*.5|0;noise=AC.createBuffer(1,nl,AC.sampleRate);const nd=noise.getChannelData(0);for(let i=0;i<nl;i++)nd[i]=Math.random()*2-1;
      for(const n of NAMES)decode(n)}if(AC.state==='suspended')AC.resume()}catch(e){AC=null}}
  function setMute(m){muteV=m;if(master)master.gain.value=m?0:.9}
  function spatial(x,y){const me=S.me;if(!me)return{v:1,pan:0,d:0};const d=hyp(x-me.x,y-me.y),rel=Math.atan2(y-me.y,x-me.x)-V.cam.yaw;return{d,v:1/Math.pow(1+d/10,1.25),pan:d<1?0:clamp(Math.sin(rel),-1,1)*.85}}
  function out(vol,pan,d,wet){const g=AC.createGain();g.gain.value=vol;let n=g;if(d!=null&&d>8){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=Math.max(500,18000*Math.exp(-d/70));n.connect(f);n=f}
    const p=AC.createStereoPanner?AC.createStereoPanner():null;if(p){p.pan.value=pan||0;n.connect(p);p.connect(master);if(wet){const w=AC.createGain();w.gain.value=wet;p.connect(w);w.connect(verb)}}else{n.connect(master)}return g}
  function playBuf(name,vol,rate,pan,d,wet){if(!AC||muteV)return;const b=buf[name];if(!b)return;const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=(rate||1)*(.94+Math.random()*.12);s.connect(out(vol,pan,d,wet));s.start()}
  const play=(n,v=1,r=1)=>playBuf(n,v,r,0,null,.12);
  const at=(n,x,y,v=1,r=1)=>{const sp=spatial(x,y);if(sp.d>120)return;playBuf(n,v*sp.v,r,sp.pan,sp.d,.2)};
  // 총성: 딱 소리 + 몸통 + 저음 + 잔향
  const GUN={pistol:[2600,.05,.5,1600,.14,.6,110,.12,.5],smg:[3000,.04,.45,1800,.1,.5,120,.08,.4],shotgun:[1400,.07,.7,900,.25,.9,70,.25,.9],ar:[2400,.05,.55,1500,.15,.7,90,.16,.7],
    dmr:[2000,.06,.65,1200,.2,.8,75,.22,.8],sniper:[1800,.07,.8,900,.3,.9,60,.35,1],minigun:[2600,.035,.4,1600,.09,.45,100,.07,.4],flame:[500,.12,.2,700,.18,.35,60,.1,.15],fist:[400,.03,.2,500,.06,.3,90,.05,.2]};
  function gun(k,p,x,y,z){if(!AC||muteV)return;if(k==='rail'){at('rail',x,y,1,.9);return}if(k==='fist'){at('punch',x,y,.7);return}
    const me=S.me,mine=p===me,sp=spatial(x,y);if(sp.d>420)return;const G=GUN[k]||GUN.ar,t=AC.currentTime,far=clamp(sp.d/180,0,1);
    const smp=buf['gun_'+(k==='minigun'?'minigun':k)];if(smp&&k!=='flame'){const near=1-far;const vol=(mine?.8:1.25)*Math.max(.04,sp.v);
      if(near>.05){const s=AC.createBufferSource();s.buffer=smp;s.playbackRate.value=.95+Math.random()*.1;s.connect(out(vol*near,sp.pan,sp.d,mine?.12:.22+far*.3));s.start()}
      if(far>.15&&buf.gun_far){const s=AC.createBufferSource();s.buffer=buf.gun_far;s.playbackRate.value=(k==='sniper'||k==='dmr'?.85:1)*(.95+Math.random()*.1);s.connect(out(vol*1.4*far+.02,sp.pan,sp.d,.4));s.start(t+Math.min(.5,sp.d/340))}
      if(mine&&Math.random()<.35)setTimeout(()=>play('imp_metal',.06,2.3),140);return}
    const vol=(mine?.75:1)*Math.max(.05,sp.v)*(mine?1:1.4),wet=mine?.18:.25+far*.5;const o=out(vol,sp.pan,sp.d,wet);
    // 딱
    if(far<.8){const s=AC.createBufferSource();s.buffer=noise;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=G[0];const g=AC.createGain();g.gain.setValueAtTime(G[2]*(1-far),t);g.gain.exponentialRampToValueAtTime(.001,t+G[1]);s.connect(f);f.connect(g);g.connect(o);s.start(t,Math.random()*.3);s.stop(t+G[1]+.02)}
    // 몸통
    {const s=AC.createBufferSource();s.buffer=noise;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=G[3]*(1-far*.6);const g=AC.createGain();g.gain.setValueAtTime(G[5],t);g.gain.exponentialRampToValueAtTime(.001,t+G[4]*(1+far));s.connect(f);f.connect(g);g.connect(o);s.start(t,Math.random()*.3);s.stop(t+G[4]*2+.05)}
    // 저음
    {const s=AC.createOscillator();s.type='sine';s.frequency.setValueAtTime(G[6]*1.6,t);s.frequency.exponentialRampToValueAtTime(G[6]*.6,t+G[7]);const g=AC.createGain();g.gain.setValueAtTime(G[8]*(mine?1:.7),t);g.gain.exponentialRampToValueAtTime(.001,t+G[7]);s.connect(g);g.connect(o);s.start(t);s.stop(t+G[7]+.02)}
    if(mine&&Math.random()<.35)setTimeout(()=>play('imp_metal',.08,2.2),120)}
  function step(p,land){if(!AC||muteV)return;const t=L.tileAt(p.x,p.y),k=L.bldAt(p.x,p.y)||t===L.BR||p.lv>=0||p.onRamp?'wood':t===L.RO||t===L.RK?'concrete':'grass';const n='step_'+k+'_00'+((Math.random()*4)|0);
    if(p===S.me)play(n,land?.5:.28,1);else at(n,p.x,p.y,p.curSp>5.5?.9:.6)}
  function skill(p){const n={shadow:'cloak',chrono:'rewind',psy:'forcefield',volt:'zap'}[p.ch];if(p===S.me){play(n,.8);play('v_power',.35)}else at(n,p.x,p.y,1)}
  function loop(n,v){if(!AC||muteV||loops[n])return;const b=buf[n];if(!b)return;const s=AC.createBufferSource();s.buffer=b;s.loop=true;const g=AC.createGain();g.gain.value=v;s.connect(g);g.connect(master);s.start();loops[n]={s,g}}
  function loopVol(n,v){if(loops[n])loops[n].g.gain.value=v}
  function stopLoops(){for(const n in loops){try{loops[n].s.stop()}catch(e){}delete loops[n]}}
  function tick(n){if(!AC||muteV)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=500+n*14;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);o.connect(g);g.connect(master);o.start(t);o.stop(t+.07)}
  return{preload,resume,setMute,play,at,gun,step,skill,loop,loopVol,stopLoops,tick,ui:()=>play('ui_click',.5),update(){}}})();
