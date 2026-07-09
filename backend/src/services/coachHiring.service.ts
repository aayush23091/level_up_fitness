import { CoachHiringRepository } from "../repositories/coachHiring.repository";
import { CoachEarningRepository } from "../repositories/coachEarning.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { ICoachClient } from "../models/coachClient.model";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const coachHiringRepository = new CoachHiringRepository();
const coachEarningRepository = new CoachEarningRepository();
const transactionRepository = new TransactionRepository();

export class CoachHiringService {
    async getAllCoaches(page: number = 1, limit: number = 10, search?: string, specialization?: string): Promise<{ data: any[]; meta: any }> {
        const { coaches, total } = await coachHiringRepository.getAllCoaches(page, limit, search, specialization);
        const transformedCoaches = coaches.map(coach => this.transformCoachUser(coach));
        const totalPages = Math.ceil(total / limit);

        return {
            data: transformedCoaches,
            meta: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getCoachById(id: string): Promise<any> {
        const coach = await coachHiringRepository.getCoachById(id);
        if (!coach) {
            throw new HttpException(404, "Coach not found");
        }
        return this.transformCoachUser(coach);
    }

    private transformCoachUser(coach: IUser): any {
        return {
            _id: coach._id,
            name: coach.name || "Coach",
            username: coach.username || "",
            email: coach.email || "",
            profilePhoto: coach.profilePhoto || null,
            coachProfile: {
                bio: coach.coachProfile?.bio,
                specialization: coach.coachProfile?.specialization,
                experience: coach.coachProfile?.experience,
                hireCost: coach.coachProfile?.hireCost,
                availability: coach.coachProfile?.availability,
                profileImage: coach.coachProfile?.profileImage
            }
        };
    }

    async hireCoach(coachId: string, athleteId: string): Promise<number> {
        // Check if coach exists and is available
        const coach = await coachHiringRepository.getCoachById(coachId);
        if (!coach) {
            throw new HttpException(404, "Coach not found");
        }
        if (!coach.coachProfile?.availability) {
            throw new HttpException(400, "Coach is not available for hiring");
        }

        // Check if athlete exists
        const athlete = await coachHiringRepository.getUserById(athleteId);
        if (!athlete) {
            throw new HttpException(404, "Athlete not found");
        }

        // Check if athlete has user role (not admin or coach)
        if (athlete.role !== "user") {
            throw new HttpException(403, "Only users can hire coaches");
        }

        // Get hire cost
        const hireCost = coach.coachProfile?.hireCost || 0;

        // Check if athlete has enough coins
        if ((athlete.coins || 0) < hireCost) {
            throw new HttpException(400, "Insufficient coins");
        }

        // Check for duplicate hiring (only active relationships)
        const existingRelationship = await coachHiringRepository.getCoachClientRelationship(coachId, athleteId);
        if (existingRelationship) {
            throw new HttpException(400, "Already hired this coach");
        }

        // Deduct coins from athlete
        const updatedCoins = (athlete.coins || 0) - hireCost;
        const updatedUser = await coachHiringRepository.updateUserCoins(athleteId, updatedCoins);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user coins");
        }

        // Calculate commission and earnings
        const ADMIN_PERCENTAGE = 40;
        const adminCommission = (hireCost * ADMIN_PERCENTAGE) / 100;
        const coachEarning = hireCost - adminCommission;

        // Create transaction record first
        const transaction = await transactionRepository.createTransaction(
          athleteId,
          coachId,
          hireCost,
          adminCommission,
          coachEarning,
          "coach_hire",
          "completed"
        );

        // Create coach-client relationship with transactionId
        await coachHiringRepository.createCoachClient(coachId, athleteId, transaction._id.toString());

        return updatedUser.coins || 0;
    }
}
