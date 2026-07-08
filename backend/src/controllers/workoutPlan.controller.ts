import { Request, Response, NextFunction } from "express";
import { WorkoutPlanService } from "../services/workoutPlan.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateWorkoutPlanDTO, UpdateWorkoutPlanDTO } from "../dtos/workoutPlan.dto";
import mongoose from "mongoose";

const workoutPlanService = new WorkoutPlanService();

export class WorkoutPlanController {
  // GET /api/v1/coach/workout-plans
  getWorkoutPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = (req.query.status as string) || undefined;

      const { workoutPlans, total } = await workoutPlanService.getWorkoutPlans(
        coachId as string,
        page,
        limit,
        status
      );
      
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      return ApiResponseHelper.success(res, workoutPlans, "Workout plans fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/workout-plans/:id
  getWorkoutPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout plan ID is required");
      }

      const workoutPlan = await workoutPlanService.getWorkoutPlanById(id, coachId as string);
      return ApiResponseHelper.success(res, workoutPlan, "Workout plan fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // POST /api/v1/coach/workout-plans
  createWorkoutPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const validatedData = CreateWorkoutPlanDTO.parse(req.body);
      
      // Convert exerciseId strings to ObjectId
      const exercises = validatedData.exercises?.map(ex => ({
        ...ex,
        exerciseId: new mongoose.Types.ObjectId(ex.exerciseId),
      }));

      const workoutPlan = await workoutPlanService.createWorkoutPlan({
        ...validatedData,
        coachId: coachId as any,
        exercises,
      });
      
      return ApiResponseHelper.success(res, workoutPlan, "Workout plan created successfully", 201);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  // PUT /api/v1/coach/workout-plans/:id
  updateWorkoutPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout plan ID is required");
      }

      const validatedData = UpdateWorkoutPlanDTO.parse(req.body);
      
      // Convert exerciseId strings to ObjectId if exercises are provided
      let exercises;
      if (validatedData.exercises) {
        exercises = validatedData.exercises.map(ex => ({
          ...ex,
          exerciseId: new mongoose.Types.ObjectId(ex.exerciseId),
        }));
      }

      const workoutPlan = await workoutPlanService.updateWorkoutPlan(id, coachId as string, {
        ...validatedData,
        exercises,
      });
      return ApiResponseHelper.success(res, workoutPlan, "Workout plan updated successfully", 200);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  // DELETE /api/v1/coach/workout-plans/:id
  deleteWorkoutPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout plan ID is required");
      }

      await workoutPlanService.deleteWorkoutPlan(id, coachId as string);
      return ApiResponseHelper.success(res, null, "Workout plan deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
