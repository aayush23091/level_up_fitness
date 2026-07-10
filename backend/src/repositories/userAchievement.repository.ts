
import { UserAchievementModel, IUserAchievement } from "../models/userAchievement.model";
import mongoose from "mongoose";

export class UserAchievementRepository {
  async createUserAchievement(
    data: Partial<IUserAchievement>
  ): Promise<IUserAchievement> {
    return UserAchievementModel.create(data);
  }

  async getUserAchievementsByUserId(
    userId: string
  ): Promise<IUserAchievement[]> {
    return UserAchievementModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .exec();
  }

  async getUserAchievementByUserIdAndAchievementId(
    userId: string,
    achievementId: string
  ): Promise<IUserAchievement | null> {
    return UserAchievementModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      achievementId: new mongoose.Types.ObjectId(achievementId),
    }).exec();
  }

  async getUnlockedAchievementIdsByUserId(userId: string): Promise<string[]> {
    const userAchievements = await UserAchievementModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).select("achievementId").exec();
    return userAchievements.map(ua => ua.achievementId.toString());
  }
}

