/**
 * Academic Alignment Calculator
 * Evaluates course, branch, study time preference, and study environment noise level.
 */

function calculateAcademicScore(studentA, studentB) {
  if (!studentA || !studentB) return { score: 50, details: {} };

  const profileA = studentA.profile || {};
  const profileB = studentB.profile || {};

  // 1. Course & Branch Match
  let courseMatchScore = 60;
  if (studentA.course === studentB.course) {
    courseMatchScore = 80;
    if (studentA.branch === studentB.branch) {
      courseMatchScore = 100;
    }
  }

  // 2. Study Time Style (EARLY_BIRD, NIGHT_OWL, FLEXIBLE)
  let studyTimeScore = 70;
  if (profileA.studyTimePreference && profileB.studyTimePreference) {
    if (profileA.studyTimePreference === profileB.studyTimePreference) {
      studyTimeScore = 100;
    } else if (
      (profileA.studyTimePreference === 'EARLY_BIRD' && profileB.studyTimePreference === 'NIGHT_OWL') ||
      (profileA.studyTimePreference === 'NIGHT_OWL' && profileB.studyTimePreference === 'EARLY_BIRD')
    ) {
      studyTimeScore = 40;
    } else {
      studyTimeScore = 80; // One is flexible
    }
  }

  // 3. Study Environment Noise Level (SILENT, MODERATE, BACKGROUND_MUSIC)
  let studyEnvScore = 70;
  if (profileA.studyEnvironment && profileB.studyEnvironment) {
    if (profileA.studyEnvironment === profileB.studyEnvironment) {
      studyEnvScore = 100;
    } else if (
      (profileA.studyEnvironment === 'SILENT' && profileB.studyEnvironment === 'BACKGROUND_MUSIC') ||
      (profileA.studyEnvironment === 'BACKGROUND_MUSIC' && profileB.studyEnvironment === 'SILENT')
    ) {
      studyEnvScore = 30;
    } else {
      studyEnvScore = 75;
    }
  }

  const overallAcademicScore = (0.40 * courseMatchScore) + (0.35 * studyTimeScore) + (0.25 * studyEnvScore);

  return {
    score: Math.round(overallAcademicScore * 10) / 10,
    details: {
      courseMatchScore,
      studyTimeScore,
      studyEnvScore
    }
  };
}

module.exports = { calculateAcademicScore };
