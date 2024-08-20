import mongoose from "mongoose";

const userRegisterSchema = new mongoose.Schema({
  
    email: {
        type: String,
        required: true,
        unique: true
    }, 
     password: {
        type: String,
        required: true
    }, name: {
        type: String,
        required: true
    }
});

export default mongoose.model("users", userRegisterSchema);