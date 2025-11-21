const express = require('express');
const cors = require('cors');
require('dotenv').config({path:__dirname+ '/../.env'});

const app = express();
const PORT = process.env.PORT || 5004;

// CORS configuration to allow requests from unified server
// const corsOptions = {
//     origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
//     credentials: true,
//     optionsSuccessStatus: 200
// };

// Middleware - fix typo
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');

app.use('/auths', authRoutes);



// Error handling middleware - add this after routes
app.use((req, res, next) => {
    res.status(404).json({
        message: `Auth ${req.url} not found`
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!'
    });
});


// Root route
app.get('/', (req, res) => {
    res.send('Authorization Service is running(Root Route)');
});



app.listen(PORT, () => {
    console.log(`Authorization Service running on port ${PORT}`);
});