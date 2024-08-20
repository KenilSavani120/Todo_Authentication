import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader); // Debugging log

    if (!authHeader) return res.status(401).send({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Debugging log

    if (!token) return res.status(401).send({ message: 'Token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err); // Debugging log
            return res.status(403).send({ message: 'Login require - Session is Expire ,Invalid token' });
        }

        req.user = user; // Attach user to request object
        next();
    });
};
