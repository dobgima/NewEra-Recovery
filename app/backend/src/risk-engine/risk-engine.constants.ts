export const RISK_SCORES = {
  mood: {
    veryLow: 30,
    low: 20,
    neutral: 8,
  },
  cravings: {
    extremeThreshold: 9,
    extremeScore: 35,
    highThreshold: 7,
    highScore: 25,
    moderateThreshold: 4,
    moderateScore: 12,
  },
  triggers: {
    multipleThreshold: 4,
    multipleScore: 20,
    severalThreshold: 2,
    severalScore: 10,
    singleThreshold: 1,
    singleScore: 5,
  },
  supportRequested: 15,
  feltUnsafe: 40,
  notes: {
    concerningThreshold: 3,
    concerningScore: 20,
    relapseThreshold: 1,
    relapseScore: 10,
  },
  levels: {
    criticalThreshold: 85,
    highThreshold: 60,
    mediumThreshold: 30,
  },
} as const;

export const RISK_MESSAGES = {
  defaultExplanation: 'No major warning signals detected',
  actions: {
    critical:
      'Use your crisis plan now and contact a trusted support person immediately.',
    high:
      'Use a coping tool now and reach out to support within the next 15 minutes.',
    medium:
      'Pause, use one grounding action, and avoid high-risk environments tonight.',
    low: 'Stay grounded and continue your recovery routine.',
  },
  encouragements: {
    critical:
      'You did the right thing by checking in during a dangerous moment.',
    high: 'Checking in during a hard moment is a strong recovery action.',
    medium:
      'You caught this early, which is exactly how recovery gets stronger.',
    low: 'You are building consistency by checking in.',
  },
} as const;

export const CRISIS_KEYWORDS = [
  'relapse',
  'use',
  'using',
  'drink',
  'drank',
  'high',
  'overdose',
  'unsafe',
  'alone',
  'panic',
  'hopeless',
] as const;