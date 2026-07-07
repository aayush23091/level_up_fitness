import { ExerciseRepository } from "../repositories/exercise.repository";
import { IExercise } from "../models/exercise.model";
import { HttpException } from "../exceptions/http-exception";

const exerciseRepository = new ExerciseRepository();

export class ExerciseService {
  async getExercises(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    bodyPart?: string,
    difficulty?: string
  ): Promise<{ exercises: IExercise[]; total: number }> {
    return exerciseRepository.getExercises(page, limit, search, category, bodyPart, difficulty);
  }

  async getExerciseById(id: string): Promise<IExercise> {
    const exercise = await exerciseRepository.getExerciseById(id);
    if (!exercise) {
      throw new HttpException(404, "Exercise not found");
    }
    return exercise;
  }

  async createExercise(exerciseData: Partial<IExercise>): Promise<IExercise> {
    return exerciseRepository.createExercise(exerciseData);
  }

  async updateExercise(id: string, exerciseData: Partial<IExercise>): Promise<IExercise> {
    const exercise = await exerciseRepository.getExerciseById(id);
    if (!exercise) {
      throw new HttpException(404, "Exercise not found");
    }
    
    const updated = await exerciseRepository.updateExercise(id, exerciseData);
    if (!updated) {
      throw new HttpException(500, "Failed to update exercise");
    }
    return updated;
  }

  async deleteExercise(id: string): Promise<void> {
    const exercise = await exerciseRepository.getExerciseById(id);
    if (!exercise) {
      throw new HttpException(404, "Exercise not found");
    }
    
    const deleted = await exerciseRepository.deleteExercise(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete exercise");
    }
  }
}
