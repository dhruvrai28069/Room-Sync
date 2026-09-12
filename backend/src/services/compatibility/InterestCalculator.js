/**
 * Interest & Hobbies Compatibility Calculator
 * Uses Jaccard Similarity on multi-select hobbies, sports, and extracurricular activities.
 */

function calculateInterestScore(profileA, profileB) {
  if (!profileA || !profileB) return { score: 50, details: {} };

  const interestsA = (profileA.interests || []).map(i => i.name.toLowerCase());
  const interestsB = (profileB.interests || []).map(i => i.name.toLowerCase());

  if (interestsA.length === 0 || interestsB.length === 0) {
    return { score: 50, details: { sharedInterests: [], jaccard: 0 } };
  }

  const setA = new Set(interestsA);
  const setB = new Set(interestsB);

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  const jaccard = union.size === 0 ? 0 : intersection.size / union.size;

  // Transform Jaccard score (0.0 to 1.0) into a balanced score (40 to 100)
  // Shared interests enhance compatibility, but missing common hobbies isn't heavily penalized
  const score = Math.round(40 + jaccard * 60);

  return {
    score,
    details: {
      sharedInterests: Array.from(intersection),
      jaccard: Math.round(jaccard * 100) / 100
    }
  };
}

module.exports = { calculateInterestScore };
