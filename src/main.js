import {TILE,MAP,width,height,collides,initialEnemies,shrines,shrineWidth,shrineBlocks,shrineCollides} from './world.js';
import {keys,setupInput} from './input.js';
import {load,save,clear} from './save.js';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
const hearts=document.querySelector('#hearts'),message=document.querySelector('#message'),overlay=document.querySelector('#overlay'),overlayText=document.querySelector('#overlayText');
const old=load();const player={x:old?.x??100,y:590,w:24,h:34,vx:0,vy:0,face:1,hp:old?.hp??5,ground:false,attack:0,cooldown:0,hurt:0};
const flags={gate:old?.flags?.gate===true,shrines:Array.from({length:4},(_,i)=>old?.flags?.shrines?.[i]===true)};let enemies=initialEnemies(),camera=0,paused=false,ended=false,prevJump=false,prevAttack=false,prevInteract=false,last=0,saveClock=0,messageClock=5,activeShrine=-1,returnX=100,guardian=null,orb=false,crystal=false;
setupInput();
function saveProgress(){return save({...player,x:activeShrine>=0?returnX:player.x},flags)}
function notice(text,seconds=3){message.textContent=text;messageClock=seconds;message.hidden=false}
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resize);resize();
function move(body,dt){const blocked=activeShrine<0?collides:(x,y,w,h)=>shrineCollides(activeShrine,x,y,w,h);let dx=body.vx*dt,dy=body.vy*dt;const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8));body.ground=false;for(let i=0;i<steps;i++){if(!blocked(body.x+dx/steps,body.y,body.w,body.h))body.x+=dx/steps;else body.vx=0;if(!blocked(body.x,body.y+dy/steps,body.w,body.h))body.y+=dy/steps;else{if(dy>0)body.ground=true;body.vy=0}}}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function resetPosition(){activeShrine=-1;player.x=100;player.y=590;player.vx=player.vy=0}
function enterShrine(i){activeShrine=i;returnX=player.x;player.x=75;player.y=620;player.vx=player.vy=0;guardian=i===1?{x:510,y:630,w:30,h:30,vx:75,hp:3,alive:true,hit:0}:null;orb=false;crystal=false;notice(shrines[i].task,6)}
function leaveShrine(completed){const i=activeShrine;activeShrine=-1;player.x=returnX;player.y=590;player.vx=player.vy=0;if(completed){flags.shrines[i]=true;saveProgress();notice(`${shrines[i].name} shrine cleared! ${flags.shrines.filter(Boolean).length}/4`,5)}else notice('You left the shrine. Your trial will reset.',4)}
function update(dt){
  messageClock-=dt;if(messageClock<=0)message.hidden=true;
  player.hurt=Math.max(0,player.hurt-dt);player.cooldown=Math.max(0,player.cooldown-dt);player.attack=Math.max(0,player.attack-dt);
  player.vx=(Number(keys.right)-Number(keys.left))*220;if(player.vx)player.face=Math.sign(player.vx);
  if(keys.jump&&!prevJump&&player.ground){player.vy=-525;player.ground=false}prevJump=keys.jump;
  if(keys.attack&&!prevAttack&&player.cooldown<=0){player.attack=.18;player.cooldown=.42;const blade={x:player.face>0?player.x+player.w:player.x-38,y:player.y+4,w:38,h:29};for(const e of activeShrine===1?[guardian]:activeShrine<0?enemies:[])if(e?.alive&&overlap(blade,e)){e.hp--;e.hit=.25;if(e.hp<=0){e.alive=false;notice(activeShrine===1?'Guardian defeated!':'Enemy defeated!')}}if(activeShrine===3&&overlap(blade,{x:485,y:420,w:35,h:50})){crystal=true;notice('Crystal activated! Reach the altar.')}}prevAttack=keys.attack;
  if(keys.interact&&!prevInteract){if(activeShrine>=0){if(player.x<105)leaveShrine(false);else if(player.x>800){const ready=activeShrine===0||activeShrine===1&&!guardian.alive||activeShrine===2&&orb||activeShrine===3&&crystal;if(ready)leaveShrine(true);else notice(shrines[activeShrine].task,4)}}else{const i=shrines.findIndex(s=>Math.abs(player.x-s.x)<80);if(i>=0)enterShrine(i);else if(player.x>width-230)notice(flags.shrines.every(Boolean)?'The gate is open!':'The gate needs four shrine blessings.',4)}}prevInteract=keys.interact;
  player.vy=Math.min(player.vy+1250*dt,700);move(player,dt);
  if(activeShrine===2&&!orb&&overlap(player,{x:607,y:405,w:30,h:35})){orb=true;notice('Sky orb collected! Reach the altar.') }
  if(player.y>height+100)activeShrine>=0?enterShrine(activeShrine):resetPosition();
  for(const e of activeShrine===1?[guardian]:activeShrine<0?enemies:[]){if(!e?.alive)continue;e.hit=Math.max(0,e.hit-dt);e.vy=Math.min((e.vy||0)+1250*dt,700);const direction=e.vx;move(e,dt);if(e.vx===0||e.ground&&!(activeShrine<0?collides:((x,y,w,h)=>shrineCollides(activeShrine,x,y,w,h)))(e.x+(direction>0?e.w+8:-8),e.y+e.h+5,3,3))e.vx=-direction; if(overlap(player,e)&&player.hurt<=0){player.hp--;player.hurt=1.2;player.vy=-260;notice('Ouch! Watch the monsters.');if(player.hp<=0)finish('You fell in battle. Try again!')}}
  if(activeShrine<0&&player.x>width-230){if(flags.shrines.every(Boolean)){if(!flags.gate){flags.gate=true;saveProgress();notice('The Plateau gate is open! More Hyrule is coming later.',8)}}else{player.x=Math.min(player.x,width-230);if(messageClock<=0)notice(`Gate sealed: ${flags.shrines.filter(Boolean).length}/4 shrines cleared.`,3)}}
  saveClock+=dt;if(saveClock>12){saveClock=0;saveProgress()}
  hearts.textContent='♥'.repeat(player.hp)+'♡'.repeat(5-player.hp);
  document.querySelector('#region').textContent=activeShrine<0?`GREAT PLATEAU · SHRINES ${flags.shrines.filter(Boolean).length}/4`:`${shrines[activeShrine].name} SHRINE · ${shrines[activeShrine].task}`;
  camera=Math.max(0,Math.min((activeShrine<0?width:shrineWidth)-innerWidth,player.x-innerWidth*.38));
}
function draw(){const W=innerWidth,H=innerHeight;ctx.fillStyle='#8ab9ce';ctx.fillRect(0,0,W,H);ctx.fillStyle='#e8d898';ctx.beginPath();ctx.arc(W*.78,H*.2,45,0,7);ctx.fill();for(let layer=0;layer<2;layer++){ctx.fillStyle=layer?'#648c86':'#a3b9a2';ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+20;x+=20){const worldX=x+camera*(layer?.23:.1);ctx.lineTo(x,H*(layer?.67:.5)+Math.sin(worldX/190)*40+Math.sin(worldX/73)*14)}ctx.lineTo(W,H);ctx.fill()}
 ctx.save();ctx.translate(-Math.floor(camera),0);
 if(activeShrine>=0){drawShrine();}else{
 for(let row=0;row<MAP.length;row++)for(let col=Math.max(0,Math.floor(camera/TILE));col<Math.min(MAP[0].length,Math.ceil((camera+W)/TILE)+1);col++)if(MAP[row][col]==='#'){const x=col*TILE,y=row*TILE;ctx.fillStyle=row===17?'#7da15e':'#816f57';ctx.fillRect(x,y,TILE,TILE);if(row===17||MAP[row-1]?.[col]!== '#'){ctx.fillStyle='#bdd183';ctx.fillRect(x,y,TILE,8)}ctx.fillStyle='#524f48';ctx.fillRect(x+7,y+19,4,3)}
 for(const x of [320,1090,1820,2660,3290]){ctx.fillStyle='#b5a68b';ctx.fillRect(x,530,16,150);ctx.fillRect(x-18,520,52,14);ctx.fillStyle='#6d796e';ctx.fillRect(x+26,568,8,100)}
 for(let i=0;i<shrines.length;i++){const s=shrines[i];ctx.fillStyle=flags.shrines[i]?'#80d6ab':'#dec893';ctx.fillRect(s.x-22,582,68,98);ctx.fillStyle='#345f67';ctx.fillRect(s.x-8,615,40,65);ctx.fillStyle='#e8f9df';ctx.font='bold 14px sans-serif';ctx.fillText(s.name,s.x-30,570);ctx.fillText(flags.shrines[i]?'✓':'◆',s.x+5,608)}
 ctx.fillStyle='#d3b879';ctx.fillRect(width-180,510,105,170);ctx.fillStyle=flags.shrines.every(Boolean)?'#81db9c':'#405d5c';ctx.fillRect(width-145,590,42,90);ctx.fillStyle='#e2cd91';ctx.fillRect(width-160,505,64,12);ctx.fillStyle='#fff4ca';ctx.font='bold 15px sans-serif';ctx.fillText(`${flags.shrines.filter(Boolean).length}/4`,width-145,570);
 }
 for(const e of activeShrine===1?[guardian]:activeShrine<0?enemies:[])if(e?.alive){ctx.fillStyle=e.hit?'#fff':'#a33d3c';ctx.fillRect(e.x,e.y+8,e.w,e.h-8);ctx.fillStyle='#e6bc68';ctx.fillRect(e.x+5,e.y+13,5,5);ctx.fillRect(e.x+18,e.y+13,5,5)}
 if(player.hurt<=0||Math.floor(player.hurt*12)%2===0){ctx.fillStyle='#d3b175';ctx.fillRect(player.x+5,player.y,15,11);ctx.fillStyle='#4a694e';ctx.fillRect(player.x+3,player.y+11,19,20);ctx.fillStyle='#ddd0a2';ctx.fillRect(player.x+6,player.y+29,5,5);ctx.fillRect(player.x+16,player.y+29,5,5);ctx.fillStyle='#587f4f';ctx.beginPath();ctx.moveTo(player.x+3,player.y+3);ctx.lineTo(player.x+24,player.y+2);ctx.lineTo(player.x-3,player.y+12);ctx.fill();if(player.attack){ctx.strokeStyle='#f7f2db';ctx.lineWidth=6;ctx.beginPath();const bx=player.face>0?player.x+25:player.x-1;ctx.moveTo(bx,player.y+19);ctx.lineTo(bx+player.face*35,player.y-4);ctx.stroke()}}ctx.restore();}
