
import { AchievementRepository } from "../repositories/achievement.repository";
import { IAchievement } from "../models/achievement.model";
import { HttpException } from "../exceptions/http-exception";

const achievementRepository = new AchievementRepository();

export class AchievementService {
  async getAchievements(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ achievements: IAchievement[]; total: number }> {
    return achievementRepository.getAchievements(page, limit, search, status);
  }

  async getAchievementById(id: string): Promise<IAchievement> {
    const achievement = await achievementRepository.getAchievementById(id);
    if (!achievement) {
      throw new HttpException(404, "Achievement not found");
    }
    return achievement;
  }

  async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
    return achievementRepository.createAchievement(achievementData);
  }

  async updateAchievement(id: string, achievementData: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = await achievementRepository.updateAchievement(id, achievementData);
    if (!achievement) {
      throw new HttpException(404, "Achievement not found");
    }
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    const success = await achievementRepository.deleteAchievement(id);
    if (!success) {
      throw new HttpException(404, "Achievement not found");
    }
  }
}
