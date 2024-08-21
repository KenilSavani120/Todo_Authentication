import users from "../models/authModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { hashPassword } from "../config/passportConfig.js";
import dotenv from "dotenv";
import clipboardy from 'clipboardy';


dotenv.config();

// User registration
export const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extract name, email, and password from request body

        // Check if the email already exists
        const emailExist = await users.findOne({ email });
        if (emailExist) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Email already exists, try a different email"
            });
        }

        // Ensure the password is provided
        if (!password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Password is required"
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create and save the new user entry
        const newUser = await users.create({ name, email, password: hashedPassword });
        newUser.password = undefined; // Correctly remove the password from the response

        return res.status(StatusCodes.OK).json({
            data: newUser,
            message: "User added successfully"
        });
    } catch (error) {
        console.error("Error in Add User function:", error); // Log the error for debugging
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error in Add User function",
            error: error.message // Send the error message to the client for better debugging
        });
    }
};

// User login
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

        if (user.password === undefined) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                success: false,
                message: "This email is registered via Google account",
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
            expiresIn: '120s',
        });

        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '60s',
        });

        // Decode the tokens to get expiration times
        const accessTokenPayload = jwt.decode(accessToken);
        const refreshTokenPayload = jwt.decode(refreshToken);

        // Get current time in seconds
        const currentTime = Math.floor(Date.now() / 1000);

        // Calculate time remaining for access token and refresh token
        const accessTokenExpiresIn = accessTokenPayload.exp - currentTime;
        const refreshTokenExpiresIn = refreshTokenPayload.exp - currentTime;

        // it is only for backend
        clipboardy.writeSync(accessToken.toString());
        clipboardy.readSync();

        // Clear sensitive data
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
