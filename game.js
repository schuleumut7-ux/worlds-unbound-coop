const $=id=>document.getElementById(id),c=$('game'),ctx=c.getContext('2d');

const touchDevice=('ontouchstart' in window)||navigator.maxTouchPoints>0;
let savedMobile=null;
try{savedMobile=localStorage.getItem('bm-mobile')}catch{}
let W,H,DPR,mode='menu',ws=null,room='',me='',mobile=touchDevice?true:(savedMobile==='1');
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
 bun:{x:470,y:310,label:'BUN',color:'#d19a63',emoji:'🍞'},
 grill:{x:660,y:210,label:'GRILL',color:'#e26b3e',emoji:'🔥'},
 cheese:{x:660,y:430,label:'CHEESE',color:'#efcf66',emoji:'🧀'},
 assembly:{x:875,y:315,label:'ASSEMBLY',color:'#debc69',emoji:'🍔'},
 fryer:{x:1065,y:205,label:'FRYER',color:'#e5a52f',emoji:'🍟'},
 cash:{x:1065,y:450,label:'KASSE',color:'#5bc78b',emoji:'💵'}
};
const supplyInfo={
 bun:{label:'Brötchen',unit:'🍞',price:18},
 patty:{label:'Pattys',unit:'🥩',price:32},
 cheese:{label:'Käse',unit:'🧀',price:20},
 fries:{label:'Pommes',unit:'🍟',price:16},
 packaging:{label:'Verpackungen',unit:'📦',price:12},
 drinks:{label:'Getränke',unit:'🥤',price:14}
};
let hero={
 x:650,y:610,speed:210,money:500,debt:1000000,level:1,xp:0,day:1,rep:0,rating:4.2,
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

function ui(){
 setText('money',Math.floor(hero.money).toLocaleString('de-DE'));
 setText('debt',Math.max(0,Math.floor(hero.debt)).toLocaleString('de-DE'));
 setText('level',hero.level);
 setText('room',room||'—');
 setText('playerCount',(1+others.size)+'/2');
 setText('shiftLabel','SCHICHT '+hero.day);
 setText('orderName',order?order.name:'Keine Bestellung');
 setText('recipeLine',order?order.icons:'Warte auf Kunden…');
 setText('orderTimer',order?Math.max(0,Math.ceil(order.timer))+'s':'—');
 setText('orderHint',order?stepHint():'Neue Gäste kommen gleich.');
 const done=order?Math.min(1,order.stepIndex/order.steps.length):0;
 const bar=$('orderProgress');if(bar)bar.style.width=(done*100)+'%';
 document.body.classList.toggle('mobileOn',mobile);
 document.body.classList.toggle('mobileOff',!mobile);
 const dot=$('connectionDot');
 if(dot){dot.className=connection==='connected'?'online':connection==='connecting'?'connecting':'offline'}
 if($('mobileToggle'))$('mobileToggle').checked=mobile;
 updateMobileStart();
}
function stepHint(){
 if(!order)return '';
 const s=order.steps[order.stepIndex];
 if(!s&&order.stepIndex>=order.steps.length)return 'Burger fertig — zur Kasse gehen.';
 return s==='cash'?'Geld annehmen und korrekt Rückgeld geben.':'Station: '+station[s].label+' — E drücken';
}
function makeOrder(){
 const base=recipes[Math.floor(Math.random()*recipes.length)];
 order={...base,steps:[...base.steps],need:{...base.need},stepIndex:0,timer:42+Math.max(0,hero.day-1)*1.5};
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

$('inventoryBtn').onclick=()=>{$('inventoryPanel').classList.remove('hidden');renderInventory()};
$('inventoryClose').onclick=()=>$('inventoryPanel').classList.add('hidden');
$('shopBtn').onclick=()=>{$('shopPanel').classList.remove('hidden');renderShop()};
$('shopClose').onclick=()=>$('shopPanel').classList.add('hidden');
$('staffBtn').onclick=()=>{$('staffPanel').classList.remove('hidden');renderStaff()};
$('staffClose').onclick=()=>$('staffPanel').classList.add('hidden');
$('shiftBtn').onclick=openShift;
$('shiftCancel').onclick=()=>$('shiftPanel').classList.add('hidden');
$('shiftConfirm').onclick=finishShift;

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
 let near=null,d=Infinity;
 for(const [k,p] of Object.entries(station)){
  const dd=Math.hypot(hero.x-p.x,hero.y-p.y);
  if(dd<78&&dd<d){near=k;d=dd}
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
$('mCash').onclick=()=>{if(order&&order.stepIndex>=order.steps.length)openCash();else tryInteract()};
$('mRecipe').onclick=makeOrder;
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
function openShift(){
 const gross=hero.shiftRevenue,expenses=hero.shiftExpenses,profit=Math.max(0,gross-expenses);
 const rent=120+hero.upgrades.shop*35,debtPay=Math.min(hero.debt,Math.floor(Math.max(0,profit-rent)*.2));
 $('shiftSummary').innerHTML='<div class="summaryRow"><span>Umsatz</span><b>€'+fmt(gross)+'</b></div>'+
 '<div class="summaryRow"><span>Ausgaben</span><b>-€'+fmt(expenses)+'</b></div>'+
 '<div class="summaryRow"><span>Miete</span><b>-€'+fmt(rent)+'</b></div>'+
 '<div class="summaryRow"><span>Schuldentilgung</span><b>-€'+fmt(debtPay)+'</b></div>'+
 '<div class="summaryTotal"><span>Gewinn</span><b>€'+fmt(Math.max(0,profit-rent-debtPay))+'</b></div>';
 $('shiftPanel').classList.remove('hidden');
}
function finishShift(){
 const gross=hero.shiftRevenue,expenses=hero.shiftExpenses,rent=120+hero.upgrades.shop*35;
 const profit=Math.max(0,gross-expenses-rent),pay=Math.min(hero.debt,Math.floor(Math.max(0,profit)*.2));
 hero.money=Math.max(0,hero.money-rent-pay);hero.debt=Math.max(0,hero.debt-pay);hero.day++;
 send('business',{action:'day'});
 hero.revenueToday=0;hero.expensesToday=0;hero.shiftRevenue=0;hero.shiftExpenses=0;
 hero.cleanliness=Math.max(65,hero.cleanliness-8+hero.staff.cleaner*4);
 if(hero.staff.cleaner===0)hero.cleanliness-=5;
 hero.rating=Math.max(1,Math.min(5,hero.rating+(hero.cleanliness>75?.08:-.12)));
 $('shiftPanel').classList.add('hidden');toast('🌙 SCHICHT '+hero.day+' STARTET');makeOrder();ui();
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
 if(x||y){hero.x+=x/l*hero.speed*dt;hero.y+=y/l*hero.speed*dt}
 hero.x=Math.max(170,Math.min(1310,hero.x));hero.y=Math.max(120,Math.min(770,hero.y));
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
 const pulse=.5+.5*Math.sin(t*.004),bob=Math.sin(t*.008)*1.4;
 ctx.fillStyle='#111614';ctx.fillRect(0,0,1500,900);
 for(let y=0;y<900;y+=70)for(let x=0;x<1500;x+=70){ctx.fillStyle=((x+y)/70)%2?'#26312c':'#29362f';ctx.fillRect(x,y,68,68)}
 ctx.fillStyle='#0a0e0c';rr(235,55,1040,790,38);ctx.fillStyle='#282f2b';rr(258,78,994,744,31);
 ctx.fillStyle='#5b4230';rr(278,98,954,704,25);
 ctx.fillStyle='#684a33';for(let y=115;y<790;y+=32)ctx.fillRect(292,y,926,3);for(let x=292;x<1218;x+=38)ctx.fillRect(x,115,3,790);
 ctx.fillStyle='#111614';rr(410,102,680,48,12);ctx.fillStyle='#ffb52f';ctx.shadowBlur=22;ctx.shadowColor='#ff9e28';ctx.fillRect(640,116,220,5);ctx.shadowBlur=0;
 txt('BURGER SIMULATOR',750,137,20,'#ffd477');
 for(let i=0;i<7;i++){const sx=460+i*98;ctx.fillStyle=i%2?'#ffbe49':'#f9e1a5';ctx.globalAlpha=.25+.15*pulse;ctx.beginPath();ctx.arc(sx,91,4,0,7);ctx.fill();ctx.globalAlpha=1}
 drawFridge();drawCounter();drawStations(t);drawQueue(t);
}
function drawFridge(){
 ctx.fillStyle='#dae3df';rr(325,210,70,390,10);ctx.fillStyle='#b4c4bf';rr(334,222,52,115,7);rr(334,350,52,238,7);
 for(let i=0;i<3;i++){ctx.fillStyle='#7e948d';ctx.fillRect(342,250+i*24,36,6)}txt('LAGER',360,620,10,'#cdd7d2')
}
function drawCounter(){
 ctx.fillStyle='#1a211d';rr(1180,185,170,480,20);ctx.fillStyle='#70472e';rr(1195,200,140,440,14);
 ctx.fillStyle='#18211c';rr(1205,235,120,120,10);ctx.fillStyle='#76e0a3';rr(1218,250,94,75,8);
 txt('€',1265,302,34,'#153c27');txt('KASSE',1265,380,12,'#fff');
 ctx.fillStyle='#33261d';rr(1212,425,106,65,9);
 for(let i=0;i<5;i++){ctx.fillStyle='#b89057';ctx.fillRect(1222+i*18,440,13,40)}
}
function drawStations(t){
 const near=getNearestStation();
 for(const [k,p] of Object.entries(station)){
  const s=station[k];shadow(p.x,p.y+45,58,14,.32);ctx.fillStyle='#1e2622';rr(p.x-52,p.y-39,104,78,14);
  ctx.fillStyle=s.color;rr(p.x-43,p.y-31,86,62,10);ctx.fillStyle='#fff9';rr(p.x-30,p.y-21,60,10,5);
  ctx.fillStyle='#0b110e';ctx.fillRect(p.x-31,p.y+6,62,19);txt(s.emoji,p.x,p.y+18,23);txt(s.label,p.x,p.y+58,10,'#f7f7ef');
  if(k===near){ctx.strokeStyle='#ffe07a';ctx.lineWidth=3;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(p.x,p.y,58+Math.sin(t*.008)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;txt('E',p.x,p.y-51,11,'#ffe07a')}
 }
 if(prep.started&&order){
  const s=order.steps[order.stepIndex],p=station[s];if(p){
   const now=performance.now()/1000,rem=Math.max(0,prep.readyAt-now),pct=Math.min(1,1-rem/prep.duration);
   ctx.fillStyle='#0b100d';rr(p.x-43,p.y-56,86,8,5);ctx.fillStyle=rem<=0?'#7ff0a4':'#ffbd45';ctx.fillRect(p.x-40,p.y-53,80*pct,3);
   if(now>=prep.overAt)txt('ÜBERGART!',p.x,p.y-67,10,'#ff7777');else if(rem<=0)txt('READY',p.x,p.y-67,10,'#8ff0aa')
  }
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
  if(order){
   order.timer-=dt;
   if(order.timer<=0){hero.missed++;hero.money=Math.max(0,hero.money-10);hero.rating=Math.max(1,hero.rating-.08);toast('😡 Kunde geht — Bestellung verpasst');makeOrder()}
  }
  performStaff(dt);
  if(ws&&t-(loop.net||0)>120){loop.net=t;sendInput()}
  ui();
 }
 drawWorld(t);requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function applyBusiness(d){
 if(Number.isFinite(d.money))hero.money=d.money;if(Number.isFinite(d.debt))hero.debt=d.debt;if(Number.isFinite(d.day))hero.day=d.day;ui();
}