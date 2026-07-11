import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { UserMongoRepository } from "../repositories/user.repository";
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { UserAchievementRepository } from "../repositories/userAchievement.repository";
import { UserService } from "./user.service";
import { HttpException } from "../exceptions/http-exception";
import { fitnessFallbackService } from "./fitnessFallback.service";

dotenv.config();

const userRepository = new UserMongoRepository();
const workoutCompletionRepository = new WorkoutCompletionRepository();
const userAchievementRepository = new UserAchievementRepository();
const userService = new UserService();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

// Log API key prefix for verification (safe, doesn't expose full key)
console.log("Gemini key prefix:", GEMINI_API_KEY.substring(0, 10));

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-lite",
  systemInstruction: "You are LevelUp AI Coach. Give concise fitness advice about workouts, nutrition, motivation and progress. Personalize answers using provided user data. Do not give medical diagnosis.",
  generationConfig: {
    maxOutputTokens: 300,
    temperature: 0.7,
  },
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

    const recentWorkouts = workoutCompletions
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 3)
      .map(completion => (completion.workoutId as any)?.name || "Workout");

    const prompt = [
      "User Fitness Data:",
      `Name: ${user.username}`,
      `Level: ${user.level || 0}`,
      `XP: ${user.xp || 0}`,
      `Coins: ${user.coins || 0}`,
      `Completed workouts: ${workoutCompletions.length}`,
      `Current streak: ${streak.currentStreak}`,
      `Longest streak: ${streak.longestStreak}`,
      `Achievements unlocked: ${userAchievements.length}`,
      recentWorkouts.length ? `Recent workouts: ${recentWorkouts.join(", ")}` : "",
      "",
      `Question:`,
      message,
    ].filter(Boolean).join("\n");

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error: any) {
      console.error("Gemini API error:", error);

      // Handle 401 Unauthorized (invalid API key) - configuration issue, surface clearly
      if (error.status === 401 || error.message?.includes("401") || error.message?.includes("unauthorized")) {
        return "Invalid Gemini API configuration. Check API key.";
      }

      // Handle 404 model not found - configuration issue, surface clearly
      if (error.status === 404 || error.message?.includes("404") || error.message?.includes("not found")) {
        return "AI model configuration error. Please check Gemini model settings.";
      }

      // Handle 429 Too Many Requests (quota exceeded) - use fallback assistant
      if (
        error.status === 429 ||
        error.message?.toLowerCase().includes("quota") ||
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("too many requests")
      ) {
        console.warn("Gemini quota exceeded (429). Falling back to built-in fitness assistant.");
        return fitnessFallbackService.getFallback(message).text;
      }

      // API temporarily unavailable (network/unknown errors) - use fallback assistant
      console.warn("Gemini API temporarily unavailable. Falling back to built-in fitness assistant.");
      return fitnessFallbackService.getFallback(message).text;
    }
  }
}
