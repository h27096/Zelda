import {freshEquipment,validateEquipment} from './equipment.js?v=0.4.0';
import { spawn, canStand, initialEnemies, exit } from './world.js?v=0.4.0';
import {freshProgress,validateProgress} from './progression.js?v=0.4.0';
export const KEY='plateau-quest-topdown', BACKUP=KEY+'-backup', VERSION=4;
const storageDefault=()=>{try{return globalThis.localStorage}catch{return null}};
export function freshState(){return {equipment:freshEquipment(),player:{...spawn,hp:5,face:'s'},defeated:[],checkpoint:{...spawn},playTime:0,progress:freshProgress()};}
export function validate(data){
  const migrating=data?.version===2&&data.map==='plateau-slice';
  if(!migrating&&(![3,VERSION].includes(data?.version)||data.map!=='great-plateau'))return null;
  const equipment=data.version<4?freshEquipment():validateEquipment(data.equipment);
  if(!equipment)return null;
  let p=data.player,c=data.checkpoint;
  const progress=migrating?freshProgress():validateProgress(data.progress);
  if(!progress)return null;
  // A valid old coordinate may now contain a new landmark. Keep health and history,
  // but relocate to the safe starting stone; never mutate the source save on load.
  if(migrating){
    const oldPoint=q=>q&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=32&&q.x<=1504&&q.y>=32&&q.y<=1120&&[0,1].includes(q.level);
    if(!oldPoint(p)||!oldPoint(c))return null;
    if(!canStand(p.x,p.y,p.level))p={...p,...spawn};
    if(!canStand(c.x,c.y,c.level))c={...spawn};
  }
  if(!p||!Number.isInteger(p.hp)||p.hp<1||p.hp>5||!canStand(p.x,p.y,p.level)||!c||!canStand(c.x,c.y,c.level))return null;
  if(!progress.exitUnlocked&&(p.y+9>exit.y||c.y+9>exit.y))return null;
  const ids=initialEnemies().map(e=>e.id);
  if(!Array.isArray(data.defeated)||data.defeated.some(id=>!ids.includes(id)))return null;
  return {equipment,player:{x:p.x,y:p.y,level:p.level,hp:p.hp,face:['n','ne','e','se','s','sw','w','nw'].includes(p.face)?p.face:'s'},checkpoint:{x:c.x,y:c.y,level:c.level},defeated:[...new Set(data.defeated)],playTime:Number.isFinite(data.playTime)&&data.playTime>=0?data.playTime:0,progress};
}
export function load(storage=storageDefault()){
  if(!storage)return {state:null,status:'unavailable'};
  let corrupt=false;
  try {
    for(const key of [KEY,BACKUP]) {
      const raw=storage.getItem(key);if(!raw)continue;
      try {const state=validate(JSON.parse(raw));if(state)return {state,status:key===KEY?'loaded':'recovered'};}catch{}
      corrupt=true;
    }
    // Old platformer coordinates/progression do not map to this world. Preserve the old key.
    return {state:null,status:corrupt?'corrupt':storage.getItem('plateau-quest-v1')?'legacy':'new'};
  }catch{return {state:null,status:'unavailable'}}
}
export function save(state,storage=storageDefault()){
  try {
    if(!storage)return false;
    const data={...state,version:VERSION,map:'great-plateau'};
    if(!validate(data))return false;
    const previous=storage.getItem(KEY);
    if(previous){try{if(validate(JSON.parse(previous)))storage.setItem(BACKUP,previous)}catch{}}
    storage.setItem(KEY,JSON.stringify(data));return true;
  }catch{return false}
}
export function clear(storage=storageDefault()){try{storage.removeItem(KEY);storage.removeItem(BACKUP);return true}catch{return false}}
