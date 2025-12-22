"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/prisma");
(0, vitest_1.describe)('Auth Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'Password123!'
    };
    (0, vitest_1.afterAll)(async () => {
        await prisma_1.prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma_1.prisma.$disconnect();
    });
    (0, vitest_1.it)('should register a new user', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(testUser);
        if (res.status !== 201) {
            console.log('Register Error:', JSON.stringify(res.body, null, 2));
        }
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toHaveProperty('token');
        (0, vitest_1.expect)(res.body.user).toHaveProperty('email', testUser.email);
    });
    (0, vitest_1.it)('should login with valid credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: testUser.password
        });
        if (res.status !== 200) {
            console.log('Login Error:', JSON.stringify(res.body, null, 2));
        }
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('token');
    });
    (0, vitest_1.it)('should not login with invalid credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: 'wrongpassword'
        });
        (0, vitest_1.expect)(res.status).toBe(401);
    });
});
//# sourceMappingURL=auth.test.js.map