const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const mongoose=require('mongoose');
const { type } = require('os');

// check karna hai ki phehle se wo room exist karta hai ki nahi

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', async(socket) => {
  console.log('🟢 Naya user connected:', socket.id);

  // ✅ Room join event
  socket.on('join_room', async([room,username]) => {
    socket.join(room);

    console.log(`✅ User ${socket.id} joined room: ${room} username:${username}`);
    
    // JOIN confirmation bhejo (frontend ko bataye ki join ho gaya)
    socket.emit('join_confirmed', {username:username, room: room, message: `Joined ${room}` });
    
    
    // Baaki users ko batao
    socket.to(room).emit('user_joined', `${socket.id} joined the room`);
  });

  // ✅ Message send event
  socket.on('send_message', (data) => {
    console.log('📩 Message received on server:', data);
    console.log(`📤 Broadcasting to room: ${data.room}`);
    
    // ✅ IMPORTANT: io.to() use karo, NOT socket.to()
    io.to(data.room).emit('receive_message', {
      username:data.username,
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

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:5000`);
});