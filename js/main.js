import * as L from './logic.js';
import * as V from './view.js';
import {iconURL,buildMapBg,drawMini,drawBigMap,ICON3D} from './art2d.js';
const {S,CHARS,CHK,WD,FAM,FAMN,AMMO,HEAL,MODCD,HELM,VEST,BAGCAP,hyp,clamp,angDiff,TAU}=L;
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let state='loading',myChar=load('dr-char','shadow'),quality=load('dr-q',matchMedia('(max-width:900px)').matches?'high':'high'),muted=load('dr-mute',false);
function load(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
if(!CHARS[myChar])myChar='shadow';

window.__DR={S,L,V};
/* ================= 로딩 ================= */
(async()=>{
  try{await V.initView($('#c3d'),p=>{$('#lbar i').style.width=Math.round(p*100)+'%'})}
  catch(e){$('#ltxt').textContent='불러오기에 실패했습니다. 새로고침해 주세요';console.error(e);return}
  V.setQuality(quality);$('#ltxt').textContent='아이콘 만드는 중';await new Promise(r=>setTimeout(r,30));V.makeIcons(ICON3D);buildLobby();showLobby();requestAnimationFrame(loop);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

/* ================= 가로 고정 (안드로이드) ================= */
async function goLandscape(){try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)await d.requestFullscreen({navigationUI:'hide'});if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}}
addEventListener('pointerdown',()=>{if(!document.fullscreenElement)goLandscape()},{capture:true});
/* ================= 로비 ================= */
function buildLobby(){const box=$('#chars');box.innerHTML='';
  for(const k of CHK){const C=CHARS[k],b=document.createElement('button');b.className='cbtn o';b.dataset.ch=k;b.style.background=C.c2;b.textContent=C.n;
    b.addEventListener('click',()=>{myChar=k;save('dr-char',k);renderDetail();sfxBeep(660,.06,.06)});box.appendChild(b)}renderDetail()}
function renderDetail(){for(const b of $$('.cbtn'))b.classList.toggle('on',b.dataset.ch===myChar);const C=CHARS[myChar];
  $('#detail').innerHTML=`<h2 class="o hd" style="color:${C.c}">${C.n}</h2><span class="ds" style="font-size:13px;color:var(--dim)">${C.tag}</span>
   <div class="sk"><span class="lb">패시브</span><span class="nm2">${C.pas.n}</span><span class="ds">${C.pas.d}</span></div>
   <div class="sk"><span class="lb">액티브 (무기에 따라 변화)</span><span class="nm2">${C.act.n}</span><span class="ds">${C.act.d}</span>
   <div class="var">${['near','mid','far'].map(f=>`<b>${FAMN[f]} · ${C.act[f].n}</b><span>${C.act[f].d}</span>`).join('')}</div></div>`;
  const b=load('dr-best',null);$('#best').textContent=b?`최고 ${b.rank}위 · 최다 처치 ${b.kills}`:''}
function showLobby(){state='lobby';for(const s of['#loading','#match','#over','#hud','#settings'])$(s).hidden=true;$('#lobby').hidden=false;$('#tint').style.opacity=0;renderDetail()}
$('#bPlay').addEventListener('click',()=>{resumeAudio();goLandscape();startMatching()});
$('#bSettings').addEventListener('click',()=>{$('#settings').hidden=false;syncSettings()});
$('#setClose').addEventListener('click',()=>$('#settings').hidden=true);
function syncSettings(){$$('#settings [data-q]').forEach(b=>b.classList.toggle('on',b.dataset.q===quality));$$('#settings [data-s]').forEach(b=>b.classList.toggle('on',(b.dataset.s==='off')===muted))}
$$('#settings [data-q]').forEach(b=>b.addEventListener('click',()=>{quality=b.dataset.q;save('dr-q',quality);V.setQuality(quality);syncSettings()}));
$$('#settings [data-s]').forEach(b=>b.addEventListener('click',()=>{muted=b.dataset.s==='off';save('dr-mute',muted);syncSettings()}));

/* ================= 매칭 ================= */
let matchTimer=null;
function startMatching(){state='match';$('#match').hidden=false;$('#lobby').hidden=true;const box=$('#mNames');box.innerHTML='';
  let n=1;$('#mCount').textContent='1 / 25';const names=[...L.BOTN].sort(()=>Math.random()-.5);
  // 매칭 연출 중에 맵 생성
  setTimeout(()=>{L.genWorld((Math.random()*1e9)|0);buildMapBg();V.buildWorld()},50);
  const tick=()=>{if(state!=='match')return;n++;$('#mCount').textContent=n+' / 25';const s=document.createElement('span');s.textContent=names[n-2];box.appendChild(s);sfxBeep(500+n*12,.04,.03);
    if(n<25)matchTimer=setTimeout(tick,60+Math.random()*180);else{$('#match h2').textContent='비행기 탑승';matchTimer=setTimeout(beginGame,900)}};
  $('#match h2').textContent='매칭 중';matchTimer=setTimeout(tick,500)}
$('#mCancel').addEventListener('click',()=>{clearTimeout(matchTimer);showLobby()});
function beginGame(){L.startMatch(myChar);V.cam.x=S.plane.x;V.cam.y=S.plane.y;V.prewarm(S.plane.x,S.plane.y);
  state='play';$('#match').hidden=true;$('#hud').hidden=false;$('#inv').hidden=true;$('#who').textContent=CHARS[myChar].n;$('#who').style.background=CHARS[myChar].c;feedDirty=true;
  toast('원하는 곳 위에서 뛰어내리기를 누르세요');sfxPlane(true)}

/* ================= 입력 ================= */
const ctl={L:{id:null,ox:0,oy:0,x:0,y:0},R:{id:null,ox:0,oy:0,x:0,y:0},F:{id:null,ox:0,oy:0,x:0,y:0,on:false},keys:{},mx:0,my:0,mdown:false,mouse:false,pend:{},aimHold:0,lastAim:0};
const STICK=48,touchEl=$('#touch'),sL=$('#sL'),sR=$('#sR'),fireBtn=$('#fireBtn');
function vec(s,R=STICK){let dx=s.x-s.ox,dy=s.y-s.oy;const m=hyp(dx,dy);if(m>R){dx*=R/m;dy*=R/m}return[dx/R,dy/R]}
function drawStick(el,s,on){if(!on){el.style.opacity=0;return}el.style.opacity=1;el.style.left=s.ox+'px';el.style.top=s.oy+'px';const[vx,vy]=vec(s);el.querySelector('i').style.transform=`translate(${vx*STICK}px,${vy*STICK}px)`}
touchEl.addEventListener('touchstart',e=>{e.preventDefault();ctl.mouse=false;resumeAudio();
  for(const t of e.changedTouches){const s=t.clientX<innerWidth*.45?ctl.L:ctl.R;if(s.id!==null)continue;s.id=t.identifier;s.ox=s.x=t.clientX;s.oy=s.y=t.clientY}},{passive:false});
touchEl.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)for(const s of[ctl.L,ctl.R])if(s.id===t.identifier){s.x=t.clientX;s.y=t.clientY}},{passive:false});
const tEnd=e=>{e.preventDefault();for(const t of e.changedTouches)for(const s of[ctl.L,ctl.R])if(s.id===t.identifier)s.id=null};
touchEl.addEventListener('touchend',tEnd,{passive:false});touchEl.addEventListener('touchcancel',tEnd,{passive:false});
touchEl.addEventListener('mousemove',e=>{ctl.mouse=true;ctl.mx=e.clientX;ctl.my=e.clientY});
touchEl.addEventListener('mousedown',e=>{ctl.mouse=true;ctl.mdown=true;ctl.mx=e.clientX;ctl.my=e.clientY;resumeAudio()});
addEventListener('mouseup',()=>ctl.mdown=false);
// 사격 버튼: 누르면 사격, 누른 채로 끌면 조준까지
fireBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();resumeAudio();fireBtn.setPointerCapture(e.pointerId);const F=ctl.F;F.id=e.pointerId;F.ox=F.x=e.clientX;F.oy=F.y=e.clientY;F.on=true;fireBtn.classList.add('on')});
fireBtn.addEventListener('pointermove',e=>{const F=ctl.F;if(F.id!==e.pointerId)return;F.x=e.clientX;F.y=e.clientY});
const fEnd=e=>{const F=ctl.F;if(F.id!==e.pointerId)return;F.id=null;F.on=false;fireBtn.classList.remove('on')};
fireBtn.addEventListener('pointerup',fEnd);fireBtn.addEventListener('pointercancel',fEnd);
addEventListener('keydown',e=>{const k=e.key.toLowerCase();ctl.keys[k]=true;if(state!=='play')return;
  if(k==='tab'||k==='i'){e.preventDefault();toggleInv()}
  const P=ctl.pend;if(k==='r')P.reload=true;if(k==='f'||k===' ')P.ctx=true;if(k==='q')P.skill=true;if(k==='1')P.sw=0;if(k==='2')P.sw=1;if(k==='3')P.sw=2;
  if(k==='4')P.use='bandage';if(k==='5')P.use='medkit';if(k==='6')P.use='drink';if(k==='m')toggleBig()});
