// create server
require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./db/db');
const { initSocket } = require('../socket/socket');

// connect to database
connectDB();

//create server from app
const server = http.createServer(app);

//socket init
initSocket(server);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

