// index.js - wires express + ws + routes
const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');
const { initWebSocket, getConnectedCount } = require('./wsManager');

const PORT = process.env.PORT || process.env.BACKEND_ALERT_SERVICE_PORT || 5010;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Mount routes
app.use('/alerts', alertRoutes);

// Health
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', connectedKiosks: getConnectedCount() });
});

// Start server + WebSocket
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => console.log(`Alert Service running on :${PORT}`));
