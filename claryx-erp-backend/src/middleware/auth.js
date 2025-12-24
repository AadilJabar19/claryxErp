const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.companyId) {
      return res.status(401).json({ error: 'Invalid token: companyId missing' });
    }

    req.userContext = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      roles: decoded.roles,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;