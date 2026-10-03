import {items,recipes,shops,quests,npcs,landmarks,collectibles,forage,worldRegions,regionFor,expansionObjects} from './content.js?v=0.6.0';

export const freshAdventure=()=>({coins:0,bag:{},gear:{weapon:null,armor:null,charm:null},quests:{},gathered:[],echoes:[],discoveries:[],regions:['plateau'],cooked:{},stock:Object.fromEntries(Object.entries(shops).map(([id,s])=>[id,{...s.stock}]))});
const count=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000;
const record=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.entries(o).every(([k,v])=>keys.includes(k)&&count(v));
const list=(v,keys)=>Array.isArray(v)&&v.every(k=>keys.includes(k));
export function validateAdventure(a){
  if(!a||!count(a.coins)||!record(a.bag,Object.keys(items))||!record(a.cooked,Object.keys(recipes)))return null;
  if(!a.gear||!['weapon','armor','charm'].every(slot=>a.gear[slot]===null||(items[a.gear[slot]]?.slot===slot&&a.bag[a.gear[slot]]>0)))return null;
  if(!a.quests||typeof a.quests!=='object'||Array.isArray(a.quests)||Object.entries(a.quests).some(([id,status])=>!Object.hasOwn(quests,id)||!['active','completed'].includes(status)))return null;
  if(Object.keys(a.quests).some(id=>quests[id].requires&&a.quests[quests[id].requires]!=='completed'))return null;
  if(!list(a.gathered,forage.map(o=>o.id))||!list(a.echoes,collectibles.map(o=>o.id))||!list(a.discoveries,landmarks.map(o=>o.id))||!list(a.regions,worldRegions.map(o=>o.id))||!a.regions.includes('plateau'))return null;
  if(!a.stock||Object.keys(a.stock).some(id=>!shops[id])||Object.keys(shops).some(id=>!record(a.stock[id],Object.keys(items))))return null;
  return structuredClone({...a,gathered:[...new Set(a.gathered)],echoes:[...new Set(a.echoes)],discoveries:[...new Set(a.discoveries)],regions:[...new Set(a.regions)]});
}
export function migrateAdventure(data){
  const a=freshAdventure();
  // Old trail tokens become spendable crowns once, without changing historical tokens.
  a.coins=(data.progress?.collected??[]).reduce((n,id)=>n+(id.startsWith('chest-')?5:1),0)+(data.journey?.treasures?.length??0)*5;
  return a;
}
export const gearStat=(g,key)=>Object.values(g.adventure?.gear??{}).reduce((n,id)=>n+(items[id]?.[key]??0),0);
export const near=(g,o)=>!g.room&&o&&g.player.level===o.level&&Math.hypot(g.player.x-o.x,g.player.y-o.y)<70;
export const availableObject=(g,o)=>!(o.kind==='forage'&&g.adventure.gathered.includes(o.id))&&!(o.kind==='echo'&&g.adventure.echoes.includes(o.id));
export function addItem(g,id,n=1){if(!items[id]||!count(n)||n===0)return false;g.adventure.bag[id]=(g.adventure.bag[id]??0)+n;g.needsSave=true;return true;}
export function awardCoins(g,n){g.adventure.coins+=n;g.needsSave=true;}
export function objectiveProgress(g,o){
  const a=g.adventure;
  return o.type==='item'?a.bag[o.id]??0:o.type==='discovery'?Number(a.discoveries.includes(o.id)):o.type==='collectibles'?a.echoes.length:o.type==='cooked'?a.cooked[o.id]??0:0;
}
export const questReady=(g,id)=>quests[id]?.objectives.every(o=>objectiveProgress(g,o)>=o.count);
export function acceptQuest(g,id){
  const q=quests[id];if(!q||g.adventure.quests[id]||!near(g,npcs.find(n=>n.id===q.giver))||(q.requires&&g.adventure.quests[q.requires]!=='completed'))return false;
  g.adventure.quests[id]='active';g.needsSave=true;g.notice('Quest accepted · '+q.name);return true;
}
export function completeQuest(g,id){
  const q=quests[id];if(!q||g.adventure.quests[id]!=='active'||!questReady(g,id)||!near(g,npcs.find(n=>n.id===q.giver)))return false;
  for(const [item,n] of Object.entries(q.consume??{}))g.adventure.bag[item]-=n;
  g.adventure.quests[id]='completed';awardCoins(g,q.reward.coins??0);
  for(const [item,n] of Object.entries(q.reward.items??{}))addItem(g,item,n);
  g.notice('Quest complete · '+q.name);return true;
}
export function trade(g,shopId,id,mode){
  const a=g.adventure,item=items[id],stock=a.stock[shopId];
  if(!item||!stock||!near(g,npcs.find(n=>n.shop===shopId)))return false;
  if(mode==='buy'){
    if(!(stock[id]>0)||item.price<=0||a.coins<item.price)return false;
    a.coins-=item.price;stock[id]--;addItem(g,id);
  }else if(mode==='sell'){
    if(!(a.bag[id]>0)||item.sell<=0||Object.values(a.gear).includes(id))return false;
    a.bag[id]--;a.coins+=item.sell;stock[id]=(stock[id]??0)+1;
  }else return false;
  g.needsSave=true;g.notice(`${mode==='buy'?'Bought':'Sold'} ${item.name}.`);return true;
}
export function cook(g,id){
  const r=recipes[id],a=g.adventure;
  if(!r||!expansionObjects.some(o=>o.kind==='cooking'&&near(g,o))||!Object.entries(r.ingredients).every(([i,n])=>(a.bag[i]??0)>=n))return false;
  for(const [i,n] of Object.entries(r.ingredients))a.bag[i]-=n;
  addItem(g,r.result);a.cooked[id]=(a.cooked[id]??0)+1;g.notice('Cooked '+items[r.result].name+'. Eat it from your pack.');return true;
}
export function equip(g,id){
  const item=items[id];if(!item?.slot||!(g.adventure.bag[id]>0))return false;
  const slot=item.slot;g.adventure.gear[slot]=g.adventure.gear[slot]===id?null:id;g.needsSave=true;return true;
}
export function eat(g,id){
  const item=items[id];if(item?.type!=='food'||!(g.adventure.bag[id]>0)||(g.player.hp>=g.maxHearts&&g.equipment.stamina>=g.maxStamina))return false;
  g.adventure.bag[id]--;g.player.hp=Math.min(g.maxHearts,g.player.hp+(item.heal??0));g.equipment.stamina=Math.min(g.maxStamina,g.equipment.stamina+(item.stamina??0));g.needsSave=true;g.notice('Enjoyed '+item.name+'.');return true;
}
export function interactAdventure(g,o){
  if(!['npc','cooking','forage','echo','discovery'].includes(o.kind))return false;
  if(!near(g,o)||!availableObject(g,o))return true;
  const a=g.adventure;
  if(o.kind==='npc'||o.kind==='cooking'){g.panelRequest=o.id;g.notice(o.dialogue??'Combine ingredients at the village hearth.');}
  if(o.kind==='forage'){a.gathered.push(o.id);addItem(g,o.item,o.count);g.notice(`Gathered ${o.count} ${items[o.item].name}.`);}
  if(o.kind==='echo'){a.echoes.push(o.id);awardCoins(g,5);g.notice(`Echo stone ${a.echoes.length}/${collectibles.length} · +5 crowns. Tavi knows their story.`);}
  if(o.kind==='discovery'&&!a.discoveries.includes(o.id)){a.discoveries.push(o.id);awardCoins(g,5);g.notice('Landmark recorded · '+o.name+' · +5 crowns.');}
  else if(o.kind==='discovery')g.notice(o.name+' is recorded in your journal.');
  g.needsSave=true;return true;
}
export function updateRegion(g){
  if(g.room)return;
  const r=regionFor(g.player.x,g.player.y);if(!r||g.regionId===r.id)return;
  g.regionId=r.id;
  if(!g.adventure.regions.includes(r.id)){g.adventure.regions.push(r.id);g.needsSave=true;g.notice(r.description??r.name);}
}
