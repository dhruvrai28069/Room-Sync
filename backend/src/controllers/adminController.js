const prisma = require('../config/db');

exports.getSystemConfig = async (req, res) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'GLOBAL' } });
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSystemConfig = async (req, res) => {
  try {
    const {
      lifestyleWeight,
      academicWeight,
      goalsWeight,
      personalityWeight,
      interestsWeight,
      growthWeight,
      mutualPrefWeight,
      groupAvgWeight,
      groupMinWeight
    } = req.body;

    const config = await prisma.systemConfig.upsert({
      where: { id: 'GLOBAL' },
      update: {
        lifestyleWeight: parseFloat(lifestyleWeight),
        academicWeight: parseFloat(academicWeight),
        goalsWeight: parseFloat(goalsWeight),
        personalityWeight: parseFloat(personalityWeight),
        interestsWeight: parseFloat(interestsWeight),
        growthWeight: parseFloat(growthWeight),
        mutualPrefWeight: parseFloat(mutualPrefWeight),
        groupAvgWeight: parseFloat(groupAvgWeight),
        groupMinWeight: parseFloat(groupMinWeight)
      },
      create: {
        id: 'GLOBAL',
        lifestyleWeight: parseFloat(lifestyleWeight),
        academicWeight: parseFloat(academicWeight),
        goalsWeight: parseFloat(goalsWeight),
        personalityWeight: parseFloat(personalityWeight),
        interestsWeight: parseFloat(interestsWeight),
        growthWeight: parseFloat(growthWeight),
        mutualPrefWeight: parseFloat(mutualPrefWeight),
        groupAvgWeight: parseFloat(groupAvgWeight),
        groupMinWeight: parseFloat(groupMinWeight)
      }
    });

    res.json({ success: true, message: 'Matching configuration weights updated', config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update configuration' });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const completedQuestionnaires = await prisma.questionnaireResponse.count({ where: { isComplete: true } });
    const totalRooms = await prisma.room.count();
    const totalAllocated = await prisma.roomAllocation.count();
    const pendingChangeRequests = await prisma.roomChangeRequest.count({ where: { status: 'PENDING' } });

    res.json({
      success: true,
      analytics: {
        totalStudents,
        completedQuestionnaires,
        completionPercentage: totalStudents === 0 ? 0 : Math.round((completedQuestionnaires / totalStudents) * 100),
        totalRooms,
        totalAllocated,
        pendingChangeRequests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRoomChangeRequests = async (req, res) => {
  try {
    const requests = await prisma.roomChangeRequest.findMany({
      include: {
        student: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRoomChangeRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    const request = await prisma.roomChangeRequest.update({
      where: { id },
      data: {
        status,
        reviewNote,
        reviewedBy: req.user.id
      }
    });

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.exportAllocationCSV = async (req, res) => {
  try {
    const allocations = await prisma.roomAllocation.findMany({
      include: {
        room: {
          include: {
            block: {
              include: {
                hostel: true
              }
            }
          }
        },
        student: true
      }
    });

    let csvContent = 'Hostel,Block,Room Number,Student ID,Student Name,Course,Branch,Group Score\n';
    allocations.forEach(a => {
      csvContent += `"${a.room.block.hostel.name}","${a.room.block.name}","${a.room.roomNumber}","${a.student.studentIdNo}","${a.student.firstName} ${a.student.lastName}","${a.student.course}","${a.student.branch}","${a.compatibilityScore || 0}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smart_hostel_allocation_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
