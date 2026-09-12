/**
 * Pairwise Compatibility Engine
 * Aggregates all 7 dimension calculators using configurable weights,
 * evaluates overall score, generates transparent match rationale, and identifies conflicts.
 */

const { calculateLifestyleScore } = require('./LifestyleCalculator');
const { calculateAcademicScore } = require('./AcademicCalculator');
const { calculateGoalScore } = require('./GoalCalculator');
const { calculatePersonalityScore } = require('./PersonalityCalculator');
const { calculateInterestScore } = require('./InterestCalculator');
const { calculateGrowthScore } = require('./GrowthCalculator');
const { calculateMutualPreferenceScore } = require('./MutualPreferenceCalculator');
const { detectConflicts } = require('./ConflictEngine');

const DEFAULT_WEIGHTS = {
  lifestyleWeight: 0.30,
  academicWeight: 0.20,
  goalsWeight: 0.15,
  personalityWeight: 0.10,
  interestsWeight: 0.10,
  growthWeight: 0.10,
  mutualPrefWeight: 0.05
};

function calculatePairwiseCompatibility(studentA, studentB, customWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  // Check data completeness
  if (!studentA?.profile || !studentB?.profile || !studentA.profile.isDataComplete || !studentB.profile.isDataComplete) {
    return {
      overallScore: null,
      isInsufficientData: true,
      status: 'INSUFFICIENT_DATA',
      explanation: 'One or both students have incomplete questionnaire data.',
      conflicts: []
    };
  }

  const lifestyle = calculateLifestyleScore(studentA.profile, studentB.profile);
  const academic = calculateAcademicScore(studentA, studentB);
  const goals = calculateGoalScore(studentA.profile, studentB.profile);
  const personality = calculatePersonalityScore(studentA.profile, studentB.profile);
  const interests = calculateInterestScore(studentA.profile, studentB.profile);
  const growth = calculateGrowthScore(studentA.profile, studentB.profile);
  const mutualPref = calculateMutualPreferenceScore(studentA, studentB);

  const overallScore = Math.round(
    (lifestyle.score * weights.lifestyleWeight) +
    (academic.score * weights.academicWeight) +
    (goals.score * weights.goalsWeight) +
    (personality.score * weights.personalityWeight) +
    (interests.score * weights.interestsWeight) +
    (growth.score * weights.growthWeight) +
    (mutualPref.score * weights.mutualPrefWeight)
  );

  const conflicts = detectConflicts(studentA, studentB);
  const explanation = generateMatchRationale(studentA, studentB, {
    lifestyle, academic, goals, personality, interests, growth, mutualPref
  });

  return {
    overallScore,
    isInsufficientData: false,
    status: 'COMPLETE',
    dimensionScores: {
      lifestyle: lifestyle.score,
      academic: academic.score,
      goals: goals.score,
      personality: personality.score,
      interests: interests.score,
      growth: growth.score,
      mutualPref: mutualPref.score
    },
    details: {
      lifestyle: lifestyle.details,
      academic: academic.details,
      goals: goals.details,
      personality: personality.details,
      interests: interests.details,
      growth: growth.details,
      mutualPref: mutualPref.details
    },
    explanation,
    conflicts
  };
}

function generateMatchRationale(studentA, studentB, dimensionResults) {
  const highlights = [];
  const potentialDifferences = [];

  const { lifestyle, academic, goals, growth, interests, mutualPref } = dimensionResults;

  if (lifestyle.score >= 80) {
    highlights.push('Highly aligned sleeping schedule and cleanliness standards');
  } else if (lifestyle.score < 60) {
    potentialDifferences.push('Noticeable variation in sleep or room noise habits');
  }

  if (academic.score >= 80) {
    highlights.push(`Shared study focus (${studentA.course} - ${studentA.branch})`);
  }

  if (goals.score >= 80) {
    highlights.push(`Compatible career trajectory (${goals.details.goalA})`);
  }

  if (growth.details.totalMatches > 0) {
    highlights.push(`Complementary skills for mutual growth (${growth.details.totalMatches} skill exchange opportunity)`);
  }

  if (interests.details.sharedInterests?.length > 0) {
    highlights.push(`Shared hobbies: ${interests.details.sharedInterests.join(', ')}`);
  }

  if (mutualPref.details.type === 'MUTUAL_REQUEST') {
    highlights.push('Mutual roommate request');
  }

  return {
    highlights,
    potentialDifferences
  };
}

module.exports = { calculatePairwiseCompatibility, DEFAULT_WEIGHTS };
