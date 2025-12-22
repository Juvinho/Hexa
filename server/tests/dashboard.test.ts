import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';
import jwt from 'jsonwebtoken';

describe('Dashboard Endpoints', () => {
  let token: string;
  const testUser = {
    name: 'Dashboard User',
    email: `dash_${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeAll(async () => {
    // Create user and get token
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password: 'hashed_password_placeholder' // In real app use hash, but for mocking auth we just need user in DB
      }
    });
    token = jwt.sign({ id: user.id, role: 'USER' }, process.env.JWT_SECRET || 'secret');
  });

  afterAll(async () => {
    // Manual cleanup due to potential SQLite cascade issues in test environment
    const user = await prisma.user.findUnique({ where: { email: testUser.email } });
    if (user) {
      const integrations = await prisma.integration.findMany({ where: { userId: user.id } });
      for (const integration of integrations) {
        const campaigns = await prisma.campaign.findMany({ where: { integrationId: integration.id } });
        for (const campaign of campaigns) {
          await prisma.dailyMetric.deleteMany({ where: { campaignId: campaign.id } });
        }
        await prisma.campaign.deleteMany({ where: { integrationId: integration.id } });
      }
      await prisma.integration.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/dashboard/metrics');
    expect(res.status).toBe(401); // Assuming 401 or 403 depending on middleware
  });

  it('should return metrics with valid token', async () => {
    const res = await request(app)
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalLeads');
    expect(res.body).toHaveProperty('roi');
  });

  it('should connect a platform', async () => {
    const res = await request(app)
      .post('/api/integrations/connect')
      .set('Authorization', `Bearer ${token}`)
      .send({
        platform: 'FACEBOOK',
        authCode: 'mock_code'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('platform', 'FACEBOOK');
    expect(res.body).toHaveProperty('status', 'CONNECTED');
  });
});
