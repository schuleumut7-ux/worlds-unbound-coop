const $=id=>document.getElementById(id),c=$('game'),ctx=c.getContext('2d');

const touchDevice=('ontouchstart' in window)||navigator.maxTouchPoints>0;
let savedMobile=null;
try{savedMobile=localStorage.getItem('bm-mobile')}catch{}
let W,H,DPR,mode='menu',ws=null,room='',me='',shopName='BURGER SIMULATOR',dayStartedAt=0,mobile=touchDevice?true:(savedMobile==='1');
const DAY_LENGTH_MS=300000;
const DAY_START_MINUTES=8*60;
const DAY_END_MINUTES=22*60;
let connection='offline',connectBusy=false,connectTimer=0;
let last=performance.now(),keys=new Set(),joy={on:false,x:0,y:0},particles=[],floats=[],others=new Map(),activeTouch=null;
const recipes=[
 {name:'Classic Burger',price:8.5,steps:['bun','grill','assembly'],icons:'🍞 → 🥩 → 🍔 → 💵',need:{bun:1,patty:1}},
 {name:'Cheese Burger',price:10.5,steps:['bun','grill','cheese','assembly'],icons:'🍞 → 🥩 → 🧀 → 🍔 → 💵',need:{bun:1,patty:1,cheese:1}},
 {name:'Double Burger',price:14.5,steps:['bun','grill','grill','cheese','assembly'],icons:'🍞 → 🥩🥩 → 🧀 → 🍔 → 💵',need:{bun:1,patty:2,cheese:1}},
];
const station={
 bun:{x:465,y:170,label:'BUN',color:'#d19a63',emoji:'🍞'},
 grill:{x:615,y:170,label:'GRILL',color:'#e26b3e',emoji:'🔥'},
 cheese:{x:765,y:170,label:'CHEESE',color:'#efcf66',emoji:'🧀'},
 assembly:{x:915,y:170,label:'ASSEMBLY',color:'#debc69',emoji:'🍔'},
 cash:{x:855,y:455,label:'KASSE',color:'#5bc78b',emoji:'💵'}
};
const interactionPad={
 bun:{x:465,y:265,w:118,h:58},
 grill:{x:615,y:265,w:118,h:58},
 cheese:{x:765,y:265,w:118,h:58},
 assembly:{x:915,y:265,w:118,h:58},
 cash:{x:855,y:350,w:150,h:58}
};
function insidePad(pad,x,y,margin=0){
 return x>=pad.x-pad.w/2-margin&&x<=pad.x+pad.w/2+margin&&y>=pad.y-pad.h/2-margin&&y<=pad.y+pad.h/2+margin;
}
function circleHitsRect(x,y,r,rect){
 const qx=Math.max(rect.x,Math.min(x,rect.x+rect.w));
 const qy=Math.max(rect.y,Math.min(y,rect.y+rect.h));
 return Math.hypot(x-qx,y-qy)<r;
}
const solidObstacles=[
 {x:325,y:210,w:70,h:390},   // Lager/Kühlschrank
 {x:390,y:420,w:340,h:72},     // linkes Thekenstück
 {x:965,y:420,w:270,h:72}      // rechtes Thekenstück
];
function hitsStationBody(x,y){
 for(const p of Object.values(station)){
  const rect={x:p.x-56,y:p.y-43,w:112,h:86};
  if(circleHitsRect(x,y,22,rect))return true;
 }
 for(const rect of solidObstacles)if(circleHitsRect(x,y,22,rect))return true;
 return false;
}

const supplyInfo={
 bun:{label:'Brötchen',unit:'🍞',price:18},
 patty:{label:'Pattys',unit:'🥩',price:32},
 cheese:{label:'Käse',unit:'🧀',price:20},
 packaging:{label:'Verpackungen',unit:'📦',price:12},
 drinks:{label:'Getränke',unit:'🥤',price:14}
};
let hero={
 x:765,y:565,speed:210,money:500,debt:1000000,level:1,xp:0,day:1,rep:0,rating:4.2,
 bun:12,patty:12,cheese:8,packaging:10,drinks:8,
 sales:0,revenueToday:0,expensesToday:0,shiftRevenue:0,shiftExpenses:0,completed:0,missed:0,
 cleanliness:100,staff:{kitchen:0,cashier:0,cleaner:0},
 upgrades:{grill:1,shop:1,seats:1,quality:1,register:1}
};
const DEFAULT_HERO_STATE=JSON.parse(JSON.stringify(hero));
let order=null,prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3},cash={due:0,given:0,change:0,open:false};
let effects={shake:0,flash:0,steam:[]};
const SAVE_STORAGE_KEY='bm-save-files-v2';
let saveSlots=[null,null,null],isHost=false,currentSaveCode='',pendingSave=null,leavingGame=false,kickedForHostLeave=false;

function purgeLegacySaves(){
 try{
  ['bm-last-save','bm-code-1','bm-code-2','bm-code-3',
   'bm-slot-1','bm-slot-2','bm-slot-3'].forEach(k=>localStorage.removeItem(k));
 }catch{}
}
purgeLegacySaves();

function cloneData(v){
 try{return JSON.parse(JSON.stringify(v))}catch{return null}
}
function loadLocalSaveSlots(){
 try{
  const raw=localStorage.getItem(SAVE_STORAGE_KEY);
  const parsed=raw?JSON.parse(raw):[];
  if(Array.isArray(parsed))saveSlots=Array.from({length:3},(_,i)=>parsed[i]||null);
 }catch{saveSlots=[null,null,null]}
}
function persistLocalSaveSlots(){
 try{localStorage.setItem(SAVE_STORAGE_KEY,JSON.stringify(saveSlots))}catch{}
}
loadLocalSaveSlots();

