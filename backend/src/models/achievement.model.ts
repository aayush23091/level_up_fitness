
import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  conditionType: "workout_completed" | "xp_earned" | "level_reached" | "streak_days";
  conditionValue: number;
  xpReward: number;
  coinReward: number;
  badgeImage?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    conditionType: { 
      type: String, 
      required: true, 
      enum: ["workout_completed", "xp_earned", "level_reached", "streak_days"] 
    },
    conditionValue: { type: Number, required: true, min: 1 },
    xpReward: { type: Number, default: 0, min: 0 },
    coinReward: { type: Number, default: 0, min: 0 },
    badgeImage: { type: String, required: false },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

export const AchievementModel = mongoose.model<IAchievement>("Achievement", AchievementSchema);
