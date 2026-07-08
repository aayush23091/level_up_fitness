import { CoachHiringRepository } from "../repositories/coachHiring.repository";
import { ICoachProfile } from "../models/coachProfile.model";
import { ICoachClient } from "../models/coachClient.model";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const coachHiringRepository = new CoachHiringRepository();

export class CoachHiringService {
    async getAllCoaches(): Promise<any[]> {
        const coaches = await coachHiringRepository.getAllCoaches();
        return coaches.map(coach => this.transformCoachProfile(coach));
    }

    async getCoachById(id: string): Promise<any> {
        const coach = await coachHiringRepository.getCoachById(id);
        if (!coach) {
            throw new HttpException(404, "Coach not found");
        }
        return this.transformCoachProfile(coach);
    }

    private transformCoachProfile(coach: any): any {
        const user = coach.userId || {};
        return {
            _id: coach._id,
            name: user.name || "Coach",
            username: user.username || "",
            profilePhoto: user.profilePhoto || null,
            bio: coach.bio,
            specialization: coach.specialization,
            experience: coach.experience,
            rating: coach.rating,
            hireCost: coach.hireCost,
            available: coach.available,
            totalClients: coach.totalClients
        };
    }

    async hireCoach(coachId: string, athleteId: string): Promise<number> {
        // Check if coach exists and is available
        const coach = await coachHiringRepository.getCoachById(coachId);
        if (!coach) {
            throw new HttpException(404, "Coach not found");
        }
        if (!coach.available) {
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
        if ((athlete.coins || 0) < coach.hireCost) {
            throw new HttpException(400, "Insufficient coins");
        }

        // Check for duplicate hiring (only active relationships)
        const existingRelationship = await coachHiringRepository.getCoachClientRelationship(coachId, athleteId);
        if (existingRelationship) {
            throw new HttpException(400, "Already hired this coach");
        }

        // Deduct coins from athlete
        const updatedCoins = (athlete.coins || 0) - coach.hireCost;
        const updatedUser = await coachHiringRepository.updateUserCoins(athleteId, updatedCoins);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user coins");
        }

        // Create coach-client relationship
        await coachHiringRepository.createCoachClient(coachId, athleteId);

        // Increment coach's total clients
        await coachHiringRepository.incrementCoachTotalClients(coachId);

        return updatedUser.coins || 0;
    }
}
