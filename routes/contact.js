// routes/contact.js
const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const Contact   = require('../models/Contact');
const { protect } = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact  (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ success: false, error: 'Name and message are required' });
    }
    if (email && !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }
    await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: 'Message received! We will contact you soon.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/contact  (admin)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/contact/:id/read  (admin)
router.patch('/:id/read', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, error: 'Invalid message ID' });
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
