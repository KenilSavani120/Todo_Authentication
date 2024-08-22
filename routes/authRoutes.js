const express = require('express');
const { userLogin, userRegister } = require('../controllers/authController');
const { emailValidator } = require('../middlewares/emailValidation');
const { notEmptyValidate } = require('../middlewares/notEmptyValidate');

const router = express.Router();

router.post('/login', userLogin);
router.post('/register', emailValidator, notEmptyValidate, userRegister);

module.exports = router;
