// File : index.js of api-gateway

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_API_GATEWAY_PORT || 5000;

// Middleware
app.use(cors());

const verifyToken = require('./middlewares/verifyToken');




// Proxy for /api/auth to auth-service
/*
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:5004', // Change if your auth-service runs on a different port
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' }
}));
*/

app.use('/organizers',createProxyMiddleware({
    target: process.env.BACKEND_ORG_MANAGEMENT_SERVICE_URL || `http://localhost:${process.env.BACKEND_ORG_MANAGEMENT_SERVICE_PORT || 5001}`,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/users/, '/users')
}));

app.use('/events',createProxyMiddleware({
    target: process.env.BACKEND_EVENT_SERVICE_URL || `http://localhost:${process.env.BACKEND_EVENT_SERVICE_PORT || 5002}`,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/events/, '/events')
}));

app.use('/buildings',createProxyMiddleware({
    target: process.env.BACKEND_BUILDING_SERVICE_URL || `http://localhost:${process.env.BACKEND_BUILDING_SERVICE_PORT || 5003}`,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/buildings/, '/buildings')
}));

/*
app.use('/auths', createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/auths/, '/auths')
}));
*/

app.use('/auths', createProxyMiddleware({
    target: process.env.BACKEND_AUTH_SERVICE_URL || `http://localhost:${process.env.BACKEND_AUTH_SERVICE_PORT || 5004}`,
    changeOrigin: true,
    pathRewrite: { '^/auths': '' } // remove /auths before sending
}));



// Root route for testing
app.get('/', (req, res) => {
    res.send('API Gateway is running');
});



// Start server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
