// middleware/auth.js
const protect = (req, res, next) => {
  if (req.session && req.session.admin) return next();
  return res.status(401).json({ success: false, error: 'Not authenticated. Please login.' });
};

module.exports = { protect };
