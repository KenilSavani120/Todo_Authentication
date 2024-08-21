import mongoose from "mongoose";

const todoListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    task: {
        type: String,
        required: [true, "Task is required"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //  if you want to populate the user information
    },
    createdOn: {
        type: Date,
        default: Date.now // Simplified default value
    }
});

export default mongoose.model("todoList", todoListSchema);

