import TodoList from '../models/todoList.js';

export const getTodoLists = async (req, res) => {
  const todoLists = await TodoList.find({ userId: req.user._id });
  res.render('todoListView.ejs', { todoLists });
};

export const deleteTodo = async (req, res) => {
  await TodoList.findByIdAndRemove(req.params.id);
  res.redirect('/todo');
};
