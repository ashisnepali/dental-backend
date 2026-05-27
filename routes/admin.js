// routes/admin.js  –  LO7: Backend + LO9: API
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const Admin      = require('../models/Admin');
const Appointment = require('../models/Appointment');
const Contact    = require('../models/Contact');
const Testimonial = require('../models/Testimonial');
const Gallery    = require('../models/Gallery');
const { protect } = require('../middleware/auth');

// Strict rate limiter for auth endpoints: 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admin/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Username already taken' });
    }
    await Admin.create({ username, password });
    res.status(201).json({ success: true, message: 'Account created successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    req.session.admin = { id: admin._id, username: admin.username, role: admin.role };
    res.json({
      success: true,
      message: 'Login successful',
      admin: { username: admin.username, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// GET /api/admin/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, admin: req.session.admin });
});

// GET /api/admin/dashboard  (admin stats)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      total_appointments,
      pending_appointments,
      unread_messages,
      pending_reviews,
      gallery_images,
      recent_appointments
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ read: false }),
      Testimonial.countDocuments({ approved: false }),
      Gallery.countDocuments(),
      Appointment.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      stats: {
        total_appointments,
        pending_appointments,
        unread_messages,
        pending_reviews,
        gallery_images,
      },
      recent_appointments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/appointments  (all appointments for admin table)
router.get('/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/messages  (all contact messages)
router.get('/messages', protect, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/reviews  (all testimonials including unapproved)
router.get('/reviews', protect, async (req, res) => {
  try {
    const reviews = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
