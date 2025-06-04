const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  // Allows your frontend to connect from anywhere during dev
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data); // Send drawing to everyone but sender
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
