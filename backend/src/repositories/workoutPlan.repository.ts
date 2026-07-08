import { WorkoutPlanModel, IWorkoutPlan } from "../models/workoutPlan.model";

export class WorkoutPlanRepository {
  async getWorkoutPlans(
    coachId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{ workoutPlans: IWorkoutPlan[]; total: number }> {
    const query: any = { coachId };
    
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [workoutPlans, total] = await Promise.all([
      WorkoutPlanModel.find(query)
        .populate("exercises.exerciseId", "name category bodyPart equipment difficulty")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      WorkoutPlanModel.countDocuments(query).exec(),
    ]);

    return { workoutPlans, total };
  }

  async getWorkoutPlanById(id: string, coachId: string): Promise<IWorkoutPlan | null> {
    return WorkoutPlanModel.findOne({ _id: id, coachId })
      .populate("exercises.exerciseId", "name category bodyPart equipment difficulty description instructions thumbnail videoUrl")
      .exec();
  }

  async createWorkoutPlan(workoutPlanData: Partial<IWorkoutPlan>): Promise<IWorkoutPlan> {
    return WorkoutPlanModel.create(workoutPlanData);
  }

  async updateWorkoutPlan(id: string, coachId: string, workoutPlanData: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null> {
    return WorkoutPlanModel.findOneAndUpdate(
      { _id: id, coachId },
      workoutPlanData,
      { new: true }
    ).populate("exercises.exerciseId", "name category bodyPart equipment difficulty").exec();
  }

  async deleteWorkoutPlan(id: string, coachId: string): Promise<boolean> {
    const result = await WorkoutPlanModel.findOneAndDelete({ _id: id, coachId }).exec();
    return !!result;
  }
}
