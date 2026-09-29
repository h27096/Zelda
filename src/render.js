import {width,height,bridge,stairs,objects,elevationAt,surfaces,ramps,waters,regions,trails,shrines,exit} from './world.js?v=0.3.0';
import {followCamera,depthCompare} from './camera.js?v=0.3.0';
export class Renderer {
  constructor(canvas,assets){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.assets=assets;this.camera={x:0,y:0};this.resize();}
  resize(){const box=this.canvas.getBoundingClientRect();this.cssWidth=box.width;this.cssHeight=box.height;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(box.width*this.dpr);this.canvas.height=Math.round(box.height*this.dpr);this.scale=Math.max(.7,Math.min(1.8,box.width/800,box.height/520));this.viewport={width:box.width/this.scale,height:box.height/this.scale};this.snap=true;}
  draw(game,dt){
    const ctx=this.ctx,p=game.player;
    this.camera=followCamera(this.camera,{x:p.x,y:p.y-elevationAt(p.x,p.y,p.level)-10},this.viewport,{width,height},dt,this.snap);this.snap=false;
    ctx.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,0,0);ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#6f965a';ctx.fillRect(0,0,this.viewport.width,this.viewport.height);
    ctx.save();ctx.translate(-Math.round(this.camera.x),-Math.round(this.camera.y));
    this.ground(ctx,game.playTime,game.progress);
    const entities=[...objects.filter(o=>!(o.kind==='pickup'&&game.progress.collected.includes(o.id))).map(o=>({...o,active:o.kind==='tower'?game.progress.tower:o.kind==='shrine'?game.progress.seals.includes(o.id):o.kind==='gate'?game.progress.exitUnlocked:game.progress.collected.includes(o.id)})),...game.enemies.filter(e=>e.hp>0),p].sort(depthCompare);
    for(const e of entities.filter(e=>e.level===0))this.entity(ctx,e);
    // Upper surfaces occlude the lower path; upper actors/props sort by their feet.
    this.upper(ctx);
    for(const e of entities.filter(e=>e.level===1))this.entity(ctx,e);
    ctx.restore();
  }
  entity(ctx,e){const y=e.y-elevationAt(e.x,e.y,e.level);if(e.x<this.camera.x-120||e.x>this.camera.x+this.viewport.width+120||y<this.camera.y-160||y>this.camera.y+this.viewport.height+160)return;if(e.kind==='link'&&e.hurt>0&&Math.floor(e.hurt*12)%2)return;this.assets.draw(ctx,e,e.x,y);}
  ground(ctx,time,progress){
    ctx.fillStyle='#709957';ctx.fillRect(0,0,width,height);
    for(const r of regions){ctx.fillStyle=r.color;ctx.fillRect(r.x,r.y,r.w,r.h);}
    const left=Math.max(32,Math.floor(this.camera.x/32)*32),top=Math.max(32,Math.floor(this.camera.y/32)*32);
    for(let y=top;y<Math.min(height-32,this.camera.y+this.viewport.height+32);y+=32)for(let x=left;x<Math.min(width-32,this.camera.x+this.viewport.width+32);x+=32){const hash=(x*17+y*31)%97;ctx.fillStyle=hash<45?'#80a562':'#668f51';ctx.fillRect(x+hash%21,y+hash%17,3,5);if(hash<18){ctx.fillStyle='#d3d79b';ctx.fillRect(x+15,y+9,3,3)}}
    ctx.strokeStyle='#b5aa76';ctx.lineWidth=56;ctx.lineCap='round';
    for(const trail of trails){ctx.beginPath();trail.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
    for(const water of waters){
      if(water.x>this.camera.x+this.viewport.width||water.x+water.w<this.camera.x||water.y>this.camera.y+this.viewport.height||water.y+water.h<this.camera.y)continue;
      ctx.fillStyle='#b5b98a';ctx.fillRect(water.x-6,water.y-6,water.w+12,water.h+12);
      ctx.fillStyle='#477f89';ctx.fillRect(water.x,water.y,water.w,water.h);ctx.fillStyle='#68a6ac';
      for(let y=water.y+10;y<water.y+water.h;y+=24)for(let x=water.x+10;x<water.x+water.w-15;x+=36)ctx.fillRect(x+Math.sin(time*1.3+y)*4,y,17,2);
    }
    ctx.fillStyle='#4a6952';ctx.fillRect(0,0,width,32);ctx.fillRect(0,height-32,width,32);ctx.fillRect(0,0,32,height);ctx.fillRect(width-32,0,32,height);
    for(const b of surfaces){ctx.fillStyle='#756c4e';ctx.fillRect(b.x,b.y-48,b.w,b.h+48);ctx.fillStyle='#9b8960';for(let x=b.x+8;x<b.x+b.w;x+=32)ctx.fillRect(x,b.y+b.h-40,21,28);}
    for(const s of ramps)this.ramp(ctx,s);
    ctx.fillStyle='#655f48';ctx.fillRect(32,exit.y,exit.x-exit.w/2-32,192);ctx.fillRect(exit.x+exit.w/2,exit.y,width-exit.x-exit.w/2-32,192);
    if(!progress.exitUnlocked){ctx.fillStyle='#d6bc7e';ctx.fillRect(exit.x-exit.w/2,exit.y-5,exit.w,10);}
    ctx.fillStyle='#f2e6b4';ctx.font='bold 13px system-ui';ctx.fillText('LOWER PATH',940,480);
    for(const r of regions){if(r.name==='Plateau Tower'||r.name==='Ember Highlands')continue;ctx.fillText(r.name.toUpperCase(),r.x+20,r.y+r.h-24);}
    ctx.fillText('THE ROAD AHEAD',exit.x-55,2250);
  }
  ramp(ctx,stairs){
    const bottom=stairs.y+stairs.h;ctx.fillStyle='#b7ab80';ctx.fillRect(stairs.x,stairs.y-48,stairs.w,stairs.h+48);
    ctx.strokeStyle='#837854';ctx.lineWidth=2;for(let i=0;i<=8;i++){const y=bottom-i*22;ctx.beginPath();ctx.moveTo(stairs.x,y);ctx.lineTo(stairs.x+stairs.w,y);ctx.stroke();}
    ctx.fillStyle='#d5c699';ctx.fillRect(stairs.x-4,stairs.y-48,4,stairs.h+48);ctx.fillRect(stairs.x+stairs.w,stairs.y-48,4,stairs.h+48);
  }
  upper(ctx){
    for(const b of surfaces){ctx.fillStyle=b.x>2000?'#ae9b78':'#8ba36b';ctx.fillRect(b.x,b.y-48,b.w,b.h);ctx.strokeStyle='#c2bd82';ctx.lineWidth=4;ctx.strokeRect(b.x+2,b.y-46,b.w-4,b.h-4);}
    // Repaint the top of the ramp only; do not cover its lower-floor actor.
    ctx.fillStyle='#b7ab80';for(const s of ramps)ctx.fillRect(s.x,s.y-48,s.w,32);
    ctx.fillStyle='#263e3544';ctx.fillRect(bridge.x,bridge.y+30,bridge.w,bridge.h-8);
    ctx.fillStyle='#927549';ctx.fillRect(bridge.x,bridge.y-48,bridge.w,bridge.h);
    ctx.strokeStyle='#574c36';ctx.lineWidth=2;for(let x=bridge.x;x<=bridge.x+bridge.w;x+=16){ctx.beginPath();ctx.moveTo(x,bridge.y-48);ctx.lineTo(x,bridge.y+bridge.h-48);ctx.stroke();}
    ctx.fillStyle='#d1b87a';ctx.fillRect(bridge.x,bridge.y-48,bridge.w,5);ctx.fillRect(bridge.x,bridge.y+bridge.h-53,bridge.w,5);
    ctx.fillStyle='#e9e4bd';ctx.font='bold 13px system-ui';ctx.fillText('PLATEAU TOWER',620,185);ctx.fillText('EMBER HIGHLANDS',2340,1530);
  }
}

