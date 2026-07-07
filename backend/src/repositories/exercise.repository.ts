import { ExerciseModel, IExercise } from "../models/exercise.model";

export class ExerciseRepository {
  async getExercises(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    bodyPart?: string,
    difficulty?: string
  ): Promise<{ exercises: IExercise[]; total: number }> {
    const query: any = { isActive: true };

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { description: regex }];
    }

    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (bodyPart && bodyPart !== "all") {
      query.bodyPart = { $regex: new RegExp(`^${bodyPart}$`, "i") };
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
    }

    const skip = (page - 1) * limit;

    const [exercises, total] = await Promise.all([
      ExerciseModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      ExerciseModel.countDocuments(query).exec(),
    ]);

    return { exercises, total };
  }

  async getExerciseById(id: string): Promise<IExercise | null> {
    return ExerciseModel.findOne({ _id: id, isActive: true }).exec();
  }

  async createExercise(exerciseData: Partial<IExercise>): Promise<IExercise> {
    return ExerciseModel.create(exerciseData);
  }

  async updateExercise(id: string, exerciseData: Partial<IExercise>): Promise<IExercise | null> {
    return ExerciseModel.findByIdAndUpdate(id, exerciseData, { new: true }).exec();
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await ExerciseModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
