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
 {name:'Fries Combo',price:12,steps:['bun','grill','assembly','fryer','cash'],icons:'🍞 → 🥩 → 🍔 → 🍟 → 💵',need:{bun:1,patty:1,fries:1}},
 {name:'Mega Combo',price:17,steps:['bun','grill','cheese','assembly','fryer','cash'],icons:'🍞 → 🥩 → 🧀 → 🍔 → 🍟 → 💵',need:{bun:1,patty:1,cheese:1,fries:1}}
];
const station={
 bun:{x:465,y:325,label:'BUN',color:'#d19a63',emoji:'🍞'},
 grill:{x:615,y:325,label:'GRILL',color:'#e26b3e',emoji:'🔥'},
 cheese:{x:765,y:325,label:'CHEESE',color:'#efcf66',emoji:'🧀'},
 assembly:{x:915,y:325,label:'ASSEMBLY',color:'#debc69',emoji:'🍔'},
 fryer:{x:1085,y:325,label:'FRYER',color:'#e5a52f',emoji:'🍟'},
 cash:{x:1085,y:625,label:'KASSE',color:'#5bc78b',emoji:'💵'}
};
const interactionPad={
 bun:{x:465,y:412,w:118,h:60},
 grill:{x:615,y:412,w:118,h:60},
 cheese:{x:765,y:412,w:118,h:60},
 assembly:{x:915,y:412,w:118,h:60},
 fryer:{x:1085,y:412,w:118,h:60},
 cash:{x:1085,y:704,w:150,h:68}
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
 {x:1240,y:470,w:115,h:300} // rechter Kassen-Counter
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
 fries:{label:'Pommes',unit:'🍟',price:16},
 packaging:{label:'Verpackungen',unit:'📦',price:12},
 drinks:{label:'Getränke',unit:'🥤',price:14}
};
let hero={
 x:765,y:565,speed:210,money:500,debt:1000000,level:1,xp:0,day:1,rep:0,rating:4.2,
 bun:12,patty:12,cheese:8,fries:8,packaging:10,drinks:8,
 sales:0,revenueToday:0,expensesToday:0,shiftRevenue:0,shiftExpenses:0,completed:0,missed:0,
 cleanliness:100,staff:{kitchen:0,cashier:0,cleaner:0},
 upgrades:{grill:1,fryer:1,shop:1,seats:1,quality:1,register:1}
};
let order=null,prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3},cash={due:0,given:0,change:0,open:false};
let effects={shake:0,flash:0,steam:[]};

function purgeLegacySaves(){
 try{
  ['bm-last-save','bm-code-1','bm-code-2','bm-code-3',
   'bm-slot-1','bm-slot-2','bm-slot-3'].forEach(k=>localStorage.removeItem(k));
 }catch{}
}
purgeLegacySaves();

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
 const labels={bun:'Brötchen',grill:'Patty grillen',cheese:'Käse',assembly:'Burger bauen',fryer:'Pommes',cash:'Kasse'};
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
 mode='game';$('menu').classList.add('hidden');$('join').classList.add('hidden');$('hud').classList.remove('hidden');
 resetJoy();resize();if(!order)makeOrder();ui();
 if(showStory)setTimeout(()=>{$('storyPanel')?.classList.remove('hidden')},140);
}
function connect(type,code=''){
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
  ws.send(JSON.stringify({type:type,name:($('name')?.value||'Hero').slice(0,16),code:String(code||'').trim().toUpperCase()}));
 };
 ws.onmessage=e=>{
  let m;try{m=JSON.parse(e.data)}catch{return}
  if(m.type==='roomCreated'||m.type==='joined'){
   room=m.code;me=m.id;connectBusy=false;connection='connected';
   if(mode!=='game')startGame(false);
   toast(m.type==='roomCreated'?'🍔 ROOM '+room+' ERSTELLT':'🤝 CO-OP VERBUNDEN');
   ui();
  }
  if(m.type==='state'){
   room=m.code||room;
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
  if(m.type==='error'){connectBusy=false;connection='offline';clearTimeout(connectTimer);ui();toast('❌ '+m.message)}
 };
 ws.onerror=()=>{connection='offline';connectBusy=false;ui()};
 ws.onclose=()=>{clearTimeout(connectTimer);connectBusy=false;connection='offline';ui();if(mode==='game')toast('⚠️ Server getrennt — du kannst lokal weiterspielen')};
}
function send(type,data={}){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type,...data}))}

