import {shrines,spawn,canStand} from './world.js?v=0.5.0';
import {shrineDefinitions} from './shrines.js?v=0.5.0';

// Progression is independent of room geometry and presentation.
export const freshJourney=()=>({discovered:['start'],treasures:[],health:0,stamina:0});
export const destinations=[
  {id:'start',name:'Starting rest stone',...spawn},
  {id:'tower',name:'Plateau Tower',x:800,y:374,level:1},
  {id:'temple-rest',name:'Temple rest stone',x:1568,y:1620,level:0},
  ...shrines.map(s=>({id:s.id,name:s.name,x:s.x,y:s.y+52,level:s.level}))
];
export const shrineTreasureIds=shrines.flatMap(s=>shrineDefinitions[s.id].rooms.map((_,index)=>`${s.id}-${index}`));
export function validateJourney(j,progress){
  if(!j||!Array.isArray(j.discovered)||!j.discovered.includes('start')||j.discovered.some(id=>!destinations.some(d=>d.id===id))||!Array.isArray(j.treasures)||j.treasures.some(id=>!shrineTreasureIds.includes(id)))return null;
  if(!Number.isInteger(j.health)||!Number.isInteger(j.stamina)||j.health<0||j.stamina<0||j.health+j.stamina>progress.seals.length)return null;
  if(j.discovered.some(id=>['tower',...shrines.map(s=>s.id)].includes(id))&&!progress.tower)return null;
  return {discovered:[...new Set(j.discovered)],treasures:[...new Set(j.treasures)],health:j.health,stamina:j.stamina};
}
export const migrateJourney=p=>({...freshJourney(),discovered:['start',...(p.tower?['tower']:[]),...p.seals]});
export const maxHearts=g=>5+g.journey.health;
export const maxStamina=g=>100+25*g.journey.stamina;
export const unspent=g=>g.progress.seals.length-g.journey.health-g.journey.stamina;
export function discover(g,id){if(!g.journey.discovered.includes(id)){g.journey.discovered.push(id);g.needsSave=true;}}
export function buyUpgrade(g,type){
  if(!['health','stamina'].includes(type)||unspent(g)<1)return false;
  g.journey[type]++;g.player.hp=maxHearts(g);g.equipment.stamina=maxStamina(g);g.needsSave=true;
  g.notice(type==='health'?'Trail blessing · One additional heart.':'Trail blessing · Stamina capacity increased by 25.');return true;
}
export function fastTravel(g,id){
  const d=destinations.find(d=>d.id===id);
  if(g.shrine||!d||!g.journey.discovered.includes(id)||!canStand(d.x,d.y,d.level)||g.enemies.some(e=>e.hp>0&&e.level===g.player.level&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<240)){
    g.notice('Travel needs a discovered destination and a safe outdoor position away from enemies.');return false;
  }
  g.clearTransient();Object.assign(g.player,{x:d.x,y:d.y,level:d.level});g.checkpoint={x:d.x,y:d.y,level:d.level};g.resetCrates();g.needsSave=true;g.notice(`Arrived at ${d.name}. Checkpoint set.`);return true;
}
