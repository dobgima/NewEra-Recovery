import { Router } from 'express';
import { assessRiskController } from '../controllers/risk-engine.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.post('/assess', authMiddleware, assessRiskController);

export default router;