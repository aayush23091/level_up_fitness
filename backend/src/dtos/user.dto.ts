import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create a DTO for creating a user (public registration — user and coach only)
export const CreateUserDTO = UserSchema.pick({
    name: true,
    username: true,
    email: true,
    password: true,
    phoneNumber: true,
    gender: true,
}).extend({
    role: z.enum(["user", "coach"]).default("user").optional(),
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login DTO
export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;