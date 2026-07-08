import { z } from "zod";

export const WorkoutPlanExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  sets: z.number().min(1, "Sets must be at least 1"),
  reps: z.string().min(1, "Reps is required"),
  restSeconds: z.number().min(0, "Rest seconds cannot be negative"),
  notes: z.string().optional(),
  order: z.number().min(0, "Order must be non-negative"),
});

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
