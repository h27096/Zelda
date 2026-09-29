import { spawn, move, initialEnemies, objects } from './world.js?v=0.2.0';
import { movementVector, facing, directionNames } from './input.js?v=0.2.0';
import { freshState } from './save.js?v=0.2.0';
export class Game {
  constructor(saved=freshState()){
    this.player={...saved.player,kind:'link',r:9,state:'idle',time:0,hurt:0,attack:0,cooldown:0};
    this.checkpoint={...saved.checkpoint};this.defeated=new Set(saved.defeated);this.playTime=saved.playTime;
    this.enemies=initialEnemies().filter(e=>!this.defeated.has(e.id));this.message='Follow the trail north to the stairs.';this.messageTime=7;this.needsSave=false;
  }
  notice(text){this.message=text;this.messageTime=5;}
  snapshot(){return {player:{x:this.player.x,y:this.player.y,level:this.player.level,hp:this.player.hp,face:this.player.face},checkpoint:{...this.checkpoint},defeated:[...this.defeated],playTime:this.playTime};}
  update(dt,input){
    const p=this.player;this.playTime+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
    for(const k of ['hurt','attack','cooldown'])p[k]=Math.max(0,p[k]-dt);
    const v=input.vector();if(v.x||v.y)p.face=facing(v.x,v.y);
    move(p,v.x*150*dt,v.y*150*dt);p.state=p.attack>0?'attack':(v.x||v.y?'walk':'idle');p.time+=dt;
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
      const o=objects.find(o=>o.text&&o.level===p.level&&Math.hypot(o.x-p.x,o.y-p.y)<70);
      if(o){this.notice(o.text);if(o.kind==='checkpoint'){p.hp=5;this.checkpoint={x:p.x,y:p.y,level:p.level};this.needsSave=true}}
      else this.notice('Use the rest stone or a trail sign when nearby.');
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
