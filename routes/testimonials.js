// routes/testimonials.js
const express     = require('express');
const router      = express.Router();
const mongoose    = require('mongoose');
const Testimonial = require('../models/Testimonial');
const { protect } = require('../middleware/auth');

// GET /api/testimonials  (public – approved only)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/testimonials/all  (admin – all including unapproved)
router.get('/all', protect, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/testimonials  (public – patient submits review)
router.post('/', async (req, res) => {
  try {
    const { patient_name, review, rating, service } = req.body;
    if (!patient_name || !review) {
      return res.status(400).json({ error: 'Name and review are required' });
    }
    await Testimonial.create({
      patient_name, review,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      service
    });
    res.status(201).json({ success: true, message: 'Thank you! Your review is pending approval.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/testimonials/:id/approve  (admin)
router.patch('/:id/approve', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, error: 'Invalid testimonial ID' });
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!t) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial approved', testimonial: t });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/testimonials/:id  (admin)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, error: 'Invalid testimonial ID' });
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
