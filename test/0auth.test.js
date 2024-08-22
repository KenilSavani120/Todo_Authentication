const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/0authModel');
const passport = require('passport');
const dotenv = require('dotenv');

// Mock dotenv config
dotenv.config = jest.fn();

// Mock the User model
jest.mock('../models/0authModel');

// Mock Passport
jest.mock('passport', () => ({
    use: jest.fn(),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn()
}));

describe('Passport Google Strategy', () => {
    const GOOGLE_CLIENT_ID = 'fake-client-id';
    const GOOGLE_CLIENT_SECRET = 'fake-client-secret';
    const CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

    beforeEach(() => {
        // Reset mocks before each test
        User.findOne.mockReset();
        User.create.mockReset();
    });

    it('should call done with user if user exists', async () => {
        const mockProfile = {
            emails: [{ value: 'test@example.com' }],
            displayName: 'Test User'
        };
        const mockUser = { _id: '12345', email: 'test@example.com', displayName: 'Test User' };

        User.findOne.mockResolvedValue(mockUser);

        // Create instance of the strategy
        const strategy = new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            passReqToCallback: true
        }, async (request, accessToken, refreshToken, profile, done) => {
            // Test the callback function
            try {
                const user = await User.findOne({ email: profile.emails[0].value });
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });

        // Mock strategy's verify function
        const done = jest.fn();
        await strategy._verify({}, 'accessToken', 'refreshToken', mockProfile, done);

        expect(done).toHaveBeenCalledWith(null, mockUser);
        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should create and call done with new user if user does not exist', async () => {
        const mockProfile = {
            emails: [{ value: 'newuser@example.com' }],
            displayName: 'New User'
        };
        const newUser = { _id: '67890', email: 'newuser@example.com', displayName: 'New User' };

        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(newUser);

        // Create instance of the strategy
        const strategy = new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            passReqToCallback: true
        }, async (request, accessToken, refreshToken, profile, done) => {
            // Test the callback function
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    user = await User.create({
                        email: profile.emails[0].value,
                        displayName: profile.displayName
                    });
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });

        // Mock strategy's verify function
        const done = jest.fn();
        await strategy._verify({}, 'accessToken', 'refreshToken', mockProfile, done);

        expect(done).toHaveBeenCalledWith(null, newUser);
        expect(User.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
        expect(User.create).toHaveBeenCalledWith({
            email: 'newuser@example.com',
            displayName: 'New User'
        });
    });

    it('should call done with error if there is an exception', async () => {
        const mockProfile = {
            emails: [{ value: 'error@example.com' }],
            displayName: 'Error User'
        };
    
        // Simulate a database error
        User.findOne.mockRejectedValue(new Error('Database error'));
    
        // Create an instance of the strategy
        const strategy = new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            passReqToCallback: true
        }, async (request, accessToken, refreshToken, profile, done) => {
            try {
                const user = await User.findOne({ email: profile.emails[0].value });
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });
    
        // Mock strategy's verify function
        const done = jest.fn();
        await strategy._verify({}, 'accessToken', 'refreshToken', mockProfile, done);
    
        // Verify that `done` was called with the expected error and null user
        expect(done).toHaveBeenCalledWith(expect.any(Error), null);
        const [error, user] = done.mock.calls[0];
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Database error');
        expect(user).toBeNull();
        expect(User.findOne).toHaveBeenCalledWith({ email: 'error@example.com' });
    });
    

});
