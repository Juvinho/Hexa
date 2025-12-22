"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function main() {
    const email = 'test@hexa.com';
    const password = 'password123';
    const name = 'Test User';
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // 1. Create User
    const user = await prisma_1.prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name,
            role: 'ADMIN'
        },
        create: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN'
        },
    });
    console.log(`User ${user.email} created/updated.`);
    // 2. Create Integrations
    const platforms = ['FACEBOOK', 'GOOGLE', 'TIKTOK', 'INSTAGRAM', 'YOUTUBE'];
    for (const platform of platforms) {
        // Check if integration exists, if not create it
        // Since we don't have unique constraint on userId+platform in schema (maybe we should?), we'll just create if not exists
        // For simplicity in seed, let's delete existing integrations for this user first
        await prisma_1.prisma.integration.deleteMany({ where: { userId: user.id, platform } });
        const integration = await prisma_1.prisma.integration.create({
            data: {
                userId: user.id,
                platform: platform,
                status: 'CONNECTED',
                accessToken: `mock_${platform}_token`,
                lastSync: new Date()
            }
        });
        // 3. Create Campaigns for this integration
        const campaigns = [
            { name: `Summer Sale 2025 - ${platform}`, status: 'ACTIVE' },
            { name: `Retargeting - ${platform}`, status: 'ACTIVE' },
            { name: `Brand Awareness - ${platform}`, status: 'PAUSED' }
        ];
        for (const camp of campaigns) {
            const externalId = `ext_${platform}_${Math.random().toString(36).substr(2, 9)}`;
            const campaign = await prisma_1.prisma.campaign.create({
                data: {
                    integrationId: integration.id,
                    externalId: externalId,
                    name: camp.name,
                    status: camp.status
                }
            });
            // 4. Create Daily Metrics for this campaign
            // Create metrics for the last 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                const spend = Math.floor(Math.random() * 500) + 50;
                const impressions = Math.floor(spend * (Math.random() * 20 + 10));
                const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01));
                const leads = Math.floor(clicks * (Math.random() * 0.1 + 0.01));
                const revenue = leads * (Math.random() * 100 + 50);
                await prisma_1.prisma.dailyMetric.create({
                    data: {
                        campaignId: campaign.id,
                        date: date,
                        spend,
                        impressions,
                        clicks,
                        leads,
                        revenue
                    }
                });
            }
        }
    }
    console.log(`
✅ Test User & Sample Data Created!
-----------------------------
Email:    ${email}
Password: ${password}
Name:     ${name}
Role:     ${user.role}
Integrations & Campaigns seeded.
-----------------------------
You can now login with these credentials.
  `);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=createTestUser.js.map