addEventListener('keyup',e=>{ctl.keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{ctl.keys={};ctl.mdown=false});
const on=(el,fn)=>el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();resumeAudio();fn(e)});
$$('.qb[data-h]').forEach(b=>on(b,()=>ctl.pend.use=b.dataset.h));
on($('#bReload'),()=>ctl.pend.reload=true);on($('#skill'),()=>ctl.pend.skill=true);on($('#ctxBtn'),()=>ctl.pend.ctx=true);
$$('.slot').forEach(b=>on(b,()=>ctl.pend.sw=+b.dataset.s));
on($('#mini'),()=>toggleBig());on($('#bBag'),()=>toggleInv());on($('#invClose'),()=>toggleInv(false));
$('#big').addEventListener('pointerdown',e=>{e.preventDefault();toggleBig(false)});
$('#autoPick').addEventListener('change',e=>{S.autoPick=e.target.checked});
$('#inv').addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
$('#inv').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-a]');if(!b)return;e.preventDefault();invAction(b.dataset.a);invSig=''});

function nearestEnemy(p,maxD,cone,dirA){let best=null,bs=1e9;for(const q of S.players){if(q===p||!q.alive||q.ph!=='ground')continue;const d=hyp(q.x-p.x,q.y-p.y);if(d>maxD)continue;
    const da=Math.abs(angDiff(Math.atan2(q.y-p.y,q.x-p.x),dirA));if(da>cone)continue;if(L.stealthed(q)&&d>60)continue;const s=d*(1+da);if(s<bs&&L.losClear(p.x,p.y,q.x,q.y)){bs=s;best=q}}return best}
