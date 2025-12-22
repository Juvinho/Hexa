"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/prisma");
(0, vitest_1.describe)('Auth Extended Flows', () => {
    const testUser = {
        name: 'Flow User',
        email: `flow_${Date.now()}@example.com`,
        password: 'Password123!'
    };
    let userId;
    (0, vitest_1.beforeAll)(async () => {
        // Clean up
        await prisma_1.prisma.user.deleteMany({ where: { email: testUser.email } });
    });
    (0, vitest_1.afterAll)(async () => {
        await prisma_1.prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma_1.prisma.$disconnect();
    });
    (0, vitest_1.it)('should register a new user and create email verification token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(testUser);
        (0, vitest_1.expect)(res.status).toBe(201);
        userId = res.body.user.id;
        // Check if verification token exists in DB
        const token = await prisma_1.prisma.emailVerificationToken.findFirst({
            where: { userId }
        });
        (0, vitest_1.expect)(token).toBeDefined();
    });
    (0, vitest_1.it)('should verify email', async () => {
        const token = await prisma_1.prisma.emailVerificationToken.findFirst({
            where: { userId }
        });
        (0, vitest_1.expect)(token).toBeDefined();
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/verify-email')
            .send({ token: token.token });
        (0, vitest_1.expect)(res.status).toBe(200);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        (0, vitest_1.expect)(user?.emailVerified).not.toBeNull();
    });
    (0, vitest_1.it)('should request password reset', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/forgot-password')
            .send({ email: testUser.email });
        if (res.status !== 200) {
            console.error('Forgot password failed:', res.body);
        }
        (0, vitest_1.expect)(res.status).toBe(200);
        const token = await prisma_1.prisma.passwordResetToken.findFirst({
            where: { userId }
        });
        (0, vitest_1.expect)(token).toBeDefined();
    });
    (0, vitest_1.it)('should reset password', async () => {
        const token = await prisma_1.prisma.passwordResetToken.findFirst({
            where: { userId }
        });
        const newPassword = 'NewPassword123!';
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/reset-password')
            .send({
            token: token.token,
            password: newPassword
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        // Verify new password works
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: newPassword
        });
        (0, vitest_1.expect)(loginRes.status).toBe(200);
    });
});
//# sourceMappingURL=authFlows.test.js.map