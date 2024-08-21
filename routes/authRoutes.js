import express from 'express';
import { userLogin, userRegister } from '../controllers/authController.js';
import { emailValidator } from '../middlewares/emailValidation.js';
import { notEmptyValidate } from '../middlewares/notEmptyValidate.js';

const router = express.Router();


router.post('/login',userLogin );
router.post('/register', emailValidator,notEmptyValidate,userRegister);

export default router;
