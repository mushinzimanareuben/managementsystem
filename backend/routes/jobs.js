import express from 'express';
import { Op } from 'sequelize';
import { Job } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

const router = express.Router();

// @desc    Get all job listings with filters (Public)
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page, limit, search = '', department = '', type = '', location = '', showClosed = 'false' } = req.query;

    const whereClause = {};

    // By default, hide closed jobs unless requested by an Admin
    if (showClosed !== 'true') {
      whereClause.status = 'open';
    }

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    if (department) {
      whereClause.department = department;
    }

    if (type) {
      whereClause.type = type;
    }

    if (location) {
      whereClause.location = location;
    }

    if (page || limit) {
      const p = parseInt(page) || 1;
      const l = parseInt(limit) || 10;
      const offset = (p - 1) * l;

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereClause,
        limit: l,
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      return res.json({
        jobs,
        totalPages: Math.ceil(count / l),
        currentPage: p,
        totalJobs: count
      });
    } else {
      const jobs = await Job.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });
      return res.json(jobs);
    }
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single job vacancy details
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Post a new job vacancy
// @route   POST /api/jobs
// @access  Private (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, department, location, type, description, requirements, salaryRange, status } = req.body;

  try {
    const job = await Job.create({
      title,
      department,
      location,
      type,
      description,
      requirements,
      salaryRange,
      status: status || 'open'
    });

    await logActivity(
      req.user.id,
      req.user.email,
      'create_job',
      { jobId: job.id, title: job.title },
      req.ip
    );

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a job vacancy
// @route   PUT /api/jobs/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { title, department, location, type, description, requirements, salaryRange, status } = req.body;

  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (title) job.title = title;
    if (department) job.department = department;
    if (location) job.location = location;
    if (type) job.type = type;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;
    if (status) job.status = status;

    await job.save();

    await logActivity(
      req.user.id,
      req.user.email,
      'update_job',
      { jobId: job.id, title: job.title },
      req.ip
    );

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a job vacancy
// @route   DELETE /api/jobs/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobId = job.id;
    const jobTitle = job.title;

    await job.destroy();

    await logActivity(
      req.user.id,
      req.user.email,
      'delete_job',
      { jobId, title: jobTitle },
      req.ip
    );

    res.json({ message: 'Job listing successfully deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
