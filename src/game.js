import {freshEquipment,supplies,tools} from './equipment.js?v=0.5.0';
import {updateCombat,distance,samePlane,spend} from './combat.js?v=0.5.0';
import {updateAbilities} from './abilities.js?v=0.5.0';
import {canStand} from './world.js?v=0.5.0';
import { move, initialEnemies, objects, shrines, exit } from './world.js?v=0.5.0';
import {freshProgress,objective} from './progression.js?v=0.5.0';
import { facing } from './input.js?v=0.5.0';
import { freshState } from './save.js?v=0.5.0';
import {freshJourney,maxHearts,maxStamina,discover} from './journey.js?v=0.5.0';
import {shrineDefinitions,makeRoom,roomCanStand,roomLine,roomObjects,updateRoom} from './shrines.js?v=0.5.0';
export class Game {
  constructor(saved=freshState()){
    this.player={...saved.player,kind:'link',r:9,state:'idle',time:0,hurt:0,attack:0,cooldown:0};
    this.checkpoint={...saved.checkpoint};this.defeated=new Set(saved.defeated);this.playTime=saved.playTime;
    this.equipment=structuredClone(saved.equipment??freshEquipment());
    this.swing=null;this.combo=0;this.comboTime=0;this.regenDelay=0;this.abilityCooldown=0;
    this.projectiles=[];this.effects=[];this.ice=[];this.bomb=null;this.heldObject=null;this.aiming=false;this.drawTime=0;
    this.journey=structuredClone(saved.journey??freshJourney());this.room=null;this.outdoor=null;
    this.resetCrates();
    this.progress=structuredClone(saved.progress??freshProgress());this.shrine=null;
    this.enemies=initialEnemies().filter(e=>!this.defeated.has(e.id));this.message='v0.5 · Four tool trials await. Journal / M: map, travel and blessings. E / USE: enter and interact.';this.messageTime=9;this.needsSave=false;
    if(saved.location)this.enterShrine(saved.location.shrine,saved.location.room);
  }
  get maxHearts(){return maxHearts(this)}
  get maxStamina(){return maxStamina(this)}
  clearTransient(){this.swing=null;this.combo=0;this.comboTime=0;this.aiming=false;this.drawTime=0;this.projectiles=[];this.effects=[];this.ice=[];this.bomb=null;this.heldObject=null;this.abilityCooldown=0;this.player.attack=0;this.player.cooldown=0;this.player.blocking=false;}
  enterShrine(id,index=0){
    if(!this.progress.tower||!shrineDefinitions[id])return false;
    if(!this.shrine){
      const s=shrines.find(s=>s.id===id),approach={x:s.x,y:s.y+52,level:s.level};
      this.outdoor={position:approach,enemies:this.enemies,crates:this.crates,tool:this.equipment.tool};
      this.checkpoint={...approach};
    }
    this.shrine=id;discover(this,id);this.enemies=[];this.setRoom(index);return true;
  }
  setRoom(index){
    const room=makeRoom(this.shrine,index);if(!room)return false;
    this.clearTransient();this.room=room;this.crates=room.crates;Object.assign(this.player,room.spawn,{face:'e',hurt:0});
    this.equipment.tool=shrineDefinitions[this.shrine].tool;this.equipment.stamina=this.maxStamina;this.needsSave=true;this.notice(room.hint);return true;
  }
  leaveShrine(){
    if(!this.shrine)return;
    this.clearTransient();Object.assign(this.player,this.outdoor.position);this.enemies=this.outdoor.enemies;this.crates=this.outdoor.crates;this.equipment.tool=this.outdoor.tool;
    this.shrine=null;this.room=null;this.outdoor=null;this.needsSave=true;this.notice('Back on the Plateau. Your shrine rewards are saved.');
  }
  respawn(){
    if(this.shrine)this.setRoom(this.room.index);
    else {this.clearTransient();Object.assign(this.player,this.checkpoint);this.resetCrates();for(const e of this.enemies)Object.assign(e,e.home,{windup:0,cooldown:1,mode:'return'});}
    Object.assign(this.player,{hp:this.maxHearts,hurt:2});this.equipment.stamina=this.maxStamina;this.needsSave=true;this.notice('Checkpoint restored. Rewards kept; room mechanisms reset.');
  }
  clearLine(a,b){return this.room?roomLine(this.room,a,b):null}
  resetCrates(){
    this.crates=[{id:'copper-start',kind:'crate',x:600,y:740,level:0,r:15,frozen:0}];
    // Transient crates must never trap a saved player or a checkpoint respawn.
    for(const c of this.crates)if(distance(c,this.player)<30||distance(c,this.checkpoint)<30)c.x+=64;
  }
  moveBody(body,dx,dy){
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));
    for(let i=0;i<steps;i++){
      const before={x:body.x,y:body.y,level:body.level};
      if(this.room){
        for(const [ax,ay] of [[dx/steps,0],[0,dy/steps]])if(roomCanStand(this.room,body.x+ax,body.y+ay,body.r??9,body===this.player?this.ice:[])){body.x+=ax;body.y+=ay;}
      }else move(body,dx/steps,dy/steps,{...this.progress,ice:body===this.player?this.ice:[]});
      if(this.crates.some(c=>c!==body&&samePlane(c,body)&&distance(c,body)<c.r+(body.r??9))||
        (body.kind==='crate'&&samePlane(body,this.player)&&distance(body,this.player)<body.r+this.player.r))Object.assign(body,before);
    }
  }
  notice(text){this.message=text;this.messageTime=text.length>90?12:7;}
  snapshot(){const safe=this.shrine?this.outdoor.position:canStand(this.player.x,this.player.y,this.player.level)?this.player:this.checkpoint;return {journey:structuredClone(this.journey),location:this.shrine?{shrine:this.shrine,room:this.room.index}:null,equipment:structuredClone(this.equipment),player:{x:safe.x,y:safe.y,level:safe.level,hp:this.player.hp,face:this.player.face},checkpoint:{...this.checkpoint},defeated:[...this.defeated],playTime:this.playTime,progress:structuredClone(this.progress)};}
  nearby(){const p=this.player;return (this.room?roomObjects(this):objects).filter(o=>o.text&&o.level===p.level&&Math.hypot(o.x-p.x,o.y-p.y)<(this.room?48:70)&&!(o.kind==='pickup'&&this.progress.collected.includes(o.id))&&(!this.room||roomLine(this.room,p,o))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];}
  interact(o){
    if(this.room){
      if(!roomObjects(this).some(item=>item.id===o.id)||Math.hypot(o.x-this.player.x,o.y-this.player.y)>=48||!roomLine(this.room,this.player,o))return;
      if(o.id==='room-exit'){if(this.room.index)this.setRoom(this.room.index-1);else this.leaveShrine();}
      else if(o.id==='room-hint')this.notice(this.room.hint);
      else if(o.id==='room-next'){
        if(!this.room.solved){this.notice('The trial is still waiting. Read the sign by the entrance.');return;}
        if(this.room.index<shrineDefinitions[this.shrine].rooms.length-1)this.setRoom(this.room.index+1);else this.recordSeal();
      }else if(o.kind==='chest'){
        if(this.journey.treasures.includes(o.id)){this.notice('This cache is already empty.');return;}
        this.journey.treasures.push(o.id);this.equipment.arrows=Math.min(30,this.equipment.arrows+5);this.player.hp=Math.min(this.maxHearts,this.player.hp+2);this.needsSave=true;this.notice('Shrine cache · 5 trail tokens, 5 arrows and two hearts.');
      }return;
    }
    const p=this.progress;
    if(o.kind==='guide'){
      if(!p.metGuide){p.metGuide=true;this.notice('Rowan: These trails need a keeper. Climb the northern stairs and light the tower. Its beacon will guide you to four quiet shrines.');}
      else if(p.seals.length===4&&!p.exitUnlocked){
        if(o.id!=='rowan-temple'){this.notice('Rowan: You found all four seals! Meet me at the Temple of Time, in the center of the Plateau.');return;}
        p.exitUnlocked=true;this.notice('Rowan: Wind, water, roots, and embers — you know this land now. I have opened the southern descent. Follow the trail beyond the temple.');
      }else this.notice(`Rowan: ${objective(p)}`);
    }else if(o.kind==='tower'){
      if(!p.metGuide){this.notice('A lantern socket is empty. Speak with Rowan by the starting rest stone first.');return;}
      p.tower=true;discover(this,'tower');this.notice('The beacon is lit. Four shrine markers glow on your map. Cross the upper bridge for Windstep; the Journal has directions to the others.');
    }else if(o.kind==='shrine'){
      if(!p.tower){this.notice('The shrine is quiet. Light Plateau Tower with Rowan’s guidance first.');return;}
      this.enterShrine(o.id);return;
    }else if(o.kind==='gate'){this.notice(p.exitUnlocked?'The descent is open. Walk around the trail marker and continue south.':`The descent is sealed. ${objective(p)}`);return;
    }else if(['chest','pickup'].includes(o.kind)){
      if(p.collected.includes(o.id)){this.notice('This cache is empty. Its trail tokens are already in your journal.');return;}
      if(o.kind==='chest'&&this.enemies.some(e=>e.hp>0&&e.level===o.level&&Math.hypot(e.home.x-o.x,e.home.y-o.y)<180)){this.notice('The cache is guarded. Clear the nearby camp first.');return;}
      p.collected.push(o.id);this.player.hp=Math.min(this.maxHearts,this.player.hp+2);this.notice(`${o.kind==='chest'?'Cache opened':'Trail fruit collected'} · +${o.value} trail tokens. Two hearts restored.`);
    }else{this.notice(o.text);if(o.kind==='checkpoint'){discover(this,o.id==='camp-stone'?'start':o.id);this.player.hp=this.maxHearts;this.equipment.stamina=this.maxStamina;this.equipment.sword=40;this.equipment.arrows=Math.max(12,this.equipment.arrows);this.checkpoint={x:this.player.x,y:this.player.y,level:this.player.level};}}
    this.needsSave=true;
  }
  recordSeal(){
    if(!this.shrine||!this.progress.tower||!this.room?.solved||this.room.index!==shrineDefinitions[this.shrine].rooms.length-1||Math.hypot(this.player.x-565,this.player.y-250)>=48)return false;
    if(!this.progress.seals.includes(this.shrine))this.progress.seals.push(this.shrine);
    this.player.hp=this.maxHearts;this.equipment.stamina=this.maxStamina;this.needsSave=true;
    this.notice(`Seal recorded · ${this.progress.seals.length}/4. Spend blessings in the Journal. Return via the entrance or Journal.`);return true;
  }
  update(dt,input){
    const p=this.player;this.playTime+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
    for(const k of ['hurt','cooldown'])p[k]=Math.max(0,p[k]-dt);
    if(this.inputEpoch!==input.epoch){this.aiming=false;this.drawTime=0;this.inputEpoch=input.epoch;}
    if(input.consume('cycle')){this.equipment.tool=tools[(tools.indexOf(this.equipment.tool)+1)%tools.length];this.aiming=false;this.drawTime=0;this.heldObject=null;this.needsSave=true;}
    const v=input.vector();if((v.x||v.y)&&!this.swing)p.face=facing(v.x,v.y);
    p.blocking=!!input.active?.('guard')&&!this.swing&&!this.aiming&&this.equipment.stamina>1;
    const sprint=!!input.active?.('sprint')&&!p.blocking&&!this.aiming&&!this.swing&&!this.heldObject&&(v.x||v.y)&&spend(this,22*dt);
    if(p.blocking)spend(this,7*dt);
    this.regenDelay=Math.max(0,this.regenDelay-dt);
    if(!p.blocking&&!this.aiming&&!this.heldObject&&this.regenDelay===0)this.equipment.stamina=Math.min(this.maxStamina,this.equipment.stamina+24*dt);
    const speed=this.aiming?0:p.blocking?65:this.swing||this.heldObject?85:sprint?215:150;
    this.moveBody(p,v.x*speed*dt,v.y*speed*dt);
    for(const effect of this.effects)effect.life-=dt;this.effects=this.effects.filter(e=>e.life>0);
    p.state=p.attack>0?'attack':(v.x||v.y?'walk':'idle');p.time+=dt;
    if(!this.room&&!this.progress.exitUnlocked&&p.y>exit.y-36&&v.y>0&&this.messageTime<=0)this.notice(`Descent sealed · ${objective(this.progress)}`);
    if(!this.room&&this.progress.exitUnlocked&&!this.progress.completed&&p.y>exit.y+80){this.progress.completed=true;this.needsSave=true;this.notice('The Great Plateau is complete. The road onward awaits a future chapter. You can return and explore freely.');}
    updateAbilities(this,dt,input);
    updateCombat(this,dt,input);
    updateRoom(this,dt);
    for(const kit of this.room?[]:supplies)if(!this.equipment.collected.includes(kit.id)&&samePlane(p,kit)&&distance(p,kit)<25){
      this.equipment.collected.push(kit.id);this.equipment.arrows=Math.min(30,this.equipment.arrows+10);this.equipment.sword=40;this.needsSave=true;this.notice('Trail kit · +10 arrows and a fresh practice blade.');
    }
    if(input.consume('interact')){
      const o=this.nearby();
      if(o)this.interact(o);
      else this.notice('Move closer to a person, shrine, sign, rest stone, or cache.');
      if(this.shrine)return;
    }
  }
}
