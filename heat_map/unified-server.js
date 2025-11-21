const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080; // Single port for everything

// Enable JSON parsing for middleware
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// Health check for the unified server
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Unified Exhibition App Server',
    timestamp: new Date().toISOString(),
    services: {
      'api-gateway': 'http://localhost:5500',
      'events-api': 'http://localhost:3036',
      'heatmap-api': 'http://localhost:3897',
      'maps-api': 'http://localhost:3001',
      'auth-service': 'http://localhost:5004'
    }
  });
});

// API Gateway proxy - all /api/* requests go to port 5500
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5500',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding
  },
  onError: (err, req, res) => {
    console.log('API Gateway Error:', err.message);
    res.status(502).json({ error: 'API Gateway unavailable', service: 'api-gateway' });
  }
}));

// Events API proxy - /events-api/* requests go to port 3036
app.use('/events-api', createProxyMiddleware({
  target: 'http://localhost:3036',
  changeOrigin: true,
  pathRewrite: {
    '^/events-api': '',
  },
  onError: (err, req, res) => {
    console.log('Events API Error:', err.message);
    res.status(502).json({ error: 'Events API unavailable', service: 'events-api' });
  }
}));

// Heatmap API proxy - /heatmap-api/* requests go to port 3897
app.use('/heatmap-api', createProxyMiddleware({
  target: 'http://localhost:3897',
  changeOrigin: true,
  pathRewrite: {
    '^/heatmap-api': '',
  },
  onError: (err, req, res) => {
    console.log('Heatmap API Error:', err.message);
    res.status(502).json({ error: 'Heatmap API unavailable', service: 'heatmap-api' });
  }
}));

// Maps API proxy - /maps-api/* requests go to port 3001
app.use('/maps-api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/maps-api': '',
  },
  onError: (err, req, res) => {
    console.log('Maps API Error:', err.message);
    res.status(502).json({ error: 'Maps API unavailable', service: 'maps-api' });
  }
}));

// WebSocket proxy for Socket.IO connections
app.use('/socket.io', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  onError: (err, req, res) => {
    console.log('WebSocket Error:', err.message);
    if (res) res.status(502).json({ error: 'WebSocket unavailable', service: 'websocket' });
  }
}));

// Auth Service proxy - handles all authentication and authorization
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:5004',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auths', // Map /auth to /auths on the auth service
  },
  onError: (err, req, res) => {
    console.log('Auth Service Error:', err.message);
    res.status(502).json({ error: 'Auth Service unavailable', service: 'auth-service' });
  }
}));

// Admin/Dashboard API proxy
app.use('/admin-api', createProxyMiddleware({
  target: 'http://localhost:5500', // API Gateway handles admin routes
  changeOrigin: true,
  pathRewrite: {
    '^/admin-api': '/admin',
  },
  onError: (err, req, res) => {
    console.log('Admin API Error:', err.message);
    res.status(502).json({ error: 'Admin API unavailable', service: 'admin-api' });
  }
}));

// Error handling middleware for 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found', 
    path: req.originalUrl,
    availableRoutes: ['/api/*', '/events-api/*', '/heatmap-api/*', '/maps-api/*', '/auth/*', '/admin-api/*']
  });
});

// Catch-all handler for React Router (must be last)
app.use((req, res) => {
  // If it's an API request that wasn't caught above, return 404
  if (req.url.startsWith('/api') || req.url.startsWith('/auth') || req.url.startsWith('/admin')) {
    return res.status(404).json({ 
      error: 'Service not found', 
      path: req.originalUrl 
    });
  }
  // Otherwise serve the React app
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Unified Exhibition App Server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔌 API Gateway: http://localhost:${port}/api`);
  console.log(`📅 Events API: http://localhost:${port}/events-api`);
  console.log(`🗺️  Maps API: http://localhost:${port}/maps-api`);
  console.log(`🔥 Heatmap API: http://localhost:${port}/heatmap-api`);
  console.log(`🔐 Auth API: http://localhost:${port}/auth`);
  console.log(`👨‍💼 Admin API: http://localhost:${port}/admin-api`);
  console.log(`⚕️  Health Check: http://localhost:${port}/health`);
  console.log(`\n🚀 Email verification links will work at: http://localhost:${port}/auth/approve/[id]`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});