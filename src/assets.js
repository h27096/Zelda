import { assetManifest } from '../assets/manifest.js?v=0.4.0';
import { directionNames } from './input.js?v=0.4.0';
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
  if(e.kind==='guide'){
    ellipse(ctx,x,y,15,6,'#183b364d');ctx.fillStyle='#ad956a';ctx.fillRect(x-12,y-30,24,29);ctx.fillStyle='#ddc4a0';ctx.fillRect(x-8,y-43,16,15);ctx.fillStyle='#dddac0';ctx.fillRect(x-9,y-34,18,13);ctx.fillStyle='#695d50';ctx.fillRect(x-11,y-48,22,9);ctx.fillRect(x+16,y-32,4,33);ctx.fillStyle='#efd09b';ctx.fillRect(x+12,y-21,12,12);return;
  }
  if(e.kind==='tower'){
    ellipse(ctx,x,y,42,16,'#203b3555');ctx.fillStyle='#546b64';ctx.fillRect(x-22,y-112,44,112);ctx.fillStyle='#9da48b';ctx.fillRect(x-27,y-114,54,13);ctx.fillRect(x-29,y-8,58,12);ctx.fillStyle='#788b7c';ctx.fillRect(x-16,y-96,12,83);
    ctx.fillStyle=e.active?'#bff7d7':'#4b625d';ctx.fillRect(x-12,y-143,24,28);ctx.fillStyle='#d5c394';ctx.fillRect(x-17,y-147,34,6);ctx.fillRect(x-16,y-118,32,5);
    if(e.active)ellipse(ctx,x,y-130,32,27,'#b9f3d433');return;
  }
  if(e.kind==='shrine'){
    ellipse(ctx,x,y,43,15,'#273d3c55');ctx.fillStyle='#526c69';ctx.fillRect(x-37,y-63,74,64);ctx.fillStyle=e.color;ctx.fillRect(x-42,y-69,84,10);ctx.fillRect(x-33,y-58,7,54);ctx.fillRect(x+26,y-58,7,54);ctx.fillStyle='#213e3e';ctx.fillRect(x-22,y-46,44,48);ctx.fillStyle=e.active?'#d5fac0':e.color;ctx.font='bold 25px Georgia';ctx.textAlign='center';ctx.fillText(e.active?'✓':e.glyph,x,y-38);ctx.textAlign='start';ctx.fillStyle=e.color;ctx.fillRect(x-44,y,88,6);return;
  }
  if(e.kind==='temple'||e.kind==='sanctuary'){
    const big=e.kind==='temple',w=big?90:60;
    ellipse(ctx,x,y,w+10,22,'#203b3544');ctx.fillStyle='#8f9884';ctx.fillRect(x-w,y-76,w*2,80);ctx.fillStyle='#c3c5a3';ctx.fillRect(x-w-5,y-83,w*2+10,12);ctx.fillStyle='#263f3a';ctx.fillRect(x-24,y-51,48,56);ctx.fillStyle='#b8bd9e';
    for(const dx of [-w+8,w-20]){ctx.fillRect(x+dx,y-92,12,98);ctx.fillRect(x+dx-4,y-94,20,8);}
    ctx.fillStyle='#d7c797';ctx.fillRect(x-w-8,y+3,w*2+16,7);if(big){ctx.strokeStyle='#d7c797';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y-58,24,Math.PI,0);ctx.stroke();}return;
  }
  if(e.kind==='ruin'){
    ellipse(ctx,x,y,29,10,'#203b3544');ctx.fillStyle='#8c9481';ctx.fillRect(x-22,y-44,44,45);ctx.fillStyle='#c1bda0';ctx.fillRect(x-26,y-48,52,9);ctx.fillStyle='#586e58';ctx.fillRect(x-23,y-9,12,12);ctx.strokeStyle='#626f61';ctx.beginPath();ctx.moveTo(x+4,y-39);ctx.lineTo(x-4,y-25);ctx.lineTo(x+10,y-16);ctx.stroke();return;
  }
  if(e.kind==='chest'){
    ellipse(ctx,x,y,24,8,'#203b3544');ctx.fillStyle=e.active?'#64513c':'#9e7548';ctx.fillRect(x-19,y-24,38,25);ctx.fillStyle='#d7b875';ctx.fillRect(x-20,y-24,40,5);ctx.fillRect(x-14,y-24,4,25);ctx.fillRect(x+10,y-24,4,25);ctx.fillStyle=e.active?'#243d32':'#e9d598';ctx.fillRect(x-5,y-15,10,8);return;
  }
  if(e.kind==='pickup'){ellipse(ctx,x,y,12,5,'#203b3533');ellipse(ctx,x,y-10,8,9,'#e5a978');ctx.fillStyle='#3f7150';ctx.fillRect(x,y-24,6,7);return;}
  if(e.kind==='camp'){
    ellipse(ctx,x,y,25,12,'#b6a688');ctx.fillStyle='#625346';ctx.fillRect(x-16,y-6,32,7);ctx.fillStyle='#d59458';ctx.beginPath();ctx.moveTo(x-10,y-5);ctx.lineTo(x,y-27);ctx.lineTo(x+10,y-5);ctx.fill();return;
  }
  if(e.kind==='gate'){
    ctx.fillStyle='#8b7860';ctx.fillRect(x-10,y-42,20,43);ctx.fillStyle=e.active?'#b5e5b4':'#e0b779';ctx.fillRect(x-24,y-49,48,18);ctx.fillStyle='#29463c';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(e.active?'OPEN':'SEALED',x,y-36);ctx.textAlign='start';return;
  }
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
