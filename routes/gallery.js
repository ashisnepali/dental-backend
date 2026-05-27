// routes/gallery.js  –  LO9: Middleware + File Upload
const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const Gallery   = require('../models/Gallery');
const { protect } = require('../middleware/auth');

const VALID_GALLERY_CATEGORIES = ['general', 'clinic', 'before-after', 'team'];

function badId(res) {
  return res.status(400).json({ success: false, error: 'Invalid image ID' });
}

// ── Multer config ─────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `gallery-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
  else {
    const err = new Error('Only image files are allowed (jpg, png, gif, webp)');
    err.status = 400;
    cb(err);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/gallery  (public)
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category) {
      if (!VALID_GALLERY_CATEGORIES.includes(req.query.category))
        return res.status(400).json({ success: false, error: 'Invalid category' });
      filter.category = req.query.category;
    }
    const images = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gallery  (admin – upload image)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });
    const image_path = `/uploads/${req.file.filename}`;
    const gallery = await Gallery.create({
      title:       req.body.title       || 'Gallery Image',
      description: req.body.description || '',
      image_path,
      category:    req.body.category    || 'general',
    });
    res.status(201).json({ success: true, gallery });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/gallery/:id  (admin)
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return badId(res);
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Guard against path traversal: image_path must live under /uploads/
    if (!image.image_path.startsWith('/uploads/')) {
      return res.status(400).json({ success: false, error: 'Invalid image path' });
    }

    // Non-blocking async file removal
    const filePath = path.join(__dirname, '..', image.image_path);
    try { await fs.promises.unlink(filePath); } catch { /* file already gone */ }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
