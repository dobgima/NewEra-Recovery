import { Router } from 'express';
import { getMeController, updateMeController } from '../controllers/users.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/me', getMeController);
router.patch('/me', updateMeController);

export default router;