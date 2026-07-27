import { CoachProfileModel, ICoachProfile } from "../models/coachProfile.model";
import { CoachClientModel, ICoachClient } from "../models/coachClient.model";
import { UserModel, IUser } from "../models/user.model";

export class CoachHiringRepository {
    async getAllCoaches(page: number = 1, limit: number = 10, search?: string, specialization?: string): Promise<{ coaches: IUser[]; total: number }> {
        const skip = (page - 1) * limit;

        // Build base query: only coach users
        const query: any = { role: "coach" };

        // Add search filter if provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } }
            ];
        }

        // Add specialization filter if provided (nested inside coachProfile)
        if (specialization && specialization !== "all") {
            query["coachProfile.specialization"] = { $in: [specialization] };
        }

        // Get total count
        const total = await UserModel.countDocuments(query).exec();

        // Get paginated results
        const coaches = await UserModel.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        return { coaches, total };
    }

    async getCoachById(id: string): Promise<IUser | null> {
        return UserModel.findOne({ _id: id, role: "coach" }).exec();
    }

    async getCoachByUserId(userId: string): Promise<IUser | null> {
        return UserModel.findOne({ _id: userId, role: "coach" }).exec();
    }

    async createCoachClient(coachId: string, athleteId: string, transactionId?: string): Promise<ICoachClient> {
        return CoachClientModel.create({
            coachId,
            athleteId,
            transactionId,
            hiredAt: new Date(),
            status: "active"
        });
    }

    async getCoachClientRelationship(coachId: string, athleteId: string): Promise<ICoachClient | null> {
        return CoachClientModel.findOne({ coachId, athleteId, status: "active" }).exec();
    }

    async getUserById(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId).exec();
    }

    async updateUserCoins(userId: string, coins: number): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(userId, { coins }, { new: true }).exec();
    }

    async incrementCoachTotalClients(coachId: string): Promise<IUser | null> {
        // No longer tracking total clients in separate model
        return UserModel.findById(coachId).exec();
    }
}
