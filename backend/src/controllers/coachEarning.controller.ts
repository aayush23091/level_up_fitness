import { Request, Response, NextFunction } from "express";
import { CoachEarningService } from "../services/coachEarning.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";

const coachEarningService = new CoachEarningService();

export class CoachEarningController {
  getEarnings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)._id.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: User ID not found");
      }

      const coach = await UserModel.findById(userId);
      if (!coach || coach.role !== "coach") {
        throw new HttpException(403, "Access denied: Only coaches can view earnings");
      }

      const coachId = coach._id.toString();

      const earnings = await coachEarningService.getCoachEarnings(coachId);

      return ApiResponseHelper.success(
        res,
        earnings,
        "Earnings fetched successfully",
        200
      );
    } catch (err: any) {
      return next(err);
    }
  };
}
