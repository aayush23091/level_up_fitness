import { beforeAll, afterEach, afterAll } from "@jest/globals";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.test" });

beforeAll(async () => {
    console.log("Connecting to test database...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to test database");
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    console.log("Disconnecting from test database...");
    await mongoose.connection.close();
    console.log("Disconnected from test database");
});
