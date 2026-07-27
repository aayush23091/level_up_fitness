import mongoose from "mongoose";
import { connectToMongoDB } from "../src/database/mongodb";
import { CoachClientModel } from "../src/models/coachClient.model";
import { TransactionModel } from "../src/models/transaction.model";
import { UserModel } from "../src/models/user.model";

/**
 * Migration: Create missing transactions for existing CoachClient records
 *
 * This script:
 * - Finds all active CoachClient records without a transactionId
 * - For each, creates a corresponding Transaction
 * - Updates the CoachClient with the new transactionId
 * - Calculates adminCommission (40%) and coachEarning (60%) based on coach's hireCost
 * - Can be run safely multiple times (idempotent)
 */

async function createMissingTransactions() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    console.log("Connected to MongoDB");

    // Find all active CoachClient records without transactionId
    const coachClients = await CoachClientModel.find({
      status: "active",
      transactionId: { $exists: false },
    });

    if (coachClients.length === 0) {
      console.log("No CoachClient records found without transactions. Migration complete.");
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${coachClients.length} CoachClient records without transactions`);

    // Process each CoachClient
    let successCount = 0;
    let failCount = 0;

    for (const coachClient of coachClients) {
      try {
        // Get the coach to retrieve hireCost
        const coach = await UserModel.findById(coachClient.coachId);
        if (!coach) {
          console.warn(`Coach not found for CoachClient ${coachClient._id}, skipping...`);
          failCount++;
          continue;
        }

        const hireCost = coach.coachProfile?.hireCost || 0;
        const adminCommission = hireCost * 0.4;
        const coachEarning = hireCost * 0.6;

        // Create transaction
        const transaction = await TransactionModel.create({
          userId: coachClient.athleteId,
          coachId: coachClient.coachId,
          amount: hireCost,
          adminCommission,
          coachEarning,
          type: "coach_hire",
          status: "completed",
        });

        // Update CoachClient with transactionId
        await CoachClientModel.updateOne(
          { _id: coachClient._id },
          { $set: { transactionId: transaction._id } }
        );

        successCount++;
        console.log(`Created transaction for CoachClient ${coachClient._id}`);
      } catch (error) {
        console.error(`Failed to process CoachClient ${coachClient._id}:`, error);
        failCount++;
      }
    }

    console.log(`Migration complete. Success: ${successCount}, Failed: ${failCount}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
createMissingTransactions();
