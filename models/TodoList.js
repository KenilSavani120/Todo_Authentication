import mongoose from "mongoose";

const todoListSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    }
});

export default mongoose.model("todoList", todoListSchema);
