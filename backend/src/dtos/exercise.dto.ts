import { z } from "zod";

export const CreateExerciseDTO = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["Strength", "Cardio", "Mobility", "Core", "HIIT"]),
  bodyPart: z.enum(["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Full Body"]),
  equipment: z.string().min(1, "Equipment is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  description: z.string().min(5, "Description must be at least 5 characters"),
  instructions: z.string().min(5, "Instructions must be at least 5 characters"),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

export type CreateExerciseDTO = z.infer<typeof CreateExerciseDTO>;

export const UpdateExerciseDTO = CreateExerciseDTO.partial();
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseDTO>;
