import dotenv from 'dotenv';
import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, replace with actual frontend URL
    methods: ['GET', 'POST']
  }
});

// Mock Real-time Data Stream
setInterval(() => {
  const mockData = {
    leads: Math.floor(Math.random() * 10) + 1, // 1-10 new leads
    revenue: Math.floor(Math.random() * 100) + 50, // 50-150 revenue
    timestamp: new Date().toISOString()
  };
  io.emit('dashboard_update', mockData);
}, 5000); // Every 5 seconds

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
