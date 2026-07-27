import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { WorkoutRepository } from "../repositories/workout.repository";
import { AssignedWorkoutPlanRepository } from "../repositories/assignedWorkoutPlan.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { UserAchievementService } from "./userAchievement.service";
import { IWorkoutCompletion } from "../models/workoutCompletion.model";
import { HttpException } from "../exceptions/http-exception";

const workoutCompletionRepository = new WorkoutCompletionRepository();
const workoutRepository = new WorkoutRepository();
const assignedWorkoutPlanRepository = new AssignedWorkoutPlanRepository();
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
    return {
      currentStreak,
      longestStreak,
      lastWorkoutDate,
    };
  } else if (diffDays === 1) {
    const newCurrentStreak = currentStreak + 1;
    const newLongestStreak = Math.max(newCurrentStreak, longestStreak);
    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastWorkoutDate: today,
    };
  } else {
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
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const workout = await workoutRepository.getWorkoutById(workoutId);

    if (workout) {
      return this.completeAdminWorkout(user, workoutId, duration, workout);
    }

    const assignedWorkout = await assignedWorkoutPlanRepository.getAssignedWorkoutPlanById(workoutId);

    if (!assignedWorkout) {
      throw new HttpException(404, "Workout not found");
    }

    return this.completeCoachWorkout(user, workoutId, duration, assignedWorkout);
  }

  private async completeAdminWorkout(
    user: any,
    workoutId: string,
    duration: number,
    workout: any
  ) {
    const xpEarned = workout.xpReward;
    const coinsEarned = workout.coinReward;

    const result = await this.processWorkoutCompletion(
      user,
      workoutId,
      duration,
      xpEarned,
      coinsEarned
    );

    return {
      message: "Workout completed successfully!",
      ...result,
    };
  }

  private async completeCoachWorkout(
    user: any,
    workoutId: string,
    duration: number,
    assignedWorkout: any
  ) {
    const workoutPlan = assignedWorkout.workoutPlanId;

    if (!workoutPlan) {
      throw new HttpException(404, "Workout plan not found");
    }

    const xpEarned = workoutPlan.estimatedDuration;
    const coinsEarned = Math.ceil(workoutPlan.estimatedDuration / 2);

    await assignedWorkoutPlanRepository.completeAssignedWorkoutPlan(workoutId);

    const result = await this.processWorkoutCompletion(
      user,
      workoutId,
      duration,
      xpEarned,
      coinsEarned
    );

    return {
      message: "Workout completed successfully!",
      ...result,
    };
  }

  private async processWorkoutCompletion(
    user: any,
    workoutId: string,
    duration: number,
    xpEarned: number,
    coinsEarned: number
  ) {
    let newXp = (user.xp || 0) + xpEarned;
    let newCoins = (user.coins || 0) + coinsEarned;
    const newLevel = calculateLevel(newXp);

    await workoutCompletionRepository.createWorkoutCompletion({
      userId: user._id.toString() as any,
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

    await userRepository.update(user._id.toString(), {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      currentStreak: streakUpdate.currentStreak,
      longestStreak: streakUpdate.longestStreak,
      lastWorkoutDate: streakUpdate.lastWorkoutDate,
    });

    const { unlockedAchievements } = await userAchievementService.checkAndUnlockAchievements(user._id.toString());

    if (unlockedAchievements.length > 0) {
      const extraXp = unlockedAchievements.reduce(
        (sum: number, ua: any) => sum + ua.xpEarned,
        0
      );
      const extraCoins = unlockedAchievements.reduce(
        (sum: number, ua: any) => sum + ua.coinsEarned,
        0
      );
      newXp += extraXp;
      newCoins += extraCoins;
    }

    return {
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