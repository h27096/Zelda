import {inside} from './world.js?v=0.6.0';

const spawn={x:80,y:250,level:0};
const divider=[{x:310,y:24,w:20,h:182},{x:310,y:294,w:20,h:162}];
const gate={x:310,y:206,w:20,h:88};
const room=(name,hint,features={})=>({name,hint,width:640,height:480,spawn:{...spawn},walls:divider,gate:{...gate},waters:[],crates:[],targets:[],plates:[],...features});
// Original layouts. Features are semantic data, not art: the same simulation and
// room renderer serve every shrine. New rooms compose the four rule types below.
export const shrineDefinitions={
  wind:{tool:'tether',title:'The Copper Courier',rooms:[
    room('A place for weight','Q selects Tether. Face the copper block, F / TOOL to lift. Carry it onto the gold plate; release with F.',{rule:'weight',crates:[{x:168,y:250}],plates:[{x:250,y:160}]}),
    room('The winding delivery','Carry around the lower end of the spine, then north to the plate. Turn gradually; release and rest to refill stamina. Journal can reset the room.',{rule:'weight',walls:[...divider,{x:170,y:140,w:24,h:170}],crates:[{x:110,y:170}],plates:[{x:257,y:140}]})
  ]},
  reed:{tool:'frost',title:'A Ribbon Across Rain',rooms:[
    room('The first bank','Select Frostpath. Face the water and use F / TOOL near its edge. Walk across the pale ribbon.',{rule:'cross',walls:[],gate:null,waters:[{x:250,y:24,w:100,h:432}],goalX:400}),
    room('Two quiet currents','Cross each basin separately. Reach dry ground and wait for the short cooldown before laying the next ribbon.',{rule:'cross',walls:[],gate:null,waters:[{x:180,y:24,w:90,h:432},{x:375,y:24,w:90,h:432}],goalX:505})
  ]},
  root:{tool:'still',title:'A Borrowed Moment',rooms:[
    room('The restless weight','The moving copper weight crosses a gold plate. Face it and use Stillmark while it overlaps the plate; pass the door before it moves again.',{rule:'still',crates:[{x:190,y:170,motion:{axis:'y',min:120,max:360,speed:65}}],plates:[{x:190,y:250}]}),
    room('Hold the narrow hour','Catch the faster weight on the upper plate with Stillmark. The door stays open only while the frozen weight rests there.',{rule:'still',crates:[{x:160,y:145,motion:{axis:'x',min:115,max:270,speed:85}}],plates:[{x:250,y:145}]})
  ]},
  ember:{tool:'pulse',title:'Echoes in Copper',rooms:[
    room('An answering spark','Select Pulse Orb. Throw toward the copper gong; retreat beyond the ring, wait for arming, then use TOOL again.',{rule:'pulse',targets:[{x:245,y:160}]}),
    room('A paired echo','Both gongs must hear the same blast. Place an orb between them, step clear, and trigger it. Walls block the pulse.',{rule:'pulse',targets:[{x:250,y:180},{x:250,y:310}],walls:[...divider,{x:125,y:95,w:25,h:75}]})
  ]}
};
export function validLocation(v,progress,journey){
  return v===null||!!(v&&Object.hasOwn(shrineDefinitions,v.shrine)&&Number.isInteger(v.room)&&shrineDefinitions[v.shrine].rooms[v.room]&&progress.tower&&journey.discovered.includes(v.shrine));
}
export function makeRoom(id,index){
  const definition=shrineDefinitions[id]?.rooms[index];if(!definition)return null;
  const r=structuredClone(definition);r.index=index;r.open=false;r.solved=false;r.phase=0;
  r.crates=r.crates.map((c,i)=>({...c,id:`room-crate-${i}`,kind:'crate',r:15,level:0,frozen:0,velocity:1}));
  return r;
}
const touches=(x,y,r,b)=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h;
export function roomCanStand(room,x,y,r=9,ice=[]){
  if(!Number.isFinite(x)||!Number.isFinite(y)||x-r<24||y-r<24||x+r>room.width-24||y+r>room.height-24)return false;
  if([...room.walls,...(room.gate&&!room.open?[room.gate]:[])].some(b=>touches(x,y,r,b)))return false;
  return [[-r,-r],[r,r],[-r,r],[r,-r],[0,0]].every(([dx,dy])=>!room.waters.some(w=>inside(x+dx,y+dy,w))||ice.some(i=>inside(x+dx,y+dy,i)));
}
export function roomLine(room,a,b){
  if(a.level!==b.level)return false;
  const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4));
  // Water does not block sight, but solid room walls and shut doors do.
  for(let i=1;i<=steps;i++){
    const x=a.x+(b.x-a.x)*i/steps,y=a.y+(b.y-a.y)*i/steps;
    if(x<24||y<24||x>room.width-24||y>room.height-24)return false;
    if([...room.walls,...(room.gate&&!room.open?[room.gate]:[])].some(b=>touches(x,y,1,b)))return false;
  }return true;
}
export function pulseRoom(g,b){
  const r=g.room;if(!r||r.rule!=='pulse')return;
  if(r.targets.every(t=>Math.hypot(t.x-b.x,t.y-b.y)<88&&roomLine(r,b,{...t,level:0}))){r.solved=true;r.open=true;g.notice('The copper chorus answers. The door is open.');}
}
export function updateRoom(g,dt){
  const r=g.room;if(!r)return;
  for(const c of r.crates)if(c.motion&&!c.frozen){
    const m=c.motion,next=c[m.axis]+c.velocity*m.speed*dt;
    g.moveBody(c,m.axis==='x'?next-c.x:0,m.axis==='y'?next-c.y:0);
    if(next>=m.max||next<=m.min)c.velocity*=-1;
  }
  const covered=r.plates.every(p=>r.crates.some(c=>Math.hypot(p.x-c.x,p.y-c.y)<25&&(r.rule!=='still'||c.frozen>0)));
  if(r.rule==='weight'&&covered){if(!r.solved)g.notice('Weight received. The door is latched open.');r.solved=true;r.open=true;}
  if(r.rule==='still'){
    // Never close a door on an actor or a carried crate. Its occupied footprint
    // remains open until clear; crossing to the far bank latches it permanently.
    if(covered)r.open=true;
    if(r.open&&g.player.x>r.gate.x+r.gate.w+g.player.r){r.solved=true;}
    if(!r.solved&&!covered&&![g.player,...g.crates].some(c=>touches(c.x,c.y,c.r,r.gate)))r.open=false;
  }
  if(r.rule==='cross'&&g.player.x>r.goalX)r.solved=true;
}
export function roomObjects(g){
  const r=g.room;if(!r)return [];
  return [
    {id:'room-exit',kind:'door',x:70,y:345,level:0,text:r.index?'Return to first room':'Return to Plateau'},
    {id:'room-hint',kind:'sign',x:90,y:170,level:0,text:'Read room instructions'},
    {id:'room-next',kind:'altar',x:565,y:250,level:0,text:r.index===shrineDefinitions[g.shrine].rooms.length-1?'Receive shrine seal':'Continue to next room'},
    {id:`${g.shrine}-${r.index}`,kind:'chest',x:550,y:370,level:0,text:'Open shrine cache'}
  ];
}
