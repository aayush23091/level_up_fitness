import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { UserMongoRepository } from "../repositories/user.repository";
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { UserAchievementRepository } from "../repositories/userAchievement.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { UserService } from "./user.service";
import { HttpException } from "../exceptions/http-exception";

dotenv.config();

const userRepository = new UserMongoRepository();
const workoutCompletionRepository = new WorkoutCompletionRepository();
const userAchievementRepository = new UserAchievementRepository();
const achievementRepository = new AchievementRepository();
const userService = new UserService();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

// Log API key prefix for verification (safe, doesn't expose full key)
console.log("Gemini key prefix:", GEMINI_API_KEY.substring(0, 10));

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: "You are LevelUp AI Coach. You are a personal fitness assistant. Help users with: workout advice, exercise recommendations, nutrition guidance, fitness motivation, progress analysis, training consistency. Always personalize answers using the user's fitness data. Be encouraging and practical. Do not provide medical diagnosis. If the user asks medical questions, recommend consulting a professional." 
});

export class GeminiService {
  async chatWithAI(userId: string, message: string): Promise<string> {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const streak = await userService.getStreak(userId);
    const workoutCompletions = await workoutCompletionRepository.getWorkoutCompletionsByUserId(userId);
    const userAchievements = await userAchievementRepository.getUserAchievementsByUserId(userId);
    const allAchievements = await achievementRepository.getAchievements(1, 100);
    const analytics = await userService.getAnalytics(userId);

    const recentWorkouts = workoutCompletions
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)
      .map(completion => ({
        workout: (completion.workoutId as any)?.name || "Workout",
        completedAt: completion.completedAt,
        xpEarned: completion.xpEarned,
        coinEarned: completion.coinEarned,
      }));

    const userContext = {
      user: {
        name: user.username,
        level: user.level || 0,
        xp: user.xp || 0,
        coins: user.coins || 0,
      },
      fitnessProgress: {
        totalWorkouts: workoutCompletions.length,
        recentWorkouts,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
      },
      achievements: {
        unlocked: userAchievements.length,
        total: allAchievements.total,
      },
      analytics: {
        workoutFrequency: analytics.workoutCategories,
        progressSummary: analytics.overview,
      },
    };

    try {
      const prompt = `User Context: ${JSON.stringify(userContext, null, 2)}\n\nUser Question: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error: any) {
      console.error("Gemini API error:", error);
      
      // Handle 401 Unauthorized (invalid API key)
      if (error.status === 401 || error.message?.includes("401") || error.message?.includes("unauthorized")) {
        return "Invalid Gemini API configuration. Check API key.";
      }
      
      // Handle 429 Too Many Requests (quota exceeded)
      if (
        error.status === 429 || 
        error.message?.toLowerCase().includes("quota") || 
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("too many requests")
      ) {
        return "Gemini quota exceeded. Try again later.";
      }
      
      // Re-throw other errors to be handled by the controller
      throw error;
    }
  }
}
