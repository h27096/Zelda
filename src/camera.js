export function followCamera(camera,target,viewport,bounds,dt,snap=false){
  const desired={x:Math.max(0,Math.min(bounds.width-viewport.width,target.x-viewport.width/2)),y:Math.max(0,Math.min(bounds.height-viewport.height,target.y-viewport.height/2))};
  const blend=snap?1:1-Math.exp(-10*dt);
  return {x:camera.x+(desired.x-camera.x)*blend,y:camera.y+(desired.y-camera.y)*blend};
}
export function depthCompare(a,b){return a.level-b.level||a.y-b.y||String(a.id??a.kind).localeCompare(String(b.id??b.kind));}
