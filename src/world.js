export const TILE = 32;
export const width = 3072, height = 2304;
export const spawn = { x: 340, y: 700, level: 0 };
export const terrace = { x: 576, y: 192, w: 320, h: 320 };
export const eastBank = { x: 1088, y: 192, w: 256, h: 320 };
export const bridge = { x: 896, y: 304, w: 192, h: 80 };
export const stairs = { x: 672, y: 480, w: 96, h: 128 };
export const water = { x: 896, y: 96, w: 192, h: 208 };
export const highland = { x: 2304, y: 1504, w: 448, h: 320 };
export const highlandStairs = { x: 2400, y: 1792, w: 96, h: 128 };
export const surfaces = [terrace, eastBank, highland];
export const ramps = [stairs, highlandStairs];
export const waters = [water, {x:1824,y:544,w:384,h:288}, {x:448,y:1408,w:288,h:192}, {x:1824,y:1568,w:256,h:192}];
export const exit = {x:1536,y:2112,w:112};
export const shrines = [
  {id:'wind', name:'Windstep Shrine', x:1250,y:270,level:1,color:'#bfe5d4',glyph:'≋',description:'An open balcony catches the wind above the old bridge. A quiet seal waits on its plinth.'},
  {id:'reed', name:'Reedlight Shrine', x:2624,y:480,level:0,color:'#82cfdd',glyph:'≈',description:'Blue light ripples over a shallow ceremonial basin. The water is still; the seal is within reach.'},
  {id:'root', name:'Rootsong Shrine', x:320,y:1824,level:0,color:'#b8d887',glyph:'❧',description:'Roots cradle a small stone chamber. A seed-shaped seal glows between them.'},
  {id:'ember', name:'Embercrest Shrine', x:2608,y:1632,level:1,color:'#e9b087',glyph:'◇',description:'Warm stone shelters this highland alcove. A copper seal rests above an unlit hearth.'}
];
export const regions = [
  {name:'Shrine of Resurrection',x:96,y:576,w:400,h:352,color:'#879e78'},
  {name:'Plateau Tower',x:576,y:192,w:320,h:320,color:'#94a982'},
  {name:'Whisperwood',x:96,y:1216,w:800,h:832,color:'#537e57'},
  {name:'Reedlight Wetlands',x:1760,y:320,w:1120,h:640,color:'#739b83'},
  {name:'Temple of Time',x:1184,y:1152,w:512,h:480,color:'#a3a180'},
  {name:'Ember Highlands',x:2240,y:1376,w:608,h:608,color:'#a79a7a'},
  {name:'Old Road Ruins',x:1088,y:704,w:544,h:352,color:'#8c9871'}
];
export const regionAt=(x,y)=>regions.find(b=>inside(x,y,b))?.name??'Great Plateau';
// Original trail layout. The v0.2 bridge, underpass and stair geometry remain intact.
export const trails = [
  [[330,800],[330,700],[710,655],[720,565]],
  [[560,690],[950,600],[980,430]],
  [[720,655],[1456,1088],[1456,1440],[1536,2048],[1536,2240]],
  [[1456,1088],[1744,448],[2464,448],[2624,540]],
  [[330,800],[320,1200],[320,1888]],
  [[320,1200],[1040,1200],[1456,1440],[2176,1408],[2448,1952],[2448,1888]],
  [[320,1888],[1024,1936],[1536,2048],[2448,1952]]
];
// Foot coordinates describe a navigable plane; visual height is a separate value.
export const objects = [
  ...[[240,620],[400,480],[500,760],[180,420],[360,320],[220,860],[640,860],[800,730],[1180,700],[1260,850],[1380,560]].map(([x,y],i)=>({id:`tree-${i}`,kind:'tree',x,y,level:0,r:14})),
  ...[[440,640,0],[550,390,0],[800,430,1],[1200,400,1],[1100,860,0],[720,980,0]].map(([x,y,level],i)=>({id:`rock-${i}`,kind:'rock',x,y,level,r:18})),
  {id:'trail-sign',kind:'sign',x:560,y:660,level:0,r:10,text:'North: stairs to the overlook. East: walk beneath the bridge. J / sword to swing.'},
  {id:'overlook-sign',kind:'sign',x:620,y:280,level:1,r:10,text:'The overlook · Cross the bridge east. Return by the stairs. Cliff edges are solid.'},
  {id:'camp-stone',kind:'checkpoint',x:340,y:760,level:0,r:13,text:'Rest stone · Hearts restored and progress saved.'}
];
objects.push(
  {id:'resurrection',kind:'sanctuary',x:220,y:720,level:0,r:38,text:'Shrine of Resurrection · A new trail begins here. Rowan waits southeast by the rest stone.'},
  {id:'rowan-start',kind:'guide',x:440,y:840,level:0,r:12,text:'Rowan'},
  {id:'rowan-temple',kind:'guide',x:1512,y:1456,level:0,r:12,text:'Rowan'},
  {id:'tower',kind:'tower',x:800,y:320,level:1,r:24,text:'Plateau Tower'},
  {id:'temple',kind:'temple',x:1392,y:1336,level:0,r:44,text:'Temple of Time · A roofless gathering place, older than the trail. Rowan keeps a lantern nearby.'},
  {id:'exit',kind:'gate',x:1536,y:2080,level:0,r:18,text:'Southern descent'},
  ...shrines.map(s=>({...s,kind:'shrine',r:25,text:s.name})),
  ...[[1040,960],[2288,1088],[848,1712]].map(([x,y],i)=>({id:`camp-${i}`,kind:'camp',x,y,level:0,r:12,text:'Abandoned watch camp · Keep your sword ready.'})),
  ...[[1176,832],[1336,888],[1552,880],[1248,1008],[1648,1200],[1248,1512],[1648,1512]].map(([x,y],i)=>({id:`ruin-${i}`,kind:'ruin',x,y,level:0,r:22})),
  ...[[160,1328],[512,1280],[688,1352],[160,1536],[816,1472],[192,1712],[480,1752],[640,1856],[800,1952],[160,1968],[464,1984],[2240,384],[2736,704],[2400,864],[1744,944]].map(([x,y],i)=>({id:`forest-${i}`,kind:'tree',x,y,level:0,r:14})),
  ...[[600,1680],[1680,1920],[2520,1216]].map(([x,y],i)=>({id:`supply-${i}`,kind:'pickup',x,y,level:0,r:0,text:'Trail fruit',value:1})),
  ...[[1120,976],[2352,1120],[912,1744],[2696,1744]].map(([x,y],i)=>({id:`chest-${i}`,kind:'chest',x,y,level:i===3?1:0,r:14,text:'Trail cache',value:5})),
  {id:'temple-rest',kind:'checkpoint',x:1568,y:1568,level:0,r:13,text:'Temple rest stone · Hearts restored and progress saved.'},
  {id:'crossroads',kind:'sign',x:1384,y:1104,level:0,r:10,text:'Northwest: Plateau Tower. Northeast: Reedlight. South: Temple and descent. Southwest: Whisperwood.'},
  {id:'forest-sign',kind:'sign',x:384,y:1176,level:0,r:10,text:'Rootsong: follow the western trail south through Whisperwood. East: Temple of Time.'},
  {id:'highland-sign',kind:'sign',x:2336,y:1952,level:0,r:10,text:'Embercrest: climb the stairs north, then turn east. Return down the same stairs.'}
);
export const inside = (x,y,b,margin=0)=>x>=b.x+margin&&x<=b.x+b.w-margin&&y>=b.y+margin&&y<=b.y+b.h-margin;
export function support(x,y,level) {
  if(ramps.some(b=>inside(x,y,b))) return true;
  if(level===1) return [...surfaces,bridge].some(b=>inside(x,y,b));
  // The southern cliff has a single narrow descent. Other edges stay solid.
  if(y>exit.y && Math.abs(x-exit.x)>exit.w/2)return false;
  return level===0 && !surfaces.some(b=>inside(x,y,b)) && !waters.some(b=>inside(x,y,b));
}
export function elevationAt(x,y,level) {
  const ramp=ramps.find(b=>inside(x,y,b));
  if(ramp) return 48*Math.max(0,Math.min(1,(ramp.y+ramp.h-y)/ramp.h));
  return level*48;
}
export function canStand(x,y,level,r=9) {
  if(!Number.isFinite(x)||!Number.isFinite(y)||![0,1].includes(level))return false;
  for(const [dx,dy] of [[-r,-r],[r,-r],[-r,r],[r,r],[0,0]]) {
    if(x+dx<32||y+dy<32||x+dx>width-32||y+dy>height-32||!support(x+dx,y+dy,level))return false;
  }
  return !objects.some(o=>o.kind!=='pickup' && o.level===level && Math.hypot(x-o.x,y-o.y)<r+o.r);
}
export function move(body,dx,dy,access={exitUnlocked:false}) {
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));
  for(let i=0;i<steps;i++) {
    for(const [ax,ay] of [[dx/steps,0],[0,dy/steps]]) {
      const x=body.x+ax,y=body.y+ay;
      // Ramp side rails prevent entering halfway up a slope from the lower floor.
      if(!access.exitUnlocked && y+(body.r??9)>exit.y)continue;
      if(ax && ramps.some(s=>inside(body.x,body.y,s)!==inside(x,y,s) && y>s.y+32 && y<s.y+s.h-20))continue;
      let level=body.level;
      // Only a connected ramp changes floors. Never infer a floor from screen overlap.
      const ramp=ramps.find(s=>inside(body.x,body.y,s)||inside(x,y,s));
      if(ramp) {
        if(y<=ramp.y+32)level=1;
        if(y>=ramp.y+ramp.h-20)level=0;
      }
      if(canStand(x,y,level,body.r??9)){body.x=x;body.y=y;body.level=level;}
    }
  }
}
export const initialEnemies=()=>[[880,800],[1080,1016],[2256,1152],[2368,1024],[800,1760],[928,1648]].map(([x,y],i)=>({id:`bokoblin-${i+1}`,kind:'bokoblin',x,y,level:0,r:10,hp:3,face:'s',state:'idle',time:0,hurt:0,cooldown:0,home:{x,y}}));
