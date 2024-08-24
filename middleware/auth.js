const jwt = require('jsonwebtoken');
const JWT_SECRET = "Harryisagood$oy";

const auth = (req, res, next) => {
  console.log('Auth middleware triggered');
  console.log('Headers:', req.headers);
  
  const token = req.header('Authorization');
  console.log('Received token:', token);

  if (!token) {
    console.log('No token found');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
