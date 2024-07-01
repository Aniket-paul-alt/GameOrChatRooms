const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

let user = 0

// Listen for new connections to Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room
  socket.on('joinRoom', (data) => {
    socket.join(data.roomId);
    socket.emit('welcomeuser', {user : data.username, roomId : data.roomId})
    socket.broadcast.emit('joinuser',{user: data.username , roomId: data.roomId, users : user})
    user++
    console.log(`User ${data.username} joined room ${data.roomId}`);
  });

  // Leave a room
  socket.on('leaveRoom', (data) => {
    socket.leave(data.roomId);
    user--
    // socket.broadcast.emit(`User ${socket.id} left room ${roomId}`)
    socket.broadcast.emit('leaveuser',{user: data.username , roomId: data.roomId, users : user})
    console.log(`User ${data.username} left room ${data.roomId}`);
  });

  // Handle messages
  socket.on('message', (data) => {
    console.log(`Message from ${data.username} in room ${data.roomId}: ${data.message}`);
    io.to(data.roomId).emit('message', { userId: data.username, message : data.message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
