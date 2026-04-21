import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { asyncHandler } from '../../common/utils/async-handler';
import { PeerSupportController } from '../controllers/peer-support.controller';

const router = Router();
const controller = new PeerSupportController();

router.get('/peers', authMiddleware, asyncHandler(controller.getPeers.bind(controller)));
router.post('/requests', authMiddleware, asyncHandler(controller.createRequest.bind(controller)));
router.get('/requests/sent', authMiddleware, asyncHandler(controller.getSent.bind(controller)));
router.get('/requests/received', authMiddleware, asyncHandler(controller.getReceived.bind(controller)));
router.patch('/requests/:id', authMiddleware, asyncHandler(controller.updateRequest.bind(controller)));

export default router;