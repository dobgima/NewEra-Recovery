import { Router } from 'express';
import {
  createCheckInController,
  getMyCheckInsController,
} from '../controllers/checkins.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createCheckInController);
router.get('/mine', getMyCheckInsController);

export default router;