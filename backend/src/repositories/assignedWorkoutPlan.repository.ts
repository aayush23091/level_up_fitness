import { AssignedWorkoutPlanModel, IAssignedWorkoutPlan } from "../models/assignedWorkoutPlan.model";

export class AssignedWorkoutPlanRepository {
  async getAssignedWorkoutPlanById(id: string): Promise<IAssignedWorkoutPlan | null> {
    return AssignedWorkoutPlanModel.findById(id)
      .populate("workoutPlanId")
      .exec();
  }

  async completeAssignedWorkoutPlan(id: string): Promise<IAssignedWorkoutPlan | null> {
    return AssignedWorkoutPlanModel.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    ).exec();
  }
}