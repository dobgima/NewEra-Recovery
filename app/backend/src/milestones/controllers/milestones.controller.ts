import { Response } from 'express';
import { MilestonesService } from '../services/milestones.service';
import { createMilestoneSchema } from '../dto/create-milestone.dto';
import { AuthenticatedRequest } from '../../common/types/auth.types';

const milestonesService = new MilestonesService();

export class MilestonesController {
  async create(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const dto = createMilestoneSchema.parse(req.body);
    const milestone = await milestonesService.create(userId, dto);
    return res.status(201).json(milestone);
  }

  async getMine(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const milestones = await milestonesService.getMine(userId);
    return res.status(200).json(milestones);
  }

  async getSummary(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.sub;
    const summary = await milestonesService.getSummary(userId);
    return res.status(200).json(summary);
  }
}