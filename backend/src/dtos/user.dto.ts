import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create a DTO for creating a user
export const CreateUserDTO = UserSchema.pick({
    name: true,
    email: true,
    password: true
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login DTO
export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;