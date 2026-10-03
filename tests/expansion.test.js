import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {freshState,validate,save,load,KEY,BACKUP,VERSION} from '../src/save.js';
import {objects,move,canStand,spawn} from '../src/world.js';
import {items,quests,recipes,npcs,expansionObjects,expansionDestinations,hazards,collectibles,forage,landmarks,regionLinks,worldRegions} from '../src/content.js';
import {acceptQuest,completeQuest,trade,cook,equip,eat,addItem,updateRegion,validateAdventure,freshAdventure,questReady} from '../src/adventure.js';
import {hurtPlayer,spend} from '../src/combat.js';
import {fastTravel,buyUpgrade} from '../src/journey.js';
import {completeShrine,input,tick} from './helpers/shrine-play.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const ready=()=>{const g=new Game();Object.assign(g.progress,{metGuide:true,tower:true,seals:['wind','reed','root','ember'],exitUnlocked:true,completed:true});g.enemies=[];return g;};
const approach=(g,id)=>{const o=objects.find(o=>o.id===id);assert.ok(o,id);Object.assign(g.player,{x:o.x,y:o.y+40,level:o.level});assert.ok(canStand(g.player.x,g.player.y,g.player.level),id+' approach');return o;};
const use=(g,id)=>{const o=approach(g,id);g.interact(o);};

