import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {hurtPlayer,clearLine,clearPath,inArc,samePlane} from '../src/combat.js';
import {abilities} from '../src/abilities.js';
import {validate,save,load,KEY,BACKUP,VERSION,freshState} from '../src/save.js';
import {canStand,objects,spawn} from '../src/world.js';
const input=(action='',held=[],x=0,y=0)=>({vector:()=>({x,y}),active:k=>held.includes(k),consume:k=>k===action});
function tick(g,n=1,i=input()){for(let j=0;j<n;j++)g.update(1/60,i)}
function arena(){const g=new Game();Object.assign(g.player,{x:840,y:800,face:'e'});g.enemies=g.enemies.slice(0,1);g.enemies[0].frozen=20;return g;}
test('sword windup, active window, one hit per swing, directional arc and queued combo',()=>{
 const g=arena(),e=g.enemies[0];tick(g,1,input('attack'));assert.equal(e.hp,3);tick(g,6);assert.equal(e.hp,2);tick(g,5);assert.equal(e.hp,2);
 tick(g,1,input('attack'));tick(g,15);assert.equal(g.combo,2);
 const b=arena();b.player.face='w';tick(b,1,input('attack'));tick(b,14);assert.equal(b.enemies[0].hp,3);
 assert.equal(inArc({x:980,y:345,level:0,face:'e'},{x:990,y:345,level:1}),false);
});
test('shield blocks front, drains stamina, fails from behind and when exhausted; hurt frames',()=>{
 const g=arena();g.player.blocking=true;const front={x:870,y:800,level:0},back={x:810,y:800,level:0};
 hurtPlayer(g,front);assert.equal(g.player.hp,5);assert.equal(g.equipment.stamina,76);
 hurtPlayer(g,back);assert.equal(g.player.hp,4);hurtPlayer(g,back);assert.equal(g.player.hp,4);
 g.player.hurt=0;g.player.blocking=true;g.equipment.stamina=10;hurtPlayer(g,front);assert.equal(g.player.hp,3);
});
test('enemy windup is avoidable; attack cooldown prevents contact damage spam; disengages',()=>{
 const g=arena(),e=g.enemies[0];e.frozen=0;g.player.x=850;tick(g);assert.ok(e.windup>0);assert.equal(g.player.hp,5);
 g.player.x=780;tick(g,30);assert.equal(g.player.hp,5);assert.ok(e.cooldown>0);
 g.player.x=300;const before=e.x;tick(g,60);assert.equal(e.mode,'return');assert.ok(Math.abs(e.x-e.home.x)<Math.abs(before-e.home.x)+1);
});
test('bow aims in place, consumes one arrow per release, projectile damages and expires',()=>{
 const g=arena();tick(g,15,input('', ['tool']));const x=g.player.x;tick(g,10,input('', ['tool'],1,0));assert.equal(g.player.x,x);
 tick(g);assert.equal(g.equipment.arrows,11);tick(g,15);assert.equal(g.enemies[0].hp,1);assert.equal(g.projectiles.length,0);
 g.equipment.arrows=0;tick(g,10,input('', ['tool']));tick(g);assert.equal(g.projectiles.length,0);
});
test('input epoch cancels aiming without firing; tool switch releases tether',()=>{
 const g=arena();const held=input('', ['tool']);held.epoch=0;tick(g,10,held);const cleared=input();cleared.epoch=1;tick(g,1,cleared);assert.equal(g.equipment.arrows,12);
 g.heldObject=g.crates[0];tick(g,1,input('cycle'));assert.equal(g.heldObject,null);
});
test('projectiles and attacks cannot cross cliffs, walls or floor separation',()=>{
 assert.equal(clearLine({x:400,y:640,level:0},{x:480,y:640,level:0}),false);
 assert.equal(samePlane({x:720,y:575,level:0},{x:720,y:520,level:0}),false);
 const g=arena();Object.assign(g.player,{x:400,y:640});g.enemies=[];tick(g,4,input('', ['tool']));tick(g);tick(g,40);assert.equal(g.projectiles.length,0);
});
test('pulse throws into clear space, arms, damages area, respects floors and can hurt player',()=>{
 const g=arena();assert.ok(abilities.pulse.activate(g));assert.ok(g.bomb);assert.equal(abilities.pulse.activate(g),false);
 g.bomb.age=1;g.enemies[0].x=g.bomb.x;g.enemies[0].frozen=0;abilities.pulse.activate(g);assert.ok(g.defeated.has('bokoblin-1'));assert.equal(g.player.hp,3);assert.equal(g.bomb,null);
 const b=arena();Object.assign(b.player,{x:980,y:345,level:1});b.bomb={x:980,y:345,level:0,age:1};abilities.pulse.activate(b);assert.equal(b.player.hp,5);
});
test('Stillmark freezes and then releases an enemy with stamina/cooldown cost',()=>{
 const g=arena(),e=g.enemies[0];e.frozen=0;assert.ok(abilities.still.activate(g));assert.equal(g.equipment.stamina,72);const before=e.x;tick(g,100);assert.equal(e.x,before);tick(g,90);assert.ok(e.frozen===0);assert.ok(e.x<before);
});
test('Tether moves crate with collisions, drains stamina, releases safely',()=>{
 const g=new Game();g.enemies=[];Object.assign(g.player,{x:550,y:740,face:'e'});g.equipment.tool='tether';assert.ok(abilities.tether.activate(g));const c=g.crates[0];tick(g,20,input('',[],1,0));assert.ok(c.x>600);assert.ok(canStand(c.x,c.y,c.level,c.r));
 abilities.tether.activate(g);assert.equal(g.heldObject,null);g.player.x=c.x-50;g.moveBody(g.player,100,0);assert.ok(g.player.x<=c.x-24);
});
test('Frostpath supports crossing, holds while occupied, saves safe land and expires after leaving',()=>{
 const g=new Game();g.enemies=[];Object.assign(g.player,{x:1770,y:688,face:'e'});assert.ok(abilities.frost.activate(g));g.moveBody(g.player,230,0);assert.ok(g.player.x>1824);assert.equal(canStand(g.player.x,g.player.y,0),false);
 assert.equal(g.snapshot().player.x,g.checkpoint.x);g.ice[0].life=.01;tick(g,3);assert.equal(g.ice.length,1);
 g.moveBody(g.player,270,0);assert.ok(g.player.x>2208);tick(g);assert.equal(g.ice.length,0);assert.ok(canStand(g.player.x,g.player.y,0));
});
test('stamina gates attacks and sprint, recovers, and rest resupplies worn inventory',()=>{
 const g=arena();g.equipment.stamina=0;tick(g,1,input('attack'));assert.equal(g.swing,null);tick(g,100);assert.ok(g.equipment.stamina>20);
 g.equipment.sword=0;g.equipment.arrows=0;g.interact(objects.find(o=>o.id==='camp-stone'));assert.equal(g.equipment.sword,40);assert.equal(g.equipment.arrows,12);assert.equal(g.equipment.stamina,100);
});
test('death clears dangerous transient objects and preserves equipment/progression',()=>{
 const g=arena();g.player.hp=1;g.equipment.arrows=7;g.progress.metGuide=true;g.bomb={x:1,y:1};g.projectiles=[{}];hurtPlayer(g,g.enemies[0]);assert.equal(g.player.hp,5);assert.equal(g.player.x,spawn.x);assert.equal(g.equipment.arrows,7);assert.ok(g.progress.metGuide);assert.equal(g.bomb,null);assert.equal(g.projectiles.length,0);
});
test('v0.3 migration preserves completed progress and original backup; v0.4 validates equipment',()=>{
 const s=freshState();s.progress={metGuide:true,tower:true,seals:['wind','reed','root','ember'],exitUnlocked:true,completed:true,collected:[]};
 const old={...s,version:3,map:'great-plateau'};delete old.equipment;const m=new Map([[KEY,JSON.stringify(old)]]),storage={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};
 const migrated=load(storage).state;assert.deepEqual(migrated.progress,s.progress);assert.equal(migrated.equipment.arrows,12);assert.equal(JSON.parse(m.get(KEY)).version,3);assert.ok(save(migrated,storage));assert.equal(JSON.parse(m.get(BACKUP)).version,3);assert.equal(JSON.parse(m.get(KEY)).version,VERSION);
 migrated.equipment.tool='frost';migrated.equipment.arrows=3;assert.ok(save(migrated,storage));assert.deepEqual(load(storage).state.equipment,migrated.equipment);
 assert.equal(validate({...migrated,version:4,map:'great-plateau',equipment:{...migrated.equipment,arrows:-1}}),null);
});
test('supply kits collect once, persist, and do not alter tutorial token inventory',()=>{
 const g=new Game();g.player.x=390;tick(g);assert.equal(g.equipment.arrows,22);tick(g);assert.equal(g.equipment.arrows,22);const restored=new Game(g.snapshot());tick(restored);assert.equal(restored.equipment.arrows,22);assert.deepEqual(g.progress.collected,[]);
});
test('copper crates block attack sight lines and reset clear of checkpoint/player positions',()=>{
 const g=new Game();assert.equal(clearPath(g,{x:570,y:740,level:0},{x:630,y:740,level:0}),false);
 Object.assign(g.player,{x:600,y:740});const restored=new Game(g.snapshot());assert.ok(Math.hypot(restored.crates[0].x-restored.player.x,restored.crates[0].y-restored.player.y)>24);
 g.checkpoint={x:600,y:740,level:0};g.player.hp=1;hurtPlayer(g,{x:620,y:740,level:0});assert.ok(Math.hypot(g.crates[0].x-g.player.x,g.crates[0].y-g.player.y)>24);
});
