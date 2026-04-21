import { Router } from 'express';
import { CrisisPlanController } from '../controllers/crisis-plan.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new CrisisPlanController();

router.get('/mine', authMiddleware, asyncHandler(controller.getMine.bind(controller)));
router.post('/', authMiddleware, asyncHandler(controller.upsert.bind(controller)));
router.put('/', authMiddleware, asyncHandler(controller.upsert.bind(controller)));

export default router;