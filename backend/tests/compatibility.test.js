const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateLifestyleScore, getCircularMinuteDistance } = require('../src/services/compatibility/LifestyleCalculator');
const { calculateAcademicScore } = require('../src/services/compatibility/AcademicCalculator');
const { calculateGrowthScore } = require('../src/services/compatibility/GrowthCalculator');
const { detectConflicts } = require('../src/services/compatibility/ConflictEngine');
const { calculatePairwiseCompatibility } = require('../src/services/compatibility/PairwiseCompatibilityEngine');
const { calculateGroupCompatibilityScore } = require('../src/services/optimization/GroupOptimizationEngine');

test('Circular Minute Distance across midnight boundary', () => {
  // 11:30 PM (1410 mins) vs 1:00 AM (60 mins) => 90 mins diff
  const dist = getCircularMinuteDistance(1410, 60);
  assert.equal(dist, 90);
});

test('Lifestyle Compatibility Calculation', () => {
  const profileA = { sleepTimeMinutes: 1380, wakeTimeMinutes: 420, cleanlinessScale: 2, noiseTolerance: 2 };
  const profileB = { sleepTimeMinutes: 1410, wakeTimeMinutes: 450, cleanlinessScale: 2, noiseTolerance: 2 };

  const res = calculateLifestyleScore(profileA, profileB);
  assert.ok(res.score >= 80, `Expected high lifestyle score, got ${res.score}`);
});

test('Growth Cross-Teaching Skill Exchange', () => {
  const profileA = {
    skills: [
      { skillName: 'Python & Web Dev', type: 'CAN_TEACH' },
      { skillName: 'Video Editing & Graphics', type: 'WANTS_TO_LEARN' }
    ]
  };

  const profileB = {
    skills: [
      { skillName: 'Video Editing & Graphics', type: 'CAN_TEACH' },
      { skillName: 'Python & Web Dev', type: 'WANTS_TO_LEARN' }
    ]
  };

  const growth = calculateGrowthScore(profileA, profileB);
  assert.equal(growth.details.totalMatches, 2);
  assert.equal(growth.score, 95);
});

test('Conflict Engine detects extreme bedtime gap', () => {
  const studentA = { profile: { sleepTimeMinutes: 1320, cleanlinessScale: 2, noiseTolerance: 2 } }; // 10:00 PM
  const studentB = { profile: { sleepTimeMinutes: 180, cleanlinessScale: 2, noiseTolerance: 2 } };  // 3:00 AM (300 mins diff)

  const conflicts = detectConflicts(studentA, studentB);
  assert.ok(conflicts.some(c => c.type === 'SLEEP_SCHEDULE_MISMATCH'));
});

test('Group Compatibility Score handles odd-one-out via min weight formula', () => {
  const group = [
    { id: '1', course: 'B.Tech', branch: 'CS', profile: { sleepTimeMinutes: 1380, wakeTimeMinutes: 420, cleanlinessScale: 2, noiseTolerance: 2, isDataComplete: true } },
    { id: '2', course: 'B.Tech', branch: 'CS', profile: { sleepTimeMinutes: 1380, wakeTimeMinutes: 420, cleanlinessScale: 2, noiseTolerance: 2, isDataComplete: true } },
    // Incompatible 3rd student
    { id: '3', course: 'B.Tech', branch: 'ME', profile: { sleepTimeMinutes: 180, wakeTimeMinutes: 660, cleanlinessScale: 5, noiseTolerance: 5, isDataComplete: true } }
  ];

  const evalRes = calculateGroupCompatibilityScore(group);
  assert.ok(evalRes.groupScore < evalRes.averageScore, 'Group score should penalize minimum pair score');
});
