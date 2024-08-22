const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/0authModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    passReqToCallback: true // Pass the request object to the callback
},
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log('User Profile:', profile);

            // Check if user already exists in the database
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // User exists, pass user object to the done callback
                return done(null, user);
            } else {
                // User does not exist, create a new user
                user = await User.create({
                    email: profile.emails[0].value,
                    displayName: profile.displayName
                });

                // Pass the newly created user object to the done callback
                return done(null, user);
            }
        } catch (err) {
            return done(err, null); // Return error to the done callback
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id); // Serialize user._id into the session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); // Pass the user object to the done callback
    } catch (err) {
        done(err, null); // Return error to the done callback
    }
});

module.exports = passport;
