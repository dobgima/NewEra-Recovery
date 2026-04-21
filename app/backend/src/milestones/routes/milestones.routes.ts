import { Router } from 'express';
import { MilestonesController } from '../controllers/milestones.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new MilestonesController();

router.post('/', authMiddleware, asyncHandler(controller.create.bind(controller)));
router.get('/mine', authMiddleware, asyncHandler(controller.getMine.bind(controller)));
router.get('/summary', authMiddleware, asyncHandler(controller.getSummary.bind(controller)));

export default router;