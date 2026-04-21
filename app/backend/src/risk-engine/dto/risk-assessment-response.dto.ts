import { RiskLevel } from '@prisma/client';
import { RiskFactor } from '../types/risk-engine.types';

export type RiskAssessmentResponseDto = {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  explanation: string;
  recommendedAction: string;
  encouragement: string;
  crisisEscalation: boolean;
};