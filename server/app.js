import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import { networkInterfaces } from 'os';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from './models/User.js';
import Interview from './models/Interview.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questions.js';
import submissionRoutes from './routes/submissionRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import aiFeedbackRoutes from './routes/aiFeedback.js';
import interviewRoutes from './routes/interviewRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/execute', codeRoutes);
app.use('/api/submit', submissionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: whitelist,
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/'
});

// Socket.io connection handling
const interviewRooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('join_room', async ({ roomId, userId }) => {
    try {
      // Verify room exists and user is a participant
      const interview = await Interview.findOne({ roomId });
      if (!interview || !interview.participants.includes(userId)) {
        socket.emit('error', { message: 'Not authorized to join this room' });
        return;
      }

      // Join the room
      await socket.join(roomId);
      
      // Store room info
      if (!interviewRooms.has(roomId)) {
        interviewRooms.set(roomId, new Set());
      }
      interviewRooms.get(roomId).add(socket.id);

      // Notify others in the room
      socket.to(roomId).emit('user_joined', { userId, socketId: socket.id });
      
      // Send current code and language to the new user
      socket.emit('code_update', {
        code: interview.code,
        language: interview.language
      });

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Error joining room' });
    }
  });

  // Handle code updates
  socket.on('code_update', async ({ roomId, code, language, userId }) => {
    try {
      // Verify user is in the room
      const interview = await Interview.findOne({ roomId });
      if (!interview || !interview.participants.includes(userId)) {
        return;
      }

      // Update the code in the database
      interview.code = code;
      if (language) {
        interview.language = language;
      }
      await interview.save();

      // Broadcast to other users in the room
      socket.to(roomId).emit('code_update', { code, language });
    } catch (error) {
      console.error('Error updating code:', error);
    }
  });

  // Handle WebRTC signaling
  socket.on('webrtc_offer', ({ to, offer }) => {
    socket.to(to).emit('webrtc_offer', { offer, from: socket.id });
  });

  socket.on('webrtc_answer', ({ to, answer }) => {
    socket.to(to).emit('webrtc_answer', { answer, from: socket.id });
  });

  socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
    socket.to(to).emit('webrtc_ice_candidate', { candidate, from: socket.id });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up room info
    for (const [roomId, clients] of interviewRooms.entries()) {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        if (clients.size === 0) {
          interviewRooms.delete(roomId);
        } else {
          // Notify other users in the room
          socket.to(roomId).emit('user_left', { socketId: socket.id });
        }
        break;
      }
    }
  });
});

const wss = new WebSocketServer({ 
  server, 
  path: '/ws',
  clientTracking: true,
  verifyClient: async (info, done) => {
    try {
      const origin = info.origin || info.req.headers.origin;
      if (!origin || !whitelist.includes(origin)) {
        console.warn('WebSocket connection rejected from origin:', origin);
        return done(false, 403, 'Forbidden: Origin not allowed');
      }

      // Extract token from query parameters
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.warn('WebSocket connection rejected: No token provided');
        return done(false, 401, 'Unauthorized: No token provided');
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.warn('WebSocket connection rejected: User not found');
        return done(false, 401, 'Unauthorized: User not found');
      }

      // Attach user to the request for later use
      info.req.user = user;
      return done(true);
    } catch (error) {
      console.error('WebSocket verification error:', error);
      return done(false, 401, `Unauthorized: ${error.message}`);
    }
  }
});

// Track connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
  const user = req.user;
  const clientId = user._id.toString();
  
  console.log(`✅ New WebSocket connection from user: ${user.email} (${clientId})`);
  
  // Store the WebSocket connection with user info
  clients.set(clientId, { ws, user });
  
  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connection', 
    status: 'connected', 
    userId: clientId,
    timestamp: new Date().toISOString() 
  }));

  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message from', user.email, ':', data);
      
      // Handle ping messages
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ 
          type: 'pong', 
          timestamp: data.timestamp,
          serverTime: new Date().toISOString()
        }));
        return;
      }
      
      // Echo back the message with user info
      ws.send(JSON.stringify({ 
        type: 'message', 
        status: 'received',
        userId: clientId,
        data,
        timestamp: new Date().toISOString() 
      }));
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid message format', 
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${user.email} (${clientId})`);
    clients.delete(clientId);
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for user ${user.email}:`, error);
    clients.delete(clientId);
  });
});

// Send heartbeat to all connected clients every 30 seconds
const HEARTBEAT_INTERVAL = 30000;
const heartbeat = () => {
  const now = new Date().toISOString();
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.ping();
      client.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: now,
        clientCount: wss.clients.size
      }));
    }
  });
};

const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL);

// Clean up on server close
server.on('close', () => {
  console.log('Server is shutting down. Closing WebSocket connections...');
  clearInterval(interval);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.close(1001, 'Server shutting down');
    }
  });
  wss.close();
});

server.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`🚀 Server running on http://${address.address}:${address.port}`);
  console.log(`🔄 WebSocket running on ws://${address.address}:${address.port}/ws`);
  console.log(`📡 Network: http://${getLocalIpAddress()}:${address.port}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please check for other running instances.`);
  }
});

// Helper function to get local IP address
function getLocalIpAddress() {
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}