import { Request, Response, NextFunction } from "express";
import { CoachService } from "../services/coach.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const coachService = new CoachService();

export class CoachController {
  // GET /api/v1/coach/athletes
  getAthletes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;

      const { users, total } = await coachService.getAthletes(page, limit, search);
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

      return ApiResponseHelper.success(res, sanitizedUsers, "Athletes fetched successfully", 200, meta as any);
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
}
