// Must run after verifyToken, which populates req.user from the JWT.
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = requireAdmin;