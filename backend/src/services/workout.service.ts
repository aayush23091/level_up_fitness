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

  async createWorkout(workoutData: Partial<IWorkout>, coachId: string): Promise<IWorkout> {
    workoutData.createdBy = coachId as any;
    return workoutRepository.createWorkout(workoutData);
  }

  async updateWorkout(id: string, workoutData: Partial<IWorkout>, coachId: string): Promise<IWorkout> {
    const workout = await workoutRepository.getWorkoutById(id);
    if (!workout) {
      throw new HttpException(404, "Workout not found");
    }
    
    // Check if the requesting coach is the creator
    if (workout.createdBy.toString() !== coachId) {
      throw new HttpException(403, "You can only edit your own workouts");
    }
    
    return workoutRepository.updateWorkout(id, workoutData);
  }

  async deleteWorkout(id: string, coachId: string): Promise<void> {
    const workout = await workoutRepository.getWorkoutById(id);
    if (!workout) {
      throw new HttpException(404, "Workout not found");
    }
    
    // Check if the requesting coach is the creator
    if (workout.createdBy.toString() !== coachId) {
      throw new HttpException(403, "You can only delete your own workouts");
    }
    
    const deleted = await workoutRepository.deleteWorkout(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete workout");
    }
  }
}
