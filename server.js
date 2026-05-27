// ═══════════════════════════════════════════════════════════════
//  Unique Dental & Implant Center Pvt. Ltd.
//  Backend API Server  |  Node.js + Express + MongoDB
//  Butwal-6, Pushpalalpark, Rupandehi, Nepal
// ═══════════════════════════════════════════════════════════════
require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const cors         = require('cors');
const morgan       = require('morgan');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const connectDB    = require('./config/db');
const runSeeder    = require('./config/seeder');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB then seed ──────────────────────────────
connectDB().then(runSeeder);

// ── Security (LO7) ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } }));

// ── CORS – allow frontend origin ──────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE']
}));

// ── Core Middleware ───────────────────────────────────────────
app.use(morgan('dev'));            // LO7 – request logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ───────────────────────────────────────────────────
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET not set in .env — using insecure fallback. Set it before deploying!');
}
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dental-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

// ── Static uploads folder ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes (LO9) ─────────────────────────────────────────
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/services',     require('./routes/services'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/admin',        require('./routes/admin'));

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'healthy',
    service:   'Unique Dental & Implant Center API',
    version:   '2.0.0',
    database:  'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
});

// ── Global Error Handler (LO7) ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║    Unique Dental & Implant Center Pvt. Ltd.         ║');
  console.log('║    Butwal-6, Pushpalalpark, Rupandehi, Nepal        ║');
  console.log(`║    Backend API → http://localhost:${PORT}             ║`);
  console.log('║    Database   → MongoDB                             ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
});

module.exports = app;
