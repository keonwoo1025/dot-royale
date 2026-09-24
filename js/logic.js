// 도트 로얄 — 게임 규칙 (렌더링/DOM 없음). 좌표: 평면 x,y (3D에서는 x,z)
export const TAU=Math.PI*2,hyp=Math.hypot,clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const angDiff=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function hash2(x,y){let h=(Math.imul(x,374761393)+Math.imul(y,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function makeNoise(seed){const r=mulberry32(seed),N=128,g=new Float32Array(N*N);for(let i=0;i<N*N;i++)g[i]=r();
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,x0=xi&127,x1=(xi+1)&127,y0=(yi&127)*N,y1=((yi+1)&127)*N;
    const a=g[y0+x0],b=g[y0+x1],c=g[y1+x0],d=g[y1+x1],u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}}

/* ================= 데이터 ================= */
export const W=2400,TS=4,TN=W/TS;
export const G=0,DG=1,SA=2,WA=3,RO=4,FL=5;
export const WD={
  pistol:{n:'권총',ak:'9',dmg:14,rate:.25,spr:.05,sp:430,rng:240,mag:15,rl:1.2,gl:6,rar:0},
  smg:{n:'기관단총',ak:'9',dmg:9,rate:.085,spr:.11,sp:470,rng:240,mag:30,rl:1.8,gl:9,rar:0},
  shotgun:{n:'산탄총',ak:'12',dmg:9,pel:8,rate:.9,spr:.24,sp:410,rng:130,mag:5,rl:2.4,gl:9,rar:1},
  ar:{n:'돌격소총',ak:'556',dmg:13,rate:.12,spr:.065,sp:570,rng:360,mag:30,rl:2.0,gl:10.5,rar:1},
  dmr:{n:'지정사수소총',ak:'762',dmg:34,rate:.42,spr:.02,sp:720,rng:480,mag:10,rl:2.3,gl:11,rar:2,scope:1.25},
  sniper:{n:'저격소총',ak:'762',dmg:75,rate:1.4,spr:.004,sp:920,rng:620,mag:5,rl:2.8,gl:13,rar:2,scope:1.45},
  flame:{n:'화염방사기',ak:null,dmg:5,rate:.05,spr:.16,sp:230,rng:95,mag:120,rl:0,gl:10,rar:3,special:1},
  minigun:{n:'미니건',ak:null,dmg:8,rate:.11,spr:.09,sp:560,rng:300,mag:150,rl:0,gl:12,rar:3,special:1},
  rail:{n:'레일건',ak:null,dmg:90,rate:1.2,spr:0,sp:1700,rng:650,mag:4,rl:0,gl:13,rar:3,special:1,scope:1.45},
};
export const FAM={shotgun:'near',smg:'near',pistol:'mid',ar:'mid',dmr:'far',sniper:'far',flame:'near',minigun:'mid',rail:'far'};
export const FAMN={near:'근거리',mid:'중거리',far:'원거리'};
export const RANK={pistol:1,smg:2,shotgun:2,ar:3,dmr:4,sniper:5,flame:6,minigun:6,rail:6};
export const RARC=['#ffffff','#5aa0ff','#c77dff','#ffc83d'];
export const CATC={w:'#ff9a3c',a:'#ffd84d',h:'#5de07a',ar:'#5ab0ff',bag:'#5ab0ff',mod:'#c77dff'};
export const AMMO={'9':{n:'9mm',w:.4,drop:30,c:'#f2c230'},'556':{n:'5.56mm',w:.5,drop:30,c:'#6fd04a'},'762':{n:'7.62mm',w:.7,drop:15,c:'#ff7a3a'},'12':{n:'12게이지',w:1.25,drop:10,c:'#ff4a4a'}};
export const HEAL={bandage:{n:'붕대',t:3,w:2,auto:10,drop:3},medkit:{n:'구급상자',t:6,w:20,auto:2,drop:1},drink:{n:'에너지 음료',t:3,w:4,auto:3,drop:1}};
export const BAGCAP=[100,150,200,250],MODCD=[45,38,32,26];
export const VEST=[0,.25,.35,.5],HELM=[0,.1,.18,.28],LVC=['','#a7bf6a','#5c8fd6','#3a3350'];
const PREF={pistol:100,smg:80,shotgun:40,ar:130,dmr:150,sniper:160,flame:45,minigun:110,rail:170};
const PH=[{r:950,w:45,s:35,d:.6},{r:560,w:35,s:30,d:1.5},{r:330,w:30,s:25,d:3},{r:180,w:25,s:20,d:5},{r:90,w:20,s:16,d:8},{r:35,w:15,s:12,d:12},{r:0,w:10,s:14,d:20}];
export const CHARS={
  shadow:{n:'그림자',tag:'숨어서 한 방',c:'#9a6be6',c2:'#4b2a86',hue:275,
    pas:{n:'은신',d:'수풀 안이나 가만히 서 있으면 적이 알아채는 거리가 절반으로 줄어듭니다. 쏘면 2초간 풀립니다.'},
    act:{n:'집중사격',d:'무기 계열에 따라 사격을 한 번 크게 다듬습니다.',near:{n:'집탄',d:'4초간 탄이 한데 모입니다'},mid:{n:'무반동',d:'4초간 반동과 탄퍼짐이 사라집니다'},far:{n:'필중',d:'다음 한 발이 조준한 적에게 반드시 명중합니다'}}},
  chrono:{n:'크로노',tag:'시간을 되돌리는 생존가',c:'#4ec3f0',c2:'#1f6f9c',hue:200,
    pas:{n:'잔상',d:'피격되면 1초간 이동속도가 30% 빨라집니다.'},
    act:{n:'되감기',d:'3초 전 위치로 돌아가고, 그동안 잃은 체력의 절반을 되찾습니다.',near:{n:'재장전',d:'되돌아가며 탄창이 즉시 가득 찹니다'},mid:{n:'미끼',d:'원래 자리에 잔상이 남아 적의 시선을 끕니다'},far:{n:'안정',d:'되돌아간 뒤 1.5초간 조준 흔들림이 없습니다'}}},
  psy:{n:'사이킥',tag:'염력으로 막아서는 방어가',c:'#f06aa8',c2:'#8c2a5c',hue:325,
    pas:{n:'끌어당김',d:'아이템 줍는 거리가 2배입니다.'},
    act:{n:'염력 방벽',d:'앞에 3초간 총알을 막는 방벽을 세웁니다.',near:{n:'밀치기',d:'방벽이 앞으로 밀려가며 적을 튕겨냅니다'},mid:{n:'반사',d:'막은 총알을 약하게 되돌려 보냅니다'},far:{n:'한쪽 통과',d:'내 총알만 방벽을 통과합니다'}}},
  volt:{n:'볼트',tag:'번개처럼 치고 빠지는 기동가',c:'#f5c83c',c2:'#b0661a',hue:45,
    pas:{n:'정전기',d:'같은 적을 연속 3번 맞히면 1.5초간 느려집니다.'},
    act:{n:'번개 도약',d:'이동 방향으로 짧게 순간이동합니다. 벽은 넘지 못합니다.',near:{n:'감전',d:'도착 지점 주변 적이 2초간 느려집니다'},mid:{n:'과충전',d:'도약 후 3초간 연사 속도가 빨라집니다'},far:{n:'장거리',d:'도약 거리가 2배지만 0.5초간 쏠 수 없습니다'}}},
};
export const CHK=Object.keys(CHARS);
export const BOTN=['도트장인','탄약부족','풀숲요정','치킨러버','파밍왕','존버중','샷건킹','저격수김씨','뚜벅이','헤드헌터','숨바꼭질','라면한그릇','붕대장수','막타도둑','달려달려','철모맨','구급대원','수풀속','낙하산','총알받이','무한파밍','마지막생존','슬쩍','새벽세시'];
const TOWN_NAMES=['군부대','장터마을','폐공장','항구','학교','발전소','농장','병원','채석장','교회'];
export const ROOFC=['#e0634e','#4e8fe0','#e0a94e','#5fbf7a','#b36ad6','#e07fa8'];
export const BOTS=24,VIEW=210,ALT=240;
// 도시 소품 크기(게임 단위) — KayKit City Builder 치수 × 배율
export const PROPS={
  building_A:{w:31,d:38,h:26,m:'building_A_withoutBase'},building_B:{w:42,d:34,h:26,m:'building_B_withoutBase'},
  building_C:{w:31,d:34,h:38,m:'building_C_withoutBase'},building_D:{w:42,d:34,h:38,m:'building_D_withoutBase'},
  building_E:{w:52,d:38,h:38,m:'building_E_withoutBase'},building_F:{w:52,d:34,h:38,m:'building_F_withoutBase'},
  building_G:{w:52,d:38,h:38,m:'building_G_withoutBase'},building_H:{w:52,d:34,h:50,m:'building_H_withoutBase'},
  car_hatchback:{w:12,d:23,h:10,m:'car_hatchback'},car_police:{w:12,d:26,h:11,m:'car_police'},car_sedan:{w:12,d:26,h:10,m:'car_sedan'},
  car_stationwagon:{w:12,d:26,h:10,m:'car_stationwagon'},car_taxi:{w:12,d:26,h:12,m:'car_taxi'},
  dumpster:{w:16,d:10,h:9,m:'dumpster'},box_A:{w:6,d:6,h:5,m:'box_A'},watertower:{w:14,d:14,h:19,m:'watertower'},
  bench:{w:11,d:4,h:3,m:'bench',nocol:1},streetlight:{w:2,d:2,h:27,m:'streetlight',nocol:1},firehydrant:{w:4,d:4,h:6,m:'firehydrant',nocol:1},
  bush:{w:6,d:6,h:11,m:'bush',nocol:1},trash_A:{w:4,d:4,h:1,m:'trash_A',nocol:1},box_B:{w:4,d:4,h:5,m:'box_B',nocol:1},
};

/* ================= 상태 ================= */
export const S={type:null,towns:[],buildings:[],obs:[],trees:[],props:[],items:[],players:[],me:null,bullets:[],decoys:[],barriers:[],drops:[],feed:[],events:[],
  zone:null,plane:null,gtime:0,aliveN:0,endT:-1,over:false,won:false,autoPick:true,seed:0};
let itemId=0;
const ev=(e)=>S.events.push(e);
export const toast=s=>ev({t:'toast',s});

/* ================= 공간 해시 ================= */
const HC=32,HN=Math.ceil(W/HC);let grid,qs=0;const QA=[],QB=[],QC=[];
export function tileAt(x,y){if(x<0||y<0||x>=W||y>=W)return WA;return S.type[((y|0)>>2)*TN+((x|0)>>2)]}
function addObs(o){S.obs.push(o);o.q=0;const b=o.k==='r'?[o.x,o.y,o.x+o.w,o.y+o.h]:[o.x-o.r,o.y-o.r,o.x+o.r,o.y+o.r];
  const x0=clamp(Math.floor(b[0]/HC),0,HN-1),x1=clamp(Math.floor(b[2]/HC),0,HN-1),y0=clamp(Math.floor(b[1]/HC),0,HN-1),y1=clamp(Math.floor(b[3]/HC),0,HN-1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)grid[y*HN+x].push(o)}
export function hQ(x0,y0,x1,y1,out){qs++;out.length=0;
  const a=clamp(Math.floor(x0/HC),0,HN-1),b=clamp(Math.floor(x1/HC),0,HN-1),c=clamp(Math.floor(y0/HC),0,HN-1),d=clamp(Math.floor(y1/HC),0,HN-1);
  for(let y=c;y<=d;y++)for(let x=a;x<=b;x++){const cell=grid[y*HN+x];for(let i=0;i<cell.length;i++){const o=cell[i];if(o.q!==qs){o.q=qs;if(!o.dead)out.push(o)}}}return out}
export function solidAt(x,y){hQ(x,y,x,y,QA);for(let i=0;i<QA.length;i++){const o=QA[i];
  if(o.k==='r'){if(x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h)return o}else{const dx=x-o.x,dy=y-o.y;if(dx*dx+dy*dy<=o.r*o.r)return o}}return null}
export function losClear(x0,y0,x1,y1){const d=hyp(x1-x0,y1-y0),n=Math.ceil(d/5);for(let i=1;i<n;i++){const t=i/n,o=solidAt(x0+(x1-x0)*t,y0+(y1-y0)*t);if(o&&!o.trunk&&!o.low)return false}return true}
function anySolidNear(x,y,m){hQ(x-m,y-m,x+m,y+m,QB);for(const o of QB){if(o.k==='c'){if(hyp(o.x-x,o.y-y)<o.r+m)return true}else{const cx=clamp(x,o.x,o.x+o.w),cy=clamp(y,o.y,o.y+o.h);if(hyp(cx-x,cy-y)<m)return true}}return false}
function nearBuilding(x,y,m){for(const b of S.buildings)if(x>b.x-m&&x<b.x+b.w+m&&y>b.y-m&&y<b.y+b.h+m)return true;return false}
export function bldAt(x,y){for(const b of S.buildings)if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return b;return null}
export function inBush(p){hQ(p.x-16,p.y-16,p.x+16,p.y+16,QC);for(const o of QC)if(o.trunk&&hyp(o.x-p.x,o.y-p.y)<o.cr-3)return true;return false}

/* ================= 월드 생성 ================= */
function pickW(R,arr){let s=0;for(const a of arr)s+=Math.max(0,a[1]);let v=R()*s;for(const a of arr){v-=Math.max(0,a[1]);if(v<=0)return a[0]}return arr[0][0]}
function addItem(k,s,n,x,y,mag,block){const it={id:++itemId,k,s,n,x,y,mag:mag||0,alive:true,block:block==null?-1:block};S.items.push(it);return it}
function spawnLoot(x,y,q,R){
  const cat=pickW(R,[['w',26+q*12],['a',24],['h',22],['ar',14+q*6],['bag',7+q*4],['mod',7+q*5]]);
  const lv=()=>R()<.66-q*.3?1:2;
  if(cat==='w'){const k=pickW(R,[['pistol',30-q*22],['smg',22],['shotgun',19],['ar',17+q*14],['dmr',7+q*9],['sniper',2+q*4]]);addItem('w',k,0,x,y,0);const ak=WD[k].ak;addItem('a',ak,AMMO[ak].drop,x+9,y+5)}
  else if(cat==='a'){const ak=pickW(R,[['9',35],['556',30],['12',15],['762',20]]);addItem('a',ak,AMMO[ak].drop,x,y)}
  else if(cat==='h'){const hk=pickW(R,[['bandage',55],['drink',25],['medkit',20]]);addItem('h',hk,HEAL[hk].drop,x,y)}
  else if(cat==='ar')addItem('ar',R()<.5?'helm':'vest',lv(),x,y);
  else addItem(cat,'',lv(),x,y);
}
function placeProp(R,key,x,y,rot){const P=PROPS[key];const sw=rot%2?P.d:P.w,sd=rot%2?P.w:P.d;
  const rx=x-sw/2,ry=y-sd/2;if(rx<30||ry<30||rx+sw>W-30||ry+sd>W-30)return false;
  for(let yy=ry;yy<=ry+sd;yy+=4)for(let xx=rx;xx<=rx+sw;xx+=4){const t=tileAt(xx,yy);if(t===WA||t===FL)return false}
  if(nearBuilding(x,y,Math.max(sw,sd)/2+6))return false;
  if(!P.nocol&&anySolidNear(x,y,Math.max(sw,sd)/2+4))return false;
  for(const p of S.props)if(p.big&&Math.abs(p.x-x)<(p.sw+sw)/2+10&&Math.abs(p.y-y)<(p.sd+sd)/2+10)return false;
  const pr={key,x,y,rot,sw,sd,big:key.startsWith('building')};S.props.push(pr);
  if(!P.nocol)addObs({k:'r',x:rx,y:ry,w:sw,h:sd,prop:pr,low:P.h<12&&!pr.big});return true}
export function genWorld(sd){
  S.seed=sd;const R=mulberry32(sd);itemId=0;S.type=new Uint8Array(TN*TN);const type=S.type;
  const n1=makeNoise(sd+1),n2=makeNoise(sd+2),n3=makeNoise(sd+3);
  const lakes=[];const nl=3+(R()*2|0);
  for(let i=0;i<nl;i++)lakes.push({x:250+R()*(W-500),y:250+R()*(W-500),r:80+R()*120});
  for(let ty=0;ty<TN;ty++)for(let tx=0;tx<TN;tx++){
    const x=tx*TS+2,y=ty*TS+2,f=n1(x/90,y/90)*.7+n2(x/28,y/28)*.3;let t=f>.6?DG:G;
    for(const l of lakes){const d=hyp(x-l.x,y-l.y)/l.r+(n3(x/35,y/35)-.5)*.55;if(d<1){t=WA;break}if(d<1.16)t=SA}
    const e=Math.min(x,y,W-x,W-y)+(n3(x/50+9,y/50)-.5)*40;if(e<30)t=WA;else if(e<52)t=SA;
    type[ty*TN+tx]=t}
  S.towns=[];
  for(let tr=0;tr<500&&S.towns.length<9;tr++){const x=220+R()*(W-440),y=220+R()*(W-440);
    if(S.towns.some(t=>hyp(t.x-x,t.y-y)<420))continue;
    let wet=tileAt(x,y)===WA;for(let a=0;a<12&&!wet;a++)if(tileAt(x+Math.cos(a/12*TAU)*140,y+Math.sin(a/12*TAU)*140)===WA)wet=true;
    if(wet)continue;S.towns.push({x,y,name:TOWN_NAMES[S.towns.length],q:S.towns.length===0?1:R()*.5})}
  S.roads=[];
  const road=(a,b)=>{const mx=(a.x+b.x)/2+(R()-.5)*180,my=(a.y+b.y)/2+(R()-.5)*180,L=hyp(a.x-b.x,a.y-b.y),n=Math.ceil(L/3);S.roads.push({a,b,mx,my});
    for(let i=0;i<=n;i++){const t=i/n,u=1-t,x=u*u*a.x+2*u*t*mx+t*t*b.x,y=u*u*a.y+2*u*t*my+t*t*b.y;
      for(let ty=Math.floor((y-8)/TS);ty<=Math.floor((y+8)/TS);ty++)for(let tx=Math.floor((x-8)/TS);tx<=Math.floor((x+8)/TS);tx++){
        if(tx<0||ty<0||tx>=TN||ty>=TN)continue;if(hyp(tx*TS+2-x,ty*TS+2-y)<=8)type[ty*TN+tx]=RO}}};
  const T=S.towns;for(let i=1;i<T.length;i++){let best=0,bd=1e9;for(let j=0;j<i;j++){const d=hyp(T[i].x-T[j].x,T[i].y-T[j].y);if(d<bd){bd=d;best=j}}road(T[i],T[best])}
  if(T.length>3)road(T[T.length-1],T[1]);
  S.obs=[];grid=Array.from({length:HN*HN},()=>[]);S.buildings=[];S.trees=[];S.items=[];S.props=[];
  const rectHas=(x,y,w,h,ts)=>{for(let ty=Math.floor(y/TS);ty<=Math.floor((y+h)/TS);ty++)for(let tx=Math.floor(x/TS);tx<=Math.floor((x+w)/TS);tx++){if(tx<0||ty<0||tx>=TN||ty>=TN)return true;if(ts.includes(type[ty*TN+tx]))return true}return false};
  for(const tw of T){const nb=3+(R()*4|0)+(tw.q>.9?2:0);let placed=0;
    for(let tr=0;tr<80&&placed<nb;tr++){const w=(48+R()*44)&~3,h=(44+R()*36)&~3,x=Math.round(tw.x+(R()-.5)*330-w/2),y=Math.round(tw.y+(R()-.5)*330-h/2);
      if(x<60||y<60||x+w>W-60||y+h>W-60)continue;
      if(S.buildings.some(b=>x<b.x+b.w+22&&x+w+22>b.x&&y<b.y+b.h+22&&y+h+22>b.y))continue;
      if(rectHas(x-4,y-4,w+8,h+8,[WA,RO,SA]))continue;
      S.buildings.push({x,y,w,h,tw,roof:ROOFC[S.buildings.length%ROOFC.length],fade:1,idx:S.buildings.length});placed++}}
  const D=18;
  const wallH=(b,x,y,L,gap)=>{if(gap==null){addObs({k:'r',x,y,w:L,h:4,wall:1,b});return}addObs({k:'r',x,y,w:gap-D/2,h:4,wall:1,b});addObs({k:'r',x:x+gap+D/2,y,w:L-gap-D/2,h:4,wall:1,b})};
  const wallV=(b,x,y,L,gap)=>{if(gap==null){addObs({k:'r',x,y,w:4,h:L,wall:1,b});return}addObs({k:'r',x,y,w:4,h:gap-D/2,wall:1,b});addObs({k:'r',x,y:y+gap+D/2,w:4,h:L-gap-D/2,wall:1,b})};
  const gapPos=L=>Math.round(L/2+(R()-.5)*(L-2*D-14));
  for(const b of S.buildings){b.doors=[];const door=(ix,iy,ox,oy)=>b.doors.push({ix,iy,ox,oy});
    for(let ty=b.y>>2;ty<(b.y+b.h)>>2;ty++)for(let tx=b.x>>2;tx<(b.x+b.w)>>2;tx++)type[ty*TN+tx]=FL;
    const d1=R()*4|0,d2=R()<.55?(d1+2)%4:-1,has=s=>s===d1||s===d2;
    const g0=has(0)?gapPos(b.w):null,g2=has(2)?gapPos(b.w):null,g3=has(3)?gapPos(b.h-8):null,g1=has(1)?gapPos(b.h-8):null;
    wallH(b,b.x,b.y,b.w,g0);wallH(b,b.x,b.y+b.h-4,b.w,g2);wallV(b,b.x,b.y+4,b.h-8,g3);wallV(b,b.x+b.w-4,b.y+4,b.h-8,g1);
    if(g0!=null)door(b.x+g0,b.y+10,b.x+g0,b.y-10);if(g2!=null)door(b.x+g2,b.y+b.h-10,b.x+g2,b.y+b.h+10);
    if(g3!=null)door(b.x+10,b.y+4+g3,b.x-10,b.y+4+g3);if(g1!=null)door(b.x+b.w-10,b.y+4+g1,b.x+b.w+10,b.y+4+g1);
    if(b.w>=80&&R()<.8)wallV(b,b.x+(b.w>>1)-2,b.y+4,b.h-8,gapPos(b.h-8))}
  // 도시 소품: 마을 외곽 큰 건물, 차, 쓰레기통 등
  const BK=['building_A','building_B','building_C','building_D','building_E','building_F','building_G','building_H'];
  for(const tw of T){let n=0;for(let tr=0;tr<60&&n<3;tr++){const a=R()*TAU,d=150+R()*110;if(placeProp(R,BK[R()*8|0],Math.round(tw.x+Math.cos(a)*d),Math.round(tw.y+Math.sin(a)*d),R()*4|0))n++}
    let m=0;for(let tr=0;tr<60&&m<7;tr++){const a=R()*TAU,d=40+R()*200,k=pickW(R,[['car_sedan',3],['car_taxi',2],['car_police',tw.q>.9?4:1],['car_hatchback',2],['car_stationwagon',2],['dumpster',3],['box_A',3],['watertower',tw.q>.9?1:.5]]);
      if(placeProp(R,k,Math.round(tw.x+Math.cos(a)*d),Math.round(tw.y+Math.sin(a)*d),R()*4|0))m++}
    for(let i=0;i<10;i++){const a=R()*TAU,d=30+R()*220;placeProp(R,pickW(R,[['bench',2],['streetlight',3],['firehydrant',1],['bush',4],['trash_A',2],['box_B',2]]),Math.round(tw.x+Math.cos(a)*d),Math.round(tw.y+Math.sin(a)*d),R()*4|0)}}
  for(const r of S.roads){for(let i=1;i<8;i++){if(R()<.5)continue;const t=i/8,u=1-t,x=u*u*r.a.x+2*u*t*r.mx+t*t*r.b.x,y=u*u*r.a.y+2*u*t*r.my+t*t*r.b.y;
    const dx=2*u*(r.mx-r.a.x)+2*t*(r.b.x-r.mx),dy=2*u*(r.my-r.a.y)+2*t*(r.b.y-r.my),L=hyp(dx,dy)||1,nx=-dy/L,ny=dx/L,s=R()<.5?1:-1;
    if(R()<.35)placeProp(R,pickW(R,[['car_sedan',2],['car_hatchback',2],['car_stationwagon',1]]),Math.round(x+nx*s*18),Math.round(y+ny*s*18),Math.abs(dx)>Math.abs(dy)?1:0);
    else placeProp(R,'streetlight',Math.round(x+nx*s*14),Math.round(y+ny*s*14),0)}}
  for(let i=0;i<240;i++){const x=R()*W,y=R()*W,r=5+(R()*6|0),t=tileAt(x,y);
    if(t===WA||t===RO||t===FL||nearBuilding(x,y,r+12)||anySolidNear(x,y,r+4))continue;addObs({k:'c',x,y,r,rock:1,v:R()*100|0})}
  for(let i=0;i<3400&&S.trees.length<900;i++){const x=R()*W,y=R()*W,t=tileAt(x,y);
    if(t!==G&&t!==DG)continue;if(t===G&&R()<.62)continue;if(nearBuilding(x,y,18)||anySolidNear(x,y,11))continue;
    const cr=[10,12,14][R()*3|0];const o={k:'c',x,y,r:2.6,trunk:1,cr,ti:S.trees.length};addObs(o);S.trees.push({x,y,r:cr,v:R()*2|0,rot:R()*TAU})}
  for(const b of S.buildings){const n=2+(R()*3|0)+(b.tw.q>.9?2:0);
    for(let i=0;i<n;i++){const x=b.x+10+R()*(b.w-20),y=b.y+10+R()*(b.h-20);if(!solidAt(x,y)&&!anySolidNear(x,y,4))spawnLoot(x,y,b.tw.q,R)}}
  for(let i=0;i<280;i++){const x=60+R()*(W-120),y=60+R()*(W-120),t=tileAt(x,y);if(t===WA||solidAt(x,y)||anySolidNear(x,y,5))continue;if(R()<.55)spawnLoot(x,y,0,R)}
}

/* ================= 경기 시작/비행기 ================= */
function makePlayer(id,name,bot,ch){
  return{id,name,x:0,y:0,z:ALT,ph:'plane',r:6,hp:100,boost:0,alive:true,bot,ch,ang:Math.random()*TAU,w:[null,null],cur:2,
    ammo:{'9':0,'556':0,'762':0,'12':0},heal:{bandage:0,medkit:0,drink:0},helm:0,vest:0,bag:0,mod:0,kills:0,
    cd:0,rl:0,healT:0,healK:null,sw:0,flash:0,hitT:0,punch:0,deathT:0,provoked:0,skillCD:12,buff:{},slowT:0,stillT:0,revealT:0,
    hist:[],histT:0,voltTgt:null,voltN:0,mdx:0,mdy:0,moving:false,opening:null,openT:0,charge:0,spin:0,firingT:0,shotT:0,skillT:0,landT:0,
    thinkT:Math.random()*.3,tgt:null,tgtVis:false,lostT:0,react:0,err:0,sdir:Math.random()<.5?1:-1,mvx:0,mvy:0,
    goal:null,wp:null,wpT:0,unstick:0,uang:0,stuckT:0,lx:0,ly:0,skill:.3+Math.random()*.7,aggr:90+Math.random()*60,in:{},blinkDir:null,jumpAt:1,dest:null}}
export function startMatch(myChar){
  S.players=[];S.bullets=[];S.decoys=[];S.barriers=[];S.drops=[];S.feed=[];S.events=[];S.gtime=0;S.endT=-1;S.over=false;S.won=false;
  // 비행 경로: 맵을 가로지르는 직선
  const a=Math.random()*TAU,off=(Math.random()-.5)*900,cx=W/2+Math.cos(a+Math.PI/2)*off,cy=W/2+Math.sin(a+Math.PI/2)*off,L=W*.95;
  const pl={x0:cx-Math.cos(a)*L,y0:cy-Math.sin(a)*L,x1:cx+Math.cos(a)*L,y1:cy+Math.sin(a)*L,t:0,sp:170,ang:a,x:0,y:0,done:false};
  pl.len=hyp(pl.x1-pl.x0,pl.y1-pl.y0);pl.tIn=1;pl.tOut=0;
  for(let i=0;i<=200;i++){const t=i/200,x=pl.x0+(pl.x1-pl.x0)*t,y=pl.y0+(pl.y1-pl.y0)*t;if(x>80&&y>80&&x<W-80&&y<W-80){pl.tIn=Math.min(pl.tIn,t);pl.tOut=Math.max(pl.tOut,t)}}
  pl.t=Math.max(0,pl.tIn-.06);S.plane=pl;
  S.me=makePlayer(0,'나',false,myChar);S.players.push(S.me);
  for(let i=0;i<BOTS;i++){const b=makePlayer(i+1,BOTN[i],true,CHK[Math.random()*4|0]);
    let dx,dy;if(Math.random()<.55&&S.towns.length){const t=S.towns[Math.random()*S.towns.length|0];dx=t.x+(Math.random()-.5)*160;dy=t.y+(Math.random()-.5)*160}else{dx=150+Math.random()*(W-300);dy=150+Math.random()*(W-300)}
    b.dest={x:dx,y:dy};let bt=pl.tIn,bd=1e9;for(let k=0;k<=100;k++){const t=pl.tIn+(pl.tOut-pl.tIn)*k/100,x=pl.x0+(pl.x1-pl.x0)*t,y=pl.y0+(pl.y1-pl.y0)*t,d=hyp(x-dx,y-dy);if(d<bd){bd=d;bt=t}}
    b.jumpAt=clamp(bt-.02+Math.random()*.04,pl.tIn,pl.tOut);S.players.push(b)}
  S.aliveN=S.players.length;
  const flight=(pl.tOut-pl.t)*pl.len/pl.sp;
  S.zone={cx:W/2,cy:W/2,r:W*.76,phase:-1,state:'wait',t:0,tx:W/2,ty:W/2,tr:W*.76,sx:0,sy:0,sr:0,d:.4};nextZone();S.zone.t+=flight+10;
  updPlane(0);
}
function updPlane(dt){const pl=S.plane;if(pl.done)return;pl.t+=dt*pl.sp/pl.len;pl.x=pl.x0+(pl.x1-pl.x0)*pl.t;pl.y=pl.y0+(pl.y1-pl.y0)*pl.t;
  let any=false;for(const p of S.players){if(p.ph!=='plane')continue;p.x=pl.x;p.y=pl.y;any=true;
    if(p.bot&&pl.t>=p.jumpAt)jump(p);else if(pl.t>=pl.tOut)jump(p)}
  if(pl.t>1.02)pl.done=true;return any}
export function jump(p){if(p.ph!=='plane')return;p.ph='fall';p.z=ALT-6;p.x=S.plane.x+(Math.random()-.5)*8;p.y=S.plane.y+(Math.random()-.5)*8;if(p===S.me){ev({t:'jump'});toast('뛰어내렸습니다. 왼쪽 스틱으로 방향을 조종하세요')}}
function updAir(p,inp,dt){
  let mx=inp.mx,my=inp.my;
  if(p.bot){const dx=p.dest.x-p.x,dy=p.dest.y-p.y,d=hyp(dx,dy);if(d>6){mx=dx/d;my=dy/d}else mx=my=0}
  const m=hyp(mx,my);if(m>1){mx/=m;my/=m}
  const sp=p.ph==='fall'?100:62;p.x=clamp(p.x+mx*sp*dt,40,W-40);p.y=clamp(p.y+my*sp*dt,40,W-40);p.moving=m>.1;if(p.moving){p.ang=Math.atan2(my,mx)}
  p.z-=(p.ph==='fall'?75:24)*dt;
  if(p.ph==='fall'&&p.z<=90){p.ph='chute';if(p===S.me)ev({t:'chute'})}
  if(p.z<=0){p.z=0;p.ph='ground';p.landT=.6;collide(p);collide(p);if(p===S.me){ev({t:'land'});toast('착지 완료. 무기를 찾으면 스킬이 열립니다')}}}

function nextZone(){const z=S.zone;z.phase++;const ph=PH[z.phase];if(!ph){z.state='done';return}
  z.tr=ph.r;const maxOff=Math.max(0,z.r-ph.r);
  for(let i=0;i<60;i++){const a=Math.random()*TAU,d=Math.sqrt(Math.random())*maxOff*.9,tx=z.cx+Math.cos(a)*d,ty=z.cy+Math.sin(a)*d,m=Math.min(ph.r*.7,300);
    if(tx>m&&ty>m&&tx<W-m&&ty<W-m&&tileAt(tx,ty)!==WA){z.tx=tx;z.ty=ty;break}if(i===59){z.tx=z.cx;z.ty=z.cy}}
  z.state='wait';z.t=ph.w}
function updZone(dt){const z=S.zone;
  if(z.state==='wait'){z.t-=dt;if(z.t<=0){z.state='shrink';const ph=PH[z.phase];z.t=ph.s;z.sx=z.cx;z.sy=z.cy;z.sr=z.r;z.d=ph.d;if(z.phase<5)spawnDrops(z.phase<2?1:1+(Math.random()<.5?1:0))}}
  else if(z.state==='shrink'){z.t-=dt;const ph=PH[z.phase],f=clamp(1-z.t/ph.s,0,1);
    z.cx=z.sx+(z.tx-z.sx)*f;z.cy=z.sy+(z.ty-z.sy)*f;z.r=z.sr+(z.tr-z.sr)*f;
    if(z.t<=0){z.cx=z.tx;z.cy=z.ty;z.r=z.tr;nextZone()}}
  for(const p of S.players){if(!p.alive||p.ph!=='ground')continue;if(hyp(p.x-z.cx,p.y-z.cy)>z.r){p.zoneAcc=(p.zoneAcc||0)+dt;if(p.zoneAcc>=.5){p.zoneAcc=0;hurt(p,z.d*.5,null,'zone',true)}}}}

/* ================= 보급 ================= */
function spawnDrops(n){let made=0;const z=S.zone;
  for(let k=0;k<n;k++)for(let i=0;i<60;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*Math.max(20,z.tr*.8),x=z.tx+Math.cos(a)*r,y=z.ty+Math.sin(a)*r;
    if(x<80||y<80||x>W-80||y>W-80)continue;const t=tileAt(x,y);if(t===WA||t===FL||nearBuilding(x,y,16)||anySolidNear(x,y,16))continue;
    S.drops.push({id:Math.random(),x,y,z:1,fall:10,landed:false,opened:false,obs:null,smoke:0});made++;break}
  if(made){toast('보급상자가 떨어지고 있습니다');feedPush('보급상자 투하 '+made+'개',true);ev({t:'sfx',k:'drop'})}}
function updDrops(dt){for(const d of S.drops){
  if(!d.landed){d.z-=dt/d.fall;if(d.z<=0){d.z=0;d.landed=true;d.obs={k:'r',x:d.x-8,y:d.y-8,w:16,h:16,drop:1};addObs(d.obs);ev({t:'dust',x:d.x,y:d.y});
      for(const p of S.players)if(p.alive&&p.ph==='ground'&&hyp(p.x-d.x,p.y-d.y)<14){p.x=d.x+14;collide(p)}}}}}
function openDrop(d,p){d.opened=true;const L=[];
  const sp=['flame','minigun','rail'][Math.random()*3|0];L.push(['w',sp,0,WD[sp].mag]);
  const ex=['ar:helm:3','ar:vest:3','bag::3','mod::3'].sort(()=>Math.random()-.5).slice(0,2);for(const e of ex){const[k,s,n]=e.split(':');L.push([k,s,+n])}
  L.push(['h','medkit',1]);if(Math.random()<.5)L.push(['h','drink',2]);
  L.forEach((e,i)=>{const a=i/L.length*TAU,x=d.x+Math.cos(a)*18,y=d.y+Math.sin(a)*18,bad=solidAt(x,y);addItem(e[0],e[1],e[2],bad?d.x:x,bad?d.y+14:y,e[3]||0)});
  if(p===S.me){toast('보급상자를 열었습니다');ev({t:'sfx',k:'open'})}}
export function nearDrop(p){for(const d of S.drops)if(d.landed&&!d.opened&&hyp(d.x-p.x,d.y-p.y)<22)return d;return null}

/* ================= 가방/무게 ================= */
export function weight(p){let s=0;for(const k in p.ammo)s+=p.ammo[k]*AMMO[k].w;for(const k in p.heal)s+=p.heal[k]*HEAL[k].w;return s}
export function capOf(p){return BAGCAP[p.bag]}
function fitN(p,uw){return Math.max(0,Math.floor((capOf(p)-weight(p)+1e-6)/uw))}
export function pickR(p){return p.ch==='psy'?26:13}
function usesAmmo(p,ak){return p.w.some(w=>w&&WD[w.k].ak===ak)}
function removeItem(it){it.alive=false;const i=S.items.indexOf(it);if(i>=0)S.items.splice(i,1)}
function takeWeapon(p,it,slot){const old=p.w[slot];p.w[slot]={k:it.s,mag:it.mag};
  if(old){it.s=old.k;it.mag=old.mag;it.block=p.id}else removeItem(it);
  if(p.cur===2||p.cur===slot||!p.bot){p.cur=slot;p.sw=.3;p.rl=0;p.charge=0}if(p===S.me)ev({t:'sfx',k:'equip'})}
export function itemName(it){if(it.k==='w')return WD[it.s].n;if(it.k==='a')return AMMO[it.s].n;if(it.k==='h')return HEAL[it.s].n;if(it.k==='ar')return(it.s==='helm'?'헬멧':'조끼')+' Lv'+it.n;if(it.k==='bag')return'가방 Lv'+it.n;return'전술 모듈 Lv'+it.n}
export function iconKey(it){return it.k==='w'?'w_'+it.s:it.k==='a'?'a_'+it.s:it.k==='h'?'h_'+it.s:it.k==='ar'?'ar_'+it.s+it.n:it.k+it.n}
export function rarity(it){if(it.k==='w')return WD[it.s].rar;if(it.k==='ar'||it.k==='bag'||it.k==='mod')return it.n===1?0:it.n===2?1:3;return 0}
export function pickItem(p,it,manual){
  if(it.k==='a'||it.k==='h'){const uw=it.k==='a'?AMMO[it.s].w:HEAL[it.s].w;let n=Math.min(it.n,fitN(p,uw));
    if(!manual&&it.k==='h')n=Math.min(n,Math.max(0,HEAL[it.s].auto*(p.bot?2:1)-p.heal[it.s]));
    if(n<=0){if(manual&&p===S.me)toast('가방이 가득 찼습니다');return false}
    (it.k==='a'?p.ammo:p.heal)[it.s]+=n;it.n-=n;const nm=itemName(it);if(it.n<=0)removeItem(it);
    if(p===S.me){toast('+'+n+' '+nm);ev({t:'sfx',k:'pick'})}return true}
  if(it.k==='w'){const slot=!p.w[0]?0:!p.w[1]?1:(p.cur<2?p.cur:0);const nm=WD[it.s].n;takeWeapon(p,it,slot);if(p===S.me)toast(nm+' 획득');return true}
  const field=it.k==='ar'?it.s:it.k;const cur=p[field];
  if(it.k==='bag'&&BAGCAP[it.n]<weight(p)){if(p===S.me)toast('짐이 너무 많아 이 가방으로 바꿀 수 없습니다');return false}
  p[field]=it.n;const nm=itemName(it);if(cur>0){it.n=cur;it.block=p.id}else removeItem(it);
  if(p===S.me){toast(nm+' 장착');ev({t:'sfx',k:'equip'})}return true}
function autoPickup(p){
  const R=pickR(p);let near=null,nd=1e9;
  for(let i=S.items.length-1;i>=0;i--){const it=S.items[i];if(!it||!it.alive)continue;const d=hyp(it.x-p.x,it.y-p.y);
    if(it.block===p.id){if(d>R+8)it.block=-1;continue}
    if(d>R)continue;let auto=false;
    if(p.bot){if(it.k==='a')auto=usesAmmo(p,it.s);else if(it.k==='h')auto=true;else if(it.k==='w')auto=!p.w[0]||!p.w[1]||RANK[it.s]>Math.min(RANK[p.w[0].k],RANK[p.w[1].k]);else auto=it.n>p[it.k==='ar'?it.s:it.k]}
    else if(S.autoPick){if(it.k==='a')auto=usesAmmo(p,it.s);else if(it.k==='h')auto=p.heal[it.s]<HEAL[it.s].auto;else if(it.k==='w')auto=!p.w[0]||!p.w[1];else auto=p[it.k==='ar'?it.s:it.k]===0}
    if(auto){if(p.bot&&it.k==='w'&&p.w[0]&&p.w[1]){const worse=RANK[p.w[0].k]<=RANK[p.w[1].k]?0:1;takeWeapon(p,it,worse);continue}
      if(pickItem(p,it,false))continue}
    if(!p.bot&&d<nd){nd=d;near=it}}
  return near}
export function dropStuff(p,k,s,n){const x=p.x+(Math.random()-.5)*10,y=p.y+(Math.random()-.5)*10;
  if(k==='a'){n=Math.min(n,p.ammo[s]);if(n<=0)return;p.ammo[s]-=n;addItem('a',s,n,x,y,0,p.id)}
  else if(k==='h'){n=Math.min(n,p.heal[s]);if(n<=0)return;p.heal[s]-=n;if(p.healK===s)cancelHeal(p);addItem('h',s,n,x,y,0,p.id)}
  else if(k==='w'){const w=p.w[s];if(!w)return;p.w[s]=null;addItem('w',w.k,0,x,y,w.mag,p.id);if(p.cur===s){p.cur=2;p.rl=0;p.charge=0}}
  else if(k==='bag'){if(!p.bag)return;if(weight(p)>BAGCAP[0]){toast('짐을 먼저 줄여야 가방을 내려놓을 수 있습니다');return}addItem('bag','',p.bag,x,y,0,p.id);p.bag=0}
  else{const f=k==='ar'?s:k;if(!p[f])return;addItem(k,k==='ar'?s:'',p[f],x,y,0,p.id);p[f]=0}
  if(p===S.me)ev({t:'sfx',k:'drop'})}

/* ================= 전투/행동 ================= */
export function curW(p){return p.cur<2?p.w[p.cur]:null}
export function famOf(p){const w=curW(p);return w?FAM[w.k]:null}
function startReload(p){const w=curW(p);if(!w||p.rl>0)return;const d=WD[w.k];if(d.special||w.mag>=d.mag||p.ammo[d.ak]<=0)return;cancelHeal(p);p.rl=d.rl;if(p===S.me)ev({t:'sfx',k:'reload'})}
function finishReload(p){const w=curW(p);if(!w)return;const d=WD[w.k];if(d.special)return;const take=Math.min(d.mag-w.mag,p.ammo[d.ak]);w.mag+=take;p.ammo[d.ak]-=take}
function canUse(p,k){if(k==='bandage')return p.hp<75;if(k==='medkit')return p.hp<100;return p.boost<100}
function cancelHeal(p){p.healT=0;p.healK=null}
function finishHeal(p){const k=p.healK;if(!k)return;p.heal[k]--;if(k==='bandage')p.hp=Math.max(p.hp,Math.min(75,p.hp+15));else if(k==='medkit')p.hp=100;else p.boost=Math.min(100,p.boost+45);p.healK=null;if(p===S.me)ev({t:'sfx',k:'heal'})}
export function stealthed(p){return p.ch==='shadow'&&p.revealT<=0&&(p.stillT>.6||inBush(p))}
function anySolidR(x,y,m){return anySolidNear(x,y,m)}
function useSkill(p){
  if(!p.alive||p.skillCD>0)return false;const f=famOf(p);if(!f){if(p===S.me)toast('무기를 들어야 스킬을 쓸 수 있습니다');return false}
  const w=curW(p);
  if(p.ch==='shadow'){if(f==='near')p.buff.tight=4;else if(f==='mid')p.buff.steady=4;else p.buff.sure=5;ev({t:'ring',x:p.x,y:p.y,r:16,c:CHARS.shadow.c})}
  else if(p.ch==='chrono'){const h=p.hist[0]||{x:p.x,y:p.y,hp:p.hp},ox=p.x,oy=p.y;p.hp=Math.min(100,p.hp+Math.max(0,h.hp-p.hp)*.5);p.x=h.x;p.y=h.y;p.hist=[];p.opening=null;
    ev({t:'trail',x1:ox,y1:oy,x2:p.x,y2:p.y,c:CHARS.chrono.c});ev({t:'ring',x:p.x,y:p.y,r:18,c:CHARS.chrono.c});
    if(f==='near'){const d=WD[w.k];if(!d.special){const take=Math.min(d.mag-w.mag,p.ammo[d.ak]);w.mag+=take;p.ammo[d.ak]-=take;p.rl=0}}
    else if(f==='mid'){const dc={id:'d'+Math.random(),x:ox,y:oy,hp:40,t:3,owner:p,ang:p.ang,ch:p.ch,w:w.k,alive:true,decoy:true,r:6,helm:p.helm,bag:p.bag};S.decoys.push(dc)}
    else p.buff.steady=1.5}
  else if(p.ch==='psy'){const nx=Math.cos(p.ang),ny=Math.sin(p.ang);S.barriers.push({id:Math.random(),x:p.x+nx*15,y:p.y+ny*15,nx,ny,len:36,t:3,max:3,owner:p,fam:f,v:f==='near'?42:0})}
  else if(p.ch==='volt'){let dx,dy;if(p.blinkDir!=null){dx=Math.cos(p.blinkDir);dy=Math.sin(p.blinkDir);p.blinkDir=null}else if(p.moving){dx=p.mdx;dy=p.mdy}else{dx=Math.cos(p.ang);dy=Math.sin(p.ang)}
    const dist=f==='far'?110:58;let tx=p.x,ty=p.y;for(let s=2;s<=dist;s+=2){const nx=p.x+dx*s,ny=p.y+dy*s;if(nx<10||ny<10||nx>W-10||ny>W-10||anySolidR(nx,ny,p.r-.5))break;tx=nx;ty=ny}
    ev({t:'bolt',x1:p.x,y1:p.y,x2:tx,y2:ty,c:CHARS.volt.c});p.x=tx;p.y=ty;ev({t:'ring',x:tx,y:ty,r:f==='near'?34:16,c:CHARS.volt.c});
    if(f==='near')for(const q of S.players)if(q!==p&&q.alive&&q.ph==='ground'&&hyp(q.x-tx,q.y-ty)<34)q.slowT=2;
    if(f==='mid')p.buff.over=3;if(f==='far')p.buff.nofire=.5}
  p.skillCD=MODCD[p.mod];p.skillT=.5;ev({t:'skill',p});return true}

export function applyInput(p,inp,dt){
  if(inp.sw!=null&&inp.sw!==p.cur&&(inp.sw===2||p.w[inp.sw])){p.cur=inp.sw;p.sw=.25;p.rl=0;p.charge=0;cancelHeal(p)}
  if(inp.use&&p.healT<=0&&p.heal[inp.use]>0){if(canUse(p,inp.use)){p.healK=inp.use;p.healT=HEAL[inp.use].t;p.rl=0}else if(p===S.me)toast(inp.use==='bandage'?'붕대는 체력 75까지만 채웁니다':'지금은 쓸 필요가 없습니다')}
  else if(inp.use&&p===S.me&&p.heal[inp.use]<=0)toast(HEAL[inp.use].n+'이(가) 없습니다');
  if(inp.reload)startReload(p);
  if(inp.skill)useSkill(p);
  if(inp.open){const d=nearDrop(p);if(d&&!p.opening){p.opening=d;p.openT=3;cancelHeal(p)}}
  let mx=inp.mx,my=inp.my;const m=hyp(mx,my);if(m>1){mx/=m;my/=m}
  p.moving=m>.1;if(p.moving){const mm=hyp(mx,my)||1;p.mdx=mx/mm;p.mdy=my/mm;p.stillT=0}else p.stillT+=dt;
  const w=curW(p);
  let sp=62;if(p.healT>0)sp*=.45;if(tileAt(p.x,p.y)===WA)sp*=.55;if(p.boost>50)sp*=1.08;if(p.slowT>0)sp*=.6;if(p.buff.haste>0)sp*=1.3;
  if(w&&w.k==='sniper')sp*=.94;if(w&&w.k==='minigun'&&p.firingT>0)sp*=.6;if(p.charge>0)sp*=.7;if(p.landT>0)sp*=.4;
  p.x=clamp(p.x+mx*sp*dt,p.r,W-p.r);p.y=clamp(p.y+my*sp*dt,p.r,W-p.r);collide(p);collide(p);
  p.ang=inp.aim;
  p.cd-=dt;p.sw-=dt;p.flash-=dt;p.punch-=dt;p.hitT-=dt;p.slowT-=dt;p.revealT-=dt;p.firingT-=dt;p.shotT-=dt;p.skillT-=dt;p.landT-=dt;if(p.skillCD>0)p.skillCD-=dt;
  for(const k in p.buff)if(p.buff[k]>0)p.buff[k]-=dt;
  p.histT-=dt;if(p.histT<=0){p.histT=.1;p.hist.push({x:p.x,y:p.y,hp:p.hp});if(p.hist.length>31)p.hist.shift()}
  if(p.rl>0){p.rl-=dt;if(p.rl<=0)finishReload(p)}
  if(p.healT>0){p.healT-=dt;if(p.healT<=0)finishHeal(p)}
  if(p.boost>0){p.boost=Math.max(0,p.boost-2.2*dt);if(p.hp<100)p.hp=Math.min(100,p.hp+(p.boost>60?1.6:1)*dt)}
  if(p.opening){const d=p.opening;if(p.moving||inp.fire||d.opened||hyp(d.x-p.x,d.y-p.y)>24)p.opening=null;else{p.openT-=dt;if(p.openT<=0){openDrop(d,p);p.opening=null}}}
  // 미니건 회전
  if(inp.fire&&w&&w.k==='minigun'&&w.mag>0)p.spin=Math.min(1,p.spin+dt/1.5);else p.spin=Math.max(0,p.spin-dt);
  // 레일건 충전
  if(w&&w.k==='rail'){if(inp.fire&&w.mag>0&&p.cd<=0&&p.sw<=0&&!(p.buff.nofire>0)&&p.landT<=0){if(p.charge<=0){p.charge=1;ev({t:'sfx',k:'charge',x:p.x,y:p.y})}p.charge-=dt;if(p.charge<=0.001){p.charge=0;fire(p,w);cancelHeal(p)}else p.charge=Math.max(p.charge,.001)}else p.charge=0}
  else if(inp.fire&&p.sw<=0&&p.cd<=0&&!(p.buff.nofire>0)&&p.landT<=0){
    if(!w)punch(p);
    else if(p.rl<=0){if(w.mag>0){fire(p,w);if(p.healT>0)cancelHeal(p)}else if(!WD[w.k].special&&p.ammo[WD[w.k].ak]>0)startReload(p);
      else if(p===S.me&&!(p.noAmmo>0)){toast(WD[w.k].special?WD[w.k].n+' 탄이 다 떨어졌습니다':AMMO[WD[w.k].ak].n+' 탄약이 없습니다');p.noAmmo=1.5}}}
  if(p.noAmmo>0)p.noAmmo-=dt}
export function collide(p){hQ(p.x-p.r-1,p.y-p.r-1,p.x+p.r+1,p.y+p.r+1,QB);
  for(const o of QB){if(o.k==='r'){const cx=clamp(p.x,o.x,o.x+o.w),cy=clamp(p.y,o.y,o.y+o.h),dx=p.x-cx,dy=p.y-cy,d2=dx*dx+dy*dy;
      if(d2<p.r*p.r){if(d2>1e-6){const d=Math.sqrt(d2);p.x+=dx/d*(p.r-d);p.y+=dy/d*(p.r-d)}
        else{const l=p.x-o.x,r2=o.x+o.w-p.x,t=p.y-o.y,b=o.y+o.h-p.y,mn=Math.min(l,r2,t,b);if(mn===l)p.x=o.x-p.r;else if(mn===r2)p.x=o.x+o.w+p.r;else if(mn===t)p.y=o.y-p.r;else p.y=o.y+o.h+p.r}}}
    else{const dx=p.x-o.x,dy=p.y-o.y,d=hyp(dx,dy),mn=p.r+o.r;if(d<mn&&d>1e-4){p.x=o.x+dx/d*mn;p.y=o.y+dy/d*mn}}}}
export function muzzle(p,d){return[p.x+Math.cos(p.ang)*(5+d.gl),p.y+Math.sin(p.ang)*(5+d.gl)]}
function fire(p,w){const d=WD[w.k];w.mag--;p.revealT=2;p.shotT=.18;p.firingT=.25;
  p.cd=d.rate*(p.buff.over>0?.65:1)*(w.k==='minigun'?(1-.55*p.spin):1);
  const[mx,my]=muzzle(p,d);
  if(p.buff.sure>0&&FAM[w.k]==='far'){p.buff.sure=0;let best=null,ba=.35;
    for(const q of[...S.players,...S.decoys]){if(q===p||!q.alive||q.owner===p||(q.ph&&q.ph!=='ground'))continue;const dd=hyp(q.x-p.x,q.y-p.y);if(dd>d.rng)continue;const da=Math.abs(angDiff(Math.atan2(q.y-p.y,q.x-p.x),p.ang));if(da<ba&&losClear(p.x,p.y,q.x,q.y)){ba=da;best=q}}
    if(best){ev({t:'beam',x1:mx,y1:my,x2:best.x,y2:best.y,c:CHARS.shadow.c});if(best.decoy)hitDecoy(best,d.dmg);else hurt(best,d.dmg,p,w.k);ev({t:'shot',k:w.k,x:p.x,y:p.y,p});return}}
  let spr=d.spr*(p.moving?1.35:1)*(p.bot?1.25:1);if(p.buff.tight>0)spr*=.3;if(p.buff.steady>0)spr=0;
  const n=d.pel||1;
  for(let i=0;i<n;i++){const a=p.ang+(Math.random()-.5)*2*spr,L=d.rng*(.9+Math.random()*.2);
    S.bullets.push({x:mx,y:my,px:mx,py:my,vx:Math.cos(a)*d.sp,vy:Math.sin(a)*d.sp,dmg:d.dmg,own:p,left:L,max:L,k:w.k,refl:false,flame:w.k==='flame',pierce:w.k==='rail',hitSet:w.k==='rail'?new Set():null})}
  ev({t:'shot',k:w.k,x:p.x,y:p.y,p})}
function punch(p){p.cd=.45;p.punch=.25;const fx=p.x+Math.cos(p.ang)*(p.r+5),fy=p.y+Math.sin(p.ang)*(p.r+5);
  for(const q of S.players){if(q===p||!q.alive||q.ph!=='ground')continue;if(hyp(q.x-fx,q.y-fy)<q.r+4){hurt(q,9,p,'fist');break}}ev({t:'shot',k:'fist',x:p.x,y:p.y,p})}
function hitDecoy(dc,dmg){dc.hp-=dmg;if(dc.hp<=0&&dc.alive){dc.alive=false;ev({t:'ring',x:dc.x,y:dc.y,r:12,c:CHARS.chrono.c})}}
function feedPush(txt,me){S.feed.unshift({txt,me,t:6});if(S.feed.length>4)S.feed.length=4;ev({t:'feed'})}
function hurt(t,dmg,src,wk,zoneDmg){if(!t.alive)return;
  const real=dmg*(zoneDmg?1:(1-VEST[t.vest])*(1-HELM[t.helm]));t.hp-=real;t.hitT=3;t.opening=null;
  if(!zoneDmg){t.flash=.1;ev({t:'hit',x:t.x,y:t.y,p:t})}
  if(t.ch==='chrono'&&!zoneDmg)t.buff.haste=1;
  if(t===S.me)ev({t:'hurt',zone:!!zoneDmg});
  if(src===S.me&&t!==S.me)ev({t:'num',x:t.x,y:t.y,v:Math.round(real)});
  if(src&&src.ch==='volt'&&src!==t&&!zoneDmg&&wk!=='fist'){if(src.voltTgt===t)src.voltN++;else{src.voltTgt=t;src.voltN=1}if(src.voltN>=3){t.slowT=1.5;src.voltN=0;ev({t:'ring',x:t.x,y:t.y,r:10,c:CHARS.volt.c})}}
  if(wk==='flame')t.slowT=Math.max(t.slowT,.5);
  if(t.bot&&src&&src!==t&&src.alive){t.provoked=4;if(!t.tgt||!t.tgtVis){t.tgt=src;t.react=.25;t.lostT=0}}
  if(t.hp<=0)kill(t,src,wk)}
function kill(t,src,wk){t.alive=false;t.hp=0;t.deathT=S.gtime;ev({t:'die',p:t});
  const drop=[];for(const w of t.w)if(w)drop.push(['w',w.k,0,w.mag]);
  for(const k in t.ammo)if(t.ammo[k]>0)drop.push(['a',k,t.ammo[k]]);for(const k in t.heal)if(t.heal[k]>0)drop.push(['h',k,t.heal[k]]);
  if(t.helm)drop.push(['ar','helm',t.helm]);if(t.vest)drop.push(['ar','vest',t.vest]);if(t.bag)drop.push(['bag','',t.bag]);if(t.mod)drop.push(['mod','',t.mod]);
  drop.forEach((d,i)=>{const a=i/drop.length*TAU,r=8+(i%2)*8;let x=t.x+Math.cos(a)*r,y=t.y+Math.sin(a)*r;if(solidAt(x,y)){x=t.x;y=t.y}addItem(d[0],d[1],d[2],x,y,d[3])});
  const by=wk==='zone'?'자기장':src?src.name:'자기장',how=wk==='zone'?'':wk==='fist'?'주먹':WD[wk]?WD[wk].n:'';
  if(src&&src!==t&&wk!=='zone')src.kills++;
  feedPush(by+(how?' ['+how+'] ':' → ')+t.name,src===S.me||t===S.me);
  S.aliveN=S.players.filter(p=>p.alive).length;
  if(t===S.me){S.endT=2.2}else if(src===S.me)toast(t.name+' 처치');
  if(S.aliveN===1&&S.me.alive){S.endT=2;S.won=true}}

/* ================= 봇 ================= */
function hasGun(b){for(const w of b.w)if(w&&(w.mag>0||(!WD[w.k].special&&b.ammo[WD[w.k].ak]>0)))return true;return false}
function botSlot(b,td){let best=2,br=0;for(let i=0;i<2;i++){const w=b.w[i];if(!w||(w.mag<=0&&(WD[w.k].special||b.ammo[WD[w.k].ak]<=0)))continue;
  let r=RANK[w.k];if(td<70&&FAM[w.k]==='near')r+=3;if(td>200&&FAM[w.k]!=='near')r+=1;if(r>br){br=r;best=i}}return best}
function wantItem(b,it){if(it.block===b.id)return 0;
  if(it.k==='w'){if(!b.w[0]||!b.w[1])return 3;return RANK[it.s]>Math.min(RANK[b.w[0].k],RANK[b.w[1].k])?2:0}
  if(it.k==='a')return usesAmmo(b,it.s)&&fitN(b,AMMO[it.s].w)>5?2:0;
  if(it.k==='h')return b.heal[it.s]<HEAL[it.s].auto*2&&fitN(b,HEAL[it.s].w)>0?1:0;
  return it.n>b[it.k==='ar'?it.s:it.k]?2:0}
function zoneGoal(b){const z=S.zone,dn=hyp(b.x-z.cx,b.y-z.cy);if(dn>z.r-14)return{x:z.tx,y:z.ty,out:true};
  if(z.state!=='done'){const dt=hyp(b.x-z.tx,b.y-z.ty);if(dt>z.tr-12&&(z.state==='shrink'||z.t<22))return{x:z.tx,y:z.ty,out:false}}return null}
function nav(b,gx,gy){const tx=b.x+gx,ty=b.y+gy,bi=bldAt(b.x,b.y),gi=bldAt(tx,ty);
  const via=(bl,out)=>{let best=null,bd=1e9;for(const d of bl.doors){const s=hyp(d.ix-b.x,d.iy-b.y)+hyp(d.ox-tx,d.oy-ty);if(s<bd){bd=s;best=d}}if(!best)return null;
    const px=out?best.ix:best.ox,py=out?best.iy:best.oy,qx=out?best.ox:best.ix,qy=out?best.oy:best.iy;return hyp(px-b.x,py-b.y)<6?[qx-b.x,qy-b.y]:[px-b.x,py-b.y]};
  let r=null;if(bi&&bi!==gi)r=via(bi,true);else if(gi&&bi!==gi)r=via(gi,false);return r||[gx,gy]}
function botThink(b,dt){
  b.thinkT-=dt;if(b.thinkT>0)return;const T=.2+Math.random()*.12;b.thinkT=T;
  if(b.provoked>0)b.provoked-=T;
  const w0=curW(b),view=b.provoked>0?VIEW*.72:(b.aggr+(w0&&WD[w0.k].scope?50:0))*clamp((S.gtime-25)/100,0,1);
  const cands=[];for(const p of[...S.players,...S.decoys]){if(p===b||!p.alive||p.owner===b||(p.ph&&p.ph!=='ground'))continue;const d=hyp(p.x-b.x,p.y-b.y);if(d<view*(p.decoy?1:stealthed(p)?.5:1))cands.push([d,p])}
  cands.sort((a,c)=>a[0]-c[0]);let tgt=null,td=1e9;
  for(let i=0;i<cands.length&&i<4;i++){const[d,p]=cands[i];if(d>60&&!p.decoy&&inBush(p))continue;if(losClear(b.x,b.y,p.x,p.y)){tgt=p;td=d;break}}
  if(tgt){if(b.tgt!==tgt){b.tgt=tgt;b.react=.45+Math.random()*.6*(1.4-b.skill)}b.tgtVis=true;b.lostT=0;b.lsx=tgt.x;b.lsy=tgt.y}
  else if(b.tgt){b.tgtVis=false;b.lostT+=T;if(b.lostT>2.5||!b.tgt.alive)b.tgt=null}
  if(b.tgt&&!tgt)td=hyp(b.tgt.x-b.x,b.tgt.y-b.y);
  b.err=(Math.random()+Math.random()+Math.random()-1.5)*(.2-.13*b.skill);
  const want=botSlot(b,td);if(want!==b.cur)b.in.sw=want;
  const w=curW(b),armed=hasGun(b),brawl=!armed&&b.provoked>0&&td<70;
  if(w&&!WD[w.k].special&&!b.tgtVis&&w.mag<WD[w.k].mag*.6&&b.ammo[WD[w.k].ak]>0&&b.rl<=0)b.in.reload=true;
  if(!b.tgtVis&&b.healT<=0){if(b.hp<45&&b.heal.medkit)b.in.use='medkit';else if(b.hp<70&&b.heal.bandage)b.in.use='bandage';else if(b.boost<40&&b.hp<95&&b.heal.drink)b.in.use='drink'}
  if(b.skillCD<=0&&w&&b.tgt&&b.tgtVis&&b.react<=.2){const f=FAM[w.k];let go=false;
    if(b.ch==='shadow')go=td<WD[w.k].rng*.8;else if(b.ch==='chrono')go=b.hp<40;else if(b.ch==='psy')go=b.hitT>2||td<120;
    else if(b.ch==='volt'){if(f==='near'&&td<70){go=true;b.blinkDir=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x)}else if(f==='mid'){go=true;b.blinkDir=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x)+b.sdir*Math.PI/2}else if(b.hp<45){go=true;b.blinkDir=Math.atan2(b.y-b.tgt.y,b.x-b.tgt.x)}}
    if(go)b.in.skill=true}
  const zg=zoneGoal(b);let gx=0,gy=0;const moved=hyp(b.x-b.lx,b.y-b.ly);b.lx=b.x;b.ly=b.y;
  if(b.opening){gx=gy=0}
  else if(b.unstick>0){b.unstick-=T;gx=Math.cos(b.uang);gy=Math.sin(b.uang)}
  else if(zg&&(zg.out||!b.tgtVis)){gx=zg.x-b.x;gy=zg.y-b.y}
  else if(b.tgt&&b.tgtVis&&armed){const dx=(b.tgt.x-b.x)/td,dy=(b.tgt.y-b.y)/td;if(Math.random()<.12)b.sdir*=-1;const pref=w?PREF[w.k]:60,ap=clamp((td-pref)/60,-1,1);gx=-dy*b.sdir*.8+dx*ap;gy=dx*b.sdir*.8+dy*ap}
  else if(b.tgt&&b.tgtVis&&brawl){if(b.hp>35){gx=b.tgt.x-b.x;gy=b.tgt.y-b.y}else{gx=b.x-b.tgt.x;gy=b.y-b.tgt.y}}
  else if(b.tgt&&b.lostT<2.5&&armed){gx=b.lsx-b.x;gy=b.lsy-b.y}
  else{let dropG=null;if(armed)for(const d of S.drops){if(d.landed&&!d.opened&&hyp(d.x-b.x,d.y-b.y)<350){dropG=d;break}}
    if(dropG){if(hyp(dropG.x-b.x,dropG.y-b.y)<18){b.in.open=true;gx=gy=0}else{gx=dropG.x-b.x;gy=dropG.y-b.y}}
    else{if(!b.goal||!b.goal.alive||wantItem(b,b.goal)===0||Math.random()<.05){b.goal=null;let bs=1e9;
        for(const it of S.items){const d=hyp(it.x-b.x,it.y-b.y);if(d>240)continue;const v=wantItem(b,it);if(!v)continue;const s=d/v;if(s<bs){bs=s;b.goal=it}}}
      if(b.goal){gx=b.goal.x-b.x;gy=b.goal.y-b.y}
      else{const z=S.zone;b.wpT-=T;if(!b.wp||b.wpT<=0||hyp(b.wp.x-b.x,b.wp.y-b.y)<12){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*Math.min(z.tr,z.r)*.7;
          b.wp={x:clamp(z.tx+Math.cos(a)*r,60,W-60),y:clamp(z.ty+Math.sin(a)*r,60,W-60)};b.wpT=8+Math.random()*8}
        gx=b.wp.x-b.x;gy=b.wp.y-b.y}}}
  if(b.healT>0&&!zg){gx=gy=0}
  if((gx||gy)&&b.unstick<=0)[gx,gy]=nav(b,gx,gy);
  const gm=hyp(gx,gy);if(gm>1e-3){gx/=gm;gy/=gm}
  if(gm>2&&b.unstick<=0&&moved<T*62*.2){b.stuckT+=T;if(b.stuckT>.5){b.unstick=.5+Math.random()*.4;b.uang=Math.atan2(gy,gx)+(Math.random()<.5?1:-1)*(1+Math.random());b.stuckT=0;b.goal=null}}else b.stuckT=0;
  if(gm<=2&&b.goal){gx=gy=0}
  b.mvx=gx;b.mvy=gy}
