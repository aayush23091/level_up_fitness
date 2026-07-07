import { WorkoutModel, IWorkout } from "../models/workout.model";

export class WorkoutRepository {
  async getWorkouts(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string
  ): Promise<{ workouts: IWorkout[]; total: number }> {
    const query: any = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
    }

    const skip = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      WorkoutModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      WorkoutModel.countDocuments(query).exec(),
    ]);

    return { workouts, total };
  }

  async getWorkoutById(id: string): Promise<IWorkout | null> {
    return WorkoutModel.findById(id).exec();
  }

  async createWorkout(workoutData: Partial<IWorkout>): Promise<IWorkout> {
    return WorkoutModel.create(workoutData);
  }
}
