import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const saltRounds = 10; // Define the salt rounds for bcrypt

export const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

