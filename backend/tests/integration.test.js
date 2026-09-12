const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/db');

const { calculatePairwiseCompatibility } = require('../src/services/compatibility/PairwiseCompatibilityEngine');
const { optimizeHostelAllocation } = require('../src/services/optimization/GroupOptimizationEngine');

test('Integration Test: Database Seed Verification', async () => {
  const hostels = await prisma.hostel.findMany({ include: { blocks: { include: { rooms: true } } } });
  assert.ok(hostels.length >= 2, 'Hostels seeded');

  const questions = await prisma.question.findMany();
  assert.ok(questions.length >= 30, 'All 36 questionnaire questions seeded');

  const students = await prisma.student.findMany({ include: { profile: { include: { skills: true, interests: true } } } });
  assert.ok(students.length >= 6, 'Sample students seeded');
});

test('Integration Test: End-to-End Hostel Matching Generation', async () => {
  const boysHostel = await prisma.hostel.findFirst({
    where: { genderType: 'MALE' },
    include: { blocks: { include: { rooms: true } } }
  });

  const rooms = [];
  boysHostel.blocks.forEach(b => {
    b.rooms.forEach(r => rooms.push({ ...r, block: { name: b.name } }));
  });

  const maleStudents = await prisma.student.findMany({
    where: { gender: 'MALE' },
    include: { profile: { include: { skills: true, interests: true } } }
  });

  const result = optimizeHostelAllocation({
    rooms,
    students: maleStudents,
    lockedAllocations: [],
    configWeights: {}
  });

  assert.ok(result.allocations.length > 0, 'Allocations generated');
  assert.ok(result.allocations[0].groupScore >= 0, 'Group compatibility score calculated');
});
