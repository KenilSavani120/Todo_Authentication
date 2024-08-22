const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader); // Debugging log

    if (!authHeader) return res.status(401).send({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    // console.log('Token:', token); // Debugging log

    if (!token) return res.status(401).send({ message: 'Token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err); // Debugging log
            return res.status(403).send({ message: 'Login required - Session is expired, Invalid token' });
        }

        req.user = user; // Attach user to request object
        // console.log('Verified User:', req.user); // Debugging log
        next();
    });
};

module.exports = { authenticateToken };
