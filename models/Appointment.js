const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient_name: { type: String, required: [true, 'Patient name required'], trim: true },
  phone:        { type: String, required: [true, 'Phone required'], trim: true },
  email:        { type: String, trim: true, lowercase: true },
  service:      { type: String, required: [true, 'Service required'] },
  preferred_date: { type: String, required: [true, 'Date required'] },
  preferred_time: { type: String, required: [true, 'Time required'] },
  message:      { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
