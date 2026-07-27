import mongoose, { Schema, Document } from "mongoose";

export interface IAssignedWorkoutPlan extends Document {
  _id: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  athleteId: mongoose.Types.ObjectId;
  workoutPlanId: mongoose.Types.ObjectId;
  status: "active" | "completed";
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssignedWorkoutPlanSchema: Schema = new Schema<IAssignedWorkoutPlan>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    athleteId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: "WorkoutPlan", required: true },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    assignedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate assignments of the same plan to the same athlete
AssignedWorkoutPlanSchema.index({ workoutPlanId: 1, athleteId: 1 }, { unique: true });

export const AssignedWorkoutPlanModel = mongoose.model<IAssignedWorkoutPlan>(
  "AssignedWorkoutPlan",
  AssignedWorkoutPlanSchema
);
