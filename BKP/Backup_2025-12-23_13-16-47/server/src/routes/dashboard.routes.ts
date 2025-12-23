import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Real-time dashboard and integration management
 */

/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics including total leads, spending, revenue, and active campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLeads:
 *                   type: integer
 *                 totalSpending:
 *                   type: number
 *                 totalRevenue:
 *                   type: number
 *                 activeCampaigns:
 *                   type: integer
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 */
router.get('/dashboard/metrics', authenticateToken, dashboardController.getMetrics);

/**
 * @swagger
 * /dashboard/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get('/dashboard/campaigns', authenticateToken, dashboardController.getCampaigns);

/**
 * @swagger
 * /dashboard/leads:
 *   get:
 *     summary: Get leads data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of daily lead metrics
 */
router.get('/dashboard/leads', authenticateToken, dashboardController.getLeadsData);

/**
 * @swagger
 * /integrations:
 *   get:
 *     summary: Get connected integrations
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of integrations and their connection status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   provider:
 *                     type: string
 *                   status:
 *                     type: string
 *                   lastSync:
 *                     type: string
 *                     format: date-time
 */
router.get('/integrations', authenticateToken, dashboardController.getIntegrations);

/**
 * @swagger
 * /integrations/connect:
 *   post:
 *     summary: Connect a new integration
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - apiKey
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The integration provider (e.g., facebook, google)
 *               apiKey:
 *                 type: string
 *                 description: API Key or Access Token for the provider
 *     responses:
 *       200:
 *         description: Integration connected successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/integrations/connect', authenticateToken, dashboardController.connectIntegration);

/**
 * @swagger
 * /integrations/{platform}:
 *   delete:
 *     summary: Disconnect an integration
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *         description: The platform to disconnect (e.g., FACEBOOK, GOOGLE)
 *     responses:
 *       200:
 *         description: Integration disconnected successfully
 *       500:
 *         description: Server error
 */
router.delete('/integrations/:platform', authenticateToken, dashboardController.disconnectIntegration);

export default router;
