import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../services/admin.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { CreateWorkoutDTO, UpdateWorkoutDTO } from "../dtos/workout.dto";
import { CreateAchievementDTO, UpdateAchievementDTO } from "../dtos/achievement.dto";

const adminUserService = new AdminUserService();

export class AdminController {
  // GET /api/v1/admin/users
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;

      const { users, total } = await adminUserService.getUsers(page, limit, search);
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      const sanitizedUsers = users.map((user) => {
        const u = user.toObject ? user.toObject() : user;
        const { password, ...rest } = u;
        return rest;
      });

      return ApiResponseHelper.success(res, sanitizedUsers, "Users fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/users/:id
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "User ID is required");
      }

      const user = await adminUserService.getUserById(id);

      const u = user.toObject ? user.toObject() : user;
      const { password, ...sanitizedUser } = u;

      return ApiResponseHelper.success(res, sanitizedUser, "User fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // POST /api/v1/admin/users
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = AdminCreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues
          .map((e) => e.path.join(".") + ": " + e.message)
          .join(", ");
        throw new HttpException(400, "Validation failed: " + errorMsg);
      }

      const newUser = await adminUserService.createUser(parsed.data);

      const u = newUser.toObject ? newUser.toObject() : newUser;
      const { password, ...sanitizedUser } = u;

      return ApiResponseHelper.success(res, sanitizedUser, "User created successfully", 201);
    } catch (err: any) {
      return next(err);
    }
  };

  // PUT /api/v1/admin/users/:id
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "User ID is required");
      }

      const parsed = AdminUpdateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues
          .map((e) => e.path.join(".") + ": " + e.message)
          .join(", ");
        throw new HttpException(400, "Validation failed: " + errorMsg);
      }

      const updatedUser = await adminUserService.updateUser(id, parsed.data);

      const u = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      const { password, ...sanitizedUser } = u;

      return ApiResponseHelper.success(res, sanitizedUser, "User updated successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // DELETE /api/v1/admin/users/:id
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "User ID is required");
      }

      await adminUserService.deleteUser(id);

      return ApiResponseHelper.success(res, null, "User deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/dashboard/stats
  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await adminUserService.getDashboardStats();

      // Sanitize users
      const sanitizeUsers = (users: any[]) => users.map(user => {
        const u = user.toObject ? user.toObject() : user;
        const { password, ...rest } = u;
        return rest;
      });

      const sanitizedStats = {
        ...stats,
        recentUsers: sanitizeUsers(stats.recentUsers),
        recentCoaches: sanitizeUsers(stats.recentCoaches)
      };

      return ApiResponseHelper.success(res, sanitizedStats, "Dashboard stats fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/coaches
  getCoaches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;

      const { coaches, total } = await adminUserService.getCoaches(page, limit, search);
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      // Sanitize coaches (remove password)
      const sanitizedCoaches = coaches.map((coach) => {
        const { password, ...rest } = coach;
        return rest;
      });

      return ApiResponseHelper.success(res, sanitizedCoaches, "Coaches fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/coaches/:id
  getCoachById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Coach ID is required");
      }

      const coach = await adminUserService.getCoachById(id);

      const { password, ...sanitizedCoach } = coach;

      return ApiResponseHelper.success(res, sanitizedCoach, "Coach fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // DELETE /api/v1/admin/coaches/:id
  deleteCoach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Coach ID is required");
      }

      await adminUserService.deleteCoach(id);

      return ApiResponseHelper.success(res, null, "Coach deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/workouts
  getWorkouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;

      const { workouts, total } = await adminUserService.getWorkouts(page, limit, search);
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

  // GET /api/v1/admin/workouts/:id
  getWorkoutById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout ID is required");
      }

      const workout = await adminUserService.getWorkoutById(id);
      return ApiResponseHelper.success(res, workout, "Workout fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // POST /api/v1/admin/workouts
  createWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateWorkoutDTO.parse(req.body);
      const userId = (req.user as any)._id.toString();
      
      const workoutData = {
        ...parsed,
        createdBy: userId
      };
      
      const workout = await adminUserService.createWorkout(workoutData);
      return ApiResponseHelper.success(res, workout, "Workout created successfully", 201);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  // PUT /api/v1/admin/workouts/:id
  updateWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout ID is required");
      }

      const parsed = UpdateWorkoutDTO.parse(req.body);
      const workout = await adminUserService.updateWorkout(id, parsed);
      return ApiResponseHelper.success(res, workout, "Workout updated successfully", 200);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  // DELETE /api/v1/admin/workouts/:id
  deleteWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Workout ID is required");
      }

      await adminUserService.deleteWorkout(id);
      return ApiResponseHelper.success(res, null, "Workout deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  getAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const { achievements, total } = await adminUserService.getAchievements(page, limit, search, status);
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      return ApiResponseHelper.success(res, achievements, "Achievements fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  getAchievementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Achievement ID is required");
      }

      const achievement = await adminUserService.getAchievementById(id);
      return ApiResponseHelper.success(res, achievement, "Achievement fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  createAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateAchievementDTO.parse(req.body);
      const achievement = await adminUserService.createAchievement(parsed);
      return ApiResponseHelper.success(res, achievement, "Achievement created successfully", 201);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Achievement ID is required");
      }

      const parsed = UpdateAchievementDTO.parse(req.body);
      const achievement = await adminUserService.updateAchievement(id, parsed);
      return ApiResponseHelper.success(res, achievement, "Achievement updated successfully", 200);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return next(new HttpException(400, err.errors[0].message));
      }
      return next(err);
    }
  };

  deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Achievement ID is required");
      }

      await adminUserService.deleteAchievement(id);
      return ApiResponseHelper.success(res, null, "Achievement deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
