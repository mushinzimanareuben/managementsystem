import express from 'express';
import { Op } from 'sequelize';
import { AuditLog, User } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get system audit logs
// @route   GET /api/logs
// @access  Private (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', action = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (action) {
      whereClause.action = action;
    }

    if (search) {
      whereClause[Op.or] = [
        { userEmail: { [Op.like]: `%${search}%` } },
        { action: { [Op.like]: `%${search}%` } },
        { details: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'email', 'role'] }]
    });

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLogs: count
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
