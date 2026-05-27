// backend/config/database.js
// LO9 — Database setup using NeDB (pure JS, zero native deps)

const Datastore = require('@seald-io/nedb');
const path     = require('path');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ── Collections ────────────────────────────────────────────────────────────
const db = {
  appointments : new Datastore({ filename: path.join(dataDir, 'appointments.db'), autoload: true }),
  services     : new Datastore({ filename: path.join(dataDir, 'services.db'),     autoload: true }),
  gallery      : new Datastore({ filename: path.join(dataDir, 'gallery.db'),      autoload: true }),
  testimonials : new Datastore({ filename: path.join(dataDir, 'testimonials.db'), autoload: true }),
  admin_users  : new Datastore({ filename: path.join(dataDir, 'admin_users.db'),  autoload: true }),
  contact      : new Datastore({ filename: path.join(dataDir, 'contact.db'),      autoload: true }),
};

// ── Seed default data ──────────────────────────────────────────────────────
const initDB = () => {

  // Seed 8 default dental services
  db.services.count({}, (err, count) => {
    if (!err && count === 0) {
      db.services.insert([
        { name:'Dental Implants',      description:'Permanent tooth replacement using titanium implants that look and feel like natural teeth.',      price_from:25000, price_to:80000,  duration:'1-2 hours',      icon:'🦷', category:'implant',      active:true, createdAt:new Date() },
        { name:'Root Canal Treatment', description:'Painless procedure to save infected teeth and relieve severe toothache completely.',               price_from:3000,  price_to:8000,   duration:'45-90 min',      icon:'🔬', category:'treatment',     active:true, createdAt:new Date() },
        { name:'Teeth Whitening',      description:'Professional whitening treatment to brighten your smile by several shades.',                       price_from:5000,  price_to:15000,  duration:'60-90 min',      icon:'✨', category:'cosmetic',      active:true, createdAt:new Date() },
        { name:'Braces & Orthodontics',description:'Metal, ceramic, and invisible aligners for perfectly aligned, beautiful teeth.',                   price_from:20000, price_to:60000,  duration:'Monthly visits',  icon:'😁', category:'orthodontic',   active:true, createdAt:new Date() },
        { name:'Tooth Extraction',     description:'Safe and painless removal of damaged, decayed, or problematic teeth.',                             price_from:500,   price_to:3000,   duration:'30-60 min',      icon:'⚕️', category:'surgery',       active:true, createdAt:new Date() },
        { name:'Dental Crowns',        description:'Custom-made ceramic or zirconia caps to restore damaged or weakened teeth.',                       price_from:5000,  price_to:20000,  duration:'2 visits',        icon:'👑', category:'restoration',   active:true, createdAt:new Date() },
        { name:'Scaling & Cleaning',   description:'Professional deep cleaning to remove plaque, tartar, and prevent gum disease.',                   price_from:1000,  price_to:3000,   duration:'45-60 min',      icon:'🧹', category:'preventive',    active:true, createdAt:new Date() },
        { name:'Smile Design',         description:'Complete aesthetic smile makeover for a perfect, confident Hollywood smile.',                      price_from:50000, price_to:200000, duration:'Multiple visits', icon:'💫', category:'cosmetic',      active:true, createdAt:new Date() },
      ], () => console.log('✅ Default services seeded'));
    }
  });

  // Seed default admin account
  db.admin_users.count({}, (err, count) => {
    if (!err && count === 0) {
      bcrypt.hash('dental@2024', 10, (err, hash) => {
        if (err) return;
        db.admin_users.insert(
          { username:'admin', password:hash, role:'superadmin', createdAt:new Date() },
          () => console.log('✅ Admin created  →  username: admin  |  password: dental@2024')
        );
      });
    }
  });

  // Seed sample testimonials
  db.testimonials.count({}, (err, count) => {
    if (!err && count === 0) {
      db.testimonials.insert([
        { patient_name:'Ram Prasad Sharma', review:'Excellent service! Implant was painless. Highly recommended!',           rating:5, service:'Dental Implants',      approved:true, createdAt:new Date() },
        { patient_name:'Sunita Thapa',      review:'The team made me so comfortable. My smile transformed after braces!',    rating:5, service:'Braces & Orthodontics', approved:true, createdAt:new Date() },
        { patient_name:'Bikram Rai',        review:'Best dental clinic in Butwal. Modern equipment and professional staff.', rating:5, service:'Root Canal Treatment',  approved:true, createdAt:new Date() },
      ]);
    }
  });

  console.log('✅ Database initialized');
};

module.exports = { db, initDB };
