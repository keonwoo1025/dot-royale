// 도트 로얄 v5 — 게임 규칙 (단위: 미터). 평면 x,y + 높이 z. 렌더링/DOM 없음.
export const TAU=Math.PI*2,hyp=Math.hypot,clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const angDiff=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function hash2(x,y){let h=(Math.imul(x,374761393)+Math.imul(y,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function makeNoise(seed){const r=mulberry32(seed),N=128,g=new Float32Array(N*N);for(let i=0;i<N*N;i++)g[i]=r();
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,x0=xi&127,x1=(xi+1)&127,y0=(yi&127)*N,y1=((yi+1)&127)*N;
    const a=g[y0+x0],b=g[y0+x1],c=g[y1+x0],d=g[y1+x1],u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}}

/* ================= 데이터 ================= */
export const W=1000,TS=2,TN=W/TS;
export const G=0,DG=1,SA=2,WA=3,RO=4,FL=5,FA=6,RK=7,BR=8;
export const PH_H=1.75,PH_C=1.2,PR=.4,WALL_H=3.2,ALT=150;
export const WD={
  pistol:{n:'권총',ak:'9',dmg:22,rate:.2,spr:.022,sp:360,rng:90,mag:15,rl:1.4,rec:.012,rar:0,one:1},
  smg:{n:'기관단총',ak:'9',dmg:15,rate:.075,spr:.04,sp:400,rng:110,mag:30,rl:2.0,rec:.008,rar:0},
  shotgun:{n:'산탄총',ak:'12',dmg:12,pel:8,rate:.9,spr:.075,sp:320,rng:40,mag:5,rl:2.5,rec:.05,rar:1},
  ar:{n:'돌격소총',ak:'556',dmg:21,rate:.1,spr:.022,sp:650,rng:320,mag:30,rl:2.2,rec:.011,rar:1},
  dmr:{n:'지정사수소총',ak:'762',dmg:42,rate:.32,spr:.01,sp:780,rng:420,mag:10,rl:2.4,rec:.03,rar:2,scope:3},
  sniper:{n:'저격소총',ak:'762',dmg:85,rate:1.5,spr:.002,sp:900,rng:650,mag:5,rl:3,rec:.06,rar:2,scope:6},
  flame:{n:'화염방사기',ak:null,dmg:6,rate:.05,spr:.12,sp:35,rng:14,mag:120,rl:0,rec:0,rar:3,special:1},
  minigun:{n:'미니건',ak:null,dmg:14,rate:.1,spr:.045,sp:600,rng:260,mag:150,rl:0,rec:.005,rar:3,special:1},
  rail:{n:'레일건',ak:null,dmg:100,rate:1.3,spr:0,sp:1500,rng:700,mag:4,rl:0,rec:.05,rar:3,special:1,scope:4},
};
export const FAM={shotgun:'near',smg:'near',pistol:'mid',ar:'mid',dmr:'far',sniper:'far',flame:'near',minigun:'mid',rail:'far'};
export const FAMN={near:'근거리',mid:'중거리',far:'원거리'};
export const RANK={pistol:1,smg:2,shotgun:2,ar:3,dmr:4,sniper:5,flame:6,minigun:6,rail:6};
export const RARC=['#ffffff','#5aa0ff','#c77dff','#ffc83d'];
export const CATC={w:'#ff9a3c',a:'#ffd84d',h:'#5de07a',ar:'#5ab0ff',bag:'#5ab0ff',mod:'#c77dff'};
export const AMMO={'9':{n:'9mm',w:.4,drop:30,c:'#f2c230'},'556':{n:'5.56mm',w:.5,drop:30,c:'#6fd04a'},'762':{n:'7.62mm',w:.7,drop:15,c:'#ff7a3a'},'12':{n:'12게이지',w:1.25,drop:10,c:'#ff4a4a'}};
export const HEAL={bandage:{n:'붕대',t:3,w:2,auto:10,drop:3},medkit:{n:'구급상자',t:6,w:20,auto:2,drop:1},drink:{n:'에너지 음료',t:3,w:4,auto:3,drop:1}};
export const BAGCAP=[100,150,200,250],MODCD=[40,34,28,22];
export const VEST=[0,.25,.35,.5],HELM=[0,.25,.4,.55],LVC=['','#a7bf6a','#5c8fd6','#3a3350'];
const PREF={pistol:20,smg:16,shotgun:7,ar:45,dmr:80,sniper:110,flame:6,minigun:35,rail:120};
const PH=[{r:470,w:50,s:40,d:.6},{r:290,w:40,s:35,d:1.5},{r:170,w:35,s:30,d:3},{r:95,w:30,s:25,d:5},{r:50,w:25,s:20,d:8},{r:22,w:20,s:15,d:12},{r:0,w:12,s:15,d:20}];
export const CHARS={
  shadow:{n:'그림자',tag:'보이지 않는 암살자',c:'#9a6be6',c2:'#4b2a86',hue:275,
    pas:{n:'은신',d:'수풀 안이나 가만히 서 있으면 적이 알아채는 거리가 절반으로 줄어듭니다. 쏘면 2초간 풀립니다.'},
    act:{n:'그림자 걸음',d:'3초간 완전히 투명해집니다. 가까이 오면 희미하게 보입니다. 풀린 뒤 첫 발은 1.5배 피해.',near:{n:'질주 은신',d:'투명한 동안 이동속도 30% 증가'},mid:{n:'긴 은신',d:'투명 시간이 4초로 늘어남'},far:{n:'사냥꾼의 눈',d:'투명화 대신 5초간 벽 너머 적의 윤곽이 보임'}}},
  chrono:{n:'크로노',tag:'시간을 되돌리는 생존가',c:'#4ec3f0',c2:'#1f6f9c',hue:200,
    pas:{n:'잔상',d:'피격되면 1초간 이동속도가 30% 빨라집니다.'},
    act:{n:'되감기',d:'3초 전 위치로 돌아가고, 그동안 잃은 체력을 모두 되찾습니다.',near:{n:'재장전',d:'되돌아가며 탄창이 즉시 가득 참'},mid:{n:'시간 정지',d:'도착 지점에 2.5초간 적 총알이 멈춰 버리는 구역 생성'},far:{n:'안정',d:'되돌아간 뒤 2초간 반동과 탄퍼짐 없음'}}},
  psy:{n:'사이킥',tag:'염력으로 전장을 휘두르는 자',c:'#f06aa8',c2:'#8c2a5c',hue:325,
    pas:{n:'끌어당김',d:'아이템 줍는 거리가 2배입니다.'},
    act:{n:'염력 방벽',d:'앞에 4초간 총알을 막는 방벽을 세웁니다.',near:{n:'끌어당기기',d:'방벽 대신 앞의 적 1명을 눈앞으로 끌어와 1초 기절'},mid:{n:'반사',d:'막은 총알을 되돌려 보냄'},far:{n:'한쪽 통과',d:'내 총알만 통과, 6초 지속'}}},
  volt:{n:'볼트',tag:'번개처럼 치고 빠지는 기동가',c:'#f5c83c',c2:'#b0661a',hue:45,
    pas:{n:'정전기',d:'같은 적을 연속 3번 맞히면 1.5초간 느려집니다.'},
    act:{n:'번개 도약',d:'이동 방향으로 8m 순간이동합니다. 벽은 넘지 못합니다.',near:{n:'연쇄 번개',d:'도착 시 주변 적 3명에게 번개 피해 + 짧은 기절'},mid:{n:'전기장',d:'도착 지점에 4초간 둔화·지속 피해 전기장'},far:{n:'장거리',d:'도약 거리 2배, 0.5초간 사격 불가'}}},
};
export const CHK=Object.keys(CHARS);
export const BOTN=['도트장인','탄약부족','풀숲요정','치킨러버','파밍왕','존버중','샷건킹','저격수김씨','뚜벅이','헤드헌터','숨바꼭질','라면한그릇','붕대장수','막타도둑','달려달려','철모맨','구급대원','수풀속','낙하산','총알받이','무한파밍','마지막생존','슬쩍','새벽세시'];
const TOWN_NAMES=['군부대','장터마을','폐공장','항구','학교','발전소','농장','병원','채석장','교회','역전','시장'];
export const ROOFC=['#e0634e','#4e8fe0','#e0a94e','#5fbf7a','#b36ad6','#e07fa8'];
export const BOTS=24,VIEW=150;
export const PROPS={
  building_A:{w:10,d:12,h:10,m:'building_A_withoutBase'},building_B:{w:13,d:11,h:10,m:'building_B_withoutBase'},
  building_C:{w:10,d:11,h:14,m:'building_C_withoutBase'},building_D:{w:13,d:11,h:14,m:'building_D_withoutBase'},
  building_E:{w:16,d:12,h:14,m:'building_E_withoutBase'},building_F:{w:16,d:11,h:14,m:'building_F_withoutBase'},
  building_G:{w:16,d:12,h:14,m:'building_G_withoutBase'},building_H:{w:16,d:11,h:19,m:'building_H_withoutBase'},
  car_hatchback:{w:1.9,d:3.9,h:1.5,m:'car_hatchback'},car_police:{w:2,d:4.6,h:1.7,m:'car_police'},car_sedan:{w:1.9,d:4.5,h:1.5,m:'car_sedan'},
  car_stationwagon:{w:1.9,d:4.6,h:1.6,m:'car_stationwagon'},car_taxi:{w:1.9,d:4.5,h:1.8,m:'car_taxi'},
  dumpster:{w:2.2,d:1.3,h:1.3,m:'dumpster'},box_A:{w:.9,d:.9,h:.8,m:'box_A'},watertower:{w:4,d:4,h:7,m:'watertower'},
  bench:{w:1.7,d:.6,h:.8,m:'bench',nocol:1},streetlight:{w:.3,d:.3,h:4.5,m:'streetlight',nocol:1},firehydrant:{w:.4,d:.4,h:.8,m:'firehydrant',nocol:1},
  bush:{w:1,d:1,h:1.4,m:'bush',nocol:1},trash_A:{w:.6,d:.6,h:.2,m:'trash_A',nocol:1},box_B:{w:.6,d:.6,h:.6,m:'box_B',nocol:1},
  container:{w:2.4,d:6.1,h:2.6,proc:1},crate:{w:1.1,d:1.1,h:1.1,proc:1},hay:{w:1.5,d:1.5,h:1.2,proc:1},sandbag:{w:3,d:.7,h:.9,proc:1},barrel:{w:.8,d:.8,h:1.1,proc:1},fence:{w:4,d:.2,h:1,proc:1,thin:1},tent:{w:3.2,d:2.4,h:1.8,proc:1},
};

/* ================= 상태 ================= */
export const S={type:null,hgt:null,towns:[],buildings:[],obs:[],trees:[],bushes:[],pois:[],fields:[],rivers:[],roads:[],props:[],towers:[],doors:[],items:[],players:[],me:null,bullets:[],decoys:[],barriers:[],fields2:[],stops:[],drops:[],feed:[],events:[],
  zone:null,plane:null,gtime:0,aliveN:0,endT:-1,over:false,won:false,autoPick:true,seed:0};
let itemId=0;
const ev=(e)=>S.events.push(e);
export const toast=s=>ev({t:'toast',s});

/* ================= 지형 높이 ================= */
export const HR=4,HN_=W/HR+1;
export function groundH(x,y){const H=S.hgt;if(!H)return 0;const fx=clamp(x/HR,0,HN_-1.001),fy=clamp(y/HR,0,HN_-1.001),ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy,i=iy*HN_+ix;
  return (H[i]*(1-tx)+H[i+1]*tx)*(1-ty)+(H[i+HN_]*(1-tx)+H[i+HN_+1]*tx)*ty}

/* ================= 공간 해시 ================= */
const HC=8,HN=Math.ceil(W/HC);let grid,qs=0;const QA=[],QB=[],QC=[];
export function tileAt(x,y){if(x<0||y<0||x>=W||y>=W)return WA;return S.type[((y/TS)|0)*TN+((x/TS)|0)]}
function addObs(o){S.obs.push(o);o.q=0;if(o.z0==null)o.z0=groundH(o.k==='r'?o.x+o.w/2:o.x,o.k==='r'?o.y+o.h/2:o.y);
  const b=o.k==='r'?[o.x,o.y,o.x+o.w,o.y+o.h]:[o.x-o.r,o.y-o.r,o.x+o.r,o.y+o.r];
  const x0=clamp(Math.floor(b[0]/HC),0,HN-1),x1=clamp(Math.floor(b[2]/HC),0,HN-1),y0=clamp(Math.floor(b[1]/HC),0,HN-1),y1=clamp(Math.floor(b[3]/HC),0,HN-1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)grid[y*HN+x].push(o);return o}
export function hQ(x0,y0,x1,y1,out){qs++;out.length=0;
  const a=clamp(Math.floor(x0/HC),0,HN-1),b=clamp(Math.floor(x1/HC),0,HN-1),c=clamp(Math.floor(y0/HC),0,HN-1),d=clamp(Math.floor(y1/HC),0,HN-1);
  for(let y=c;y<=d;y++)for(let x=a;x<=b;x++){const cell=grid[y*HN+x];for(let i=0;i<cell.length;i++){const o=cell[i];if(o.q!==qs){o.q=qs;if(!o.dead)out.push(o)}}}return out}
function inObs(o,x,y){if(o.k==='r')return x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h;const dx=x-o.x,dy=y-o.y;return dx*dx+dy*dy<=o.r*o.r}
export function solidAt(x,y){hQ(x,y,x,y,QA);for(let i=0;i<QA.length;i++){if(QA[i].platform)continue;if(inObs(QA[i],x,y))return QA[i]}return null}
// 3D 판정: 높이 z에서 막히는가 (창문은 통과)
export function solidAt3(x,y,z){hQ(x,y,x,y,QA);for(let i=0;i<QA.length;i++){const o=QA[i];if(!inObs(o,x,y))continue;
    if(z>o.z0+o.hh||z<o.z0-.5)continue;
    if(o.win){const a=o.w>o.h?x-o.x:y-o.y;const rz=z-o.z0;if(rz>1&&rz<2.1){let hole=false;for(const wn of o.win)if(a>wn[0]&&a<wn[1])hole=true;if(hole)continue}}
    if(o.trunk&&z-o.z0>3.2&&!o.leg)continue;return o}return null}
export function losClear(x0,y0,z0,x1,y1,z1){const d=hyp(x1-x0,y1-y0),n=Math.max(2,Math.ceil(d/1.5));
  for(let i=1;i<n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,z=z0+(z1-z0)*t;if(z<groundH(x,y)-.1)return false;const o=solidAt3(x,y,z);if(o&&!o.trunk)return false}return true}
function anySolidNear(x,y,m){hQ(x-m,y-m,x+m,y+m,QB);for(const o of QB){if(o.platform)continue;if(o.k==='c'){if(hyp(o.x-x,o.y-y)<o.r+m)return true}else{const cx=clamp(x,o.x,o.x+o.w),cy=clamp(y,o.y,o.y+o.h);if(hyp(cx-x,cy-y)<m)return true}}return false}
function nearBuilding(x,y,m){for(const b of S.buildings)if(x>b.x-m&&x<b.x+b.w+m&&y>b.y-m&&y<b.y+b.h+m)return true;return false}
export function bldAt(x,y){for(const b of S.buildings)if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return b;return null}
export function inBush(p){if(p.lv>=0)return false;for(const b of S.bushes){const dx=b.x-p.x,dy=b.y-p.y;if(dx*dx+dy*dy<b.r*b.r)return true}return false}

/* ================= 월드 생성 ================= */
function pickW(R,arr){let s=0;for(const a of arr)s+=Math.max(0,a[1]);let v=R()*s;for(const a of arr){v-=Math.max(0,a[1]);if(v<=0)return a[0]}return arr[0][0]}
function addItem(k,s,n,x,y,mag,block,z){const it={id:++itemId,k,s,n,x,y,z:z!=null?z:groundH(x,y),mag:mag||0,alive:true,block:block==null?-1:block};S.items.push(it);return it}
function spawnLoot(x,y,q,R,force){
  const cat=force||pickW(R,[['w',28+q*12],['a',24],['h',22],['ar',14+q*6],['bag',7+q*4],['mod',7+q*5]]);
  const lv=()=>R()<.66-q*.3?1:2;
  if(cat==='w'){const k=pickW(R,[['pistol',30-q*22],['smg',22],['shotgun',19],['ar',17+q*14],['dmr',7+q*9],['sniper',2+q*4]]);addItem('w',k,0,x,y,0);const ak=WD[k].ak;
    const ok=!solidAt(x+.9,y+.4);addItem('a',ak,AMMO[ak].drop,ok?x+.9:x,ok?y+.4:y+.7)}
  else if(cat==='a'){const ak=pickW(R,[['9',35],['556',30],['12',15],['762',20]]);addItem('a',ak,AMMO[ak].drop,x,y)}
  else if(cat==='h'){const hk=pickW(R,[['bandage',55],['drink',25],['medkit',20]]);addItem('h',hk,HEAL[hk].drop,x,y)}
  else if(cat==='ar')addItem('ar',R()<.5?'helm':'vest',lv(),x,y);
  else addItem(cat,'',lv(),x,y)}
function freeSpot(x,y,m){const t=tileAt(x,y);return t!==WA&&!solidAt(x,y)&&!anySolidNear(x,y,m||.5)}
function lootNear(R,cx,cy,rad,n,q){let made=0;for(let i=0;i<n*8&&made<n;i++){const a=R()*TAU,r=R()*rad,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(x<20||y<20||x>W-20||y>W-20)continue;if(!freeSpot(x,y,.6)||bldAt(x,y))continue;spawnLoot(x,y,q,R);made++}return made}
function placeProp(R,key,x,y,rot,inside){const P=PROPS[key];const sw=rot%2?P.d:P.w,sd=rot%2?P.w:P.d;
  const rx=x-sw/2,ry=y-sd/2;if(rx<12||ry<12||rx+sw>W-12||ry+sd>W-12)return false;
  const st=Math.max(.5,Math.min(sw,sd)/3);for(let yy=ry;yy<=ry+sd;yy+=st)for(let xx=rx;xx<=rx+sw;xx+=st){const t=tileAt(xx,yy);if(t===WA||t===BR||(t===FL&&!inside))return false}
  if(!inside&&nearBuilding(x,y,Math.max(sw,sd)/2+1))return false;
  if(!P.nocol&&anySolidNear(x,y,Math.max(sw,sd)/2+(inside?.2:.8)))return false;
  for(const p of S.props)if(p.big&&Math.abs(p.x-x)<(p.sw+sw)/2+2&&Math.abs(p.y-y)<(p.sd+sd)/2+2)return false;
  for(const t of S.towers)if(Math.abs(t.x+3-x)<7+sw/2&&Math.abs(t.y-y)<4+sd/2)return false;
  const pr={key,x,y,rot,sw,sd,big:key.startsWith('building'),v:R()*1000|0,z:groundH(x,y)};S.props.push(pr);
  if(!P.nocol)addObs({k:'r',x:rx,y:ry,w:sw,h:sd,hh:P.h,prop:pr,thin:!!P.thin});return true}
const WALLC=['#f2e6cc','#dfeaf2','#e3f0d8','#f6dcd6','#efe0f5','#f5ecc4'];
export function genWorld(sd){
  S.seed=sd;const R=mulberry32(sd);itemId=0;S.type=new Uint8Array(TN*TN);const type=S.type;
  const n1=makeNoise(sd+1),n2=makeNoise(sd+2),n3=makeNoise(sd+3),n4=makeNoise(sd+4),n5=makeNoise(sd+5);
  const lakes=[];const nl=2+(R()*3|0);
  for(let i=0;i<nl;i++)lakes.push({x:120+R()*(W-240),y:120+R()*(W-240),r:28+R()*40});
  for(let ty=0;ty<TN;ty++)for(let tx=0;tx<TN;tx++){
    const x=tx*TS+1,y=ty*TS+1,f=n1(x/45,y/45)*.72+n2(x/12,y/12)*.28,rk=n4(x/60,y/60)*.8+n2(x/9+50,y/9)*.2;let t=G;
    if(f>.6)t=DG;if(rk>.7)t=RK;
    for(const l of lakes){const d=hyp(x-l.x,y-l.y)/l.r+(n3(x/14,y/14)-.5)*.55;if(d<1){t=WA;break}if(d<1.18)t=SA}
    const e=Math.min(x,y,W-x,W-y)+(n3(x/20+9,y/20)-.5)*16;if(e<14)t=WA;else if(e<24)t=SA;
    type[ty*TN+tx]=t}
  const carve=(x,y,r,t,only)=>{for(let ty=Math.floor((y-r)/TS);ty<=Math.floor((y+r)/TS);ty++)for(let tx=Math.floor((x-r)/TS);tx<=Math.floor((x+r)/TS);tx++){
    if(tx<0||ty<0||tx>=TN||ty>=TN)continue;if(hyp(tx*TS+1-x,ty*TS+1-y)>r)continue;const i=ty*TN+tx;if(only&&!only.includes(type[i]))continue;type[i]=t}};
  S.rivers=[];const nr=1+(R()<.55?1:0);
  for(let k=0;k<nr;k++){const hor=k===0?R()<.5:!S.rivers[0].hor;const a=hor?{x:0,y:180+R()*(W-360)}:{x:180+R()*(W-360),y:0},b=hor?{x:W,y:180+R()*(W-360)}:{x:180+R()*(W-360),y:W};
    const m1={x:a.x+(b.x-a.x)*.33+(R()-.5)*220,y:a.y+(b.y-a.y)*.33+(R()-.5)*220},m2={x:a.x+(b.x-a.x)*.66+(R()-.5)*220,y:a.y+(b.y-a.y)*.66+(R()-.5)*220};
    S.rivers.push({hor,a,b,m1,m2});
    for(let i=0;i<=1400;i++){const t=i/1400,u=1-t,x=u*u*u*a.x+3*u*u*t*m1.x+3*u*t*t*m2.x+t*t*t*b.x,y=u*u*u*a.y+3*u*u*t*m1.y+3*u*t*t*m2.y+t*t*t*b.y,w=6+n3(x/25,y/25)*4;
      carve(x,y,w+3,SA,[G,DG,RK]);carve(x,y,w,WA)}}
  S.towns=[];
  for(let tr=0;tr<1200&&S.towns.length<12;tr++){const x=90+R()*(W-180),y=90+R()*(W-180);
    if(S.towns.some(t=>hyp(t.x-x,t.y-y)<200))continue;
    let wet=tileAt(x,y)===WA;for(let a=0;a<16&&!wet;a++)for(const rr of[30,62])if(tileAt(x+Math.cos(a/16*TAU)*rr,y+Math.sin(a/16*TAU)*rr)===WA)wet=true;
    if(wet)continue;S.towns.push({x,y,name:TOWN_NAMES[S.towns.length],q:S.towns.length===0?1:R()*.6})}
  for(const tw of S.towns)carve(tw.x,tw.y,75,G,[DG,RK]);
  S.fields=[];for(const tw of S.towns){if(tw.q>.9)continue;const nf=1+(R()*2|0);for(let i=0;i<nf;i++){const a=R()*TAU,d=85+R()*25,w=34+R()*24,h=24+R()*16,x=tw.x+Math.cos(a)*d-w/2,y=tw.y+Math.sin(a)*d-h/2;
    let ok=x>24&&y>24&&x+w<W-24&&y+h<W-24;if(ok)for(let yy=y;yy<y+h&&ok;yy+=3)for(let xx=x;xx<x+w;xx+=3){const t=tileAt(xx,yy);if(t===WA||t===SA)ok=false}
    if(!ok)continue;S.fields.push({x,y,w,h,hz:R()<.5,c:R()<.5?0:1});for(let ty=Math.floor(y/TS);ty<(y+h)/TS;ty++)for(let tx=Math.floor(x/TS);tx<(x+w)/TS;tx++)type[ty*TN+tx]=FA}}
  S.roads=[];
  const road=(a,b)=>{const mx=(a.x+b.x)/2+(R()-.5)*80,my=(a.y+b.y)/2+(R()-.5)*80,L=hyp(a.x-b.x,a.y-b.y),n=Math.ceil(L/1.2);S.roads.push({a,b,mx,my});
    for(let i=0;i<=n;i++){const t=i/n,u=1-t,x=u*u*a.x+2*u*t*mx+t*t*b.x,y=u*u*a.y+2*u*t*my+t*t*b.y;
      for(let ty=Math.floor((y-3.5)/TS);ty<=Math.floor((y+3.5)/TS);ty++)for(let tx=Math.floor((x-3.5)/TS);tx<=Math.floor((x+3.5)/TS);tx++){
        if(tx<0||ty<0||tx>=TN||ty>=TN)continue;if(hyp(tx*TS+1-x,ty*TS+1-y)<=3.5){const i=ty*TN+tx;type[i]=type[i]===WA||type[i]===BR?BR:RO}}}};
  const T=S.towns;for(let i=1;i<T.length;i++){let best=0,bd=1e9;for(let j=0;j<i;j++){const d=hyp(T[i].x-T[j].x,T[i].y-T[j].y);if(d<bd){bd=d;best=j}}road(T[i],T[best])}
  if(T.length>3)road(T[T.length-1],T[1]);if(T.length>6)road(T[T.length-2],T[3]);
  // 높이맵: 언덕 + 마을은 평탄, 물은 낮게
  const H=new Float32Array(HN_*HN_);S.hgt=null;
  for(const t of T)t.bz=2+Math.pow(n5(t.x/90,t.y/90),1.6)*8;
  for(let j=0;j<HN_;j++)for(let i=0;i<HN_;i++){const x=i*HR,y=j*HR;let h=2+Math.pow(n5(x/90,y/90),1.6)*14+n2(x/30+7,y/30)*2.5;
    let m=1,tb=3;for(const tw of T){const d=hyp(x-tw.x,y-tw.y);if(d<95){const mm=clamp((d-60)/35,0,1);if(mm<m){m=mm;tb=tw.bz}}}
    h=h*m+(1-m)*tb;
    let wd=99;for(let k=-2;k<=2;k++)for(let l=-2;l<=2;l++){const t=tileAt(x+k*2,y+l*2);if(t===WA)wd=Math.min(wd,hyp(k*2,l*2))}
    if(tileAt(x,y)===WA)h=-2.2;else if(wd<5)h=Math.min(h,.4+wd*.3);
    if(tileAt(x,y)===SA)h=Math.min(h,1.2);
    H[j*HN_+i]=h}
  for(let pass=0;pass<2;pass++)for(let j=1;j<HN_-1;j++)for(let i=1;i<HN_-1;i++){const t=tileAt(i*HR,j*HR);if(t!==RO&&t!==BR)continue;const k=j*HN_+i;H[k]=(H[k]*2+H[k-1]+H[k+1]+H[k-HN_]+H[k+HN_])/6}
  for(let j=0;j<HN_;j++)for(let i=0;i<HN_;i++)if(tileAt(i*HR,j*HR)===BR)H[j*HN_+i]=Math.max(H[j*HN_+i],1.2);
  S.hgt=H;
  S.obs=[];grid=Array.from({length:HN*HN},()=>[]);S.buildings=[];S.trees=[];S.bushes=[];S.items=[];S.props=[];S.pois=[];S.towers=[];S.doors=[];
  const rectHas=(x,y,w,h,ts)=>{for(let ty=Math.floor(y/TS);ty<=Math.floor((y+h)/TS);ty++)for(let tx=Math.floor(x/TS);tx<=Math.floor((x+w)/TS);tx++){if(tx<0||ty<0||tx>=TN||ty>=TN)return true;if(ts.includes(type[ty*TN+tx]))return true}return false};
  const tryBld=(x,y,w,h,kind,tw)=>{x=Math.round(x*2)/2;y=Math.round(y*2)/2;w=Math.round(w*2)/2;h=Math.round(h*2)/2;if(x<24||y<24||x+w>W-24||y+h>W-24)return null;
    if(S.buildings.some(b=>x<b.x+b.w+6&&x+w+6>b.x&&y<b.y+b.h+6&&y+h+6>b.y))return null;if(rectHas(x-1,y-1,w+2,h+2,[WA,RO,SA,BR,FA]))return null;
    const b={x,y,w,h,tw,kind,roof:kind==='warehouse'?'#8d97a5':ROOFC[S.buildings.length%ROOFC.length],wc:kind==='warehouse'?'#b9c3cf':WALLC[(R()*WALLC.length)|0],idx:S.buildings.length};
    b.z=groundH(x+w/2,y+h/2);flattenRect(x-1.5,y-1.5,w+3,h+3,b.z);S.buildings.push(b);return b};
  for(const tw of T){const nb=4+(R()*4|0)+(tw.q>.9?3:0);let placed=0;
    if(tw.q>.9||R()<.55)for(let tr=0;tr<40;tr++){if(tryBld(tw.x+(R()-.5)*110-10,tw.y+(R()-.5)*110-7,19+R()*4,13+R()*3,'warehouse',tw))break}
    for(let tr=0;tr<120&&placed<nb;tr++){const w=9+R()*7,h=8+R()*5;if(tryBld(tw.x+(R()-.5)*120-w/2,tw.y+(R()-.5)*120-h/2,w,h,'house',tw))placed++}}
  const POIT=['camp','containers','farm','checkpoint','wreck','tower'];
  for(let tr=0;tr<900&&S.pois.length<26;tr++){const x=60+R()*(W-120),y=60+R()*(W-120);
    if(T.some(t=>hyp(t.x-x,t.y-y)<110)||S.pois.some(p=>hyp(p.x-x,p.y-y)<95))continue;if(rectHas(x-22,y-22,44,44,[WA,RO,BR]))continue;
    const kind=POIT[S.pois.length%POIT.length];const poi={x,y,kind,q:.35+R()*.35,z:groundH(x,y)};S.pois.push(poi);flattenRect(x-16,y-16,32,32,poi.z);
    if(kind==='farm'){const b=tryBld(x-3.5,y-3,7+R()*1.5,6+R()*1.5,'shed',{q:poi.q});if(b)b.poi=poi}
    if(kind==='containers'){for(let i=0;i<5;i++)placeProp(R,'container',x+(i%3-1)*4.5+(R()-.5),y+((i/3)|0)*8-4,(R()<.25?1:0))}
    if(kind==='tower')addTower(x-3,y)}
  for(const tw of T)if(tw.q>.9||R()<.4){for(let k=0;k<8;k++){const x=tw.x+(R()<.5?-1:1)*(44+R()*12),y=tw.y+(R()<.5?-1:1)*(44+R()*12);if(!rectHas(x-4,y-4,14,8,[WA,RO,BR,FL])&&!nearBuilding(x,y,6)){addTower(x,y);break}}}
  const D=1.6;
  const wallH=(b,x,y,L,gap,dw)=>{const mk=(xx,ll)=>{if(ll>.3)addObs({k:'r',x:xx,y,w:ll,h:.3,hh:b.kind==='warehouse'?4.5:WALL_H,wall:1,b,z0:b.z,win:winsFor(b,ll,R)})};if(gap==null){mk(x,L);return}mk(x,gap-dw/2);mk(x+gap+dw/2,L-gap-dw/2);addDoor(b,x+gap,y+.15,dw,true)};
  const wallV=(b,x,y,L,gap,dw)=>{const mk=(yy,ll)=>{if(ll>.3)addObs({k:'r',x,y:yy,w:.3,h:ll,hh:b.kind==='warehouse'?4.5:WALL_H,wall:1,b,z0:b.z,win:winsFor(b,ll,R)})};if(gap==null){mk(y,L);return}mk(y,gap-dw/2);mk(y+gap+dw/2,L-gap-dw/2);addDoor(b,x+.15,y+gap,dw,false)};
  const gapPos=(L,dw)=>Math.round((L/2+(R()-.5)*(L-2*dw-2))*2)/2;
  for(const b of S.buildings){b.doors=[];const door=(ix,iy,ox,oy)=>b.doors.push({ix,iy,ox,oy});
    for(let ty=Math.floor(b.y/TS);ty<Math.ceil((b.y+b.h)/TS);ty++)for(let tx=Math.floor(b.x/TS);tx<Math.ceil((b.x+b.w)/TS);tx++)type[ty*TN+tx]=FL;
    const dw=b.kind==='warehouse'?3.2:D;let d1=R()*4|0,d2=R()<.55?(d1+2)%4:-1;if(b.kind==='warehouse'){d1=b.w>=b.h?0:1;d2=d1+2}
    const has=s=>s===d1||s===d2;
    const g0=has(0)?gapPos(b.w,dw):null,g2=has(2)?gapPos(b.w,dw):null,g3=has(3)?gapPos(b.h-.6,dw):null,g1=has(1)?gapPos(b.h-.6,dw):null;
    wallH(b,b.x,b.y,b.w,g0,dw);wallH(b,b.x,b.y+b.h-.3,b.w,g2,dw);wallV(b,b.x,b.y+.3,b.h-.6,g3,dw);wallV(b,b.x+b.w-.3,b.y+.3,b.h-.6,g1,dw);
    if(g0!=null)door(b.x+g0,b.y+1.2,b.x+g0,b.y-1.2);if(g2!=null)door(b.x+g2,b.y+b.h-1.2,b.x+g2,b.y+b.h+1.2);
    if(g3!=null)door(b.x+1.2,b.y+.3+g3,b.x-1.2,b.y+.3+g3);if(g1!=null)door(b.x+b.w-1.2,b.y+.3+g1,b.x+b.w+1.2,b.y+.3+g1);
    if(b.kind==='house'&&b.w>=12&&R()<.8){const gp=gapPos(b.h-.6,D),xm=b.x+b.w/2-.15;addObs({k:'r',x:xm,y:b.y+.3,w:.3,h:gp-D/2,hh:WALL_H,wall:1,b,z0:b.z,inner:1});addObs({k:'r',x:xm,y:b.y+.3+gp+D/2,w:.3,h:b.h-.6-gp-D/2,hh:WALL_H,wall:1,b,z0:b.z,inner:1})}
    if(b.kind==='warehouse'){for(let i=0;i<5;i++){const x=b.x+2+R()*(b.w-4),y=b.y+2+R()*(b.h-4);placeProp(R,R()<.6?'crate':'barrel',x,y,R()*4|0,true)}}}
  for(const poi of S.pois){const{x,y}=poi;const P=(k,dx,dy,rot)=>placeProp(R,k,x+dx,y+dy,rot);
    if(poi.kind==='camp'){P('tent',-5,-2,0);P('tent',4.5,-3,1);P('tent',0,5,0);P('crate',-1,-.5,0);P('barrel',2,1.5,0);P('crate',-6,4.5,1)}
    else if(poi.kind==='farm'){for(let i=0;i<5;i++)P('hay',-10+R()*20,6+R()*6,0);for(let i=0;i<4;i++)P('fence',-10+i*4.1,-8,0);P('fence',10,-5,1);P('barrel',6,-2,0)}
    else if(poi.kind==='checkpoint'){P('sandbag',0,-4,0);P('sandbag',0,4,0);P('sandbag',-4,0,1);P('sandbag',4,0,1);P('barrel',-7,-6,0);P('barrel',-6,-7,0);P('car_police',8,2,0);P('crate',7,-7,0)}
    else if(poi.kind==='wreck'){P('car_sedan',-4,0,1);P('car_hatchback',4,-3,0);P('car_stationwagon',1.5,5,1);P('barrel',-1,-5,0);P('barrel',.5,-6,0)}
    else if(poi.kind==='containers'){P('crate',-8,6,0);P('barrel',8,-6,0)}
    else if(poi.kind==='tower'){P('sandbag',-8,0,1);P('crate',-6,5,0);P('barrel',-5,-5,0)}}
  const BK=['building_A','building_B','building_C','building_D','building_E','building_F','building_G','building_H'];
  for(const tw of T){let n=0;for(let tr=0;tr<60&&n<3;tr++){const a=R()*TAU,d=62+R()*18;if(placeProp(R,BK[R()*8|0],tw.x+Math.cos(a)*d,tw.y+Math.sin(a)*d,R()*4|0))n++}
    let m=0;for(let tr=0;tr<100&&m<14;tr++){const a=R()*TAU,d=8+R()*70,k=pickW(R,[['car_sedan',3],['car_taxi',2],['car_police',tw.q>.9?4:1],['car_hatchback',2],['car_stationwagon',2],['dumpster',3],['crate',3],['barrel',3],['container',tw.q>.9?3:1],['sandbag',tw.q>.9?4:.5],['watertower',tw.q>.9?1:.5]]);
      if(placeProp(R,k,tw.x+Math.cos(a)*d,tw.y+Math.sin(a)*d,R()*4|0))m++}
    for(let i=0;i<18;i++){const a=R()*TAU,d=5+R()*80;placeProp(R,pickW(R,[['bench',2],['streetlight',3],['firehydrant',1],['bush',3],['trash_A',2],['box_B',2],['fence',2]]),tw.x+Math.cos(a)*d,tw.y+Math.sin(a)*d,R()*4|0)}}
  for(const r of S.roads){for(let i=1;i<14;i++){if(R()<.45)continue;const t=i/14,u=1-t,x=u*u*r.a.x+2*u*t*r.mx+t*t*r.b.x,y=u*u*r.a.y+2*u*t*r.my+t*t*r.b.y;
    const dx=2*u*(r.mx-r.a.x)+2*t*(r.b.x-r.mx),dy=2*u*(r.my-r.a.y)+2*t*(r.b.y-r.my),L=hyp(dx,dy)||1,nx=-dy/L,ny=dx/L,s=R()<.5?1:-1;
    if(R()<.35)placeProp(R,pickW(R,[['car_sedan',2],['car_hatchback',2],['car_stationwagon',1],['barrel',1]]),x+nx*s*5.5,y+ny*s*5.5,Math.abs(dx)>Math.abs(dy)?1:0);
    else placeProp(R,'streetlight',x+nx*s*4.5,y+ny*s*4.5,0)}}
  for(let i=0;i<160;i++){const x=40+R()*(W-80),y=40+R()*(W-80),t=tileAt(x,y);if(t===FA)placeProp(R,'hay',x,y,0);else if(t===G&&R()<.5)placeProp(R,R()<.5?'hay':'barrel',x,y,0)}
  for(let i=0;i<1600;i++){const x=R()*W,y=R()*W,t=tileAt(x,y);if(t===WA||t===RO||t===FL||t===BR||t===FA||t===SA)continue;if(t!==RK&&R()<.6)continue;const r=.5+R()*(t===RK?2.2:1.2);
    if(nearBuilding(x,y,r+2)||anySolidNear(x,y,r+.8))continue;addObs({k:'c',x,y,r,hh:r*1.4,rock:1,v:R()*100|0})}
  for(let i=0;i<22000&&S.trees.length<3200;i++){const x=R()*W,y=R()*W,t=tileAt(x,y);
    if(t!==G&&t!==DG&&t!==RK)continue;if(t===G&&R()<.72)continue;if(t===RK&&R()<.75)continue;if(nearBuilding(x,y,3)||anySolidNear(x,y,2.2))continue;
    const pine=t===DG?R()<.7:t===RK?R()<.8:R()<.15;const s=.8+R()*.5;addObs({k:'c',x,y,r:.35,hh:9,trunk:1});S.trees.push({x,y,s,rot:R()*TAU,pine,z:groundH(x,y)})}
  for(let i=0;i<16000&&S.bushes.length<2600;i++){const x=R()*W,y=R()*W,t=tileAt(x,y);if(t!==G&&t!==DG)continue;if(t===G&&R()<.5)continue;if(nearBuilding(x,y,2)||anySolidNear(x,y,1))continue;
    S.bushes.push({x,y,r:.9+R()*.6,rot:R()*TAU,z:groundH(x,y)})}
  for(const b of S.buildings){const q=b.tw?b.tw.q:.4;const n=b.kind==='warehouse'?5+(R()*3|0):b.kind==='shed'?2+(R()*2|0):2+(R()*3|0)+(q>.9?2:0);
    for(let i=0;i<n;i++){for(let k=0;k<8;k++){const x=b.x+1+R()*(b.w-2),y=b.y+1+R()*(b.h-2);if(!solidAt(x,y)&&!anySolidNear(x,y,.5)){spawnLoot(x,y,q,R);break}}}}
  for(const t of S.towers){addItem('w',R()<.5?'dmr':'sniper',0,t.x,t.y,0,null,t.top);addItem('a','762',15,t.x+.8,t.y+.5,0,null,t.top)}
  for(const poi of S.pois)lootNear(R,poi.x,poi.y,12,poi.kind==='farm'?2:4+(R()*2|0),poi.q);
  for(let i=0;i<260;i++){const x=24+R()*(W-48),y=24+R()*(W-48);if(!freeSpot(x,y,.6))continue;spawnLoot(x,y,0,R)}
  const CS=100,CN=W/CS,cnt=new Array(CN*CN).fill(0),wcnt=new Array(CN*CN).fill(0);
  for(const it of S.items){const i=((it.y/CS)|0)*CN+((it.x/CS)|0);cnt[i]++;if(it.k==='w')wcnt[i]++}
  for(let cy=0;cy<CN;cy++)for(let cx=0;cx<CN;cx++){const i=cy*CN+cx;let land=0;for(let k=0;k<16;k++){const t=tileAt(cx*CS+R()*CS,cy*CS+R()*CS);if(t!==WA)land++}if(land<5)continue;
    let tries=0;while((wcnt[i]<2||cnt[i]<7)&&tries<80){tries++;const x=cx*CS+6+R()*(CS-12),y=cy*CS+6+R()*(CS-12);if(x<20||y<20||x>W-20||y>W-20||!freeSpot(x,y,.6))continue;
      const before=S.items.length;spawnLoot(x,y,.15,R,wcnt[i]<2?'w':null);if(wcnt[i]<2)wcnt[i]++;cnt[i]+=S.items.length-before}}
  // 평탄화 이후 높이 재계산
  for(const it of S.items)if(!S.towers.some(t=>it.z===t.top))it.z=groundH(it.x,it.y);
  for(const t of S.trees)t.z=groundH(t.x,t.y);for(const b of S.bushes)b.z=groundH(b.x,b.y);for(const p of S.props)p.z=groundH(p.x,p.y);
  for(const o of S.obs)if(!o.wall&&!o.door&&!o.tw)o.z0=groundH(o.k==='r'?o.x+o.w/2:o.x,o.k==='r'?o.y+o.h/2:o.y);
  for(const t of S.towers){t.z=groundH(t.x,t.y);t.top=t.z+5.5}
  for(const o of S.obs)if(o.tw){o.z0=o.platform?o.tw.top-.05:o.tw.z}
  for(const it of S.items){const t=S.towers.find(t=>Math.abs(it.x-t.x)<2&&Math.abs(it.y-t.y)<2&&it.z>t.z+2);if(t)it.z=t.top}
}
function flattenRect(x,y,w,h,z){const H=S.hgt;if(!H)return;for(let j=Math.floor((y-5)/HR);j<=Math.ceil((y+h+5)/HR);j++)for(let i=Math.floor((x-5)/HR);i<=Math.ceil((x+w+5)/HR);i++){if(i<0||j<0||i>=HN_||j>=HN_)continue;
  const px=i*HR,py=j*HR,dx=Math.max(x-px,0,px-(x+w)),dy=Math.max(y-py,0,py-(y+h)),d=hyp(dx,dy),t=clamp(1-d/5,0,1);const k=j*HN_+i;H[k]=H[k]*(1-t)+z*t}}
function winsFor(b,L,R){if(b.kind==='warehouse'||L<3)return null;const n=Math.floor((L-.8)/2.6),out=[];for(let i=0;i<n;i++){if(R()<.25)continue;const c=(i+.5)/n*L;out.push([c-.55,c+.55])}return out.length?out:null}
function addDoor(b,x,y,dw,hz){const d={k:'r',x:hz?x-dw/2:x-.08,y:hz?y-.08:y-dw/2,w:hz?dw:.16,h:hz?.16:dw,hh:2.2,door:1,b,z0:b.z,hz,cx:x,cy:y,dw,open:false,id:S.doors.length};
  if(b.kind==='warehouse'){d.open=true;d.dead=true}addObs(d);S.doors.push(d)}
function addTower(x,y){const z=groundH(x,y);flattenRect(x-4,y-4,14,8,z);const t={x,y,z,top:z+5.5,s:2.4,id:S.towers.length};
  t.ramp={x0:x+2.4,x1:x+8.4,y0:y-.7,y1:y+.7};S.towers.push(t);
  for(const[dx,dy]of[[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]])addObs({k:'c',x:x+dx,y:y+dy,r:.2,hh:5.5,trunk:1,leg:1,tw:t});
  addObs({k:'r',x:x-2.4,y:y-2.4,w:4.8,h:4.8,hh:1.1,platform:1,tw:t})}
export function toggleDoor(d){d.open=!d.open;d.dead=d.open;ev({t:'door',d})}
export function nearDoor(p){let best=null,bd=1.9;for(const d of S.doors){if(d.b.kind==='warehouse')continue;const dd=hyp(d.cx-p.x,d.cy-p.y);if(dd<bd&&Math.abs(p.z-d.z0)<1.5){bd=dd;best=d}}return best}

/* ================= 경기 시작/비행기 ================= */
function makePlayer(id,name,bot,ch){
  return{id,name,x:0,y:0,z:ALT,jz:0,jv:0,lv:-1,onRamp:0,ph:'plane',r:PR,hp:100,boost:0,alive:true,bot,ch,ang:Math.random()*TAU,pitch:0,w:[null,null],cur:2,crouch:false,ads:false,
    ammo:{'9':0,'556':0,'762':0,'12':0},heal:{bandage:0,medkit:0,drink:0},helm:0,vest:0,bag:0,mod:0,kills:0,
    cd:0,rl:0,healT:0,healK:null,sw:0,flash:0,hitT:0,punch:0,deathT:0,provoked:0,skillCD:15,buff:{},slowT:0,stunT:0,stillT:0,revealT:0,recoil:0,
    hist:[],histT:0,voltTgt:null,voltN:0,mdx:0,mdy:0,moving:false,opening:null,openT:0,charge:0,spin:0,firingT:0,shotT:0,skillT:0,landT:0,stepT:0,
    thinkT:Math.random()*.3,tgt:null,tgtVis:false,lostT:0,react:0,err:0,errZ:0,sdir:Math.random()<.5?1:-1,mvx:0,mvy:0,
    goal:null,wp:null,wpT:0,unstick:0,uang:0,stuckT:0,lx:0,ly:0,skill:.3+Math.random()*.7,aggr:55+Math.random()*50,in:{},blinkDir:null,jumpAt:1,dest:null}}
export function startMatch(myChar){S.mode='br';
  S.players=[];S.bullets=[];S.decoys=[];S.barriers=[];S.fields2=[];S.stops=[];S.drops=[];S.feed=[];S.events=[];S.gtime=0;S.endT=-1;S.over=false;S.won=false;
  for(const d of S.doors)if(d.b.kind!=='warehouse'){d.open=false;d.dead=false}
  const a=Math.random()*TAU,off=(Math.random()-.5)*380,cx=W/2+Math.cos(a+Math.PI/2)*off,cy=W/2+Math.sin(a+Math.PI/2)*off,L=W*.95;
  const pl={x0:cx-Math.cos(a)*L,y0:cy-Math.sin(a)*L,x1:cx+Math.cos(a)*L,y1:cy+Math.sin(a)*L,t:0,sp:60,ang:a,x:0,y:0,done:false};
  pl.len=hyp(pl.x1-pl.x0,pl.y1-pl.y0);pl.tIn=1;pl.tOut=0;
  for(let i=0;i<=200;i++){const t=i/200,x=pl.x0+(pl.x1-pl.x0)*t,y=pl.y0+(pl.y1-pl.y0)*t;if(x>40&&y>40&&x<W-40&&y<W-40){pl.tIn=Math.min(pl.tIn,t);pl.tOut=Math.max(pl.tOut,t)}}
  pl.t=Math.max(0,pl.tIn-.05);S.plane=pl;
  S.me=makePlayer(0,'나',false,myChar);S.players.push(S.me);
  for(let i=0;i<BOTS;i++){const b=makePlayer(i+1,BOTN[i],true,CHK[Math.random()*4|0]);
    let dx,dy;const pool=[...S.towns,...S.pois];if(Math.random()<.7&&pool.length){const t=pool[Math.random()*pool.length|0];dx=t.x+(Math.random()-.5)*40;dy=t.y+(Math.random()-.5)*40}else{dx=60+Math.random()*(W-120);dy=60+Math.random()*(W-120)}
    b.dest={x:dx,y:dy};let bt=pl.tIn,bd=1e9;for(let k=0;k<=100;k++){const t=pl.tIn+(pl.tOut-pl.tIn)*k/100,x=pl.x0+(pl.x1-pl.x0)*t,y=pl.y0+(pl.y1-pl.y0)*t,d=hyp(x-dx,y-dy);if(d<bd){bd=d;bt=t}}
    b.jumpAt=clamp(bt-.02+Math.random()*.04,pl.tIn,pl.tOut);S.players.push(b)}
  S.aliveN=S.players.length;
  const flight=(pl.tOut-pl.t)*pl.len/pl.sp;
  S.zone={cx:W/2,cy:W/2,r:W*.76,phase:-1,state:'wait',t:0,tx:W/2,ty:W/2,tr:W*.76,sx:0,sy:0,sr:0,d:.4};nextZone();S.zone.t+=flight+10;
  updPlane(0)}
export function startTraining(myChar){startMatch(myChar);S.mode='train';S.plane.done=true;const me=S.me;
  const t=S.towns[0];let bx=t.x,by=t.y;for(let i=0;i<200;i++){const x=t.x+(Math.random()-.5)*60,y=t.y+(Math.random()-.5)*60;if(!solidAt(x,y)&&!anySolidNear(x,y,3)&&!bldAt(x,y)&&tileAt(x,y)!==WA){bx=x;by=y;break}}
  me.ph='ground';me.x=bx;me.y=by;me.z=groundH(bx,by);me.w=[{k:'ar',mag:30},{k:'sniper',mag:5}];me.cur=0;me.ammo={'9':60,'556':120,'762':40,'12':24};me.heal={bandage:5,medkit:1,drink:2};me.helm=2;me.vest=2;me.bag=3;me.mod=3;me.skillCD=0;me.ang=-Math.PI/2;
  const dums=S.players.slice(1,9);S.players=[me,...dums];
  dums.forEach((d,i)=>{const dist=[7,11,16,22,30,45,60,85][i],off=(i%2?1:-1)*(1.5+i*1.2);d.dummy=true;d.ph='ground';d.bx=clamp(bx+off,20,W-20);d.by=clamp(by-dist,20,W-20);d.x=d.bx;d.y=d.by;d.z=groundH(d.x,d.y);d.amp=i%3===1?3:0;d.name='과녁 '+(i+1);d.hp=100;d.w=[null,null];d.helm=i>=5?2:0;d.ang=Math.PI/2});
  // 무기 진열대
  const ks=Object.keys(WD);ks.forEach((k,i)=>{const x=bx-6+i*1.5,y=by+4;addItem('w',k,0,x,y,WD[k].special?WD[k].mag:WD[k].mag);if(WD[k].ak)addItem('a',WD[k].ak,60,x,y+1)});
  S.zone={cx:W/2,cy:W/2,r:1e5,phase:9,state:'done',t:0,tx:W/2,ty:W/2,tr:1e5,sx:0,sy:0,sr:0,d:0};S.aliveN=S.players.length}
function updDummy(p,dt){if(!p.alive){p.respT-=dt;if(p.respT<=0){p.alive=true;p.hp=100;p.x=p.bx;p.y=p.by;p.z=groundH(p.x,p.y);p.stunT=0;p.slowT=0}return}
  const me=S.me;if(p.amp){const nx=p.bx+Math.sin(S.gtime*.9+p.id)*p.amp;p.moving=Math.abs(nx-p.x)>.001;p.mdx=Math.sign(nx-p.x)||1;p.mdy=0;p.curSp=Math.abs(nx-p.x)/dt;p.x=nx;p.z=groundH(p.x,p.y)}
  p.ang=Math.atan2(me.y-p.y,me.x-p.x);for(const k of['stunT','slowT','hitT','flash','landT'])if(p[k]>0)p[k]-=dt;for(const k in p.buff)if(p.buff[k]>0)p.buff[k]-=dt;if(p.hitT<=0&&p.hp<100)p.hp=Math.min(100,p.hp+dt*20)}
function updPlane(dt){const pl=S.plane;if(pl.done)return;pl.t+=dt*pl.sp/pl.len;pl.x=pl.x0+(pl.x1-pl.x0)*pl.t;pl.y=pl.y0+(pl.y1-pl.y0)*pl.t;
  for(const p of S.players){if(p.ph!=='plane')continue;p.x=pl.x;p.y=pl.y;p.z=ALT;
    if(p.bot&&pl.t>=p.jumpAt)jump(p);else if(pl.t>=pl.tOut)jump(p)}
  if(pl.t>1.02)pl.done=true}
export function jump(p){if(p.ph!=='plane')return;p.ph='fall';p.z=ALT-4;p.x=S.plane.x+(Math.random()-.5)*3;p.y=S.plane.y+(Math.random()-.5)*3;if(p===S.me){ev({t:'jump'});toast('뛰어내렸습니다. 스틱으로 방향을 조종하세요')}}
function updAir(p,inp,dt){
  let mx=inp.mx||0,my=inp.my||0;
  if(p.bot){const dx=p.dest.x-p.x,dy=p.dest.y-p.y,d=hyp(dx,dy);if(d>2){mx=dx/d;my=dy/d}else mx=my=0}
  const m=hyp(mx,my);if(m>1){mx/=m;my/=m}
  const sp=p.ph==='fall'?26:11;p.x=clamp(p.x+mx*sp*dt,20,W-20);p.y=clamp(p.y+my*sp*dt,20,W-20);p.moving=m>.1;if(p.moving&&p.bot)p.ang=Math.atan2(my,mx);if(!p.bot&&inp.aim!=null)p.ang=inp.aim;
  p.z-=(p.ph==='fall'?42:6.5)*dt;const gz=groundH(p.x,p.y);
  if(p.ph==='fall'&&p.z<=gz+60){p.ph='chute';if(p===S.me)ev({t:'chute'})}
  if(p.z<=gz){p.z=gz;p.ph='ground';p.landT=.5;collide(p);collide(p);p.z=groundH(p.x,p.y);if(p===S.me){ev({t:'land'});toast('착지! 무기를 찾으면 스킬이 열립니다')}}}
function nextZone(){const z=S.zone;z.phase++;const ph=PH[z.phase];if(!ph){z.state='done';return}
  z.tr=ph.r;const maxOff=Math.max(0,z.r-ph.r);
  for(let i=0;i<60;i++){const a=Math.random()*TAU,d=Math.sqrt(Math.random())*maxOff*.9,tx=z.cx+Math.cos(a)*d,ty=z.cy+Math.sin(a)*d,m=Math.min(ph.r*.7,120);
    if(tx>m&&ty>m&&tx<W-m&&ty<W-m&&tileAt(tx,ty)!==WA){z.tx=tx;z.ty=ty;break}if(i===59){z.tx=z.cx;z.ty=z.cy}}
  z.state='wait';z.t=ph.w}
function updZone(dt){const z=S.zone;
  if(z.state==='wait'){z.t-=dt;if(z.t<=0){z.state='shrink';const ph=PH[z.phase];z.t=ph.s;z.sx=z.cx;z.sy=z.cy;z.sr=z.r;z.d=ph.d;ev({t:'zoneMove'});if(z.phase<5)spawnDrops(z.phase<2?1:1+(Math.random()<.5?1:0))}}
  else if(z.state==='shrink'){z.t-=dt;const ph=PH[z.phase],f=clamp(1-z.t/ph.s,0,1);
    z.cx=z.sx+(z.tx-z.sx)*f;z.cy=z.sy+(z.ty-z.sy)*f;z.r=z.sr+(z.tr-z.sr)*f;
    if(z.t<=0){z.cx=z.tx;z.cy=z.ty;z.r=z.tr;nextZone()}}
  for(const p of S.players){if(!p.alive||p.ph!=='ground')continue;if(hyp(p.x-z.cx,p.y-z.cy)>z.r){p.zoneAcc=(p.zoneAcc||0)+dt;if(p.zoneAcc>=.5){p.zoneAcc=0;hurt(p,z.d*.5,null,'zone',true)}}}}

/* ================= 보급 ================= */
function spawnDrops(n){let made=0;const z=S.zone;
  for(let k=0;k<n;k++)for(let i=0;i<60;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*Math.max(8,z.tr*.8),x=z.tx+Math.cos(a)*r,y=z.ty+Math.sin(a)*r;
    if(x<30||y<30||x>W-30||y>W-30)continue;const t=tileAt(x,y);if(t===WA||t===FL||nearBuilding(x,y,3)||anySolidNear(x,y,2.5))continue;
    S.drops.push({id:Math.random(),x,y,z:1,gz:groundH(x,y),fall:14,landed:false,opened:false,obs:null});made++;break}
  if(made){toast('보급상자가 떨어지고 있습니다');feedPush('보급상자 투하 '+made+'개',true);ev({t:'sfx',k:'drop'})}}
function updDrops(dt){for(const d of S.drops){
  if(!d.landed){d.z-=dt/d.fall;if(d.z<=0){d.z=0;d.landed=true;d.obs=addObs({k:'r',x:d.x-.8,y:d.y-.8,w:1.6,h:1.6,hh:1.4,drop:1,z0:d.gz});ev({t:'dust',x:d.x,y:d.y,z:d.gz});
      for(const p of S.players)if(p.alive&&p.ph==='ground'&&hyp(p.x-d.x,p.y-d.y)<1.3){p.x=d.x+1.4;collide(p)}}}}}
function openDrop(d,p){d.opened=true;const L=[];
  const sp=['flame','minigun','rail'][Math.random()*3|0];L.push(['w',sp,0,WD[sp].mag]);
  const ex=['ar:helm:3','ar:vest:3','bag::3','mod::3'].sort(()=>Math.random()-.5).slice(0,2);for(const e of ex){const[k,s,n]=e.split(':');L.push([k,s,+n])}
  L.push(['h','medkit',1]);if(Math.random()<.5)L.push(['h','drink',2]);
  L.forEach((e,i)=>{const a=i/L.length*TAU,x=d.x+Math.cos(a)*1.8,y=d.y+Math.sin(a)*1.8,bad=solidAt(x,y);addItem(e[0],e[1],e[2],bad?d.x:x,bad?d.y+1.4:y,e[3]||0)});
  if(p===S.me){toast('보급상자를 열었습니다');ev({t:'sfx',k:'open'})}}
export function nearDrop(p){for(const d of S.drops)if(d.landed&&!d.opened&&hyp(d.x-p.x,d.y-p.y)<2.2)return d;return null}

/* ================= 가방/무게 ================= */
export function weight(p){let s=0;for(const k in p.ammo)s+=p.ammo[k]*AMMO[k].w;for(const k in p.heal)s+=p.heal[k]*HEAL[k].w;return s}
export function capOf(p){return BAGCAP[p.bag]}
function fitN(p,uw){return Math.max(0,Math.floor((capOf(p)-weight(p)+1e-6)/uw))}
export function pickR(p){return p.ch==='psy'?2.6:1.3}
function usesAmmo(p,ak){return p.w.some(w=>w&&WD[w.k].ak===ak)}
function removeItem(it){it.alive=false;const i=S.items.indexOf(it);if(i>=0)S.items.splice(i,1)}
function takeWeapon(p,it,slot){const old=p.w[slot];p.w[slot]={k:it.s,mag:it.mag};
  if(old){it.s=old.k;it.mag=old.mag;it.block=p.id}else removeItem(it);
  if(p.cur===2||p.cur===slot||!p.bot){p.cur=slot;p.sw=.35;p.rl=0;p.charge=0}if(p===S.me)ev({t:'sfx',k:'equip'})}
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
  const R=pickR(p);
  for(let i=S.items.length-1;i>=0;i--){const it=S.items[i];if(!it||!it.alive)continue;const d=hyp(it.x-p.x,it.y-p.y);
    if(it.block===p.id){if(d>R+1)it.block=-1;continue}
    if(d>R||Math.abs(it.z-p.z)>1.5)continue;let auto=false;
    if(p.bot){if(it.k==='a')auto=usesAmmo(p,it.s);else if(it.k==='h')auto=true;else if(it.k==='w')auto=!p.w[0]||!p.w[1]||RANK[it.s]>Math.min(RANK[p.w[0].k],RANK[p.w[1].k]);else auto=it.n>p[it.k==='ar'?it.s:it.k]}
    else if(S.autoPick){if(it.k==='a')auto=usesAmmo(p,it.s);else if(it.k==='h')auto=p.heal[it.s]<HEAL[it.s].auto;else if(it.k==='w')auto=!p.w[0]||!p.w[1];else auto=p[it.k==='ar'?it.s:it.k]===0}
    if(auto){if(p.bot&&it.k==='w'&&p.w[0]&&p.w[1]){const worse=RANK[p.w[0].k]<=RANK[p.w[1].k]?0:1;takeWeapon(p,it,worse);continue}pickItem(p,it,false)}}}
export function nearItems(p,extra){const R=pickR(p)+(extra||1.2),out=[];for(const it of S.items)if(hyp(it.x-p.x,it.y-p.y)<R&&Math.abs(it.z-p.z)<1.8)out.push(it);return out}
export function dropStuff(p,k,s,n){const x=p.x+(Math.random()-.5)*1.2,y=p.y+(Math.random()-.5)*1.2,z=p.z;
  if(k==='a'){n=Math.min(n,p.ammo[s]);if(n<=0)return;p.ammo[s]-=n;addItem('a',s,n,x,y,0,p.id,z)}
  else if(k==='h'){n=Math.min(n,p.heal[s]);if(n<=0)return;p.heal[s]-=n;if(p.healK===s)cancelHeal(p);addItem('h',s,n,x,y,0,p.id,z)}
  else if(k==='w'){const w=p.w[s];if(!w)return;p.w[s]=null;addItem('w',w.k,0,x,y,w.mag,p.id,z);if(p.cur===s){p.cur=2;p.rl=0;p.charge=0}}
  else if(k==='bag'){if(!p.bag)return;if(weight(p)>BAGCAP[0]){toast('짐을 먼저 줄여야 가방을 내려놓을 수 있습니다');return}addItem('bag','',p.bag,x,y,0,p.id,z);p.bag=0}
  else{const f=k==='ar'?s:k;if(!p[f])return;addItem(k,k==='ar'?s:'',p[f],x,y,0,p.id,z);p[f]=0}
  if(p===S.me)ev({t:'sfx',k:'drop'})}

/* ================= 전투/행동 ================= */
export function curW(p){return p.cur<2?p.w[p.cur]:null}
export function famOf(p){const w=curW(p);return w?FAM[w.k]:null}
export function eyeZ(p){return p.z+(p.crouch?PH_C:PH_H)-.15+p.jz}
export function muzzleZ(p){return p.z+(p.crouch?PH_C:PH_H)-.35+p.jz}
function startReload(p){const w=curW(p);if(!w||p.rl>0)return;const d=WD[w.k];if(d.special||w.mag>=d.mag||p.ammo[d.ak]<=0)return;cancelHeal(p);p.rl=d.rl;ev({t:'sfx',k:'reload',x:p.x,y:p.y,p})}
function finishReload(p){const w=curW(p);if(!w)return;const d=WD[w.k];if(d.special)return;const take=Math.min(d.mag-w.mag,p.ammo[d.ak]);w.mag+=take;p.ammo[d.ak]-=take}
function canUse(p,k){if(k==='bandage')return p.hp<75;if(k==='medkit')return p.hp<100;return p.boost<100}
function cancelHeal(p){p.healT=0;p.healK=null}
function finishHeal(p){const k=p.healK;if(!k)return;p.heal[k]--;if(k==='bandage')p.hp=Math.max(p.hp,Math.min(75,p.hp+15));else if(k==='medkit')p.hp=100;else p.boost=Math.min(100,p.boost+45);p.healK=null;if(p===S.me)ev({t:'sfx',k:'heal'})}
export function isTrain(){return S.mode==='train'}
export function stealthed(p){if(p.buff.invis>0)return true;return p.ch==='shadow'&&p.revealT<=0&&(p.stillT>.6||inBush(p))}
export function invisible(p){return p.buff.invis>0}
function useSkill(p){
  if(!p.alive||p.skillCD>0||p.ph!=='ground')return false;const f=famOf(p);if(!f){if(p===S.me)toast('무기를 들어야 스킬을 쓸 수 있습니다');return false}
  const w=curW(p),C=CHARS[p.ch];
  if(p.ch==='shadow'){if(f==='far'){p.buff.xray=5}else{p.buff.invis=f==='mid'?4:3;p.buff.dash=f==='near'?p.buff.invis:0}}
  else if(p.ch==='chrono'){const h=p.hist[0]||{x:p.x,y:p.y,z:p.z,hp:p.hp},ox=p.x,oy=p.y,oz=p.z;p.hp=Math.min(100,p.hp+Math.max(0,h.hp-p.hp));p.x=h.x;p.y=h.y;p.z=h.z;p.lv=h.lv!=null?h.lv:-1;p.hist=[];p.opening=null;
    ev({t:'trail',x1:ox,y1:oy,z1:oz,x2:p.x,y2:p.y,z2:p.z,c:C.c});
    if(f==='near'){const d=WD[w.k];if(!d.special){const take=Math.min(d.mag-w.mag,p.ammo[d.ak]);w.mag+=take;p.ammo[d.ak]-=take;p.rl=0}}
    else if(f==='mid')S.stops.push({id:Math.random(),x:p.x,y:p.y,z:p.z,r:5,t:2.5,max:2.5,owner:p,held:[]});
    else p.buff.steady=2}
  else if(p.ch==='psy'){const nx=Math.cos(p.ang),ny=Math.sin(p.ang);
    if(f==='near'){let best=null,bd=20;for(const q of S.players){if(q===p||!q.alive||q.ph!=='ground'||invisible(q))continue;const d=hyp(q.x-p.x,q.y-p.y);if(d>bd)continue;const da=Math.abs(angDiff(Math.atan2(q.y-p.y,q.x-p.x),p.ang));if(da>.6)continue;if(!losClear(p.x,p.y,eyeZ(p),q.x,q.y,eyeZ(q)))continue;bd=d;best=q}
      if(best){const ox=best.x,oy=best.y,oz=best.z;let tx=p.x+nx*1.6,ty=p.y+ny*1.6;if(solidAt(tx,ty)){tx=p.x;ty=p.y}best.x=tx;best.y=ty;best.lv=-1;best.onRamp=0;best.z=groundH(tx,ty);collide(best);best.stunT=1;best.opening=null;ev({t:'pull',x1:ox,y1:oy,z1:oz,x2:best.x,y2:best.y,z2:best.z,c:C.c});ev({t:'stun',p:best})}
      else{if(p===S.me)toast('끌어당길 적이 없습니다');return false}}
    else S.barriers.push({id:Math.random(),x:p.x+nx*1.6,y:p.y+ny*1.6,z:p.z,nx,ny,len:4,t:f==='far'?6:4,max:f==='far'?6:4,owner:p,fam:f})}
  else if(p.ch==='volt'){let dx,dy;if(p.blinkDir!=null){dx=Math.cos(p.blinkDir);dy=Math.sin(p.blinkDir);p.blinkDir=null}else if(p.moving){dx=p.mdx;dy=p.mdy}else{dx=Math.cos(p.ang);dy=Math.sin(p.ang)}
    const dist=f==='far'?16:8;let tx=p.x,ty=p.y;for(let s=.25;s<=dist;s+=.25){const nx=p.x+dx*s,ny=p.y+dy*s;if(nx<5||ny<5||nx>W-5||ny>W-5||anySolidNear(nx,ny,p.r-.05))break;if(Math.abs(groundH(nx,ny)-groundH(p.x,p.y))>s*1.2+2)break;tx=nx;ty=ny}
    const oz=p.z;ev({t:'bolt',x1:p.x,y1:p.y,z1:oz,x2:tx,y2:ty,z2:groundH(tx,ty),c:C.c});p.x=tx;p.y=ty;p.lv=-1;p.onRamp=0;p.z=groundH(tx,ty);
    if(f==='near'){let n=0;const L=S.players.filter(q=>q!==p&&q.alive&&q.ph==='ground'&&hyp(q.x-tx,q.y-ty)<8).sort((a,b)=>hyp(a.x-tx,a.y-ty)-hyp(b.x-tx,b.y-ty));let px=tx,py=ty,pz=p.z;
      for(const q of L){if(n>=3)break;n++;ev({t:'bolt',x1:px,y1:py,z1:pz,x2:q.x,y2:q.y,z2:q.z,c:C.c});px=q.x;py=q.y;pz=q.z;hurt(q,20,p,'skill');q.stunT=Math.max(q.stunT,.5);ev({t:'stun',p:q})}}
    if(f==='mid')S.fields2.push({id:Math.random(),x:tx,y:ty,z:p.z,r:4,t:4,max:4,owner:p,acc:0});
    if(f==='far')p.buff.nofire=.5}
  p.skillCD=S.mode==='train'?4:MODCD[p.mod];p.skillT=.6;ev({t:'skill',p,f});return true}

export function applyInput(p,inp,dt){
  if(inp.sw!=null&&inp.sw!==p.cur&&(inp.sw===2||p.w[inp.sw])){p.cur=inp.sw;p.sw=.35;p.rl=0;p.charge=0;cancelHeal(p);if(p===S.me)ev({t:'sfx',k:'equip'})}
  if(inp.use&&p.healT<=0&&p.heal[inp.use]>0){if(canUse(p,inp.use)){p.healK=inp.use;p.healT=HEAL[inp.use].t;p.rl=0}else if(p===S.me)toast(inp.use==='bandage'?'붕대는 체력 75까지만 채웁니다':'지금은 쓸 필요가 없습니다')}
  else if(inp.use&&p===S.me&&p.heal[inp.use]<=0)toast(HEAL[inp.use].n+'이(가) 없습니다');
  if(inp.reload)startReload(p);
  if(inp.skill)useSkill(p);
  if(inp.crouchT)p.crouch=!p.crouch;
  if(inp.jump&&p.jz<=0&&p.lv<0&&!p.onRamp){if(p.crouch)p.crouch=false;else{p.jv=4.2;p.jz=.001;ev({t:'hop',p})}}
  if(inp.open){const d=nearDrop(p);if(d&&!p.opening){p.opening=d;p.openT=3;cancelHeal(p)}}
  if(inp.door){const d=nearDoor(p);if(d){toggleDoor(d);if(!d.open)for(const q of S.players)if(q.alive&&q.ph==='ground')collide(q)}}
  p.ads=!!inp.ads&&!!curW(p);
  let mx=inp.mx,my=inp.my,fire=inp.fire;if(p.stunT>0){p.stunT-=dt;mx=my=0;fire=false}const m=hyp(mx,my);if(m>1){mx/=m;my/=m}
  p.moving=m>.1;if(p.moving){const mm=hyp(mx,my)||1;p.mdx=mx/mm;p.mdy=my/mm;p.stillT=0}else p.stillT+=dt;
  const w=curW(p);
  let sp=inp.sprint&&!p.ads&&!p.crouch&&!fire?6.3:4.7;if(p.crouch)sp=2.4;if(p.ads)sp*=.6;if(p.healT>0)sp*=.45;if(tileAt(p.x,p.y)===WA&&p.z<.3)sp*=.55;if(p.boost>50)sp*=1.06;if(p.slowT>0)sp*=.55;if(p.buff.haste>0)sp*=1.3;if(p.buff.dash>0)sp*=1.3;
  if(w&&w.k==='minigun'&&p.firingT>0)sp*=.6;if(p.charge>0)sp*=.7;if(p.landT>0)sp*=.4;p.curSp=p.moving?sp*Math.min(1,m):0;
  moveP(p,mx*sp*dt,my*sp*dt);
  if(p.jz>0){p.jv-=11*dt;p.jz+=p.jv*dt;if(p.jz<=0){p.jz=0;p.jv=0;ev({t:'step',p,land:1})}}
  p.ang=inp.aim;p.pitch=inp.pitch||0;
  if(p.moving&&p.jz<=0&&!p.crouch){p.stepT-=dt*sp;if(p.stepT<=0){p.stepT=1.7;ev({t:'step',p})}}
  p.cd-=dt;p.sw-=dt;p.flash-=dt;p.punch-=dt;p.hitT-=dt;p.slowT-=dt;p.revealT-=dt;p.firingT-=dt;p.shotT-=dt;p.skillT-=dt;p.landT-=dt;if(p.skillCD>0)p.skillCD-=dt;p.recoil=Math.max(0,p.recoil-dt*.08);
  for(const k in p.buff)if(p.buff[k]>0)p.buff[k]-=dt;
  p.histT-=dt;if(p.histT<=0){p.histT=.1;p.hist.push({x:p.x,y:p.y,z:p.z,lv:p.lv,hp:p.hp});if(p.hist.length>31)p.hist.shift()}
  if(p.rl>0){p.rl-=dt;if(p.rl<=0)finishReload(p)}
  if(p.healT>0){p.healT-=dt;if(p.healT<=0)finishHeal(p)}
  if(p.boost>0){p.boost=Math.max(0,p.boost-2.2*dt);if(p.hp<100)p.hp=Math.min(100,p.hp+(p.boost>60?1.6:1)*dt)}
  if(p.opening){const d=p.opening;if(p.moving||fire||d.opened||hyp(d.x-p.x,d.y-p.y)>2.6)p.opening=null;else{p.openT-=dt;if(p.openT<=0){openDrop(d,p);p.opening=null}}}
  if(fire&&w&&w.k==='minigun'&&w.mag>0)p.spin=Math.min(1,p.spin+dt/1.5);else p.spin=Math.max(0,p.spin-dt);
  if(w&&w.k==='rail'){if(fire&&w.mag>0&&p.cd<=0&&p.sw<=0&&!(p.buff.nofire>0)&&p.landT<=0){if(p.charge<=0){p.charge=1;ev({t:'sfx',k:'charge',x:p.x,y:p.y,p})}p.charge-=dt;if(p.charge<=.001){p.charge=0;fire_(p,w,inp);cancelHeal(p)}else p.charge=Math.max(p.charge,.001)}else p.charge=0}
  else if(fire&&p.sw<=0&&p.cd<=0&&!(p.buff.nofire>0)&&p.landT<=0){
    if(!w)punch(p);
    else if(p.rl<=0){if(w.mag>0){fire_(p,w,inp);if(p.healT>0)cancelHeal(p)}else if(!WD[w.k].special&&p.ammo[WD[w.k].ak]>0)startReload(p);
      else if(p===S.me&&!(p.noAmmo>0)){toast(WD[w.k].special?WD[w.k].n+' 탄이 다 떨어졌습니다':AMMO[WD[w.k].ak].n+' 탄약이 없습니다');p.noAmmo=1.5;ev({t:'sfx',k:'dry'})}}}
  if(p.noAmmo>0)p.noAmmo-=dt}
function moveP(p,dx,dy){
  if(p.lv>=0){const t=S.towers[p.lv];let nx=p.x+dx,ny=p.y+dy;const inR=ny>t.ramp.y0&&ny<t.ramp.y1;
    if(nx>t.x+t.s-.3&&inR){p.lv=-1;p.x=t.ramp.x0+.05;p.y=ny;p.onRamp=1;p.z=t.top;return}
    p.x=clamp(nx,t.x-t.s+.35,t.x+t.s-.35);p.y=clamp(ny,t.y-t.s+.35,t.y+t.s-.35);p.z=t.top;return}
  let nx=clamp(p.x+dx,p.r,W-p.r),ny=clamp(p.y+dy,p.r,W-p.r);
  for(const t of S.towers){const r=t.ramp;if(nx>r.x0-.02&&nx<r.x1&&ny>r.y0&&ny<r.y1){p.x=nx;p.y=ny;const k=clamp((r.x1-nx)/(r.x1-r.x0),0,1);p.z=t.z+k*(t.top-t.z);if(k>.96&&dx<0){p.lv=t.id;p.x=t.x+t.s-.45;p.z=t.top;p.onRamp=0}else p.onRamp=1;return}}
  p.onRamp=0;p.x=nx;p.y=ny;collide(p);collide(p);p.z=groundH(p.x,p.y)}
export function collide(p){if(p.lv>=0||p.onRamp)return;hQ(p.x-p.r-.2,p.y-p.r-.2,p.x+p.r+.2,p.y+p.r+.2,QB);
  for(const o of QB){if(o.platform)continue;if(p.jz>.4&&o.hh<1.15&&!o.wall)continue;
    if(o.k==='r'){const cx=clamp(p.x,o.x,o.x+o.w),cy=clamp(p.y,o.y,o.y+o.h),dx=p.x-cx,dy=p.y-cy,d2=dx*dx+dy*dy;
      if(d2<p.r*p.r){if(d2>1e-8){const d=Math.sqrt(d2);p.x+=dx/d*(p.r-d);p.y+=dy/d*(p.r-d)}
        else{const l=p.x-o.x,r2=o.x+o.w-p.x,t=p.y-o.y,b=o.y+o.h-p.y,mn=Math.min(l,r2,t,b);if(mn===l)p.x=o.x-p.r;else if(mn===r2)p.x=o.x+o.w+p.r;else if(mn===t)p.y=o.y-p.r;else p.y=o.y+o.h+p.r}}}
    else{const dx=p.x-o.x,dy=p.y-o.y,d=hyp(dx,dy),mn=p.r+o.r;if(d<mn&&d>1e-5){p.x=o.x+dx/d*mn;p.y=o.y+dy/d*mn}}}}
export function muzzle(p){return[p.x+Math.cos(p.ang)*.6+Math.cos(p.ang+Math.PI/2)*.18,p.y+Math.sin(p.ang)*.6+Math.sin(p.ang+Math.PI/2)*.18,muzzleZ(p)]}
function fire_(p,w,inp){const d=WD[w.k];w.mag--;p.revealT=2;p.shotT=.18;p.firingT=.25;
  if(p.buff.invis>0){p.buff.invis=0;p.buff.dash=0;p.buff.ambush=1.5;ev({t:'uncloak',p})}
  p.cd=d.rate*(w.k==='minigun'?(1-.55*p.spin):1);
  const[mx,my,mz]=muzzle(p);
  let dx,dy,dz;if(inp&&inp.aimPt){dx=inp.aimPt[0]-mx;dy=inp.aimPt[1]-my;dz=inp.aimPt[2]-mz}else{dx=Math.cos(p.ang);dy=Math.sin(p.ang);dz=Math.tan(p.pitch||0)}
  const L=hyp(dx,dy,dz)||1;dx/=L;dy/=L;dz/=L;
  let spr=d.spr*(p.moving?1.6:1)*(p.jz>0?2.5:1)*(p.ads?.45:1)*(p.crouch?.75:1)*(p.bot?1.25:1)+p.recoil*(p.ads?.5:1);if(p.buff.steady>0)spr=0;
  const amb=p.buff.ambush>0?1.5:1;p.buff.ambush=0;
  const n=d.pel||1;
  for(let i=0;i<n;i++){const a1=(Math.random()-.5)*2*spr,a2=(Math.random()-.5)*2*spr;
    const hx=-dy,hy=dx,hl=hyp(hx,hy)||1;let vx=dx+hx/hl*a1,vy=dy+hy/hl*a1,vz=dz+a2;const l2=hyp(vx,vy,vz);vx/=l2;vy/=l2;vz/=l2;
    const Ln=d.rng*(.95+Math.random()*.1);
    S.bullets.push({x:mx,y:my,z:mz,px:mx,py:my,pz:mz,vx:vx*d.sp,vy:vy*d.sp,vz:vz*d.sp,dmg:d.dmg*(i===0?amb:1),own:p,left:Ln,max:Ln,k:w.k,refl:false,flame:w.k==='flame',pierce:w.k==='rail',hitSet:w.k==='rail'?new Set():null})}
  if(!(p.buff.steady>0))p.recoil=Math.min(p.recoil+d.rec*.6,.07);
  ev({t:'shot',k:w.k,x:p.x,y:p.y,z:p.z,p,rec:d.rec})}
function punch(p){p.cd=.5;p.punch=.3;const fx=p.x+Math.cos(p.ang)*.7,fy=p.y+Math.sin(p.ang)*.7;
  for(const q of S.players){if(q===p||!q.alive||q.ph!=='ground')continue;if(hyp(q.x-fx,q.y-fy)<.6&&Math.abs(q.z-p.z)<1){hurt(q,11,p,'fist');break}}ev({t:'shot',k:'fist',x:p.x,y:p.y,z:p.z,p})}
function feedPush(txt,me){S.feed.unshift({txt,me,t:6});if(S.feed.length>4)S.feed.length=4;ev({t:'feed'})}
export function hurt(t,dmg,src,wk,zoneDmg,head){if(!t.alive)return;
  let mult=1;if(!zoneDmg){mult=(1-VEST[t.vest]);if(head)mult=1.8*(1-HELM[t.helm])}
  const real=dmg*mult;t.hp-=real;t.hitT=3;t.opening=null;
  if(!zoneDmg){t.flash=.1;ev({t:'hit',x:t.x,y:t.y,z:t.z+1.2,p:t,src,head})}
  if(t.ch==='chrono'&&!zoneDmg)t.buff.haste=1;
  if(t.buff.invis>0&&!zoneDmg){t.buff.invis=Math.min(t.buff.invis,.3)}
  if(t===S.me)ev({t:'hurt',zone:!!zoneDmg,src});
  if(src===S.me&&t!==S.me)ev({t:'num',x:t.x,y:t.y,z:t.z+1.9,v:Math.round(real),head});
  if(src&&src.ch==='volt'&&src!==t&&!zoneDmg&&wk!=='fist'&&wk!=='skill'){if(src.voltTgt===t)src.voltN++;else{src.voltTgt=t;src.voltN=1}if(src.voltN>=3){t.slowT=1.5;src.voltN=0;ev({t:'ring',x:t.x,y:t.y,z:t.z,r:1.2,c:CHARS.volt.c})}}
  if(wk==='flame')t.slowT=Math.max(t.slowT,.5);
  if(t.bot&&src&&src!==t&&src.alive){t.provoked=4;if(!t.tgt||!t.tgtVis){t.tgt=src;t.react=.25;t.lostT=0}}
  if(t.hp<=0)kill(t,src,wk,head)}
function kill(t,src,wk,head){if(t.dummy){t.alive=false;t.hp=0;t.deathT=S.gtime;t.respT=2.5;ev({t:'die',p:t,src,head});if(src&&src!==t){src.kills++;src.multiN=(src.multiT>S.gtime?(src.multiN||0):0)+1;src.multiT=S.gtime+8}feedPush((src?src.name:'')+' → '+t.name+(head?' (헤드)':''),true);if(src===S.me)ev({t:'kill',n:src.multiN});return}
  t.alive=false;t.hp=0;t.deathT=S.gtime;ev({t:'die',p:t,src,head});
  const drop=[];for(const w of t.w)if(w)drop.push(['w',w.k,0,w.mag]);
  for(const k in t.ammo)if(t.ammo[k]>0)drop.push(['a',k,t.ammo[k]]);for(const k in t.heal)if(t.heal[k]>0)drop.push(['h',k,t.heal[k]]);
  if(t.helm)drop.push(['ar','helm',t.helm]);if(t.vest)drop.push(['ar','vest',t.vest]);if(t.bag)drop.push(['bag','',t.bag]);if(t.mod)drop.push(['mod','',t.mod]);
  drop.forEach((d,i)=>{const a=i/drop.length*TAU,r=.6+(i%2)*.6;let x=t.x+Math.cos(a)*r,y=t.y+Math.sin(a)*r;if(solidAt(x,y)||(t.lv>=0)){x=t.x+Math.cos(a)*.4;y=t.y+Math.sin(a)*.4}addItem(d[0],d[1],d[2],x,y,d[3],null,t.z)});
  const by=wk==='zone'?'자기장':src?src.name:'자기장',how=wk==='zone'?'':wk==='fist'?'주먹':wk==='skill'?'스킬':WD[wk]?WD[wk].n:'';
  if(src&&src!==t&&wk!=='zone'){src.kills++;src.multiN=(src.multiT>S.gtime?(src.multiN||0):0)+1;src.multiT=S.gtime+8}
  feedPush(by+(how?' ['+how+(head?'·헤드':'')+'] ':' → ')+t.name,src===S.me||t===S.me);
  S.aliveN=S.players.filter(p=>p.alive).length;
  if(t===S.me){S.endT=2.5}else if(src===S.me){toast(t.name+' 처치'+(head?' (헤드샷)':''));ev({t:'kill',n:src.multiN})}
  if(S.aliveN===1&&S.me.alive){S.endT=2;S.won=true}}

/* ================= 봇 ================= */
function hasGun(b){for(const w of b.w)if(w&&(w.mag>0||(!WD[w.k].special&&b.ammo[WD[w.k].ak]>0)))return true;return false}
function botSlot(b,td){let best=2,br=0;for(let i=0;i<2;i++){const w=b.w[i];if(!w||(w.mag<=0&&(WD[w.k].special||b.ammo[WD[w.k].ak]<=0)))continue;
  let r=RANK[w.k];if(td<15&&FAM[w.k]==='near')r+=3;if(td>60&&FAM[w.k]!=='near')r+=1;if(r>br){br=r;best=i}}return best}
function wantItem(b,it){if(it.block===b.id)return 0;if(it.z>groundH(it.x,it.y)+2)return 0;
  if(it.k==='w'){if(!b.w[0]||!b.w[1])return 3;return RANK[it.s]>Math.min(RANK[b.w[0].k],RANK[b.w[1].k])?2:0}
  if(it.k==='a')return usesAmmo(b,it.s)&&fitN(b,AMMO[it.s].w)>5?2:0;
  if(it.k==='h')return b.heal[it.s]<HEAL[it.s].auto*2&&fitN(b,HEAL[it.s].w)>0?1:0;
  return it.n>b[it.k==='ar'?it.s:it.k]?2:0}
function zoneGoal(b){const z=S.zone,dn=hyp(b.x-z.cx,b.y-z.cy);if(dn>z.r-5)return{x:z.tx,y:z.ty,out:true};
  if(z.state!=='done'){const dt=hyp(b.x-z.tx,b.y-z.ty);if(dt>z.tr-4&&(z.state==='shrink'||z.t<22))return{x:z.tx,y:z.ty,out:false}}return null}
function nav(b,gx,gy){const tx=b.x+gx,ty=b.y+gy,bi=bldAt(b.x,b.y),gi=bldAt(tx,ty);
  const via=(bl,out)=>{let best=null,bd=1e9;for(const d of bl.doors){const s=hyp(d.ix-b.x,d.iy-b.y)+hyp(d.ox-tx,d.oy-ty);if(s<bd){bd=s;best=d}}if(!best)return null;
    const px=out?best.ix:best.ox,py=out?best.iy:best.oy,qx=out?best.ox:best.ix,qy=out?best.oy:best.iy;return hyp(px-b.x,py-b.y)<.8?[qx-b.x,qy-b.y]:[px-b.x,py-b.y]};
  let r=null;if(bi&&bi!==gi)r=via(bi,true);else if(gi&&bi!==gi)r=via(gi,false);return r||[gx,gy]}
function botThink(b,dt){
  b.thinkT-=dt;if(b.thinkT>0)return;const T=.2+Math.random()*.12;b.thinkT=T;
  if(b.provoked>0)b.provoked-=T;
  const w0=curW(b),view=b.provoked>0?VIEW*.8:(b.aggr+(w0&&WD[w0.k].scope?40:0))*clamp((S.gtime-25)/90,0,1);
  const cands=[];for(const p of[...S.players,...S.decoys]){if(p===b||!p.alive||p.owner===b||(p.ph&&p.ph!=='ground'))continue;const d=hyp(p.x-b.x,p.y-b.y);
    if(invisible(p)&&d>5)continue;if(d<view*(p.decoy?1:stealthed(p)?.5:1))cands.push([d,p])}
  cands.sort((a,c)=>a[0]-c[0]);let tgt=null,td=1e9;
  for(let i=0;i<cands.length&&i<4;i++){const[d,p]=cands[i];if(d>12&&!p.decoy&&inBush(p))continue;if(losClear(b.x,b.y,eyeZ(b),p.x,p.y,(p.z||0)+1.3)){tgt=p;td=d;break}}
  if(tgt){if(b.tgt!==tgt){b.tgt=tgt;b.react=.45+Math.random()*.6*(1.4-b.skill)}b.tgtVis=true;b.lostT=0;b.lsx=tgt.x;b.lsy=tgt.y}
  else if(b.tgt){b.tgtVis=false;b.lostT+=T;if(b.lostT>2.5||!b.tgt.alive||invisible(b.tgt))b.tgt=null}
  if(b.tgt&&!tgt)td=hyp(b.tgt.x-b.x,b.tgt.y-b.y);
  b.err=(Math.random()+Math.random()+Math.random()-1.5)*(.05-.035*b.skill);b.errZ=(Math.random()-.5)*(.9-.6*b.skill);
  const want=botSlot(b,td);if(want!==b.cur)b.in.sw=want;
  const w=curW(b),armed=hasGun(b),brawl=!armed&&b.provoked>0&&td<10;
  if(w&&!WD[w.k].special&&!b.tgtVis&&w.mag<WD[w.k].mag*.6&&b.ammo[WD[w.k].ak]>0&&b.rl<=0)b.in.reload=true;
  if(!b.tgtVis&&b.healT<=0){if(b.hp<45&&b.heal.medkit)b.in.use='medkit';else if(b.hp<70&&b.heal.bandage)b.in.use='bandage';else if(b.boost<40&&b.hp<95&&b.heal.drink)b.in.use='drink'}
  if(b.skillCD<=0&&w&&b.tgt&&b.tgtVis&&b.react<=.2){const f=FAM[w.k];let go=false;
    if(b.ch==='shadow')go=f==='far'?td>40:td<WD[w.k].rng*.6;else if(b.ch==='chrono')go=b.hp<40;else if(b.ch==='psy')go=f==='near'?td<18:(b.hitT>2||td<30);
    else if(b.ch==='volt'){if(f==='near'&&td<14){go=true;b.blinkDir=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x)}else if(f==='mid'&&td<20){go=true;b.blinkDir=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x)}else if(b.hp<45){go=true;b.blinkDir=Math.atan2(b.y-b.tgt.y,b.x-b.tgt.x)}}
    if(go)b.in.skill=true}
  b.crouchWant=b.tgtVis&&w&&FAM[w.k]!=='near'&&td>25&&Math.random()<.5;
  const zg=zoneGoal(b);let gx=0,gy=0;const moved=hyp(b.x-b.lx,b.y-b.ly);b.lx=b.x;b.ly=b.y;
  if(b.opening){gx=gy=0}
  else if(b.unstick>0){b.unstick-=T;gx=Math.cos(b.uang);gy=Math.sin(b.uang)}
  else if(zg&&(zg.out||!b.tgtVis)){gx=zg.x-b.x;gy=zg.y-b.y}
  else if(b.tgt&&b.tgtVis&&armed){const dx=(b.tgt.x-b.x)/td,dy=(b.tgt.y-b.y)/td;if(Math.random()<.12)b.sdir*=-1;const pref=w?PREF[w.k]:8,ap=clamp((td-pref)/10,-1,1);gx=-dy*b.sdir*.8+dx*ap;gy=dx*b.sdir*.8+dy*ap}
  else if(b.tgt&&b.tgtVis&&brawl){if(b.hp>35){gx=b.tgt.x-b.x;gy=b.tgt.y-b.y}else{gx=b.x-b.tgt.x;gy=b.y-b.tgt.y}}
  else if(b.tgt&&b.lostT<2.5&&armed){gx=b.lsx-b.x;gy=b.lsy-b.y}
  else{let dropG=null;if(armed)for(const d of S.drops){if(d.landed&&!d.opened&&hyp(d.x-b.x,d.y-b.y)<140){dropG=d;break}}
    if(dropG){if(hyp(dropG.x-b.x,dropG.y-b.y)<1.9){b.in.open=true;gx=gy=0}else{gx=dropG.x-b.x;gy=dropG.y-b.y}}
    else{if(!b.goal||!b.goal.alive||wantItem(b,b.goal)===0||Math.random()<.05){b.goal=null;let bs=1e9;
        for(const it of S.items){const d=hyp(it.x-b.x,it.y-b.y);if(d>90)continue;const v=wantItem(b,it);if(!v)continue;const s=d/v;if(s<bs){bs=s;b.goal=it}}}
      if(b.goal){gx=b.goal.x-b.x;gy=b.goal.y-b.y}
      else{const z=S.zone;b.wpT-=T;if(!b.wp||b.wpT<=0||hyp(b.wp.x-b.x,b.wp.y-b.y)<3){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*Math.min(z.tr,z.r)*.7;
          b.wp={x:clamp(z.tx+Math.cos(a)*r,30,W-30),y:clamp(z.ty+Math.sin(a)*r,30,W-30)};b.wpT=8+Math.random()*8}
        gx=b.wp.x-b.x;gy=b.wp.y-b.y}}}
  if(b.healT>0&&!zg){gx=gy=0}
  if((gx||gy)&&b.unstick<=0)[gx,gy]=nav(b,gx,gy);
  const gm=hyp(gx,gy);if(gm>1e-3){gx/=gm;gy/=gm}
  if(gm>.5){const d=nearDoor(b);if(d&&!d.open&&hyp(d.cx-b.x,d.cy-b.y)<1.4)b.in.door=true}
  if(gm>.5&&b.unstick<=0&&moved<T*4.7*.2){b.stuckT+=T;if(b.stuckT>.5){b.unstick=.5+Math.random()*.4;b.uang=Math.atan2(gy,gx)+(Math.random()<.5?1:-1)*(1+Math.random());b.stuckT=0;b.goal=null}}else b.stuckT=0;
  if(gm<=.5&&b.goal){gx=gy=0}
  b.mvx=gx;b.mvy=gy}
