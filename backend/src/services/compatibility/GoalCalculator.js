/**
 * Goal Compatibility Calculator
 * Evaluates primary career goals (PLACEMENT, HIGHER_STUDIES, GATE_CAT, ENTREPRENEURSHIP, RESEARCH)
 * and preparation synergy.
 */

function calculateGoalScore(profileA, profileB) {
  if (!profileA || !profileB) return { score: 50, details: {} };

  const goalA = profileA.careerGoal || 'PLACEMENT';
  const goalB = profileB.careerGoal || 'PLACEMENT';

  let goalScore = 60;

  if (goalA === goalB) {
    goalScore = 100; // Shared career vision (e.g. both preparing for campus placements or GATE)
  } else {
    // Complementary goal pairings
    const synergisticPairs = [
      ['PLACEMENT', 'HIGHER_STUDIES'],
      ['GATE_CAT', 'RESEARCH'],
      ['ENTREPRENEURSHIP', 'PLACEMENT']
    ];

    const isSynergistic = synergisticPairs.some(pair =>
      (pair[0] === goalA && pair[1] === goalB) || (pair[1] === goalA && pair[0] === goalB)
    );

    goalScore = isSynergistic ? 80 : 65;
  }

  return {
    score: goalScore,
    details: {
      goalA,
      goalB,
      isExactMatch: goalA === goalB
    }
  };
}

module.exports = { calculateGoalScore };
