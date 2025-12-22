import { prisma } from '../prisma';

interface AdCampaignData {
  externalId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  spend: number;
  leads: number;
  revenue: number;
  impressions: number;
  clicks: number;
}

// Base class for all integrations
abstract class AdPlatform {
  abstract platformName: string;
  
  // Connect returns the access token (mocked)
  abstract connect(authCode: string): Promise<{ accessToken: string, refreshToken: string }>;
  
  // Fetch campaigns from the API
  abstract fetchCampaigns(accessToken: string): Promise<AdCampaignData[]>;
}

class FacebookAdsPlatform extends AdPlatform {
  platformName = 'FACEBOOK';

  async connect(authCode: string) {
    // In real life, exchange authCode for token via Graph API
    return {
      accessToken: `fb_access_${Math.random().toString(36).substring(7)}`,
      refreshToken: `fb_refresh_${Math.random().toString(36).substring(7)}`
    };
  }

  async fetchCampaigns(accessToken: string): Promise<AdCampaignData[]> {
    // Mock Facebook API Response
    return [
      {
        externalId: 'fb_cmp_123',
        name: 'Campanha Verão 2025 - FB',
        status: 'ACTIVE',
        spend: 1250.50,
        leads: 45,
        revenue: 4500.00,
        impressions: 15000,
        clicks: 850
      },
      {
        externalId: 'fb_cmp_456',
        name: 'Retargeting Black Friday',
        status: 'PAUSED',
        spend: 300.00,
        leads: 5,
        revenue: 0.00,
        impressions: 2000,
        clicks: 50
      }
    ];
  }
}

class GoogleAdsPlatform extends AdPlatform {
  platformName = 'GOOGLE';

  async connect(authCode: string) {
    return {
      accessToken: `google_access_${Math.random().toString(36).substring(7)}`,
      refreshToken: `google_refresh_${Math.random().toString(36).substring(7)}`
    };
  }

  async fetchCampaigns(accessToken: string): Promise<AdCampaignData[]> {
    return [
      {
        externalId: 'google_cmp_789',
        name: 'Search - Institucional',
        status: 'ACTIVE',
        spend: 890.20,
        leads: 32,
        revenue: 3200.00,
        impressions: 8000,
        clicks: 400
      }
    ];
  }
}

class TikTokAdsPlatform extends AdPlatform {
  platformName = 'TIKTOK';

  async connect(authCode: string) {
    return {
      accessToken: `tiktok_access_${Math.random().toString(36).substring(7)}`,
      refreshToken: `tiktok_refresh_${Math.random().toString(36).substring(7)}`
    };
  }

  async fetchCampaigns(accessToken: string): Promise<AdCampaignData[]> {
    return [
      {
        externalId: 'tt_cmp_101',
        name: 'Challenge Viral - TopView',
        status: 'ACTIVE',
        spend: 2500.00,
        leads: 150,
        revenue: 12000.00,
        impressions: 500000,
        clicks: 12000
      }
    ];
  }
}

// Factory
const platforms: Record<string, AdPlatform> = {
  FACEBOOK: new FacebookAdsPlatform(),
  GOOGLE: new GoogleAdsPlatform(),
  TIKTOK: new TikTokAdsPlatform(),
};

export const integrationService = {
  async connectPlatform(userId: string, platformName: string, authCode: string) {
    const platform = platforms[platformName];
    if (!platform) throw new Error('Platform not supported');

    const tokens = await platform.connect(authCode);

    // Save to DB
    const integration = await prisma.integration.create({
      data: {
        userId,
        platform: platformName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        status: 'CONNECTED',
        lastSync: new Date()
      }
    });

    // Initial Sync
    await this.syncCampaigns(integration.id);

    return integration;
  },

  async syncCampaigns(integrationId: string) {
    const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
    if (!integration || !integration.accessToken) return;

    const platform = platforms[integration.platform];
    if (!platform) return;

    const campaignsData = await platform.fetchCampaigns(integration.accessToken);

    for (const cmp of campaignsData) {
      // Upsert Campaign
      const campaign = await prisma.campaign.upsert({
        where: {
          integrationId_externalId: {
            integrationId: integration.id,
            externalId: cmp.externalId
          }
        },
        create: {
          integrationId: integration.id,
          externalId: cmp.externalId,
          name: cmp.name,
          status: cmp.status
        },
        update: {
          name: cmp.name,
          status: cmp.status,
          updatedAt: new Date()
        }
      });

      // Add Daily Metric (Today)
      // For demo, we just overwrite today's metric
      await prisma.dailyMetric.upsert({
        where: {
          campaignId_date: {
            campaignId: campaign.id,
            date: new Date(new Date().setHours(0,0,0,0))
          }
        },
        create: {
          campaignId: campaign.id,
          date: new Date(new Date().setHours(0,0,0,0)),
          spend: cmp.spend,
          leads: cmp.leads,
          revenue: cmp.revenue,
          impressions: cmp.impressions,
          clicks: cmp.clicks
        },
        update: {
          spend: cmp.spend,
          leads: cmp.leads,
          revenue: cmp.revenue,
          impressions: cmp.impressions,
          clicks: cmp.clicks
        }
      });
    }

    await prisma.integration.update({
      where: { id: integrationId },
      data: { lastSync: new Date() }
    });
  },

  async getDashboardMetrics(userId: string) {
    // Aggregate data for the user
    const integrations = await prisma.integration.findMany({
      where: { userId },
      include: {
        campaigns: {
          include: {
            metrics: true // In real app filter by date range
          }
        }
      }
    });

    let totalLeads = 0;
    let totalSpend = 0;
    let totalRevenue = 0;
    let campaignsCount = 0;

    integrations.forEach(int => {
      int.campaigns.forEach(cmp => {
        campaignsCount++;
        cmp.metrics.forEach(m => {
          totalLeads += m.leads;
          totalSpend += m.spend;
          totalRevenue += m.revenue;
        });
      });
    });

    return {
      totalLeads,
      totalSpend,
      totalRevenue,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
      activeIntegrations: integrations.filter(i => i.status === 'CONNECTED').length,
      campaignsCount
    };
  }
};
