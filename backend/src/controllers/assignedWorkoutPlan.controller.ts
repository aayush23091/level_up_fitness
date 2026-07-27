import { Request, Response, NextFunction } from "express";
import { AssignedWorkoutPlanService } from "../services/assignedWorkoutPlan.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const assignedWorkoutPlanService = new AssignedWorkoutPlanService();

export class AssignedWorkoutPlanController {
  // POST /api/v1/coach/workout-plans/:planId/assign
  assignWorkoutPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const planId = req.params.planId as string;
      if (!planId) {
        throw new HttpException(400, "Workout plan ID is required");
      }

      const { athleteId } = req.body;
      if (!athleteId) {
        throw new HttpException(400, "Athlete ID is required");
      }

      const assignment = await assignedWorkoutPlanService.assignWorkoutPlan(
        coachId as string,
        planId,
        athleteId
      );

      return ApiResponseHelper.success(
        res,
        assignment,
        "Workout plan assigned successfully",
        201
      );
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/assigned-plans
  getCoachAssignedPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const assignedPlans = await assignedWorkoutPlanService.getCoachAssignedPlans(
        coachId as string
      );

      return ApiResponseHelper.success(
        res,
        assignedPlans,
        "Assigned plans fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/user/workout-plans
  getUserWorkoutPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const workoutPlans = await assignedWorkoutPlanService.getUserWorkoutPlans(
        userId as string
      );

      return ApiResponseHelper.success(
        res,
        workoutPlans,
        "Workout plans fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };
}
