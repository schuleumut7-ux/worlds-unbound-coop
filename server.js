import http from 'http';
import {readFile} from 'fs/promises';
import {extname,join,normalize} from 'path';
import {fileURLToPath} from 'url';
import {WebSocketServer} from 'ws';
import {randomBytes} from 'crypto';

const PORT=Number(process.env.PORT||3000);
const HOST=process.env.HOST||'0.0.0.0';
const ROOT=fileURLToPath(new URL('.',import.meta.url));
const rooms=new Map();
const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const WORLD_W=1500,WORLD_H=900,SPAWN_X=650,SPAWN_Y=610;

const MIME={
 '.html':'text/html; charset=utf-8',
 '.css':'text/css; charset=utf-8',
 '.js':'text/javascript; charset=utf-8',
 '.json':'application/json; charset=utf-8',
 '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'
};

function makeCode(){
 let s='';
 do{s=Array.from({length:5},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}while(rooms.has(s));
 return s;
}
function cleanName(v){return String(v||'Hero').replace(/[<>]/g,'').slice(0,16)||'Hero'}
function send(ws,type,data={}){if(ws.readyState===1)ws.send(JSON.stringify({type,...data}))}
function broadcast(room,type,data={},except=null){for(const p of room.players.values())if(p.ws!==except)send(p.ws,type,data)}
function snapPlayer(p){return{id:p.id,name:p.name,x:p.x,y:p.y,money:p.money,debt:p.debt,day:p.day,level:p.level}}
function state(room){return{
 code:room.code,host:room.host,
 business:{money:room.business.money,debt:room.business.debt,day:room.business.day},
 players:[...room.players.values()].map(snapPlayer)
}}
function makeRoom(){
 return{
  code:makeCode(),host:null,players:new Map(),
  business:{money:500,debt:1000000,day:1}
 };
}

const server=http.createServer(async(req,res)=>{
 try{
  const raw=(req.url||'/').split('?')[0];
  const requested=raw==='/'?'/index.html':raw;
  const safe=normalize(requested).replace(/^([.][.][/\\])+/, '');
  const file=join(ROOT,safe.replace(/^[/\\]+/,''));
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':MIME[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}
});

const wss=new WebSocketServer({server});
wss.on('connection',ws=>{
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw)}catch{return}
  if(!m||typeof m.type!=='string')return;

  if(m.type==='create'){
   const room=makeRoom();
   const id=randomBytes(4).toString('hex');
   const p={id,ws,name:cleanName(m.name),x:SPAWN_X,y:SPAWN_Y,money:room.business.money,debt:room.business.debt,day:room.business.day};
   room.host=id;room.players.set(id,p);rooms.set(room.code,room);ws.room=room;ws.pid=id;
   send(ws,'roomCreated',{code:room.code,id});send(ws,'state',state(room));return;
  }

  if(m.type==='join'){
   const room=rooms.get(String(m.code||'').trim().toUpperCase());
   if(!room||room.players.size>=2)return send(ws,'error',{message:'Room nicht gefunden oder voll.'});
   const id=randomBytes(4).toString('hex');
   const p={id,ws,name:cleanName(m.name),x:SPAWN_X+65,y:SPAWN_Y,money:room.business.money,debt:room.business.debt,day:room.business.day};
   room.players.set(id,p);ws.room=room;ws.pid=id;
   send(ws,'joined',{code:room.code,id});broadcast(room,'state',state(room));send(ws,'state',state(room));return;
  }

  const room=ws.room;
  const p=room?.players.get(ws.pid);
  if(!room||!p)return;

  if(m.type==='input'){
   const x=Number(m.x),y=Number(m.y);
   if(Number.isFinite(x))p.x=Math.max(80,Math.min(WORLD_W-80,x));
   if(Number.isFinite(y))p.y=Math.max(80,Math.min(WORLD_H-80,y));
   p.money=room.business.money;p.debt=room.business.debt;p.day=room.business.day;
   broadcast(room,'state',state(room));
   return;
  }

  if(m.type==='business'){
   const a=m.action;
   if(a==='sale'){
    const amount=Math.max(0,Math.min(40,Number(m.amount)||0));
    const profit=Math.max(0,Math.min(amount,Number(m.profit)||0));
    if(amount<=0)return;
    room.business.money=Math.min(99999999,room.business.money+profit);
    room.business.debt=Math.max(0,room.business.debt-Math.round(profit*.2*100)/100);
    for(const q of room.players.values()){q.money=room.business.money;q.debt=room.business.debt;q.day=room.business.day}
    broadcast(room,'sale',{amount,profit});broadcast(room,'state',state(room));return;
   }
   if(a==='spend'){
    const amount=Math.max(0,Math.min(room.business.money,Number(m.amount)||0));
    room.business.money=Math.max(0,room.business.money-amount);
    for(const q of room.players.values())q.money=room.business.money;
    broadcast(room,'state',state(room));return;
   }
   if(a==='day'){
    room.business.day=Math.max(1,Math.min(999,room.business.day+1));
    for(const q of room.players.values())q.day=room.business.day;
    broadcast(room,'state',state(room));return;
   }
  }
 });
 ws.on('close',()=>{
  const room=ws.room;if(!room)return;
  room.players.delete(ws.pid);
  if(room.players.size===0)rooms.delete(room.code);
  else{
   if(room.host===ws.pid)room.host=room.players.keys().next().value;
   broadcast(room,'state',state(room));
  }
 });
});
server.listen(PORT,HOST,()=>console.log('Burger Mafia V3.0 CO-OP on '+HOST+':'+PORT));
