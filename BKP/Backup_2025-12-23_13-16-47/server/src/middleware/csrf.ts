import { Request, Response, NextFunction } from 'express';

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for login/register/refresh endpoints as they might be initial entry points or handled differently
  // However, for strictness, we might want to check them too, but login/register usually don't have the cookie yet.
  if (req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
    return next();
  }

  const tokenFromHeader = req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies['X-CSRF-Token'];

  if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
    return res.status(403).json({ message: 'CSRF Token mismatch or missing' });
  }

  next();
};
