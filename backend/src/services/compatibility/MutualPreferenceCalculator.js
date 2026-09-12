/**
 * Mutual Roommate Preference Calculator
 * Evaluates whether students requested each other as preferred roommates.
 */

function calculateMutualPreferenceScore(studentA, studentB) {
  if (!studentA || !studentB) return { score: 50, details: {} };

  const prefsA = (studentA.profile?.preferences || []).map(p => p.targetStudentId);
  const prefsB = (studentB.profile?.preferences || []).map(p => p.targetStudentId);

  const aWantsB = prefsA.includes(studentB.id);
  const bWantsA = prefsB.includes(studentA.id);

  let score = 50; // Neutral baseline when no preference is stated
  let type = 'NO_PREFERENCE';

  if (aWantsB && bWantsA) {
    score = 100; // Mutual request bonus
    type = 'MUTUAL_REQUEST';
  } else if (aWantsB || bWantsA) {
    score = 75; // One-sided request
    type = 'ONE_SIDED_REQUEST';
  }

  return {
    score,
    details: {
      aWantsB,
      bWantsA,
      type
    }
  };
}

module.exports = { calculateMutualPreferenceScore };
