import http from 'http';import {readFile} from 'fs/promises';import {extname,join,normalize} from 'path';import {fileURLToPath} from 'url';import {WebSocketServer} from 'ws';import {randomBytes} from 'crypto';
const PORT=Number(process.env.PORT||3000),HOST=process.env.HOST||'0.0.0.0',ROOT=fileURLToPath(new URL('.',import.meta.url)),rooms=new Map(),chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
function makeCode(){let s;do{s=Array.from({length:5},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}while(rooms.has(s));return s}
function send(ws,type,data={}){if(ws.readyState===1)ws.send(JSON.stringify({type,...data}))}
function broadcast(room,type,data={},except=null){for(const p of room.players.values())if(p.ws!==except)send(p.ws,type,data)}
function snapshot(room){return [...room.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,downed:p.downed,downedTimer:p.downedTimer||0,carrying:p.carrying,carriedBy:p.carriedBy,coins:p.coins,level:p.level,world:p.world}))}
function state(room){return{code:room.code,host:room.host,world:room.world,players:snapshot(room),bossHp:room.bossHp,quests:room.quests}}
const server=http.createServer(async(req,res)=>{try{const raw=(req.url||'/').split('?')[0],requested=raw==='/'?'/index.html':raw,safe=normalize(requested).replace(/^([.][.][/\\])+/,''),file=join(ROOT,safe.replace(/^[/\\]+/,'')),data=await readFile(file);res.writeHead(200,{'Content-Type':MIME[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}if(!m||typeof m.type!=='string')return;
if(m.type==='create'){const room={code:makeCode(),host:null,world:1,players:new Map(),quests:{artifact:false,forestBoss:false},bossHp:1000};const id=randomBytes(4).toString('hex');const p={id,ws,name:String(m.name||'Hero').slice(0,16),x:1400,y:900,hp:100,maxHp:100,downed:false,downedTimer:0,coins:50,level:1,world:1,carrying:null,carriedBy:null};room.host=id;room.players.set(id,p);rooms.set(room.code,room);ws.room=room;ws.pid=id;send(ws,'roomCreated',{code:room.code,id});send(ws,'state',state(room));return}
if(m.type==='join'){const room=rooms.get(String(m.code||'').toUpperCase());if(!room||room.players.size>=2)return send(ws,'error',{message:'Room not found or full.'});const id=randomBytes(4).toString('hex');const p={id,ws,name:String(m.name||'Hero').slice(0,16),x:1480,y:900,hp:100,maxHp:100,downed:false,downedTimer:0,coins:50,level:1,world:room.world,carrying:null,carriedBy:null};room.players.set(id,p);ws.room=room;ws.pid=id;send(ws,'joined',{code:room.code,id});broadcast(room,'state',state(room));send(ws,'state',state(room));return}
const room=ws.room,p=room?.players.get(ws.pid);if(!room||!p)return;
if(m.type==='input'){p.x=Math.max(40,Math.min(2760,Number(m.x)||p.x));p.y=Math.max(40,Math.min(1760,Number(m.y)||p.y));p.downed=!!m.downed;p.downedTimer=p.downed?Math.max(0,Number(p.downedTimer)||20):0;if(m.carrying!==undefined)p.carrying=m.carrying;p.hp=Math.max(0,Math.min(p.maxHp,Number(m.hp)||p.hp));p.coins=Math.max(0,Math.min(999999,Number(m.coins)||p.coins));p.level=Math.max(1,Math.min(99,Number(m.level)||p.level));
if(p.carrying){const target=room.players.get(p.carrying);if(target&&target.downed){target.x=p.x+12;target.y=p.y+12;target.carriedBy=p.id}else p.carrying=null}
if(p.downed)p.downedTimer=Math.max(0,p.downedTimer-.1);
if(p.downed&&p.downedTimer<=0){p.downed=false;p.hp=Math.ceil(p.maxHp*.5);p.x=1400;p.y=900;p.carriedBy=null}
broadcast(room,'state',state(room))}
if(m.type==='carry'){
  const target=room.players.get(String(m.targetId||''));
  if(!target||!target.downed)return;
  if(m.action==='pickup'&&Math.hypot(target.x-p.x,target.y-p.y)<100){p.carrying=target.id;target.carriedBy=p.id;target.x=p.x+12;target.y=p.y+12;broadcast(room,'worldEvent',{event:'carried',targetId:target.id,carrierId:p.id,x:target.x,y:target.y});}
  if(m.action==='release'&&p.carrying===target.id){p.carrying=null;target.carriedBy=null;broadcast(room,'worldEvent',{event:'released',targetId:target.id});}
}
if(m.type==='medic'){
  const target=room.players.get(String(m.targetId||''));
  if(!target||!target.downed)return;
  if(Math.hypot(target.x-p.x,target.y-p.y)<110){target.downed=false;target.downedTimer=0;target.hp=Math.ceil(target.maxHp*.8);target.carriedBy=null;p.carrying=null;broadcast(room,'worldEvent',{event:'revived',targetId:target.id,carrierId:p.id});broadcast(room,'state',state(room));}
}
if(m.type==='event'){if(m.event==='bossHit'){room.bossHp=Math.max(0,room.bossHp-(Number(m.damage)||5));if(room.bossHp===0)room.quests.forestBoss=true;broadcast(room,'worldEvent',{event:'bossHit',bossHp:room.bossHp})}else broadcast(room,'worldEvent',{event:m.event,by:p.id,data:m.data||{}})}
if(m.type==='world'&&p.id===room.host){const w=Math.max(1,Math.min(8,Number(m.world)||1));room.world=w;room.bossHp=w===1?1000:0;for(const q of room.players.values())q.world=w;broadcast(room,'state',state(room))}
});ws.on('close',()=>{const room=ws.room;if(!room)return;room.players.delete(ws.pid);if(room.players.size===0)rooms.delete(room.code);else{if(room.host===ws.pid)room.host=room.players.keys().next().value;broadcast(room,'state',state(room))}})});
server.listen(PORT,HOST,()=>console.log('Worlds Unbound V1.1 BETA on '+HOST+':'+PORT));