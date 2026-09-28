export const directionNames=['e','se','s','sw','w','nw','n','ne'];
export function movementVector(x,y){const length=Math.hypot(x,y);return length>1?{x:x/length,y:y/length}:{x,y};}
export function facing(x,y){return directionNames[(Math.round(Math.atan2(y,x)/(Math.PI/4))+8)%8];}
export function setupInput(){
  const held=new Set(),pointers=new Map(),pressed=new Set();let stick=null,axis={x:0,y:0};
  const map={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyJ:'attack',KeyK:'attack',Space:'attack',KeyE:'interact',Enter:'interact',Escape:'pause'};
  const active=k=>[...held].some(code=>map[code]===k)||[...pointers.values()].includes(k);
  const down=(k,fn)=>{if(!active(k))pressed.add(k);fn()};
  const clear=()=>{held.clear();pointers.clear();pressed.clear();stick=null;axis={x:0,y:0};document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));knob.style.transform='';};
  window.addEventListener('keydown',e=>{const k=map[e.code];if(!k||(k!=='pause'&&(e.target.closest('#overlay,input')||(['Space','Enter'].includes(e.code)&&e.target.closest('button,a')))))return;e.preventDefault();down(k,()=>held.add(e.code));});
  window.addEventListener('keyup',e=>{if(map[e.code]){held.delete(e.code);e.preventDefault()}});
  document.querySelectorAll('[data-control]').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();const k=b.dataset.control;down(k,()=>pointers.set(e.pointerId,k));b.setPointerCapture(e.pointerId);b.classList.add('pressed')});
    const release=e=>{pointers.delete(e.pointerId);if(!active(b.dataset.control))b.classList.remove('pressed')};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,release);
  });
  const pad=document.querySelector('#joystick'),knob=document.querySelector('#knob');
  function steer(e){const b=pad.getBoundingClientRect(),radius=b.width*.34;const dx=(e.clientX-b.left-b.width/2)/radius,dy=(e.clientY-b.top-b.height/2)/radius;axis=Math.hypot(dx,dy)<.16?{x:0,y:0}:movementVector(dx,dy);knob.style.transform=`translate(${axis.x*radius}px,${axis.y*radius}px)`;}
  pad.addEventListener('pointerdown',e=>{if(stick!==null)return;e.preventDefault();stick=e.pointerId;pad.setPointerCapture(stick);steer(e)});
  pad.addEventListener('pointermove',e=>{if(e.pointerId===stick)steer(e)});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{if(e.pointerId===stick){stick=null;axis={x:0,y:0};knob.style.transform=''}});
  window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
  return {clear,consume(k){const value=pressed.has(k);pressed.delete(k);return value},vector(){return movementVector(Number(active('right'))-Number(active('left'))+axis.x,Number(active('down'))-Number(active('up'))+axis.y)}};
}

