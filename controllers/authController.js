import users from "../models/userManualRegistrationModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { hashPassword } from "../config/passportConfig.js";
import JWT from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

// export const authorization = async (req, res, next) => {
//     try {
//         const authHeader = req.headers['authorization'];
//         if (!authHeader) {
//             return res.status(401).send({
//                 success: false,
//                 message: 'Authorization header is missing',
//             });
//         }

//         const token = authHeader.split(' ')[1]; // Extract the token
//         if (!token) {
//             return res.status(401).send({
//                 success: false,
//                 message: 'Token is missing',
//             });
//         }

//         JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
//             if (err) {
//                 return res.status(401).send({
//                     success: false,
//                     message: 'Un-Authorized User',
//                 });
//             } else {
//                 req.body.id = decode.id;
//                 next();
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({
//             success: false,
//             message: 'Please provide Auth Token',
//             error,
//         });
//     }
// };

export const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extract name, email, and password from request body

        // Check if the email already exists
        const emailExist = await users.findOne({ email });
        if (emailExist) {
            return res.status(400).json({
                message: "Email already exists, try a different email"
            });
        }

        // Ensure the password is provided
        if (!password) {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create and save the new user entry
        const newUser = await users.create({ name, email, password: hashedPassword });
        newUser.password = undefined; // Correctly remove the password from the response

        return res.status(200).json({
            data: newUser,
            message: "User added successfully"
        });
    } catch (error) {
        console.error("Error in Add User function:", error); // Log the error for debugging
        return res.status(500).json({
            message: "Error in Add User function",
            error: error.message // Send the error message to the client for better debugging
        });
    }
};


export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Check user
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                success: false,
                message: "User not found",
            });
        }

        // Debugging: Log the passwords
        // console.log('Request password:', password);
        // console.log('Stored password:', user.password);

        if(user.password === undefined) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                success: false,
                message: "this email is login via google account",
            });
        }

        // Check user password | Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).send({
                success: false,
                message: "Invalid credentials",
            });
        }

        req.user = user;

        // Generate tokens
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '100s',
        });

        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '60  s',
        });

        // Decode the tokens to get expiration times
        const accessTokenPayload = JWT.decode(accessToken);
        const refreshTokenPayload = JWT.decode(refreshToken);

        // Get current time in seconds
        const currentTime = Math.floor(Date.now() / 1000);

        // Calculate time remaining for access token and refresh token
        const accessTokenExpiresIn = accessTokenPayload.exp - currentTime;
        const refreshTokenExpiresIn = refreshTokenPayload.exp - currentTime;

        // Clear sensitive data
        req.user = user;

        user.password = undefined;

        // Respond with tokens and user info
        res.status(StatusCodes.OK).send({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            user,
            accessTokenExpiresIn, // Time remaining in seconds
            refreshTokenExpiresIn, // Time remaining in seconds
        });

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: "Error in login API",
            error: error.message,
        });
    }
};

