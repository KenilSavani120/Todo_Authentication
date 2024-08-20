import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const saltRounds = 10; // Define the salt rounds for bcrypt

export const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

// export const comparePassword = async (password, hashedPassword) => {
//     const isMatch = await bcrypt.compare(password, hashedPassword);
//     return isMatch;
// };

export const generateToken = (user) => {
    // Replace 'your_jwt_secret' with your actual secret key
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '455s' });
};
