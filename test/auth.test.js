const { userRegister, userLogin } = require('../controllers/authController.js');
const users = require('../models/authModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { hashPassword } = require('../config/passportConfig.js');

jest.mock('../models/authModel.js');

// Mocking bcryptjs and jsonwebtoken functions
jest.mock('bcryptjs', () => ({
  genSaltSync: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  decode:jest.fn()
}));

jest.mock('../config/passportConfig.js');

describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('userRegister', () => {
      it('should register a user successfully', async () => {
        const req = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        users.findOne.mockResolvedValue(null); // Email does not exist
        hashPassword.mockResolvedValue('hashedPassword');
        users.create.mockResolvedValue({
            _id: 'userId',
            name: req.body.name,
            email: req.body.email,
            password: 'hashedPassword',
        });
    
        await userRegister(req, res);
    
        expect(users.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(hashPassword).toHaveBeenCalledWith(req.body.password);
        expect(users.create).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            password: 'hashedPassword',
        });
        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith({
            data: {
                _id: 'userId',
                name: req.body.name,
                email: req.body.email,
                password: undefined, // Expecting undefined as password is removed in response
            },
            message: 'User added successfully',
        });
    });
    

        it('should return error if email already exists', async () => {
            const req = {
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            users.findOne.mockResolvedValue({}); // Email exists

            await userRegister(req, res);

            expect(users.findOne).toHaveBeenCalledWith({ email: req.body.email });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email already exists, try a different email',
            });
        });

        it('should return error if password is not provided', async () => {
          const req = {
              body: {
                  name: 'Test User',
                  email: 'test@example.com',
                  // No password provided
              },
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
          };
      
          // Mock the findOne method to always return null (no existing user)
          users.findOne = jest.fn().mockResolvedValue(null);
      
          await userRegister(req, res);
      
          expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
              message: 'Password is required',
          });
      });
      
      
      
      

        it('should handle server error', async () => {
            const req = {
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            users.findOne.mockRejectedValue(new Error('Database error'));

            await userRegister(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error in Add User function',
                error: 'Database error',
            });
        });
    });

    describe('userLogin', () => {
    //   it('should login a user successfully', async () => {
    //     const req = {
    //         body: {
    //             email: 'test@example.com',
    //             password: 'password123', // Plain text password
    //         },
    //     };
    //     const res = {
    //         status: jest.fn().mockReturnThis(),
    //         send: jest.fn(),
    //     };

    //     // Mock user data
    //     const user = {
    //         _id: 'userId',
    //         email: req.body.email,
    //         password: 'hashedPassword', // Hashed password stored in DB
    //     };

    //     // Mock methods
    //     users.findOne = jest.fn().mockResolvedValue(user); // Simulate finding the user
    //     bcrypt.compare = jest.fn().mockResolvedValue(true); // Simulate successful password comparison
    //     jwt.sign = jest.fn().mockReturnValue('token'); // Mock JWT signing
    //     jwt.decode = jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 120 }); // Mock JWT decoding

    //     await userLogin(req, res);

    //     expect(users.findOne).toHaveBeenCalledWith({ email: req.body.email });
    //     expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, user.password);
    //     expect(jwt.sign).toHaveBeenCalledWith({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '120s' });
    //     expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    //     expect(res.send).toHaveBeenCalledWith({
    //         success: true,
    //         message: 'Login successful',
    //         accessToken: 'token',
    //         refreshToken: 'token',
    //         user: { _id: 'userId', email: req.body.email, password: undefined },
    //         accessTokenExpiresIn: expect.any(Number),
    //         refreshTokenExpiresIn: expect.any(Number),
    //     });
    // });

    it('should return error if email or password is not provided', async () => {
            const req = {
                body: {},
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Please provide email and password',
            });
        });

        it('should return error if user is not found', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            users.findOne.mockResolvedValue(null);

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'User not found',
            });
        });

        it('should return error if password is incorrect', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'wrongPassword',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            const user = {
                _id: 'userId',
                email: req.body.email,
                password: 'hashedPassword',
            };

            users.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(false);

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid credentials',
            });
        });

        it('should handle server error', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            users.findOne.mockRejectedValue(new Error('Database error'));

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Error in login API',
                error: 'Database error',
            });
        });
    });
});
