const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        student: {
          include: {
            profile: true
          }
        },
        warden: {
          include: {
            hostels: {
              include: {
                hostel: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student,
        warden: user.warden
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentIdNo, gender, course, branch, yearOfStudy } = req.body;

    if (!email || !password || !firstName || !lastName || !studentIdNo || !gender) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const existingStudent = await prisma.student.findUnique({ where: { studentIdNo: studentIdNo.trim() } });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student ID No already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultCollege = await prisma.college.findFirst();

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        collegeId: defaultCollege ? defaultCollege.id : null,
        student: {
          create: {
            studentIdNo: studentIdNo.trim(),
            firstName,
            lastName,
            gender,
            course: course || 'B.Tech',
            branch: branch || 'Computer Science',
            yearOfStudy: parseInt(yearOfStudy) || 1
          }
        }
      },
      include: { student: true }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      student: req.user.student,
      warden: req.user.warden
    }
  });
};
