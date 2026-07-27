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

// Change Password DTO
export const ChangePasswordDTO = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});
export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;

// Forgot Password DTO
export const ForgotPasswordDTO = z.object({
    email: z.string().email("Invalid email address"),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

// Reset Password DTO
export const ResetPasswordDTO = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;