function humanInput(dt){
  const p=S.me,P=ctl.pend,inp={mx:0,my:0,aim:p.ang,fire:false,reload:P.reload,use:P.use,sw:P.sw,skill:P.skill,open:false,ctx:P.ctx,jump:false};
  const k=ctl.keys;inp.mx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0);inp.my=(k.s||k.arrowdown?1:0)-(k.w||k.arrowup?1:0);
  if(ctl.L.id!==null){const[vx,vy]=vec(ctl.L);if(hyp(vx,vy)>.12){inp.mx=vx;inp.my=vy}}
  let aimed=false;const w=L.curW(p),rng=w?Math.min(WD[w.k].rng,L.VIEW*1.2):22;
  const F=ctl.F;if(F.on){const[vx,vy]=vec(F,40);if(hyp(vx,vy)>.3){inp.aim=Math.atan2(vy,vx);aimed=true}inp.fire=true}
  if(!aimed&&ctl.R.id!==null){const[vx,vy]=vec(ctl.R);if(hyp(vx,vy)>.15){inp.aim=Math.atan2(vy,vx);aimed=true;ctl.aimHold=.6}}
  if(!aimed&&ctl.mouse&&state==='play'){const c=V.cam;/* 마우스: 화면 중심 기준 방향 */const dx=ctl.mx-innerWidth/2,dy=(ctl.my-innerHeight/2)/Math.cos(0.34);if(hyp(dx,dy)>8){inp.aim=Math.atan2(dy,dx);aimed=true}if(ctl.mdown)inp.fire=true}
  // 조준 보정: 스틱으로 조준 중이면 좁게, 사격 버튼만 누르면 넓게
  if(p.ph==='ground'){const base=aimed?inp.aim:(ctl.aimHold>0?p.ang:(hyp(inp.mx,inp.my)>.2?Math.atan2(inp.my,inp.mx):p.ang));
    const cone=aimed?.2:(inp.fire?1.1:0);let tgt=cone?nearestEnemy(p,rng,cone,base):null;
    if(tgt)inp.aim=Math.atan2(tgt.y-p.y,tgt.x-p.x);else if(!aimed){if(ctl.aimHold>0)inp.aim=p.ang;else if(hyp(inp.mx,inp.my)>.2)inp.aim=p.ang+clamp(angDiff(Math.atan2(inp.my,inp.mx),p.ang),-.3,.3)}}
  ctl.aimHold-=dt;
  if(p.ph==='plane'&&P.ctx)inp.jump=true;
  drawStick(sL,ctl.L,ctl.L.id!==null);drawStick(sR,ctl.R,ctl.R.id!==null);
  ctl.pend={};return inp}

