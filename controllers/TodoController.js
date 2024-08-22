const todoList = require('../models/todoModel');
const { StatusCodes } = require('http-status-codes');


// Get all to-do lists for a user
const getTodoLists = async (req, res) => {
    try {
        const user = req.user; // Get the logged-in user
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 3; // Default to 3 items per page if not provided
        const skipIndex = (page - 1) * limit; // Calculate how many documents to skip

        // Fetch only the to-do items for the logged-in user
        const fetchLists = await todoList.find({ userId: user.id }).limit(limit).skip(skipIndex);

        if (fetchLists.length === 0) {
            // Return a message if no to-do items are found
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No to-do items found, please add one"
            });
        }

        return res.status(StatusCodes.OK).json({
            data: fetchLists,
            message: "List fetched successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error in fetchList function",
            error: error.message // Include error message in response
        });
    }
};

// Create a new to-do item
const createTodo = async (req, res) => { 
    try {
        const { title, task } = req.body;
        const user = req.user; // Directly access req.user

        if (!title || !task) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: "Please provide all data"
            });
        }

        // Create the new to-do item with the user ID attached
        const newList = await todoList.create({ 
            title, 
            task, 
            userId: user.id // Use user.id based on your token payload
        });
        
        return res.status(StatusCodes.OK).json({
            data: newList,
            message: "Note added successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: "Error in Add List function",
            error: error.message // Include error message in response
        });
    }
};

// Delete a to-do item
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await todoList.findByIdAndDelete(id);

        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).send({
                message: "To-Do item not found"
            });
        }

        return res.status(StatusCodes.OK).send({
            message: "To-Do item deleted successfully",
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: "Error deleting to-do item",
            error: error.message // Include error message in response
        });
    }
};

// Update a to-do item
const updateTodo = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameters
        const user = req.user; // Get the logged-in user
        const { title, task } = req.body; // New data to update

        // Ensure that title or task is provided for the update
        if (!title && !task) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: "At least one of title or task is required for update"
            });
        }

        console.log('User ID:', user.id);
        console.log('Requested Todo ID:', id);

        // Find and update only the to-do item belonging to the logged-in user
        const updatedList = await todoList.findOneAndUpdate(
            { _id: id, userId: user.id },
            { title, task },
            { new: true } // Return the updated document
        );

        if (!updatedList) {
            return res.status(StatusCodes.NOT_FOUND).send({
                message: "Todo item not found or you are not authorized to update this item"
            });
        }

        return res.status(StatusCodes.OK).json({
            data: updatedList,
            message: "Note updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: "Error in updateTodo function",
            error: error.message // Include error message in response
        });
    }
};

module.exports = { getTodoLists, createTodo, deleteTodo, updateTodo };
