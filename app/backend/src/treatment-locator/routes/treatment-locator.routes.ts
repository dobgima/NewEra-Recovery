import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { asyncHandler } from '../../common/utils/async-handler';
import { TreatmentLocatorController } from '../controllers/treatment-locator.controller';

const router = Router();
const controller = new TreatmentLocatorController();

router.get('/search', authMiddleware, asyncHandler(controller.search.bind(controller)));
router.get('/:id', authMiddleware, asyncHandler(controller.getById.bind(controller)));
router.post('/', authMiddleware, asyncHandler(controller.create.bind(controller)));

export default router;