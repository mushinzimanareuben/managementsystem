import express from 'express';
import { Submission as SqlSubmission } from '../models/index.js';
import MongoSubmission from '../models/mongoSubmission.js';
import { isMongoConnected } from '../config/db.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, handleUpload } from '../middleware/upload.js';

const router = express.Router();

// @desc    Submit form data (Public access)
// @route   POST /api/submissions
// @access  Public
router.post('/', upload.single('cv'), async (req, res) => {
  const { type, data } = req.body;

  try {
    if (!type || !data) {
      return res.status(400).json({ message: 'Type and data are required fields' });
    }

    // Parse data from string if it comes as multipart form data
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid data format' });
      }
    }

    // Process file upload (like CV for job application)
    const cvUrl = req.file ? await handleUpload(req.file) : null;

    let savedSubmission;

    if (isMongoConnected) {
      // Save to MongoDB
      savedSubmission = await MongoSubmission.create({
        type,
        data: parsedData,
        cvUrl,
        status: 'pending'
      });
      console.log(`Submissions Route: Saved to MongoDB (ID: ${savedSubmission._id})`);
    } else {
      // Save to SQLite/MySQL
      const submission = await SqlSubmission.create({
        type,
        data: parsedData,
        cvUrl,
        status: 'pending'
      });
      // Convert to JSON and format keys to look identical
      savedSubmission = submission.toJSON();
      console.log(`Submissions Route: Saved to Sequelize SQL DB (ID: ${savedSubmission.id})`);
    }

    res.status(201).json({
      message: 'Submission successfully recorded',
      submission: savedSubmission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @desc    Get all submissions with filters
// @route   GET /api/submissions
// @access  Private (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { type, status } = req.query;

    let submissions = [];

    if (isMongoConnected) {
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;

      submissions = await MongoSubmission.find(query).sort({ createdAt: -1 });
    } else {
      const whereClause = {};
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;

      const sqlResults = await SqlSubmission.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });
      submissions = sqlResults.map(item => item.toJSON());
    }

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update submission status
// @route   PUT /api/submissions/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;

  try {
    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    let updatedSubmission;

    if (isMongoConnected) {
      updatedSubmission = await MongoSubmission.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!updatedSubmission) {
        return res.status(404).json({ message: 'Submission not found in MongoDB' });
      }
    } else {
      const submission = await SqlSubmission.findByPk(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found in SQL Database' });
      }
      submission.status = status;
      await submission.save();
      updatedSubmission = submission.toJSON();
    }

    res.json({
      message: 'Submission status successfully updated',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    let deleted = false;

    if (isMongoConnected) {
      const result = await MongoSubmission.findByIdAndDelete(req.params.id);
      if (result) deleted = true;
    } else {
      const submission = await SqlSubmission.findByPk(req.params.id);
      if (submission) {
        await submission.destroy();
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ message: 'Submission successfully deleted' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
