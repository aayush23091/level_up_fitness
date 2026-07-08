import { Request, Response, NextFunction } from "express";
import { CoachService } from "../services/coach.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const coachService = new CoachService();

export class CoachController {
  // GET /api/v1/coach/athletes
  getAthletes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coachId = (req.user as any)._id.toString();
      if (!coachId) {
        throw new HttpException(401, "Unauthorized: Coach ID not found");
      }

      const { users } = await coachService.getAthletes(coachId, 1, 1000);

      const sanitizedUsers = users.map((user) => {
        const u = user.toObject ? user.toObject() : user;
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          level: u.level || 0,
          coins: u.coins || 0,
        };
      });

      return ApiResponseHelper.success(res, sanitizedUsers, "Athletes fetched successfully", 200);
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
