import express from 'express';
import { getTodoLists, deleteTodo, createTodo, updateTodo } from '../controllers/TodoController.js';
// import { userLogin, userRegister } from '../controllers/authController.js';
// import { emailValidator } from '../middlewares/emailValidation.js';
import { authenticateToken } from '../config/jwtConfig.js';
import { todoValidator } from '../middlewares/todoValidator.js';
import { notEmptyValidate } from '../middlewares/notEmptyValidate.js';

const router = express.Router();

// for to do list
router.get('/',authenticateToken,getTodoLists);
router.delete('/:id', authenticateToken,deleteTodo);
router.put('/:id', authenticateToken,todoValidator, notEmptyValidate,updateTodo);
router.post('/',authenticateToken,todoValidator,notEmptyValidate,createTodo)


// //for Register user
// router.post('/login',userLogin );
// router.post('/register', emailValidator,notEmptyValidate,userRegister);

export default router;

