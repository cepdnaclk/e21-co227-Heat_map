import { WebSocketServer, WebSocket } from 'ws';
const wss = new WebSocketServer({ port: 5008 });

const MAX_HISTORY = 4;
const chatHistory = [];
let clientCounter = 0;
const clientNames = new Map();

console.log('WebSocket server started on ws://localhost:5008');

wss.on('connection', function connection(ws) {
  clientCounter += 1;
  const clientName = `Client ${clientCounter}`;
  clientNames.set(ws, clientName);

  console.log(`${clientName} connected`);
  // Send chat history to the new client
  ws.send(JSON.stringify({ type: 'history', messages: chatHistory }));

  ws.on('message', function incoming(data) {
    console.log(`${clientName} sent:`, data.toString());
    // Save to history
    try {
      const parsed = JSON.parse(data);
      if (parsed.message) {
        const msgObj = { name: clientName, message: parsed.message };
        chatHistory.push(msgObj);
        // Keep only the last MAX_HISTORY messages
        if (chatHistory.length > MAX_HISTORY) {
          chatHistory.splice(0, chatHistory.length - MAX_HISTORY);
        }
        // Broadcast the message object to all clients
        const historyPayload = JSON.stringify({ type: 'history', messages: chatHistory });
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(historyPayload);
          }
        });
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    console.log(`${clientName} disconnected`);
    clientNames.delete(ws);
  });
});