/* ================= 루프 ================= */
let last=performance.now(),hurtFade=0,skillFxT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(state==='play'||state==='over'){
    if(S.me){const inp=state==='play'&&S.me.alive?humanInput(dt):{mx:0,my:0,aim:S.me.ang,fire:false};L.step(dt,inp);
      const evs=S.events.splice(0);V.handleEvents(evs);handleEvents(evs);V.renderGame(dt);if(state==='play'){updHud(dt);updNums(dt);drawMini($('#mini').getContext('2d'),224,S.gtime)}}}
  else if(state==='lobby'||state==='match'){V.renderLobby(dt,myChar,{shadow:'sniper',chrono:'smg',psy:'ar',volt:'shotgun'}[myChar],innerWidth>700?20:0)}
  requestAnimationFrame(loop)}
function handleEvents(evs){for(const e of evs){switch(e.t){
  case 'toast':toast(e.s);break;case 'feed':feedDirty=true;break;
  case 'hurt':$('#hurt').style.opacity=e.zone?.35:.7;hurtFade=.25;break;
  case 'num':addNum(e.x,e.y,e.v);sfxBeep(900,.03,.05);break;
  case 'shot':sfxShot(e.k,e.x,e.y);break;
  case 'skill':sfxSkill(e.p);if(e.p===S.me){const f=L.famOf(S.me);toast(CHARS[S.me.ch].act[f].n+' 발동!');$('#skillFx').style.boxShadow='inset 0 0 90px 22px '+CHARS[S.me.ch].c;$('#skillFx').style.opacity=1;skillFxT=.5}break;
  case 'stun':if(e.p===S.me)toast('기절!');break;
  case 'jump':sfxPlane(false);sfxBeep(300,.2,.06);break;
  case 'land':sfxBeep(160,.12,.1);break;
  case 'die':if(e.p===S.me){sfxBeep(160,.3,.12);$('#inv').hidden=true}break;
  case 'sfx':{const m={drop:[520,.15],open:[700,.12],equip:[520,.06],pick:[760,.04],reload:[420,.05],heal:[660,.08],charge:[300,.3]}[e.k];if(m)sfxBeep(m[0],m[1],.07);break}
  case 'end':endGame(e.win);break}}}

