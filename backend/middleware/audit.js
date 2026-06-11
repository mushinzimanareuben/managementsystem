import { AuditLog } from '../models/index.js';

export const logActivity = async (userId, userEmail, action, details, ipAddress = '') => {
  try {
    await AuditLog.create({
      userId: userId || null,
      userEmail: userEmail || null,
      action,
      details: details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : null,
      ipAddress: ipAddress || null
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
};
