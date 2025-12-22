import { Request, Response, NextFunction } from 'express';
import { trafficService } from '../services/trafficService';

export const trafficLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    // Only log if user is authenticated (userId is required by schema)
    if (req.user && (req.user as any).id) {
      const duration = Date.now() - start;
      const userId = (req.user as any).id;
      
      // Calculate size (approximate)
      const size = (res.getHeader('content-length') as number) || 0;

      trafficService.logRequest({
        apiEndpoint: req.path,
        method: req.method,
        userId: userId,
        status: res.statusCode,
        duration: duration,
        size: Number(size),
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }).catch(err => {
        console.error('Failed to log traffic:', err);
      });
    }
  });

  next();
};