test('expanded content and every landmark have a route through actual movement from the open descent',()=>{
  const start={x:1536,y:2208,level:0},key=p=>`${p.x},${p.y},${p.level}`;
  const seen=new Set([key(start)]),queue=[start];
  for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]){
    const p=queue[i],q={...p};move(q,dx,dy,{exitUnlocked:true});
    if(q.y<2192||q.x!==p.x+dx||q.y!==p.y+dy||seen.has(key(q)))continue;
    seen.add(key(q));queue.push(q);
  }
  for(const o of expansionObjects)assert.ok(queue.some(p=>p.level===o.level&&Math.hypot(p.x-o.x,p.y-o.y)<55),'reachable '+o.id);
  for(const d of expansionDestinations)assert.ok(canStand(d.x,d.y,d.level),d.id);
  assert.ok(queue.some(p=>p.y>4300));assert.ok(queue.some(p=>p.level===1&&p.y>3600));
});
test('seamless regions announce once, preserve position, gate access, and return through original descent',()=>{
  const g=ready();Object.assign(g.player,{x:1536,y:2256,level:0});g.moveBody(g.player,0,200);updateRegion(g);assert.equal(g.regionId,'hearth');assert.ok(g.adventure.regions.includes('hearth'));
  g.moveBody(g.player,500,0);assert.ok(g.player.x>1600,'corridor widens after cliff');
  for(const [x,y,id] of [[640,3200,'mire'],[2400,3400,'ridge']]){Object.assign(g.player,{x,y});updateRegion(g);assert.equal(g.regionId,id);}
  assert.equal(new Set(g.adventure.regions).size,4);updateRegion(g);assert.equal(g.adventure.regions.length,4);
  Object.assign(g.player,{x:1536,y:2352});g.moveBody(g.player,0,-180);assert.ok(g.player.y<2304);
  assert.ok(regionLinks.every(link=>link.every(id=>worldRegions.some(r=>r.id===id))));
});
test('NPC use opens dialogue; accept and turn-in require proximity and rewards are one-time',()=>{
  const g=ready();assert.equal(acceptQuest(g,'supper'),false);use(g,'mara');assert.equal(g.panelRequest,'mara');assert.ok(acceptQuest(g,'supper'));assert.equal(acceptQuest(g,'supper'),false);assert.equal(acceptQuest(g,'cook'),false);assert.equal(completeQuest(g,'supper'),false);
  use(g,forage[0].id);assert.equal(g.adventure.bag.berry,2);use(g,forage[0].id);assert.equal(g.adventure.bag.berry,2);assert.ok(questReady(g,'supper'));assert.equal(completeQuest(g,'supper'),false);
  approach(g,'mara');assert.ok(completeQuest(g,'supper'));assert.equal(g.adventure.bag.berry,0);assert.equal(g.adventure.coins,12);assert.equal(g.adventure.bag.reed,2);assert.equal(completeQuest(g,'supper'),false);assert.ok(acceptQuest(g,'cook'));
});
test('survey and echo quests support discoveries before acceptance and survive reload',()=>{
  let g=ready();for(const l of landmarks)use(g,l.id);for(const c of collectibles.slice(0,3))use(g,c.id);
  approach(g,'tavi');assert.ok(acceptQuest(g,'survey'));assert.ok(acceptQuest(g,'echoes'));const s=memory();assert.ok(save(g.snapshot(),s));g=new Game(load(s).state);approach(g,'tavi');assert.ok(completeQuest(g,'survey'));assert.ok(completeQuest(g,'echoes'));assert.equal(g.adventure.bag.charm,1);assert.ok(equip(g,'charm'));assert.equal(completeQuest(g,'echoes'),false);
  const coins=g.adventure.coins;use(g,collectibles[0].id);use(g,landmarks[0].id);assert.equal(g.adventure.coins,coins);
});
test('shop handles insufficient funds, depleted stock, selling, equipped gear and persistent transactions',()=>{
  const g=ready();g.adventure.coins=100;assert.equal(trade(g,'provisions','coat','buy'),false);approach(g,'ivo');
  assert.ok(trade(g,'provisions','coat','buy'));assert.equal(g.adventure.coins,75);assert.ok(equip(g,'coat'));assert.equal(trade(g,'provisions','coat','sell'),false);equip(g,'coat');assert.ok(trade(g,'provisions','coat','sell'));assert.equal(g.adventure.coins,85);assert.equal(g.adventure.bag.coat,0);
  g.adventure.stock.provisions.coat=0;assert.equal(trade(g,'provisions','coat','buy'),false);g.adventure.coins=0;assert.equal(trade(g,'provisions','berry','buy'),false);assert.equal(trade(g,'provisions','missing','buy'),false);
  const s=memory();assert.ok(save(g.snapshot(),s));assert.deepEqual(load(s).state.adventure,g.adventure);
});
test('cooking consumes ingredients atomically and meals restore bounded stats; cooking quest tracks results',()=>{
  const g=ready();addItem(g,'berry',4);addItem(g,'reed',2);assert.equal(cook(g,'broth'),false);approach(g,'mara');acceptQuest(g,'supper');completeQuest(g,'supper');acceptQuest(g,'cook');
  approach(g,'village-hearth');const before=g.adventure.bag.berry;assert.ok(cook(g,'broth'));assert.equal(g.adventure.bag.berry,before-1);assert.equal(g.adventure.cooked.broth,1);assert.equal(eat(g,'broth'),false,'no wasted meal at full health/stamina');
  g.player.hp=1;g.equipment.stamina=0;assert.ok(eat(g,'broth'));assert.equal(g.player.hp,4);assert.equal(g.equipment.stamina,25);assert.equal(eat(g,'broth'),false);assert.equal(cook(g,'missing'),false);
  g.adventure.bag.berry=0;const bag=structuredClone(g.adventure.bag);assert.equal(cook(g,'broth'),false);assert.deepEqual(g.adventure.bag,bag);approach(g,'mara');assert.ok(completeQuest(g,'cook'));
});
test('gear affects combat, heavy damage, stamina costs and brambles without replacing base equipment',()=>{
  const g=ready();assert.equal(equip(g,'coat'),false);addItem(g,'coat');equip(g,'coat');hurtPlayer(g,{...g.player,x:g.player.x-10},3,false);assert.equal(g.player.hp,3);
  addItem(g,'charm');equip(g,'charm');g.equipment.stamina=100;spend(g,20);assert.equal(g.equipment.stamina,83);
  const h=hazards[0];Object.assign(g.player,{x:h.x+80,y:h.y+80,hp:5,hurt:0});tick(g,2);assert.equal(g.player.hp,5);equip(g,'coat');tick(g,2);assert.equal(g.player.hp,4);
  const a=new Game();a.enemies=[{...a.enemies[0],x:400,y:700,hp:5,frozen:10,home:{x:400,y:700,level:0}}];Object.assign(a.player,{x:350,y:700,face:'e'});addItem(a,'trailblade');equip(a,'trailblade');a.update(1/60,input('attack'));tick(a,12);assert.equal(a.enemies[0].hp,3);assert.equal(a.equipment.sword,39);
});
test('new rest points, outdoor and shrine saves, travel, death, blessings and pack coexist',()=>{
  let g=ready();use(g,'hearth-rest');assert.ok(g.journey.discovered.includes('hearth-rest'));assert.ok(fastTravel(g,'start'));assert.ok(fastTravel(g,'hearth-rest'));assert.equal(g.checkpoint.y,2880);addItem(g,'berry',3);g.adventure.coins=10;g.player.hp=1;g.respawn();assert.equal(g.adventure.bag.berry,3);assert.equal(g.player.y,2880);
  assert.ok(buyUpgrade(g,'health'));assert.ok(buyUpgrade(g,'stamina'));g.enterShrine('root');const s=memory();assert.ok(save(g.snapshot(),s));g=new Game(load(s).state);assert.equal(g.shrine,'root');assert.equal(g.adventure.bag.berry,3);assert.equal(g.maxHearts,6);assert.equal(g.maxStamina,125);g.leaveShrine();assert.ok(fastTravel(g,'hearth-rest'));assert.ok(save(g.snapshot(),s));assert.equal(load(s).state.player.y,2880);
});
test('v0.5 migration preserves every system, copies earned tokens once, leaves source untouched and backs it up',()=>{
  const g=ready();g.progress.collected=['chest-0','supply-0'];g.journey.treasures=['root-0'];g.journey.health=2;g.equipment.arrows=3;g.defeated.add('bokoblin-1');g.playTime=400;g.enterShrine('root');
  const old={...g.snapshot(),version:5,map:'great-plateau'};delete old.adventure;const raw=JSON.stringify(old),s=memory();s.setItem(KEY,raw);const state=load(s).state;assert.equal(state.adventure.coins,11);assert.deepEqual(state.progress,old.progress);assert.deepEqual(state.journey,old.journey);assert.deepEqual(state.equipment,old.equipment);assert.deepEqual(state.location,old.location);assert.equal(s.getItem(KEY),raw);assert.ok(save(state,s));assert.equal(s.getItem(BACKUP),raw);assert.equal(load(s).state.adventure.coins,11);assert.ok(save(load(s).state,s));assert.equal(load(s).state.adventure.coins,11);
});
test('malformed expansion saves recover backup instead of silently resetting earned state',()=>{
  const base={...freshState(),version:VERSION,map:'great-plateau'};
  for(const change of [{coins:-1},{bag:{berry:-1}},{bag:{unknown:1}},{gear:{weapon:'trailblade',armor:null,charm:null}},{quests:{bad:'active'}},{gathered:['missing']},{stock:{}},{cooked:{broth:Infinity}}])assert.equal(validate({...base,adventure:{...base.adventure,...change}}),null);
  const s=memory();save(freshState(),s);save(freshState(),s);s.setItem(KEY,JSON.stringify({...base,adventure:{...base.adventure,coins:-9}}));assert.equal(load(s).status,'recovered');
});