/* ================= HUD ================= */
let feedDirty=true,hudT=0,toastT=0,invSig='';const cache=new Map();
function setT(el,s){if(cache.get(el)!==s){cache.set(el,s);el.textContent=s}}
function setSrc(img,key){if(img.dataset.k!==key){img.dataset.k=key;img.src=key?iconURL(key):'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}}
function toast(s){const t=$('#toast');t.textContent=s;t.style.opacity=1;toastT=1.8}
const C0=p=>CHARS[p.ch].c;
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const hpI=$('#hp i'),boI=$('#boost i'),prog=$('#prog'),slotEls=[...$$('.slot')],qbEls=[...$$('.qb[data-h]')],skillEl=$('#skill'),ctxEl=$('#ctxBtn');
function updHud(dt){const me=S.me,z=S.zone;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('#toast').style.opacity=0}
  if(hurtFade>0){hurtFade-=dt;if(hurtFade<=0)$('#hurt').style.opacity=0}
  {const B=me.buff,act=Math.max(B.tight||0,B.steady||0,B.over||0,me.ch==='chrono'?B.haste||0:0);if(skillFxT>0)skillFxT-=dt;$('#skillFx').style.opacity=skillFxT>0?1:act>0?.55:0;if(act>0&&skillFxT<=0)$('#skillFx').style.boxShadow='inset 0 0 70px 14px '+C0(me)}
  hpI.style.width=Math.max(0,me.hp)+'%';hpI.style.background=me.hp>35?'var(--green)':'var(--red)';boI.style.width=me.boost+'%';
  const C=CHARS[me.ch],f=L.famOf(me),pct=me.skillCD>0?me.skillCD/MODCD[me.mod]*100:0;
  skillEl.querySelector('.cd').style.background=pct>0?`conic-gradient(rgba(27,19,48,.72) ${pct}%, transparent 0)`:'none';
  const outside=me.alive&&me.ph==='ground'&&hyp(me.x-z.cx,me.y-z.cy)>z.r;$('#tint').style.opacity=outside?1:0;
  hudT-=dt;if(hudT>0)return;hudT=.1;
  const air=me.ph!=='ground';
  for(const el of['#skill','#fireBtn','#bReload','#slots','#tr2'])$(el).style.visibility=air?'hidden':'visible';
  setT($('#hpTxt'),String(Math.ceil(Math.max(0,me.hp))));setT($('#alive'),String(S.aliveN));setT($('#kills'),String(me.kills));
  const zi=$('#zoneInfo');let zt=z.state==='wait'?'자기장 축소까지 '+fmt(z.t):z.state==='shrink'?'자기장 축소 중 '+fmt(z.t):'최종 자기장';if(outside)zt='자기장 밖! 안으로 이동';zi.classList.toggle('warn',outside);setT(zi,zt);
  skillEl.style.background=C.c;skillEl.classList.toggle('lock',!f);setT(skillEl.querySelector('span'),f?C.act[f].n:C.act.n);{const B=me.buff,act=Math.max(B.tight||0,B.steady||0,B.over||0);setT(skillEl.querySelector('small'),!f?'무기 필요':act>0?'발동 '+act.toFixed(1)+'초':B.sure>0?'장전됨':me.skillCD>0?Math.ceil(me.skillCD)+'초':'준비 · Lv'+me.mod);skillEl.classList.toggle('ready',!!f&&me.skillCD<=0)}
  for(const el of slotEls){const s=+el.dataset.s,nm=el.querySelector('.nm'),am=el.querySelector('.am'),img=el.querySelector('img');el.classList.toggle('on',me.cur===s);
    if(s===2){setT(nm,'주먹');setT(am,'');setSrc(img,'');continue}
    const w=me.w[s];el.classList.toggle('empty',!w);if(w){setT(nm,WD[w.k].n);setT(am,WD[w.k].special?String(w.mag):w.mag+'/'+me.ammo[WD[w.k].ak]);setSrc(img,'w_'+w.k)}else{setT(nm,'빈 슬롯');setT(am,'');setSrc(img,'')}}
  for(const el of qbEls){const k=el.dataset.h;setT(el.querySelector('b'),String(me.heal[k]));setSrc(el.querySelector('img'),'h_'+k);el.classList.toggle('off',me.heal[k]===0)}
  setSrc($('#bBag img'),'bag'+Math.max(1,me.bag));setT($('#bagPct'),Math.round(L.weight(me)/L.capOf(me)*100)+'%');
  const gear=[];if(me.helm)gear.push('ar_helm'+me.helm);if(me.vest)gear.push('ar_vest'+me.vest);if(me.mod)gear.push('mod'+me.mod);const gs=gear.join();
  if(cache.get('gear')!==gs){cache.set('gear',gs);$('#gear').innerHTML=gear.map(k=>`<img alt="" src="${iconURL(k)}">`).join('')}
  ctxEl.classList.remove('jump');
  if(me.ph==='plane'){ctxEl.hidden=false;ctxEl.classList.add('jump');setSrc(ctxEl.querySelector('img'),'');setT(ctxEl.querySelector('span'),'뛰어내리기')}
  else if(air)ctxEl.hidden=true;
  else{const d=me.alive?L.nearDrop(me):null;
    if(d&&!me.opening){ctxEl.hidden=false;setSrc(ctxEl.querySelector('img'),'');setT(ctxEl.querySelector('span'),'보급상자 열기 (3초)')}
    else if(me.nearI&&me.alive){const it=me.nearI;ctxEl.hidden=false;setSrc(ctxEl.querySelector('img'),L.iconKey(it));
      let t=L.itemName(it)+(it.k==='a'||it.k==='h'?' ×'+it.n:'');if(it.k==='w'&&me.w[0]&&me.w[1])t+=' ↔ '+WD[me.w[me.cur<2?me.cur:0].k].n;else if((it.k==='ar'||it.k==='bag'||it.k==='mod')&&me[it.k==='ar'?it.s:it.k])t+=' 교체';else t+=' 줍기';setT(ctxEl.querySelector('span'),t)}
    else ctxEl.hidden=true}
  let pr=null;if(me.opening)pr=['보급상자 여는 중',3,me.openT];else if(me.healT>0)pr=[HEAL[me.healK].n+' 사용 중',HEAL[me.healK].t,me.healT];else if(me.rl>0&&L.curW(me))pr=['장전 중',WD[L.curW(me).k].rl,me.rl];else if(me.charge>0)pr=['레일건 충전',1,me.charge];
  else if(air&&me.ph!=='plane')pr=[me.ph==='fall'?'자유낙하 '+Math.round(me.z)+'m':'낙하산 '+Math.round(me.z)+'m',L.ALT,me.z];
  if(pr){prog.hidden=false;setT(prog.querySelector('span'),air?pr[0]:pr[0]+' '+pr[2].toFixed(1)+'초');prog.querySelector('i').style.width=(100*(1-pr[2]/pr[1]))+'%'}else prog.hidden=true;
  if(feedDirty){feedDirty=false;$('#feed').innerHTML=S.feed.map(f=>`<div class="${f.me?'me':''}">${esc(f.txt)}</div>`).join('')}
  if(!$('#inv').hidden)renderInv()}
// 데미지 숫자
const nums=[];function addNum(x,y,v){const el=document.createElement('div');el.className='o';el.textContent=v;$('#nums').appendChild(el);nums.push({el,x:x+(Math.random()-.5)*6,y,h:20,t:.8})}
function updNums(dt){for(let i=nums.length-1;i>=0;i--){const n=nums[i];n.t-=dt;n.h+=dt*18;if(n.t<=0){n.el.remove();nums.splice(i,1);continue}const[sx,sy]=V.screenPos(n.x,n.y,n.h);n.el.style.left=sx+'px';n.el.style.top=sy+'px';n.el.style.opacity=Math.min(1,n.t*3)}}
function toggleBig(v){const b=$('#big');const show=v===undefined?b.hidden:v;b.hidden=!show;if(show)drawBigMap($('#bigc').getContext('2d'),700,S.gtime)}

/* ================= 인벤토리 ================= */
function toggleInv(v){const el=$('#inv');const show=v===undefined?el.hidden:v;el.hidden=!show;invSig='';if(show)renderInv()}
function row(key,name,sub,btns){return `<div class="it"><img alt="" src="${iconURL(key)}"><span class="nm">${esc(name)}${sub?`<small>${esc(sub)}</small>`:''}</span>${btns.map(b=>`<button class="o" data-a="${b[1]}">${b[0]}</button>`).join('')}</div>`}
function renderInv(){const me=S.me;
  const R=L.pickR(me)+22,near=S.items.filter(it=>hyp(it.x-me.x,it.y-me.y)<R).slice(0,14);
  const sig=JSON.stringify([me.ammo,me.heal,me.w,me.helm,me.vest,me.bag,me.mod,near.map(i=>i.id+':'+i.n+i.s)]);if(sig===invSig)return;invSig=sig;
  const wt=L.weight(me),cap=L.capOf(me);$('#wbar i').style.width=Math.min(100,wt/cap*100)+'%';setT($('#wtxt'),Math.round(wt)+' / '+cap);
  $('#lNear').innerHTML=near.length?near.map(it=>row(L.iconKey(it),L.itemName(it),it.k==='a'||it.k==='h'?'×'+it.n:it.k==='w'?(it.mag?'탄 '+it.mag:''):'',[['줍기','pick:'+it.id]])).join(''):'<div class="empty-note">주변에 아이템이 없습니다</div>';
  let bag='';for(const k in me.ammo)if(me.ammo[k]>0)bag+=row('a_'+k,AMMO[k].n,'×'+me.ammo[k]+' · 무게 '+(me.ammo[k]*AMMO[k].w).toFixed(0),[['10 버림','drop:a:'+k+':10'],['전부','drop:a:'+k+':999']]);
  for(const k in me.heal)if(me.heal[k]>0)bag+=row('h_'+k,HEAL[k].n,'×'+me.heal[k]+' · 무게 '+(me.heal[k]*HEAL[k].w),[['사용','use:'+k],['버림','drop:h:'+k+':1']]);
  $('#lBag').innerHTML=bag||'<div class="empty-note">가방이 비어 있습니다</div>';
  let eq='';for(let i=0;i<2;i++){const w=me.w[i];if(w)eq+=row('w_'+w.k,WD[w.k].n,FAMN[FAM[w.k]]+' · '+w.mag+'/'+WD[w.k].mag,[['버림','drop:w:'+i]])}
  if(me.helm)eq+=row('ar_helm'+me.helm,'헬멧 Lv'+me.helm,'피해 '+Math.round(HELM[me.helm]*100)+'% 감소',[['버림','drop:ar:helm']]);
  if(me.vest)eq+=row('ar_vest'+me.vest,'조끼 Lv'+me.vest,'피해 '+Math.round(VEST[me.vest]*100)+'% 감소',[['버림','drop:ar:vest']]);
  if(me.bag)eq+=row('bag'+me.bag,'가방 Lv'+me.bag,'용량 '+BAGCAP[me.bag],[['버림','drop:bag:']]);
  if(me.mod)eq+=row('mod'+me.mod,'전술 모듈 Lv'+me.mod,'스킬 쿨타임 '+MODCD[me.mod]+'초',[['버림','drop:mod:']]);
  $('#lEq').innerHTML=eq||'<div class="empty-note">장착한 장비가 없습니다</div>'}
function invAction(a){const p=a.split(':'),me=S.me;
  if(p[0]==='pick'){const it=S.items.find(i=>i.id===+p[1]);if(it&&hyp(it.x-me.x,it.y-me.y)<L.pickR(me)+26)L.pickItem(me,it,true)}
  else if(p[0]==='use')ctl.pend.use=p[1];
  else if(p[0]==='drop'){if(p[1]==='a'||p[1]==='h')L.dropStuff(me,p[1],p[2],+p[3]);else if(p[1]==='w')L.dropStuff(me,'w',+p[2]);else L.dropStuff(me,p[1],p[2])}
  const evs=S.events.splice(0);handleEvents(evs)}

/* ================= 결과 ================= */
function endGame(win){state='over';const me=S.me,rank=win?1:S.aliveN+1;
  $('#oTitle').textContent=win?'최후의 1인!':'탈락';$('#oRank').textContent=`${CHARS[me.ch].n}  ${S.players.length}명 중 ${rank}위`;
  $('#oStats').innerHTML=`처치 ${me.kills}<br>생존 시간 ${fmt(win?S.gtime:me.deathT)}`;
  const b=load('dr-best',{rank:99,kills:0});save('dr-best',{rank:Math.min(b.rank,rank),kills:Math.max(b.kills,me.kills)});
  $('#over').hidden=false;$('#hud').hidden=true;$('#inv').hidden=true;$('#big').hidden=true;$('#tint').style.opacity=0;ctl.L.id=ctl.R.id=null;ctl.F.on=false;
  for(const n of nums)n.el.remove();nums.length=0;if(win)sfxBeep(880,.25,.1)}
$('#bAgain').addEventListener('click',showLobby);

/* ================= 사운드 ================= */
let AC=null,noiseBuf=null,lastSfx=0,planeNode=null;
function resumeAudio(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const len=AC.sampleRate*.4|0;noiseBuf=AC.createBuffer(1,len,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2)}if(AC.state==='suspended')AC.resume()}catch(e){AC=null}}
const SF={pistol:[2200,.7,.16],smg:[2600,.5,.12],shotgun:[900,1,.22],ar:[1700,.7,.16],dmr:[1200,.9,.25],sniper:[700,1.1,.4],fist:[400,.35,.06],flame:[600,.25,.1],minigun:[2000,.45,.08],rail:[3500,1,.5]};
function sfxShot(k,x,y){if(!AC||muted||!S.me)return;const d=hyp(x-S.me.x,y-S.me.y),v=1-d/480;if(v<=0)return;const now=AC.currentTime;if(now-lastSfx<.018&&d>40)return;lastSfx=now;
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),c=SF[k]||SF.pistol;s.buffer=noiseBuf;f.type=k==='rail'?'bandpass':'lowpass';f.frequency.value=c[0];
  g.gain.setValueAtTime(v*v*.45*c[1],now);g.gain.exponentialRampToValueAtTime(.001,now+c[2]);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(now);s.stop(now+.45)}
function sfxBeep(fq,dur,vol){if(!AC||muted)return;const now=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=fq;g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(.001,now+dur);o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+dur+.02)}
function sfxSkill(p){if(!AC||muted||!S.me)return;const d=hyp(p.x-S.me.x,p.y-S.me.y),v=(1-d/400)*.12;if(v<=0)return;const now=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';
  const f0={shadow:300,chrono:880,psy:520,volt:1200}[p.ch];o.frequency.setValueAtTime(f0,now);o.frequency.exponentialRampToValueAtTime(p.ch==='chrono'?220:f0*2,now+.25);g.gain.setValueAtTime(v,now);g.gain.exponentialRampToValueAtTime(.001,now+.3);o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+.32)}
function sfxPlane(on){if(!AC)return;if(on&&!planeNode&&!muted){const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();o.type='sawtooth';o.frequency.value=58;f.type='lowpass';f.frequency.value=300;g.gain.value=.035;o.connect(f);f.connect(g);g.connect(AC.destination);o.start();planeNode={o,g}}
  else if(!on&&planeNode){planeNode.g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.6);planeNode.o.stop(AC.currentTime+.7);planeNode=null}}
