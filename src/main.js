import {renderAdventure} from './adventure-ui.js?v=0.6.0';
import {toolNames} from './equipment.js?v=0.6.0';
import {setupInput} from './input.js?v=0.6.0';
import {load,save,clear,freshState} from './save.js?v=0.6.0';
import {Game} from './game.js?v=0.6.0';
import {Assets} from './assets.js?v=0.6.0';
import {Renderer,drawMap} from './render.js?v=0.6.0';
import {regionAt,shrines,initialEnemies} from './world.js?v=0.6.0';
import {objective,journal,treasureCount} from './progression.js?v=0.6.0';
import {destinations,buyUpgrade,fastTravel,unspent} from './journey.js?v=0.6.0';
import {shrineDefinitions} from './shrines.js?v=0.6.0';
const $=s=>document.querySelector(s),input=setupInput(),loaded=load();
let game=new Game(loaded.state??freshState());
const assets=new Assets(),renderer=new Renderer($('#scene'),assets);
assets.load().then(()=>{if(assets.failures.length)game.notice('Some custom sprites could not load; using placeholders.')});
const startup={recovered:'Recovered your backup save.',corrupt:'Save could not be read. Starting safely; old data is retained until you save.',legacy:'Welcome to the Great Plateau. Your old platformer save is preserved.',unavailable:'Storage unavailable. You can play, but progress may not persist.'};
if(startup[loaded.status])game.notice(startup[loaded.status]);
let paused=false,last=0,accumulator=0,saveClock=0;
const STEP=1/60;
function saveProgress(show=false){const ok=save(game.snapshot());if(show||!ok)game.notice(ok?'Progress saved on this device.':'Save failed. Browser storage may be blocked or full.');return ok;}
function pause(value=true,context=null){paused=value;input.clear();$('#overlay').hidden=!value;$('#pause').setAttribute('aria-expanded',String(value));if(value){
  drawMap($('#atlas'),game);$('#tokens').textContent=`${treasureCount(game.progress)+game.journey.treasures.length*5} trail tokens · ${game.defeated.size} / ${initialEnemies().length} enemies cleared · White dot: ${game.shrine?'shrine entrance':'you'}`;
  refreshJourney();renderAdventure($('#adventure'),game,()=>saveProgress(),context);
  $('#objectives').replaceChildren(...journal(game.progress).map(item=>{const li=document.createElement('li');li.textContent=(item.done?'✓ ':'○ ')+item.text;li.className=item.done?'done':'';return li}));$('#resume').focus({preventScroll:true});$('#overlay .panel').scrollTop=0;
}else {document.activeElement?.blur();$('#scene').focus()}}
function refreshJourney(){
  $('#blessings').textContent=`${unspent(game)} blessing(s) available · ${game.maxHearts} hearts · ${game.maxStamina} stamina. One seal grants one blessing. Choose +1 heart or +25 stamina.`;
  $('#upgradeHealth').disabled=$('#upgradeStamina').disabled=unspent(game)<1;
  $('#roomActions').hidden=!game.room;
  $('#roomHelp').textContent=game.room?`${game.room.name}: ${game.room.hint} Reload or reset restarts this room; rewards stay collected.`:'';
  $('#travel').replaceChildren(...destinations.filter(d=>game.journey.discovered.includes(d.id)).map(d=>{
    const b=document.createElement('button');b.textContent=d.name+(game.progress.seals.includes(d.id)?' ✓':'');b.disabled=!!game.room;
    b.onclick=()=>{if(fastTravel(game,d.id)){renderer.snap=true;saveProgress();pause(false);}else $('#travelStatus').textContent=game.message;};return b;
  }));$('#travelStatus').textContent=game.room?'Leave the shrine before fast travel.':'Visit a shrine or rest stone to unlock its travel point. Travel is blocked near enemies.';
}
$('#upgradeHealth').onclick=()=>{if(buyUpgrade(game,'health')){saveProgress();refreshJourney();}};
$('#upgradeStamina').onclick=()=>{if(buyUpgrade(game,'stamina')){saveProgress();refreshJourney();}};
$('#resetRoom').onclick=()=>{if(game.room){game.setRoom(game.room.index);saveProgress();pause(false);}};
$('#leaveShrine').onclick=()=>{game.leaveShrine();renderer.snap=true;saveProgress();pause(false);};
function frame(t){
  const dt=Math.min((t-last)/1000||0,.1);last=t;
  if(input.consume('pause'))pause(!paused);
  if(!paused&&!document.hidden){accumulator+=dt;while(accumulator>=STEP){game.update(STEP,input);accumulator-=STEP;saveClock+=STEP;}
    if(saveClock>=12||game.needsSave){saveClock=0;game.needsSave=false;saveProgress();}
  }else accumulator=0;
  if(game.panelRequest&&!paused){const context=game.panelRequest;game.panelRequest=null;pause(true,context);}
  renderer.draw(game,paused?0:dt);
  $('#hearts').textContent='♥'.repeat(game.player.hp)+'♡'.repeat(game.maxHearts-game.player.hp);$('#hearts').setAttribute('aria-label',`${game.player.hp} of ${game.maxHearts} hearts`);
  $('#level').textContent=game.room?`${shrines.find(s=>s.id===game.shrine).name} · ${game.room.index+1}/${shrineDefinitions[game.shrine].rooms.length}`:regionAt(game.player.x,game.player.y)+(game.player.level?' · UPPER':'');
  $('#stamina').max=game.maxStamina;$('#stamina').value=game.equipment.stamina;
  $('#gear').textContent='↗ '+game.equipment.arrows+' · Blade '+game.equipment.sword+'/40';
  $('#toolName').textContent=toolNames[game.equipment.tool];
  document.querySelector('[data-control="tool"]').setAttribute('aria-label','Use '+toolNames[game.equipment.tool]);
  $('#objective').textContent=game.room?`${shrineDefinitions[game.shrine].title} · ${game.room.name} · ${game.room.solved?'Trial solved — reach the far plinth':'Read the entrance sign; Journal has help'}`:objective(game.progress);
  const nearby=game.nearby();$('#nearby').textContent=nearby?`E / USE · ${nearby.text.split(' · ')[0]}`:'';$('#nearby').hidden=!nearby||paused;
  $('#message').textContent=game.message;$('#message').hidden=game.messageTime<=0;
  requestAnimationFrame(frame);
}
$('#save').onclick=()=>{saveProgress(true);document.activeElement?.blur()};$('#pause').onclick=()=>pause(!paused);$('#resume').onclick=()=>pause(false);
$('#restart').onclick=()=>{$('#confirmReset').hidden=false};
$('#cancelReset').onclick=()=>{$('#confirmReset').hidden=true};
$('#confirmNew').onclick=()=>{if(!clear()){game.notice('Could not clear storage. New game cancelled.');return;}game=new Game();renderer.snap=true;saveClock=0;$('#confirmReset').hidden=true;pause(false);saveProgress();};
window.addEventListener('resize',()=>renderer.resize());window.addEventListener('blur',()=>pause(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden){saveProgress();pause(true)}});
window.addEventListener('pagehide',()=>saveProgress());
requestAnimationFrame(frame);

// Keep keyboard focus in the open journal; native buttons support Enter and Space.
window.addEventListener('keydown',e=>{if(!paused||e.key!=='Tab')return;const nodes=[...document.querySelectorAll('#overlay button:not(:disabled),#overlay a')].filter(n=>n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}});
