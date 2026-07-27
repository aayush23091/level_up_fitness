import { WorkoutPlanModel, IWorkoutPlan } from "../models/workoutPlan.model";
import { AssignedWorkoutPlanModel } from "../models/assignedWorkoutPlan.model";

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

    // Batch count active assignments per workout plan
    const planIds = workoutPlans.map((plan: any) => plan._id);
    const assignedCounts: Record<string, number> = {};
    if (planIds.length > 0) {
      const assignmentAgg = await AssignedWorkoutPlanModel.aggregate([
        { $match: { workoutPlanId: { $in: planIds }, status: "active" } },
        { $group: { _id: "$workoutPlanId", count: { $sum: 1 } } },
      ]);
      assignmentAgg.forEach((item: any) => {
        assignedCounts[item._id.toString()] = item.count;
      });
    }

    // Post-process to handle inline exercises and add assignedAthletes
    workoutPlans.forEach(plan => {
      plan.assignedAthletes = assignedCounts[plan._id.toString()] || 0;
      plan.exercises.forEach(exercise => {
        if (!exercise.exerciseId && exercise.exerciseName) {
          // Inline exercise: data is already in the exercise object
          // No transformation needed
        }
      });
    });

    return { workoutPlans, total };
  }

    async getWorkoutPlanById(id: string, coachId: string): Promise<IWorkoutPlan | null> {
    const plan = await WorkoutPlanModel.findOne({ _id: id, coachId })
      .populate("exercises.exerciseId", "name category bodyPart equipment difficulty description instructions thumbnail videoUrl")
      .exec();

    if (plan) {
      const assignmentCount = await AssignedWorkoutPlanModel.countDocuments({
        workoutPlanId: plan._id,
        status: "active",
      }).exec();
      (plan as any).assignedAthletes = assignmentCount;
    }

    return plan;
  }

    async getWorkoutPlanByIdPublic(id: string): Promise<IWorkoutPlan | null> {
    const plan = await WorkoutPlanModel.findById(id)
      .populate("exercises.exerciseId", "name category bodyPart equipment difficulty description instructions thumbnail videoUrl")
      .exec();

    if (plan) {
      const assignmentCount = await AssignedWorkoutPlanModel.countDocuments({
        workoutPlanId: plan._id,
        status: "active",
      }).exec();
      (plan as any).assignedAthletes = assignmentCount;
    }

    return plan;
  }

  async createWorkoutPlan(workoutPlanData: Partial<IWorkoutPlan>): Promise<IWorkoutPlan> {
    const created = await WorkoutPlanModel.create(workoutPlanData);
    (created as any).assignedAthletes = 0;
    return created;
  }

  async updateWorkoutPlan(id: string, coachId: string, workoutPlanData: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null> {
    const updated = await WorkoutPlanModel.findOneAndUpdate(
      { _id: id, coachId },
      workoutPlanData,
      { new: true }
    ).populate("exercises.exerciseId", "name category bodyPart equipment difficulty").exec();

    if (updated) {
      const assignmentCount = await AssignedWorkoutPlanModel.countDocuments({
        workoutPlanId: updated._id,
        status: "active",
      }).exec();
      (updated as any).assignedAthletes = assignmentCount;

      // Post-process to handle inline exercises (when exerciseId is not present)
      updated.exercises.forEach(exercise => {
        if (!exercise.exerciseId && exercise.exerciseName) {
          // Inline exercise: data is already in the exercise object
          // No transformation needed
        }
      });
    }

    return updated;
  }

  async deleteWorkoutPlan(id: string, coachId: string): Promise<boolean> {
    const result = await WorkoutPlanModel.findOneAndDelete({ _id: id, coachId }).exec();
    return !!result;
  }
}
