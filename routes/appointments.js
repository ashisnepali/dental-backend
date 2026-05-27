// routes/appointments.js  –  LO9: API Development
const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const { protect }  = require('../middleware/auth');

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

function badId(res) {
  return res.status(400).json({ success: false, error: 'Invalid appointment ID' });
}

const apptValidation = [
  body('patient_name').trim().notEmpty().withMessage('Patient name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('preferred_date').notEmpty().withMessage('Date is required'),
  body('preferred_time').trim().notEmpty().withMessage('Time is required'),
];

// GET /api/appointments  (admin protected)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    // Whitelist status to prevent NoSQL operator injection
    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status))
        return res.status(400).json({ success: false, error: 'Invalid status value' });
      filter.status = req.query.status;
    }
    // Accept only YYYY-MM-DD date strings
    if (req.query.date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
        return res.status(400).json({ success: false, error: 'Invalid date format' });
      filter.preferred_date = req.query.date;
    }
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/appointments/stats  (admin)
router.get('/stats', protect, async (req, res) => {
  try {
    const [total, pending, confirmed, completed] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
    ]);
    res.json({ success: true, stats: { total, pending, confirmed, completed } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/appointments/:id  (admin)
router.get('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/appointments  (public – patients book)
router.post('/', apptValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { patient_name, phone, email, service, preferred_date, preferred_time, message } = req.body;
    const appointment = await Appointment.create({
      patient_name, phone, email, service, preferred_date, preferred_time, message
    });
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! We will confirm shortly.',
      appointment_id: appointment._id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/appointments/:id/status  (admin)
router.patch('/:id/status', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: `Status updated to ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/appointments/:id  (admin)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
