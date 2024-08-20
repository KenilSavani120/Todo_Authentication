import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import dotenv from 'dotenv';
import connectDb from './database/db.js'; // Adjust import if necessary
// import todo from './routes/authRoutes.js';
import passport from './controllers/0uthController.js'; // Initialize Passport from your config file
import { authenticateToken } from './config/jwtConfig.js';
import router from './routes/todoRoutes.js';

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
router.use(authenticateToken);
// app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret', // Use a dedicated session secret
  resave: false,
  saveUninitialized: false,
}));

// Initialize passport and configure sessions
app.use(passport.initialize());
app.use(passport.session());

// Database connection
connectDb();

// Routes setup
app.use('/v1/users', router);

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/phone/v1/');
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
