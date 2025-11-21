// backend/tools/kiosk-sim.js
const WebSocket = require('ws');

const id = process.argv[2] || `SIM-${Math.random().toString(36).slice(2)}`;
const url = process.argv[3] || 'ws://localhost:5010/ws';

const ws = new WebSocket(`${url}?id=${encodeURIComponent(id)}`);

ws.on('open', () => console.log(`[${id}] connected to ${url}`));
ws.on('message', (msg) => console.log(`[${id}] ALERT:`, msg.toString()));
ws.on('close', () => console.log(`[${id}] disconnected`));
ws.on('error', (e) => console.error(`[${id}] error:`, e.message));