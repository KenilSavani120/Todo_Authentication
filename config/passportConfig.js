import bcrypt from 'bcryptjs';

const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// Function to hash the user's password
export const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Error hashing password'); // You can handle this error in the calling function
    }
};


// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const saltRounds = 10; // Define the salt rounds for bcrypt

// export const hashPassword = async (password) => {
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     return hashedPassword;
// };

