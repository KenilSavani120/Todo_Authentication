import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js'; // Correct capitalization to avoid conflicts
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/redirect", // Update with your callback URL
    passReqToCallback: true
},
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log('User Profile:', profile);

            // Check if user already exists in the database
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // If the user is found, return the "already login" message
                return done(null, user, { message: 'already login' });
            } else {
                // If the user is not found, create a new user
                user = await User.create({
                    // googleId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName
                    // picture: profile._json.picture,
                });

                // Pass the new user object to the done callback
                return done(null, user);
            }
        } catch (err) {
            return done(err, null);
        }
    }
));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize just the user ID for simplicity
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Find user by ID
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;




// import passport from 'passport';
// import jwt from 'jsonwebtoken';
// import User from '../models/user.js';

// export const googleLogin = passport.authenticate('google', {
//   scope: ['profile', 'email'],
// });

// export const googleCallback = async (req, res) => {
//   // Handle Google callback logic
//   const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   res.redirect(`/todo?token=${token}`);
// };

// export const localLogin = async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (user && await user.comparePassword(req.body.password)) {
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// };

// export const logout = (req, res) => {
//   req.logout();
//   res.redirect('/');
// };