function botInput(b,dt){botThink(b,dt);
  const inp={mx:b.mvx,my:b.mvy,aim:b.ang,fire:false,reload:b.in.reload,use:b.in.use,sw:b.in.sw,skill:b.in.skill,open:b.in.open};b.in={};
  if(b.opening){inp.mx=inp.my=0;inp.open=false}
  if(b.tgt&&b.tgt.alive){const d=hyp(b.tgt.x-b.x,b.tgt.y-b.y),a=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x)+b.err,da=angDiff(a,b.ang);b.ang+=clamp(da,-7*dt,7*dt);inp.aim=b.ang;b.react-=dt;
    if(b.tgtVis&&b.react<=0){const w=curW(b);if(w){if(d<Math.min(WD[w.k].rng*.85,VIEW)&&Math.abs(da)<.3)inp.fire=true}else if(d<15&&b.provoked>0)inp.fire=true}}
  else if(hyp(b.mvx,b.mvy)>.1){const a=Math.atan2(b.mvy,b.mvx);b.ang+=clamp(angDiff(a,b.ang),-5*dt,5*dt);inp.aim=b.ang}
  return inp}

/* ================= 한 틱 ================= */
export function step(dt,human){
  S.gtime+=dt;const me=S.me;
  if(!S.plane.done)updPlane(dt);
  if(human&&human.jump&&me.ph==='plane')jump(me);
  updZone(dt);updDrops(dt);
  for(const p of S.players){if(!p.alive)continue;
    if(p.ph==='plane')continue;
    if(p.ph==='fall'||p.ph==='chute'){updAir(p,p===me?human:{mx:0,my:0},dt);continue}
    if(p===me){if(human.ctx){const d=nearDrop(me);if(d)human.open=true;else if(me.nearI)pickItem(me,me.nearI,true)}applyInput(p,human,dt);me.nearI=autoPickup(p)}
    else{applyInput(p,botInput(p,dt),dt);autoPickup(p)}}
  const P=S.players;
  for(let i=0;i<P.length;i++){const a=P[i];if(!a.alive||a.ph!=='ground')continue;for(let j=i+1;j<P.length;j++){const b=P[j];if(!b.alive||b.ph!=='ground')continue;
    const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy);if(d<12&&d>1e-3){const o=(12-d)/2;a.x-=dx/d*o;a.y-=dy/d*o;b.x+=dx/d*o;b.y+=dy/d*o}}}
  for(let i=S.decoys.length-1;i>=0;i--){const d=S.decoys[i];d.t-=dt;if(d.t<=0&&d.alive){d.alive=false;ev({t:'ring',x:d.x,y:d.y,r:10,c:CHARS.chrono.c})}if(!d.alive)S.decoys.splice(i,1)}
  for(let i=S.barriers.length-1;i>=0;i--){const b=S.barriers[i];b.t-=dt;if(b.t<=0){S.barriers.splice(i,1);continue}
    if(b.v){b.x+=b.nx*b.v*dt;b.y+=b.ny*b.v*dt;const tx=-b.ny,ty=b.nx;
      for(const q of S.players){if(q===b.owner||!q.alive||q.ph!=='ground')continue;const rx=q.x-b.x,ry=q.y-b.y,al=rx*tx+ry*ty,dn=rx*b.nx+ry*b.ny;
        if(Math.abs(al)<b.len/2+q.r&&dn>-3&&dn<q.r+2){q.x=b.x+tx*al+b.nx*(q.r+2.5);q.y=b.y+ty*al+b.ny*(q.r+2.5);q.slowT=Math.max(q.slowT,.4);collide(q)}}
      if(solidAt(b.x,b.y))b.v=0}}
  updBullets(dt);
  for(const f of S.feed)f.t-=dt;if(S.feed.length&&S.feed[S.feed.length-1].t<=0){S.feed.pop();ev({t:'feed'})}
  if(S.endT>0){S.endT-=dt;if(S.endT<=0){S.over=true;ev({t:'end',win:S.won})}}}
