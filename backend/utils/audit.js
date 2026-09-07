const AuditLog = require('../models/AuditLog');

const logAction = async ({ business, actor, action, entityType, entityId, metadata = {} }) => {
  try {
    await AuditLog.create({ business, actor, action, entityType, entityId, metadata });
  } catch (err) {
    // Audit logging must never crash the primary request, but should be visible in server logs.
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = { logAction };