function resetLocalGameState(){
 hero=cloneData(DEFAULT_HERO_STATE);
 order=null;
 prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 cash={due:0,given:0,change:0,open:false};
 effects={shake:0,flash:0,steam:[]};
 particles=[];floats=[];others.clear();
 shopName='BURGER SIMULATOR';dayStartedAt=0;currentSaveCode='';
 ui();
}
function makeSaveSnapshot(slot){
 const now=performance.now()/1000;
 return {
  version:2,
  slot:Number(slot)+1,
  savedAt:Date.now(),
  shopName,
  dayStartedAt,
  mobile,
  hero:cloneData(hero),
  order:cloneData(order),
  prep:{
   step:prep.step,started:prep.started,duration:prep.duration,
   readyIn:prep.started?Math.max(0,prep.readyAt-now):0,
   overIn:prep.started?Math.max(0,prep.overAt-now):0
  },
  cash:cloneData(cash),
  effects:cloneData(effects),
  particles:cloneData(particles),
  floats:cloneData(floats),
  players:[
   {id:me||'host',name:cleanSaveName($('name')?.value||'Hero'),x:hero.x,y:hero.y,host:true},
   ...[...others.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,host:false}))
  ]
 };
}
function cleanSaveName(v){
 return String(v||'Hero').replace(/[<>]/g,'').trim().slice(0,16)||'Hero';
}
function escapeHtml(v){
 return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function applySaveSnapshot(save){
 if(!save||typeof save!=='object'||!save.hero)return false;
 const fresh=cloneData(DEFAULT_HERO_STATE);
 hero={...fresh,...cloneData(save.hero),
  staff:{...fresh.staff,...(save.hero.staff||{})},
  upgrades:{...fresh.upgrades,...(save.hero.upgrades||{})}
 };
 if(Number.isFinite(save.hero.x))hero.x=save.hero.x;
 if(Number.isFinite(save.hero.y))hero.y=save.hero.y;
 hero.x=Math.max(300,Math.min(1215,hero.x));
 hero.y=Math.max(120,Math.min(770,hero.y));
 if(typeof save.shopName==='string'&&save.shopName.trim())shopName=save.shopName;
 dayStartedAt=Number(save.dayStartedAt)||Date.now();
 mobile=typeof save.mobile==='boolean'?save.mobile:mobile;
 order=save.order?cloneData(save.order):null;
 cash=save.cash?{...cloneData(save.cash)}:{due:0,given:0,change:0,open:false};
 const p=save.prep||{};
 const now=performance.now()/1000;
 prep={
  step:Number.isFinite(p.step)?p.step:-1,
  started:!!p.started,
  duration:Number.isFinite(p.duration)?p.duration:2.3,
  readyAt:now+Math.max(0,Number(p.readyIn)||0),
  overAt:now+Math.max(0,Number(p.overIn)||0)
 };
 effects=save.effects?cloneData(save.effects):{shake:0,flash:0,steam:[]};
 particles=Array.isArray(save.particles)?cloneData(save.particles):[];
 floats=Array.isArray(save.floats)?cloneData(save.floats):[];
 others.clear();
 if(save.players?.length){
  for(const p2 of save.players){
   if(p2.host||p2.id==='host'||p2.id===me)continue;
   if(p2.id)others.set(p2.id,{...p2});
  }
 }
 ui();renderInventory();renderShop();renderStaff();
 return true;
}
function renderSaveSlots(targetId='saveList',modeType='save'){
 const el=$(targetId);if(!el)return;
 el.innerHTML=saveSlots.map((slot,i)=>{
  if(!slot){
   return '<div class="saveSlot empty"><div class="saveSlotInfo"><div class="saveSlotTop"><b>SAVE FILE '+(i+1)+'</b></div><div class="saveSlotName">Noch nicht belegt</div><div class="saveSlotStats"><span>Kein Speicherpunkt vorhanden</span></div></div>'+
    (modeType==='save'?'<button data-save-slot="'+i+'">SLOT '+(i+1)+' ERSTELLEN</button>':'<button disabled>LEER</button>')+'</div>';
  }
  const money=Number(slot.money||0).toLocaleString('de-DE',{maximumFractionDigits:0});
  const rating=Number(slot.rating||0).toFixed(1);
  const safeName=escapeHtml(slot.name||'BURGER SIMULATOR');
  const safeCode=escapeHtml(slot.code||'--------');
  const action=modeType==='save'?'SPEICHERN':'LADEN';
  const disabled=modeType==='save'&&!isHost?' disabled':'';
  return '<div class="saveSlot"><div class="saveSlotInfo"><div class="saveSlotTop"><b>SAVE FILE '+(i+1)+'</b><span class="saveSlotName">'+safeName+'</span></div><div class="saveSlotStats"><span>💶 €'+money+'</span><span>⭐ '+rating+'</span></div><div class="saveSlotCode">CODE '+safeCode+'</div></div><button data-save-slot="'+i+'"'+disabled+'>'+action+'</button></div>';
 }).join('');
 el.querySelectorAll('[data-save-slot]').forEach(b=>{
  wirePressAnimation(b);
  b.onclick=()=>modeType==='save'?saveToSlot(Number(b.dataset.saveSlot)):loadLocalSlot(Number(b.dataset.saveSlot));
 });
}
function renderAllSaveLists(){
 renderSaveSlots('saveList','save');
 renderSaveSlots('startSaveList','load');
}
function localSaveByCode(code){
 const c=String(code||'').trim().toUpperCase();
 return saveSlots.find(s=>s?.code===c)||null;
}

function resize(){
 W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
 c.width=W*DPR;c.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener('resize',resize);resize();

function fmt(n){return Number(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})}
function setText(id,value){const el=$(id);if(el)el.textContent=value}
function toast(t){
 const el=$('toast');if(!el)return;
 el.textContent=t;el.classList.add('show');clearTimeout(toast.t);
 toast.t=setTimeout(()=>el.classList.remove('show'),2100);
}
function rr(x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,q);ctx.fill()}
function shadow(x,y,rx,ry,a=.35){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function txt(t,x,y,s=12,col='#fff',align='center'){ctx.save();ctx.font='800 '+s+'px Inter,system-ui,sans-serif';ctx.fillStyle=col;ctx.textAlign=align;ctx.fillText(t,x,y);ctx.restore()}
function addFloat(t,x,y,col='#8ff0aa'){floats.push({t,x,y,life:1,col})}
function burst(x,y,n=12,col='#ffbd43'){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:.5+Math.random()*.7,r:2+Math.random()*4,col})}
function saveMobilePreference(value){try{localStorage.setItem('bm-mobile',value?'1':'0')}catch{}}
function updateMobileStart(){setText('mobileStartState',mobile?'AN':'AUS')}

