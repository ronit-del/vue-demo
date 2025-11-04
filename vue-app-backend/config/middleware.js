const db = require("../config/db");

function requireAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  
  if (req.headers.authorization && req.headers.authorization !== '') {
    try {
      const userData = JSON.parse(req.headers.authorization);
      if (userData && userData.id) {
        req.session.user = userData;
        return next();
      }
    } catch (error) {
      console.error('Error parsing Authorization header:', error);
    }
  }
  
  return res.status(401).json({ error: "Authentication required" });
}

module.exports = {
  requireAuth,
};