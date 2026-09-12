const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req = null, userId = null, userName = '', action, entityType, entityId = '', metadata = {} }) => {
  try {
    const finalUserId = userId || (req && req.user ? req.user._id : null);
    const finalUserName = userName || (req && req.user ? req.user.name : 'System/Guest');
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '';

    await AuditLog.create({
      userId: finalUserId,
      userName: finalUserName,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
    });
  } catch (error) {
    console.warn('[Audit Log Error]', error.message);
  }
};

module.exports = logAudit;
