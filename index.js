// require('dotenv').config();
// const connectToMongo = require('./db');
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const path = require('path');
// const app = express();
// const port = process.env.PORT || 5000;

// // Connect to MongoDB database
// connectToMongo();

// // Middleware
// const corsOptions = {
//   origin: ['https://faizbook-rjwf.onrender.com','http://localhost:3000'], // No trailing slash
// };

// app.use(cors(corsOptions)); // Enable CORS
// app.use(bodyParser.json()); // Parse JSON request bodies
// app.use(express.static(path.join(__dirname, './build'))); // Serve static files from React app

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/posts', require('./routes/posts'));

// // Fallback for serving React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, './build', 'index.html'));
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Backend server is running at http://localhost:${port}`);
// });

require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http'); // Import http module to work with Socket.io
const { Server } = require('socket.io'); // Import Server from Socket.io

const app = express();
const port = process.env.PORT || 5000;

// Create an HTTP server to use with Socket.io
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: ['https://faizbook-rjwf.onrender.com', 'http://localhost:3000'],
  },
});

// Connect to MongoDB database
connectToMongo();

// Middleware
const corsOptions = {
  origin: ['https://faizbook-rjwf.onrender.com', 'http://localhost:3000'], // No trailing slash
};

app.use(cors(corsOptions)); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, './build'))); // Serve static files from React app

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('new-post', (post) => {
    // Broadcast the new post to all connected clients
    io.emit('new-post', post);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// Fallback for serving React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

// Start the server
server.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
