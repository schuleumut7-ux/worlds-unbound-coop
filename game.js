const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio,2);function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',resize);resize();
const keys=new Set();addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key===' '||e.key.toLowerCase()==='o')attack();if(e.key.toLowerCase()==='e')interact();if(e.key.toLowerCase()==='p')carryAction();if(e.key.toLowerCase()==='m')medicAction()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
let mode='menu',mobileEnabled=localStorage.getItem('wu-mobile-controls')==='1',ws=null,room='',me='local',world=1,last=performance.now(),cam={x:600,y:600},shake=0,flash=0,hero={x:600,y:600,hp:100,maxHp:100,stamina:100,coins:50,level:1,xp:0,damage:14,defense:0,speed:210,downed:false,downedTimer:0,carrying:null,carriedBy:null,carrySpeedPenalty:false,medicTarget:null,medicUntil:0,medicStartDistance:0,wood:0,crystal:0,stone:0,iron:0,gems:0,potions:0,medkits:1},others=new Map(),bossHp=0,bossMax=1000,particles=[],mobs=[],resources=[],trees=[],worldSize={w:2800,h:1800},lastNet=0,attackCd=0,abilityCd=0,invOpen=false;
const worldData=[
{name:'THE GREEN WILDS',bg:'#173d29',water:'#286d71',accent:'#4e9b56',boss:'ANCIENT BEAST',story:'The forest is alive. An ancient artifact calls from beyond the river. Find it before the corruption reaches the village.'},
{name:'THE CRYSTAL CAVES',bg:'#251d42',water:'#3d6d93',accent:'#8d6cff',boss:'CRYSTAL GUARDIAN',story:'The crystals remember a world that existed before yours. Something is waking below the tunnels.'},
{name:'THE BURNING LANDS',bg:'#4b1d10',water:'#9a321d',accent:'#ff6a35',boss:'INFERNO KING',story:'The portals are burning. The guardian of fire believes the heroes caused the corruption.'},
{name:'THE LOST KINGDOM',bg:'#393129',water:'#59636a',accent:'#d5a34b',boss:'FALLEN KING',story:'A dead kingdom still has a living secret. Ancient writings reveal the portals were built by your ancestors.'},
{name:'THE FROZEN FRONTIER',bg:'#294a60',water:'#8fdcff',accent:'#dff8ff',boss:'FROST TITAN',story:'A storm hides an entire expedition. Their final message warns that the worlds are not separate.'},
{name:'THE SKY ISLANDS',bg:'#668e9e',water:'#e8f5ff',accent:'#ffd75a',boss:'SKY GUARDIAN',story:'The sky islands drift around a broken portal. The missing piece points toward a realm without stars.'},
{name:'THE SHADOW REALM',bg:'#25163d',water:'#563c8c',accent:'#bd62ff',boss:'SHADOW LORD',story:'The corruption speaks with familiar voices. One of the guardians has been hiding the truth.'},
{name:'THE END OF WORLDS',bg:'#20202b',water:'#6b5b87',accent:'#ff476d',boss:'THE WORLD EATER',story:'Pieces of every world float in the void. The artifact finally reveals why the portals were opened.'}
];
const resourceTypes=[['wood','🪵','#5a351f'],['stone','🪨','#89939b'],['crystal','💎','#7ee7ff'],['iron','⛓','#b5bbc4'],['gems','◆','#ff65d4']];
const zoneNames=['Whispering Forest','Silver River','Old Ruins','Ancient Grove','Bandit Camp','Hidden Hollow'];
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>$('toast').classList.remove('show'),1700)}
function story(t){$('storyText').textContent=t;$('story').classList.remove('hidden')}
$('storyClose').onclick=()=>$('story').classList.add('hidden');
function applyMobileControls(){document.body.classList.toggle('mobileEnabled',mobileEnabled);$('mobileToggle').checked=mobileEnabled}function toggleSettings(){ $('settingsPanel').classList.toggle('hidden'); if(!$('settingsPanel').classList.contains('hidden')) applyMobileControls()}function start(){mode='game';applyMobileControls();$('menu').classList.add('hidden');$('join').classList.add('hidden');$('hud').classList.remove('hidden');generateWorld();updateUI();if(hero.x<100||hero.y<100){hero.x=600;hero.y=600;cam.x=hero.x;cam.y=hero.y;} if(world===1)story(worldData[0].story);toast('V1.14 — '+worldData[world-1].name)}
function connect(kind,code){const proto=location.protocol==='https:'?'wss':'ws';ws=new WebSocket(proto+'://'+location.host);ws.onopen=()=>ws.send(JSON.stringify(kind==='create'?{type:'create',name:$('name').value}:{type:'join',name:$('name').value,code}));ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.type==='roomCreated'||m.type==='joined'){room=m.code;me=m.id;start();toast('ROOM '+room+' CONNECTED')}if(m.type==='error')toast(m.message);if(m.type==='state'){room=m.code||room;if(m.world&&m.world!==world){world=m.world;generateWorld();story(worldData[world-1].story)}bossHp=Number(m.bossHp??bossHp);others.clear();for(const p of m.players){if(p.id===me)Object.assign(hero,p);else others.set(p.id,p)}updateUI()}if(m.type==='worldEvent'){
  if(m.event==='carried'){const t=others.get(m.targetId);if(t){t.carriedBy=m.carrierId;t.x=m.x;t.y=m.y}}
  if(m.event==='released'){const t=others.get(m.targetId);if(t)t.carriedBy=null}
  if(m.event==='revived'){const t=others.get(m.targetId);if(t){t.downed=false;t.hp=t.maxHp}}
if(m.event==='bossHit'){bossHp=m.bossHp;toast('Boss HP: '+bossHp)}if(m.event==='damage'&&m.target===me)damagePlayer(m.amount,false)}};ws.onclose=()=>toast('Connection closed')}
$('create').onclick=()=>connect('create');$('joinOpen').onclick=()=>{$('menu').classList.add('hidden');$('join').classList.remove('hidden')};$('back').onclick=()=>{$('join').classList.add('hidden');$('menu').classList.remove('hidden')};$('join').onclick=()=>connect('join',$('code').value.trim().toUpperCase());$('load').onclick=()=>{try{const s=JSON.parse(localStorage.getItem('wu-save')||'null');if(s)Object.assign(hero,s)}catch{}start()};
function save(){localStorage.setItem('wu-save',JSON.stringify({...hero,world}));toast('GAME SAVED')}
function send(type,data={}){if(ws?.readyState===1)ws.send(JSON.stringify({type,...data}))}
function burst(x,y,n=12,color=worldData[world-1].accent){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,life:.8+Math.random()*.6,r:2+Math.random()*4,color})}
function gainXP(n){hero.xp+=n;const need=100+hero.level*70;if(hero.xp>=need){hero.xp-=need;hero.level++;hero.maxHp+=12;hero.hp=hero.maxHp;hero.damage+=2;toast('LEVEL UP! Lv '+hero.level);burst(hero.x,hero.y,35)}}
function damagePlayer(amount,fromEnemy=true){if(hero.downed)return;const actual=Math.max(1,Math.round(amount*(1-hero.defense/100)));hero.hp=Math.max(0,hero.hp-actual);shake=8;flash=.08;burst(hero.x,hero.y,8,'#ff6670');if(hero.hp<=0){hero.downed=true;hero.downedTimer=20;hero.carrying=null;hero.medicTarget=null;toast('DOWNED — teammate can revive you');}updateUI()}
function attack(){if(mode!=='game'||hero.downed||attackCd>0)return;attackCd=.42;burst(hero.x,hero.y,10);shake=5;flash=.04;let hit=false;for(const m of mobs){const d=Math.hypot(m.x-hero.x,m.y-hero.y);if(d<82){const dmg=hero.damage+Math.floor(Math.random()*5);m.hp-=dmg;m.hit=.12;hit=true;burst(m.x,m.y,8,'#fff');if(m.hp<=0){hero.coins+=5+Math.floor(Math.random()*8);gainXP(24);if(Math.random()<.35)hero.wood++;}}}if(bossHp>0&&Math.hypot(hero.x-worldSize.w/2,hero.y-worldSize.h/2)<150){send('event',{event:'bossHit',damage:Math.max(5,hero.damage)});hit=true}toast(hit?'HIT!':'SWING')}
function ability(){if(mode!=='game'||hero.downed||abilityCd>0||hero.stamina<25)return;abilityCd=3;hero.stamina-=25;burst(hero.x,hero.y,38);shake=13;for(const m of mobs)if(Math.hypot(m.x-hero.x,m.y-hero.y)<150){m.hp-=hero.damage*1.6;m.hit=.15}toast('ARCANE BURST!');send('event',{event:'ability',data:{x:hero.x,y:hero.y}})}
function nearestDowned(){
  let best=null,bd=9999;
  for(const p of others.values()){if(p.downed){const d=Math.hypot(p.x-hero.x,p.y-hero.y);if(d<bd&&d<85){bd=d;best=p}}}
  return best;
}
function carryAction(){
  if(hero.downed)return;
  if(hero.carrying){
    send('carry',{targetId:hero.carrying,action:'release'}); hero.carrying=null; hero.carrySpeedPenalty=false; toast('Spieler abgesetzt'); return;
  }
  const t=nearestDowned(); if(!t)return toast('Kein KO-Spieler in Reichweite');
  send('carry',{targetId:t.id,action:'pickup'}); hero.carrying=t.id; hero.carrySpeedPenalty=true; toast('P · Spieler aufgehoben');
}
function medicAction(){
  if(hero.downed)return;
  const t=nearestDowned(); if(!t)return toast('Kein KO-Spieler in Reichweite');
  if(hero.medicTarget){hero.medicTarget=null;$('medicProgress').classList.add('hidden');toast('Medic abgebrochen');return}
  hero.medicTarget=t.id;hero.medicUntil=performance.now()+3000;hero.medicStartDistance=Math.hypot(t.x-hero.x,t.y-hero.y);$('medicProgress').classList.remove('hidden');$('medicProgress').querySelector('i').style.width='0%';toast('MEDIC — 3 Sekunden');
}
function updateDownedPanel(){
  const t=nearestDowned();
  const show=!!t||hero.downed||!!hero.carrying;
  $('downedPanel').classList.toggle('hidden',!show);
  if(hero.downed){$('downedTimer').textContent=Math.max(0,Math.ceil(hero.downedTimer));$('carryBtn').textContent='KO — warte auf deinen Partner';$('medicBtn').textContent='M — MEDIC'}
  else if(hero.carrying){$('downedTimer').textContent='';$('carryBtn').textContent='P · LOSLASSEN';$('medicBtn').textContent='M · MEDIC'}
  else if(t){$('downedTimer').textContent=Math.max(0,Math.ceil(t.downedTimer||20));$('carryBtn').textContent='P · AUFHEBEN';$('medicBtn').textContent='M · MEDIC'}
  if(hero.medicTarget){const left=Math.max(0,hero.medicUntil-performance.now()),pct=100-left/3000*100;$('medicProgress').classList.remove('hidden');$('medicProgress').querySelector('i').style.width=pct+'%';if(left<=0){send('medic',{targetId:hero.medicTarget});hero.medicTarget=null;$('medicProgress').classList.add('hidden');toast('Medic gesendet')}}else $('medicProgress').classList.add('hidden');
}
function interact(){if(hero.downed)return;const near=resources.find(r=>Math.hypot(r.x-hero.x,r.y-hero.y)<55);if(near){hero[near.type]++;near.taken=true;gainXP(8);toast('Collected '+near.type);burst(near.x,near.y,15,near.color);return}if(Math.hypot(hero.x-worldSize.w/2,hero.y-worldSize.h/2)<170&&bossHp<=0){world=Math.min(8,world+1);send('world',{world});return}if(world===1&&hero.x>2100&&hero.y<450){$('shopPanel').classList.remove('hidden');return}toast('Nothing nearby')}
$('attack').onclick=attack;$('ability').onclick=ability;$('interact').onclick=interact;$('carryBtn').onclick=carryAction;$('medicBtn').onclick=medicAction;$('settingsBtn').onclick=toggleSettings;$('settingsClose').onclick=()=>$('settingsPanel').classList.add('hidden');$('mobileToggle').onchange=e=>{mobileEnabled=e.target.checked;localStorage.setItem('wu-mobile-controls',mobileEnabled?'1':'0');applyMobileControls();toast(mobileEnabled?'Mobile Steuerung AN':'Mobile Steuerung AUS')};$('mobileAttackBtn').onclick=attack;$('mobileAbilityBtn').onclick=ability;$('inventory').onclick=()=>{invOpen=!invOpen;$('inventoryPanel').classList.toggle('hidden',!invOpen);renderInventory()};
$('invClose').onclick=()=>{invOpen=false;$('inventoryPanel').classList.add('hidden')};$('shopClose').onclick=()=>$('shopPanel').classList.add('hidden');
$('buyPotion').onclick=()=>buy(20,'potions');$('buyMed').onclick=()=>buy(35,'medkits');$('buyDamage').onclick=()=>{if(hero.coins>=80){hero.coins-=80;hero.damage+=5;toast('DAMAGE +5');save()}else toast('Not enough Coins')};
function buy(cost,item){if(hero.coins<cost)return toast('Not enough Coins');hero.coins-=cost;hero[item]++;toast('Purchased!');save()}
function renderInventory(){const vals=[['🪵 Wood',hero.wood],['🪨 Stone',hero.stone],['💎 Crystal',hero.crystal],['⛓ Iron',hero.iron],['◆ Gems',hero.gems],['🧪 Potions',hero.potions],['🩹 Med Kits',hero.medkits],['⚔ Damage',hero.damage]];$('invItems').innerHTML=vals.map(v=>'<div class="invItem"><span>'+v[0]+'</span><b>'+v[1]+'</b></div>').join('')}
function updateUI(){$('hp').textContent=Math.ceil(hero.hp);$('maxhp').textContent=hero.maxHp;$('stamina').textContent=Math.round(hero.stamina);$('level').textContent=hero.level;$('coins').textContent=hero.coins;$('wood').textContent=hero.wood;$('crystal').textContent=hero.crystal;$('roomLabel').textContent=room?'ROOM '+room:'LOCAL';$('quest').textContent=world===1?'Find the Ancient Artifact':worldData[world-1].boss+' awaits';if(bossHp>0){$('boss').classList.remove('hidden');$('bossName').textContent=worldData[world-1].boss;$('bossBar').style.width=Math.max(0,bossHp/bossMax*100)+'%'}else $('boss').classList.add('hidden')}
function generateWorld(){
  worldSize={w:4200,h:2800};
  const spawn={x:600,y:600},safeRadius=700;
  hero.x=spawn.x;hero.y=spawn.y;cam.x=spawn.x;cam.y=spawn.y;
  trees=[];mobs=[];resources=[];
  for(let i=0;i<220;i++)trees.push({x:50+Math.random()*(worldSize.w-100),y:50+Math.random()*(worldSize.h-100),r:16+Math.random()*18});
  for(let i=0;i<65;i++){
    let x,y;
    do{x=120+Math.random()*(worldSize.w-240);y=120+Math.random()*(worldSize.h-240)}while(Math.hypot(x-spawn.x,y-spawn.y)<safeRadius);
    mobs.push({x,y,hp:world===1?75+Math.random()*45:120+world*18,max:0,a:Math.random()*6.28,speed:20+world*3,hit:0});
  }
  mobs.forEach(m=>m.max=m.hp);
  for(let i=0;i<110;i++){
    const type=resourceTypes[Math.floor(Math.random()*resourceTypes.length)][0],info=resourceTypes.find(x=>x[0]===type);
    let x,y;do{x=80+Math.random()*(worldSize.w-160);y=80+Math.random()*(worldSize.h-160)}while(Math.hypot(x-spawn.x,y-spawn.y)<250);
    resources.push({x,y,type,color:info[2],taken:false});
  }
  bossHp=world===1?1000:0;updateUI();
}
let joy={on:false,x:0,y:0,pointerId:null,cx:0,cy:0},mobileKeys=new Set();
const joyEl=$('mobileJoy'),joyKnob=$('joyKnob');
function joyResetVisual(){joyKnob.style.transform='translate(-50%,-50%)'}
function resetJoy(){joy.on=false;joy.pointerId=null;joy.x=0;joy.y=0;joy.cx=0;joy.cy=0;joyResetVisual()}
function joyCenter(){const r=joyEl.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,max:Math.max(28,r.width*.36)}}
function moveJoy(e){
  if(!joy.on||e.pointerId!==joy.pointerId)return;
  e.preventDefault();
  let dx=e.clientX-joy.cx,dy=e.clientY-joy.cy;
  const len=Math.hypot(dx,dy),max=joy.max;
  if(len>max){dx=dx/len*max;dy=dy/len*max}
  const mag=Math.hypot(dx,dy);
  const dead=Math.min(10,max*.13);
  if(mag<=dead){joy.x=0;joy.y=0;dx=0;dy=0}
  else{
    const scaled=(mag-dead)/(max-dead);
    joy.x=dx/Math.max(mag,1)*scaled;
    joy.y=dy/Math.max(mag,1)*scaled;
  }
  joyKnob.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
}
function beginJoy(e){
  if(!mobileEnabled||joy.on)return;
  e.preventDefault();
  const c=joyCenter();
  joy.on=true;joy.pointerId=e.pointerId;joy.cx=c.x;joy.cy=c.y;joy.max=c.max;
  try{joyEl.setPointerCapture(e.pointerId)}catch{}
  moveJoy(e);
}
joyEl.addEventListener('pointerdown',beginJoy,{passive:false});
joyEl.addEventListener('pointermove',moveJoy,{passive:false});
joyEl.addEventListener('pointerup',e=>{if(e.pointerId===joy.pointerId)resetJoy()});
joyEl.addEventListener('pointercancel',e=>{if(e.pointerId===joy.pointerId)resetJoy()});
joyEl.addEventListener('lostpointercapture',resetJoy);
joyEl.addEventListener('pointerleave',e=>{if(joy.on&&e.pointerId===joy.pointerId)moveJoy(e)});
window.addEventListener('blur',resetJoy);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetJoy()});
joyResetVisual();
function bindDpad(){document.querySelectorAll('#mobileDpad button').forEach(btn=>{const key=btn.dataset.key;const down=e=>{e.preventDefault();mobileKeys.add(key);btn.classList.add('pressed')};const up=e=>{e.preventDefault();mobileKeys.delete(key);btn.classList.remove('pressed')};btn.addEventListener('pointerdown',down,{passive:false});btn.addEventListener('pointerup',up,{passive:false});btn.addEventListener('pointercancel',up,{passive:false});btn.addEventListener('pointerleave',up,{passive:false})})}bindDpad();
function update(dt){if(mode!=='game')return;attackCd=Math.max(0,attackCd-dt);abilityCd=Math.max(0,abilityCd-dt);if(hero.downed){
  hero.downedTimer-=dt;
  let dx=(keys.has('d')||keys.has('arrowright')||mobileKeys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')||mobileKeys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')||mobileKeys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')||mobileKeys.has('arrowup')?1:0);
  if(mobileEnabled&&joy.on){dx=joy.x;dy=joy.y}
  const l=Math.hypot(dx,dy)||1;
  if(dx||dy){hero.x=Math.max(40,Math.min(worldSize.w-40,hero.x+dx/l*hero.speed*.22*dt));hero.y=Math.max(40,Math.min(worldSize.h-40,hero.y+dy/l*hero.speed*.22*dt));}
  if(hero.downedTimer<=0){hero.downed=false;hero.hp=Math.ceil(hero.maxHp*.5);hero.x=600;hero.y=600;cam.x=hero.x;cam.y=hero.y;toast('Checkpoint erreicht')} cam.x+=(hero.x-cam.x)*Math.min(1,dt*7);cam.y+=(hero.y-cam.y)*Math.min(1,dt*7);
  if(ws&&performance.now()-lastNet>100){lastNet=performance.now();send('input',{x:hero.x,y:hero.y,hp:hero.hp,downed:true,coins:hero.coins,level:hero.level,carrying:null})}
  updateDownedPanel();updateUI();return}
let dx=(keys.has('d')||keys.has('arrowright')||mobileKeys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')||mobileKeys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')||mobileKeys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')||mobileKeys.has('arrowup')?1:0);if(mobileEnabled&&joy.on){dx=joy.x;dy=joy.y}const l=Math.hypot(dx,dy)||1;if(dx||dy){const moveSpeed=hero.speed*(hero.carrying?0.9:1);hero.x=Math.max(40,Math.min(worldSize.w-40,hero.x+dx/l*moveSpeed*dt));hero.y=Math.max(40,Math.min(worldSize.h-40,hero.y+dy/l*moveSpeed*dt));hero.stamina=Math.max(0,hero.stamina-dt*4)}else hero.stamina=Math.min(100,hero.stamina+dt*10);
mobs=mobs.filter(m=>m.hp>0);for(const m of mobs){m.a+=dt;if(m.hit>0)m.hit-=dt;const d=Math.hypot(hero.x-m.x,hero.y-m.y);if(d<300){m.x+=(hero.x-m.x)/Math.max(d,1)*m.speed*dt;m.y+=(hero.y-m.y)/Math.max(d,1)*m.speed*dt}if(d<30&&Math.random()<dt*.7)damagePlayer(5+world*2)}
resources=resources.filter(r=>!r.taken);if(world===1&&bossHp<=0&&Math.hypot(hero.x-worldSize.w/2,hero.y-worldSize.h/2)<160)toast('The portal is open — press E');
for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.life-=dt}particles=particles.filter(p=>p.life>0);cam.x+=(hero.x-cam.x)*Math.min(1,dt*5);cam.y+=(hero.y-cam.y)*Math.min(1,dt*5);
if(ws&&performance.now()-lastNet>100){lastNet=performance.now();send('input',{x:hero.x,y:hero.y,hp:hero.hp,downed:hero.downed,coins:hero.coins,level:hero.level,carrying:hero.carrying})}if(Math.random()<dt*.025)save();updateDownedPanel();updateUI()}
function draw(){ctx.clearRect(0,0,W,H);if(mode!=='game'){ctx.fillStyle='#07110f';ctx.fillRect(0,0,W,H);requestAnimationFrame(draw);return}ctx.save();const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;ctx.translate(W/2-cam.x+sx,H/2-cam.y+sy);drawWorld();for(const r of resources)drawResource(r);for(const m of mobs)drawMob(m);for(const p of others.values())drawPlayer(p,true);drawPlayer(hero,false);if(bossHp>0)drawBoss();for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}ctx.globalAlpha=1;ctx.restore();if(flash>0){ctx.fillStyle='rgba(255,255,255,'+flash+')';ctx.fillRect(0,0,W,H);flash-=.02}shake*=.88}
function drawWorld(){const d=worldData[world-1];ctx.fillStyle=d.bg;ctx.fillRect(0,0,worldSize.w,worldSize.h);ctx.fillStyle=d.water;ctx.fillRect(1290,0,220,worldSize.h);ctx.fillStyle=d.accent+'44';ctx.fillRect(0,730,worldSize.w,150);ctx.strokeStyle='#ffffff09';for(let x=0;x<worldSize.w;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,worldSize.h);ctx.stroke()}for(let y=0;y<worldSize.h;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(worldSize.w,y);ctx.stroke()}for(const t of trees){ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(t.x+5,t.y+14,t.r,t.r*.55,0,0,7);ctx.fill();ctx.fillStyle=world===5?'#d7f5ff':world===7?'#7436ad':world===3?'#b9441f':d.accent;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,7);ctx.fill();ctx.fillStyle='#4a2d1c';ctx.fillRect(t.x-4,t.y+8,8,25)}ctx.fillStyle='#fff';ctx.font='bold 18px system-ui';ctx.fillText(d.name,35,35);ctx.font='12px system-ui';ctx.fillStyle='#ffffff99';ctx.fillText(zoneNames[Math.floor((hero.x/worldSize.w)*zoneNames.length)],35,55);if(world===1){ctx.fillStyle='#d9f26b';ctx.beginPath();ctx.arc(worldSize.w/2,worldSize.h/2,90,0,7);ctx.fill();ctx.fillStyle='#17200f';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText(bossHp>0?'ANCIENT SHRINE':'PORTAL',worldSize.w/2,worldSize.h/2+5);ctx.textAlign='left'}}
function drawResource(r){ctx.fillStyle=r.color;ctx.beginPath();ctx.arc(r.x,r.y,10,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='11px system-ui';ctx.fillText(r.type[0].toUpperCase(),r.x-3,r.y+4)}
function drawPlayer(p,team){ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(p.x,p.y+19,18,7,0,0,7);ctx.fill();ctx.fillStyle=team?'#62d7ff':'#d9f26b';ctx.beginPath();ctx.arc(p.x,p.y,17,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x-5,p.y-4,3,0,7);ctx.fill();ctx.fillStyle='#07110f';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(p.name||'Hero',p.x,p.y-27);ctx.textAlign='left';if(p.carriedBy){ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,24,0,7);ctx.stroke()}if(p.downed){ctx.fillStyle='#ff6872';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('DOWNED',p.x,p.y-40);ctx.textAlign='left'}}
function drawMob(m){ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(m.x,m.y+12,17,6,0,0,7);ctx.fill();ctx.fillStyle=m.hit>0?'#fff':world===7?'#b75cff':world===3?'#ff6b36':'#d45d6a';ctx.beginPath();ctx.arc(m.x,m.y,15+world*.5,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(m.x-6,m.y-3,4,4);ctx.fillRect(m.x+2,m.y-3,4,4);ctx.fillStyle='#260b10';ctx.fillRect(m.x-20,m.y-26,40,4);ctx.fillStyle='#ff5967';ctx.fillRect(m.x-20,m.y-26,40*Math.max(0,m.hp/m.max),4)}
function drawBoss(){const x=worldSize.w/2,y=worldSize.h/2-140;ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(x,y+55,65,20,0,0,7);ctx.fill();ctx.fillStyle=worldData[world-1].accent;ctx.beginPath();ctx.arc(x,y,58,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-18,y-8,7,0,7);ctx.arc(x+18,y-8,7,0,7);ctx.fill()}
function loop(t){const dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);