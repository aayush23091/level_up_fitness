import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { CoachHiringService } from "../services/coachHiring.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const coachHiringService = new CoachHiringService();

export class CoachHiringController {
    // GET /api/v1/coaches
    getAllCoaches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const specialization = req.query.specialization as string;

            const result = await coachHiringService.getAllCoaches(page, limit, search, specialization);
            return ApiResponseHelper.success(res, result.data, "Coaches fetched successfully", 200, result.meta);
        } catch (err: any) {
            return next(err);
        }
    };

    // GET /api/v1/coaches/:id
    getCoachById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                throw new HttpException(404, "Coach not found");
            }

            const coach = await coachHiringService.getCoachById(id);
            return ApiResponseHelper.success(res, coach, "Coach fetched successfully", 200);
        } catch (err: any) {
            return next(err);
        }
    };

    // POST /api/v1/coaches/:coachId/hire
    hireCoach = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coachId = req.params.coachId as string;
            if (!coachId) {
                throw new HttpException(400, "Coach ID is required");
            }

            const user = req.user as any;
            if (!user) {
                throw new HttpException(401, "Unauthorized");
            }

            const athleteId = user._id.toString();
            const remainingCoins = await coachHiringService.hireCoach(coachId, athleteId);

            return ApiResponseHelper.success(
                res,
                { remainingCoins },
                "Coach hired successfully",
                200
            );
        } catch (err: any) {
            return next(err);
        }
    };
}