$('create').onclick=()=>{
 if(connectBusy)return;
 startGame(true);toast('🌐 ROOM WIRD ERSTELLT…');connect('create');
};
$('joinOpen').onclick=()=>{
 if(connectBusy)return;
 $('menu').classList.add('hidden');$('join').classList.remove('hidden');
 setTimeout(()=>$('code')?.focus(),80);
};
$('joinRoomBtn').onclick=()=>{
 const code=($('code')?.value||'').trim().toUpperCase();
 if(code.length!==5)return toast('⚠️ Bitte den 5-stelligen Raumcode eingeben.');
 connect('join',code);
};
$('back').onclick=()=>{$('join').classList.add('hidden');$('menu').classList.remove('hidden');connection='offline';ui()};
$('code').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)});

$('how').onclick=()=>{
 $('storyPanel')?.classList.remove('hidden');
 $('menu').style.visibility='hidden';
};
$('storyClose').onclick=()=>{
 $('storyPanel')?.classList.add('hidden');
 if(mode==='menu')$('menu').style.visibility='visible';
};
$('settings').onclick=()=>$('settingsPanel').classList.remove('hidden');
$('settingsClose').onclick=()=>$('settingsPanel').classList.add('hidden');

$('mobileToggle').onchange=e=>{
 mobile=!!e.target.checked;saveMobilePreference(mobile);ui();
 toast(mobile?'📱 MOBILE STEUERUNG AN':'📱 MOBILE STEUERUNG AUS');
};
$('mobileStartToggle').onclick=()=>{
 mobile=!mobile;saveMobilePreference(mobile);ui();
 toast(mobile?'📱 MOBILE STEUERUNG AN':'📱 MOBILE STEUERUNG AUS');
};
$('saveShopName').onclick=()=>{
 const v=String($('shopNameInput')?.value||'').replace(/\s+/g,' ').trim().slice(0,24);
 if(!v)return toast('⚠️ Bitte einen Ladenname eingeben.');
 shopName=v;
 send('business',{action:'setShopName',shopName:v});
 ui();
 toast('✅ Ladenname geändert: '+v);
};

$('inventoryBtn').onclick=()=>{$('inventoryPanel').classList.remove('hidden');renderInventory()};
$('inventoryClose').onclick=()=>$('inventoryPanel').classList.add('hidden');
$('shopBtn').onclick=()=>{$('shopPanel').classList.remove('hidden');renderShop()};
$('shopClose').onclick=()=>$('shopPanel').classList.add('hidden');
$('staffBtn').onclick=()=>{$('staffPanel').classList.remove('hidden');renderStaff()};
$('staffClose').onclick=()=>$('staffPanel').classList.add('hidden');


