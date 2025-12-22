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

export const generateTokens = (user: { id: string, role: string }) => {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, jti: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      // Zod Validation
      const validatedData = registerSchema.parse(req.body);
      
      const { email, password, name } = validatedData;
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      const { token, refreshToken } = generateTokens(user);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Email Verification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await prisma.emailVerificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      await emailService.sendEmail(
        user.email,
        'Verifique seu e-mail - Hexa Dashboard',
        emailService.getVerificationTemplate(verificationLink)
      );

      res.status(201).json({ 
        token, 
        refreshToken,
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

      // Revoke old refresh tokens? Optional policy. For now, just add new one.
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      res.json({ 
        token, 
        refreshToken,
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
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      const savedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }

      // Verify signature
      try {
        jwt.verify(refreshToken, REFRESH_SECRET);
      } catch (err) {
        res.status(401).json({ message: 'Invalid token signature' });
        return;
      }

      // Rotate token
      const newToken = jwt.sign({ id: savedToken.userId, role: savedToken.user.role }, JWT_SECRET, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign({ id: savedToken.userId }, REFRESH_SECRET, { expiresIn: '7d' });

      // Revoke old, create new
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: savedToken.id },
          data: { revoked: true }
        }),
        prisma.refreshToken.create({
          data: {
            token: newRefreshToken,
            userId: savedToken.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })
      ]);

      res.json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Error refreshing token' });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
        return;
      }

      const token = crypto.randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      await emailService.sendEmail(
        user.email,
        'Redefinição de Senha - Hexa Dashboard',
        emailService.getPasswordResetTemplate(resetLink)
      );

      res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error processing forgot password' });
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

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.delete({
          where: { id: resetToken.id }
        })
      ]);

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = verifyEmailSchema.parse(req.body);

      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token }
      });

      if (!verificationToken || verificationToken.expiresAt < new Date()) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: verificationToken.userId },
          data: { emailVerified: new Date() }
        }),
        prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id }
        })
      ]);

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        return;
      }
      console.error('Verify email error:', error);
      res.status(500).json({ message: 'Error verifying email' });
    }
  },

  async me(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true }
      });
      if (!user) {
         res.status(404).json({ message: 'User not found' });
         return;
      }
      res.json(user);
    } catch (error) {
      console.error('Me endpoint error:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  }
};
