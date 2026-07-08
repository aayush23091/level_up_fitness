import { CoachProfileModel, ICoachProfile } from "../models/coachProfile.model";
import { CoachClientModel, ICoachClient } from "../models/coachClient.model";
import { UserModel, IUser } from "../models/user.model";

export class CoachHiringRepository {
    async getAllCoaches(): Promise<ICoachProfile[]> {
        return CoachProfileModel.find({ available: true })
            .populate("userId", "name email profilePhoto")
            .sort({ rating: -1 })
            .exec();
    }

    async getCoachById(id: string): Promise<ICoachProfile | null> {
        return CoachProfileModel.findById(id)
            .populate("userId", "name email profilePhoto")
            .exec();
    }

    async getCoachByUserId(userId: string): Promise<ICoachProfile | null> {
        return CoachProfileModel.findOne({ userId })
            .populate("userId", "name email profilePhoto")
            .exec();
    }

    async createCoachClient(coachId: string, athleteId: string): Promise<ICoachClient> {
        return CoachClientModel.create({
            coachId,
            athleteId,
            hiredAt: new Date(),
            status: "active"
        });
    }

    async getCoachClientRelationship(coachId: string, athleteId: string): Promise<ICoachClient | null> {
        return CoachClientModel.findOne({ coachId, athleteId }).exec();
    }

    async getUserById(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId).exec();
    }

    async updateUserCoins(userId: string, coins: number): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(userId, { coins }, { new: true }).exec();
    }

    async incrementCoachTotalClients(coachId: string): Promise<ICoachProfile | null> {
        return CoachProfileModel.findByIdAndUpdate(
            coachId,
            { $inc: { totalClients: 1 } },
            { new: true }
        ).exec();
    }
}