function renderInventory(){
 const vals=[
  ['🍞 Brötchen','bun'],['🥩 Pattys','patty'],['🧀 Käse','cheese'],['🍟 Pommes','fries'],
  ['📦 Verpackung','packaging'],['🥤 Getränke','drinks'],['🧼 Sauberkeit','cleanliness'],['⭐ Bewertung','rating']
 ];
 $('inventoryList').innerHTML=vals.map(([l,k])=>'<div class="invItem"><span>'+l+'</span><b>'+
  (k==='cleanliness'?Math.round(hero[k])+'%':k==='rating'?hero[k].toFixed(1)+'/5':hero[k])+'</b></div>').join('');
}
const shopItems={
 bun:{label:'Brötchen-Kiste',desc:'+10 Brötchen',cost:180,kind:'supply',key:'bun',amount:10},
 patty:{label:'Patty-Kiste',desc:'+10 Pattys',cost:320,kind:'supply',key:'patty',amount:10},
 cheese:{label:'Käse-Kiste',desc:'+10 Käse',cost:200,kind:'supply',key:'cheese',amount:10},
 fries:{label:'Pommes-Kiste',desc:'+10 Pommes',cost:160,kind:'supply',key:'fries',amount:10},
 packaging:{label:'Verpackungs-Kiste',desc:'+15 Verpackungen',cost:180,kind:'supply',key:'packaging',amount:15},
 drinks:{label:'Getränke-Kiste',desc:'+10 Getränke',cost:140,kind:'supply',key:'drinks',amount:10},
 grill:{label:'Besserer Grill',desc:'+Garqualität und Tempo',cost:550,kind:'upgrade',key:'grill'},
 fryer:{label:'Bessere Fritteuse',desc:'+Pommes-Tempo',cost:500,kind:'upgrade',key:'fryer'},
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
 else if(step==='fryer'&&hero.fries>0){hero.fries--;prepDone('🍟 Pommes knusprig frittiert')}
 else if(step==='cash'){openCash()}
 else if(step){toast('📦 Diese Zutat fehlt — im Shop nachbestellen')}
}
function prepDone(msg){
 order.stepIndex++;prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 addFloat(msg,hero.x,hero.y-45);burst(hero.x,hero.y,9);hero.xp+=10;levelCheck();ui();
}
function getNearestStation(){
 let near=null;
 for(const [k,pad] of Object.entries(interactionPad)){
  if(insidePad(pad,hero.x,hero.y,7)){near=k;break}
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
 if(near==='grill'||near==='fryer'){
  const now=performance.now()/1000;
  if(!prep.started){
   prep.started=true;prep.step=order.stepIndex;
   prep.duration=Math.max(.9,2.35/(1+hero.upgrades[near]*.12));
   prep.readyAt=now+prep.duration;prep.overAt=prep.readyAt+1.55;
   toast(near==='grill'?'🔥 GRILL LÄUFT…':'🍟 FRITTEUSE LÄUFT…');
  }else if(now>=prep.overAt){
   const ingredient=near==='grill'?'patty':'fries';
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
  const step=order.steps[order.stepIndex];if(step&&['bun','grill','cheese','fryer'].includes(step))prepDone('👨‍🍳 KÜCHENHILFE HILFT!');
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
 txt('BURGER SIMULATOR',750,137,20,'#ffd477');
 for(let i=0;i<7;i++){
  const sx=460+i*98;
  ctx.globalAlpha=.25+.18*lampPulse;
  ctx.fillStyle=i%2?'#ffbe49':'#f9e1a5';
  ctx.beginPath();ctx.arc(sx,91,4+lampPulse*1.4,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 ctx.save();
 for(const [lx,ly] of [[615,255],[765,255],[915,255],[1085,255]]){
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
 shadow(1300,778,68,15,.35);
 ctx.fillStyle='#151b18';rr(1236,455,123,326,18);
 ctx.fillStyle='#714a31';rr(1247,468,101,300,14);
 ctx.fillStyle='#2b2119';rr(1259,500,77,126,10);
 ctx.strokeStyle='#a77a52';ctx.lineWidth=2;ctx.strokeRect(1264,506,67,113);
 ctx.fillStyle='#8f6b48';
 for(let i=0;i<4;i++)ctx.fillRect(1267+i*15,526,10,82);
 const cg=.5+.5*Math.sin(performance.now()*.004);
 ctx.fillStyle='#162019';rr(1258,646,80,72,10);
 ctx.fillStyle='#58d993';ctx.globalAlpha=.72+.2*cg;rr(1266,655,64,42,8);ctx.globalAlpha=1;
 txt('€',1298,684,24,'#173d27');txt('KASSE',1298,742,11,'#fff');
}
function drawInteractionPads(t){
 const emoji={bun:'🍞',grill:'🥩',cheese:'🧀',assembly:'🍔',fryer:'🍟',cash:'💶'};
 for(const [k,p] of Object.entries(interactionPad)){
  const near=getNearestStation()===k;
  const pulse=.5+.5*Math.sin(t*.006+(p.x%80)*.02);
  ctx.save();
  shadow(p.x,p.y+25,p.w*.42,7,.22);

  ctx.fillStyle='rgba(210,219,214,'+(near?.24:.11)+')';
  rr(p.x-p.w/2,p.y-p.h/2,p.w,p.h,12);

  ctx.strokeStyle=near?'rgba(255,211,105,.75)':'rgba(225,232,227,.24)';
  ctx.lineWidth=near?2.6:1.3;ctx.stroke();

  ctx.fillStyle='rgba(255,255,255,'+(near?.07:.035)+')';
  rr(p.x-p.w/2+5,p.y-p.h/2+5,p.w-10,p.h-10,9);

  ctx.strokeStyle=near?'rgba(255,226,145,.42)':'rgba(255,255,255,.10)';
  ctx.lineWidth=1;ctx.setLineDash([6,8]);
  ctx.strokeRect(p.x-p.w/2+11,p.y-p.h/2+11,p.w-22,p.h-22);ctx.setLineDash([]);

  ctx.globalAlpha=near?.98:.62;
  txt(emoji[k],p.x,p.y+7,23,'#ffffff');
  ctx.globalAlpha=1;

  if(near){
   ctx.globalAlpha=.18+.16*pulse;ctx.fillStyle='#ffd36c';
   ctx.shadowBlur=18;ctx.shadowColor='#ffd36c';
   ctx.beginPath();ctx.ellipse(p.x,p.y,34,20,0,0,Math.PI*2);ctx.fill();
   ctx.shadowBlur=0;ctx.globalAlpha=1;
  }
  ctx.restore();
 }
}

function drawStations(t){
 const near=getNearestStation();
 for(const [k,p] of Object.entries(station)){
  const s=station[k];
  const bob=Math.sin(t*.0032+p.x*.015)*1.15;
  const glow=.5+.5*Math.sin(t*.004+p.x*.008);

  shadow(p.x,p.y+47,61,14,.4);
  ctx.save();

  ctx.fillStyle='#121814';rr(p.x-58,p.y-45,116,90,15);
  ctx.strokeStyle='#ffffff12';ctx.lineWidth=2;ctx.stroke();

  const shell=ctx.createLinearGradient(p.x-46,p.y-35,p.x+46,p.y+34);
  shell.addColorStop(0,s.color);shell.addColorStop(.48,'#76553a');shell.addColorStop(1,'#221d18');
  ctx.fillStyle=shell;rr(p.x-46,p.y-34+bob,92,67,11);

  const top=ctx.createLinearGradient(0,p.y-26,0,p.y-6);
  top.addColorStop(0,'#f6f1e6');top.addColorStop(.45,'#cdd4ce');top.addColorStop(1,'#8e9690');
  ctx.fillStyle=top;rr(p.x-32,p.y-23+bob,64,17,7);

  ctx.fillStyle='#101512';rr(p.x-32,p.y+1+bob,64,23,5);
  ctx.strokeStyle='#ffffff18';ctx.strokeRect(p.x-31,p.y+2+bob,62,21);
  txt(s.emoji,p.x,p.y+20+bob,24,'#fff');

  ctx.globalAlpha=.55+.45*glow;
  ctx.fillStyle=near?'#ffd36a':'#6ed9a7';ctx.shadowBlur=near?17:9;ctx.shadowColor=near?'#ffd36a':'#6ed9a7';
  ctx.beginPath();ctx.arc(p.x+37,p.y-25+bob,3.2,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.globalAlpha=1;

  txt(s.label,p.x,p.y+58+bob,9,near?'#ffe08b':'#efebe2');

  if(near){
   ctx.globalAlpha=.4+.3*glow;ctx.strokeStyle='#ffd86c';ctx.lineWidth=2.5;ctx.setLineDash([4,5]);
   ctx.beginPath();ctx.arc(p.x,p.y,59+glow*4,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  }

  if(k==='grill'){
   for(let i=0;i<3;i++){
    const fx=p.x-18+i*18,fy=p.y+5+Math.sin(t*.01+i)*1.5;
    ctx.globalAlpha=.48+.2*glow;txt('🔥',fx,fy,12+Math.sin(t*.014+i)*1.5,'#fff');
   }
  }
  if(k==='fryer'){
   const wob=Math.sin(t*.009)*2.5;ctx.globalAlpha=.7;
   txt('✨',p.x-18,p.y-1+wob,10,'#ffe9a4');txt('✨',p.x+20,p.y+5-wob,9,'#ffe9a4');ctx.globalAlpha=1;
  }
  if(k==='cheese'){
   const cg=.5+.5*Math.sin(t*.006);ctx.globalAlpha=.22+.22*cg;ctx.fillStyle='#ffd760';
   ctx.shadowBlur=20;ctx.shadowColor='#ffd760';ctx.beginPath();ctx.arc(p.x,p.y+14,17+cg*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;
  }
  if(k==='bun'){
   const b=.5+.5*Math.sin(t*.005);ctx.globalAlpha=.25+.2*b;ctx.fillStyle='#f4c67b';ctx.beginPath();ctx.arc(p.x,p.y+18,18+b*2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  if(k==='assembly'){
   const a=.5+.5*Math.sin(t*.004);ctx.globalAlpha=.25+.2*a;ctx.strokeStyle='#ffe49a';ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(p.x,p.y+18,20+a*2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  }

  if(prep.started&&order){
   const step=order.steps[order.stepIndex];
   if(step===k){
    const now=performance.now()/1000,rem=Math.max(0,prep.readyAt-now),pct=Math.min(1,1-rem/prep.duration);
    ctx.fillStyle='#0b100d';rr(p.x-43,p.y-58,86,9,5);
    ctx.fillStyle=rem<=0?'#7ff0a4':'#ffbd45';ctx.fillRect(p.x-40,p.y-55,80*pct,4);
    if(now>=prep.overAt)txt('ÜBERGART!',p.x,p.y-69,9,'#ff7777');
    else if(rem<=0)txt('READY',p.x,p.y-69,9,'#8ff0aa');
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