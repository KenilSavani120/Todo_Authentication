import todoList from '../models/todoList.js';

export const getTodoLists = async (req, res) => {
  try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 3; // Default to 3 items per page if not provided
      const skipIndex = (page - 1) * limit; // Calculate how many documents to skip

      if (id) {
          const fetchList = await todoList.findById(id); // Assuming id is the MongoDB _id

          if (!fetchList) {
              return res.status(404).send({
                  message: "Phone does not exist"
              });
          }

          return res.status(200).json({
              data: fetchList,
              message: "Phone fetched successfully"
          });
      }

      const fetchLists = await todoList.find().limit(limit).skip(skipIndex);

      return res.status(200).json({
          data: fetchLists,
          message: "List fetched successfully"
      });

  } catch (error) {
      console.log(error);
      return res.status(500).send({
          message: "Error in fetchList   function"
      });
  }
};


export const deleteTodo = async (req, res) => {
  await TodoList.findByIdAndRemove(req.params.id);
  res.redirect('/todo');
};
