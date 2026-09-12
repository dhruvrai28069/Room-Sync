const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'exam_seating_system_jwt_secret_2026';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[AUTH FAIL] 401 Unauthorized - Missing or malformed Authorization header for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ success: false, message: 'Authentication required. Token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn(`[AUTH FAIL] 401 Unauthorized - Empty token for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      console.warn(`[AUTH FAIL] 401 Unauthorized - Token payload missing userId for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      console.warn(`[AUTH FAIL] 401 Unauthorized - User ID '${userId}' not found for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
    }

    user._id = user.id;
    req.user = user;
    next();
  } catch (err) {
    console.warn(`[AUTH FAIL] 401 Unauthorized - Token verification failed for ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(401).json({ success: false, message: 'Authentication failed. Invalid or expired token.' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn(`[AUTHZ FAIL] 401 Unauthorized - User not authenticated for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      console.warn(`[AUTHZ FAIL] 403 Forbidden - User '${req.user.email}' (Role: ${req.user.role}) lacks allowed roles [${allowedRoles.join(', ')}] for ${req.method} ${req.originalUrl}`);
      return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
    }

    next();
  };
};

const authenticateToken = protect;
const authorizeRoles = authorize;

module.exports = {
  protect,
  authorize,
  authenticateToken,
  authorizeRoles,
  JWT_SECRET,
};
