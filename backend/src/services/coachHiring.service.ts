import { CoachHiringRepository } from "../repositories/coachHiring.repository";
import { ICoachProfile } from "../models/coachProfile.model";
import { ICoachClient } from "../models/coachClient.model";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const coachHiringRepository = new CoachHiringRepository();

export class CoachHiringService {
    async getAllCoaches(): Promise<ICoachProfile[]> {
        return coachHiringRepository.getAllCoaches();
    }

    async getCoachById(id: string): Promise<ICoachProfile> {
        const coach = await coachHiringRepository.getCoachById(id);
        if (!coach) {
            throw new HttpException(404, "Coach not found");
        }
        return coach;
    }

    async hireCoach(coachId: string, athleteId: string): Promise<{ coachClient: ICoachClient; updatedUser: IUser }> {
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

        // Check if athlete has user role
        if (athlete.role !== "user") {
            throw new HttpException(403, "Only users can hire coaches");
        }

        // Check if athlete has enough coins
        if ((athlete.coins || 0) < coach.hireCost) {
            throw new HttpException(400, `Insufficient coins. Required: ${coach.hireCost}, Available: ${athlete.coins || 0}`);
        }

        // Check for duplicate hiring
        const existingRelationship = await coachHiringRepository.getCoachClientRelationship(coachId, athleteId);
        if (existingRelationship) {
            throw new HttpException(400, "You have already hired this coach");
        }

        // Deduct coins from athlete
        const updatedCoins = (athlete.coins || 0) - coach.hireCost;
        const updatedUser = await coachHiringRepository.updateUserCoins(athleteId, updatedCoins);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user coins");
        }

        // Create coach-client relationship
        const coachClient = await coachHiringRepository.createCoachClient(coachId, athleteId);

        // Increment coach's total clients
        await coachHiringRepository.incrementCoachTotalClients(coachId);

        return { coachClient, updatedUser };
    }
}