function clockInfo(now=Date.now()){
 const started=Number(dayStartedAt)||now;
 const elapsed=Math.max(0,Math.min(DAY_LENGTH_MS,now-started));
 const progress=elapsed/DAY_LENGTH_MS;
 const minutes=Math.min(DAY_END_MINUTES,Math.floor(DAY_START_MINUTES+(DAY_END_MINUTES-DAY_START_MINUTES)*progress));
 const hh=String(Math.floor(minutes/60)).padStart(2,'0');
 const mm=String(minutes%60).padStart(2,'0');
 return {text:hh+':'+mm,remaining:Math.max(0,DAY_LENGTH_MS-elapsed)};
}
function tutorialUpdate(){
 const el=$('tutorialInfo');
 if(!el)return;
 if(hero.completed>=1){
  el.classList.add('tutorialDone');
  return;
 }
 el.classList.remove('tutorialDone');
 const s=order?.steps?.[order.stepIndex];
 const title=$('tutorialTitle'),textEl=$('tutorialText'),stepEl=el.querySelector('.tutorialStep');
 if(!s){
  if(title)title.textContent='Jetzt bezahlen';
  if(textEl)textEl.textContent='Stell dich auf das graue Kassenfeld und gib das richtige Rückgeld.';
  if(stepEl)stepEl.textContent='3 / 3';
  return;
 }
 const labels={bun:'Brötchen',grill:'Patty grillen',cheese:'Käse',assembly:'Burger bauen',cash:'Kasse'};
 if(title)title.textContent='Nächster Schritt: '+(labels[s]||s);
 if(textEl)textEl.textContent='Stell dich auf das graue Feld vor '+(station[s]?.label||'der Station')+' und drücke E oder ✋.';
 const idx=Math.min(2,order.stepIndex+1);
 if(stepEl)stepEl.textContent=idx+' / 3';
}
function ui(){
 setText('money',Math.floor(hero.money).toLocaleString('de-DE'));
 setText('debt',Math.max(0,Math.floor(hero.debt)).toLocaleString('de-DE'));
 setText('level',hero.level);
 setText('room',room||'—');
 setText('playerCount',(1+others.size)+'/2');
 setText('shopNameLabel',shopName);
 setText('shiftLabel','TAG '+hero.day+' • '+clockInfo().text);
 setText('gameClock',clockInfo().text);
 setText('orderName',order?order.name:'Keine Bestellung');
 setText('recipeLine',order?order.icons:'Warte auf Kunden…');
 setText('orderHint',order?stepHint():'Neue Gäste kommen gleich.');
 tutorialUpdate();
 const done=order?Math.min(1,order.stepIndex/order.steps.length):0;
 const bar=$('orderProgress');if(bar)bar.style.width=(done*100)+'%';
 document.body.classList.toggle('mobileOn',mobile);
 document.body.classList.toggle('mobileOff',!mobile);
 const dot=$('connectionDot');
 if(dot){dot.className=connection==='connected'?'online':connection==='connecting'?'connecting':'offline'}
 if($('mobileToggle'))$('mobileToggle').checked=mobile;
 if($('shopNameInput')&&document.activeElement!==$('shopNameInput'))$('shopNameInput').value=shopName;
 const saveBtn=$('saveGameOpen'),hostHint=$('saveHostHint');
 if(saveBtn){
  saveBtn.disabled=!isHost;
  saveBtn.textContent=isHost?'💾 SPIEL SPEICHERN':'🔒 NUR HOST KANN SPEICHERN';
 }
 if(hostHint)hostHint.textContent=isHost?'Du bist Host dieser Lobby. Deine drei Save Files kannst du hier speichern.':'Du bist nicht der Host. Nur der Host kann einen Speicherpunkt erstellen.';
 updateMobileStart();
}
function stepHint(){
 if(!order)return '';
 const s=order.steps[order.stepIndex];
 if(!s&&order.stepIndex>=order.steps.length)return 'Burger fertig — zur Kasse gehen.';
 return s==='cash'?'Geld annehmen und korrekt Rückgeld geben.':'Station: '+station[s].label+' — E / ✋ interagieren';
}
function makeOrder(){
 const base=recipes[Math.floor(Math.random()*recipes.length)];
 order={...base,steps:[...base.steps],need:{...base.need},stepIndex:0};
 prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 ui();
}
function startGame(showStory=true){
 mode='game';$('menu').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.add('hidden');$('hud').classList.remove('hidden');
 resetJoy();resize();if(!order)makeOrder();ui();
 if(showStory)setTimeout(()=>{$('storyPanel')?.classList.remove('hidden')},140);
}
function connect(type,code='',extra={}){
 if(connectBusy)return;
 connectBusy=true;connection='connecting';ui();
 if(ws){try{ws.close()}catch{}ws=null}
 const proto=location.protocol==='https:'?'wss':'ws';
 try{ws=new WebSocket(proto+'://'+location.host)}catch{connectBusy=false;connection='offline';ui();return toast('❌ Verbindung konnte nicht gestartet werden.')}
 clearTimeout(connectTimer);
 connectTimer=setTimeout(()=>{
  if(connection==='connecting'){
   try{ws?.close()}catch{}
   connectBusy=false;connection='offline';ui();
   toast(type==='join'?'❌ Raum konnte nicht erreicht werden.':'⚠️ Server antwortet nicht — lokaler Laden läuft weiter.');
  }
 },7000);
 ws.onopen=()=>{
  clearTimeout(connectTimer);connection='connected';connectBusy=false;ui();
  ws.send(JSON.stringify({type:type,name:cleanSaveName($('name')?.value||'Hero'),code:String(code||'').trim().toUpperCase(),...extra}));
 };
 ws.onmessage=e=>{
  let m;try{m=JSON.parse(e.data)}catch{return}
  if(m.type==='roomCreated'||m.type==='joined'){
   room=m.code;me=m.id;connectBusy=false;connection='connected';isHost=(m.hostId?m.hostId===me:type!=='join');
   if(m.loaded&&m.save)applySaveSnapshot(m.save);
   if(mode!=='game')startGame(false);
   currentSaveCode=m.saveCode||currentSaveCode;
   toast(m.type==='roomCreated'?'🍔 ROOM '+room+' ERSTELLT':'🤝 CO-OP VERBUNDEN');
   ui();
  }
  if(m.type==='state'){
   room=m.code||room;
   if(m.host) isHost=(m.host===me);
   applyBusiness(m.business||{});
   const seen=new Set();
   for(const p of m.players||[]){
    if(p.id===me){
     hero.x=Number.isFinite(p.x)?p.x:hero.x;hero.y=Number.isFinite(p.y)?p.y:hero.y;
     if(Number.isFinite(p.money))hero.money=p.money;
     if(Number.isFinite(p.debt))hero.debt=p.debt;
     if(Number.isFinite(p.day))hero.day=p.day;
    }else{others.set(p.id,p);seen.add(p.id)}
   }
   for(const id of [...others.keys()])if(!seen.has(id))others.delete(id);
   ui();
  }
  if(m.type==='sale'){toast('💵 CO-OP Verkauf: '+fmt(m.amount)+' €');burst(hero.x,hero.y,18)}
  if(m.type==='dayEnded'){toast('🌙 TAG '+((m.day)||hero.day)+' STARTET');hero.revenueToday=0;hero.expensesToday=0;hero.shiftRevenue=0;hero.shiftExpenses=0;makeOrder();ui()}
  if(m.type==='saveCreated'){
   const idx=Math.max(0,Math.min(2,Number(m.slot||1)-1));
   const local={slot:idx+1,name:m.shopName||shopName,money:Number(m.money||hero.money),rating:Number(m.rating||hero.rating),code:String(m.saveCode||''),savedAt:Number(m.savedAt||Date.now()),snapshot:m.save||makeSaveSnapshot(idx)};
   saveSlots[idx]=local;persistLocalSaveSlots();currentSaveCode=local.code;pendingSave=local;
   renderAllSaveLists();
   $('savePanel')?.classList.add('hidden');$('settingsPanel')?.classList.add('hidden');
   setText('saveResultSlot','SAVE FILE '+(idx+1)+' • '+local.name+' • 💶 €'+Number(local.money).toLocaleString('de-DE',{maximumFractionDigits:0})+' • ⭐ '+local.rating.toFixed(1));
   setText('saveResultCode',local.code);
   $('saveResultPanel')?.classList.remove('hidden');
  }
  if(m.type==='hostLeft'){
   kickedForHostLeave=true;connection='offline';connectBusy=false;isHost=false;others.clear();showHostLeftPopup();
  }
  if(m.type==='error'){connectBusy=false;connection='offline';clearTimeout(connectTimer);ui();toast('❌ '+m.message)}
 };
 ws.onerror=()=>{connection='offline';connectBusy=false;ui()};
 ws.onclose=()=>{clearTimeout(connectTimer);connectBusy=false;connection='offline';ui();
   if(leavingGame||kickedForHostLeave)return;
   if(mode==='game')toast('⚠️ Server getrennt — du kannst lokal weiterspielen');
 };
}
function send(type,data={}){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type,...data}))}

