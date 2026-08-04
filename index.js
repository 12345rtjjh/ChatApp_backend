const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 🔥 Production ke liye specific URL daalna
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Naya user connected:', socket.id);

  // ✅ Room join event
  socket.on('join_room', (data) => {
    // 🔥 data ek array hai [room, username]
    const room = data[0];
    const username = data[1];
    
    socket.join(room);
    console.log(`✅ User ${socket.id} joined room: ${room} username: ${username}`);
    
    // JOIN confirmation bhejo
    socket.emit('join_confirmed', {
      username: username,
      room: room,
      message: `Joined ${room}`
    });
    
    // Baaki users ko batao
    socket.to(room).emit('user_joined', `${username} joined the room`);
  });

  // ✅ Message send event
  socket.on('send_message', (data) => {
    console.log('📩 Message received on server:', data);
    console.log(`📤 Broadcasting to room: ${data.room}`);
    
    // ✅ Sabko message bhejo
    io.to(data.room).emit('receive_message', {
      username: data.username || 'Anonymous',
      message: data.message,
      sender: socket.id,
      timestamp: new Date().toLocaleTimeString()
    });
    
    console.log('✅ Message broadcasted successfully');
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ✅ SERVER START - Yeh important hai!
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ Export for Vercel serverless (optional)
module.exports = app;