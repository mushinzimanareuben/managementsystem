import express from 'express';
import { Op } from 'sequelize';
import { Advertisement } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, handleUpload } from '../middleware/upload.js';

const router = express.Router();

// @desc    Get advertisements (Admins get all; users/guests get only active ones in date range)
// @route   GET /api/ads
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isAdmin = 'false' } = req.query;
    
    let whereClause = {};

    if (isAdmin !== 'true') {
      const today = new Date().toISOString().split('T')[0];
      whereClause = {
        status: 'active',
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today }
      };
    }

    const ads = await Advertisement.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single advertisement (and increment views)
// @route   GET /api/ads/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    // Increment views
    ad.views += 1;
    await ad.save();

    res.json(ad);
  } catch (error) {
    console.error('Track ad views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new advertisement
// @route   POST /api/ads
// @access  Private (Admin only)
router.post('/', protect, adminOnly, upload.single('media'), async (req, res) => {
  const { title, description, mediaType, promotionLink, startDate, endDate, status } = req.body;

  try {
    const mediaUrl = req.file ? await handleUpload(req.file) : null;

    const ad = await Advertisement.create({
      title,
      description,
      mediaUrl,
      mediaType: mediaType || 'image',
      promotionLink,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
      status: status || 'active'
    });

    res.status(201).json(ad);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @desc    Update advertisement details
// @route   PUT /api/ads/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, upload.single('media'), async (req, res) => {
  const { title, description, mediaType, promotionLink, startDate, endDate, status } = req.body;

  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    if (req.file) {
      ad.mediaUrl = await handleUpload(req.file);
    }

    if (title) ad.title = title;
    if (description) ad.description = description;
    if (mediaType) ad.mediaType = mediaType;
    if (promotionLink !== undefined) ad.promotionLink = promotionLink;
    if (startDate) ad.startDate = startDate;
    if (endDate) ad.endDate = endDate;
    if (status) ad.status = status;

    await ad.save();
    res.json(ad);
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @desc    Delete advertisement
// @route   DELETE /api/ads/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const ad = await Advertisement.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    await ad.destroy();
    res.json({ message: 'Advertisement successfully deleted' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
