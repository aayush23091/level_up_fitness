
import { UserAchievementRepository } from "../repositories/userAchievement.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { IUserAchievement } from "../models/userAchievement.model";
import { IAchievement } from "../models/achievement.model";
import { IUser } from "../models/user.model";

const userAchievementRepository = new UserAchievementRepository();
const achievementRepository = new AchievementRepository();
const userRepository = new UserMongoRepository();
const workoutCompletionRepository = new WorkoutCompletionRepository();

export interface UserAchievementWithProgress {
  achievement: IAchievement;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // percentage
}

export class UserAchievementService {
  async getUserAchievements(
    userId: string
  ): Promise<UserAchievementWithProgress[]> {
    const [allAchievements, userAchievements, user, workoutCompletions] =
      await Promise.all([
        achievementRepository.getAchievements(1, 1000, undefined, "active"),
        userAchievementRepository.getUserAchievementsByUserId(userId),
        userRepository.getUserById(userId),
        workoutCompletionRepository.getWorkoutCompletionsByUserId(userId),
      ]);

    if (!user) {
      throw new Error("User not found");
    }

    const unlockedIds = userAchievements.map(ua => ua.achievementId.toString());
    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievementId.toString(), ua])
    );

    return allAchievements.achievements.map((achievement) => {
      const isUnlocked = unlockedIds.includes(achievement._id.toString());
      const progress = this.calculateProgress(
        achievement,
        user,
        workoutCompletions
      );

      const unlockedUserAchievement = unlockedMap.get(achievement._id.toString());

      return {
        achievement,
        unlocked: isUnlocked,
        unlockedAt: unlockedUserAchievement?.unlockedAt,
        progress,
      };
    });
  }

  calculateProgress(
    achievement: IAchievement,
    user: IUser,
    workoutCompletions: any[]
  ): number {
    let currentValue = 0;

    switch (achievement.conditionType) {
      case "workout_completed":
        currentValue = workoutCompletions.length;
        break;
      case "xp_earned":
        currentValue = user.xp || 0;
        break;
      case "level_reached":
        currentValue = user.level || 0;
        break;
      case "streak_days":
        currentValue = this.calculateStreak(workoutCompletions);
        break;
      default:
        currentValue = 0;
    }

    const progress = Math.min(
      (currentValue / achievement.conditionValue) * 100,
      100
    );
    return Math.round(progress);
  }

  calculateStreak(workoutCompletions: any[]): number {
    if (workoutCompletions.length === 0) return 0;

    // Sort by completedAt descending
    const sortedCompletions = [...workoutCompletions].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 1;
    let currentDate = new Date(sortedCompletions[0].completedAt);
    // Normalize to midnight
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i].completedAt);
      completionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
        currentDate = completionDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  }

  async checkAndUnlockAchievements(
    userId: string
  ): Promise<{
    unlockedAchievements: Array<{
      achievement: IAchievement;
      xpEarned: number;
      coinsEarned: number;
    }>;
  }> {
    const [allAchievements, unlockedIds, user, workoutCompletions] =
      await Promise.all([
        achievementRepository.getAchievements(1, 1000, undefined, "active"),
        userAchievementRepository.getUnlockedAchievementIdsByUserId(userId),
        userRepository.getUserById(userId),
        workoutCompletionRepository.getWorkoutCompletionsByUserId(userId),
      ]);

    if (!user) {
      throw new Error("User not found");
    }

    const unlockedAchievements: Array<{
      achievement: IAchievement;
      xpEarned: number;
      coinsEarned: number;
    }> = [];

    for (const achievement of allAchievements.achievements) {
      if (unlockedIds.includes(achievement._id.toString())) {
        continue;
      }

      const progress = this.calculateProgress(
        achievement,
        user,
        workoutCompletions
      );

      if (progress >= 100) {
        // Unlock achievement
        await userAchievementRepository.createUserAchievement({
          userId: userId as any,
          achievementId: achievement._id,
          rewardClaimed: true,
        });

        // Give rewards
        user.xp = (user.xp || 0) + achievement.xpReward;
        user.coins = (user.coins || 0) + achievement.coinReward;

        await userRepository.update(userId, {
          xp: user.xp,
          coins: user.coins,
        });

        unlockedAchievements.push({
          achievement,
          xpEarned: achievement.xpReward,
          coinsEarned: achievement.coinReward,
        });
      }
    }

    return { unlockedAchievements };
  }
}

