const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store current grid state
let gridState = {
    frequency: 50.0,
    voltage: 230.0,
    totalLoad: 1000,
    totalGen: 1005,
    timestamp: new Date().toISOString()
};

// Endpoint for MATLAB to send updates
app.post('/api/update', (req, res) => {
    const data = req.body;
    console.log('Received update from MATLAB:', data);

    gridState = {
        ...data,
        timestamp: new Date().toISOString()
    };

    // Broadcast if io exists
    if (io) io.emit('gridUpdate', gridState);

    res.status(200).json({ status: 'success' });
});

// Endpoint to get current state (initial load)
app.get('/api/state', (req, res) => {
    res.json(gridState);
});

// Basic route for API testing
app.get('/api/hello', (req, res) => {
    res.json({ message: "Quantum Grid API is active" });
});

// Export the app for Vercel
module.exports = app;

// Local execution logic
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
