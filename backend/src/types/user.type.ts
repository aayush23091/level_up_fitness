import { z } from "zod";
export const UserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "user"]).default("user")
});
export type UserType = z.infer<typeof UserSchema>;

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}