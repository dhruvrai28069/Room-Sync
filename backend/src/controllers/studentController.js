const prisma = require('../config/db');
const { calculatePairwiseCompatibility } = require('../services/compatibility/PairwiseCompatibilityEngine');
const { calculateGroupCompatibilityScore } = require('../services/optimization/GroupOptimizationEngine');

exports.getMyAllocation = async (req, res) => {
  try {
    const student = req.user.student;
    if (!student) {
      return res.status(403).json({ success: false, message: 'Student profile not found' });
    }

    // Find latest approved allocation
    const allocation = await prisma.roomAllocation.findFirst({
      where: { studentId: student.id },
      orderBy: { assignedAt: 'desc' },
      include: {
        room: {
          include: {
            block: {
              include: {
                hostel: true
              }
            },
            allocations: {
              include: {
                student: {
                  include: {
                    profile: {
                      include: {
                        skills: true,
                        interests: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!allocation) {
      return res.json({
        success: true,
        isAllocated: false,
        message: 'No room allocation has been finalized for you yet.'
      });
    }

    // Extract roommates
    const room = allocation.room;
    const roomOccupants = room.allocations.map(a => a.student);
    const roommates = roomOccupants.filter(s => s.id !== student.id);

    // Compute pairwise score & rationale for each roommate
    const roommateDetails = roommates.map(rm => {
      const pRes = calculatePairwiseCompatibility(student, rm);
      return {
        id: rm.id,
        firstName: rm.firstName,
        lastName: rm.lastName,
        course: rm.course,
        branch: rm.branch,
        yearOfStudy: rm.yearOfStudy,
        compatibilityScore: pRes.overallScore,
        explanation: pRes.explanation,
        conflicts: pRes.conflicts,
        skillsCanTeach: (rm.profile?.skills || []).filter(s => s.type === 'CAN_TEACH').map(s => s.skillName),
        sharedInterests: pRes.details?.interests?.sharedInterests || []
      };
    });

    // Group evaluation
    const groupEval = calculateGroupCompatibilityScore(roomOccupants);

    res.json({
      success: true,
      isAllocated: true,
      allocationDetails: {
        hostelName: room.block.hostel.name,
        blockName: room.block.name,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        groupScore: groupEval.groupScore,
        roommates: roommateDetails
      }
    });
  } catch (error) {
    console.error('Error fetching student allocation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.requestRoomChange = async (req, res) => {
  try {
    const student = req.user.student;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid reason (min 10 characters)' });
    }

    const request = await prisma.roomChangeRequest.create({
      data: {
        studentId: student.id,
        reason: reason.trim(),
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, message: 'Room change request submitted to warden', request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const student = req.user.student;
    const { overallRating, sleepCompatibility, studyCompatibility, cleanlinessRating, socialCompatibility, comments } = req.body;

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ success: false, message: 'Overall rating (1-5) is required' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId: student.id,
        overallRating: parseInt(overallRating),
        sleepCompatibility: sleepCompatibility ? parseInt(sleepCompatibility) : null,
        studyCompatibility: studyCompatibility ? parseInt(studyCompatibility) : null,
        cleanlinessRating: cleanlinessRating ? parseInt(cleanlinessRating) : null,
        socialCompatibility: socialCompatibility ? parseInt(socialCompatibility) : null,
        comments: comments ? comments.trim() : null
      }
    });

    res.status(201).json({ success: true, message: 'Feedback submitted! Thank you for helping improve roommate matching.', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
