import mongoose, { Schema, Document } from "mongoose";

export interface IExercise extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: "Strength" | "Cardio" | "Mobility" | "Core" | "HIIT";
  bodyPart: "Chest" | "Back" | "Legs" | "Arms" | "Shoulders" | "Core" | "Full Body";
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  instructions: string;
  thumbnail: string;
  videoUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ["Strength", "Cardio", "Mobility", "Core", "HIIT"]
    },
    bodyPart: { 
      type: String, 
      required: true,
      enum: ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Full Body"]
    },
    equipment: { type: String, required: true },
    difficulty: { 
      type: String, 
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"]
    },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    thumbnail: { type: String, },
    videoUrl: { type: String, },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const ExerciseModel = mongoose.model<IExercise>("Exercise", ExerciseSchema);
