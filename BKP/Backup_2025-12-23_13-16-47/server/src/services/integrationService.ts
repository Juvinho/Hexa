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
    // Return the provided API Key/Token as the accessToken
    return {
      accessToken: authCode,
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
      accessToken: authCode,
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
      accessToken: authCode,
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

class InstagramAdsPlatform extends AdPlatform {
  platformName = 'INSTAGRAM';

  async connect(authCode: string) {
    return {
      accessToken: authCode,
      refreshToken: `insta_refresh_${Math.random().toString(36).substring(7)}`
    };
  }

  async fetchCampaigns(accessToken: string): Promise<AdCampaignData[]> {
    return [
      {
        externalId: 'ig_cmp_202',
        name: 'Stories - Verão Lifestyle',
        status: 'ACTIVE',
        spend: 850.75,
        leads: 62,
        revenue: 3100.00,
        impressions: 45000,
        clicks: 1200
      },
      {
        externalId: 'ig_cmp_203',
        name: 'Reels - Influencer Parceria',
        status: 'ACTIVE',
        spend: 1200.00,
        leads: 95,
        revenue: 5500.00,
        impressions: 120000,
        clicks: 3500
      }
    ];
  }
}

class YouTubeAdsPlatform extends AdPlatform {
  platformName = 'YOUTUBE';

  async connect(authCode: string) {
    return {
      accessToken: authCode,
      refreshToken: `yt_refresh_${Math.random().toString(36).substring(7)}`
    };
  }

  async fetchCampaigns(accessToken: string): Promise<AdCampaignData[]> {
    return [
      {
        externalId: 'yt_cmp_303',
        name: 'Pre-roll - Brand Awareness',
        status: 'ACTIVE',
        spend: 540.00,
        leads: 15,
        revenue: 0.00,
        impressions: 25000,
        clicks: 300
      },
      {
        externalId: 'yt_cmp_304',
        name: 'Bumper Ads - Promo',
        status: 'PAUSED',
        spend: 150.00,
        leads: 5,
        revenue: 400.00,
        impressions: 15000,
        clicks: 120
      }
    ];
  }
}

// Factory
const platforms: Record<string, AdPlatform> = {
  FACEBOOK: new FacebookAdsPlatform(),
  GOOGLE: new GoogleAdsPlatform(),
  TIKTOK: new TikTokAdsPlatform(),
  INSTAGRAM: new InstagramAdsPlatform(),
  YOUTUBE: new YouTubeAdsPlatform(),
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
    console.log(`[Sync] Starting sync for integration ${integrationId}...`);
    const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
    if (!integration || !integration.accessToken) {
        console.log(`[Sync] Integration ${integrationId} not found or missing token.`);
        return null;
    }

    const platform = platforms[integration.platform];
    if (!platform) {
        console.log(`[Sync] Platform ${integration.platform} not supported.`);
        return null;
    }

    let campaignsData: AdCampaignData[] = [];
    try {
        campaignsData = await platform.fetchCampaigns(integration.accessToken);
    } catch (error) {
        console.error(`[Sync] Error fetching campaigns for ${integration.platform}:`, error);
        return null;
    }

    if (!campaignsData || campaignsData.length === 0) {
        console.log(`[Sync] No data received from ${integration.platform}.`);
        return { newLeads: 0, newRevenue: 0 };
    }

    let totalNewLeads = 0;
    let totalNewRevenue = 0;

    for (const cmp of campaignsData) {
      // Find existing metric to calculate delta
      const existingCampaign = await prisma.campaign.findUnique({
        where: {
            integrationId_externalId: {
                integrationId: integration.id,
                externalId: cmp.externalId
            }
        },
        include: {
            metrics: {
                where: {
                    date: new Date(new Date().setHours(0,0,0,0))
                }
            }
        }
      });

      const previousLeads = existingCampaign?.metrics[0]?.leads || 0;
      const previousRevenue = existingCampaign?.metrics[0]?.revenue || 0;

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

      // Calculate Deltas
      if (cmp.leads > previousLeads) {
          totalNewLeads += (cmp.leads - previousLeads);
      }
      if (cmp.revenue > previousRevenue) {
          totalNewRevenue += (cmp.revenue - previousRevenue);
      }
    }

    await prisma.integration.update({
      where: { id: integrationId },
      data: { lastSync: new Date() }
    });

    console.log(`[Sync] Completed for ${integration.platform}. New Leads: ${totalNewLeads}, New Revenue: ${totalNewRevenue}`);
    return { newLeads: totalNewLeads, newRevenue: totalNewRevenue };
  },

  async syncAllActiveIntegrations() {
      console.log('[SyncManager] Checking for active integrations...');
      const activeIntegrations = await prisma.integration.findMany({
          where: { status: 'CONNECTED' }
      });

      if (activeIntegrations.length === 0) {
          console.log('[SyncManager] No active integrations found. Skipping sync.');
          return null;
      }

      let aggregatedLeads = 0;
      let aggregatedRevenue = 0;

      for (const integration of activeIntegrations) {
          const result = await this.syncCampaigns(integration.id);
          if (result) {
              aggregatedLeads += result.newLeads;
              aggregatedRevenue += result.newRevenue;
          }
      }

      return {
          leads: aggregatedLeads,
          revenue: aggregatedRevenue,
          timestamp: new Date().toISOString()
      };
  },

  async getDashboardMetrics(userId: string) {
    // 1. Get All Time Totals (Existing Logic)
    const integrations = await prisma.integration.findMany({
      where: { userId },
      include: {
        campaigns: {
          include: {
            metrics: true 
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

    // 2. Calculate Trends (Today vs Yesterday AND Today vs 2-Day Avg)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    const [todayMetrics, yesterdayMetrics, dayBeforeYesterdayMetrics] = await Promise.all([
        prisma.dailyMetric.aggregate({
            where: {
                date: today,
                campaign: { integration: { userId } }
            },
            _sum: { leads: true, spend: true, revenue: true }
        }),
        prisma.dailyMetric.aggregate({
            where: {
                date: yesterday,
                campaign: { integration: { userId } }
            },
            _sum: { leads: true, spend: true, revenue: true }
        }),
        prisma.dailyMetric.aggregate({
            where: {
                date: dayBeforeYesterday,
                campaign: { integration: { userId } }
            },
            _sum: { leads: true, spend: true, revenue: true }
        })
    ]);

    const calcTrend = (current: number, previous: number) => {
        if (!previous || previous === 0) return null;
        return ((current - previous) / previous) * 100;
    };

    const calcAvg = (val1: number, val2: number) => (val1 + val2) / 2;

    const calcRoi = (rev: number, spd: number) => (spd > 0 ? ((rev - spd) / spd) * 100 : 0);
    const todayRoi = calcRoi(todayMetrics._sum.revenue || 0, todayMetrics._sum.spend || 0);
    const yesterdayRoi = calcRoi(yesterdayMetrics._sum.revenue || 0, yesterdayMetrics._sum.spend || 0);
    const dayBeforeYesterdayRoi = calcRoi(dayBeforeYesterdayMetrics._sum.revenue || 0, dayBeforeYesterdayMetrics._sum.spend || 0);

    // Standard Trends (vs Yesterday)
    const trends = {
        leads: calcTrend(todayMetrics._sum.leads || 0, yesterdayMetrics._sum.leads || 0),
        spend: calcTrend(todayMetrics._sum.spend || 0, yesterdayMetrics._sum.spend || 0),
        revenue: calcTrend(todayMetrics._sum.revenue || 0, yesterdayMetrics._sum.revenue || 0),
        roi: calcTrend(todayRoi, yesterdayRoi)
    };

    // Advanced Trends (vs 2-Day Average)
    const avgLeads = calcAvg(yesterdayMetrics._sum.leads || 0, dayBeforeYesterdayMetrics._sum.leads || 0);
    const avgSpend = calcAvg(yesterdayMetrics._sum.spend || 0, dayBeforeYesterdayMetrics._sum.spend || 0);
    const avgRevenue = calcAvg(yesterdayMetrics._sum.revenue || 0, dayBeforeYesterdayMetrics._sum.revenue || 0);
    const avgRoi = calcAvg(yesterdayRoi, dayBeforeYesterdayRoi);

    const trendsVsAvg = {
        leads: calcTrend(todayMetrics._sum.leads || 0, avgLeads),
        spend: calcTrend(todayMetrics._sum.spend || 0, avgSpend),
        revenue: calcTrend(todayMetrics._sum.revenue || 0, avgRevenue),
        roi: calcTrend(todayRoi, avgRoi)
    };

    return {
      totalLeads,
      totalSpend,
      totalRevenue,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
      activeIntegrations: integrations.filter(i => i.status === 'CONNECTED').length,
      campaignsCount,
      trends,
      trendsVsAvg
    };
  }
};