function drawShrine(){ctx.fillStyle='#203b51';ctx.fillRect(0,0,shrineWidth,680);ctx.fillStyle='#4b6974';for(let x=0;x<shrineWidth;x+=80)for(let y=0;y<680;y+=80)ctx.strokeRect(x,y,80,80);ctx.fillStyle='#a4a493';ctx.fillRect(0,680,shrineWidth,80);ctx.fillStyle='#99b7ab';for(const b of shrineBlocks[activeShrine])ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle='#e3d394';ctx.fillRect(830,590,65,90);ctx.fillStyle='#ecdfbd';ctx.font='bold 17px sans-serif';ctx.fillText('ALTAR',825,580);ctx.fillStyle='#8ce9db';ctx.fillRect(20,590,35,90);ctx.fillText('EXIT',18,580);if(activeShrine===2&&!orb){ctx.beginPath();ctx.arc(622,420,17,0,7);ctx.fill()}if(activeShrine===3){ctx.fillStyle=crystal?'#84f7b3':'#f4ae78';ctx.beginPath();ctx.moveTo(503,412);ctx.lineTo(523,444);ctx.lineTo(503,472);ctx.lineTo(483,444);ctx.fill()}}
function frame(t){const dt=Math.min((t-last)/1000||0,.04);last=t;if(!paused&&!ended)update(dt);draw();requestAnimationFrame(frame)}
function finish(text){ended=true;overlayText.textContent=text;overlay.hidden=false}
document.querySelector('#save').onclick=()=>notice(saveProgress()?'Progress saved on this device.':'Saving unavailable in this browser.');
document.querySelector('#pause').onclick=()=>{if(ended)return;paused=!paused;overlayText.textContent='Paused · A/D or arrows to move, Space to jump, J to swing, E to interact. In a shrine, use the glowing entrance to leave.';overlay.hidden=!paused};
document.querySelector('#resume').onclick=()=>{if(ended){player.hp=5;resetPosition();enemies=initialEnemies();ended=false}paused=false;overlay.hidden=true};
document.querySelector('#restart').onclick=()=>{clear();flags.gate=false;flags.shrines.fill(false);player.hp=5;resetPosition();enemies=initialEnemies();ended=paused=false;overlay.hidden=true;notice('A new journey begins.')};
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveProgress()});
requestAnimationFrame(frame);
