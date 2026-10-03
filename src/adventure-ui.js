import {items,recipes,quests,npcs,expansionObjects,landmarks,collectibles,worldRegions} from './content.js?v=0.6.0';
import {acceptQuest,completeQuest,questReady,objectiveProgress,trade,cook,equip,eat,near} from './adventure.js?v=0.6.0';

const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
export function renderAdventure(root,g,save,context=null,tab=context?'nearby':'quests'){
  root.replaceChildren();
  const a=g.adventure;
  root.append(el('h2','Your journey'),el('p',`${a.coins} crowns · ${a.echoes.length}/${collectibles.length} echo stones · ${a.regions.length}/${worldRegions.length} regions`));
  const nav=el('nav',null,'journal-tabs');nav.setAttribute('aria-label','Adventure journal');root.append(nav);
  for(const [id,label] of [['quests','Quests'],['pack','Pack & gear'],['nearby','Nearby'],['discoveries','Discoveries']]){
    const b=el('button',label);b.type='button';b.setAttribute('aria-pressed',String(tab===id));b.onclick=()=>{renderAdventure(root,g,save,context,id);root.querySelector('button[aria-pressed="true"]')?.focus()};nav.append(b);
  }
  const body=el('div',null,'journal-body');root.append(body);
  const refresh=()=>renderAdventure(root,g,save,context,tab);
  const action=(parent,label,fn,disabled=false)=>{const b=el('button',label);b.type='button';b.disabled=disabled;b.onclick=()=>{const ok=fn();if(ok)save();else g.notice('That action is not available here yet.');refresh();const status=el('p',g.message);status.setAttribute('role','status');root.append(status);root.querySelector('button[aria-pressed="true"]')?.focus()};parent.append(b);return b;};
  const card=(title,text)=>{const c=el('article',null,'journal-card');c.append(el('h3',title),el('p',text));body.append(c);return c;};
  function questCard(id,offered=false){
    const q=quests[id],status=a.quests[id];
    const c=card(q.name+(status==='completed'?' · Complete':status==='active'?' · Active':''),q.description);
    if(status!=='completed'){
      for(const o of q.objectives){const name=o.type==='item'?items[o.id].name:o.type==='discovery'?landmarks.find(l=>l.id===o.id).name:o.type==='cooked'?recipes[o.id].name:'Echo stones';c.append(el('p',`${name}: ${Math.min(objectiveProgress(g,o),o.count)}/${o.count}`));}
      c.append(el('p','Reward: '+[q.reward.coins+' crowns',...Object.entries(q.reward.items??{}).map(([i,n])=>`${n} ${items[i].name}`)].join(' · ')));
      if(offered&&!status)action(c,'Accept quest',()=>acceptQuest(g,id));
      if(status==='active'){const nearby=near(g,npcs.find(n=>n.id===q.giver));if(nearby)action(c,'Complete quest',()=>completeQuest(g,id),!questReady(g,id));else c.append(el('p','Return to '+npcs.find(n=>n.id===q.giver).name+' to finish.'));}
    }
  }
  if(tab==='quests'){
    const ids=Object.keys(a.quests);if(!ids.length)card('New trails await','Complete the Plateau shrines, follow the southern descent, then speak with Mara and Tavi in Hearthstead.');
    for(const id of ids.sort((x,y)=>Number(a.quests[x]==='completed')-Number(a.quests[y]==='completed')))questCard(id);
  }
  if(tab==='pack'){
    card('Equipped',Object.entries(a.gear).map(([slot,id])=>`${slot}: ${items[id]?.name??'standard gear'}`).join(' · '));
    if(!Object.values(a.bag).some(n=>n>0))card('Your pack is empty','Gather sunberries beyond the southern descent. Trade, cook, and earn equipment in Hearthstead.');
    for(const [id,n] of Object.entries(a.bag)){if(n<=0)continue;const item=items[id];const effect=item.heal?`Restores ${item.heal} hearts and ${item.stamina} stamina.`:item.attack?'Adds 1 sword damage while the blade has condition.':item.defense?'Reduces heavy hits by 1 (minimum 1); protects against brambles.':item.staminaCost?'Actions consume 15% less stamina.':'Cooking ingredient. Combine it at the village hearth.';
      const c=card(`${item.name} ×${n}`,effect);
      if(item.type==='food')action(c,'Eat',()=>eat(g,id),g.player.hp>=g.maxHearts&&g.equipment.stamina>=g.maxStamina);
      if(item.slot)action(c,a.gear[item.slot]===id?'Unequip':'Equip',()=>equip(g,id));
    }
  }
  if(tab==='discoveries'){
    for(const r of worldRegions.filter(r=>a.regions.includes(r.id)))card(r.name,r.description??'Your first four shrine trials and the southern descent.');
    card('Recorded landmarks',landmarks.filter(l=>a.discoveries.includes(l.id)).map(l=>l.name).join(' · ')||'Interact with unusual landmarks to record them.');
    card('Cairnkeepers’ echoes',`${a.echoes.length}/${collectibles.length} found. Each grants five crowns. Tavi offers a charm for finding three.`);
  }
  if(tab==='nearby'){
    const nearby=expansionObjects.filter(o=>['npc','cooking'].includes(o.kind)&&near(g,o));
    const selected=nearby.find(o=>o.id===context)??nearby[0];
    if(!selected)card('Meet the people of Wildbound','Stand near a person or cooking hearth and press E / USE. You can also open this tab while nearby.');
    if(nearby.length>1)for(const o of nearby)action(body,o.text,()=>{context=o.id;return true});
    if(selected?.kind==='npc'){
      card(selected.name,selected.dialogue);
      for(const id of selected.quests??[]){const q=quests[id];if(!q.requires||a.quests[q.requires]==='completed')questCard(id,true);}
      if(selected.shop){
        const stock=a.stock[selected.shop];
        card('Buy and sell','Prices are per item. Equipped gear must be unequipped before selling. Shop stock and purchases are saved.');
        for(const [id,n] of Object.entries(stock)){const item=items[id];if(!item||item.price<=0)continue;const c=card(item.name,`${n} in stock · You own ${a.bag[id]??0}`);action(c,`Buy · ${item.price} crowns`,()=>trade(g,selected.shop,id,'buy'),n<1||a.coins<item.price);}
        for(const [id,n] of Object.entries(a.bag)){const item=items[id];if(!n||!item.sell)continue;const c=card('Sell '+item.name,`${n} owned`);action(c,`Sell · ${item.sell} crowns`,()=>trade(g,selected.shop,id,'sell'),Object.values(a.gear).includes(id));}
      }
    }
    if(selected?.kind==='cooking'){
      card('Village hearth','Choose a recipe to combine ingredients. Cooking consumes the listed ingredients; eat the result from Pack & gear.');
      for(const [id,r] of Object.entries(recipes)){const c=card(r.name,Object.entries(r.ingredients).map(([i,n])=>`${items[i].name}: ${a.bag[i]??0}/${n}`).join(' + '));action(c,'Cook '+r.name,()=>cook(g,id),!Object.entries(r.ingredients).every(([i,n])=>(a.bag[i]??0)>=n));}
    }
  }
}
