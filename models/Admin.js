const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'superadmin'], default: 'admin' }
}, { timestamps: true });

// Hash password before save
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
adminSchema.methods.matchPassword = function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
