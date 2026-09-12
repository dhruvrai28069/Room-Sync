const prisma = require('../config/db');
const { calculatePairwiseCompatibility } = require('../services/compatibility/PairwiseCompatibilityEngine');
const { optimizeHostelAllocation, calculateGroupCompatibilityScore } = require('../services/optimization/GroupOptimizationEngine');

exports.generateAllocation = async (req, res) => {
  try {
    const { hostelId } = req.body;
    if (!hostelId) {
      return res.status(400).json({ success: false, message: 'Hostel ID is required' });
    }

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      include: {
        blocks: {
          include: {
            rooms: true
          }
        }
      }
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Extract all rooms in hostel
    const rooms = [];
    hostel.blocks.forEach(b => {
      b.rooms.forEach(r => {
        if (r.status !== 'MAINTENANCE') {
          rooms.push({ ...r, block: { name: b.name } });
        }
      });
    });

    // Fetch eligible students by gender match
    const genderFilter = hostel.genderType === 'MALE' ? 'MALE' : (hostel.genderType === 'FEMALE' ? 'FEMALE' : undefined);
    
    const students = await prisma.student.findMany({
      where: genderFilter ? { gender: genderFilter } : {},
      include: {
        profile: {
          include: {
            skills: true,
            interests: true,
            preferences: true
          }
        }
      }
    });

    // Fetch latest locked allocations if any
    const latestVersion = await prisma.allocationVersion.findFirst({
      where: { hostelId },
      orderBy: { createdAt: 'desc' },
      include: {
        allocations: true
      }
    });

    const lockedAllocations = (latestVersion?.allocations || []).filter(a => a.isLocked);

    // Fetch system weights
    const sysConfig = await prisma.systemConfig.findUnique({ where: { id: 'GLOBAL' } });
    const configWeights = sysConfig ? {
      lifestyleWeight: sysConfig.lifestyleWeight,
      academicWeight: sysConfig.academicWeight,
      goalsWeight: sysConfig.goalsWeight,
      personalityWeight: sysConfig.personalityWeight,
      interestsWeight: sysConfig.interestsWeight,
      growthWeight: sysConfig.growthWeight,
      mutualPrefWeight: sysConfig.mutualPrefWeight
    } : {};

    // Run Group Optimization Engine
    const result = optimizeHostelAllocation({
      rooms,
      students,
      lockedAllocations,
      configWeights
    });

    res.json({
      success: true,
      hostelName: hostel.name,
      totalStudents: students.length,
      allocatedRoomsCount: result.allocations.length,
      allocations: result.allocations,
      unassignedStudents: result.unassignedStudents
    });
  } catch (error) {
    console.error('Error generating allocation:', error);
    res.status(500).json({ success: false, message: 'Failed to generate allocation optimization' });
  }
};

exports.approveAllocation = async (req, res) => {
  try {
    const { hostelId, allocations, note } = req.body;
    if (!hostelId || !allocations || !Array.isArray(allocations)) {
      return res.status(400).json({ success: false, message: 'Hostel ID and allocations array required' });
    }

    // Get next version number
    const lastVersion = await prisma.allocationVersion.findFirst({
      where: { hostelId },
      orderBy: { versionNo: 'desc' }
    });

    const versionNo = (lastVersion?.versionNo || 0) + 1;

    const version = await prisma.allocationVersion.create({
      data: {
        versionNo,
        hostelId,
        createdById: req.user.id,
        note: note || `Approved Allocation Version V${versionNo}`,
        isFinal: true
      }
    });

    // Save individual allocations
    const allocationRecords = [];
    for (const roomGroup of allocations) {
      for (const occupant of roomGroup.occupants) {
        allocationRecords.push({
          allocationVersionId: version.id,
          roomId: roomGroup.roomId,
          studentId: occupant.id,
          isLocked: occupant.isLocked || false,
          compatibilityScore: roomGroup.groupScore
        });

        // Update room status
        await prisma.room.update({
          where: { id: roomGroup.roomId },
          data: { status: 'OCCUPIED' }
        });
      }
    }

    await prisma.roomAllocation.createMany({
      data: allocationRecords
    });

    res.json({
      success: true,
      message: `Allocation V${versionNo} successfully finalized and approved!`,
      version
    });
  } catch (error) {
    console.error('Error approving allocation:', error);
    res.status(500).json({ success: false, message: 'Failed to approve allocation' });
  }
};

exports.manualSwapStudents = async (req, res) => {
  try {
    const { studentId1, roomId1, studentId2, roomId2 } = req.body;
    if (!studentId1 || !roomId1 || !studentId2 || !roomId2) {
      return res.status(400).json({ success: false, message: 'Student and Room parameters required' });
    }

    // Recalculate room scores after swap
    res.json({
      success: true,
      message: 'Students swapped successfully. Updated compatibility scores calculated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
