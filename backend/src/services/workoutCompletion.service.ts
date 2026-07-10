
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { WorkoutRepository } from "../repositories/workout.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { IWorkoutCompletion } from "../models/workoutCompletion.model";
import { HttpException } from "../exceptions/http-exception";

const workoutCompletionRepository = new WorkoutCompletionRepository();
const workoutRepository = new WorkoutRepository();
const userRepository = new UserMongoRepository();

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100);
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

    const newXp = (user.xp || 0) + xpEarned;
    const newCoins = (user.coins || 0) + coinsEarned;
    const newLevel = calculateLevel(newXp);

    await workoutCompletionRepository.createWorkoutCompletion({
      userId: userId as any,
      workoutId: workoutId as any,
      duration,
      xpEarned,
      coinEarned: coinsEarned,
    });

    await userRepository.update(userId, {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
    });

    return {
      message: "Workout completed successfully!",
      xpEarned,
      coinsEarned,
      newXp,
      newLevel,
      newCoins,
    };
  }

  async getUserWorkoutCompletions(userId: string): Promise<IWorkoutCompletion[]> {
    return workoutCompletionRepository.getWorkoutCompletionsByUserId(userId);
  }
}
