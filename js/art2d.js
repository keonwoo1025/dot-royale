import {S,W,TS,TN,G,DG,SA,WA,RO,FL,TAU,hash2,WD,AMMO,LVC,RARC,hyp} from './logic.js';
export const OUT='#1b1330';
export function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
export function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function circ(p,x,y,r){p.moveTo(x+r,y);p.arc(x,y,r,0,TAU)}

/* ---------- 아이콘 ---------- */
function drawGun(g,k){g.lineWidth=.6;g.strokeStyle=OUT;const dk='#454a57',wd='#b0763c',p=(x,y,w,h,c)=>{g.fillStyle=c;rr(g,x,y,w,h,.6);g.fill();g.stroke()};
  if(k==='pistol'){p(0,-1.1,5.4,2.2,dk);p(.6,.6,1.7,2.4,dk)}
  else if(k==='smg'){p(0,-1.3,7,2.6,dk);p(2.6,.9,1.6,3,dk);p(7,-.6,1.8,1.2,dk)}
  else if(k==='shotgun'){p(-2.6,-1.2,3,2.4,wd);p(0,-1.1,9,2.2,dk);p(4.6,.9,3.2,1.3,wd)}
  else if(k==='ar'){p(-2.6,-1.1,2.8,2.3,dk);p(0,-1.4,8,2.8,dk);p(3,1.1,1.8,3,dk);p(8,-.6,2.6,1.2,dk)}
  else if(k==='dmr'){p(-2.8,-1.2,3.2,2.4,wd);p(0,-1.1,9.6,2.2,dk);p(2,-2.8,4,1.7,'#2a2d36');p(9.6,-.5,1.8,1,dk)}
  else if(k==='sniper'){p(-3,-1.3,3.6,2.6,wd);p(0,-1,11.4,2,dk);p(2.4,-2.9,5,1.8,'#2a2d36');p(11.4,-.5,1.8,1,dk)}
  else if(k==='flame'){p(-2,-1.6,3,3.2,'#c0392b');p(1,-1.2,6,2.4,dk);p(7,-.8,4,1.6,'#555');p(2,1.2,3,2.6,'#ff8a3d')}
  else if(k==='minigun'){p(-2,-2,4,4,dk);for(let i=-1;i<=1;i++)p(2,i*1.1-.5,10,1,'#6b7280');p(10,-1.8,1.2,3.6,'#2a2d36')}
  else if(k==='rail'){p(-3,-1.3,4,2.6,'#2a2d36');p(1,-1.6,10,3.2,'#3b4a66');p(2,-.5,9,1,'#4ff0ff');p(11,-.8,2.6,1.6,'#2a2d36')}
  if(WD[k])g.fillStyle=RARC[WD[k].rar],g.fillRect(1.2,-.35,2,.7)}
