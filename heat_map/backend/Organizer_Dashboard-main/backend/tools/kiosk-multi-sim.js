// kiosk-multi-sim.js
const { fork } = require('child_process');

const count = parseInt(process.argv[2] || '5', 10); // default 5 kiosks
const url = process.argv[3] || 'ws://localhost:5010/ws';

for (let i = 1; i <= count; i++) {
  fork(__dirname + '/kiosk-sim.js', [`K${i}`, url]);
}
