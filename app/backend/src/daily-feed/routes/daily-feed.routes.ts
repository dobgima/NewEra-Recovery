import { Router } from 'express';
import { DailyFeedController } from '../controllers/daily-feed.controller';
import { asyncHandler } from '../../common/utils/async-handler';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new DailyFeedController();

router.get('/', authMiddleware, asyncHandler(controller.getAll.bind(controller)));
router.get('/today', authMiddleware, asyncHandler(controller.getToday.bind(controller)));
router.post('/', authMiddleware, asyncHandler(controller.create.bind(controller)));

export default router;