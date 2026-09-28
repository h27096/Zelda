import {width,height,terrace,eastBank,bridge,stairs,water,objects,elevationAt} from './world.js';
import {followCamera,depthCompare} from './camera.js';
export class Renderer {
  constructor(canvas,assets){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.assets=assets;this.camera={x:0,y:0};this.resize();}
  resize(){const box=this.canvas.getBoundingClientRect();this.cssWidth=box.width;this.cssHeight=box.height;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(box.width*this.dpr);this.canvas.height=Math.round(box.height*this.dpr);this.scale=Math.max(.7,Math.min(1.8,box.width/800,box.height/520));this.viewport={width:box.width/this.scale,height:box.height/this.scale};this.snap=true;}
  draw(game,dt){
    const ctx=this.ctx,p=game.player;
    this.camera=followCamera(this.camera,{x:p.x,y:p.y-elevationAt(p.x,p.y,p.level)-10},this.viewport,{width,height},dt,this.snap);this.snap=false;
    ctx.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,0,0);ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#6f965a';ctx.fillRect(0,0,this.viewport.width,this.viewport.height);
    ctx.save();ctx.translate(-Math.round(this.camera.x),-Math.round(this.camera.y));
    this.ground(ctx,game.playTime);
    const entities=[...objects,...game.enemies.filter(e=>e.hp>0),p].sort(depthCompare);
    for(const e of entities.filter(e=>e.level===0))this.entity(ctx,e);
    // Upper surfaces occlude the lower path; upper actors/props sort by their feet.
    this.upper(ctx);
    for(const e of entities.filter(e=>e.level===1))this.entity(ctx,e);
    ctx.restore();
  }
  entity(ctx,e){const y=e.y-elevationAt(e.x,e.y,e.level);if(e.x<this.camera.x-80||e.x>this.camera.x+this.viewport.width+80||y<this.camera.y-100||y>this.camera.y+this.viewport.height+100)return;if(e.kind==='link'&&e.hurt>0&&Math.floor(e.hurt*12)%2)return;this.assets.draw(ctx,e,e.x,y);}
  ground(ctx,time){
    ctx.fillStyle='#709957';ctx.fillRect(0,0,width,height);
    const left=Math.max(32,Math.floor(this.camera.x/32)*32),top=Math.max(32,Math.floor(this.camera.y/32)*32);
    for(let y=top;y<Math.min(height-32,this.camera.y+this.viewport.height+32);y+=32)for(let x=left;x<Math.min(width-32,this.camera.x+this.viewport.width+32);x+=32){const hash=(x*17+y*31)%97;ctx.fillStyle=hash<45?'#80a562':'#668f51';ctx.fillRect(x+hash%21,y+hash%17,3,5);if(hash<18){ctx.fillStyle='#d3d79b';ctx.fillRect(x+15,y+9,3,3)}}
    ctx.strokeStyle='#b5aa76';ctx.lineWidth=64;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(330,800);ctx.lineTo(330,700);ctx.lineTo(710,655);ctx.lineTo(720,565);ctx.moveTo(560,690);ctx.lineTo(950,600);ctx.lineTo(980,430);ctx.lineTo(980,270);ctx.stroke();
    ctx.fillStyle='#477f89';ctx.fillRect(water.x,water.y,water.w,water.h);ctx.fillStyle='#68a6ac';
    for(let y=water.y+10;y<water.y+water.h;y+=24)for(let x=water.x+10;x<water.x+water.w-15;x+=36)ctx.fillRect(x+Math.sin(time*1.3+y)*4,y,17,2);
    ctx.fillStyle='#4a6952';ctx.fillRect(0,0,width,32);ctx.fillRect(0,height-32,width,32);ctx.fillRect(0,0,32,height);ctx.fillRect(width-32,0,32,height);
    for(const b of [terrace,eastBank]){ctx.fillStyle='#756c4e';ctx.fillRect(b.x,b.y-48,b.w,b.h+48);ctx.fillStyle='#9b8960';for(let x=b.x+8;x<b.x+b.w;x+=32)ctx.fillRect(x,b.y+b.h-40,21,28);}
    this.ramp(ctx);
    ctx.fillStyle='#f2e6b4';ctx.font='bold 13px system-ui';ctx.fillText('RESTING GLADE',260,838);ctx.fillText('LOWER PATH',940,480);
  }
  ramp(ctx){
    const bottom=stairs.y+stairs.h;ctx.fillStyle='#b7ab80';ctx.fillRect(stairs.x,stairs.y-48,stairs.w,stairs.h+48);
    ctx.strokeStyle='#837854';ctx.lineWidth=2;for(let i=0;i<=8;i++){const y=bottom-i*22;ctx.beginPath();ctx.moveTo(stairs.x,y);ctx.lineTo(stairs.x+stairs.w,y);ctx.stroke();}
    ctx.fillStyle='#d5c699';ctx.fillRect(stairs.x-4,stairs.y-48,4,stairs.h+48);ctx.fillRect(stairs.x+stairs.w,stairs.y-48,4,stairs.h+48);
  }
  upper(ctx){
    for(const b of [terrace,eastBank]){ctx.fillStyle='#8ba36b';ctx.fillRect(b.x,b.y-48,b.w,b.h);ctx.strokeStyle='#c2bd82';ctx.lineWidth=4;ctx.strokeRect(b.x+2,b.y-46,b.w-4,b.h-4);}
    // Repaint the top of the ramp only; do not cover its lower-floor actor.
    ctx.fillStyle='#b7ab80';ctx.fillRect(stairs.x,stairs.y-48,stairs.w,32);
    ctx.fillStyle='#263e3544';ctx.fillRect(bridge.x,bridge.y+30,bridge.w,bridge.h-8);
    ctx.fillStyle='#927549';ctx.fillRect(bridge.x,bridge.y-48,bridge.w,bridge.h);
    ctx.strokeStyle='#574c36';ctx.lineWidth=2;for(let x=bridge.x;x<=bridge.x+bridge.w;x+=16){ctx.beginPath();ctx.moveTo(x,bridge.y-48);ctx.lineTo(x,bridge.y+bridge.h-48);ctx.stroke();}
    ctx.fillStyle='#d1b87a';ctx.fillRect(bridge.x,bridge.y-48,bridge.w,5);ctx.fillRect(bridge.x,bridge.y+bridge.h-53,bridge.w,5);
    ctx.fillStyle='#e9e4bd';ctx.font='bold 13px system-ui';ctx.fillText('PLATEAU OVERLOOK',620,185);
  }
}