$('create').onclick=()=>{
 if(connectBusy)return;
 resetLocalGameState();isHost=true;mode='menu';startGame(true);toast('🌐 ROOM WIRD ERSTELLT…');connect('create');
};
$('joinOpen').onclick=()=>{
 if(connectBusy)return;
 $('menu').classList.add('hidden');$('join').classList.remove('hidden');
 setTimeout(()=>$('code')?.focus(),80);
};
$('joinRoomBtn').onclick=()=>{
 const code=($('code')?.value||'').trim().toUpperCase();
 if(code.length!==5)return toast('⚠️ Bitte den 5-stelligen Raumcode eingeben.');
 resetLocalGameState();isHost=false;connect('join',code);
};
$('back').onclick=()=>{$('join').classList.add('hidden');$('menu').classList.remove('hidden');connection='offline';ui()};
$('loadSaveOpen').onclick=()=>{
 $('menu').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.remove('hidden');renderSaveSlots('startSaveList','load');setTimeout(()=>$('saveCodeInput')?.focus(),80);
};
$('loadSaveBack').onclick=()=>{
 $('loadSave').classList.add('hidden');$('menu').classList.remove('hidden');
};
$('saveCodeInput').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)});
function loadLocalSlot(index){
 const slot=saveSlots[index];if(!slot?.code)return toast('⚠️ Dieser Speicherplatz ist leer.');
 loadSaveByCode(slot.code);
}
function loadSaveByCode(code){
 const c=String(code||'').trim().toUpperCase();
 if(c.length!==8)return toast('⚠️ Bitte den 8-stelligen Save-Code eingeben.');
 const local=localSaveByCode(c);
 if(local?.snapshot){
  leavingGame=false;kickedForHostLeave=false;isHost=true;connection='connecting';
  toast('💾 SAVE FILE wird geladen…');
  connect('createLoaded','',{save:local.snapshot,saveCode:local.code});
  return;
 }
 leavingGame=false;kickedForHostLeave=false;isHost=true;
 toast('🌐 SAVE FILE wird vom Server geladen…');
 connect('loadSave',c);
}
$('loadSaveCodeBtn').onclick=()=>loadSaveByCode($('saveCodeInput')?.value||'');

$('code').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)});

$('how').onclick=()=>{
 $('storyPanel')?.classList.remove('hidden');
 $('menu').style.visibility='hidden';
};
$('storyClose').onclick=()=>{
 $('storyPanel')?.classList.add('hidden');
 if(mode==='menu')$('menu').style.visibility='visible';
};
$('settings').onclick=()=>{
 $('settingsPanel').classList.remove('hidden');
 renderSaveSlots('saveList','save');
};
$('settingsClose').onclick=()=>$('settingsPanel').classList.add('hidden');
$('saveGameOpen').onclick=()=>{
 if(!isHost)return toast('🔒 Nur der Host kann speichern.');
 if(ws?.readyState!==WebSocket.OPEN)return toast('❌ Nicht mit dem Server verbunden.');
 $('settingsPanel').classList.add('hidden');$('savePanel').classList.remove('hidden');
 renderSaveSlots('saveList','save');
};
$('saveClose').onclick=()=>$('savePanel').classList.add('hidden');
$('saveCloseX').onclick=()=>$('savePanel').classList.add('hidden');
function saveToSlot(index){
 if(!isHost)return toast('🔒 Nur der Host kann speichern.');
 if(ws?.readyState!==WebSocket.OPEN)return toast('❌ Nicht mit dem Server verbunden.');
 const snapshot=makeSaveSnapshot(index);
 pendingSave={slot:index+1,snapshot};
 toast('💾 Speicherpunkt wird erstellt…');
 send('saveFile',{slot:index+1,save:snapshot});
}
$('saveContinue').onclick=()=>{$('saveResultPanel').classList.add('hidden');pendingSave=null};
$('saveLeave').onclick=()=>{$('saveResultPanel').classList.add('hidden');leaveToMenu()};
function showHostLeftPopup(){
 leavingGame=false;mode='menu';room='';me='';isHost=false;others.clear();
 $('hud').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.add('hidden');$('menu').classList.remove('hidden');$('menu').style.visibility='visible';
 document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
 $('hostLeftPanel').classList.remove('hidden');ui();
}
function leaveToMenu(){
 leavingGame=true;mode='menu';isHost=false;connection='offline';others.clear();
 document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
 $('hud').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.add('hidden');$('menu').classList.remove('hidden');$('menu').style.visibility='visible';ui();
 if(ws?.readyState===WebSocket.OPEN)send('leave');
 setTimeout(()=>{try{ws?.close()}catch{};ws=null;room='';me='';leavingGame=false},350);
}
$('hostLeftOk').onclick=()=>{$('hostLeftPanel').classList.add('hidden');ui()};
wirePressAnimation($('saveGameOpen'));

function wirePressAnimation(el){
 if(!el)return;
 const down=()=>el.classList.add('isPressed');
 const up=()=>el.classList.remove('isPressed');
 el.addEventListener('pointerdown',down,{passive:true});
 el.addEventListener('pointerup',up,{passive:true});
 el.addEventListener('pointercancel',up,{passive:true});
 el.addEventListener('pointerleave',up,{passive:true});
 el.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')el.classList.add('isPressed')});
 el.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')el.classList.remove('isPressed')});
}
wirePressAnimation($('mInteract'));

$('mobileToggle').onchange=e=>{
 mobile=!!e.target.checked;saveMobilePreference(mobile);ui();
 toast(mobile?'📱 MOBILE STEUERUNG AN':'📱 MOBILE STEUERUNG AUS');
};
$('mobileStartToggle').onclick=()=>{
 mobile=!mobile;saveMobilePreference(mobile);ui();
 toast(mobile?'📱 MOBILE STEUERUNG AN':'📱 MOBILE STEUERUNG AUS');
};
function saveCurrentShopName(showToast=true){
 const v=String($('shopNameInput')?.value||'').replace(/\s+/g,' ').trim().slice(0,24);
 if(!v){toast('⚠️ Bitte einen Ladenname eingeben.');return false}
 shopName=v;
 send('business',{action:'setShopName',shopName:v});
 ui();
 if(showToast)toast('✅ Ladenname geändert: '+v);
 return true;
}
$('saveShopName').onclick=()=>saveCurrentShopName(true);
$('shopNameInput').addEventListener('input',()=>{
 const raw=String($('shopNameInput').value||'').replace(/\s+/g,' ').slice(0,24);
 if($('shopNameInput').value!==raw)$('shopNameInput').value=raw;
 shopName=raw.trim()||'BURGER SIMULATOR';
 setText('shopNameLabel',shopName);
});
$('shopNameInput').addEventListener('keydown',e=>{
 if(e.key==='Enter'){
  e.preventDefault();
  saveCurrentShopName(true);
 }
});

$('inventoryBtn').onclick=()=>{$('inventoryPanel').classList.remove('hidden');renderInventory()};
$('inventoryCloseX').onclick=()=>$('inventoryPanel').classList.add('hidden');
$('shopBtn').onclick=()=>{$('shopPanel').classList.remove('hidden');renderShop()};
$('shopCloseX').onclick=()=>$('shopPanel').classList.add('hidden');
$('staffBtn').onclick=()=>{$('staffPanel').classList.remove('hidden');renderStaff()};
$('staffCloseX').onclick=()=>$('staffPanel').classList.add('hidden');


