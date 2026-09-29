import { assetManifest } from '../assets/manifest.js?v=0.2.0';
import { directionNames } from './input.js?v=0.2.0';
export class Assets {
  constructor(){this.images=new Map();this.failures=[];}
  async load(){
    const sources=new Set(Object.values(assetManifest).flatMap(a=>Object.values(a.animations).flatMap(d=>Object.values(d).map(clip=>clip.src))));
    await Promise.all([...sources].map(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images.set(src,img);resolve()};img.onerror=()=>{this.failures.push(src);resolve()};img.src=new URL(src, new URL('../assets/',import.meta.url)).href})));
  }
  draw(ctx,entity,x,y){
    const a=assetManifest[entity.kind]?.animations,state=a?.[entity.state??'idle']??a?.idle;
    const clip=state?.[entity.face??'s']??state?.s,img=clip&&this.images.get(clip.src);
    if(img){const frames=clip.frames??1,index=Math.floor((entity.time??0)*(clip.fps??8))%frames;ctx.drawImage(img,(clip.column??0)*clip.width+index*clip.width,(clip.row??0)*clip.height,clip.width,clip.height,x-(clip.anchorX??clip.width/2),y-(clip.anchorY??clip.height),clip.width,clip.height);return;}
    placeholder(ctx,entity,x,y);
  }
}
function ellipse(ctx,x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function placeholder(ctx,e,x,y){
  if(e.kind==='tree'){
    ellipse(ctx,x+5,y+2,31,12,'#234f3b55');ctx.fillStyle='#6e553c';ctx.fillRect(x-7,y-42,14,44);ctx.fillStyle='#9a7750';ctx.fillRect(x-5,y-40,4,40);
    ellipse(ctx,x,y-53,36,29,'#285541');ellipse(ctx,x-13,y-63,26,25,'#377651');ellipse(ctx,x+15,y-67,25,25,'#488858');ellipse(ctx,x-5,y-81,22,21,'#65a163');return;
  }
  if(e.kind==='rock'){ellipse(ctx,x+3,y+1,24,10,'#244b3944');ctx.fillStyle='#798b87';ctx.beginPath();ctx.moveTo(x-22,y-3);ctx.lineTo(x-15,y-26);ctx.lineTo(x+9,y-30);ctx.lineTo(x+22,y-13);ctx.lineTo(x+18,y+3);ctx.closePath();ctx.fill();ctx.fillStyle='#aab6a0';ctx.beginPath();ctx.moveTo(x-15,y-26);ctx.lineTo(x+9,y-30);ctx.lineTo(x+3,y-13);ctx.lineTo(x-19,y-9);ctx.fill();return;}
  if(e.kind==='sign'){ctx.fillStyle='#80593e';ctx.fillRect(x-3,y-24,6,25);ctx.fillStyle='#c4aa6e';ctx.fillRect(x-18,y-38,36,22);ctx.fillStyle='#634d38';ctx.fillRect(x-11,y-31,22,3);ctx.fillRect(x-11,y-25,15,2);return;}
  if(e.kind==='checkpoint'){ellipse(ctx,x,y,23,10,'#c4d19a55');ctx.fillStyle='#728c8a';ctx.fillRect(x-13,y-23,26,25);ctx.fillStyle='#9ce2ca';ctx.fillRect(x-4,y-19,8,13);return;}
  const enemy=e.kind==='bokoblin',walk=e.state==='walk'?Math.sin(e.time*16)*3:0;
  ellipse(ctx,x,y,12,5,'#183b364d');
  ctx.fillStyle=enemy?'#733e39':'#66523d';ctx.fillRect(x-8,y-8+walk,6,9);ctx.fillRect(x+2,y-8-walk,6,9);
  ctx.fillStyle=e.hurt>0?'#f4eed0':enemy?'#b45f50':'#4b8770';ctx.fillRect(x-10,y-25,20,20);
  ctx.fillStyle=enemy?'#c8846a':'#e5bd82';ctx.fillRect(x-9,y-38,18,15);
  ctx.fillStyle=enemy?'#efd5a2':'#d3ba6c';ctx.fillRect(x-10,y-40,20,6);
  if(enemy){ctx.fillRect(x-15,y-40,5,8);ctx.fillRect(x+10,y-40,5,8)}else{ctx.fillStyle='#397660';ctx.beginPath();ctx.moveTo(x-11,y-36);ctx.lineTo(x+10,y-37);ctx.lineTo(x+2,y-49);ctx.fill();}
  const angle=directionNames.indexOf(e.face??'s')*Math.PI/4;
  ctx.fillStyle='#283b36';ctx.fillRect(x+Math.cos(angle)*5-2,y-31+Math.sin(angle)*3,3,3);
  if(e.attack>0){ctx.strokeStyle='#fff2bf';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y-15,40,angle-.8,angle+.8);ctx.stroke();ctx.strokeStyle='#c7e2dd';ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*14,y-17+Math.sin(angle)*14);ctx.lineTo(x+Math.cos(angle)*49,y-17+Math.sin(angle)*49);ctx.stroke();}
}
