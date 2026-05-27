// config/seeder.js  –  Seeds default data on first run
const Service     = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Admin       = require('../models/Admin');

const seedServices = [
  { name: 'Dental Implants',      description: 'Permanent tooth replacement using titanium implants that look and feel like natural teeth.', price_from: 25000, price_to: 80000, duration: '1-2 hours',      icon: '🦷', category: 'implant'      },
  { name: 'Root Canal Treatment', description: 'Painless procedure to save infected teeth and eliminate severe toothache.',                   price_from: 3000,  price_to: 8000,  duration: '45-90 min',     icon: '🔬', category: 'treatment'    },
  { name: 'Teeth Whitening',      description: 'Professional whitening to brighten your smile by several shades.',                            price_from: 5000,  price_to: 15000, duration: '60-90 min',     icon: '✨', category: 'cosmetic'     },
  { name: 'Braces & Orthodontics',description: 'Metal, ceramic, and invisible aligners for perfectly aligned teeth.',                         price_from: 20000, price_to: 60000, duration: 'Monthly visits', icon: '😁', category: 'orthodontic'  },
  { name: 'Tooth Extraction',     description: 'Safe and painless removal of damaged or problematic teeth.',                                  price_from: 500,   price_to: 3000,  duration: '30-60 min',     icon: '⚕️', category: 'surgery'      },
  { name: 'Dental Crowns',        description: 'Custom-made caps to restore damaged or weakened teeth.',                                      price_from: 5000,  price_to: 20000, duration: '2 visits',      icon: '👑', category: 'restoration'  },
  { name: 'Scaling & Cleaning',   description: 'Professional deep cleaning to remove plaque and tartar buildup.',                             price_from: 1000,  price_to: 3000,  duration: '45-60 min',     icon: '🧹', category: 'preventive'   },
  { name: 'Smile Design',         description: 'Complete aesthetic makeover for a perfect Hollywood smile.',                                  price_from: 50000, price_to: 200000,duration: 'Multiple visits',icon: '💫', category: 'cosmetic'     },
];

const seedTestimonials = [
  { patient_name: 'Ram Prasad Sharma', review: 'Excellent service! The implant procedure was completely painless. Highly recommended!',         rating: 5, service: 'Dental Implants',       approved: true },
  { patient_name: 'Sunita Thapa',      review: 'The team made me feel so comfortable. My smile transformed completely after braces treatment.',  rating: 5, service: 'Braces & Orthodontics', approved: true },
  { patient_name: 'Bikram Rai',        review: 'Best dental clinic in Butwal. Modern equipment, clean environment, very professional staff.',    rating: 5, service: 'Root Canal Treatment',  approved: true },
];

const runSeeder = async () => {
  try {
    // Seed services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(seedServices);
      console.log('✅ Default services seeded');
    }

    // Seed testimonials
    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      await Testimonial.insertMany(seedTestimonials);
      console.log('✅ Default testimonials seeded');
    }

    // Seed default admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({ username: 'admin', password: 'dental@2024', role: 'superadmin' });
      console.log('✅ Default admin created  →  username: admin');
      console.warn('⚠️  IMPORTANT: Change the default admin password immediately after first login!');
    }
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  }
};

module.exports = runSeeder;
