import { prisma } from '../prisma';
import { encryption } from '../utils/encryption';

// Simulating External APIs
const StripeApi = {
  createCustomer: async (email: string, userId: string) => {
    // Mock Stripe call
    return { id: `cus_${Math.random().toString(36).substr(2, 9)}`, status: 'active' };
  }
};

const OpenAIApi = {
  generateKey: async () => {
    // Mock OpenAI Key generation
    return `sk-${Math.random().toString(36).substr(2, 20)}`;
  }
};

const GoogleAdsApi = {
  initiateLink: async () => {
    // Mock Google Ads link
    return { linkUrl: 'https://ads.google.com/aw/link', pendingId: Math.random().toString() };
  }
};

export const onboardingService = {
  /**
   * Triggers the automated onboarding flow (Webhook simulation)
   */
  async startOnboarding(userId: string, email: string) {
    console.log(`[Onboarding] Starting process for user ${userId}`);

    // 1. Initialize Status
    await prisma.onboardingStatus.create({
      data: { userId }
    });

    // 2. Execute Async Tasks (Simulating Queue)
    // In production, this would be: await queue.add('onboarding', { userId, email });
    this.processQueue(userId, email).catch(err => {
      console.error('[Onboarding] Queue Error:', err);
    });
  },

  /**
   * The "Worker" function that processes the steps
   */
  async processQueue(userId: string, email: string) {
    try {
      // Step 1: Stripe Integration
      console.log('[Onboarding] Processing Stripe...');
      await prisma.onboardingStatus.update({ where: { userId }, data: { stripe: 'PROCESSING' } });
      const stripeCustomer = await StripeApi.createCustomer(email, userId);
      
      // Save Stripe Integration (Encrypted)
      const { encryptedData, iv } = encryption.encrypt(stripeCustomer.id);
      await prisma.integration.create({
        data: {
          userId,
          platform: 'STRIPE',
          encryptedKey: encryptedData,
          iv: iv,
          status: 'CONNECTED',
          lastSync: new Date()
        }
      });
      
      await prisma.onboardingStatus.update({ where: { userId }, data: { stripe: 'COMPLETED' } });
      console.log('[Onboarding] Stripe Completed.');

      // Step 2: OpenAI Integration
      console.log('[Onboarding] Processing OpenAI...');
      await prisma.onboardingStatus.update({ where: { userId }, data: { openai: 'PROCESSING' } });
      const openAiKey = await OpenAIApi.generateKey();
      
      // Save OpenAI Key (Encrypted)
      const encOpenAi = encryption.encrypt(openAiKey);
      await prisma.integration.create({
        data: {
          userId,
          platform: 'OPENAI',
          encryptedKey: encOpenAi.encryptedData,
          iv: encOpenAi.iv,
          status: 'CONNECTED',
          lastSync: new Date()
        }
      });

      await prisma.onboardingStatus.update({ where: { userId }, data: { openai: 'COMPLETED' } });
      console.log('[Onboarding] OpenAI Completed.');

      // Step 3: Google Ads (Mock)
      console.log('[Onboarding] Processing Google Ads...');
      await prisma.onboardingStatus.update({ where: { userId }, data: { googleAds: 'PROCESSING' } });
      await GoogleAdsApi.initiateLink();
      
      // Google Ads requires manual approval usually, so we set to PENDING
      await prisma.integration.create({
        data: {
          userId,
          platform: 'GOOGLE_ADS',
          status: 'PENDING',
          lastSync: new Date()
        }
      });
      
      await prisma.onboardingStatus.update({ where: { userId }, data: { googleAds: 'COMPLETED', completed: true } });
      console.log('[Onboarding] All steps completed successfully.');

      // TODO: Send Email Notification via SES (Mock)
      
    } catch (error) {
      console.error('[Onboarding] Process Failed:', error);
      // Mark as failed
      await prisma.onboardingStatus.update({ where: { userId }, data: { completed: false } });
    }
  },

  async getStatus(userId: string) {
    return prisma.onboardingStatus.findUnique({
      where: { userId }
    });
  }
};
