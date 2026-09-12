/**
 * Group Optimization Engine
 * Allocates students into hostel rooms while optimizing for overall living compatibility,
 * academic growth, preference satisfaction, and strict hard constraint compliance.
 */

const { calculatePairwiseCompatibility } = require('../compatibility/PairwiseCompatibilityEngine');

function calculateGroupCompatibilityScore(studentGroup, customWeights = {}, groupWeights = { avgWeight: 0.70, minWeight: 0.30 }) {
  if (!studentGroup || studentGroup.length < 2) {
    return { groupScore: 100, averageScore: 100, minScore: 100, pairwiseScores: [], conflicts: [] };
  }

  const pairwiseScores = [];
  let allConflicts = [];

  for (let i = 0; i < studentGroup.length; i++) {
    for (let j = i + 1; j < studentGroup.length; j++) {
      const pResult = calculatePairwiseCompatibility(studentGroup[i], studentGroup[j], customWeights);
      if (!pResult.isInsufficientData && pResult.overallScore !== null) {
        pairwiseScores.push(pResult.overallScore);
        if (pResult.conflicts && pResult.conflicts.length > 0) {
          allConflicts = allConflicts.concat(pResult.conflicts);
        }
      }
    }
  }

  if (pairwiseScores.length === 0) {
    return { groupScore: 50, averageScore: 50, minScore: 50, pairwiseScores: [], conflicts: [] };
  }

  const sum = pairwiseScores.reduce((acc, val) => acc + val, 0);
  const averageScore = sum / pairwiseScores.length;
  const minScore = Math.min(...pairwiseScores);

  const groupScore = Math.round(
    (groupWeights.avgWeight * averageScore) + (groupWeights.minWeight * minScore)
  );

  return {
    groupScore,
    averageScore: Math.round(averageScore * 10) / 10,
    minScore,
    pairwiseScores,
    conflicts: allConflicts
  };
}

function optimizeHostelAllocation({ rooms, students, lockedAllocations = [], configWeights = {} }) {
  console.log(`⚡ Running Group Optimization for ${students.length} students across ${rooms.length} rooms...`);

  // 1. Identify locked students & pre-assigned rooms
  const lockedStudentIds = new Set(lockedAllocations.map(a => a.studentId));
  const allocatedRoomMap = new Map(); // roomId -> array of students

  // Initialize rooms in map
  rooms.forEach(r => allocatedRoomMap.set(r.id, []));

  // Place locked students first
  lockedAllocations.forEach(alloc => {
    if (allocatedRoomMap.has(alloc.roomId)) {
      const roomStudents = allocatedRoomMap.get(alloc.roomId);
      const student = students.find(s => s.id === alloc.studentId);
      if (student) {
        roomStudents.push(student);
      }
    }
  });

  // 2. Separate unlocked students: complete vs insufficient data
  const unlockedStudents = students.filter(s => !lockedStudentIds.has(s.id));
  const completeStudents = unlockedStudents.filter(s => s.profile && s.profile.isDataComplete);
  const insufficientDataStudents = unlockedStudents.filter(s => !s.profile || !s.profile.isDataComplete);

  // 3. Compute pairwise score matrix among complete unlocked students
  const studentList = [...completeStudents];
  
  // Greedy Seed Grouping Strategy
  // Sort pairs by compatibility score descending
  const candidatePairs = [];
  for (let i = 0; i < studentList.length; i++) {
    for (let j = i + 1; j < studentList.length; j++) {
      const res = calculatePairwiseCompatibility(studentList[i], studentList[j], configWeights);
      if (!res.isInsufficientData) {
        candidatePairs.push({
          s1: studentList[i],
          s2: studentList[j],
          score: res.overallScore
        });
      }
    }
  }

  candidatePairs.sort((a, b) => b.score - a.score);

  // Unassigned student pool
  const unassignedPool = new Set(studentList.map(s => s.id));
  const studentById = new Map(studentList.map(s => [s.id, s]));

  // Fill rooms greedily with top scoring pairs/trios respecting room capacity
  for (const room of rooms) {
    const currentOccupants = allocatedRoomMap.get(room.id);
    const needed = room.capacity - currentOccupants.length;

    if (needed <= 0) continue;

    // Find best compatible candidate for this room
    let addedCount = 0;
    while (addedCount < needed && unassignedPool.size > 0) {
      let bestStudentId = null;
      let bestScore = -1;

      for (const stId of unassignedPool) {
        const candidate = studentById.get(stId);
        const testGroup = [...currentOccupants, candidate];
        const gRes = calculateGroupCompatibilityScore(testGroup, configWeights);

        if (gRes.groupScore > bestScore) {
          bestScore = gRes.groupScore;
          bestStudentId = stId;
        }
      }

      if (bestStudentId) {
        const candidate = studentById.get(bestStudentId);
        currentOccupants.push(candidate);
        unassignedPool.delete(bestStudentId);
        addedCount++;
      } else {
        break;
      }
    }
  }

  // 4. Assign remaining students (including insufficient data students) to any available room capacity
  const remainingStudents = [
    ...Array.from(unassignedPool).map(id => studentById.get(id)),
    ...insufficientDataStudents
  ];

  for (const room of rooms) {
    const currentOccupants = allocatedRoomMap.get(room.id);
    while (currentOccupants.length < room.capacity && remainingStudents.length > 0) {
      const student = remainingStudents.shift();
      if (student) {
        currentOccupants.push(student);
      }
    }
  }

  // 5. Build final result structure per room
  const finalRoomAllocations = rooms.map(room => {
    const occupants = allocatedRoomMap.get(room.id) || [];
    const groupEval = calculateGroupCompatibilityScore(occupants, configWeights);

    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      blockName: room.block ? room.block.name : '',
      occupants: occupants.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        studentIdNo: s.studentIdNo,
        course: s.course,
        branch: s.branch,
        isDataComplete: s.profile ? s.profile.isDataComplete : false,
        isLocked: s.isLocked || false
      })),
      groupScore: groupEval.groupScore,
      averageScore: groupEval.averageScore,
      minScore: groupEval.minScore,
      conflicts: groupEval.conflicts
    };
  });

  return {
    allocations: finalRoomAllocations,
    unassignedStudents: remainingStudents
  };
}

module.exports = { calculateGroupCompatibilityScore, optimizeHostelAllocation };
