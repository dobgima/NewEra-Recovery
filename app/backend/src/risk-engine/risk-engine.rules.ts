import { MoodLevel, RiskLevel } from '@prisma/client';
import { AssessRiskDto } from './dto/assess-risk.dto';
import { RiskFactor } from './types/risk-engine.types';
import {
  CRISIS_KEYWORDS,
  RISK_MESSAGES,
  RISK_SCORES,
} from './risk-engine.constants';

export type RiskRuleEvaluation = {
  score: number;
  reasons: string[];
  factors: RiskFactor[];
};

export type RiskResponsePayload = {
  level: RiskLevel;
  recommendedAction: string;
  encouragement: string;
  crisisEscalation: boolean;
};

export const evaluateRiskRules = (input: AssessRiskDto): RiskRuleEvaluation => {
  let score = 0;
  const reasons: string[] = [];
  const factors: RiskFactor[] = [];

  if (input.mood === MoodLevel.VERY_LOW) {
    score += RISK_SCORES.mood.veryLow;
    reasons.push('very low mood');
    factors.push('VERY_LOW_MOOD');
  } else if (input.mood === MoodLevel.LOW) {
    score += RISK_SCORES.mood.low;
    reasons.push('low mood');
    factors.push('LOW_MOOD');
  } else if (input.mood === MoodLevel.NEUTRAL) {
    score += RISK_SCORES.mood.neutral;
    factors.push('NEUTRAL_MOOD');
  }

  if (input.cravingsLevel >= RISK_SCORES.cravings.extremeThreshold) {
    score += RISK_SCORES.cravings.extremeScore;
    reasons.push('extreme cravings');
    factors.push('EXTREME_CRAVINGS');
  } else if (input.cravingsLevel >= RISK_SCORES.cravings.highThreshold) {
    score += RISK_SCORES.cravings.highScore;
    reasons.push('high cravings');
    factors.push('HIGH_CRAVINGS');
  } else if (input.cravingsLevel >= RISK_SCORES.cravings.moderateThreshold) {
    score += RISK_SCORES.cravings.moderateScore;
    reasons.push('moderate cravings');
    factors.push('MODERATE_CRAVINGS');
  }

  if (input.triggers.length >= RISK_SCORES.triggers.multipleThreshold) {
    score += RISK_SCORES.triggers.multipleScore;
    reasons.push('multiple triggers');
    factors.push('MULTIPLE_TRIGGERS');
  } else if (input.triggers.length >= RISK_SCORES.triggers.severalThreshold) {
    score += RISK_SCORES.triggers.severalScore;
    reasons.push('several triggers');
    factors.push('SEVERAL_TRIGGERS');
  } else if (input.triggers.length === RISK_SCORES.triggers.singleThreshold) {
    score += RISK_SCORES.triggers.singleScore;
    factors.push('SINGLE_TRIGGER');
  }

  if (input.needsSupport) {
    score += RISK_SCORES.supportRequested;
    reasons.push('support requested');
    factors.push('SUPPORT_REQUESTED');
  }

  if (input.feltUnsafe) {
    score += RISK_SCORES.feltUnsafe;
    reasons.push('unsafe feelings reported');
    factors.push('FELT_UNSAFE');
  }

  const notes = (input.notes || '').toLowerCase();
  const matchedKeywords = CRISIS_KEYWORDS.filter((keyword) =>
    notes.includes(keyword),
  );

  if (matchedKeywords.length >= RISK_SCORES.notes.concerningThreshold) {
    score += RISK_SCORES.notes.concerningScore;
    reasons.push('concerning journal language');
    factors.push('CONCERNING_NOTES');
  } else if (matchedKeywords.length >= RISK_SCORES.notes.relapseThreshold) {
    score += RISK_SCORES.notes.relapseScore;
    reasons.push('possible relapse language');
    factors.push('RELAPSE_LANGUAGE');
  }

  return {
    score: Math.max(0, Math.min(score, 100)),
    reasons,
    factors,
  };
};

export const buildRiskResponse = (
  score: number,
  feltUnsafe: boolean,
): RiskResponsePayload => {
  if (score >= RISK_SCORES.levels.criticalThreshold || feltUnsafe) {
    return {
      level: RiskLevel.CRITICAL,
      recommendedAction: RISK_MESSAGES.actions.critical,
      encouragement: RISK_MESSAGES.encouragements.critical,
      crisisEscalation: true,
    };
  }

  if (score >= RISK_SCORES.levels.highThreshold) {
    return {
      level: RiskLevel.HIGH,
      recommendedAction: RISK_MESSAGES.actions.high,
      encouragement: RISK_MESSAGES.encouragements.high,
      crisisEscalation: false,
    };
  }

  if (score >= RISK_SCORES.levels.mediumThreshold) {
    return {
      level: RiskLevel.MEDIUM,
      recommendedAction: RISK_MESSAGES.actions.medium,
      encouragement: RISK_MESSAGES.encouragements.medium,
      crisisEscalation: false,
    };
  }

  return {
    level: RiskLevel.LOW,
    recommendedAction: RISK_MESSAGES.actions.low,
    encouragement: RISK_MESSAGES.encouragements.low,
    crisisEscalation: false,
  };
};