function renderInventory(){
 const vals=[
  ['🍞 Brötchen','bun'],['🥩 Pattys','patty'],['🧀 Käse','cheese'],
  ['📦 Verpackung','packaging'],['🥤 Getränke','drinks'],['🧼 Sauberkeit','cleanliness'],['⭐ Bewertung','rating']
 ];
 $('inventoryList').innerHTML=vals.map(([l,k])=>'<div class="invItem"><span>'+l+'</span><b>'+
  (k==='cleanliness'?Math.round(hero[k])+'%':k==='rating'?hero[k].toFixed(1)+'/5':hero[k])+'</b></div>').join('');
}
const shopItems={
 bun:{label:'Brötchen-Kiste',desc:'+10 Brötchen',cost:180,kind:'supply',key:'bun',amount:10},
 patty:{label:'Patty-Kiste',desc:'+10 Pattys',cost:320,kind:'supply',key:'patty',amount:10},
 cheese:{label:'Käse-Kiste',desc:'+10 Käse',cost:200,kind:'supply',key:'cheese',amount:10},
 packaging:{label:'Verpackungs-Kiste',desc:'+15 Verpackungen',cost:180,kind:'supply',key:'packaging',amount:15},
 drinks:{label:'Getränke-Kiste',desc:'+10 Getränke',cost:140,kind:'supply',key:'drinks',amount:10},
 grill:{label:'Besserer Grill',desc:'+Garqualität und Tempo',cost:550,kind:'upgrade',key:'grill'},
 quality:{label:'Zutatenqualität',desc:'+Verkaufspreis',cost:700,kind:'upgrade',key:'quality'},
 seats:{label:'Mehr Sitzplätze',desc:'+Kunden im Laden',cost:900,kind:'upgrade',key:'seats'},
 register:{label:'Profi-Kasse',desc:'+Kassenbonus',cost:1000,kind:'upgrade',key:'register'},
 shop:{label:'Laden-Ausbau',desc:'+Mitarbeiter und Kundenzahl',cost:1400,kind:'upgrade',key:'shop'}
};
function renderShop(){
 const list=$('shopList');if(!list)return;
 list.innerHTML=Object.entries(shopItems).map(([id,v])=>'<div class="shopItem"><div><strong>'+v.label+'</strong><small>'+v.desc+' • €'+v.cost+'</small></div><button data-buy="'+id+'">KAUFEN</button></div>').join('');
 list.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyShop(b.dataset.buy));
}
function buyShop(id){
 const v=shopItems[id];if(!v)return;
 if(hero.money<v.cost)return toast('❌ Nicht genug Geld');
 hero.money-=v.cost;
 if(v.kind==='supply'){hero[v.key]+=v.amount;toast('📦 '+v.label+' gekauft')}
 else{hero.upgrades[v.key]++;toast('🔧 '+v.label+' Stufe '+hero.upgrades[v.key])}
 hero.shiftExpenses+=v.cost;hero.expensesToday+=v.cost;
 send('business',{action:'spend',amount:v.cost});burst(hero.x,hero.y,12);ui();renderShop();
}
function renderStaff(){
 const map={kitchen:'staffKitchen',cashier:'staffCash',cleaner:'staffClean'};
 for(const k of Object.keys(map))$(map[k]).textContent='Stufe '+hero.staff[k];
}
document.querySelectorAll('[data-staff]').forEach(b=>b.onclick=()=>hireStaff(b.dataset.staff));
function hireStaff(k){
 const price=450+hero.staff[k]*350;if(hero.money<price)return toast('❌ Nicht genug Geld');
 hero.money-=price;hero.staff[k]++;hero.shiftExpenses+=price;hero.expensesToday+=price;
 send('business',{action:'spend',amount:price});toast('👨‍🍳 Personal Stufe '+hero.staff[k]);ui();renderStaff();
}

function finishStep(){
 if(!order)return;
 const step=order.steps[order.stepIndex];
 if(step==='bun'&&hero.bun>0){hero.bun--;prepDone('🍞 Brötchen vorbereitet')}
 else if(step==='grill'&&hero.patty>0){hero.patty--;prepDone('🔥 Patty perfekt gegrillt')}
 else if(step==='cheese'&&hero.cheese>0){hero.cheese--;prepDone('🧀 Käse aufgelegt')}
 else if(step==='assembly'&&hero.packaging>0){hero.packaging--;prepDone('🍔 Burger sauber gebaut')}
 else if(step==='cash'){openCash()}
 else if(step){toast('📦 Diese Zutat fehlt — im Shop nachbestellen')}
}
function prepDone(msg){
 order.stepIndex++;prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 addFloat(msg,hero.x,hero.y-45);burst(hero.x,hero.y,9);hero.xp+=10;levelCheck();ui();
}
function getNearestStation(){
 let near=null;
 let bestScore=Infinity;
 for(const [k,pad] of Object.entries(interactionPad)){
  const cx=pad.x,cy=pad.y;
  const inside=insidePad(pad,hero.x,hero.y,7);
  if(!inside)continue;
  const score=Math.hypot(hero.x-cx,hero.y-cy);
  if(score<bestScore){bestScore=score;near=k}
 }
 return near;
}
function tryInteract(){
 if(mode!=='game'||cash.open||document.querySelector('.modal:not(.hidden)'))return;
 const near=getNearestStation();
 if(!near)return toast('📍 Geht näher an eine Station.');
 if(!order)return makeOrder();
 if(near==='cash'&&order.stepIndex>=order.steps.length)return openCash();
 const step=order.steps[order.stepIndex];
 if(step!==near)return toast('🔔 Erst '+String(step||'den nächsten Schritt')+' machen.');
 if(near==='grill'){
  const now=performance.now()/1000;
  if(!prep.started){
   prep.started=true;prep.step=order.stepIndex;
   prep.duration=Math.max(.9,2.35/(1+hero.upgrades[near]*.12));
   prep.readyAt=now+prep.duration;prep.overAt=prep.readyAt+1.55;
   toast('🔥 GRILL LÄUFT…');
  }else if(now>=prep.overAt){
   const ingredient='patty';
   hero.rating=Math.max(1,hero.rating-.08);prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
   toast('⚠️ ZU LANG GEBRATEN — neue Portion nehmen');if(hero[ingredient]>0)hero[ingredient]--;ui();
  }else if(now>=prep.readyAt){finishStep()}
  else toast('⏳ Noch nicht fertig…');
 }else finishStep();
}
function openCash(){
 if(!order||cash.open||order.stepIndex<order.steps.length)return;
 const base=order.price*(1+0.08*(hero.upgrades.quality-1));
 cash.due=Math.round(base*100)/100;
 const bills=[10,20,50,100];
 cash.given=bills.find(v=>v>=cash.due) || 100;
 cash.change=Math.round((cash.given-cash.due)*100)/100;
 cash.open=true;
 setText('cashDue','€'+fmt(cash.due));setText('cashGiven','€'+fmt(cash.given));setText('cashChange','€'+fmt(cash.change));
 $('cashInput').value='';$('cashPanel').classList.remove('hidden');
 setTimeout(()=>{$('cashInput')?.focus()},50);
}
document.querySelectorAll('[data-cash]').forEach(b=>b.onclick=()=>{
 const v=b.dataset.cash==='exact'?cash.given:b.dataset.cash;
 $('cashInput').value=v;$('cashInput').dispatchEvent(new Event('input',{bubbles:true}));
});
$('cashCancel').onclick=()=>{$('cashPanel').classList.add('hidden');cash.open=false};
$('cashAccept').onclick=takePayment;
$('mInteract').onclick=tryInteract;
$('cashInput').addEventListener('input',()=>{
 const got=Number(String($('cashInput').value).replace(',','.'))||0;
 setText('cashChange','€'+fmt(Math.max(0,got-cash.due)));
});

