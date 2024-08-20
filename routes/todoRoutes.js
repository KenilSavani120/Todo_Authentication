import express from 'express';
import { getTodoLists, deleteTodo } from '../controllers/todoController.js';
import { authenticateJWT } from '../middlewares/validate.js';
import { userLogin, userRegister } from '../controllers/authController.js';
import { emailValidator, notEmptyValidate } from '../middlewares/emailValidation.js';

const router = express.Router();


router.get('/todo', getTodoLists);
router.delete('/todo/:id', deleteTodo);


router.post('/login',userLogin );

router.post('/register', emailValidator,notEmptyValidate,userRegister);

export default router;
