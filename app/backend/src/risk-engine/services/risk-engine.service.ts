import { AssessRiskDto } from '../dto/assess-risk.dto';
import { RiskAssessmentResponseDto } from '../dto/risk-assessment-response.dto';
import { RISK_MESSAGES } from '../risk-engine.constants';
import { buildRiskResponse, evaluateRiskRules } from '../risk-engine.rules';

export class RiskEngineService {
  assess(input: AssessRiskDto): RiskAssessmentResponseDto {
    const evaluation = evaluateRiskRules(input);
    const response = buildRiskResponse(evaluation.score, input.feltUnsafe);

    return {
      score: evaluation.score,
      level: response.level,
      factors: evaluation.factors,
      explanation: evaluation.reasons.length
        ? evaluation.reasons.join(', ')
        : RISK_MESSAGES.defaultExplanation,
      recommendedAction: response.recommendedAction,
      encouragement: response.encouragement,
      crisisEscalation: response.crisisEscalation,
    };
  }
}