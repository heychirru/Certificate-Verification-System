/**
 * Middleware: Authorize request by user role
 * Must be used AFTER authenticate middleware
 *
 * Usage: router.post('/admin/register', authenticate, authorize(['admin']), handler)
 *
 * @param {string[]} allowedRoles - Array of permitted roles e.g. ['admin']
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
      // req.user is set by authenticate middleware
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to access this resource',
        });
      }
  
      next();
    };
  };
  
  module.exports = authorize;