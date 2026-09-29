import {direction} from './combat.js?v=0.5.0';
// Effects are expressed in world units and independent of animation assets.
export function drawCombatEntity(ctx,e,x,y){
  ctx.save();ctx.translate(x,y);
  if(e.kind==='kit'){ctx.fillStyle='#e4c582';ctx.fillRect(-10,-18,20,18);ctx.strokeStyle='#574c36';ctx.strokeRect(-10,-18,20,18);ctx.fillStyle='#574c36';ctx.fillRect(-2,-15,4,12);}
  else if(e.kind==='crate'){ctx.fillStyle=e.frozen?'#d0e8f1':'#b78562';ctx.fillRect(-15,-28,30,28);ctx.strokeStyle='#f1cca0';ctx.lineWidth=3;ctx.strokeRect(-14,-27,28,27);ctx.beginPath();ctx.moveTo(-13,-26);ctx.lineTo(13,-1);ctx.stroke();}
  else if(e.kind==='arrow'){ctx.strokeStyle='#fff0c0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-e.dx*12,-12-e.dy*12);ctx.lineTo(e.dx*6,-12+e.dy*6);ctx.stroke();}
  else if(e.kind==='orb'){ctx.fillStyle=e.age>.65?'#f6b877':'#aad8c9';ctx.beginPath();ctx.arc(0,-7,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f6b87766';ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(0,0,88,0,Math.PI*2);ctx.stroke();}
  else {ctx.strokeStyle=e.kind==='blast'?'#ffc78d':e.kind==='still'?'#aed9fb':'#fff5b2';ctx.lineWidth=3;ctx.globalAlpha=Math.min(1,e.life*4);ctx.beginPath();ctx.arc(0,-8,e.kind==='blast'?88:e.kind==='still'?22:17,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}
export function drawActorCues(ctx,e,x,y){
  ctx.save();const v=direction(e.face),a=Math.atan2(v.y,v.x);
  if(e.swingAge>=0){const active=e.swingAge>=.09&&e.swingAge<=.22,arc=e.combo===3?1.62:1.21;ctx.fillStyle=active?'#fff3b444':'#fff3b414';ctx.strokeStyle=active?'#fff3b4':'#d6c99466';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,64,a-arc,a+arc);ctx.closePath();ctx.fill();ctx.stroke();}
  if(e.blocking){ctx.strokeStyle='#b4ecde';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y-12,23,a-.9,a+.9);ctx.stroke();}
  if(e.aiming){ctx.strokeStyle='#eadcb0aa';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x+v.x*180,y-12+v.y*180);ctx.stroke();}
  if(e.windup>0){ctx.fillStyle='#ffbc83';ctx.font='bold 22px system-ui';ctx.fillText('!',x-4,y-54);ctx.strokeStyle='#ffbc8366';ctx.beginPath();ctx.arc(x,y,43,a-.9,a+.9);ctx.stroke();}
  if(e.frozen>0){ctx.strokeStyle='#aed9fb';ctx.strokeRect(x-15,y-46,30,48);}
  if(e.kind==='bokoblin'){ctx.fillStyle='#392f2b';ctx.fillRect(x-15,y-50,30,3);ctx.fillStyle='#eaa38a';ctx.fillRect(x-15,y-50,10*e.hp,3);}
  ctx.restore();
}
