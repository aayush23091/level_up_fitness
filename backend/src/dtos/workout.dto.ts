import { z } from "zod";

export const CreateWorkoutDTO = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(2, "Category is required"),
  difficulty: z.string().min(2, "Difficulty is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  xpReward: z.number().min(0).default(0),
  coinReward: z.number().min(0).default(0),
  thumbnail: z.string().min(1, "Thumbnail URL or path is required"),
  status: z.string().default("active").optional(),
});

export type CreateWorkoutDTO = z.infer<typeof CreateWorkoutDTO>;

export const UpdateWorkoutDTO = CreateWorkoutDTO.partial();
export type UpdateWorkoutDTO = z.infer<typeof UpdateWorkoutDTO>;