function botInput(b,dt){botThink(b,dt);
  const inp={mx:b.mvx,my:b.mvy,aim:b.ang,pitch:0,fire:false,reload:b.in.reload,use:b.in.use,sw:b.in.sw,skill:b.in.skill,open:b.in.open,door:b.in.door,crouchT:!!b.crouchWant!==b.crouch,ads:false,sprint:!b.tgtVis&&hyp(b.mvx,b.mvy)>.5};b.in={};
  if(b.opening){inp.mx=inp.my=0;inp.open=false}
  if(b.tgt&&b.tgt.alive){const d=hyp(b.tgt.x-b.x,b.tgt.y-b.y),a=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x)+b.err,da=angDiff(a,b.ang);b.ang+=clamp(da,-6*dt,6*dt);inp.aim=b.ang;b.react-=dt;
    const tz=(b.tgt.z||0)+(b.tgt.crouch?.9:1.25)+b.errZ;inp.aimPt=[b.tgt.x+Math.cos(b.ang+Math.PI/2)*b.err*d,b.tgt.y+Math.sin(b.ang+Math.PI/2)*b.err*d,tz];
    if(b.tgtVis&&b.react<=0){const w=curW(b);if(w){if(d<Math.min(WD[w.k].rng*.85,VIEW)&&Math.abs(da)<.25){inp.fire=true;inp.ads=d>30}}else if(d<1.6&&b.provoked>0)inp.fire=true}}
  else if(hyp(b.mvx,b.mvy)>.1){const a=Math.atan2(b.mvy,b.mvx);b.ang+=clamp(angDiff(a,b.ang),-5*dt,5*dt);inp.aim=b.ang}
  return inp}