// Journal map is drawn only when opened, using the actual world data.
export function drawMap(canvas,game){
  const ctx=canvas.getContext('2d'),s=canvas.width/width;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(s,s);
  ctx.fillStyle='#647a58';ctx.fillRect(0,0,width,height);
  for(const r of regions){ctx.fillStyle=r.color;ctx.fillRect(r.x,r.y,r.w,r.h);}
  ctx.strokeStyle='#d5c28e';ctx.lineWidth=20;
  for(const t of trails){ctx.beginPath();t.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  for(const w of waters){ctx.fillStyle='#568d9b';ctx.fillRect(w.x,w.y,w.w,w.h);}
  for(const b of surfaces){ctx.strokeStyle='#e3d3a4';ctx.lineWidth=12;ctx.strokeRect(b.x,b.y,b.w,b.h);}
  ctx.fillStyle='#d5b284';ctx.fillRect(bridge.x,bridge.y,bridge.w,bridge.h);
  const points=[{x:340,y:700,name:'Start'},{x:800,y:320,name:'Tower'},{x:1456,y:1440,name:'Temple'},{x:1536,y:2080,name:game.progress.exitUnlocked?'Descent open':'Descent sealed'},...(game.progress.tower?shrines.map(r=>({...r,name:r.name.replace(' Shrine',''),done:game.progress.seals.includes(r.id)})):[])];
  ctx.font='bold 90px system-ui';ctx.textAlign='center';
  for(const p of points){ctx.fillStyle=p.done?'#b6e9ae':'#fff0c3';ctx.beginPath();ctx.arc(p.x,p.y,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#172f2a';ctx.fillText((p.done?'✓ ':'')+p.name,p.x,p.y-48);}
  ctx.fillStyle='#ffffff';ctx.strokeStyle='#172f2a';ctx.lineWidth=12;ctx.beginPath();ctx.arc(game.player.x,game.player.y,30,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
