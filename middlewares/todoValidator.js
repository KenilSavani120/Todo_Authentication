const { body } = require('express-validator');

const todoValidator = [
    body('title')
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters long'),
    body('task')
        .isLength({ min: 5 })
        .withMessage('Task must be at least 5 characters long')
];

module.exports = { todoValidator };
