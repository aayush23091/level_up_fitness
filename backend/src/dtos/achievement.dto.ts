
import { z } from "zod";

export const CreateAchievementDTO = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  conditionType: z.union([
    z.literal("workout_completed"),
    z.literal("xp_earned"),
    z.literal("level_reached"),
    z.literal("streak_days"),
  ]),
  conditionValue: z.number().min(1, "Condition value must be at least 1"),
  xpReward: z.number().min(0).default(0),
  coinReward: z.number().min(0).default(0),
  badgeImage: z.string().optional(),
  status: z.union([
    z.literal("active"),
    z.literal("inactive"),
  ]).default("active").optional(),
});

export type CreateAchievementDTO = z.infer<typeof CreateAchievementDTO>;

export const UpdateAchievementDTO = CreateAchievementDTO.partial();
export type UpdateAchievementDTO = z.infer<typeof UpdateAchievementDTO>;
