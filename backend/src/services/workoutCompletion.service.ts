
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { WorkoutRepository } from "../repositories/workout.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { UserAchievementService } from "./userAchievement.service";
import { IWorkoutCompletion } from "../models/workoutCompletion.model";
import { HttpException } from "../exceptions/http-exception";

const workoutCompletionRepository = new WorkoutCompletionRepository();
const workoutRepository = new WorkoutRepository();
const userRepository = new UserMongoRepository();
const userAchievementService = new UserAchievementService();

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100);
};

const getStrippedDate = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const calculateStreakUpdate = (
  lastWorkoutDate: Date | undefined,
  currentStreak: number,
  longestStreak: number
) => {
  const today = getStrippedDate(new Date());

  if (!lastWorkoutDate) {
    // Case 1: First ever workout
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastWorkoutDate: today,
    };
  }

  const lastDate = getStrippedDate(lastWorkoutDate);
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already completed a workout today, do nothing
    return {
      currentStreak,
      longestStreak,
      lastWorkoutDate,
    };
  } else if (diffDays === 1) {
    // Case 2: Consecutive day
    const newCurrentStreak = currentStreak + 1;
    const newLongestStreak = Math.max(newCurrentStreak, longestStreak);
    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastWorkoutDate: today,
    };
  } else {
    // Case 3: Streak broken
    return {
      currentStreak: 1,
      longestStreak,
      lastWorkoutDate: today,
    };
  }
};

export class WorkoutCompletionService {
  async completeWorkout(
    userId: string,
    workoutId: string,
    duration: number
  ): Promise<{
    message: string;
    xpEarned: number;
    coinsEarned: number;
    newXp: number;
    newLevel: number;
    newCoins: number;
    unlockedAchievements?: any[];
  }> {
    const workout = await workoutRepository.getWorkoutById(workoutId);
    if (!workout) {
      throw new HttpException(404, "Workout not found");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const xpEarned = workout.xpReward;
    const coinsEarned = workout.coinReward;

    let newXp = (user.xp || 0) + xpEarned;
    let newCoins = (user.coins || 0) + coinsEarned;
    const newLevel = calculateLevel(newXp);

    await workoutCompletionRepository.createWorkoutCompletion({
      userId: userId as any,
      workoutId: workoutId as any,
      duration,
      xpEarned,
      coinEarned: coinsEarned,
    });

    const streakUpdate = calculateStreakUpdate(
      user.lastWorkoutDate,
      user.currentStreak || 0,
      user.longestStreak || 0
    );

    await userRepository.update(userId, {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastWorkoutDate: streakUpdate.lastWorkoutDate,
    });

    // Check and unlock achievements
    const { unlockedAchievements } = await userAchievementService.checkAndUnlockAchievements(userId);

    // Update xp and coins with achievement rewards
    if (unlockedAchievements.length > 0) {
      const extraXp = unlockedAchievements.reduce(
        (sum, ua) => sum + ua.xpEarned,
        0
      );
      const extraCoins = unlockedAchievements.reduce(
        (sum, ua) => sum + ua.coinsEarned,
        0
      );
      newXp += extraXp;
      newCoins += extraCoins;
    }

    return {
      message: "Workout completed successfully!",
      xpEarned,
      coinsEarned,
      newXp,
      newLevel,
      newCoins,
      unlockedAchievements,
    };
  }

  async getUserWorkoutCompletions(userId: string): Promise<IWorkoutCompletion[]> {
    return workoutCompletionRepository.getWorkoutCompletionsByUserId(userId);
  }
}
