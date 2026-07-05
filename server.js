import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Basic Matchmaking Queues
let waitingUsersText = [];
let waitingUsersVideo = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('start_search', (data) => {
    const { mode, interests, location } = data; // mode: 'CHAT_TEXT' | 'CHAT_VIDEO'
    console.log(`User ${socket.id} started search for ${mode}`);

    // If user is already in a waiting queue, remove them first
    waitingUsersText = waitingUsersText.filter(u => u.id !== socket.id);
    waitingUsersVideo = waitingUsersVideo.filter(u => u.id !== socket.id);

    // Also leave any previous rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
        // notify the other person if we were in a room
        socket.to(room).emit('stranger_disconnected');
      }
    });

    const queue = mode === 'CHAT_VIDEO' ? waitingUsersVideo : waitingUsersText;

    if (queue.length > 0) {
      // Find a match
      const partner = queue.shift();
      
      const roomId = `room_${partner.id}_${socket.id}`;
      
      // Join both to the room
      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partner.id);
      if (partnerSocket) {
        partnerSocket.join(roomId);
        
        // Notify both that they are connected
        io.to(socket.id).emit('connected_to_stranger', { roomId, partnerLocation: partner.location, isInitiator: true });
        io.to(partnerSocket.id).emit('connected_to_stranger', { roomId, partnerLocation: location, isInitiator: false });
      } else {
        // Partner somehow disconnected while in queue, put current user in queue
        queue.push({ id: socket.id, interests, mode, location });
      }
    } else {
      // No match found, wait in queue
      queue.push({ id: socket.id, interests, mode, location });
    }
  });

  socket.on('stop_search', () => {
    waitingUsersText = waitingUsersText.filter(u => u.id !== socket.id);
    waitingUsersVideo = waitingUsersVideo.filter(u => u.id !== socket.id);
  });

  socket.on('send_message', (data) => {
    const { roomId, message } = data;
    socket.to(roomId).emit('receive_message', { message });
  });

  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('stranger_typing', { isTyping });
  });



  // E2EE Signaling
  socket.on('e2ee_public_key', (data) => {
    socket.to(data.roomId).emit('e2ee_public_key', data);
  });

  // WebRTC Signaling
  socket.on('webrtc_offer', (data) => {
    socket.to(data.roomId).emit('webrtc_offer', data.sdp);
  });

  socket.on('webrtc_answer', (data) => {
    socket.to(data.roomId).emit('webrtc_answer', data.sdp);
  });

  socket.on('webrtc_ice_candidate', (data) => {
    socket.to(data.roomId).emit('webrtc_ice_candidate', data.candidate);
  });

  socket.on('stop_search', () => {
    console.log(`User ${socket.id} stopped search`);
    waitingUsersText = waitingUsersText.filter(u => u.id !== socket.id);
    waitingUsersVideo = waitingUsersVideo.filter(u => u.id !== socket.id);
  });

  socket.on('disconnect_stranger', (data) => {
    const { roomId, autoSkip } = data;
    socket.to(roomId).emit('stranger_disconnected', { autoSkip });
    socket.leave(roomId);
  });

  socket.on('report_user', (data) => {
    socket.to(data.roomId).emit('stranger_reported_you');
  });

  socket.on('disconnecting', () => {
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit('stranger_disconnected', { autoSkip: false });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    waitingUsersText = waitingUsersText.filter(u => u.id !== socket.id);
    waitingUsersVideo = waitingUsersVideo.filter(u => u.id !== socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
