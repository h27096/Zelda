import {direction,distance,samePlane,clearPath,spend,hitEnemy,hurtPlayer,inArc} from './combat.js?v=0.4.0';
import {waters,inside,canStand} from './world.js?v=0.4.0';
// Each prototype owns activation and transient state. Shrine systems can call these
// without knowing about DOM controls or placeholder graphics.
export const abilities={
  pulse:{activate(g){
    const p=g.player;
    if(g.bomb){if(g.bomb.age<.65){g.notice('Orb arming · Step clear, then trigger again.');return false;}const b=g.bomb;g.bomb=null;g.effects.push({...b,kind:'blast',life:.4});
      for(const e of g.enemies)if(distance(b,e)<88&&clearPath(g,b,e))hitEnemy(g,e,3,b);
      if(distance(b,p)<88&&clearPath(g,b,p))hurtPlayer(g,b,2,false);g.abilityCooldown=1.2;return true;
    }
    if(!spend(g,16))return false;
    const v=direction(p.face),b={x:p.x,y:p.y,level:p.level,r:6,kind:'orb',age:0};
    g.moveBody(b,v.x*68,v.y*68);if(distance(b,p)<24){g.equipment.stamina+=16;g.notice('No room to throw an orb.');return false;}g.bomb=b;return true;
  }},
  tether:{activate(g){if(g.heldObject){g.heldObject=null;return true;}const c=g.crates.find(c=>inArc(g.player,c,130,0)&&clearPath(g,g.player,c));
    if(!c||!spend(g,8)){g.notice('Face the copper crate near the starting trail.');return false;}g.heldObject=c;return true;}},
  still:{activate(g){const e=[...g.enemies.filter(e=>e.hp>0),...g.crates].filter(e=>inArc(g.player,e,170,.5)&&clearPath(g,g.player,e)).sort((a,b)=>distance(a,g.player)-distance(b,g.player))[0];
    if(!e||!spend(g,28)){g.notice('Stillmark needs a visible nearby target and 28 stamina.');return false;}e.frozen=3;g.effects.push({...e,kind:'still',life:3});g.abilityCooldown=4;return true;}},
  frost:{activate(g){const p=g.player,v=direction(p.face);if(p.level!==0)return false;
    const w=waters.find(w=>inside(p.x+v.x*65,p.y+v.y*65,w));if(!w||!spend(g,30)){g.notice('Face a nearby pond from its bank · Frostpath costs 30 stamina.');return false;}
    const horizontal=Math.abs(v.x)>Math.abs(v.y),patch=horizontal?{x:w.x-20,y:Math.max(w.y+12,Math.min(w.y+w.h-60,p.y-24)),w:w.w+40,h:48}:{x:Math.max(w.x+12,Math.min(w.x+w.w-60,p.x-24)),y:w.y-20,w:48,h:w.h+40};
    if(g.ice.some(i=>inside(p.x,p.y,i, -10))){g.equipment.stamina+=30;return false;}
    g.ice=[{...patch,life:18}];g.abilityCooldown=2;return true;
  }}
};
export function updateAbilities(g,dt,input){
  const p=g.player;g.abilityCooldown=Math.max(0,g.abilityCooldown-dt);
  if(g.bomb)g.bomb.age+=dt;
  for(const c of g.crates)c.frozen=Math.max(0,(c.frozen||0)-dt);
  for(const i of g.ice)i.life-=dt;
  // An occupied crossing remains supported until the player reaches land.
  g.ice=g.ice.filter(i=>i.life>0||inside(p.x,p.y,i,-12));
  if(g.heldObject){const c=g.heldObject;
    if(g.equipment.tool!=='tether'||!samePlane(c,p)||distance(c,p)>150||!spend(g,12*dt))g.heldObject=null;
    else if(!c.frozen){const v=direction(p.face),dx=p.x+v.x*55-c.x,dy=p.y+v.y*55-c.y,d=Math.hypot(dx,dy);if(d>1)g.moveBody(c,dx/d*Math.min(d,110*dt),dy/d*Math.min(d,110*dt));}
  }
  const held=input.active?.('tool')??false;
  if(g.equipment.tool==='bow'){
    if(held&&!p.blocking&&!g.swing){g.aiming=true;g.drawTime=Math.min(.8,g.drawTime+dt);}
    else if(g.aiming){g.aiming=false;if(!p.blocking&&g.equipment.arrows>0&&spend(g,6)){const v=direction(p.face);g.projectiles.push({x:p.x,y:p.y,level:p.level,kind:'arrow',dx:v.x,dy:v.y,life:1.5});g.equipment.arrows--;g.needsSave=true;}else g.notice('Bow needs arrows and stamina.');g.drawTime=0;}
    input.consume('tool');
  }else if(input.consume('tool')&&!p.blocking&&!g.swing&&g.abilityCooldown===0){abilities[g.equipment.tool]?.activate(g);}
}
