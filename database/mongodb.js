import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';

if(!MONGO_URI){
    throw new Error('Database not found')
}


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;