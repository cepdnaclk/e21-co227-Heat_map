const express = require("express");
const http = require('http');
const {Server} = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const routeFromArbitraryPoint = require("./routing")
const searchDatabase = require('./search');
const fs = require('fs/promises');


const app = express();


const server = http.createServer(app);
const io = new Server(server, {
  cors: {origin: "*"}
});

app.use(cors());
app.use(bodyParser.json()); // parse JSON payloads

const HTTP_PORT = process.env.PORT || process.env.BACKEND_MAPS_SERVICE_PORT || 3001;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Listen for location updates
  socket.on("position-update", (data) => {
    
    console.log(`Received from ${socket.id}: lat=${data.coords[0]}, lng=${data.coords[1]}, dest=${data.node}`);

    // Do calculations
    if (data.node === null || data.node === undefined) {
      console.log(`No destination node provided by ${socket.id}`);
      return;
    }

    if (data.coords === null || data.coords === undefined || data.coords.length !== 2) {
      console.log(`Invalid coordinates provided by ${socket.id}`);
      return;
      
    }


    const route = routeFromArbitraryPoint(data.coords, data.node);

    // Send back response
    socket.emit("route-update", route);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- REST endpoints for map + building info ---
app.get("/api/buildings", (req, res) => {
  const withTraffic = {
    ...buildings,
    features: buildings.features.map(f => ({
      ...f,
      properties: { ...f.properties, traffic: traffic[f.properties.id] }
    }))
  };
  res.json(withTraffic);
});

app.get("/api/building/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!detailsById[id]) return res.status(404).json({ error: "Not found" });
  res.json({ ...detailsById[id], traffic: traffic[id] });
});



app.get('/map', async (req, res) => {
  try {
    const svgContent = await fs.readFile('./map.svg', 'utf8');
    res.set('Content-Type', 'text/plain'); // Send as plain text
    res.send(svgContent);
    console.log('requested /map: map file served')
  } catch (error) {
    console.error('Error reading SVG file:', error.message);
    res.status(500).json({ error: 'Failed to read SVG file' });
  }
});

app.get("/api/search", (req, res) => {
  const { query, category, zone, subzone } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const results = searchDatabase(query, { category, zone, subzone });
  res.json(results);
});


server.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT}`);
});
