const prisma = require('../config/db');

exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        blocks: {
          include: {
            rooms: {
              include: {
                allocations: {
                  include: {
                    student: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({ success: true, hostels });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getHostelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        blocks: {
          include: {
            rooms: {
              include: {
                allocations: {
                  include: {
                    student: {
                      include: {
                        profile: true
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

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({ success: true, hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { blockId, roomNumber, capacity } = req.body;
    if (!blockId || !roomNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'Block, room number and capacity required' });
    }

    const room = await prisma.room.create({
      data: {
        blockId,
        roomNumber: roomNumber.trim(),
        capacity: parseInt(capacity),
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create room (duplicate room number in block)' });
  }
};

exports.updateRoomLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: { isLocked: Boolean(isLocked) }
    });

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
