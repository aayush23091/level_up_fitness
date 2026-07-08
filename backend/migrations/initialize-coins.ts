import mongoose from "mongoose";
import { connectToMongoDB } from "../src/database/mongodb";
import { UserModel } from "../src/models/user.model";

/**
 * Migration: Initialize coins field for existing users
 * 
 * This script:
 * - Finds all users without the coins field
 * - Sets coins: 0 for those users
 * - Does not modify existing coin values
 * - Can be run safely multiple times (idempotent)
 */

async function initializeCoins() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    console.log("Connected to MongoDB");

    // Find users without coins field
    const usersWithoutCoins = await UserModel.find({ coins: { $exists: false } });
    
    if (usersWithoutCoins.length === 0) {
      console.log("No users found without coins field. Migration complete.");
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${usersWithoutCoins.length} users without coins field`);

    // Update each user to set coins: 0
    const updatePromises = usersWithoutCoins.map(user => {
      return UserModel.updateOne(
        { _id: user._id },
        { $set: { coins: 0 } }
      );
    });

    const results = await Promise.all(updatePromises);
    
    const successCount = results.filter(r => r.modifiedCount > 0).length;
    console.log(`Successfully updated ${successCount} users with coins: 0`);
    
    await mongoose.disconnect();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
initializeCoins();
