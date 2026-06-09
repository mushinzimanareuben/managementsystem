import express from 'express';
import { Employee, Job, Advertisement, Submission as SqlSubmission } from '../models/index.js';
import MongoSubmission from '../models/mongoSubmission.js';
import { isMongoConnected } from '../config/db.js';
import { protect, adminOnly } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const visitorFilePath = path.join(__dirname, '..', 'visitor_count.json');

// Helper to get visitor count
const getVisitorCount = () => {
  try {
    if (fs.existsSync(visitorFilePath)) {
      const data = fs.readFileSync(visitorFilePath, 'utf8');
      return JSON.parse(data).count || 100;
    }
  } catch (err) {
    console.error('Error reading visitor count:', err);
  }
  return 100;
};

// Helper to increment visitor count
const incrementVisitorCount = () => {
  try {
    const count = getVisitorCount() + 1;
    fs.writeFileSync(visitorFilePath, JSON.stringify({ count }), 'utf8');
    return count;
  } catch (err) {
    console.error('Error writing visitor count:', err);
    return 100;
  }
};

// @desc    Increment visitor count (called when visitors open home page)
// @route   POST /api/analytics/visitor
// @access  Public
router.post('/visitor', (req, res) => {
  const newCount = incrementVisitorCount();
  res.json({ count: newCount });
});

// @desc    Get dashboard metrics, charts data, and recent activity
// @route   GET /api/analytics/dashboard
// @access  Private (Admin only)
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // 1. Core Counts
    const totalEmployees = await Employee.count({ where: { status: 'active' } });
    const totalAds = await Advertisement.count();
    const visitors = getVisitorCount();

    let totalApplicants = 0;
    if (isMongoConnected) {
      totalApplicants = await MongoSubmission.countDocuments({ type: 'job_application' });
    } else {
      totalApplicants = await SqlSubmission.count({ where: { type: 'job_application' } });
    }

    // 2. Recent Activities
    // Fetch latest 4 employees
    const recentEmployees = await Employee.findAll({
      limit: 4,
      order: [['createdAt', 'DESC']],
      attributes: ['fullName', 'position', 'createdAt']
    });

    // Fetch latest 4 submissions
    let recentSubmissions = [];
    if (isMongoConnected) {
      recentSubmissions = await MongoSubmission.find().sort({ createdAt: -1 }).limit(4);
    } else {
      recentSubmissions = await SqlSubmission.findAll({
        limit: 4,
        order: [['createdAt', 'DESC']]
      });
    }

    // Format into unified recent activity log
    const activities = [];

    recentEmployees.forEach(emp => {
      activities.push({
        id: `emp-${emp.fullName}-${emp.createdAt}`,
        type: 'employee',
        text: `New employee hired: ${emp.fullName} as ${emp.position}`,
        time: emp.createdAt
      });
    });

    recentSubmissions.forEach(sub => {
      let detail = '';
      const data = isMongoConnected ? sub.data : sub.data;
      if (sub.type === 'job_application') {
        detail = `Job application submitted by ${data.name || 'Candidate'} for ${data.jobTitle || 'vacancy'}`;
      } else if (sub.type === 'service_request') {
        detail = `Service request for '${data.serviceName || 'Service'}' from ${data.clientName || 'Client'}`;
      } else if (sub.type === 'customer_info') {
        detail = `New contact inquiry from ${data.name || 'Visitor'}`;
      }

      activities.push({
        id: `sub-${sub._id || sub.id}`,
        type: sub.type,
        text: detail,
        time: sub.createdAt
      });
    });

    // Sort combined activities by date descending
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 6);

    // 3. Chart Data
    // A. Department distribution (SQL Group By)
    const deptDistribution = await Employee.findAll({
      attributes: [
        'department',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: ['department']
    });

    // B. Submissions breakdown (MongoDB or SQL)
    const submissionsBreakdown = {
      customer_info: 0,
      service_request: 0,
      job_application: 0
    };

    if (isMongoConnected) {
      submissionsBreakdown.customer_info = await MongoSubmission.countDocuments({ type: 'customer_info' });
      submissionsBreakdown.service_request = await MongoSubmission.countDocuments({ type: 'service_request' });
      submissionsBreakdown.job_application = await MongoSubmission.countDocuments({ type: 'job_application' });
    } else {
      submissionsBreakdown.customer_info = await SqlSubmission.count({ where: { type: 'customer_info' } });
      submissionsBreakdown.service_request = await SqlSubmission.count({ where: { type: 'service_request' } });
      submissionsBreakdown.job_application = await SqlSubmission.count({ where: { type: 'job_application' } });
    }

    // C. Ad Performance (views)
    const adViews = await Advertisement.findAll({
      attributes: ['title', 'views'],
      order: [['views', 'DESC']],
      limit: 5
    });

    res.json({
      metrics: {
        totalEmployees,
        totalApplicants,
        totalAds,
        totalVisitors: visitors
      },
      recentActivities,
      charts: {
        departments: deptDistribution,
        submissions: submissionsBreakdown,
        ads: adViews
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
