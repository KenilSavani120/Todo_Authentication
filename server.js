const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDb = require('./database/db');
const passport = require('./controllers/0authController');
const taskRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
}));

// Initialize passport and configure sessions
app.use(passport.initialize());
app.use(passport.session());

// Database connection
connectDb();

// Routes setup
app.use('/api/v1/users', taskRoutes);
app.use('/api/v1/auth', authRoutes);

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const clipboardy = await import('clipboardy'); // Dynamically import clipboardy

      // Successful authentication, generate JWT token
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '120s' });
      console.log("Your access token is:", token);
      // clipboardy.writeSync(token);
      // clipboardy.readSync();

      res.status(StatusCodes.OK).json({
        message: 'Authentication successful'
      });
    } catch (error) {
      console.error("Error during token handling:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error'
      });
    }
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
