const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  image_path:  { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'clinic', 'before-after', 'team'],
    default: 'general'
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
