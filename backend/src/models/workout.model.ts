import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  xpReward: number;
  coinReward: number;
  exercisesCount: number;
  isPremium: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSchema: Schema = new Schema<IWorkout>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    xpReward: { type: Number, required: true },
    coinReward: { type: Number, required: true },
    exercisesCount: { type: Number, required: true },
    isPremium: { type: Boolean, default: false },
    createdBy: { type: String, default: "admin" },
  },
  {
    timestamps: true,
  }
);

export const WorkoutModel = mongoose.model<IWorkout>("Workout", WorkoutSchema);
