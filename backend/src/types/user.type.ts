import { z } from "zod";
export const UserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phoneNumber: z.string().min(7, "Phone number must be at least 7 characters"),
    gender: z.string(),
    role: z.enum(["admin", "user"]).default("user").optional()
});
export type UserType = z.infer<typeof UserSchema>;

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        username: string;
        email: string;
        phoneNumber: string;
        gender: string;
        role: string;
    };
}