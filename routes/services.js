// routes/services.js
const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const Service   = require('../models/Service');
const { protect } = require('../middleware/auth');

const VALID_SVC_CATEGORIES = ['implant', 'treatment', 'cosmetic', 'orthodontic', 'surgery', 'restoration', 'preventive'];

function badId(res) {
  return res.status(400).json({ success: false, error: 'Invalid service ID' });
}

// GET /api/services  (public)
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category) {
      if (!VALID_SVC_CATEGORIES.includes(req.query.category))
        return res.status(400).json({ success: false, error: 'Invalid category' });
      filter.category = req.query.category;
    }
    const services = await Service.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/services/:id  (public)
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/services  (admin)
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, price_from, price_to, duration, icon, category } = req.body;
    if (!name) return res.status(400).json({ error: 'Service name required' });
    const service = await Service.create({ name, description, price_from, price_to, duration, icon, category });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/services/:id  (admin)
router.put('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    // Explicitly pick allowed fields to prevent mass-assignment
    const { name, description, price_from, price_to, duration, icon, category, active } = req.body;
    const updates = { name, description, price_from, price_to, duration, icon, category, active };
    // Remove undefined keys so Mongoose doesn't unset them
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/services/:id  (admin)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
