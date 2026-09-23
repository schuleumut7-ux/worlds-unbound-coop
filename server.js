import http from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { randomBytes } from 'crypto';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = fileURLToPath(new URL('.', import.meta.url));
const rooms = new Map();
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function makeCode() {
  let s;
  do {
    s = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(s));
  return s;
}

function send(ws, type, data = {}) {
  if (ws.readyState === 1) ws.send(JSON.stringify({ type, ...data }));
}

function broadcast(room, type, data = {}, except = null) {
  for (const p of room.players.values()) {
    if (p.ws !== except) send(p.ws, type, data);
  }
}

function snapshot(room) {
  return [...room.players.values()].map(p => ({
    id: p.id, name: p.name, x: p.x, y: p.y, hp: p.hp,
    maxHp: p.maxHp, downed: p.downed, coins: p.coins,
    level: p.level, world: p.world
  }));
}

function roomState(room) {
  return {
    code: room.code,
    host: room.host,
    world: room.world,
    players: snapshot(room),
    quests: room.quests,
    bossHp: room.bossHp
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const rawPath = (req.url || '/').split('?')[0];
    const requested = rawPath === '/' ? '/index.html' : rawPath;
    const safePath = normalize(requested).replace(/^([.][.][/\\])+/, '');
    const filePath = join(ROOT, safePath.replace(/^[/\\]+/, ''));
    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.on('message', raw => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.type !== 'string') return;

    if (m.type === 'create') {
      const room = {
        code: makeCode(), host: null, world: 1,
        players: new Map(), quests: { forestBoss: false }, bossHp: 1000
      };
      const id = randomBytes(4).toString('hex');
      const p = {
        id, ws, name: String(m.name || 'Hero').slice(0, 16),
        x: 800, y: 600, hp: 100, maxHp: 100,
        downed: false, coins: 50, level: 1, world: 1
      };
      room.host = id;
      room.players.set(id, p);
      rooms.set(room.code, room);
      ws.room = room;
      ws.pid = id;
      send(ws, 'roomCreated', { code: room.code, id });
      send(ws, 'state', roomState(room));
      return;
    }

    if (m.type === 'join') {
      const room = rooms.get(String(m.code || '').toUpperCase());
      if (!room || room.players.size >= 2) {
        return send(ws, 'error', { message: 'Room not found or full.' });
      }
      const id = randomBytes(4).toString('hex');
      const p = {
        id, ws, name: String(m.name || 'Hero').slice(0, 16),
        x: 880, y: 600, hp: 100, maxHp: 100,
        downed: false, coins: 50, level: 1, world: room.world
      };
      room.players.set(id, p);
      ws.room = room;
      ws.pid = id;
      send(ws, 'joined', { code: room.code, id });
      broadcast(room, 'state', roomState(room));
      send(ws, 'state', roomState(room));
      return;
    }

    const room = ws.room;
    const p = room?.players.get(ws.pid);
    if (!room || !p) return;

    if (m.type === 'input') {
      p.x = Math.max(60, Math.min(1540, Number(m.x) || p.x));
      p.y = Math.max(60, Math.min(1140, Number(m.y) || p.y));
      p.downed = !!m.downed;
      p.hp = Math.max(0, Math.min(p.maxHp, Number(m.hp) || p.hp));
      broadcast(room, 'state', roomState(room));
    }

    if (m.type === 'event') {
      if (m.event === 'bossHit') {
        room.bossHp = Math.max(0, room.bossHp - (Number(m.damage) || 20));
        if (room.bossHp === 0) room.quests.forestBoss = true;
        broadcast(room, 'worldEvent', { event: m.event, bossHp: room.bossHp, quests: room.quests });
      } else {
        broadcast(room, 'worldEvent', { event: m.event, by: p.id, data: m.data || {} });
      }
    }

    if (m.type === 'world') {
      const w = Math.max(1, Math.min(8, Number(m.world) || 1));
      if (p.id === room.host) {
        room.world = w;
        room.bossHp = 1000;
        for (const q of room.players.values()) q.world = w;
        broadcast(room, 'state', roomState(room));
      }
    }
  });

  ws.on('close', () => {
    const room = ws.room;
    if (!room) return;
    room.players.delete(ws.pid);
    if (room.players.size === 0) {
      rooms.delete(room.code);
    } else {
      if (room.host === ws.pid) room.host = room.players.keys().next().value;
      broadcast(room, 'state', roomState(room));
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Worlds Unbound server listening on ${HOST}:${PORT}`);
});