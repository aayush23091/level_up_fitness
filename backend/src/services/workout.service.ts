import { WorkoutRepository } from "../repositories/workout.repository";
import { IWorkout } from "../models/workout.model";
import { HttpException } from "../exceptions/http-exception";

const workoutRepository = new WorkoutRepository();

export class WorkoutService {
  async getWorkouts(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string
  ): Promise<{ workouts: IWorkout[]; total: number }> {
    return workoutRepository.getWorkouts(page, limit, search, category, difficulty);
  }

  async getWorkoutById(id: string): Promise<IWorkout> {
    const workout = await workoutRepository.getWorkoutById(id);
    if (!workout) {
      throw new HttpException(404, "Workout not found");
    }
    return workout;
  }
}
