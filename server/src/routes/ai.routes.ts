import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect AI routes
router.use(authenticateToken);
router.use(apiLimiter);

/**
 * @swagger
 * /ai/insights:
 *   post:
 *     summary: Get AI-powered insights based on metrics
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metrics:
 *                 type: object
 *     responses:
 *       200:
 *         description: List of insights
 *       503:
 *         description: AI service unavailable
 */
router.post('/insights', aiController.getInsights);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', aiController.chat);

export default router;
