import { Response } from 'express';
import { CrisisPlanService } from '../services/crisis-plan.service';
import { upsertCrisisPlanSchema } from '../dto/upsert-crisis-plan.dto';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

const crisisPlanService = new CrisisPlanService();

export class CrisisPlanController {
  async getMine(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const plan = await crisisPlanService.getMine(userId);
    return res.status(200).json(plan);
  }

  async upsert(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const dto = upsertCrisisPlanSchema.parse(req.body);
    const plan = await crisisPlanService.upsert(userId, dto);
    return res.status(200).json(plan);
  }
}