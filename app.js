require('dotenv').config();

require('./config/associations')
const Server = require('./models/server');

const server = new Server();

server.listen();