
import { AchievementModel, IAchievement } from "../models/achievement.model";

export class AchievementRepository {
  async getAchievements(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ achievements: IAchievement[]; total: number }> {
    const query: any = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [achievements, total] = await Promise.all([
      AchievementModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      AchievementModel.countDocuments(query).exec(),
    ]);

    return { achievements, total };
  }

  async getAchievementById(id: string): Promise<IAchievement | null> {
    return AchievementModel.findById(id).exec();
  }

  async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
    return AchievementModel.create(achievementData);
  }

  async updateAchievement(id: string, achievementData: Partial<IAchievement>): Promise<IAchievement | null> {
    return AchievementModel.findByIdAndUpdate(id, achievementData, { new: true }).exec();
  }

  async deleteAchievement(id: string): Promise<boolean> {
    const result = await AchievementModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
