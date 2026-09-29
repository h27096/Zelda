// Shared deterministic input replay: never sets a solved flag or moves a crate
// directly. Node regressions and the browser canvas suite use the same routes.
export const input=(action='',x=0,y=0)=>{let used=false;return {epoch:0,active:()=>false,vector:()=>({x,y}),consume:k=>{if(k===action&&!used){used=true;return true;}return false;}};};
export function tick(g,n=1){for(let i=0;i<n;i++)g.update(1/60,input());}
export function walk(g,x,y){
  for(let i=0;i<700;i++){
    const dx=x-g.player.x,dy=y-g.player.y,d=Math.hypot(dx,dy);if(d<2)return;
    g.update(1/60,input('',dx/d*Math.min(1,d/2.5),dy/d*Math.min(1,d/2.5)));
  }throw Error(`Route blocked in ${g.shrine}/${g.room.index}: ${g.player.x},${g.player.y} toward ${x},${y}`);
}
export function tool(g,face){if(face)g.player.face=face;g.update(1/60,input('tool'));}
export function use(g){g.update(1/60,input('interact'));}
export function solveRoom(g){
  const id=g.shrine,index=g.room.index;
  if(id==='wind'){
    if(!index){tool(g,'e');walk(g,80,160);walk(g,195,160);tick(g,70);tool(g);}
    else {tool(g,'n');g.player.face='e';tick(g,65);g.player.face='s';tick(g,50);walk(g,110,365);tick(g,20);tool(g);tick(g,240);tool(g,'s');g.player.face='e';tick(g,50);walk(g,250,365);tick(g,30);g.player.face='n';tick(g,40);walk(g,250,195);tick(g,40);tool(g);}
    walk(g,280,250);walk(g,360,250);
  }
  if(id==='reed'){
    if(!index){walk(g,205,250);tool(g,'e');walk(g,410,250);}
    else {walk(g,135,250);tool(g,'e');walk(g,310,250);tick(g,130);walk(g,330,250);tool(g,'e');walk(g,515,250);}
  }
  if(id==='root'){
    walk(g,index?220:140,index?225:250);
    const plate=g.room.plates[0],c=g.crates[0];let ready=false;
    for(let i=0;i<600;i++){if(Math.hypot(plate.x-c.x,plate.y-c.y)<18){ready=true;break;}tick(g);}
    if(!ready)throw Error('Weight never reaches plate');tool(g,index?'n':'e');
    if(index)walk(g,220,250);else {walk(g,140,290);walk(g,260,290);}walk(g,355,250);
  }
  if(id==='ember'){
    walk(g,180,index?245:160);tool(g,'e');walk(g,80,index?245:160);tick(g,45);tool(g);walk(g,280,250);walk(g,355,250);
  }
  if(!g.room.solved)throw Error(`${id}/${index} did not solve through its tool`);
  walk(g,550,370);use(g);walk(g,565,250);use(g);
}
export function completeShrine(g,id){g.enterShrine(id);solveRoom(g);solveRoom(g);g.leaveShrine();}
