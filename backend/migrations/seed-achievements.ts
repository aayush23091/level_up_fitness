import mongoose from "mongoose";
import { connectToMongoDB } from "../src/database/mongodb";
import { AchievementModel } from "../src/models/achievement.model";

async function seedAchievements() {
  try {
    await connectToMongoDB();
    console.log("Connected to MongoDB");

    const count = await AchievementModel.countDocuments();
    if (count > 0) {
      console.log("Achievements already exist. Skipping seed.");
      await mongoose.disconnect();
      return;
    }

    const achievements = [
      {
        title: "First Step",
        description: "Complete your first workout",
        conditionType: "workout_completed",
        conditionValue: 1,
        xpReward: 100,
        coinReward: 50,
        status: "active",
      },
      {
        title: "Getting Started",
        description: "Complete 5 workouts",
        conditionType: "workout_completed",
        conditionValue: 5,
        xpReward: 250,
        coinReward: 100,
        status: "active",
      },
      {
        title: "Fitness Rookie",
        description: "Complete 10 workouts",
        conditionType: "workout_completed",
        conditionValue: 10,
        xpReward: 500,
        coinReward: 200,
        status: "active",
      },
      {
        title: "Workout Warrior",
        description: "Complete 50 workouts",
        conditionType: "workout_completed",
        conditionValue: 50,
        xpReward: 1000,
        coinReward: 500,
        status: "active",
      },
      {
        title: "XP Hunter",
        description: "Earn 1000 XP",
        conditionType: "xp_earned",
        conditionValue: 1000,
        xpReward: 300,
        coinReward: 150,
        status: "active",
      },
      {
        title: "Level Up",
        description: "Reach Level 5",
        conditionType: "level_reached",
        conditionValue: 5,
        xpReward: 500,
        coinReward: 250,
        status: "active",
      },
      {
        title: "Advanced Athlete",
        description: "Reach Level 10",
        conditionType: "level_reached",
        conditionValue: 10,
        xpReward: 1500,
        coinReward: 500,
        status: "active",
      },
      {
        title: "Consistency King",
        description: "Maintain a 7 day streak",
        conditionType: "streak_days",
        conditionValue: 7,
        xpReward: 500,
        coinReward: 200,
        status: "active",
      },
      {
        title: "Monthly Machine",
        description: "Maintain a 30 day streak",
        conditionType: "streak_days",
        conditionValue: 30,
        xpReward: 2000,
        coinReward: 1000,
        status: "active",
      },
      {
        title: "Elite Athlete",
        description: "Reach Level 20",
        conditionType: "level_reached",
        conditionValue: 20,
        xpReward: 5000,
        coinReward: 2500,
        status: "active",
      },
    ];

    await AchievementModel.insertMany(achievements);
    console.log("Seeded 10 achievements successfully!");

    await mongoose.disconnect();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

seedAchievements();