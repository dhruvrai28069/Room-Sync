/**
 * Conflict Detection Engine
 * Identifies explicit lifestyle clashes independent of overall score.
 */

const { getCircularMinuteDistance } = require('./LifestyleCalculator');

function detectConflicts(studentA, studentB) {
  const conflicts = [];
  const profileA = studentA.profile || {};
  const profileB = studentB.profile || {};

  // 1. Major Sleep Schedule Conflict (> 2.5 hours shift)
  const sleepDiff = getCircularMinuteDistance(profileA.sleepTimeMinutes, profileB.sleepTimeMinutes);
  if (sleepDiff > 150) {
    conflicts.push({
      type: 'SLEEP_SCHEDULE_MISMATCH',
      severity: sleepDiff > 210 ? 'HIGH' : 'MODERATE',
      message: `Sleep time difference of ${Math.round(sleepDiff / 60 * 10) / 10} hours.`
    });
  }

  // 2. Cleanliness Clash (Scale diff >= 3)
  const cleanlinessDiff = Math.abs((profileA.cleanlinessScale || 3) - (profileB.cleanlinessScale || 3));
  if (cleanlinessDiff >= 3) {
    conflicts.push({
      type: 'CLEANLINESS_DISCREPANCY',
      severity: cleanlinessDiff >= 4 ? 'HIGH' : 'MODERATE',
      message: `Significant difference in cleanliness standards (Scale gap: ${cleanlinessDiff}).`
    });
  }

  // 3. Noise Preference Clash (Scale diff >= 3)
  const noiseDiff = Math.abs((profileA.noiseTolerance || 3) - (profileB.noiseTolerance || 3));
  if (noiseDiff >= 3) {
    conflicts.push({
      type: 'NOISE_TOLERANCE_CLASH',
      severity: 'HIGH',
      message: `One student prefers quiet room while the other has high noise tolerance.`
    });
  }

  // 4. Study Environment Conflict
  if (
    (profileA.studyEnvironment === 'SILENT' && profileB.studyEnvironment === 'BACKGROUND_MUSIC') ||
    (profileA.studyEnvironment === 'BACKGROUND_MUSIC' && profileB.studyEnvironment === 'SILENT')
  ) {
    conflicts.push({
      type: 'STUDY_ENVIRONMENT_MISMATCH',
      severity: 'MODERATE',
      message: `Incompatible study environment preferences (Silent vs Background Music).`
    });
  }

  return conflicts;
}

module.exports = { detectConflicts };
