const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'electrohub_jwt_secret_key_98765';

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No admin token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('Admin verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired admin token.' });
  }
};

module.exports = { verifyAdmin };
