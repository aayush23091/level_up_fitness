import { AssignedWorkoutPlanModel, IAssignedWorkoutPlan } from "../models/assignedWorkoutPlan.model";
import { WorkoutPlanModel, IWorkoutPlan } from "../models/workoutPlan.model";
import { CoachClientModel } from "../models/coachClient.model";
import { HttpException } from "../exceptions/http-exception";

export class AssignedWorkoutPlanService {
  async assignWorkoutPlan(
    coachId: string,
    workoutPlanId: string,
    athleteId: string
  ): Promise<IAssignedWorkoutPlan> {
    // Verify workout plan exists and belongs to the coach
    const workoutPlan = await WorkoutPlanModel.findOne({
      _id: workoutPlanId,
      coachId,
    }).exec();

    if (!workoutPlan) {
      throw new HttpException(404, "Workout plan not found or you don't have permission");
    }

    if (workoutPlan.status !== "Published") {
      throw new HttpException(400, "Can only assign published workout plans");
    }

    // Verify athlete has hired this coach
    const coachClient = await CoachClientModel.findOne({
      coachId,
      athleteId,
      status: "active",
    }).exec();

    if (!coachClient) {
      throw new HttpException(403, "Athlete has not hired this coach");
    }

    // Check for duplicate assignment
    const existingAssignment = await AssignedWorkoutPlanModel.findOne({
      workoutPlanId,
      athleteId,
    }).exec();

    if (existingAssignment) {
      throw new HttpException(409, "Workout plan already assigned to this athlete");
    }

    // Create assignment
    const assignment = await AssignedWorkoutPlanModel.create({
      coachId,
      athleteId,
      workoutPlanId,
      assignedAt: new Date(),
    });

    return assignment;
  }

  async getCoachAssignedPlans(coachId: string): Promise<any[]> {
    const assignments = await AssignedWorkoutPlanModel.find({ coachId })
      .populate("athleteId", "name username email profilePhoto level xp")
      .populate("workoutPlanId")
      .sort({ assignedAt: -1 })
      .exec();

    return assignments.map((assignment: any) => ({
      _id: assignment._id,
      athlete: assignment.athleteId,
      workoutPlan: assignment.workoutPlanId,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      createdAt: assignment.createdAt,
    }));
  }

  async getUserWorkoutPlans(userId: string): Promise<any[]> {
    const assignments = await AssignedWorkoutPlanModel.find({
      athleteId: userId,
      status: "active",
    })
      .populate("workoutPlanId")
      .populate("coachId", "name username profilePhoto")
      .sort({ assignedAt: -1 })
      .exec();

    return assignments.map((assignment: any) => {
      const workoutPlan = assignment.workoutPlanId;
      const coach = assignment.coachId;

      return {
        _id: assignment._id,
        title: workoutPlan.title,
        coach: coach.name,
        coachUsername: coach.username,
        coachProfilePhoto: coach.profilePhoto,
        difficulty: workoutPlan.difficulty,
        estimatedDuration: workoutPlan.estimatedDuration,
        exercises: workoutPlan.exercises,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
      };
    });
  }
}
