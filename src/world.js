export const TILE = 32;
export const width = 1536, height = 1152;
export const spawn = { x: 340, y: 700, level: 0 };
export const terrace = { x: 576, y: 192, w: 320, h: 320 };
export const eastBank = { x: 1088, y: 192, w: 256, h: 320 };
export const bridge = { x: 896, y: 304, w: 192, h: 80 };
export const stairs = { x: 672, y: 480, w: 96, h: 128 };
export const water = { x: 896, y: 96, w: 192, h: 208 };
// Foot coordinates describe a navigable plane; visual height is a separate value.
export const objects = [
  ...[[240,620],[400,480],[500,760],[180,420],[360,320],[220,860],[640,860],[800,730],[1180,700],[1260,850],[1380,560]].map(([x,y],i)=>({id:`tree-${i}`,kind:'tree',x,y,level:0,r:14})),
  ...[[440,640,0],[550,390,0],[800,430,1],[1200,400,1],[1100,860,0],[720,980,0]].map(([x,y,level],i)=>({id:`rock-${i}`,kind:'rock',x,y,level,r:18})),
  {id:'trail-sign',kind:'sign',x:560,y:660,level:0,r:10,text:'North: stairs to the overlook. East: walk beneath the bridge. J / sword to swing.'},
  {id:'overlook-sign',kind:'sign',x:620,y:280,level:1,r:10,text:'The overlook · Cross the bridge east. Return by the stairs. Cliff edges are solid.'},
  {id:'camp-stone',kind:'checkpoint',x:340,y:760,level:0,r:13,text:'Rest stone · Hearts restored and progress saved.'}
];
export const inside = (x,y,b,margin=0)=>x>=b.x+margin&&x<=b.x+b.w-margin&&y>=b.y+margin&&y<=b.y+b.h-margin;
export function support(x,y,level) {
  if(inside(x,y,stairs)) return true;
  if(level===1) return [terrace,eastBank,bridge].some(b=>inside(x,y,b));
  return level===0 && !inside(x,y,terrace) && !inside(x,y,eastBank) && !inside(x,y,water);
}
export function elevationAt(x,y,level) {
  if(inside(x,y,stairs)) return 48*Math.max(0,Math.min(1,(stairs.y+stairs.h-y)/128));
  return level*48;
}
export function canStand(x,y,level,r=9) {
  if(!Number.isFinite(x)||!Number.isFinite(y)||![0,1].includes(level))return false;
  for(const [dx,dy] of [[-r,-r],[r,-r],[-r,r],[r,r],[0,0]]) {
    if(x+dx<32||y+dy<32||x+dx>width-32||y+dy>height-32||!support(x+dx,y+dy,level))return false;
  }
  return !objects.some(o=>o.level===level && Math.hypot(x-o.x,y-o.y)<r+o.r);
}
export function move(body,dx,dy) {
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));
  for(let i=0;i<steps;i++) {
    for(const [ax,ay] of [[dx/steps,0],[0,dy/steps]]) {
      const x=body.x+ax,y=body.y+ay;
      // Ramp side rails prevent entering halfway up a slope from the lower floor.
      if(ax && inside(body.x,body.y,stairs)!==inside(x,y,stairs) && y>stairs.y+32 && y<stairs.y+stairs.h-20)continue;
      let level=body.level;
      // Only a connected ramp changes floors. Never infer a floor from screen overlap.
      if(inside(body.x,body.y,stairs)||inside(x,y,stairs)) {
        if(y<=stairs.y+32)level=1;
        if(y>=stairs.y+stairs.h-20)level=0;
      }
      if(canStand(x,y,level,body.r??9)){body.x=x;body.y=y;body.level=level;}
    }
  }
}
export const initialEnemies=()=>[{id:'bokoblin-1',kind:'bokoblin',x:880,y:800,level:0,r:10,hp:3,face:'s',state:'idle',time:0,hurt:0,cooldown:0,home:{x:880,y:800}}];
