import { spawn, canStand, initialEnemies } from './world.js?v=0.2.0';
export const KEY='plateau-quest-topdown', BACKUP=KEY+'-backup', VERSION=2;
const storageDefault=()=>{try{return globalThis.localStorage}catch{return null}};
export function freshState(){return {player:{...spawn,hp:5,face:'s'},defeated:[],checkpoint:{...spawn},playTime:0};}
export function validate(data){
  if(data?.version!==VERSION||data.map!=='plateau-slice')return null;
  const p=data.player,c=data.checkpoint;
  if(!p||!Number.isInteger(p.hp)||p.hp<1||p.hp>5||!canStand(p.x,p.y,p.level)||!c||!canStand(c.x,c.y,c.level))return null;
  const ids=initialEnemies().map(e=>e.id);
  if(!Array.isArray(data.defeated)||data.defeated.some(id=>!ids.includes(id)))return null;
  return {player:{x:p.x,y:p.y,level:p.level,hp:p.hp,face:['n','ne','e','se','s','sw','w','nw'].includes(p.face)?p.face:'s'},checkpoint:{x:c.x,y:c.y,level:c.level},defeated:[...new Set(data.defeated)],playTime:Number.isFinite(data.playTime)&&data.playTime>=0?data.playTime:0};
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
    const data={version:VERSION,map:'plateau-slice',...state};
    if(!validate(data))return false;
    const previous=storage.getItem(KEY);
    if(previous){try{if(validate(JSON.parse(previous)))storage.setItem(BACKUP,previous)}catch{}}
    storage.setItem(KEY,JSON.stringify(data));return true;
  }catch{return false}
}
export function clear(storage=storageDefault()){try{storage.removeItem(KEY);storage.removeItem(BACKUP);return true}catch{return false}}
