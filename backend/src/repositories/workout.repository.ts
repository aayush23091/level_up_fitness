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
      WorkoutModel.find(query)
        .populate("createdBy", "name username email role")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      WorkoutModel.countDocuments(query).exec(),
    ]);

    return { workouts, total };
  }

  async getWorkoutById(id: string): Promise<IWorkout | null> {
    return WorkoutModel.findById(id)
      .populate("createdBy", "name username email role")
      .exec();
  }

  async createWorkout(workoutData: Partial<IWorkout>): Promise<IWorkout> {
    return WorkoutModel.create(workoutData);
  }

  async updateWorkout(id: string, workoutData: Partial<IWorkout>): Promise<IWorkout | null> {
    return WorkoutModel.findByIdAndUpdate(id, workoutData, { new: true }).exec();
  }

  async deleteWorkout(id: string): Promise<boolean> {
    const result = await WorkoutModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
