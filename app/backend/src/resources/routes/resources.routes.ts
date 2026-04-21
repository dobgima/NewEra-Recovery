import { Router } from 'express';
import { ResourcesController } from '../controllers/resources.controller';
import { asyncHandler } from '../../common/utils/async-handler';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new ResourcesController();

router.get('/', authMiddleware, asyncHandler(controller.getAll.bind(controller)));
router.get('/featured', authMiddleware, asyncHandler(controller.getFeatured.bind(controller)));
router.get('/tag/:tag', authMiddleware, asyncHandler(controller.getByTag.bind(controller)));
router.post('/', authMiddleware, asyncHandler(controller.create.bind(controller)));

export default router;