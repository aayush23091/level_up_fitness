
import { Request, Response, NextFunction } from "express";
import { WorkoutCompletionService } from "../services/workoutCompletion.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";

const workoutCompletionService = new WorkoutCompletionService();

export class WorkoutCompletionController {
  completeWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser | undefined;
      if (!user) {
        throw new HttpException(401, "Unauthorized");
      }

      const workoutId = req.params.id as string;
      if (!workoutId) {
        throw new HttpException(400, "Workout ID is required");
      }

      const { duration } = req.body;
      if (!duration || typeof duration !== "number") {
        throw new HttpException(400, "Duration is required and must be a number");
      }

      const result = await workoutCompletionService.completeWorkout(
        user._id.toString(),
        workoutId,
        duration
      );

      return ApiResponseHelper.success(res, result, result.message, 200);
    } catch (err: any) {
      return next(err);
    }
  };

  getUserCompletions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser | undefined;
      if (!user) {
        throw new HttpException(401, "Unauthorized");
      }

      const completions = await workoutCompletionService.getUserWorkoutCompletions(
        user._id.toString()
      );

      return ApiResponseHelper.success(res, completions, "Workout completions fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
