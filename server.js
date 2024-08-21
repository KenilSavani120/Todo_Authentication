import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import connectDb from './database/db.js'; 
import passport from './controllers/0uthController.js'; // Initialize Passport from your config file
import router from './routes/routes.js';
import jwt from 'jsonwebtoken'; 


dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());

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
app.use('/api/v1/users', router); // Apply authenticateToken middleware to protect routes

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, generate JWT token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token);
    

    // Redirect with JWT token
    res.redirect(`v1/users`); // Redirect with JWT token in the URL
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
