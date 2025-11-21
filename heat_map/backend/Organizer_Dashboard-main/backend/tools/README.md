# Tools

## Kiosk Simulator => fake kiosks for local testing 
Run a single kiosk:
```bash
node backend/tools/kiosk-sim.js K1 ws://localhost:5010/ws

Run multiple kiosks:
```bash
node backend/tools/kiosk-multi-sim.js 5 ws://localhost:5010/ws