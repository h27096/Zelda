import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {objects,shrines,spawn,move,canStand,exit,waters,initialEnemies} from '../src/world.js';
import {freshState,save,load,validate,KEY,BACKUP,VERSION} from '../src/save.js';
import {freshProgress,validateProgress,treasureCount} from '../src/progression.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const input=(action='',x=0,y=0)=>({vector:()=>({x,y}),consume:k=>k===action});
const obj=id=>objects.find(o=>o.id===id);
import {solveRoom,completeShrine} from './helpers/shrine-play.js';

test('every landmark, shrine, cache and enemy is reachable through actual movement, including both stair sets',()=>{
  const start={x:336,y:704,level:0},key=p=>`${p.x},${p.y},${p.level}`;
  const seen=new Map([[key(start),start]]),queue=[start];
  for(let i=0;i<queue.length;i++){
    const p=queue[i];
    for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]){
      const q={...p};move(q,dx,dy);
      if(q.x!==p.x+dx||q.y!==p.y+dy||seen.has(key(q)))continue;
      seen.set(key(q),q);queue.push(q);
    }
  }
  for(const o of [...objects.filter(o=>o.text),...initialEnemies()]){
    assert.ok(queue.some(p=>p.level===o.level&&Math.hypot(p.x-o.x,p.y-o.y)<60),`${o.id} must be reachable`);
  }
  assert.ok(queue.some(p=>p.level===1&&p.x>2500&&p.y>1500),'highland floor reachable');
  assert.ok(queue.every(p=>p.y+9<=exit.y),'no route bypasses the sealed descent');
});

test('full tutorial uses nearby interactions, any shrine order, temple hand-in and persistent ending',()=>{
  const g=new Game();g.enemies=[];
  const use=id=>{const o=obj(id);Object.assign(g.player,{x:o.x,y:o.y+52,level:o.level});assert.ok(canStand(g.player.x,g.player.y,g.player.level),id);g.update(1/60,input('interact'));};
  use('tower');assert.equal(g.progress.tower,false);
  use('wind');assert.equal(g.shrine,null);
  use('rowan-start');assert.ok(g.progress.metGuide);
  use('tower');assert.ok(g.progress.tower);
  for(const id of ['ember','root','wind','reed']){
    use(id);assert.equal(g.shrine,id);
    solveRoom(g);solveRoom(g);g.recordSeal();g.leaveShrine();
  }
  assert.equal(g.progress.seals.length,4);
  use('rowan-start');assert.equal(g.progress.exitUnlocked,false);
  use('rowan-temple');assert.ok(g.progress.exitUnlocked);
  Object.assign(g.player,{x:1504,y:2096,level:0});
  for(let i=0;i<70;i++)g.update(1/60,input('',0,1));
  assert.ok(g.progress.completed);assert.ok(g.player.y>exit.y+80);
  const s=memory();assert.ok(save(g.snapshot(),s));const restored=new Game(load(s).state);
  assert.deepEqual(restored.progress,g.progress);assert.equal(restored.player.y,g.player.y);
  for(let i=0;i<70;i++)restored.update(1/60,input('',0,-1));assert.ok(restored.player.y<exit.y,'can return after completion');
});

test('partial progress, open shrine reload and checkpoint death preserve tutorial state',()=>{
  const g=new Game();g.interact(obj('rowan-start'));g.interact(obj('tower'));completeShrine(g,'root');g.enterShrine('root');
  const s=memory();assert.ok(save(g.snapshot(),s));const restored=new Game(load(s).state);
  assert.equal(restored.shrine,'root','reload returns to current room checkpoint');restored.leaveShrine();
  assert.deepEqual(restored.progress.seals,['root']);
  Object.assign(restored.player,{x:880,y:800,hp:1});for(let i=0;i<30;i++)restored.update(1/60,input());
  assert.equal(restored.player.hp,5);assert.equal(restored.player.x,restored.checkpoint.x);assert.deepEqual(restored.progress.seals,['root']);
});

test('all ponds, cliff sides and locked descent block; only open corridor crosses the southern cliff',()=>{
  for(const w of waters)assert.equal(canStand(w.x+w.w/2,w.y+w.h/2,0),false);
  for(const x of [100,1000,1504,1568,2000,2900]){const p={x,y:2096,level:0};move(p,0,150);assert.ok(p.y+9<=exit.y);}
  const p={x:1504,y:2096,level:0};move(p,0,150,{exitUnlocked:true});assert.ok(p.y>2200);
  move(p,300,0,{exitUnlocked:true});assert.ok(p.x<=1583);
  const ramp={x:2448,y:1968,level:0};move(ramp,0,-250);assert.equal(ramp.level,1);move(ramp,0,250);assert.equal(ramp.level,0);
});

test('guarded treasure, repeat collection and pickups save without duplicate rewards',()=>{
  const g=new Game();g.interact(obj('chest-0'));assert.deepEqual(g.progress.collected,[]);
  g.enemies=[];g.player.hp=1;g.interact(obj('chest-0'));assert.equal(g.player.hp,3);g.interact(obj('chest-0'));assert.equal(treasureCount(g.progress),5);
  g.interact(obj('supply-0'));assert.equal(g.player.hp,5);assert.equal(treasureCount(g.progress),6);
  const s=memory();save(g.snapshot(),s);assert.equal(treasureCount(load(s).state.progress),6);
});

test('v0.2 migration retains history and original save backup, relocates obstructed old positions',()=>{
  const s=memory(),old={version:2,map:'plateau-slice',player:{x:980,y:345,level:1,hp:3,face:'ne'},checkpoint:{...spawn},defeated:['bokoblin-1'],playTime:123};
  s.setItem(KEY,JSON.stringify(old));const migrated=load(s).state;
  assert.deepEqual(migrated.player,old.player);assert.deepEqual(migrated.defeated,old.defeated);assert.equal(migrated.playTime,123);assert.deepEqual(migrated.progress,freshProgress());
  assert.equal(JSON.parse(s.getItem(KEY)).version,2,'load is read-only');assert.ok(save(migrated,s));assert.equal(JSON.parse(s.getItem(BACKUP)).version,2);assert.equal(JSON.parse(s.getItem(KEY)).version,VERSION);
  old.player={x:800,y:320,level:1,hp:4};const relocated=validate(old);assert.equal(relocated.player.x,spawn.x);assert.equal(relocated.player.hp,4);
});

test('malformed progress and bypass saves are rejected; corrupt new save recovers migrated backup',()=>{
  const base={...freshState(),version:VERSION,map:'great-plateau'};
  assert.equal(validate({...base,progress:{...freshProgress(),exitUnlocked:true}}),null);
  assert.equal(validate({...base,player:{...base.player,x:1504,y:2200}}),null);
  assert.equal(validateProgress({...freshProgress(),seals:['unknown']}),null);
  assert.equal(validateProgress({...freshProgress(),collected:['unknown']}),null);
  assert.equal(validateProgress({...freshProgress(),tower:true}),null);
  const s=memory();s.setItem(KEY,'invalid');s.setItem(BACKUP,JSON.stringify({...freshState(),version:2,map:'plateau-slice'}));assert.equal(load(s).status,'recovered');
});
