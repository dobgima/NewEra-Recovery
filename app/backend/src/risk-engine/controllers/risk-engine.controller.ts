import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { assessRiskSchema } from '../dto/assess-risk.schema';
import { RiskEngineService } from '../services/risk-engine.service';

const riskEngineService = new RiskEngineService();

export const assessRiskController = asyncHandler(
  async (req: Request, res: Response) => {
    const dto = assessRiskSchema.parse(req.body);
    const result = riskEngineService.assess(dto);
    return res.status(200).json(result);
  }
);