function takePayment(){
 const got=Math.round((Number(String($('cashInput').value).replace(',','.'))||0)*100)/100;
 if(got+0.001<cash.due)return toast('❌ Das Geld reicht nicht.');
 const change=Math.round((got-cash.due)*100)/100;
 if(Math.abs(change-cash.change)>=0.011)return toast('⚠️ Rückgeld stimmt nicht.');
 $('cashChange').textContent='€'+fmt(change);$('cashPanel').classList.add('hidden');cash.open=false;
 const gross=cash.due,cost=recipeCost(order),profit=Math.max(0,gross-cost);
 const registerBonus=hero.upgrades.register-1,net=profit+registerBonus*.75;
 hero.money+=gross;hero.debt=Math.max(0,hero.debt-net*.2);hero.revenueToday+=gross;hero.shiftRevenue+=gross;
 hero.expensesToday+=cost;hero.shiftExpenses+=cost;hero.sales++;hero.completed++;hero.xp+=25+hero.staff.cashier*3;
 hero.rep+=hero.rating>4?1:0;
 if(hero.completed===1){
  $('tutorialInfo')?.classList.add('tutorialDone');
  toast('✅ ERSTER BURGER FERTIG — TUTORIAL ABGESCHLOSSEN');
 }
 toast('💵 GELD ANGENOMMEN • RÜCKGELD €'+fmt(change));
 addFloat('+€'+fmt(gross),hero.x,hero.y-55);burst(station.cash.x,station.cash.y,25,'#ffe08b');effects.shake=5;
 send('business',{action:'sale',amount:gross,profit:net,day:hero.day});
 makeOrder();levelCheck();ui();
 if(hero.debt<=0)toast('🏆 DIE SCHULD IST BEZAHLT!');
}
function recipeCost(r){return Object.entries(r.need||{}).reduce((sum,[k,n])=>sum+(supplyInfo[k]?.price||0)*n/10,0)}
function levelCheck(){
 const need=100+hero.level*60;
 while(hero.xp>=need){hero.xp-=need;hero.level++;hero.money+=80;hero.rating=Math.min(5,hero.rating+.05);toast('⭐ LEVEL UP! STUFE '+hero.level);burst(hero.x,hero.y,35,'#ffe070')}
}
function performStaff(dt){
 if(hero.staff.cleaner>0)hero.cleanliness=Math.min(100,hero.cleanliness+dt*.4*hero.staff.cleaner);
 if(hero.staff.kitchen>0&&order&&Math.random()<dt*.035*hero.staff.kitchen){
  const step=order.steps[order.stepIndex];if(step&&['bun','grill','cheese'].includes(step))prepDone('👨‍🍳 KÜCHENHILFE HILFT!');
 }
 if(hero.staff.cashier>0&&order&&order.stepIndex>=order.steps.length&&Math.random()<dt*.02*hero.staff.cashier)openCash();
}
function move(dt){
 let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 let y=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 if(joy.on){x=joy.x;y=joy.y}
 const l=Math.hypot(x,y)||1;
 if(x||y){
  const nx=hero.x+x/l*hero.speed*dt;
  const ny=hero.y+y/l*hero.speed*dt;
  if(!hitsStationBody(nx,hero.y))hero.x=nx;
  if(!hitsStationBody(hero.x,ny))hero.y=ny;
 }
 hero.x=Math.max(300,Math.min(1215,hero.x));hero.y=Math.max(120,Math.min(770,hero.y));
}

function sendInput(){send('input',{x:hero.x,y:hero.y})}
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();keys.add(k);
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 if(k==='e')tryInteract();if(k==='q')makeOrder();if(k==='i')$('inventoryPanel').classList.remove('hidden');
 if(k==='u')$('shopPanel').classList.remove('hidden');
 if(k==='escape')document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();resetJoy()});

function updateJoy(clientX,clientY){
 const el=$('joy');if(!el)return;
 const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=clientX-cx,dy=clientY-cy;
 const max=Math.max(20,Math.min(r.width,r.height)*.36),len=Math.hypot(dx,dy)||1;
 if(len>max){dx=dx/len*max;dy=dy/len*max}
 joy.x=dx/max;joy.y=dy/max;
 const knob=el.querySelector('i'),travel=Math.min(r.width,r.height)*.29;
 if(knob)knob.style.transform='translate(calc(-50% + '+(joy.x*travel)+'px),calc(-50% + '+(joy.y*travel)+'px))';
}
function resetJoy(){
 activeTouch=null;joy.on=false;joy.x=0;joy.y=0;
 const k=$('joy')?.querySelector('i');if(k)k.style.transform='translate(-50%,-50%)';
}
const joyEl=$('joy');
joyEl.addEventListener('pointerdown',e=>{
 if(!mobile||activeTouch!==null)return;
 e.preventDefault();activeTouch=e.pointerId;joy.on=true;
 joyEl.setPointerCapture?.(e.pointerId);updateJoy(e.clientX,e.clientY);
});
document.addEventListener('pointermove',e=>{
 if(e.pointerId!==activeTouch)return;
 e.preventDefault();updateJoy(e.clientX,e.clientY);
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(e.pointerId===activeTouch){e.preventDefault();resetJoy()}
},{passive:false});
document.addEventListener('pointercancel',e=>{if(e.pointerId===activeTouch)resetJoy()});
joyEl.addEventListener('lostpointercapture',()=>{if(activeTouch!==null)resetJoy()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetJoy()});
addEventListener('pointerup',e=>{if(e.pointerId===activeTouch)resetJoy()});
addEventListener('blur',resetJoy);

