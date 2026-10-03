import {gearStat,awardCoins} from './adventure.js?v=0.6.0';
import {directionNames} from './input.js?v=0.6.0';
import {canStand,elevationAt} from './world.js?v=0.6.0';
export const direction=face=>{const a=directionNames.indexOf(face)*Math.PI/4;return {x:Math.cos(a),y:Math.sin(a)}};
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const samePlane=(a,b)=>a.level===b.level&&Math.abs(elevationAt(a.x,a.y,a.level)-elevationAt(b.x,b.y,b.level))<18;
export function inArc(a,b,range=64,cone=.35){const d=distance(a,b),v=direction(a.face);return samePlane(a,b)&&d<range&&(d<1||((b.x-a.x)*v.x+(b.y-a.y)*v.y)/d>cone)}
// Sample the logical floor, never projected screen coordinates, including on ramps.
export function clearLine(a,b){
  if(!samePlane(a,b))return false;
  const n=Math.ceil(distance(a,b)/4);
  for(let i=1;i<=n;i++)if(!canStand(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,a.level,1))return false;
  return true;
}
export function clearPath(g,a,b){
  if(!(g.clearLine?.(a,b)??clearLine(a,b)))return false;
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  return !g.crates.some(c=>{
    if(c===a||c===b||!samePlane(c,a))return false;
    const t=length?Math.max(0,Math.min(1,((c.x-a.x)*dx+(c.y-a.y)*dy)/length)):0;
    return Math.hypot(c.x-a.x-t*dx,c.y-a.y-t*dy)<c.r;
  });
}
export function spend(g,n){n*=gearStat(g,'staminaCost')||1;if(g.equipment.stamina<n)return false;g.equipment.stamina-=n;g.regenDelay=.65;return true}
export function hitEnemy(g,e,damage,source){
  if(e.hp<=0||e.hurt>0)return false;
  e.hp-=damage;e.hurt=.24;e.windup=0;e.cooldown=.65;
  const d=distance(e,source)||1;g.moveBody(e,(e.x-source.x)/d*20,(e.y-source.y)/d*20);
  g.effects.push({...e,kind:'impact',life:.22});
  if(e.hp<=0){g.defeated.add(e.id);awardCoins(g,3);g.equipment.arrows=Math.min(30,g.equipment.arrows+3);g.needsSave=true;g.notice('Trail cleared · Recovered 3 arrows.');}
  return true;
}
export function hurtPlayer(g,source,damage=1,blockable=true){
  const p=g.player;if(p.hurt>0||!samePlane(p,source))return;
  if(blockable&&p.blocking&&inArc(p,source,90,.45)&&spend(g,24)){g.effects.push({...p,kind:'guard',life:.25});return;}
  p.blocking=false;p.hp-=Math.max(1,damage-gearStat(g,'defense'));p.hurt=1.2;p.attack=0;g.swing=null;g.aiming=false;g.heldObject=null;g.needsSave=true;
  const d=distance(p,source)||1;g.moveBody(p,(p.x-source.x)/d*24,(p.y-source.y)/d*24);
  if(p.hp<=0)g.respawn();
}
export function updateCombat(g,dt,input){
  const p=g.player,eq=g.equipment;
  if(input.consume('attack')&&!p.blocking&&!g.aiming){
    if(g.swing&&g.swing.age>.16)g.swing.queued=true;
    else if(p.cooldown<=0)startSwing(g,g.comboTime>0?(g.combo%3)+1:1);
  }
  g.comboTime=Math.max(0,g.comboTime-dt);
  if(g.swing){const s=g.swing;s.age+=dt;p.attack=Math.max(0,.38-s.age);
    if(s.age>=.09&&s.age<=.22){for(const e of g.enemies)if(!s.hits.has(e.id)&&inArc({...p,face:s.face},e,64,s.combo===3?-.05:.35)&&clearPath(g,p,e)){
      if(hitEnemy(g,e,(s.combo===3&&eq.sword>0?2:1)+(eq.sword>0?gearStat(g,'attack'):0),p)){s.hits.add(e.id);if(eq.sword>0)eq.sword--;g.needsSave=true;}
    }}
    if(s.age>=.38){g.swing=null;g.comboTime=.32;if(s.queued)startSwing(g,(s.combo%3)+1);}
  }
  for(const a of g.projectiles){a.life-=dt;const steps=Math.ceil(360*dt/4);for(let i=0;i<steps&&a.life>0;i++){
    const old={...a};a.x+=a.dx*360*dt/steps;a.y+=a.dy*360*dt/steps;
    if(!(g.clearLine?.(old,a)??clearLine(old,a))||g.crates.some(c=>samePlane(c,a)&&distance(c,a)<c.r)){a.life=0;break;}
    const target=g.enemies.find(e=>e.hp>0&&samePlane(e,a)&&distance(e,a)<14);
    if(target){hitEnemy(g,target,2,a);a.life=0;}
  }}g.projectiles=g.projectiles.filter(a=>a.life>0);
  for(const e of g.enemies){
    if(e.hp<=0)continue;e.time+=dt;e.hurt=Math.max(0,e.hurt-dt);e.cooldown=Math.max(0,e.cooldown-dt);e.frozen=Math.max(0,(e.frozen||0)-dt);
    if(e.frozen>0||e.hurt>0){e.state='idle';continue;}
    const sees=samePlane(e,p)&&distance(e,p)<230&&distance(e,e.home)<300&&clearPath(g,e,p);
    if(e.windup>0){e.windup-=dt;e.state='attack';if(e.windup<=0){if(inArc(e,p,43,.35)&&clearPath(g,e,p))hurtPlayer(g,e);e.cooldown=.85;}continue;}
    const target=sees?p:e.home,d=distance(e,target);e.mode=sees?'approach':'return';
    if(sees&&d<37&&e.cooldown<=0){e.face=faceToward(e,p);e.windup=.42;e.mode='windup';continue;}
    e.state=d>16?'walk':'idle';if(d>16){e.face=faceToward(e,target);g.moveBody(e,(target.x-e.x)/d*(sees?70:48)*dt,(target.y-e.y)/d*(sees?70:48)*dt);}
  }
}
function faceToward(a,b){return directionNames[(Math.round(Math.atan2(b.y-a.y,b.x-a.x)/(Math.PI/4))+8)%8]}
function startSwing(g,combo){if(!spend(g,combo===3?14:9))return;g.combo=combo;g.swing={age:0,face:g.player.face,combo,hits:new Set(),queued:false};g.player.attack=.38;g.player.cooldown=.38;if(g.equipment.sword===0)g.notice('Practice blade worn · Rest at a stone to repair it.');}
