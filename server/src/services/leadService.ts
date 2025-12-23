import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const leadService = {
  async createLead(userId: string, data: any) {
    return prisma.lead.create({
      data: {
        ...data,
        userId
      }
    });
  },

  async getLeads(userId: string, filters: any = {}) {
    const { status, startDate, endDate } = filters;
    const where: any = { userId };
    
    if (status && status !== 'ALL') where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { interactions: true }
    });
  },

  async getStats(userId: string) {
    const [total, newLeads, contacted, converted] = await Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.lead.count({ where: { userId, status: 'NEW' } }),
      prisma.lead.count({ where: { userId, status: 'CONTACTED' } }),
      prisma.lead.count({ where: { userId, status: 'CONVERTED' } })
    ]);
    
    // Calculate conversion rate
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
    
    return { total, newLeads, contacted, converted, conversionRate };
  },
  
  async updateLeadStatus(id: string, userId: string, status: string) {
    return prisma.lead.update({
        where: { id, userId },
        data: { status }
    });
  }
};
