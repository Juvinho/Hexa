"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, vitest_1.describe)('Dashboard Endpoints', () => {
    let token;
    const testUser = {
        name: 'Dashboard User',
        email: `dash_${Date.now()}@example.com`,
        password: 'password123'
    };
    (0, vitest_1.beforeAll)(async () => {
        // Create user and get token
        const user = await prisma_1.prisma.user.create({
            data: {
                name: testUser.name,
                email: testUser.email,
                password: 'hashed_password_placeholder' // In real app use hash, but for mocking auth we just need user in DB
            }
        });
        token = jsonwebtoken_1.default.sign({ id: user.id, role: 'USER' }, process.env.JWT_SECRET || 'secret');
    });
    (0, vitest_1.afterAll)(async () => {
        // Manual cleanup due to potential SQLite cascade issues in test environment
        const user = await prisma_1.prisma.user.findUnique({ where: { email: testUser.email } });
        if (user) {
            const integrations = await prisma_1.prisma.integration.findMany({ where: { userId: user.id } });
            for (const integration of integrations) {
                const campaigns = await prisma_1.prisma.campaign.findMany({ where: { integrationId: integration.id } });
                for (const campaign of campaigns) {
                    await prisma_1.prisma.dailyMetric.deleteMany({ where: { campaignId: campaign.id } });
                }
                await prisma_1.prisma.campaign.deleteMany({ where: { integrationId: integration.id } });
            }
            await prisma_1.prisma.integration.deleteMany({ where: { userId: user.id } });
            await prisma_1.prisma.user.delete({ where: { id: user.id } });
        }
        await prisma_1.prisma.$disconnect();
    });
    (0, vitest_1.it)('should return 401 without token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/dashboard/metrics');
        (0, vitest_1.expect)(res.status).toBe(401); // Assuming 401 or 403 depending on middleware
    });
    (0, vitest_1.it)('should return metrics with valid token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/dashboard/metrics')
            .set('Authorization', `Bearer ${token}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('totalLeads');
        (0, vitest_1.expect)(res.body).toHaveProperty('roi');
    });
    (0, vitest_1.it)('should connect a platform', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/integrations/connect')
            .set('Authorization', `Bearer ${token}`)
            .send({
            platform: 'FACEBOOK',
            authCode: 'mock_code'
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('platform', 'FACEBOOK');
        (0, vitest_1.expect)(res.body).toHaveProperty('status', 'CONNECTED');
    });
});
//# sourceMappingURL=dashboard.test.js.map