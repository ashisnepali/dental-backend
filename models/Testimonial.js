const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  patient_name: { type: String, required: true, trim: true },
  review:       { type: String, required: true, trim: true },
  rating:       { type: Number, min: 1, max: 5, default: 5 },
  service:      { type: String },
  approved:     { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
