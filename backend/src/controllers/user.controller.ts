import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { IUser } from "../models/user.model";
import { Request, Response } from "express";
const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                // Formatting zod validation errors cleanly
                const errorMessages = userData.error.issues.map(err => err.message).join(", ");
                return ApiResponseHelper.error(res, errorMessages, 400);
            }
            const { user, token } = await userService.createUser(userData.data);
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                token,
                user: {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    role: user.role,
    profilePhoto: user.profilePhoto
}
            });
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
    
    async loginUser(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                const errorMessages = parsedData.error.issues.map(err => err.message).join(", ");
                return ApiResponseHelper.error(res, errorMessages, 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    gender: user.gender,
                    role: user.role
                }
            });
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async uploadPhoto(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No photo provided" });
            }

            const userId = (req.user as IUser)._id.toString();
            const filename = req.file.filename;
            const url = `/uploads/avatars/${filename}`;

            await userService.updateProfilePhoto(userId, url);

            return res.status(200).json({
                success: true,
                filename,
                url,
            });
        } catch (error: Error | any | unknown) {
            const status = (error as any)?.status || 500;
            const message = status === 500 ? "Avatar upload failed" : (error as Error).message;
            return res.status(status).json({ message });
        }
    }
}
