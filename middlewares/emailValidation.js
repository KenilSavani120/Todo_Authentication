import { body,validationResult } from "express-validator";

export const emailValidator = [

    body("email")
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail() ,// Optional: Normalize the email by converting it to lowercase, etc.,
    // Password validation

    body("password")
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
    body("name")
    .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long')    
];

export const notEmptyValidate =  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
