const express = require('express');
const { getTodoLists, deleteTodo, createTodo, updateTodo } = require('../controllers/TodoController');
const { authenticateToken } = require('../config/jwtConfig');
const { todoValidator } = require('../middlewares/todoValidator');
const { notEmptyValidate } = require('../middlewares/notEmptyValidate');

const router = express.Router();

// For to-do list
router.get('/', authenticateToken, getTodoLists);
router.delete('/:id', authenticateToken, deleteTodo);
router.put('/:id', authenticateToken, todoValidator, notEmptyValidate, updateTodo);
router.post('/', authenticateToken, todoValidator, notEmptyValidate, createTodo);

// For Register user (commented out, not in use)
// router.post('/login', userLogin);
// router.post('/register', emailValidator, notEmptyValidate, userRegister);

module.exports = router;
