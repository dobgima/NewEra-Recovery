import { Router } from 'express';
import {
  getSupportContactsController,
  createSupportContactController,
  updateSupportContactController,
  deleteSupportContactController,
} from '../controllers/support-contacts.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getSupportContactsController);
router.post('/', createSupportContactController);
router.patch('/:id', updateSupportContactController);
router.delete('/:id', deleteSupportContactController);

export default router;