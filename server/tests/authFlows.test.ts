import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';

describe('Auth Extended Flows', () => {
  const testUser = {
    name: 'Flow User',
    email: `flow_${Date.now()}@example.com`,
    password: 'Password123!'
  };
  let userId: string;

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('should register a new user and create email verification token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(res.status).toBe(201);
    userId = res.body.user.id;

    // Check if verification token exists in DB
    const token = await prisma.emailVerificationToken.findFirst({
      where: { userId }
    });
    expect(token).toBeDefined();
  });

  it('should verify email', async () => {
    const token = await prisma.emailVerificationToken.findFirst({
      where: { userId }
    });
    expect(token).toBeDefined();

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: token!.token });

    expect(res.status).toBe(200);
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.emailVerified).not.toBeNull();
  });

  it('should request password reset', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });

    if (res.status !== 200) {
      console.error('Forgot password failed:', res.body);
    }
    expect(res.status).toBe(200);

    const token = await prisma.passwordResetToken.findFirst({
      where: { userId }
    });
    expect(token).toBeDefined();
  });

  it('should reset password', async () => {
    const token = await prisma.passwordResetToken.findFirst({
      where: { userId }
    });
    const newPassword = 'NewPassword123!';

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: token!.token,
        password: newPassword
      });

    expect(res.status).toBe(200);

    // Verify new password works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: newPassword
      });

    expect(loginRes.status).toBe(200);
  });
});