function updBullets(dt){const B=S.bullets;
  for(let i=B.length-1;i>=0;i--){const b=B[i];b.px=b.x;b.py=b.y;const dist=hyp(b.vx,b.vy)*dt,n=Math.ceil(dist/3);let dead=false;
    for(let s=0;s<n&&!dead;s++){const ox=b.x,oy=b.y;b.x+=b.vx*dt/n;b.y+=b.vy*dt/n;b.left-=dist/n;
      if(b.left<=0||b.x<0||b.y<0||b.x>W||b.y>W){dead=true;break}
      for(const br of S.barriers){const s0=(ox-br.x)*br.nx+(oy-br.y)*br.ny,s1=(b.x-br.x)*br.nx+(b.y-br.y)*br.ny;if(s0*s1>0)continue;
        const f=s0/(s0-s1||1e-6),ix=ox+(b.x-ox)*f,iy=oy+(b.y-oy)*f,al=(ix-br.x)*-br.ny+(iy-br.y)*br.nx;if(Math.abs(al)>br.len/2)continue;
        if(b.own===br.owner&&br.fam==='far')continue;
        if(br.fam==='mid'&&b.own!==br.owner&&!b.refl){const dot=b.vx*br.nx+b.vy*br.ny;b.vx-=2*dot*br.nx;b.vy-=2*dot*br.ny;b.own=br.owner;b.dmg*=.45;b.refl=true;b.left=Math.max(b.left,140);const sg=Math.sign(-s0||1);b.x=ix+br.nx*sg*1.5;b.y=iy+br.ny*sg*1.5;ev({t:'spark',x:ix,y:iy,c:CHARS.psy.c});break}
        dead=true;ev({t:'spark',x:ix,y:iy,c:CHARS.psy.c});break}
      if(dead)break;
      const o=solidAt(b.x,b.y);if(o&&!(b.pierce&&o.trunk)&&!(o.low&&!b.flame&&Math.random()<.0)){dead=true;if(!b.flame)ev({t:'spark',x:ox,y:oy,c:o.trunk?'#8a5a2a':o.wall?'#e8d9b8':o.drop?'#9ab':o.prop?'#c9d0da':'#dfe3ea'});break}
      for(const p of S.players){if(!p.alive||p===b.own||p.ph!=='ground')continue;if(b.hitSet&&b.hitSet.has(p))continue;const dx=p.x-b.x,dy=p.y-b.y;if(dx*dx+dy*dy<(p.r+2)*(p.r+2)){
        const dmg=b.k==='shotgun'?b.dmg*(.45+.55*b.left/b.max):b.dmg;hurt(p,dmg,b.own,b.k);if(b.hitSet){b.hitSet.add(p)}else{dead=true}break}}
      if(dead)break;
      for(const d of S.decoys){if(!d.alive||d.owner===b.own)continue;if(hyp(d.x-b.x,d.y-b.y)<d.r+2){hitDecoy(d,b.dmg);if(!b.pierce)dead=true;break}}}
    if(dead)B.splice(i,1)}}
