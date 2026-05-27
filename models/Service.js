const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price_from:  { type: Number },
  price_to:    { type: Number },
  duration:    { type: String },
  icon:        { type: String, default: '🦷' },
  category: {
    type: String,
    enum: ['implant', 'treatment', 'cosmetic', 'orthodontic', 'surgery', 'restoration', 'preventive'],
    default: 'treatment'
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
