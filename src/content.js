// Original Wildbound content. Coordinates are feet on the shared outdoor map.
// Presentation uses asset kinds, never image dimensions, for gameplay rules.
export const worldRegions = [
  {id:'plateau',name:'Great Plateau',x:0,y:0,w:3072,h:2304,color:'#709957'},
  {id:'hearth',name:'Hearthstead Vale',x:0,y:2304,w:3072,h:800,color:'#91a36b',description:'Lanterns mark the road to Hearthstead. Speak with Mara in the village square.'},
  {id:'mire',name:'Glassfen Marsh',x:0,y:3104,w:1536,h:1504,color:'#537e7b',description:'Blue pools divide the reed beds. Frostpath can cross water; purple brambles sting.'},
  {id:'ridge',name:'Copperwind Reach',x:1536,y:3104,w:1536,h:1504,color:'#ad906b',description:'Follow the switchback stair to the survey cairn. Loose scree slows the unwary.'}
];
export const regionLinks=[['plateau','hearth'],['hearth','mire'],['hearth','ridge'],['mire','ridge']];
export const regionFor=(x,y)=>worldRegions.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
export const expansionWaters=[{x:288,y:3296,w:448,h:256},{x:832,y:3776,w:352,h:416}];
export const expansionSurfaces=[{x:2240,y:3648,w:448,h:352}];
export const expansionRamps=[{x:2400,y:3968,w:96,h:160}];
export const hazards=[
  {id:'brambles',x:416,y:3712,w:224,h:192,damage:1,color:'#905b79',label:'STINGING BRAMBLES'},
  {id:'scree',x:1888,y:3488,w:320,h:224,slow:.55,color:'#756853',label:'LOOSE SCREE'}
];
export const expansionTrails=[[[1536,2240],[1536,2560],[1536,2912]],[[1536,2760],[640,2896],[640,3180],[768,3616],[640,4160]],[[1536,2760],[2280,2920],[2448,3392],[2784,4128],[2448,4192],[2448,4096]],[[640,4336],[1536,4336],[2448,4192]]];
export const items={
  berry:{name:'Sunberry',type:'ingredient',price:4,sell:2},
  reed:{name:'Sweet reed',type:'ingredient',price:6,sell:3},
  root:{name:'Copperroot',type:'ingredient',price:6,sell:3},
  broth:{name:'Wayfarer broth',type:'food',price:14,sell:6,heal:3,stamina:25},
  mash:{name:'Sunrise mash',type:'food',price:12,sell:5,heal:2,stamina:50},
  trailblade:{name:'Tempered trailblade',type:'gear',slot:'weapon',price:35,sell:15,attack:1},
  coat:{name:'Reedwoven coat',type:'gear',slot:'armor',price:25,sell:10,defense:1},
  charm:{name:'Cairnkeeper charm',type:'gear',slot:'charm',price:0,sell:0,staminaCost:.85}
};
export const recipes={broth:{name:'Wayfarer broth',ingredients:{berry:1,reed:1},result:'broth'},mash:{name:'Sunrise mash',ingredients:{berry:1,root:1},result:'mash'}};
export const shops={provisions:{name:'Ivo’s Trail Provisions',stock:{berry:12,reed:8,root:8,broth:4,trailblade:2,coat:2}}};
export const quests={
  supper:{name:'A warm welcome',giver:'mara',description:'Gather two sunberries for Hearthstead’s evening table. Bring them back to Mara.',objectives:[{type:'item',id:'berry',count:2}],consume:{berry:2},reward:{coins:12,items:{reed:2}}},
  survey:{name:'Beyond the lanterns',giver:'tavi',description:'Visit the Glassfen bell and the Copperwind survey cairn, then report to Tavi.',objectives:[{type:'discovery',id:'glass-bell',count:1},{type:'discovery',id:'survey-cairn',count:1}],reward:{coins:30}},
  cook:{name:'A meal for the road',giver:'mara',requires:'supper',description:'Cook Wayfarer broth at the village hearth, then tell Mara how it went.',objectives:[{type:'cooked',id:'broth',count:1}],reward:{coins:15,items:{root:2}}},
  echoes:{name:'The cairnkeepers',giver:'tavi',description:'Find three hidden echo stones and return to Tavi. Watch for small golden cairns off the paths.',objectives:[{type:'collectibles',count:3}],reward:{coins:20,items:{charm:1}}}
};
const point=(id,kind,x,y,text,extra={})=>({id,kind,x,y,level:0,r:12,text,...extra});
export const npcs=[
  point('mara','npc',1456,2656,'Mara · Hearthkeeper',{name:'Mara',color:'#d99b6b',dialogue:'Every traveler has a place at our table. Sunberries grow beside the descent; the hearth is just south of here.',quests:['supper','cook']}),
  point('ivo','npc',1712,2752,'Ivo · Provisions',{name:'Ivo',color:'#8fb3d0',dialogue:'I trade in crowns. A tempered blade hits harder while it has an edge; a reedwoven coat softens heavy blows and protects against brambles.',shop:'provisions'}),
  point('tavi','npc',1328,2816,'Tavi · Surveyor',{name:'Tavi',color:'#d8bf73',dialogue:'The marsh bell is west, the high cairn southeast. Three echo stones still hold the old cairnkeepers’ song.',quests:['survey','echoes']})
];
export const landmarks=[point('glass-bell','discovery',640,4160,'Glassfen bell',{name:'Glassfen bell'}),point('survey-cairn','discovery',2544,3808,'Copperwind survey cairn',{name:'Copperwind survey cairn',level:1})];
export const collectibles=[point('echo-willow','echo',224,3600,'Willow echo stone',{r:0}),point('echo-pool','echo',1280,4096,'Poolside echo stone',{r:0}),point('echo-copper','echo',2848,3504,'Copper echo stone',{r:0}),point('echo-south','echo',1824,4416,'Southern echo stone',{r:0})];
export const forage=[...[[1376,2400],[1696,2448],[1168,2912],[1872,2928],[352,3136],[2080,3200]].map(([x,y],i)=>point(`berry-${i}`,'forage',x,y,'Gather sunberries',{r:0,item:'berry',count:2})),...[[224,3696],[768,3632],[1248,4256]].map(([x,y],i)=>point(`reed-${i}`,'forage',x,y,'Gather sweet reeds',{r:0,item:'reed',count:2})),...[[2256,3376],[2736,4256],[2144,4336]].map(([x,y],i)=>point(`root-${i}`,'forage',x,y,'Gather copperroot',{r:0,item:'root',count:2}))];
export const expansionDestinations=[{id:'hearth-rest',name:'Hearthstead',x:1568,y:2880,level:0},{id:'fen-rest',name:'Glassfen camp',x:640,y:4320,level:0},{id:'ridge-rest',name:'Copperwind camp',x:2448,y:4320,level:0}];
export const expansionObjects=[...npcs,...landmarks,...collectibles,...forage,
  ...expansionDestinations.map(d=>point(d.id,'checkpoint',d.x,d.y-52,d.name+' rest stone')),
  point('village-hearth','cooking',1472,2832,'Village cooking hearth'),
  point('vale-sign','sign',1488,2448,'Hearthstead south · Glassfen west · Copperwind southeast'),
  point('fen-sign','sign',672,3136,'Glassfen bell: follow the dry trail south. Purple brambles sting; use Frostpath for shortcuts.'),
  point('ridge-sign','sign',2384,4176,'Survey cairn: climb the stairs north. Loose scree slows movement.'),
  ...[[1216,2592],[1744,2592],[1184,2784]].map(([x,y],i)=>point('house-'+i,'house',x,y,'Hearthstead cottage · Lanterns welcome travelers.',{r:38})),
  ...[[320,2544],[768,2624],[960,2496],[320,3616],[1408,3360],[768,4400]].map(([x,y],i)=>point('vale-tree-'+i,'tree',x,y,null,{r:14})),
  ...[[2080,3328],[2784,3808],[2080,4064]].map(([x,y],i)=>point('reach-rock-'+i,'rock',x,y,null,{r:18}))
];
export const expansionEnemies=()=>[[832,3520],[1376,3840],[2080,3888]].map(([x,y],i)=>({id:`scrapper-${i}`,kind:'bokoblin',x,y,level:0,r:10,hp:4,face:'s',state:'idle',time:0,hurt:0,cooldown:0,home:{x,y,level:0}}));
