import { prisma } from '../prisma';

interface LogRequestData {
  apiEndpoint: string;
  method: string;
  userId: string;
  status: number;
  duration: number;
  size: number;
  ip: string;
}

export const trafficService = {
  /**
   * Logs a traffic request to the database.
   * Creates the API entry if it doesn't exist.
   */
  async logRequest(data: LogRequestData) {
    // Ensure API exists
    const api = await prisma.api.upsert({
      where: { endpoint: data.apiEndpoint },
      update: {},
      create: {
        endpoint: data.apiEndpoint,
        method: data.method,
        status: 'ACTIVE'
      }
    });

    // Log the metric
    return prisma.trafficMetric.create({
      data: {
        apiId: api.id,
        userId: data.userId,
        status: data.status,
        duration: data.duration,
        size: data.size,
        ip: data.ip
      }
    });
  },

  /**
   * Checks if an API request is within the rate limit.
   * Returns true if allowed, false if limit exceeded.
   */
  async checkRateLimit(endpoint: string): Promise<boolean> {
    const api = await prisma.api.findUnique({
      where: { endpoint }
    });

    if (!api || api.status !== 'ACTIVE') return true; // Fail open or closed? Let's say open if not found, but usually we'd want strict.

    const limit = api.rateLimit;
    const windowMs = 60 * 1000; // 1 minute window

    const recentRequests = await prisma.trafficMetric.count({
      where: {
        apiId: api.id,
        timestamp: {
          gte: new Date(Date.now() - windowMs)
        }
      }
    });

    return recentRequests < limit;
  },

  /**
   * Retrieves aggregated traffic stats for a user or global.
   */
  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const totalRequests = await prisma.trafficMetric.count({ where });
    
    // Group by status
    const statusDistribution = await prisma.trafficMetric.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    // Average duration
    const avgDuration = await prisma.trafficMetric.aggregate({
      where,
      _avg: { duration: true }
    });

    return {
      totalRequests,
      statusDistribution,
      avgDuration: avgDuration._avg.duration || 0
    };
  }
};
