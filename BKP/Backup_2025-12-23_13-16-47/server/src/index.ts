import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { integrationService } from './services/integrationService';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, replace with actual frontend URL
    methods: ['GET', 'POST']
  }
});

// Attach io to app for access in controllers
app.set('io', io);

// Real-time Data Sync Scheduler
// Checks for new data from connected integrations every 10 seconds
setInterval(async () => {
  try {
    const update = await integrationService.syncAllActiveIntegrations();

    if (update && (update.leads > 0 || update.revenue > 0)) {
        console.log('[Scheduler] Broadcasting update:', update);
        io.emit('dashboard_update', update);

        if (update.revenue > 0) {
            io.emit('notification', {
                title: 'Nova Conversão',
                message: `Novo lead convertido: R$ ${update.revenue.toFixed(2)}`,
                type: 'success'
            });
        }
    }
  } catch (error) {
    console.error('[Scheduler] Error in sync job:', error);
  }
}, 10000); // Every 10 seconds

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
