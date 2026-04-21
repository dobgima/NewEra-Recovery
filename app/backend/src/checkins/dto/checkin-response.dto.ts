import { RiskLevel } from '@prisma/client';
import { RiskFactor } from '../../risk-engine/types/risk-engine.types';

export type CheckInResponseDto = {
  checkIn: {
    id: string;
    userId: string;
    mood: string;
    cravingsLevel: number;
    triggers: string[];
    notes: string | null;
    feltUnsafe: boolean;
    needsSupport: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  riskAssessment: {
    id: string;
    checkInId: string;
    score: number;
    level: RiskLevel;
    explanation: string;
    factors: RiskFactor[];
    recommendedAction: string;
    encouragement: string;
    crisisEscalation: boolean;
    createdAt?: Date;
  };
  engagement: {
    currentStreak: number;
  };
  crisisPlan: unknown | null;
};