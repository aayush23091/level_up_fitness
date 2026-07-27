
import mongoose, { Schema, Document } from "mongoose";

export interface IWorkoutCompletion extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workoutId: mongoose.Types.ObjectId;
  completedAt: Date;
  duration: number;
  xpEarned: number;
  coinEarned: number;
  status: "completed";
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutCompletionSchema: Schema = new Schema<IWorkoutCompletion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: "Workout", required: true },
    completedAt: { type: Date, default: Date.now },
    duration: { type: Number, required: true },
    xpEarned: { type: Number, required: true },
    coinEarned: { type: Number, required: true },
    status: { type: String, enum: ["completed"], default: "completed" },
  },
  {
    timestamps: true,
  }
);

export const WorkoutCompletionModel = mongoose.model<IWorkoutCompletion>(
  "WorkoutCompletion",
  WorkoutCompletionSchema
);