/* ================= 한 틱 ================= */
export function step(dt,human){
  S.gtime+=dt;const me=S.me;
  if(!S.plane.done)updPlane(dt);
  if(human&&human.jumpPlane&&me.ph==='plane')jump(me);
  if(S.mode!=='train'){updZone(dt);updDrops(dt)}
  for(const p of S.players){if(p.dummy){updDummy(p,dt);continue}if(!p.alive)continue;
    if(p.ph==='plane')continue;
    if(p.ph==='fall'||p.ph==='chute'){updAir(p,p===me?human:{mx:0,my:0},dt);continue}
    if(p===me){applyInput(p,human,dt);autoPickup(p)}
    else{applyInput(p,botInput(p,dt),dt);autoPickup(p)}}
  const P=S.players;
  for(let i=0;i<P.length;i++){const a=P[i];if(!a.alive||a.ph!=='ground')continue;for(let j=i+1;j<P.length;j++){const b=P[j];if(!b.alive||b.ph!=='ground'||Math.abs(a.z-b.z)>1.5)continue;
    const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy);if(d<.8&&d>1e-4){const o=(.8-d)/2;a.x-=dx/d*o;a.y-=dy/d*o;b.x+=dx/d*o;b.y+=dy/d*o}}}
  for(let i=S.decoys.length-1;i>=0;i--){const d=S.decoys[i];d.t-=dt;if(d.t<=0)d.alive=false;if(!d.alive)S.decoys.splice(i,1)}
  for(let i=S.barriers.length-1;i>=0;i--){const b=S.barriers[i];b.t-=dt;if(b.t<=0)S.barriers.splice(i,1)}
  for(let i=S.fields2.length-1;i>=0;i--){const f=S.fields2[i];f.t-=dt;f.acc+=dt;if(f.t<=0){S.fields2.splice(i,1);continue}
    const tick=f.acc>=.5;if(tick)f.acc=0;for(const q of S.players){if(q===f.owner||!q.alive||q.ph!=='ground')continue;if(hyp(q.x-f.x,q.y-f.y)<f.r){q.slowT=Math.max(q.slowT,.3);if(tick)hurt(q,4,f.owner,'skill')}}}
  for(let i=S.stops.length-1;i>=0;i--){const s=S.stops[i];s.t-=dt;if(s.t<=0){for(const b of s.held)b.dead=true;S.stops.splice(i,1)}}
  updBullets(dt);
  for(const f of S.feed)f.t-=dt;if(S.feed.length&&S.feed[S.feed.length-1].t<=0){S.feed.pop();ev({t:'feed'})}
  if(S.endT>0){S.endT-=dt;if(S.endT<=0){S.over=true;ev({t:'end',win:S.won})}}}
