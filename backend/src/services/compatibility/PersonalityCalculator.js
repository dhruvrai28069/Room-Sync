/**
 * Personality & Social Preference Calculator
 * Evaluates social energy scale, solitude need, and visitor preferences.
 */

function calculatePersonalityScore(profileA, profileB) {
  if (!profileA || !profileB) return { score: 50, details: {} };

  const socialA = profileA.socialPreference || 3;
  const socialB = profileB.socialPreference || 3;

  const visitorA = profileA.visitorPreference || 3;
  const visitorB = profileB.visitorPreference || 3;

  // Social scale distance (1 to 5)
  const socialDiff = Math.abs(socialA - socialB);
  // Extrovert + Introvert is NOT zero score, but moderate balance (e.g. diff 0 = 100, diff 2 = 75, diff 4 = 40)
  const socialScore = Math.max(40, 100 - (socialDiff / 4) * 60);

  // Visitor tolerance distance
  const visitorDiff = Math.abs(visitorA - visitorB);
  const visitorScore = Math.max(20, 100 - (visitorDiff / 4) * 80);

  const overallScore = (0.50 * socialScore) + (0.50 * visitorScore);

  return {
    score: Math.round(overallScore * 10) / 10,
    details: {
      socialScore: Math.round(socialScore),
      visitorScore: Math.round(visitorScore)
    }
  };
}

module.exports = { calculatePersonalityScore };
