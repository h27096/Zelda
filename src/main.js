import {setupInput} from './input.js';
import {load,save,clear,freshState} from './save.js';
import {Game} from './game.js';
import {Assets} from './assets.js';
import {Renderer} from './render.js';
const $=s=>document.querySelector(s),input=setupInput(),loaded=load();
let game=new Game(loaded.state??freshState());
const assets=new Assets(),renderer=new Renderer($('#scene'),assets);
assets.load().then(()=>{if(assets.failures.length)game.notice('Some custom sprites could not load; using placeholders.')});
const startup={recovered:'Recovered your backup save.',corrupt:'Save could not be read. Starting safely; old data is retained until you save.',legacy:'Welcome to the top-down test slice. Your old platformer save is preserved.',unavailable:'Storage unavailable. You can play, but progress may not persist.'};
if(startup[loaded.status])game.notice(startup[loaded.status]);
let paused=false,last=0,accumulator=0,saveClock=0;
const STEP=1/60;
function saveProgress(show=false){const ok=save(game.snapshot());if(show||!ok)game.notice(ok?'Progress saved on this device.':'Save failed. Browser storage may be blocked or full.');return ok;}
function pause(value=true){paused=value;input.clear();$('#overlay').hidden=!value;$('#pause').setAttribute('aria-expanded',String(value));if(value)$('#resume').focus();else {document.activeElement?.blur();$('#scene').focus()}}
function frame(t){
  const dt=Math.min((t-last)/1000||0,.1);last=t;
  if(input.consume('pause'))pause(!paused);
  if(!paused&&!document.hidden){accumulator+=dt;while(accumulator>=STEP){game.update(STEP,input);accumulator-=STEP;saveClock+=STEP;}
    if(saveClock>=12||game.needsSave){saveClock=0;game.needsSave=false;saveProgress();}
  }else accumulator=0;
  renderer.draw(game,paused?0:dt);
  $('#hearts').textContent='♥'.repeat(game.player.hp)+'♡'.repeat(5-game.player.hp);$('#hearts').setAttribute('aria-label',`${game.player.hp} of 5 hearts`);
  $('#level').textContent=game.player.level?'OVERLOOK · UPPER LEVEL':'GREAT PLATEAU · LOWER TRAIL';
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
