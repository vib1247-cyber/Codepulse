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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://192.168.31.59:3000',
  'http://192.168.31.59:3001',
  'http://192.168.31.59:3002',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

// Enable CORS for all routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow requests with no origin (like mobile apps, curl, etc.)
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, x-request-timestamp');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Set-Cookie');
    res.header('Access-Control-Max-Age', '600');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  } else {
    console.log('CORS blocked for origin:', origin);
    return res.status(403).json({ 
      success: false, 
      message: 'Not allowed by CORS' 
    });
  }
  
  next();
});

// CORS is now handled by the custom middleware above
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection with retry logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  return mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    family: 4                       // Use IPv4, skip trying IPv6
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Initial connection
connectWithRetry();

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from DB');
  // Attempt to reconnect after a delay
  setTimeout(connectWithRetry, 5000);
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questions.js';
import submissionRoutes from './routes/submissionRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import aiFeedbackRoutes from './routes/aiFeedback.js';

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/ai-feedback', aiFeedbackRoutes);

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
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/'
});

// Socket.io connection handling
const interviewRooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

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