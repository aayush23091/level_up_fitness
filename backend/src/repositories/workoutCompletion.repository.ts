
import { WorkoutCompletionModel, IWorkoutCompletion } from "../models/workoutCompletion.model";

export class WorkoutCompletionRepository {
  async createWorkoutCompletion(
    completionData: Partial<IWorkoutCompletion>
  ): Promise<IWorkoutCompletion> {
    return WorkoutCompletionModel.create(completionData);
  }

  async getWorkoutCompletionById(id: string): Promise<IWorkoutCompletion | null> {
    return WorkoutCompletionModel.findById(id)
      .populate("userId", "name username email role level xp coins")
      .populate("workoutId", "title description category difficulty duration")
      .exec();
  }

  async getWorkoutCompletionsByUserId(userId: string): Promise<IWorkoutCompletion[]> {
    return WorkoutCompletionModel.find({ userId })
      .populate("workoutId", "title description category difficulty duration")
      .sort({ completedAt: -1 })
      .exec();
  }
}
