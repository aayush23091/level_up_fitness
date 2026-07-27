import { Request, Response, NextFunction } from "express";
import { CoachService } from "../services/coach.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";

const coachService = new CoachService();

export class CoachController {
  // GET /api/v1/coach/athletes
  getAthletes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)._id.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: User ID not found");
      }

      // Verify user is a coach
      const coach = await UserModel.findById(userId);
      if (!coach || coach.role !== "coach") {
        throw new HttpException(403, "Access denied: Only coaches can view athletes");
      }

      const coachId = coach._id.toString();

      // Get pagination and search parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const { users, total } = await coachService.getAthletes(coachId, page, limit, search);

      const sanitizedUsers = users.map((user: any) => {
        const u = user.toObject ? user.toObject() : user;
        const coachClient = user.coachClient || {};
        return {
          _id: u._id.toString(),
          id: u._id.toString(),
          name: u.name,
          username: u.username,
          email: u.email,
          profilePhoto: u.profilePhoto,
          level: u.level || 0,
          xp: u.xp || 0,
          completedWorkouts: u.completedWorkouts || 0,
          totalAssignedWorkouts: u.totalAssignedWorkouts || 0,
          status: coachClient.status || "active",
          hiredAt: coachClient.hiredAt,
          createdAt: u.createdAt,
        };
      });

      const totalPages = Math.ceil(total / limit);

      return ApiResponseHelper.success(
        res,
        sanitizedUsers,
        "Athletes fetched successfully",
        200,
        {
          page,
          limit,
          total,
          totalPages,
        }
      );
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/athletes/:id
  getAthleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "Athlete ID is required");
      }

      const athlete = await coachService.getAthleteById(id);

      const u = athlete.toObject ? athlete.toObject() : athlete;
      const { password, ...sanitizedAthlete } = u;

      return ApiResponseHelper.success(res, sanitizedAthlete, "Athlete fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/dashboard/stats
  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)._id.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: User ID not found");
      }

      // Verify user is a coach
      const coach = await UserModel.findById(userId);
      if (!coach || coach.role !== "coach") {
        throw new HttpException(403, "Access denied: Only coaches can view dashboard stats");
      }

      const coachId = coach._id.toString();

      const stats = await coachService.getDashboardStats(coachId);

      return ApiResponseHelper.success(
        res,
        stats,
        "Dashboard stats fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/analytics/overview
  getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)._id.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: User ID not found");
      }

      const coach = await UserModel.findById(userId);
      if (!coach || coach.role !== "coach") {
        throw new HttpException(403, "Access denied: Only coaches can view analytics");
      }

      const overview = await coachService.getAnalyticsOverview(coach._id.toString());

      return ApiResponseHelper.success(
        res,
        overview,
        "Analytics overview fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/analytics/athletes
  getAnalyticsAthletes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)._id.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: User ID not found");
      }

      const coach = await UserModel.findById(userId);
      if (!coach || coach.role !== "coach") {
        throw new HttpException(403, "Access denied: Only coaches can view analytics");
      }

      const athletes = await coachService.getAnalyticsAthletes(coach._id.toString());

      return ApiResponseHelper.success(
        res,
        athletes,
        "Analytics athletes fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/coach/analytics/plans
  getAnalyticsPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)._id.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: User ID not found");
      }

      const coach = await UserModel.findById(userId);
      if (!coach || coach.role !== "coach") {
        throw new HttpException(403, "Access denied: Only coaches can view analytics");
      }

      const plans = await coachService.getAnalyticsPlans(coach._id.toString());

      return ApiResponseHelper.success(
        res,
        plans,
        "Analytics plans fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };
}
