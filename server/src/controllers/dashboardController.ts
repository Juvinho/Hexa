import { Request as ExpressRequest, Response } from 'express';
import { integrationService } from '../services/integrationService';
import { prisma } from '../prisma';

export const dashboardController = {
  async getMetrics(req: ExpressRequest, res: Response) {
    try {
      if (!req.user) {
         res.sendStatus(401);
         return;
      }
      const metrics = await integrationService.getDashboardMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching metrics' });
    }
  },

  async getIntegrations(req: ExpressRequest, res: Response) {
    try {
      if (!req.user) {
        res.sendStatus(401);
        return;
      }
      const integrations = await prisma.integration.findMany({
        where: { userId: req.user.id },
        select: { id: true, platform: true, status: true, lastSync: true }
      });
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching integrations' });
    }
  },

  async connectIntegration(req: ExpressRequest, res: Response) {
    try {
      if (!req.user) {
        res.sendStatus(401);
        return;
      }
      const { platform, authCode } = req.body;
      const integration = await integrationService.connectPlatform(req.user.id, platform, authCode);
      res.json(integration);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error connecting platform' });
    }
  },

  async getCampaigns(req: ExpressRequest, res: Response) {
    try {
      if (!req.user) {
        res.sendStatus(401);
        return;
      }
      
      const campaigns = await prisma.campaign.findMany({
        where: {
          integration: {
            userId: req.user.id
          }
        },
        include: {
          integration: {
            select: { platform: true }
          },
          metrics: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      });
      
      // Transform data for frontend
      const formattedCampaigns = campaigns.map(c => {
        const latestMetric = c.metrics[0] || { spend: 0, leads: 0, revenue: 0, impressions: 0, clicks: 0 };
        const roi = latestMetric.spend > 0 ? ((latestMetric.revenue - latestMetric.spend) / latestMetric.spend) * 100 : 0;
        
        return {
          id: c.id,
          name: c.name,
          platform: c.integration.platform,
          status: c.status,
          spend: latestMetric.spend,
          leads: latestMetric.leads,
          revenue: latestMetric.revenue,
          roi: roi,
          clicks: latestMetric.clicks,
          impressions: latestMetric.impressions
        };
      });

      res.json(formattedCampaigns);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  },

  async getLeadsData(req: ExpressRequest, res: Response) {
    try {
      if (!req.user) {
        res.sendStatus(401);
        return;
      }

      // Fetch daily metrics focused on leads
      const metrics = await prisma.dailyMetric.findMany({
        where: {
          campaign: {
            integration: {
              userId: req.user.id
            }
          }
        },
        include: {
          campaign: {
            select: {
              name: true,
              integration: {
                select: { platform: true }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 100 // Limit to recent 100 entries for now
      });

      const formattedLeads = metrics.map(m => ({
        id: m.id,
        date: m.date,
        campaignName: m.campaign.name,
        platform: m.campaign.integration.platform,
        leads: m.leads,
        costPerLead: m.leads > 0 ? m.spend / m.leads : 0,
        spend: m.spend
      }));

      res.json(formattedLeads);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching leads data' });
    }
  }
};
