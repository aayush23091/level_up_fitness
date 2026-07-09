import { CoachHiringRepository } from "../repositories/coachHiring.repository";
import { ICoachClient } from "../models/coachClient.model";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const coachHiringRepository = new CoachHiringRepository();

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
            bio: coach.bio,
            specialization: coach.specialization,
            experience: coach.experience,
            hireCost: coach.hireCost,
            available: coach.availability
        };
    }

    async hireCoach(coachId: string, athleteId: string): Promise<number> {
        // Check if coach exists and is available
        const coach = await coachHiringRepository.getCoachById(coachId);
        if (!coach) {
            throw new HttpException(404, "Coach not found");
        }
        if (!coach.availability) {
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

        // Check if athlete has enough coins
        if ((athlete.coins || 0) < (coach.hireCost || 0)) {
            throw new HttpException(400, "Insufficient coins");
        }

        // Check for duplicate hiring (only active relationships)
        const existingRelationship = await coachHiringRepository.getCoachClientRelationship(coachId, athleteId);
        if (existingRelationship) {
            throw new HttpException(400, "Already hired this coach");
        }

        // Deduct coins from athlete
        const updatedCoins = (athlete.coins || 0) - (coach.hireCost || 0);
        const updatedUser = await coachHiringRepository.updateUserCoins(athleteId, updatedCoins);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user coins");
        }

        // Create coach-client relationship
        await coachHiringRepository.createCoachClient(coachId, athleteId);

        return updatedUser.coins || 0;
    }
}
