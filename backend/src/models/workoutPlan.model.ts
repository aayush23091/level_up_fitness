import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkoutPlanExercise {
  exerciseId: Types.ObjectId;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface IWorkoutPlan extends Document {
  _id: Types.ObjectId;
  coachId: Types.ObjectId;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: number;
  status: "Draft" | "Published";
  exercises: IWorkoutPlanExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanExerciseSchema: Schema = new Schema<IWorkoutPlanExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: String, required: true },
    restSeconds: { type: Number, required: true, min: 0 },
    notes: { type: String },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const WorkoutPlanSchema: Schema = new Schema<IWorkoutPlan>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    estimatedDuration: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    exercises: [WorkoutPlanExerciseSchema],
  },
  {
    timestamps: true,
  }
);

export const WorkoutPlanModel = mongoose.model<IWorkoutPlan>("WorkoutPlan", WorkoutPlanSchema);
