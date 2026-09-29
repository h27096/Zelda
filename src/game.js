import { spawn, move, initialEnemies, objects, shrines, exit } from './world.js?v=0.3.0';
import {freshProgress,objective} from './progression.js?v=0.3.0';
import { movementVector, facing, directionNames } from './input.js?v=0.3.0';
import { freshState } from './save.js?v=0.3.0';
export class Game {
  constructor(saved=freshState()){
    this.player={...saved.player,kind:'link',r:9,state:'idle',time:0,hurt:0,attack:0,cooldown:0};
    this.checkpoint={...saved.checkpoint};this.defeated=new Set(saved.defeated);this.playTime=saved.playTime;
    this.progress=structuredClone(saved.progress??freshProgress());this.shrine=null;
    this.enemies=initialEnemies().filter(e=>!this.defeated.has(e.id));this.message='Use E / USE near people and landmarks. Open Journal for your map and objectives.';this.messageTime=9;this.needsSave=false;
  }
  notice(text){this.message=text;this.messageTime=text.length>90?12:7;}
  snapshot(){return {player:{x:this.player.x,y:this.player.y,level:this.player.level,hp:this.player.hp,face:this.player.face},checkpoint:{...this.checkpoint},defeated:[...this.defeated],playTime:this.playTime,progress:structuredClone(this.progress)};}
  nearby(){const p=this.player;return objects.filter(o=>o.text&&o.level===p.level&&Math.hypot(o.x-p.x,o.y-p.y)<70&&!(o.kind==='pickup'&&this.progress.collected.includes(o.id))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];}
  interact(o){
    const p=this.progress;
    if(o.kind==='guide'){
      if(!p.metGuide){p.metGuide=true;this.notice('Rowan: These trails need a keeper. Climb the northern stairs and light the tower. Its beacon will guide you to four quiet shrines.');}
      else if(p.seals.length===4&&!p.exitUnlocked){
        if(o.id!=='rowan-temple'){this.notice('Rowan: You found all four seals! Meet me at the Temple of Time, in the center of the Plateau.');return;}
        p.exitUnlocked=true;this.notice('Rowan: Wind, water, roots, and embers — you know this land now. I have opened the southern descent. Follow the trail beyond the temple.');
      }else this.notice(`Rowan: ${objective(p)}`);
    }else if(o.kind==='tower'){
      if(!p.metGuide){this.notice('A lantern socket is empty. Speak with Rowan by the starting rest stone first.');return;}
      p.tower=true;this.notice('The beacon is lit. Four shrine markers glow on your map. Cross the upper bridge for Windstep; the Journal has directions to the others.');
    }else if(o.kind==='shrine'){
      if(!p.tower){this.notice('The shrine is quiet. Light Plateau Tower with Rowan’s guidance first.');return;}
      this.shrine=o.id;return;
    }else if(o.kind==='gate'){this.notice(p.exitUnlocked?'The descent is open. Walk around the trail marker and continue south.':`The descent is sealed. ${objective(p)}`);return;
    }else if(['chest','pickup'].includes(o.kind)){
      if(p.collected.includes(o.id)){this.notice('This cache is empty. Its trail tokens are already in your journal.');return;}
      if(o.kind==='chest'&&this.enemies.some(e=>e.hp>0&&e.level===o.level&&Math.hypot(e.home.x-o.x,e.home.y-o.y)<180)){this.notice('The cache is guarded. Clear the nearby camp first.');return;}
      p.collected.push(o.id);this.player.hp=Math.min(5,this.player.hp+2);this.notice(`${o.kind==='chest'?'Cache opened':'Trail fruit collected'} · +${o.value} trail tokens. Two hearts restored.`);
    }else{this.notice(o.text);if(o.kind==='checkpoint'){this.player.hp=5;this.checkpoint={x:this.player.x,y:this.player.y,level:this.player.level};}}
    this.needsSave=true;
  }
  recordSeal(){
    if(!this.shrine||!this.progress.tower||!shrines.some(s=>s.id===this.shrine))return;
    if(!this.progress.seals.includes(this.shrine))this.progress.seals.push(this.shrine);
    this.player.hp=5;this.needsSave=true;
    this.notice(`Seal recorded · ${this.progress.seals.length}/4. ${objective(this.progress)}`);
  }
  update(dt,input){
    if(this.shrine)return; // Lightweight sanctuary view freezes the outside simulation.
    const p=this.player;this.playTime+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
    for(const k of ['hurt','attack','cooldown'])p[k]=Math.max(0,p[k]-dt);
    const v=input.vector();if(v.x||v.y)p.face=facing(v.x,v.y);
    move(p,v.x*150*dt,v.y*150*dt,this.progress);p.state=p.attack>0?'attack':(v.x||v.y?'walk':'idle');p.time+=dt;
    if(!this.progress.exitUnlocked&&p.y>exit.y-36&&v.y>0&&this.messageTime<=0)this.notice(`Descent sealed · ${objective(this.progress)}`);
    if(this.progress.exitUnlocked&&!this.progress.completed&&p.y>exit.y+80){this.progress.completed=true;this.needsSave=true;this.notice('The Great Plateau is complete. The road onward awaits a future chapter. You can return and explore freely.');}
    if(input.consume('attack')&&p.cooldown===0){
      p.attack=.22;p.cooldown=.38;p.state='attack';
      const angle=directionNames.indexOf(p.face)*Math.PI/4;
      for(const e of this.enemies){
        const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
        if(e.hp>0&&e.level===p.level&&d<62&&(d<18||(dx*Math.cos(angle)+dy*Math.sin(angle))/d>.15)){
          e.hp--;e.hurt=.25;const knock=movementVector(dx,dy);move(e,knock.x*18,knock.y*18);
          if(e.hp<=0){this.defeated.add(e.id);this.needsSave=true;this.notice('Camp cleared · The trail is quiet again.');}
        }
      }
    }
    if(input.consume('interact')){
      const o=this.nearby();
      if(o)this.interact(o);
      else this.notice('Move closer to a person, shrine, sign, rest stone, or cache.');
      if(this.shrine)return;
    }
    for(const e of this.enemies){
      if(e.hp<=0)continue;e.time+=dt;e.hurt=Math.max(0,e.hurt-dt);e.cooldown=Math.max(0,e.cooldown-dt);
      const d=Math.hypot(p.x-e.x,p.y-e.y),chase=d<220&&p.level===e.level;
      const target=chase?p:e.home,dx=target.x-e.x,dy=target.y-e.y;
      const moving=Math.hypot(dx,dy)>12;const v=moving?movementVector(dx,dy):{x:0,y:0};
      e.state=moving?'walk':'idle';if(moving)e.face=facing(v.x,v.y);
      if(e.hurt===0)move(e,v.x*(chase?62:38)*dt,v.y*(chase?62:38)*dt);
      if(p.level===e.level&&Math.hypot(p.x-e.x,p.y-e.y)<24&&p.hurt===0&&e.hurt===0){
        p.hp--;p.hurt=1.2;e.cooldown=1;const v=movementVector(p.x-e.x,p.y-e.y);move(p,v.x*20,v.y*20);
        if(p.hp<=0){Object.assign(p,this.checkpoint??spawn,{hp:5,hurt:2});this.notice('Back at your rest point · Try approaching with your sword.');this.needsSave=true;}
      }
    }
  }
}
