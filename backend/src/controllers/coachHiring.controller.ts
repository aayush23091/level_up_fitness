import { Request, Response, NextFunction } from "express";
import { CoachHiringService } from "../services/coachHiring.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const coachHiringService = new CoachHiringService();

export class CoachHiringController {
    // GET /api/v1/coaches
    getAllCoaches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coaches = await coachHiringService.getAllCoaches();
            return ApiResponseHelper.success(res, coaches, "Coaches fetched successfully", 200);
        } catch (err: any) {
            return next(err);
        }
    };

    // GET /api/v1/coaches/:id
    getCoachById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            if (!id) {
                throw new HttpException(400, "Coach ID is required");
            }

            const coach = await coachHiringService.getCoachById(id);
            return ApiResponseHelper.success(res, coach, "Coach fetched successfully", 200);
        } catch (err: any) {
            return next(err);
        }
    };

    // POST /api/v1/coaches/:id/hire
    hireCoach = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coachId = req.params.id as string;
            if (!coachId) {
                throw new HttpException(400, "Coach ID is required");
            }

            const user = req.user as any;
            if (!user) {
                throw new HttpException(401, "Unauthorized");
            }

            const athleteId = user._id.toString();
            const { coachClient, updatedUser } = await coachHiringService.hireCoach(coachId, athleteId);

            return ApiResponseHelper.success(
                res,
                { coachClient, updatedUser },
                "Coach hired successfully",
                200
            );
        } catch (err: any) {
            return next(err);
        }
    };
}