export function drawIcon(g,key){g.lineJoin='round';g.lineWidth=1.6;g.strokeStyle=OUT;const f=(c)=>{g.fillStyle=c;g.fill();g.stroke()};
  if(key.startsWith('w_')){const k=key.slice(2),L={pistol:6.5,smg:10,shotgun:13,ar:14,dmr:14,sniper:16,flame:13,minigun:14,rail:16}[k];const s=24/(L+3);g.save();g.translate(16-(L/2-1.5)*s,17);g.scale(s,s);drawGun(g,k);g.restore();return}
  if(key.startsWith('a_')){const c=AMMO[key.slice(2)].c;rr(g,5,17,22,11,2.5);f('#7a6440');for(let i=0;i<3;i++){rr(g,8+i*6,6,4.4,12,2);f(c)}g.fillStyle='rgba(255,255,255,.35)';g.fillRect(6.5,19,19,2);return}
  if(key==='h_bandage'){rr(g,5,9,22,15,4);f('#f6eedb');g.fillStyle='#e0cfa6';g.fillRect(10,10,2,13);g.fillRect(20,10,2,13);g.fillStyle='#ff5a5a';g.fillRect(14,13,4,7);g.fillRect(12.5,14.5,7,4);return}
  if(key==='h_medkit'){g.beginPath();g.moveTo(12,8);g.lineTo(12,5);g.lineTo(20,5);g.lineTo(20,8);g.stroke();rr(g,4,8,24,19,4);f('#ffffff');g.fillStyle='#ff4a4a';g.fillRect(13.5,11,5,13);g.fillRect(9.5,15,13,5);return}
  if(key==='h_drink'){rr(g,9,4,14,24,4);f('#3d8bff');g.fillStyle='#ffd34d';g.fillRect(10,12,12,7);g.fillStyle='#d8dde6';g.fillRect(10,5,12,3);g.fillStyle='#fff';g.beginPath();g.moveTo(17,13);g.lineTo(14,16.5);g.lineTo(16.5,16.5);g.lineTo(15,19);g.lineTo(18.5,15);g.lineTo(16,15);g.closePath();g.fill();return}
  if(key.startsWith('ar_helm')){const lv=+key.slice(-1);g.beginPath();g.arc(16,19,11,Math.PI,0);g.closePath();f(LVC[lv]);rr(g,3,18,26,5,2.5);f(LVC[lv]);g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(11.5,13,3,2,-.5,0,TAU);g.fill();return}
  if(key.startsWith('ar_vest')){const lv=+key.slice(-1);g.beginPath();g.moveTo(8,5);g.lineTo(13,5);g.lineTo(16,9);g.lineTo(19,5);g.lineTo(24,5);g.lineTo(27,11);g.lineTo(26,28);g.lineTo(6,28);g.lineTo(5,11);g.closePath();f(LVC[lv]);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(9,17);g.lineTo(23,17);g.moveTo(9,22);g.lineTo(23,22);g.stroke();return}
  if(key.startsWith('bag')){const lv=+key.slice(-1);g.beginPath();g.moveTo(11,8);g.quadraticCurveTo(16,1,21,8);g.stroke();rr(g,6,7,20,22,6);f(['','#b07a45','#4f8a5a','#3a3350'][lv]);rr(g,10,17,12,8,3);f('rgba(0,0,0,.18)');return}
  if(key.startsWith('mod')){const lv=+key.slice(-1);g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;i?g.lineTo(16+Math.cos(a)*12,16+Math.sin(a)*12):g.moveTo(16+Math.cos(a)*12,16+Math.sin(a)*12)}g.closePath();f('#7a4fe0');
    rr(g,11,10,10,10,2);f('#c9a8ff');g.fillStyle=OUT;for(let i=0;i<lv;i++){g.beginPath();g.arc(12+i*4,25,1.5,0,TAU);g.fill()}return}}
const ICON={},URL_={};
export function iconCanvas(key,px=128){const k=key+'@'+px;let c=ICON[k];if(!c){c=mk(px,px);const g=c.getContext('2d');g.scale(px/32,px/32);drawIcon(g,key);ICON[k]=c}return c}
export function iconURL(key){if(!URL_[key])URL_[key]=iconCanvas(key,64).toDataURL();return URL_[key]}

