import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";
import { seedWorkouts } from "../utils/seeder";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("Connected to MongoDB successfully");
        await seedWorkouts();
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // rethrow the error after logging
    }
}