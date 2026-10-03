import {shrines,objects} from './world.js?v=0.6.0';

export const freshProgress=()=>({metGuide:false,tower:false,seals:[],exitUnlocked:false,completed:false,collected:[]});
export const treasureIds=objects.filter(o=>['chest','pickup'].includes(o.kind)).map(o=>o.id);
export function validateProgress(value){
  if(!value || ['metGuide','tower','exitUnlocked','completed'].some(k=>typeof value[k]!=='boolean'))return null;
  if(!Array.isArray(value.seals)||value.seals.some(id=>!shrines.some(s=>s.id===id)))return null;
  if(!Array.isArray(value.collected)||value.collected.some(id=>!treasureIds.includes(id)))return null;
  const p={...freshProgress(),...value,seals:[...new Set(value.seals)],collected:[...new Set(value.collected)]};
  if((p.tower&&!p.metGuide)||(p.seals.length&&!p.tower)||(p.exitUnlocked&&(!p.tower||p.seals.length!==4))||(p.completed&&!p.exitUnlocked))return null;
  return Object.fromEntries(Object.keys(freshProgress()).map(k=>[k,p[k]]));
}
export function objective(p){
  if(!p.metGuide)return 'Meet Rowan southeast of the Dawnrest stone.';
  if(!p.tower)return 'Climb the northern stairs and light Plateau Tower.';
  if(p.seals.length<4)return `Record the four shrine seals · ${p.seals.length}/4. Open Journal for directions.`;
  if(!p.exitUnlocked)return 'Return to Rowan at the Lantern Temple.';
  if(!p.completed)return 'The southern descent is open. Follow the temple trail south.';
  return 'Plateau complete · Explore freely. Follow the southern road to Hearthstead.';
}
export function journal(p){return [
  {done:p.metGuide,text:'Meet Rowan near the starting rest stone'},
  {done:p.tower,text:'Light Plateau Tower: northern stairs, then east on the terrace'},
  ...shrines.map(s=>({done:p.seals.includes(s.id),text:`${s.name}: ${{wind:'northwest, across the upper bridge',reed:'northeast wetlands, east of the large pond',root:'southwest, along the western forest trail',ember:'southeast highlands, use the southern stairs'}[s.id]}`})),
  {done:p.exitUnlocked,text:'Bring four seals to Rowan at the central Lantern Temple'},
  {done:p.completed,text:'Take the southern descent beyond the temple'}
];}
export const treasureCount=p=>objects.filter(o=>p.collected.includes(o.id)).reduce((sum,o)=>sum+(o.value??0),0);