/* ---------- 지형 청크 텍스처 ---------- */
export const CH=200;
export function paintChunk(ix,iy,px){
  const cv=mk(px,px),g=cv.getContext('2d'),R=px/CH,ox=ix*CH,oy=iy*CH,type=S.type;
  g.setTransform(R,0,0,R,-ox*R,-oy*R);
  g.fillStyle='#6fcd46';g.fillRect(ox,oy,CH,CH);
  const c0=Math.max(0,Math.floor(ox/TS)-3),c1=Math.min(TN-1,Math.floor((ox+CH)/TS)+3),r0=Math.max(0,Math.floor(oy/TS)-3),r1=Math.min(TN-1,Math.floor((oy+CH)/TS)+3);
  const P={dg:new Path2D(),se:new Path2D(),s:new Path2D(),wd:new Path2D(),we:new Path2D(),w:new Path2D(),re:new Path2D(),r:new Path2D()};
  for(let ty=r0;ty<=r1;ty++)for(let tx=c0;tx<=c1;tx++){const t=type[ty*TN+tx],x=tx*TS+2,y=ty*TS+2;
    if(t===DG)circ(P.dg,x,y,3.9);
    if(t===SA||t===WA){circ(P.se,x,y,4.8);circ(P.s,x,y,4.1)}
    if(t===WA){circ(P.we,x,y,3.7);circ(P.w,x,y,3.0);
      let deep=true;for(let k=-3;k<=3&&deep;k++)for(let j=-3;j<=3;j++){const tt=type[clampi(ty+k)*TN+clampi(tx+j)];if(tt!==WA){deep=false;break}}if(deep)circ(P.wd,x,y,3.4)}
    if(t===RO){circ(P.re,x,y,4.3);circ(P.r,x,y,3.5)}}
  g.fillStyle='#5fbb3c';g.fill(P.dg);g.fillStyle='#d6b76a';g.fill(P.se);g.fillStyle='#f3df9c';g.fill(P.s);
  g.fillStyle='#2a95c9';g.fill(P.we);g.fillStyle='#46c4ee';g.fill(P.w);g.fillStyle='#34a9dc';g.fill(P.wd);
  g.fillStyle='#bba27a';g.fill(P.re);g.fillStyle='#d9c69d';g.fill(P.r);
  for(let ty=r0+3;ty<=r1-3;ty++)for(let tx=c0+3;tx<=c1-3;tx++){const t=type[ty*TN+tx],h=hash2(tx,ty),x=tx*TS+2,y=ty*TS+2;
    if((t===G||t===DG)&&h<.08){g.strokeStyle=t===G?'#5ea83e':'#57a038';g.lineWidth=.6;g.lineCap='round';g.beginPath();g.moveTo(x-1.4,y-1.4);g.lineTo(x,y+.5);g.lineTo(x+1.4,y-1.4);g.stroke()}
    else if(t===G&&h<.092){g.fillStyle=['#fff3a8','#ff9ec4','#ffffff','#c9a2ff'][(h*1000|0)%4];g.beginPath();g.arc(x,y,.8,0,TAU);g.fill()}
    else if(t===WA&&h<.025){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.5;g.beginPath();g.moveTo(x-2,y);g.lineTo(x+2,y);g.stroke()}
    else if(t===RO&&h<.06){g.fillStyle='#a88f66';g.beginPath();g.arc(x,y,.6,0,TAU);g.fill()}}
  for(const b of S.buildings){if(b.x>ox+CH||b.x+b.w<ox||b.y>oy+CH||b.y+b.h<oy)continue;
    g.fillStyle='#d9b684';g.fillRect(b.x,b.y,b.w,b.h);g.strokeStyle='#c49f6c';g.lineWidth=.5;
    for(let yy=b.y+5;yy<b.y+b.h;yy+=5){g.beginPath();g.moveTo(b.x,yy);g.lineTo(b.x+b.w,yy);g.stroke()}
    for(let yy=b.y;yy<b.y+b.h;yy+=5){const off=((yy/5|0)%3)*9;for(let xx=b.x+off;xx<b.x+b.w;xx+=27){g.beginPath();g.moveTo(xx,yy);g.lineTo(xx,yy+5);g.stroke()}}}
  for(const p of S.props)if(p.big){if(p.x+p.sw<ox||p.x-p.sw>ox+CH||p.y+p.sd<oy||p.y-p.sd>oy+CH)continue;g.fillStyle='#b9b2a6';rr(g,p.x-p.sw/2-3,p.y-p.sd/2-3,p.sw+6,p.sd+6,2);g.fill()}
  return cv}
const clampi=v=>v<0?0:v>=TN?TN-1:v;

/* ---------- 지도 ---------- */
export let mapBg=null;
export function buildMapBg(){mapBg=mk(TN,TN);const g=mapBg.getContext('2d'),img=g.createImageData(TN,TN),d=img.data;
  const C={[G]:[120,200,80],[DG]:[105,184,69],[SA]:[243,223,156],[WA]:[70,196,238],[RO]:[217,198,157],[FL]:[217,182,132]};
  for(let i=0;i<TN*TN;i++){const c=C[S.type[i]];d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255}g.putImageData(img,0,0);
  g.fillStyle='rgba(40,110,45,.55)';for(const t of S.trees){g.beginPath();g.arc(t.x/4,t.y/4,t.r/4,0,TAU);g.fill()}
  for(const p of S.props)if(p.big){g.fillStyle='#8f8a80';g.fillRect((p.x-p.sw/2)/4,(p.y-p.sd/2)/4,p.sw/4,p.sd/4)}
  for(const b of S.buildings){g.fillStyle=b.roof;g.fillRect(b.x/4,b.y/4,b.w/4,b.h/4);g.strokeStyle=OUT;g.lineWidth=.8;g.strokeRect(b.x/4,b.y/4,b.w/4,b.h/4)}}
