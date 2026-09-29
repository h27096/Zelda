import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {shrineDefinitions,roomCanStand,roomLine,pulseRoom} from '../src/shrines.js';
import {destinations,buyUpgrade,unspent,fastTravel} from '../src/journey.js';
import {freshState,validate,save,load,VERSION,KEY,BACKUP} from '../src/save.js';
import {objects,canStand} from '../src/world.js';
import {hurtPlayer} from '../src/combat.js';
import {tick,walk,tool,solveRoom,completeShrine,input} from './helpers/shrine-play.js';
const ready=()=>{const g=new Game();g.progress.metGuide=true;g.progress.tower=true;return g;};
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
for(const id of Object.keys(shrineDefinitions))test(`${id}: both rooms solved by movement and v0.4 tool input, treasure once, completion and replay`,()=>{
  const g=ready();const outside=g.enemies.map(e=>({...e}));g.enterShrine(id);
  assert.equal(g.recordSeal(),false);assert.equal(g.progress.seals.length,0);
  solveRoom(g);assert.equal(g.room.index,1);assert.equal(g.progress.seals.length,0);
  solveRoom(g);assert.deepEqual(g.progress.seals,[id]);assert.equal(g.journey.treasures.length,2);assert.equal(unspent(g),1);
  const arrows=g.equipment.arrows;g.recordSeal();assert.equal(unspent(g),1);
  walk(g,550,370);g.interact(g.nearby());assert.equal(g.equipment.arrows,arrows);
  g.leaveShrine();assert.equal(g.room,null);assert.deepEqual(g.enemies,outside);assert.ok(canStand(g.player.x,g.player.y,g.player.level));
  completeShrine(g,id);assert.equal(g.progress.seals.length,1);assert.equal(g.journey.treasures.length,2);
  const s=storage();assert.ok(save(g.snapshot(),s));assert.deepEqual(load(s).state.progress,g.progress);
});
test('walls, gates and water cannot be bypassed by movement, bow, sword or early altar activation',()=>{
  for(const id of Object.keys(shrineDefinitions)){
    const g=ready();g.enterShrine(id);g.moveBody(g.player,1000,0);assert.ok(g.player.x<310);
    assert.equal(g.recordSeal(),false);g.equipment.tool='bow';g.update(1/60,input('attack'));tick(g,100);assert.equal(g.room.solved,false);
    assert.equal(roomCanStand(g.room,5,5),false);
    assert.equal(roomLine(g.room,{x:80,y:80,level:0},{x:0,y:80,level:0}),false,'outer masonry stops projectiles');
    if(g.room.gate)assert.equal(roomLine(g.room,{x:280,y:250,level:0},{x:360,y:250,level:0}),false);
  }
});
test('paired gongs require one shared unobstructed pulse; Stillmark door resets safely',()=>{
  const g=ready();g.enterShrine('ember',1);pulseRoom(g,{x:250,y:120,level:0});assert.equal(g.room.solved,false);
  pulseRoom(g,{x:250,y:370,level:0});assert.equal(g.room.solved,false);
  g.leaveShrine();g.enterShrine('root');tick(g,600);assert.equal(g.room.open,false,'moving weight alone cannot open door');
  walk(g,140,250);while(Math.abs(g.crates[0].y-250)>18)tick(g);tool(g,'e');assert.ok(g.room.open);tick(g,200);assert.equal(g.room.open,false);
});
test('room checkpoints survive reload, death and reset with rewards retained and effects cleared',()=>{
  const g=ready();g.enterShrine('ember');solveRoom(g);assert.equal(g.room.index,1);
  tool(g,'e');const s=storage();assert.ok(save(g.snapshot(),s));const restored=new Game(load(s).state);
  assert.equal(restored.shrine,'ember');assert.equal(restored.room.index,1);assert.equal(restored.bomb,null);assert.equal(restored.player.x,80);assert.deepEqual(restored.journey.treasures,['ember-0']);
  restored.player.hp=1;hurtPlayer(restored,{x:100,y:250,level:0},2,false);assert.equal(restored.room.index,1);assert.equal(restored.player.hp,5);assert.equal(restored.player.x,80);
  solveRoom(restored);restored.setRoom(1);assert.deepEqual(restored.progress.seals,['ember']);assert.equal(restored.room.solved,false);
  restored.leaveShrine();assert.equal(restored.player.level,1);assert.ok(save(restored.snapshot(),s));
});
test('four earned blessings bound health/stamina upgrades, healing, regeneration, death and persistence',()=>{
  const g=ready();assert.equal(buyUpgrade(g,'health'),false);
  for(const id of ['root','reed','wind','ember'])completeShrine(g,id);
  assert.ok(buyUpgrade(g,'health'));assert.ok(buyUpgrade(g,'stamina'));assert.ok(buyUpgrade(g,'health'));assert.ok(buyUpgrade(g,'stamina'));assert.equal(buyUpgrade(g,'health'),false);
  assert.equal(g.maxHearts,7);assert.equal(g.maxStamina,150);assert.equal(g.player.hp,7);
  g.equipment.stamina=140;tick(g,100);assert.equal(g.equipment.stamina,150);
  g.player.hp=1;g.interact(objects.find(o=>o.id==='camp-stone'));assert.equal(g.player.hp,7);
  g.player.hp=1;hurtPlayer(g,{...g.player,x:g.player.x+10},2,false);assert.equal(g.player.hp,7);assert.equal(g.equipment.stamina,150);
  const s=storage();assert.ok(save(g.snapshot(),s));const restored=new Game(load(s).state);assert.equal(restored.maxHearts,7);assert.equal(restored.maxStamina,150);
});
test('fast travel requires discovery, blocks near threats and inside rooms, clears transient state and sets safe checkpoint',()=>{
  const g=ready();assert.equal(fastTravel(g,'reed'),false);g.enterShrine('reed');assert.equal(fastTravel(g,'start'),false);g.leaveShrine();assert.ok(fastTravel(g,'start'));
  g.bomb={x:1,y:1};assert.ok(fastTravel(g,'reed'));assert.equal(g.bomb,null);assert.equal(g.checkpoint.x,g.player.x);
  g.player.x=880;g.player.y=800;g.player.level=0;assert.equal(fastTravel(g,'start'),false);
  for(const d of destinations)assert.ok(canStand(d.x,d.y,d.level),d.id);
});
test('v0.4 migration keeps every earned seal, equipment and backup; v0.5 rejects malformed progression and locations',()=>{
  const old={...freshState(),version:4,map:'great-plateau'};delete old.journey;delete old.location;
  Object.assign(old.progress,{metGuide:true,tower:true,seals:['root','reed']});old.equipment.arrows=3;old.player.hp=2;
  const s=storage();s.setItem(KEY,JSON.stringify(old));const state=load(s).state;
  assert.equal(state.player.hp,2);assert.equal(state.equipment.arrows,3);assert.deepEqual(state.journey.discovered,['start','tower','root','reed']);assert.equal(JSON.parse(s.getItem(KEY)).version,4);
  assert.ok(save(state,s));assert.equal(JSON.parse(s.getItem(BACKUP)).version,4);
  const base={...state,version:VERSION,map:'great-plateau'};
  for(const change of [{journey:{...state.journey,health:3}},{journey:{...state.journey,stamina:-1}},{journey:{...state.journey,treasures:['unknown']}},{location:{shrine:'root',room:99}},{location:{shrine:'bad',room:0}},{location:{shrine:'ember',room:0}},{equipment:{...state.equipment,stamina:101}}])assert.equal(validate({...base,...change}),null);
  s.setItem(KEY,JSON.stringify({...base,journey:{health:100}}));assert.equal(load(s).status,'recovered');
});
