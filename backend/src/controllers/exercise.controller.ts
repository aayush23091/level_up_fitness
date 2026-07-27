import { Request, Response, NextFunction } from "express";
import { ExerciseService } from "../services/exercise.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";

const exerciseService = new ExerciseService();

export class ExerciseController {
  // GET /api/v1/exercises
  getExercises = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;
      const category = (req.query.category as string) || undefined;
      const bodyPart = (req.query.bodyPart as string) || undefined;
      const difficulty = (req.query.difficulty as string) || undefined;

      const { exercises, total } = await exerciseService.getExercises(
        page,
        limit,
        search,
        category,
        bodyPart,
        difficulty
      );
      
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      return ApiResponseHelper.success(res, exercises, "Exercises fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/exercises/:id
  getExerciseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Exercise ID is required");
      }

      const exercise = await exerciseService.getExerciseById(id);
      return ApiResponseHelper.success(res, exercise, "Exercise fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // POST /api/v1/exercises
  createExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = CreateExerciseDTO.parse(req.body);
      
      const exercise = await exerciseService.createExercise(validatedData);
      return ApiResponseHelper.success(res, exercise, "Exercise created successfully", 201);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  // PUT /api/v1/exercises/:id
  updateExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Exercise ID is required");
      }

      const validatedData = UpdateExerciseDTO.parse(req.body);
      
      const exercise = await exerciseService.updateExercise(id, validatedData);
      return ApiResponseHelper.success(res, exercise, "Exercise updated successfully", 200);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  // DELETE /api/v1/exercises/:id
  deleteExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Exercise ID is required");
      }

      await exerciseService.deleteExercise(id);
      return ApiResponseHelper.success(res, null, "Exercise deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
