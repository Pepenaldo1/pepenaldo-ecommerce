const jwt = require('jsonwebtoken');

// Verifies the JWT sent as "Authorization: Bearer <token>" and attaches
// the decoded payload ({ id, email, role }) to req.user.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Must be used AFTER requireAuth. Blocks non-admins.
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// Must be used AFTER requireAuth. Blocks anyone who isn't a vendor or admin.
function requireVendor(req, res, next) {
  if (req.user?.role !== 'vendor' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Vendor access required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireVendor };
