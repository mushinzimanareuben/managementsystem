import express from 'express';
import { Submission as SqlSubmission } from '../models/index.js';
import MongoSubmission from '../models/mongoSubmission.js';
import { isMongoConnected } from '../config/db.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, handleUpload } from '../middleware/upload.js';
import { logActivity } from '../middleware/audit.js';
import { sendMockEmail } from '../services/email.js';

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
      savedSubmission = submission.toJSON();
      console.log(`Submissions Route: Saved to Sequelize SQL DB (ID: ${savedSubmission.id})`);
    }

    // Log Activity for new submission
    const userEmail = parsedData.email || parsedData.applicantEmail || 'anonymous';
    await logActivity(
      null,
      userEmail,
      'create_submission',
      { type, submissionId: savedSubmission.id || savedSubmission._id },
      req.ip
    );

    // Send Mock Emails
    if (type === 'job_application') {
      await sendMockEmail({
        to: parsedData.applicantEmail,
        subject: `Application Received: ${parsedData.jobTitle}`,
        body: `Dear ${parsedData.applicantName},\n\nThank you for applying for the ${parsedData.jobTitle} position at our company.\n\nWe have received your application and cover letter. Our recruitment team will review your profile and contact you if your qualifications match our needs.\n\nBest regards,\nHR Department`
      });
      // Also notify HR
      await sendMockEmail({
        to: 'hr@company.com',
        subject: `[New Application] ${parsedData.jobTitle} - ${parsedData.applicantName}`,
        body: `A new application has been submitted for the position: ${parsedData.jobTitle}.\n\nApplicant: ${parsedData.applicantName}\nEmail: ${parsedData.applicantEmail}\nPhone: ${parsedData.applicantPhone}\nCover Letter: ${parsedData.coverLetter}\nResume Link: ${cvUrl || 'No resume attached'}`
      });
    } else if (type === 'customer_info') {
      await sendMockEmail({
        to: parsedData.email,
        subject: `Inquiry Received: ${parsedData.subject || 'Thank you for contacting us'}`,
        body: `Dear ${parsedData.name},\n\nThank you for reaching out to us. We have successfully received your message regarding: "${parsedData.subject || 'General inquiry'}".\n\nOur customer relations team will review it and reply to you as soon as possible.\n\nBest regards,\nClient Services Team`
      });
      // Notify Sales
      await sendMockEmail({
        to: 'sales@company.com',
        subject: `[New Inquiry] ${parsedData.subject || 'General'} - ${parsedData.name}`,
        body: `A new contact submission has been received:\n\nName: ${parsedData.name}\nEmail: ${parsedData.email}\nSubject: ${parsedData.subject}\nMessage: ${parsedData.message}`
      });
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
    const { page, limit, type, status } = req.query;

    if (isMongoConnected) {
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;

      if (page || limit) {
        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 10;
        const skip = (p - 1) * l;
        
        const total = await MongoSubmission.countDocuments(query);
        const submissions = await MongoSubmission.find(query).sort({ createdAt: -1 }).skip(skip).limit(l);
        
        return res.json({
          submissions,
          totalPages: Math.ceil(total / l),
          currentPage: p,
          totalSubmissions: total
        });
      } else {
        const submissions = await MongoSubmission.find(query).sort({ createdAt: -1 });
        return res.json(submissions);
      }
    } else {
      const whereClause = {};
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;

      if (page || limit) {
        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 10;
        const offset = (p - 1) * l;

        const { count, rows } = await SqlSubmission.findAndCountAll({
          where: whereClause,
          limit: l,
          offset: offset,
          order: [['createdAt', 'DESC']]
        });

        return res.json({
          submissions: rows.map(item => item.toJSON()),
          totalPages: Math.ceil(count / l),
          currentPage: p,
          totalSubmissions: count
        });
      } else {
        const sqlResults = await SqlSubmission.findAll({
          where: whereClause,
          order: [['createdAt', 'DESC']]
        });
        const submissions = sqlResults.map(item => item.toJSON());
        return res.json(submissions);
      }
    }
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

    await logActivity(
      req.user.id,
      req.user.email,
      'update_submission_status',
      { submissionId: req.params.id, status },
      req.ip
    );

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

    await logActivity(
      req.user.id,
      req.user.email,
      'delete_submission',
      { submissionId: req.params.id },
      req.ip
    );

    res.json({ message: 'Submission successfully deleted' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
