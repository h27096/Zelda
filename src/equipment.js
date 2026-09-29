export const tools=['bow','pulse','tether','still','frost'];
export const toolNames={bow:'Trail bow',pulse:'Pulse orb',tether:'Tether',still:'Stillmark',frost:'Frostpath'};
export const freshEquipment=()=>({stamina:100,arrows:12,tool:'bow',sword:40,collected:[]});
export const supplies=[{id:'kit-start',x:390,y:700,level:0},{id:'kit-road',x:1020,y:900,level:0},{id:'kit-reed',x:1760,y:720,level:0}];
export function validateEquipment(e,staminaLimit=100){
  if(!e||!Number.isFinite(e.stamina)||e.stamina<0||e.stamina>staminaLimit||!Number.isInteger(e.arrows)||e.arrows<0||e.arrows>30||!Number.isInteger(e.sword)||e.sword<0||e.sword>40||!tools.includes(e.tool)||!Array.isArray(e.collected)||e.collected.some(id=>!supplies.some(s=>s.id===id)))return null;
  return {...e,collected:[...new Set(e.collected)]};
}
