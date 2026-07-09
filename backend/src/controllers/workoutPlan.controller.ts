import { Request, Response, NextFunction } from "express";
import { WorkoutPlanService } from "../services/workoutPlan.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateWorkoutPlanDTO, UpdateWorkoutPlanDTO } from "../dtos/workoutPlan.dto";
import mongoose from "mongoose";
import { workoutCoverUploadMiddleware } from "../middlewares/upload.middleware";

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

      // Parse exercises from JSON string if it's a string (from FormData)
      const body = { ...req.body };
      if (body.exercises && typeof body.exercises === "string") {
        body.exercises = JSON.parse(body.exercises);
      }
      // Convert numeric fields from strings to numbers
      if (typeof body.estimatedDuration === "string") {
        body.estimatedDuration = parseInt(body.estimatedDuration);
      }
      if (body.exercises && Array.isArray(body.exercises)) {
        body.exercises = body.exercises.map((ex: any) => ({
          ...ex,
          sets: typeof ex.sets === "string" ? parseInt(ex.sets) : ex.sets,
          restSeconds: typeof ex.restSeconds === "string" ? parseInt(ex.restSeconds) : ex.restSeconds,
          order: typeof ex.order === "string" ? parseInt(ex.order) : ex.order,
        }));
      }

      let validatedData;
      try {
        validatedData = CreateWorkoutPlanDTO.parse(body);
      } catch (parseErr: any) {
        throw new HttpException(400, parseErr.issues[0].message);
      }
      
      // Convert exerciseId strings to ObjectId if provided, otherwise use inline exercise data
      const exercises = validatedData.exercises?.map(ex => {
        if (ex.exerciseId) {
          // Backward compatibility: convert exerciseId to ObjectId
          return {
            ...ex,
            exerciseId: new mongoose.Types.ObjectId(ex.exerciseId),
          };
        }
        // New inline exercise approach: use exerciseName and category directly
        return {
          ...ex,
          exerciseId: undefined,
        };
      });

      // Handle cover image if uploaded
      let coverImagePath: string | undefined;
      if (req.file) {
        coverImagePath = `/uploads/workout-covers/${req.file.filename}`;
      }

      const workoutPlan = await workoutPlanService.createWorkoutPlan({
        ...validatedData,
        coachId: coachId as any,
        exercises,
        coverImage: coverImagePath,
      });
      
      return ApiResponseHelper.success(res, workoutPlan, "Workout plan created successfully", 201);
    } catch (err: any) {
      if (err instanceof HttpException) {
        return next(err);
      }
      return next(new HttpException(500, err.message || "Internal server error"));
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

      // Parse exercises from JSON string if it's a string (from FormData)
      const body = { ...req.body };
      if (body.exercises && typeof body.exercises === "string") {
        body.exercises = JSON.parse(body.exercises);
      }
      // Convert numeric fields from strings to numbers
      if (typeof body.estimatedDuration === "string") {
        body.estimatedDuration = parseInt(body.estimatedDuration);
      }
      if (body.exercises && Array.isArray(body.exercises)) {
        body.exercises = body.exercises.map((ex: any) => ({
          ...ex,
          sets: typeof ex.sets === "string" ? parseInt(ex.sets) : ex.sets,
          restSeconds: typeof ex.restSeconds === "string" ? parseInt(ex.restSeconds) : ex.restSeconds,
          order: typeof ex.order === "string" ? parseInt(ex.order) : ex.order,
        }));
      }

      let validatedData;
      try {
        validatedData = UpdateWorkoutPlanDTO.parse(body);
      } catch (parseErr: any) {
        throw new HttpException(400, parseErr.issues[0].message);
      }
      
      // Convert exerciseId strings to ObjectId if provided, otherwise use inline exercise data
      let exercises;
      if (validatedData.exercises) {
        exercises = validatedData.exercises.map(ex => {
          if (ex.exerciseId) {
            // Backward compatibility: convert exerciseId to ObjectId
            return {
              ...ex,
              exerciseId: new mongoose.Types.ObjectId(ex.exerciseId),
            };
          }
          // New inline exercise approach: use exerciseName and category directly
          return {
            ...ex,
            exerciseId: undefined,
          };
        });
      }

      // Handle cover image if uploaded
      let coverImagePath: string | undefined;
      if (req.file) {
        coverImagePath = `/uploads/workout-covers/${req.file.filename}`;
      }

      const workoutPlan = await workoutPlanService.updateWorkoutPlan(id, coachId as string, {
        ...validatedData,
        exercises,
        coverImage: coverImagePath,
      });
      return ApiResponseHelper.success(res, workoutPlan, "Workout plan updated successfully", 200);
    } catch (err: any) {
      if (err instanceof HttpException) {
        return next(err);
      }
      return next(new HttpException(500, err.message || "Internal server error"));
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

  // PATCH /api/v1/coach/workout-plans/:id/publish
  publishWorkoutPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = req.user?._id;
      if (!coachId) {
        throw new HttpException(401, "Unauthorized");
      }

      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout plan ID is required");
      }

      const workoutPlan = await workoutPlanService.publishWorkoutPlan(id, coachId as string);
      return ApiResponseHelper.success(res, workoutPlan, "Workout plan published successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
