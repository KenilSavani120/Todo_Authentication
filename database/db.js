import mongoose from "mongoose";
import { StatusCodes } from 'http-status-codes';

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database is Connected");
        return connection;
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(StatusCodes.INTERNAL_SERVER_ERROR); // Exit process if connection fails
    }
}

export default connectDb;
