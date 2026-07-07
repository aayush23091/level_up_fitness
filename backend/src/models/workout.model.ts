import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  duration: number;
  xpReward: number;
  coinReward: number;
  isPremium: boolean;
  createdBy: mongoose.Types.ObjectId;
  assignedUsers: mongoose.Types.ObjectId[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSchema: Schema = new Schema<IWorkout>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    duration: { type: Number, required: true },
    xpReward: { type: Number, default: 0 },
    coinReward: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
  }
);

export const WorkoutModel = mongoose.model<IWorkout>("Workout", WorkoutSchema);
