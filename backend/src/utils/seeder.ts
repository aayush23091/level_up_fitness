import { WorkoutModel } from "../models/workout.model";
import { AchievementModel } from "../models/achievement.model";

export const seedWorkouts = async () => {
  try {
    const count = await WorkoutModel.countDocuments();
    if (count > 0) {
      return;
    }

    const workouts = [
      {
        title: "Elite Chest & Triceps",
        description: "A high-intensity chest and triceps session designed to build explosive push strength and muscle hypertrophy.",
        thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400",
        category: "Strength",
        difficulty: "Intermediate",
        duration: 45,
        xpReward: 100,
        coinReward: 50,
        createdBy: "admin",
      },
      {
        title: "Leg Day Power",
        description: "Heavy compound movements focusing on squats, deadlifts, and lunges to build maximal lower body strength.",
        thumbnail: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400",
        category: "Strength",
        difficulty: "Advanced",
        duration: 60,
        xpReward: 120,
        coinReward: 60,
        createdBy: "admin",
      },
      {
        title: "HIIT Cardio Burn",
        description: "Fast-paced cardio intervals to spike your heart rate and burn maximum calories in a short period.",
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400",
        category: "HIIT Cardio",
        difficulty: "Advanced",
        duration: 30,
        xpReward: 80,
        coinReward: 40,
        createdBy: "admin",
      },
      {
        title: "Upper Strength",
        description: "A comprehensive upper body workout targeting the shoulders, chest, back, and arms with moderate weight.",
        thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400",
        category: "Strength",
        difficulty: "Intermediate",
        duration: 50,
        xpReward: 90,
        coinReward: 45,
        createdBy: "admin",
      },
      {
        title: "Back Builder",
        description: "Focus on pull-ups, rows, and extensions to build a strong, defined V-taper and upper back posture.",
        thumbnail: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=400",
        category: "Strength",
        difficulty: "Intermediate",
        duration: 45,
        xpReward: 85,
        coinReward: 40,
        createdBy: "admin",
      },
      {
        title: "Core Crusher",
        description: "Quick, effective session targeting your abs, obliques, and deep stabilizing muscles for core strength.",
        thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400",
        category: "Core",
        difficulty: "Beginner",
        duration: 15,
        xpReward: 40,
        coinReward: 20,
        createdBy: "admin",
      },
      {
        title: "Push Day",
        description: "Focus on compound pressing movements for chest, shoulders, and triceps with progressive overload.",
        thumbnail: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400",
        category: "Strength",
        difficulty: "Intermediate",
        duration: 50,
        xpReward: 95,
        coinReward: 45,
        createdBy: "admin",
      },
      {
        title: "Pull Day",
        description: "Back and bicep compound movements highlighting rows, curls, and pull downs to develop back thickness.",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400",
        category: "Strength",
        difficulty: "Intermediate",
        duration: 50,
        xpReward: 95,
        coinReward: 45,
        createdBy: "admin",
      },
      {
        title: "Shoulder Sculpt",
        description: "Target all three heads of the deltoids to create round, sculpted shoulders and build overhead stability.",
        thumbnail: "https://images.unsplash.com/photo-1581009137042-c5983f884a29?q=80&w=400",
        category: "Strength",
        difficulty: "Beginner",
        duration: 30,
        xpReward: 50,
        coinReward: 25,
        createdBy: "admin",
      },
      {
        title: "Beginner Full Body",
        description: "A perfect introduction to resistance training covering all major muscle groups in a balanced format.",
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400",
        category: "Strength",
        difficulty: "Beginner",
        duration: 40,
        xpReward: 60,
        coinReward: 30,
        createdBy: "admin",
      },
    ];

    await WorkoutModel.insertMany(workouts);
    console.log("Seeded 10 workouts successfully.");
  } catch (error) {
    console.error("Error seeding workouts:", error);
  }
};

export const seedAchievements = async () => {
  try {
    const count = await AchievementModel.countDocuments();
    if (count > 0) {
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
    console.log("Seeded 10 achievements successfully.");
  } catch (error) {
    console.error("Error seeding achievements:", error);
  }
};
