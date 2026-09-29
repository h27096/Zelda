import {toolNames} from './equipment.js?v=0.4.0';
import {setupInput} from './input.js?v=0.4.0';
import {load,save,clear,freshState} from './save.js?v=0.4.0';
import {Game} from './game.js?v=0.4.0';
import {Assets} from './assets.js?v=0.4.0';
import {Renderer,drawMap} from './render.js?v=0.4.0';
import {regionAt,shrines,initialEnemies} from './world.js?v=0.4.0';
import {objective,journal,treasureCount} from './progression.js?v=0.4.0';
const $=s=>document.querySelector(s),input=setupInput(),loaded=load();
let game=new Game(loaded.state??freshState());
const assets=new Assets(),renderer=new Renderer($('#scene'),assets);
assets.load().then(()=>{if(assets.failures.length)game.notice('Some custom sprites could not load; using placeholders.')});
const startup={recovered:'Recovered your backup save.',corrupt:'Save could not be read. Starting safely; old data is retained until you save.',legacy:'Welcome to the Great Plateau. Your old platformer save is preserved.',unavailable:'Storage unavailable. You can play, but progress may not persist.'};
if(startup[loaded.status])game.notice(startup[loaded.status]);
let paused=false,last=0,accumulator=0,saveClock=0;
const STEP=1/60;
function saveProgress(show=false){const ok=save(game.snapshot());if(show||!ok)game.notice(ok?'Progress saved on this device.':'Save failed. Browser storage may be blocked or full.');return ok;}
function pause(value=true){paused=value;input.clear();$('#overlay').hidden=!value;$('#pause').setAttribute('aria-expanded',String(value));if(value){
  drawMap($('#atlas'),game);$('#tokens').textContent=`${treasureCount(game.progress)} trail tokens · ${game.defeated.size} / ${initialEnemies().length} enemies cleared · White dot: you`;
  $('#objectives').replaceChildren(...journal(game.progress).map(item=>{const li=document.createElement('li');li.textContent=(item.done?'✓ ':'○ ')+item.text;li.className=item.done?'done':'';return li}));$('#resume').focus({preventScroll:true});$('#overlay .panel').scrollTop=0;
}else {document.activeElement?.blur();$('#scene').focus()}}
let shownShrine=null;
function syncShrine(){
  if(shownShrine===game.shrine)return;shownShrine=game.shrine;input.clear();$('#shrineView').hidden=!shownShrine;
  if(shownShrine){const s=shrines.find(s=>s.id===shownShrine);$('#shrineTitle').textContent=s.name;$('#shrineDescription').textContent=s.description;$('#shrineGlyph').textContent=s.glyph;$('#shrineGlyph').style.color=s.color;$('#recordSeal').textContent=game.progress.seals.includes(s.id)?'Seal recorded · Rest again':'Record seal & heal';$('#recordSeal').focus();}
}
function leaveShrine(){game.shrine=null;syncShrine();input.clear();$('#scene').focus();}
$('#recordSeal').onclick=()=>{game.recordSeal();$('#recordSeal').textContent='Seal recorded · Rest again';saveProgress();};
$('#leaveShrine').onclick=leaveShrine;
function frame(t){
  const dt=Math.min((t-last)/1000||0,.1);last=t;
  if(input.consume('pause')){if(game.shrine&&!paused)leaveShrine();else pause(!paused);}
  if(!paused&&!document.hidden){accumulator+=dt;while(accumulator>=STEP){game.update(STEP,input);accumulator-=STEP;saveClock+=STEP;}
    if(saveClock>=12||game.needsSave){saveClock=0;game.needsSave=false;saveProgress();}
  }else accumulator=0;
  renderer.draw(game,paused?0:dt);
  $('#hearts').textContent='♥'.repeat(game.player.hp)+'♡'.repeat(5-game.player.hp);$('#hearts').setAttribute('aria-label',`${game.player.hp} of 5 hearts`);
  $('#level').textContent=regionAt(game.player.x,game.player.y)+(game.player.level?' · UPPER':'');
  $('#stamina').value=game.equipment.stamina;
  $('#gear').textContent='↗ '+game.equipment.arrows+' · Blade '+game.equipment.sword+'/40';
  $('#toolName').textContent=toolNames[game.equipment.tool];
  document.querySelector('[data-control="tool"]').setAttribute('aria-label','Use '+toolNames[game.equipment.tool]);
  $('#objective').textContent=objective(game.progress);
  const nearby=game.nearby();$('#nearby').textContent=nearby?`E / USE · ${nearby.text.split(' · ')[0]}`:'';$('#nearby').hidden=!nearby||!!game.shrine||paused;
  syncShrine();
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
