import { Response } from 'express';
import { RecoveryPlanService } from '../services/recovery-plan.service';
import { upsertRecoveryPlanSchema } from '../dto/upsert-recovery-plan.dto';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

const recoveryPlanService = new RecoveryPlanService();

export class RecoveryPlanController {
  async getMine(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const plan = await recoveryPlanService.getMine(userId);
    return res.status(200).json(plan);
  }

  async upsert(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const dto = upsertRecoveryPlanSchema.parse(req.body);
    const plan = await recoveryPlanService.upsert(userId, dto);
    return res.status(200).json(plan);
  }
}