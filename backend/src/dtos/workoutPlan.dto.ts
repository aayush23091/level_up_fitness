import { z } from "zod";

export const WorkoutPlanExerciseSchema = z.object({
  exerciseId: z.string().optional(), // Optional for backward compatibility
  exerciseName: z.string().min(1, "Exercise name is required").optional(), // For inline exercises
  category: z.string().min(1, "Category is required").optional(), // For inline exercises
  sets: z.number().min(1, "Sets must be at least 1"),
  reps: z.string().min(1, "Reps is required"),
  restSeconds: z.number().min(0, "Rest seconds cannot be negative"),
  notes: z.string().optional(),
  order: z.number().min(0, "Order must be non-negative"),
}).refine(
  (data) => data.exerciseId || (data.exerciseName && data.category),
  { message: "Either exerciseId or exerciseName + category must be provided" }
);

export const CreateWorkoutPlanDTO = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  estimatedDuration: z.number().min(1, "Estimated duration must be at least 1 minute"),
  status: z.enum(["Draft", "Published"]).default("Draft").optional(),
  exercises: z.array(WorkoutPlanExerciseSchema).default([]),
});

export type CreateWorkoutPlanDTO = z.infer<typeof CreateWorkoutPlanDTO>;

export const UpdateWorkoutPlanDTO = CreateWorkoutPlanDTO.partial();
export type UpdateWorkoutPlanDTO = z.infer<typeof UpdateWorkoutPlanDTO>;
