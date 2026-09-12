/**
 * Growth & Skill Exchange Calculator
 * Evaluates mutual skill complementarity: Skills student A can teach that student B wants to learn,
 * and vice-versa.
 */

function calculateGrowthScore(profileA, profileB) {
  if (!profileA || !profileB) return { score: 50, details: {} };

  const skillsA = profileA.skills || [];
  const skillsB = profileB.skills || [];

  const teachA = skillsA.filter(s => s.type === 'CAN_TEACH').map(s => s.skillName.toLowerCase());
  const learnA = skillsA.filter(s => s.type === 'WANTS_TO_LEARN').map(s => s.skillName.toLowerCase());

  const teachB = skillsB.filter(s => s.type === 'CAN_TEACH').map(s => s.skillName.toLowerCase());
  const learnB = skillsB.filter(s => s.type === 'WANTS_TO_LEARN').map(s => s.skillName.toLowerCase());

  // Cross-teaching matches
  const aTeachesB = teachA.filter(skill => learnB.includes(skill));
  const bTeachesA = teachB.filter(skill => learnA.includes(skill));

  const totalMatches = aTeachesB.length + bTeachesA.length;

  let score = 50; // Neutral baseline
  if (totalMatches === 1) score = 75;
  if (totalMatches >= 2) score = 95;
  if (totalMatches >= 3) score = 100;

  return {
    score,
    details: {
      aTeachesB,
      bTeachesA,
      totalMatches
    }
  };
}

module.exports = { calculateGrowthScore };
