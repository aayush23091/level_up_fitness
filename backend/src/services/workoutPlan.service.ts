import { WorkoutPlanRepository } from "../repositories/workoutPlan.repository";
import { IWorkoutPlan } from "../models/workoutPlan.model";
import { HttpException } from "../exceptions/http-exception";

const workoutPlanRepository = new WorkoutPlanRepository();

export class WorkoutPlanService {
  async getWorkoutPlans(
    coachId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{ workoutPlans: IWorkoutPlan[]; total: number }> {
    return workoutPlanRepository.getWorkoutPlans(coachId, page, limit, status);
  }

  async getWorkoutPlanById(id: string, coachId: string): Promise<IWorkoutPlan> {
    const workoutPlan = await workoutPlanRepository.getWorkoutPlanById(id, coachId);
    if (!workoutPlan) {
      throw new HttpException(404, "Workout plan not found");
    }
    return workoutPlan;
  }

  async createWorkoutPlan(workoutPlanData: Partial<IWorkoutPlan>): Promise<IWorkoutPlan> {
    // Ensure exercises are sorted by order
    if (workoutPlanData.exercises && workoutPlanData.exercises.length > 0) {
      workoutPlanData.exercises.sort((a, b) => a.order - b.order);
    }
    return workoutPlanRepository.createWorkoutPlan(workoutPlanData);
  }

  async updateWorkoutPlan(id: string, coachId: string, workoutPlanData: Partial<IWorkoutPlan>): Promise<IWorkoutPlan> {
    const workoutPlan = await workoutPlanRepository.getWorkoutPlanById(id, coachId);
    if (!workoutPlan) {
      throw new HttpException(404, "Workout plan not found");
    }
    
    // Ensure exercises are sorted by order if provided
    if (workoutPlanData.exercises && workoutPlanData.exercises.length > 0) {
      workoutPlanData.exercises.sort((a, b) => a.order - b.order);
    }
    
    const updated = await workoutPlanRepository.updateWorkoutPlan(id, coachId, workoutPlanData);
    if (!updated) {
      throw new HttpException(500, "Failed to update workout plan");
    }
    return updated;
  }

  async deleteWorkoutPlan(id: string, coachId: string): Promise<void> {
    const workoutPlan = await workoutPlanRepository.getWorkoutPlanById(id, coachId);
    if (!workoutPlan) {
      throw new HttpException(404, "Workout plan not found");
    }
    
    const deleted = await workoutPlanRepository.deleteWorkoutPlan(id, coachId);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete workout plan");
    }
  }

  async publishWorkoutPlan(id: string, coachId: string): Promise<IWorkoutPlan> {
    const workoutPlan = await workoutPlanRepository.getWorkoutPlanById(id, coachId);
    if (!workoutPlan) {
      throw new HttpException(404, "Workout plan not found");
    }

    if (workoutPlan.status === "Published") {
      throw new HttpException(400, "Workout plan is already published");
    }

    const updated = await workoutPlanRepository.updateWorkoutPlan(id, coachId, { status: "Published" });
    if (!updated) {
      throw new HttpException(500, "Failed to publish workout plan");
    }
    return updated;
  }
}
