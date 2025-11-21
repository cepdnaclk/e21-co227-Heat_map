const { WebSocketServer } = require('ws');

let wss;
const kiosks = new Map();

function initWebSocket(server) {
  const WS_PATH = process.env.WS_PATH || '/ws';
  wss = new WebSocketServer({ server, path: WS_PATH });

  wss.on('connection', (ws, req) => {
    const qs = new URLSearchParams((req.url.split('?')[1] || ''));
    const kioskId = qs.get('id') || `anon-${Math.random().toString(36).slice(2)}`;

    ws.id = kioskId;
    ws.isAlive = true;
    kiosks.set(kioskId, ws);
    console.log(`[WS] Kiosk connected: ${kioskId} (total: ${kiosks.size})`);

    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => {
      kiosks.delete(kioskId);
      console.log(`[WS] Kiosk disconnected: ${kioskId} (total: ${kiosks.size})`);
    });
    ws.on('error', (err) => console.error(`[WS] Error (${kioskId}):`, err.message));
  });

  // heartbeat
  setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false; ws.ping();
    });
  }, 30_000);
}

function broadcastAlert(message) {
  const payload = JSON.stringify({ type: 'ALERT', payload: { message, sentAt: new Date().toISOString() }});
  let sent = 0;
  if (!wss) return sent;
  for (const ws of wss.clients) {
    if (ws.readyState === ws.OPEN) { ws.send(payload); sent++; }
  }
  return sent;
}

function getConnectedCount() { return kiosks.size; }

module.exports = { initWebSocket, broadcastAlert, getConnectedCount };
