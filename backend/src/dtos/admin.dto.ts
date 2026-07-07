import { z } from "zod";
import { UserSchema } from "../types/user.type";

// DTO for creating user from Admin
export const AdminCreateUserDTO = UserSchema.extend({
  role: z.enum(["admin", "user", "coach"]).default("user").optional(),
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

// DTO for updating user from Admin (all fields optional, including password)
export const AdminUpdateUserDTO = UserSchema.partial();
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
