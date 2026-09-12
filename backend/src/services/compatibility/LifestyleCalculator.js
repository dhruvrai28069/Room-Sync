/**
 * Lifestyle Compatibility Calculator
 * Evaluates sleep schedule, wake time, cleanliness standards, noise tolerance, and lighting preferences.
 */

function calculateLifestyleScore(profileA, profileB) {
  if (!profileA || !profileB) return { score: 50, details: {} };

  // 1. Bedtime & Wake Time Distance (Minutes from midnight, handles 24h wrap-around)
  const sleepDiff = getCircularMinuteDistance(profileA.sleepTimeMinutes, profileB.sleepTimeMinutes);
  const wakeDiff = getCircularMinuteDistance(profileA.wakeTimeMinutes, profileB.wakeTimeMinutes);

  // Maximum acceptable shift without penalty is 360 mins (6 hours); 0 mins diff = 100% score
  const totalShiftMinutes = sleepDiff + wakeDiff;
  const timeScore = Math.max(0, 100 - (totalShiftMinutes / 360) * 100);

  // 2. Cleanliness Scale Distance (1 to 5 scale)
  const cleanlinessDiff = Math.abs((profileA.cleanlinessScale || 3) - (profileB.cleanlinessScale || 3));
  const cleanlinessScore = Math.max(0, 100 - (cleanlinessDiff / 4) * 100);

  // 3. Noise Tolerance Distance (1 to 5 scale)
  const noiseDiff = Math.abs((profileA.noiseTolerance || 3) - (profileB.noiseTolerance || 3));
  const noiseScore = Math.max(0, 100 - (noiseDiff / 4) * 100);

  // Weighted Combination
  const overallLifestyleScore = (0.40 * timeScore) + (0.35 * cleanlinessScore) + (0.25 * noiseScore);

  return {
    score: Math.round(overallLifestyleScore * 10) / 10,
    details: {
      timeScore: Math.round(timeScore),
      cleanlinessScore: Math.round(cleanlinessScore),
      noiseScore: Math.round(noiseScore),
      sleepDiffMinutes: sleepDiff,
      wakeDiffMinutes: wakeDiff
    }
  };
}

function getCircularMinuteDistance(m1, m2) {
  if (m1 === undefined || m2 === undefined) return 0;
  const diff = Math.abs(m1 - m2);
  return Math.min(diff, 1440 - diff);
}

module.exports = { calculateLifestyleScore, getCircularMinuteDistance };
