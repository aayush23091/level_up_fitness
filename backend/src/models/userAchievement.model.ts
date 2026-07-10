
import mongoose, { Schema, Document } from "mongoose";

export interface IUserAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  unlockedAt: Date;
  rewardClaimed: boolean;
}

const UserAchievementSchema: Schema = new Schema<IUserAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievementId: { type: Schema.Types.ObjectId, ref: "Achievement", required: true },
    unlockedAt: { type: Date, default: Date.now },
    rewardClaimed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Unique index to prevent duplicate unlocks for the same user and achievement
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const UserAchievementModel = mongoose.model<IUserAchievement>("UserAchievement", UserAchievementSchema);

