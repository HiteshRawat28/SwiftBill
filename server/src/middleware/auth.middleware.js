const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Unauthorized: No token provided', code: 'UNAUTHORIZED' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id, email, role
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Unauthorized: Invalid token', code: 'UNAUTHORIZED' } });
  }
};

module.exports = { requireAuth };
