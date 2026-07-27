import { CoachRepository } from "../repositories/coach.repository";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";

const coachRepository = new CoachRepository();

export class CoachService {
  async getAthletes(
    coachId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    return coachRepository.getAthletes(coachId, page, limit, search);
  }

  async getAthleteById(id: string): Promise<IUser> {
    const user = await coachRepository.getAthleteById(id);
    if (!user || user.role !== "user") {
      throw new HttpException(404, "Athlete not found");
    }
    return user;
  }

  async getDashboardStats(coachId: string) {
    return coachRepository.getDashboardStats(coachId);
  }

  async getAnalyticsOverview(coachId: string) {
    return coachRepository.getAnalyticsOverview(coachId);
  }

  async getAnalyticsAthletes(coachId: string) {
    return coachRepository.getAnalyticsAthletes(coachId);
  }

  async getAnalyticsPlans(coachId: string) {
    return coachRepository.getAnalyticsPlans(coachId);
  }
}
