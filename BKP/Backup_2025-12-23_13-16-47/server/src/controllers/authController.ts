import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../schemas/auth.schema';
import { z } from 'zod';
import { emailService } from '../services/emailService';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

export const generateTokens = (user: { id: string, role: string }) => {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, jti: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { email, password, name } = validatedData;
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name }
      });

      const { token, refreshToken } = generateTokens(user);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      const verificationToken = crypto.randomBytes(32).toString('hex');
      await prisma.emailVerificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      await emailService.sendEmail(
        user.email,
        'Verifique seu e-mail - Hexa Dashboard',
        emailService.getVerificationTemplate(verificationLink)
      );

      // Trigger Automated Onboarding (SaaS Flow)
      // This runs asynchronously in the background
      onboardingService.startOnboarding(user.id, user.email).catch(console.error);

      // CSRF Token (Double Submit Cookie Pattern)
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('X-CSRF-Token', csrfToken, { 
        httpOnly: false, // Accessible by JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        sameSite: 'lax'
      });
      res.status(201).json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      console.error('Register error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const { token, refreshToken } = generateTokens(user);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // CSRF Token (Double Submit Cookie Pattern)
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('X-CSRF-Token', csrfToken, { 
        httpOnly: false, // Accessible by JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token not found' });
        return;
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        res.clearCookie('refreshToken');
        res.status(403).json({ message: 'Invalid refresh token' });
        return;
      }

      try {
        jwt.verify(refreshToken, REFRESH_SECRET);
      } catch (err) {
        res.clearCookie('refreshToken');
        res.status(403).json({ message: 'Invalid refresh token signature' });
        return;
      }

      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      });

      const { token: newAccessToken, refreshToken: newRefreshToken } = generateTokens(storedToken.user);

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
      res.json({ token: newAccessToken });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      try {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { revoked: true }
        });
      } catch (e) {}
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        await prisma.passwordResetToken.create({
          data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
          }
        });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        await emailService.sendEmail(
          user.email,
          'Redefinição de Senha - Hexa Dashboard',
          emailService.getPasswordResetTemplate(resetLink)
        );
      }

      // Always return success to prevent email enumeration
      res.json({ message: 'If an account exists, a password reset email has been sent.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Error processing request' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!resetToken || resetToken.expiresAt < new Date()) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      });

      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Error resetting password' });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      
      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!verificationToken || verificationToken.expiresAt < new Date()) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
      }

      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() }
      });

      await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Error verifying email' });
    }
  },

  async me(req: Request, res: Response) {
    try {
      // req.user is populated by authenticateToken middleware
      const user = (req as any).user;
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true }
      });

      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  },

  async mockSocialLogin(req: Request, res: Response) {
    try {
      const provider = req.path.includes('google') ? 'google' : 'github';
      const email = `mock_${provider}_user@example.com`;
      const name = `Mock ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
      const providerId = `mock_${provider}_id_12345`;

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create user if not exists
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        
        user = await prisma.user.create({
          data: {
            email,
            name,
            [provider === 'google' ? 'googleId' : 'githubId']: providerId,
            role: 'USER',
            emailVerified: new Date(),
            password: hashedPassword
          }
        });
        
        // Trigger onboarding for new mock user
        // onboardingService.startOnboarding(user.id, user.email).catch(console.error);
      } else {
        // Update provider ID if missing (e.g. created by other means)
        const updateData: any = {};
        if (provider === 'google' && !user.googleId) updateData.googleId = providerId;
        if (provider === 'github' && !user.githubId) updateData.githubId = providerId;
        
        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData
          });
        }
      }

      const { token, refreshToken } = generateTokens(user);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // CSRF Token (Double Submit Cookie Pattern)
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('X-CSRF-Token', csrfToken, { 
        httpOnly: false, // Accessible by JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        sameSite: 'lax'
      });
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?token=${token}&refreshToken=${refreshToken}`);

    } catch (error) {
      console.error('Mock login error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=mock_login_failed`);
    }
  }
};
