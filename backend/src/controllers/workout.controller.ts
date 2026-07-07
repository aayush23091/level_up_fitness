import { Request, Response, NextFunction } from "express";
import { WorkoutService } from "../services/workout.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const workoutService = new WorkoutService();

export class WorkoutController {
  // GET /api/v1/workouts
  getWorkouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;
      const category = (req.query.category as string) || undefined;
      const difficulty = (req.query.difficulty as string) || undefined;

      const { workouts, total } = await workoutService.getWorkouts(
        page,
        limit,
        search,
        category,
        difficulty
      );
      
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      return ApiResponseHelper.success(res, workouts, "Workouts fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/workouts/:id
  getWorkoutById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout ID is required");
      }

      const workout = await workoutService.getWorkoutById(id);
      return ApiResponseHelper.success(res, workout, "Workout fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
