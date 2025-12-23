
import { PrismaClient } from '@prisma/client';
import { integrationService } from '../src/services/integrationService';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Starting Sync Tests ===');

  // 1. Setup Test User
  console.log('1. Setting up test user...');
  const testEmail = 'sync_test@hexa.com';
  let user = await prisma.user.findUnique({ where: { email: testEmail } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Sync Test User',
        password: 'password123',
        role: 'USER'
      }
    });
  }

  // Clean up existing integrations
  await prisma.integration.deleteMany({ where: { userId: user.id } });
  console.log('   User setup complete and integrations cleared.');

  // 2. Test Scenario: No Connection
  console.log('\n2. Testing Scenario: No Integrations Connected');
  const resultNoConnection = await integrationService.syncAllActiveIntegrations();
  if (resultNoConnection === null) {
      console.log('   ✅ PASS: Returns null when no integrations active.');
  } else {
      console.error('   ❌ FAIL: Should return null, got:', resultNoConnection);
  }

  // 3. Test Scenario: Connected (First Sync)
  console.log('\n3. Testing Scenario: Integration Connected (First Sync)');
  // Create a mock integration manually to avoid calling external APIs
  const integration = await prisma.integration.create({
      data: {
          userId: user.id,
          platform: 'FACEBOOK',
          accessToken: 'mock_token_test',
          refreshToken: 'mock_refresh_test',
          status: 'CONNECTED',
          lastSync: new Date()
      }
  });

  const resultFirstSync = await integrationService.syncAllActiveIntegrations();
  // Note: Our mock FacebookAdsPlatform returns hardcoded 45 leads + 5 leads = 50 leads total.
  // Since it's the first sync for this campaign entry (or upsert), delta might be calculated against 0 if it didn't exist, 
  // OR if the implementation checks previous value before update.
  
  // Let's check logic:
  // implementation does: fetch campaigns -> find existing -> calc delta -> upsert
  // Since we just created the integration, no campaigns exist yet.
  // existingCampaign will be null. previousLeads = 0.
  // mock returns 45 leads. Delta = 45.
  
  if (resultFirstSync && resultFirstSync.leads > 0) {
      console.log(`   ✅ PASS: Detected new leads on first sync (Leads: ${resultFirstSync.leads}).`);
  } else {
      console.error('   ❌ FAIL: Should detect leads on first sync, got:', resultFirstSync);
  }

  // 4. Test Scenario: Connected (No New Data)
  console.log('\n4. Testing Scenario: Integration Connected (No New Data)');
  // Run sync again immediately. Mock returns same data.
  // existingCampaign should now exist. previousLeads = 45.
  // mock returns 45. Delta = 0.
  
  const resultSecondSync = await integrationService.syncAllActiveIntegrations();
  
  if (resultSecondSync && resultSecondSync.leads === 0) {
      console.log('   ✅ PASS: Leads count did not increase when data is unchanged.');
  } else {
      console.error(`   ❌ FAIL: Should be 0 leads, got: ${resultSecondSync?.leads}`);
  }

  // Cleanup
  console.log('\nCleaning up...');
  await prisma.integration.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log('Tests Finished.');
}

runTests()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