function drawZoneOn(g,k,ox,oy,gt){const z=S.zone,me=S.me;if(!z)return;g.save();g.beginPath();g.rect(-9999,-9999,99999,99999);g.arc((z.cx-ox)*k,(z.cy-oy)*k,Math.max(z.r*k,.5),0,TAU,true);g.fillStyle='rgba(70,110,255,.38)';g.fill('evenodd');
  g.strokeStyle='#c9d8ff';g.lineWidth=2;g.beginPath();g.arc((z.cx-ox)*k,(z.cy-oy)*k,Math.max(z.r*k,.5),0,TAU);g.stroke();
  if(z.state!=='done'){g.strokeStyle='#fff';g.setLineDash([4,4]);g.beginPath();g.arc((z.tx-ox)*k,(z.ty-oy)*k,Math.max(z.tr*k,.5),0,TAU);g.stroke();g.setLineDash([]);
    if(me&&me.alive&&me.ph==='ground'&&hyp(me.x-z.tx,me.y-z.ty)>z.tr){g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.5;g.beginPath();g.moveTo((me.x-ox)*k,(me.y-oy)*k);g.lineTo((z.tx-ox)*k,(z.ty-oy)*k);g.stroke()}}
  for(const d of S.drops){if(d.opened)continue;if(!d.landed&&Math.sin(gt*8)<0)continue;const x=(d.x-ox)*k,y=(d.y-oy)*k;g.fillStyle='#ff4a4a';g.strokeStyle='#fff';g.lineWidth=2;g.fillRect(x-5,y-5,10,10);g.strokeRect(x-5,y-5,10,10)}
  const pl=S.plane;if(pl&&!pl.done){g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;g.setLineDash([6,5]);g.beginPath();g.moveTo((pl.x0-ox)*k,(pl.y0-oy)*k);g.lineTo((pl.x1-ox)*k,(pl.y1-oy)*k);g.stroke();g.setLineDash([]);
    g.save();g.translate((pl.x-ox)*k,(pl.y-oy)*k);g.rotate(pl.ang);g.fillStyle='#fff';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.moveTo(9,0);g.lineTo(-6,-7);g.lineTo(-3,0);g.lineTo(-6,7);g.closePath();g.fill();g.stroke();g.restore()}
  g.restore()}
function drawMe(g,x,y,s,a){g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#5dff7a';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.moveTo(s,0);g.lineTo(-s*.7,-s*.7);g.lineTo(-s*.3,0);g.lineTo(-s*.7,s*.7);g.closePath();g.fill();g.stroke();g.restore()}
export function drawBigMap(g,S2,gt){g.imageSmoothingEnabled=false;g.drawImage(mapBg,0,0,S2,S2);g.imageSmoothingEnabled=true;const k=S2/W;
  g.font=`${Math.max(12,Math.round(S2/28))}px 'Jua',sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle=OUT;
  for(const t of S.towns){g.strokeText(t.name,t.x*k,t.y*k);g.fillStyle='#fff8e8';g.fillText(t.name,t.x*k,t.y*k)}
  drawZoneOn(g,k,0,0,gt);const me=S.me;if(me&&me.alive&&me.ph!=='plane')drawMe(g,me.x*k,me.y*k,Math.max(7,S2/60),me.ang)}
export function drawMini(g,Sz,gt){const me=S.me,span=me.ph==='ground'?560:1100,k=Sz/span,cx=me.ph==='plane'?S.plane.x:me.x,cy=me.ph==='plane'?S.plane.y:me.y,ox=Math.max(0,Math.min(W-span,cx-span/2)),oy=Math.max(0,Math.min(W-span,cy-span/2));
  g.fillStyle='#46c4ee';g.fillRect(0,0,Sz,Sz);g.imageSmoothingEnabled=false;g.drawImage(mapBg,ox/4,oy/4,span/4,span/4,0,0,Sz,Sz);drawZoneOn(g,k,ox,oy,gt);if(me.ph!=='plane')drawMe(g,(me.x-ox)*k,(me.y-oy)*k,9,me.ang)}
