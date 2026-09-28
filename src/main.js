import {TILE,MAP,width,height,collides,initialEnemies} from './world.js';
import {keys,setupInput} from './input.js';
import {load,save,clear} from './save.js';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
const hearts=document.querySelector('#hearts'),message=document.querySelector('#message'),overlay=document.querySelector('#overlay'),overlayText=document.querySelector('#overlayText');
const old=load();const player={x:old?.x??100,y:590,w:24,h:34,vx:0,vy:0,face:1,hp:old?.hp??5,ground:false,attack:0,cooldown:0,hurt:0};
const flags={gate:old?.flags?.gate===true};let enemies=initialEnemies(),camera=0,paused=false,ended=false,prevJump=false,prevAttack=false,last=0,saveClock=0,messageClock=5;
setupInput();
function notice(text,seconds=3){message.textContent=text;messageClock=seconds;message.hidden=false}
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resize);resize();
function move(body,dt){let dx=body.vx*dt,dy=body.vy*dt;const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8));body.ground=false;for(let i=0;i<steps;i++){if(!collides(body.x+dx/steps,body.y,body.w,body.h))body.x+=dx/steps;else body.vx=0;if(!collides(body.x,body.y+dy/steps,body.w,body.h))body.y+=dy/steps;else{if(dy>0)body.ground=true;body.vy=0}}}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function resetPosition(){player.x=100;player.y=590;player.vx=player.vy=0}
function update(dt){
  messageClock-=dt;if(messageClock<=0)message.hidden=true;
  player.hurt=Math.max(0,player.hurt-dt);player.cooldown=Math.max(0,player.cooldown-dt);player.attack=Math.max(0,player.attack-dt);
  player.vx=(Number(keys.right)-Number(keys.left))*220;if(player.vx)player.face=Math.sign(player.vx);
  if(keys.jump&&!prevJump&&player.ground){player.vy=-525;player.ground=false}prevJump=keys.jump;
  if(keys.attack&&!prevAttack&&player.cooldown<=0){player.attack=.18;player.cooldown=.42;const blade={x:player.face>0?player.x+player.w:player.x-38,y:player.y+4,w:38,h:29};for(const e of enemies)if(e.alive&&overlap(blade,e)){e.hp--;e.hit=.25;if(e.hp<=0){e.alive=false;notice('Enemy defeated!')}}}prevAttack=keys.attack;
  player.vy=Math.min(player.vy+1250*dt,700);move(player,dt);
  if(player.y>height+100)resetPosition();
  for(const e of enemies){if(!e.alive)continue;e.hit=Math.max(0,e.hit-dt);e.vy=Math.min((e.vy||0)+1250*dt,700);const direction=e.vx;move(e,dt);if(e.vx===0||e.ground&&!collides(e.x+(direction>0?e.w+8:-8),e.y+e.h+5,3,3))e.vx=-direction; if(overlap(player,e)&&player.hurt<=0){player.hp--;player.hurt=1.2;player.vy=-260;notice('Ouch! Watch the monsters.');if(player.hp<=0)finish('You fell in battle. Try again!')}}
  if(player.x>width-220&&!flags.gate){flags.gate=true;save(player,flags);notice('You reached the old gate! The journey continues in a future update.',8)}
  saveClock+=dt;if(saveClock>12){saveClock=0;save(player,flags)}
  hearts.textContent='♥'.repeat(player.hp)+'♡'.repeat(5-player.hp);
  camera=Math.max(0,Math.min(width-innerWidth,player.x-innerWidth*.38));
}
function draw(){const W=innerWidth,H=innerHeight;ctx.fillStyle='#8ab9ce';ctx.fillRect(0,0,W,H);ctx.fillStyle='#e8d898';ctx.beginPath();ctx.arc(W*.78,H*.2,45,0,7);ctx.fill();for(let layer=0;layer<2;layer++){ctx.fillStyle=layer?'#648c86':'#a3b9a2';ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+20;x+=20){const worldX=x+camera*(layer?.23:.1);ctx.lineTo(x,H*(layer?.67:.5)+Math.sin(worldX/190)*40+Math.sin(worldX/73)*14)}ctx.lineTo(W,H);ctx.fill()}
 ctx.save();ctx.translate(-Math.floor(camera),0);
 for(let row=0;row<MAP.length;row++)for(let col=Math.max(0,Math.floor(camera/TILE));col<Math.min(MAP[0].length,Math.ceil((camera+W)/TILE)+1);col++)if(MAP[row][col]==='#'){const x=col*TILE,y=row*TILE;ctx.fillStyle=row===17?'#7da15e':'#816f57';ctx.fillRect(x,y,TILE,TILE);if(row===17||MAP[row-1]?.[col]!== '#'){ctx.fillStyle='#bdd183';ctx.fillRect(x,y,TILE,8)}ctx.fillStyle='#524f48';ctx.fillRect(x+7,y+19,4,3)}
 for(const x of [320,1090,1820,2660,3290]){ctx.fillStyle='#b5a68b';ctx.fillRect(x,530,16,150);ctx.fillRect(x-18,520,52,14);ctx.fillStyle='#6d796e';ctx.fillRect(x+26,568,8,100)}
 ctx.fillStyle='#d3b879';ctx.fillRect(width-180,510,105,170);ctx.fillStyle='#405d5c';ctx.fillRect(width-145,590,42,90);ctx.fillStyle='#e2cd91';ctx.fillRect(width-160,505,64,12);
 for(const e of enemies)if(e.alive){ctx.fillStyle=e.hit?'#fff':'#a33d3c';ctx.fillRect(e.x,e.y+8,e.w,e.h-8);ctx.fillStyle='#e6bc68';ctx.fillRect(e.x+5,e.y+13,5,5);ctx.fillRect(e.x+18,e.y+13,5,5)}
 if(player.hurt<=0||Math.floor(player.hurt*12)%2===0){ctx.fillStyle='#d3b175';ctx.fillRect(player.x+5,player.y,15,11);ctx.fillStyle='#4a694e';ctx.fillRect(player.x+3,player.y+11,19,20);ctx.fillStyle='#ddd0a2';ctx.fillRect(player.x+6,player.y+29,5,5);ctx.fillRect(player.x+16,player.y+29,5,5);ctx.fillStyle='#587f4f';ctx.beginPath();ctx.moveTo(player.x+3,player.y+3);ctx.lineTo(player.x+24,player.y+2);ctx.lineTo(player.x-3,player.y+12);ctx.fill();if(player.attack){ctx.strokeStyle='#f7f2db';ctx.lineWidth=6;ctx.beginPath();const bx=player.face>0?player.x+25:player.x-1;ctx.moveTo(bx,player.y+19);ctx.lineTo(bx+player.face*35,player.y-4);ctx.stroke()}}ctx.restore();}
function frame(t){const dt=Math.min((t-last)/1000||0,.04);last=t;if(!paused&&!ended)update(dt);draw();requestAnimationFrame(frame)}
function finish(text){ended=true;overlayText.textContent=text;overlay.hidden=false}
document.querySelector('#save').onclick=()=>notice(save(player,flags)?'Progress saved on this device.':'Saving unavailable in this browser.');
document.querySelector('#pause').onclick=()=>{if(ended)return;paused=!paused;overlayText.textContent='Paused · Arrow keys / A D to move, Space to jump, J to swing.';overlay.hidden=!paused};
document.querySelector('#resume').onclick=()=>{if(ended){player.hp=5;resetPosition();enemies=initialEnemies();ended=false}paused=false;overlay.hidden=true};
document.querySelector('#restart').onclick=()=>{clear();flags.gate=false;player.hp=5;resetPosition();enemies=initialEnemies();ended=paused=false;overlay.hidden=true;notice('A new journey begins.')};
document.addEventListener('visibilitychange',()=>{if(document.hidden)save(player,flags)});
requestAnimationFrame(frame);
