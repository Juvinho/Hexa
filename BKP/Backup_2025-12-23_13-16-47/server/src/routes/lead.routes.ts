import { Router } from 'express';
import { leadController } from '../controllers/leadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', leadController.create);
router.get('/', leadController.getAll);
router.patch('/:id/status', leadController.updateStatus);

export default router;