function updBullets(dt){const B=S.bullets;
  for(let i=B.length-1;i>=0;i--){const b=B[i];if(b.dead){B.splice(i,1);continue}if(b.frozen)continue;
    b.px=b.x;b.py=b.y;b.pz=b.z;const sp=hyp(b.vx,b.vy,b.vz),dist=sp*dt,n=Math.max(1,Math.ceil(dist/.5));let dead=false;
    for(let s=0;s<n&&!dead;s++){const ox=b.x,oy=b.y,oz=b.z;b.x+=b.vx*dt/n;b.y+=b.vy*dt/n;b.z+=b.vz*dt/n;b.left-=dist/n;
      if(b.left<=0||b.x<0||b.y<0||b.x>W||b.y>W){dead=true;break}
      let froze=false;for(const st of S.stops){if(b.own===st.owner)continue;if(hyp(b.x-st.x,b.y-st.y)<st.r){b.frozen=true;st.held.push(b);froze=true;break}}if(froze)break;
      for(const br of S.barriers){const s0=(ox-br.x)*br.nx+(oy-br.y)*br.ny,s1=(b.x-br.x)*br.nx+(b.y-br.y)*br.ny;if(s0*s1>0)continue;
        const f=s0/(s0-s1||1e-6),ix=ox+(b.x-ox)*f,iy=oy+(b.y-oy)*f,iz=oz+(b.z-oz)*f,al=(ix-br.x)*-br.ny+(iy-br.y)*br.nx;if(Math.abs(al)>br.len/2||iz>br.z+2.6||iz<br.z-.2)continue;
        if(b.own===br.owner&&br.fam==='far')continue;
        if(br.fam==='mid'&&b.own!==br.owner&&!b.refl){const dot=b.vx*br.nx+b.vy*br.ny;b.vx-=2*dot*br.nx;b.vy-=2*dot*br.ny;b.own=br.owner;b.dmg*=.6;b.refl=true;b.left=Math.max(b.left,60);const sg=Math.sign(-s0||1);b.x=ix+br.nx*sg*.15;b.y=iy+br.ny*sg*.15;ev({t:'spark',x:ix,y:iy,z:iz,c:CHARS.psy.c,m:'shield'});break}
        dead=true;ev({t:'spark',x:ix,y:iy,z:iz,c:CHARS.psy.c,m:'shield'});break}
      if(dead)break;
      if(b.z<groundH(b.x,b.y)){dead=true;if(!b.flame)ev({t:'spark',x:b.x,y:b.y,z:b.z,c:'#b89a6a',m:'dirt'});break}
      const o=solidAt3(b.x,b.y,b.z);if(o&&!(b.pierce&&o.trunk)&&!o.thin){dead=true;if(!b.flame)ev({t:'spark',x:ox,y:oy,z:oz,c:o.trunk?'#8a5a2a':o.wall?'#e8d9b8':o.door?'#a66a36':o.prop?'#c9d0da':'#dfe3ea',m:o.trunk||o.door?'wood':o.wall||o.rock?'stone':'metal'});break}
      for(const p of S.players){if(!p.alive||p===b.own||p.ph!=='ground')continue;if(b.hitSet&&b.hitSet.has(p))continue;const dx=p.x-b.x,dy=p.y-b.y,r=p.r+.08;if(dx*dx+dy*dy>r*r)continue;
        const top=p.z+(p.crouch?PH_C:PH_H)+p.jz,bot=p.z+p.jz;if(b.z<bot||b.z>top)continue;
        const head=b.z>top-.32;const dmg=b.k==='shotgun'?b.dmg*(.45+.55*b.left/b.max):b.dmg;hurt(p,dmg,b.own,b.k,false,head);if(b.hitSet)b.hitSet.add(p);else dead=true;break}
      if(dead)break}
    if(dead)B.splice(i,1)}}
