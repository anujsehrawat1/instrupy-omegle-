import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve the compiled React static files from 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

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
    const { mode, interests, location, strict } = data; // mode: 'CHAT_TEXT' | 'CHAT_VIDEO'
    console.log(`User ${socket.id} started search for ${mode} (Strict: ${strict})`);

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
    const myInterests = interests ? interests.map(i => i.toLowerCase().trim()) : [];

    if (queue.length > 0) {
      let partnerIndex = -1;
      let sharedInterests = [];

      // 1. Try to find a match with shared interests
      if (myInterests.length > 0) {
        const possibleMatches = [];
        queue.forEach((u, index) => {
          if (u.interests && u.interests.length > 0) {
            const common = u.interests.filter(i => myInterests.includes(i));
            if (common.length > 0) {
              possibleMatches.push({ index, common });
            }
          }
        });

        if (possibleMatches.length > 0) {
          // Pick a random user from the interest matches
          const randomMatch = possibleMatches[Math.floor(Math.random() * possibleMatches.length)];
          partnerIndex = randomMatch.index;
          sharedInterests = randomMatch.common;
        }
      }

      // 2. Random Picker (If no interest match, and our strict is false)
      if (partnerIndex === -1 && !strict) {
        const validRandoms = [];
        queue.forEach((u, index) => {
          // Can only connect if the other user also doesn't have strict mode on
          if (!u.strict) {
            validRandoms.push(index);
          }
        });

        if (validRandoms.length > 0) {
          partnerIndex = validRandoms[Math.floor(Math.random() * validRandoms.length)];
        }
      }

      if (partnerIndex !== -1) {
        // Remove the matched partner from the queue
        const partner = queue.splice(partnerIndex, 1)[0];
        
        const roomId = `room_${partner.id}_${socket.id}`;
        
        // Join both to the room
        socket.join(roomId);
        const partnerSocket = io.sockets.sockets.get(partner.id);
        if (partnerSocket) {
          partnerSocket.join(roomId);
          
          // Notify both that they are connected and send any shared interests
          io.to(socket.id).emit('connected_to_stranger', { roomId, partnerLocation: partner.location, isInitiator: true, sharedInterests });
          io.to(partnerSocket.id).emit('connected_to_stranger', { roomId, partnerLocation: location, isInitiator: false, sharedInterests });
        } else {
          // Partner somehow disconnected while in queue, put current user back in queue
          queue.push({ id: socket.id, interests: myInterests, mode, location, strict });
        }
      } else {
        // No valid match found, wait in queue
        queue.push({ id: socket.id, interests: myInterests, mode, location, strict });
      }
    } else {
      // No one in queue, wait in queue
      queue.push({ id: socket.id, interests: myInterests, mode, location, strict });
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

// GitHub Auto-Deploy Webhook
app.post('/api/webhook', (req, res) => {
  res.status(200).send('Deploy triggered');
  console.log('GitHub Push detected! Pulling new code...');
  
  exec('git fetch && git reset --hard origin/main && git pull && npm run build && pm2 restart all', (err, stdout, stderr) => {
    if (err) {
      console.error('Auto-deploy failed:', err);
      return;
    }
    console.log('Deploy Output:', stdout);
  });
});

// Send all other requests to the React app router (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Starts on Port 80 (Standard Web Port)
const PORT = process.env.PORT || 80;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