function drawKitchen(t){
 const lampPulse=.5+.5*Math.sin(t*.0032);
 ctx.fillStyle='#0b100e';ctx.fillRect(0,0,1500,900);
 for(let y=0;y<900;y+=70){
  for(let x=0;x<1500;x+=70){
   ctx.fillStyle=((x+y)/70)%2?'#27312d':'#202a25';
   ctx.fillRect(x,y,68,68);
   ctx.strokeStyle='#ffffff08';ctx.strokeRect(x+.5,y+.5,67,67);
  }
 }
 ctx.fillStyle='#070b09';rr(235,55,1040,790,38);
 ctx.fillStyle='#202824';rr(258,78,994,744,31);
 ctx.fillStyle='#5a402e';rr(278,98,954,704,25);
 ctx.fillStyle='#6a4a33';
 for(let y=115;y<790;y+=32)ctx.fillRect(292,y,926,3);
 for(let x=292;x<1218;x+=38)ctx.fillRect(x,115,3,690);
 ctx.fillStyle='#ffffff08';ctx.fillRect(292,148,926,2);ctx.fillRect(292,432,926,2);ctx.fillRect(292,690,926,2);
 ctx.fillStyle='#0e1411';rr(410,102,680,48,12);
 const signGlow=ctx.createLinearGradient(620,115,880,120);
 signGlow.addColorStop(0,'#ff9f22');signGlow.addColorStop(.5,'#ffe290');signGlow.addColorStop(1,'#ff9f22');
 ctx.fillStyle=signGlow;ctx.shadowBlur=22+lampPulse*10;ctx.shadowColor='#ff9e28';ctx.fillRect(620,115,260,5);ctx.shadowBlur=0;
 txt(shopName,750,137,20,'#ffd477');
 for(let i=0;i<7;i++){
  const sx=460+i*98;
  ctx.globalAlpha=.25+.18*lampPulse;
  ctx.fillStyle=i%2?'#ffbe49':'#f9e1a5';
  ctx.beginPath();ctx.arc(sx,91,4+lampPulse*1.4,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 ctx.save();
 for(const [lx,ly] of [[465,170],[615,170],[765,170],[915,170]]){
  const rg=ctx.createRadialGradient(lx,ly,10,lx,ly,190);
  rg.addColorStop(0,'#ffd47520');rg.addColorStop(1,'transparent');
  ctx.fillStyle=rg;ctx.fillRect(lx-190,ly-190,380,380);
 }
 ctx.restore();
 drawFridge();drawCounter();drawStations(t);drawInteractionPads(t);drawQueue(t);
}
function drawFridge(){
 shadow(360,610,50,12,.3);
 ctx.fillStyle='#aebdb7';rr(320,198,80,414,13);
 ctx.fillStyle='#dfe8e4';rr(327,207,66,188,10);
 ctx.fillStyle='#c8d5d0';rr(327,405,66,198,10);
 ctx.strokeStyle='#74847e';ctx.lineWidth=2;ctx.strokeRect(333,216,54,174);ctx.strokeRect(333,414,54,181);
 ctx.fillStyle='#78908a';
 for(let i=0;i<4;i++)ctx.fillRect(341,242+i*25,38,5);
 ctx.fillStyle='#f2f7f4';ctx.globalAlpha=.42;
 for(let i=0;i<3;i++)ctx.fillRect(342,438+i*42,36,4);
 ctx.globalAlpha=1;txt('LAGER',360,628,10,'#dce6e1');
}
function drawCounter(){
  shadow(815,505,430,18,.32);

  // Two counter wings leave a real central entrance.
  ctx.fillStyle='#121815';
  rr(385,410,350,88,18);
  rr(960,410,275,88,18);

  // Counter front panels.
  ctx.fillStyle='#70492f';
  rr(398,420,324,64,14);
  rr(973,420,250,64,14);

  // Premium stone/wood counter top.
  ctx.fillStyle='#d7c3a8';
  rr(398,414,324,18,8);
  rr(973,414,250,18,8);
  ctx.fillStyle='#f3e3c7';
  ctx.globalAlpha=.35;
  rr(410,417,300,5,3);
  rr(985,417,226,5,3);
  ctx.globalAlpha=1;

  // Decorative front panels.
  for(const x of [420,520,620,665,990,1080,1170]){
    ctx.fillStyle='#432f24';
    rr(x,449,62,25,7);
    ctx.strokeStyle='#956b49';
    ctx.lineWidth=1.5;
    ctx.strokeRect(x+1,450,60,23);
  }

  // Customer pickup shelves.
  ctx.fillStyle='rgba(240,245,240,.12)';
  rr(412,435,298,9,4);
  rr(986,435,226,9,4);

  // Central passage frame: the gap itself remains open.
  ctx.fillStyle='#171d19';
  rr(748,410,214,88,18);
  ctx.fillStyle='#2b2119';
  rr(766,421,178,66,14);

  // Built-in register at the center opening.
  ctx.fillStyle='#0e1411';
  rr(792,401,126,77,13);
  ctx.strokeStyle='#8e6a4b';
  ctx.lineWidth=2;
  ctx.strokeRect(796,405,118,69);

  ctx.fillStyle='#26312b';
  rr(807,412,96,34,9);
  ctx.fillStyle='#62e6a0';
  rr(815,418,80,20,6);
  ctx.fillStyle='#173d27';
  txt('€',855,434,17,'#173d27');

  ctx.fillStyle='#c8b18e';
  for(let i=0;i<4;i++)ctx.fillRect(814+i*19,454,11,6);
  ctx.fillStyle='#5ed797';
  ctx.beginPath();ctx.arc(900,457,5,0,Math.PI*2);ctx.fill();

  // Small order/pickup sign above the counter.
  ctx.fillStyle='#242c27';
  rr(610,389,205,27,9);
  txt('BESTELLUNG • ABHOLUNG',712,407,10,'#fff');
}
function drawInteractionPads(t){
 const emoji={bun:'🍞',grill:'🥩',cheese:'🧀',assembly:'🍔',cash:'💶'};
 const active=getNearestStation();
 for(const [k,p] of Object.entries(interactionPad)){
  const near=k===active;
  const pulse=.5+.5*Math.sin(t*.006+(p.x%80)*.02);
  ctx.save();

  // Very light transparent work field.
  shadow(p.x,p.y+18,p.w*.38,5,.16);
  ctx.fillStyle=near?'rgba(255,211,105,.105)':'rgba(210,219,214,.045)';
  rr(p.x-p.w/2,p.y-p.h/2,p.w,p.h,13);

  ctx.strokeStyle=near?'rgba(255,219,132,.52)':'rgba(225,232,227,.12)';
  ctx.lineWidth=near?2.2:1.15;
  ctx.stroke();

  ctx.fillStyle=near?'rgba(255,255,255,.045)':'rgba(255,255,255,.018)';
  rr(p.x-p.w/2+5,p.y-p.h/2+5,p.w-10,p.h-10,9);

  ctx.strokeStyle=near?'rgba(255,231,166,.30)':'rgba(255,255,255,.055)';
  ctx.lineWidth=1;
  ctx.setLineDash([5,8]);
  ctx.strokeRect(p.x-p.w/2+11,p.y-p.h/2+11,p.w-22,p.h-22);
  ctx.setLineDash([]);

  ctx.globalAlpha=near?.92:.50;
  txt(emoji[k],p.x,p.y+7,22,'#fff');
  ctx.globalAlpha=1;

  if(near){
   ctx.globalAlpha=.10+.09*pulse;
   ctx.fillStyle='#ffd36c';
   ctx.shadowBlur=16;
   ctx.shadowColor='#ffd36c';
   ctx.beginPath();
   ctx.ellipse(p.x,p.y,31,17,0,0,Math.PI*2);
   ctx.fill();
   ctx.shadowBlur=0;
   ctx.globalAlpha=1;
  }
  ctx.restore();
 }
}

function drawStations(t){
 const active=getNearestStation();

 for(const [k,p] of Object.entries(station)){
  const near=k===active;
  const s=station[k];
  const bob=near?Math.sin(t*.0032+p.x*.015)*.7:0;
  const glow=.5+.5*Math.sin(t*.004+p.x*.008);

  shadow(p.x,p.y+48,58,11,.30);
  ctx.save();

  // Main stainless machine housing.
  ctx.fillStyle='#0f1512';
  rr(p.x-58,p.y-45+bob,116,90,16);
  ctx.strokeStyle='rgba(255,255,255,.10)';
  ctx.lineWidth=2;
  ctx.stroke();

  const body=ctx.createLinearGradient(p.x-48,p.y-36,p.x+48,p.y+35);
  body.addColorStop(0,'#eef4f1');
  body.addColorStop(.16,s.color);
  body.addColorStop(.58,'#6b5540');
  body.addColorStop(1,'#211b17');
  ctx.fillStyle=body;
  rr(p.x-47,p.y-35+bob,94,70,11);

  // Metal top.
  const top=ctx.createLinearGradient(0,p.y-27+bob,0,p.y-10+bob);
  top.addColorStop(0,'#ffffff');
  top.addColorStop(.45,'#d7dfdb');
  top.addColorStop(1,'#87918d');
  ctx.fillStyle=top;
  rr(p.x-34,p.y-24+bob,68,16,6);

  // Digital panel.
  ctx.fillStyle='#111715';
  rr(p.x-35,p.y+0+bob,70,25,6);
  ctx.strokeStyle='rgba(255,255,255,.10)';
  ctx.strokeRect(p.x-34,p.y+1+bob,68,23);

  // Station-specific visual details.
  if(k==='bun'){
    ctx.fillStyle='#d48f46';rr(p.x-26,p.y+6+bob,52,13,5);
    ctx.fillStyle='#f5c77d';rr(p.x-20,p.y+2+bob,40,10,5);
    for(let i=-2;i<=2;i++)ctx.fillRect(p.x+i*10-1,p.y+4+bob,2,4);
    txt('🍞',p.x,p.y+20+bob,21,'#fff');
  }else if(k==='grill'){
    ctx.fillStyle='#202622';
    rr(p.x-29,p.y+5+bob,58,15,5);
    ctx.strokeStyle='#707b75';
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(p.x+i*11,p.y+7+bob);ctx.lineTo(p.x+i*11,p.y+18+bob);ctx.stroke();}
    for(let i=0;i<3;i++){
      const fx=p.x-16+i*16,fy=p.y+1+Math.sin(t*.01+i)*1.2;
      ctx.globalAlpha=.58+.18*glow;txt('🔥',fx,fy,11+Math.sin(t*.014+i)*1.3,'#fff');
    }
    ctx.globalAlpha=1;
  }else if(k==='cheese'){
    ctx.fillStyle='#f0c948';rr(p.x-25,p.y+4+bob,50,17,4);
    ctx.fillStyle='#fff1a4';
    rr(p.x-19,p.y+8+bob,38,5,2);
    ctx.fillStyle='#d8aa29';
    for(let i=-2;i<=2;i++)ctx.fillRect(p.x+i*10-2,p.y+18+bob,4,3);
  }else if(k==='assembly'){
    ctx.fillStyle='#d9b56b';rr(p.x-27,p.y+6+bob,54,13,7);
    ctx.fillStyle='#d99b4b';rr(p.x-20,p.y+2+bob,40,7,5);
    ctx.fillStyle='#6f4a2d';rr(p.x-16,p.y-4+bob,32,8,4);
    ctx.fillStyle='#f0c96a';rr(p.x-18,p.y-10+bob,36,7,4);
    txt('🍔',p.x+26,p.y+17+bob,16,'#fff');
  }else if(k==='cash'){
    // Register sits inside the counter opening.
    ctx.fillStyle='#1b241f';
    rr(p.x-47,p.y-23+bob,94,55,11);
    ctx.fillStyle='#293a31';
    rr(p.x-36,p.y-14+bob,72,24,6);
    ctx.fillStyle='#6ff0a6';
    rr(p.x-29,p.y-9+bob,58,14,4);
    txt('€',p.x,p.y+3+bob,16,'#173d27');
    ctx.fillStyle='#bba17b';
    for(let i=0;i<4;i++)ctx.fillRect(p.x-28+i*16,p.y+16+bob,10,5);
    ctx.fillStyle='#68dc9a';
    ctx.beginPath();ctx.arc(p.x+29,p.y+20+bob,4,0,Math.PI*2);ctx.fill();
  }

  ctx.globalAlpha=near?.80:.54;
  txt(s.label,p.x,p.y+57+bob,9,near?'#ffe08b':'#e5ebe7');
  ctx.globalAlpha=1;

  // Subtle active halo only when standing on the field.
  if(near){
    ctx.globalAlpha=.20+.16*glow;
    ctx.strokeStyle='#ffd86c';
    ctx.lineWidth=2;
    ctx.shadowBlur=11;
    ctx.shadowColor='#ffd86c';
    ctx.beginPath();
    ctx.arc(p.x,p.y,57+glow*3,0,Math.PI*2);
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.globalAlpha=1;
  }

  // Preparation status.
  if(prep.started&&order){
    const step=order.steps[order.stepIndex];
    if(step===k){
      const now=performance.now()/1000;
      const rem=Math.max(0,prep.readyAt-now);
      const pct=Math.min(1,1-rem/prep.duration);
      ctx.fillStyle='rgba(11,16,13,.68)';
      rr(p.x-43,p.y-59,86,9,5);
      ctx.fillStyle=rem<=0?'#7ff0a4':'#ffbd45';
      ctx.fillRect(p.x-40,p.y-56,80*pct,4);
      if(now>=prep.overAt)txt('ÜBERGART!',p.x,p.y-70,9,'#ff7777');
      else if(rem<=0)txt('READY',p.x,p.y-70,9,'#8ff0aa');
    }
  }

  ctx.restore();
 }
}
function drawQueue(t){
 for(let i=0;i<Math.min(5,2+hero.upgrades.seats);i++){
  const x=330+i*90,y=700+(i%2)*34;shadow(x,y+24,18,6,.3);
  ctx.fillStyle=i%2?'#5eafe0':'#df8e67';ctx.beginPath();ctx.arc(x,y,17,0,7);ctx.fill();
  ctx.fillStyle='#f0c7a2';ctx.beginPath();ctx.arc(x,y-15,11,0,7);ctx.fill();txt(i<2?'☺':'…',x,y+5,10,'#201c18')
 }
}
function drawCharacter(p,color,label,t){
 const bob=Math.sin(t*.007+p.x*.01)*2;shadow(p.x,p.y+24,24,9,.45);ctx.save();ctx.translate(p.x,p.y+bob);
 ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,24,0,7);ctx.fill();ctx.strokeStyle='#fff8';ctx.stroke();
 ctx.fillStyle='#f1c5a0';ctx.beginPath();ctx.arc(0,-5,14,0,7);ctx.fill();ctx.fillStyle='#2a211b';
 ctx.beginPath();ctx.arc(0,-14,15,Math.PI,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-5,-6,3,0,7);ctx.arc(5,-6,3,0,7);ctx.fill();
 ctx.fillStyle='#222';ctx.beginPath();ctx.arc(-5,-6,1.2,0,7);ctx.arc(5,-6,1.2,0,7);ctx.fill();
 ctx.fillStyle='#fff';rr(-14,8,28,18,6);ctx.fillStyle='#ffbc43';ctx.fillRect(-12,10,24,4);ctx.restore();txt(label,p.x,p.y-41,11,'#fff')
}
function drawWorld(t){
 ctx.clearRect(0,0,W,H);
 if(mode!=='game'){ctx.fillStyle='#080a09';ctx.fillRect(0,0,W,H);return}
 const shake=effects.shake,eX=(Math.random()-.5)*shake,eY=(Math.random()-.5)*shake;
 ctx.save();ctx.translate(W/2-hero.x+eX,H/2-hero.y+eY);drawKitchen(t);
 for(const p of others.values())drawCharacter(p,'#63c8ff',p.name||'CO-OP',t);
 drawCharacter(hero,'#f5b33f','YOU',t);ctx.restore();
 const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.15,W/2,H/2,Math.max(W,H)*.72);
 g.addColorStop(0,'transparent');g.addColorStop(1,'#0009');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);effects.shake*=.88;
 for(const p of particles){p.x+=p.vx*.016;p.y+=p.vy*.016;p.life-=.016;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(W/2+(p.x-hero.x),H/2+(p.y-hero.y),p.r,0,7);ctx.fill()}
 ctx.globalAlpha=1;
 for(const f of floats){f.y-=.35;f.life-=.018;ctx.globalAlpha=Math.max(0,f.life);txt(f.t,W/2+(f.x-hero.x),H/2+(f.y-hero.y),12,f.col)}
 floats=floats.filter(f=>f.life>0);particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;
}
function loop(t){
 const dt=Math.min(.04,(t-last)/1000);last=t;
 if(mode==='game'&&!cash.open&&!document.querySelector('.modal:not(.hidden)')){
  move(dt);
  performStaff(dt);
  if(ws&&t-(loop.net||0)>120){loop.net=t;sendInput()}
  ui();
 }
 drawWorld(t);requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function applyBusiness(d){
 if(!d)return;
 if(Number.isFinite(d.money))hero.money=d.money;
 if(Number.isFinite(d.debt))hero.debt=d.debt;
 if(Number.isFinite(d.day))hero.day=d.day;
 if(typeof d.shopName==='string'&&d.shopName.trim())shopName=d.shopName;
 if(Number.isFinite(d.dayStartedAt))dayStartedAt=d.dayStartedAt;
 ui();
}