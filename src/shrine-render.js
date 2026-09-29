import {roomObjects,shrineDefinitions} from './shrines.js?v=0.5.0';
import {drawCombatEntity,drawActorCues} from './combat-render.js?v=0.5.0';

// Feet-based depth, raised masonry and independent semantic props retain the
// outdoor 2.5D language. No raster asset is required by puzzle logic.
export function drawShrine(renderer,g){
  const ctx=renderer.ctx,r=g.room,p=g.player;
  // Keep the hero in the middle safe band between HUD and touch controls.
  const scale=renderer.scale;
  const view=renderer.viewport;
  renderer.camera={x:view.width>=r.width?(r.width-view.width)/2:Math.max(0,Math.min(r.width-view.width,p.x-view.width/2)),y:p.y-view.height*.53};
  ctx.setTransform(renderer.dpr*scale,0,0,renderer.dpr*scale,0,0);ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#101e26';ctx.fillRect(0,0,view.width,view.height);
  ctx.save();ctx.translate(-renderer.camera.x,-renderer.camera.y);
  ctx.fillStyle='#344a4c';ctx.fillRect(24,24,r.width-48,r.height-48);
  ctx.strokeStyle='#46605e';ctx.lineWidth=1;
  for(let x=24;x<r.width-24;x+=32)for(let y=24;y<r.height-24;y+=32)ctx.strokeRect(x,y,32,32);
  ctx.fillStyle='#92b9ac';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(shrineDefinitions[g.shrine].title.toUpperCase(),r.width/2,56);
  for(const w of r.waters){ctx.fillStyle='#2b687d';ctx.fillRect(w.x,w.y,w.w,w.h);ctx.fillStyle='#75b9c4';for(let y=40;y<450;y+=28)ctx.fillRect(w.x+10+Math.sin(g.playTime+y)*4,y,w.w-20,2);}
  for(const i of g.ice){ctx.fillStyle=i.life<4?'#b4d2d1':'#b2e2e5';ctx.fillRect(i.x,i.y,i.w,i.h);}
  for(const plate of r.plates){ctx.fillStyle='#b79b5c';ctx.fillRect(plate.x-23,plate.y-23,46,46);ctx.strokeStyle='#f3e1a0';ctx.strokeRect(plate.x-19,plate.y-19,38,38);}
  for(const t of r.targets){ctx.fillStyle=r.solved?'#b7ebba':'#d7a56e';ctx.beginPath();ctx.arc(t.x,t.y,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#503d33';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#503d33';ctx.fillText('◎',t.x,t.y+5);}
  if(r.gate){ctx.fillStyle=r.open?'#8dc6ad':'#cd9563';ctx.fillRect(r.gate.x,r.gate.y,r.gate.w,r.gate.h);if(r.open){ctx.fillStyle='#344a4c';ctx.fillRect(r.gate.x+3,r.gate.y,r.gate.w-6,r.gate.h);}}
  const masonry=[...r.walls,{x:8,y:24,w:16,h:432},{x:616,y:24,w:16,h:432},{x:8,y:8,w:624,h:16},{x:8,y:456,w:624,h:16}];
  p.aiming=g.aiming;p.swingAge=g.swing?.age??-1;p.combo=g.combo;
  const entities=[...g.crates,...g.projectiles,...g.effects,...(g.bomb?[g.bomb]:[]),p,...roomObjects(g),...masonry.map(w=>({...w,kind:'wall',sortY:w.y+w.h}))].sort((a,b)=>(a.sortY??a.y)-(b.sortY??b.y));
  for(const e of entities){
    if(e.kind==='wall'){ctx.fillStyle='#1a3037';ctx.fillRect(e.x,e.y,e.w,e.h);ctx.fillStyle='#60766e';ctx.fillRect(e.x,e.y-18,e.w,e.h);ctx.strokeStyle='#8b9b87';ctx.strokeRect(e.x,e.y-18,e.w,e.h);}
    else if(e.kind==='door'||e.kind==='altar'){
      ctx.fillStyle='#182c32';ctx.fillRect(e.x-23,e.y-10,46,26);ctx.fillStyle=e.kind==='door'?'#b4cbb4':r.solved?'#c4edbc':'#829894';ctx.fillRect(e.x-21,e.y-24,42,26);
      ctx.fillStyle='#182c32';ctx.fillText(e.kind==='door'?'←':r.index?'◇':'→',e.x,e.y-7);
    }else if(e.kind==='chest'){renderer.assets.draw(ctx,{...e,active:g.journey.treasures.includes(e.id)},e.x,e.y);}
    else if(['crate','arrow','orb','impact','guard','blast','still'].includes(e.kind))drawCombatEntity(ctx,e,e.x,e.y);
    else if(!(e.kind==='link'&&e.hurt>0&&Math.floor(e.hurt*12)%2)){renderer.assets.draw(ctx,e,e.x,e.y);drawActorCues(ctx,e,e.x,e.y);}
  }
  ctx.restore();
}
